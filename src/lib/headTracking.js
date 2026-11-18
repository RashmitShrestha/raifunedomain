/*
 * ============================================================================
 * headTracking — webcam eye tracking that drives the camera parallax.
 * ============================================================================
 *
 * MODEL: MediaPipe's BlazeFace "short range" face detector (~230 KB).
 * It's far lighter than a full face mesh (FaceLandmarker is ~3.7 MB) and
 * still returns 6 keypoints per face, including BOTH EYES — all we need:
 *
 *   eyes midpoint (x, y)  -> where your head is, side to side / up and down
 *   distance between eyes -> how close you are to the screen (lean in/out)
 *
 * Everything runs on-device (WASM + GPU). No video frame leaves the browser.
 *
 * OUTPUT: the shared, mutable `head` object below. CameraRig reads it every
 * frame (like state.pointer). It's a plain object, not React state, because
 * it updates ~30×/sec and must not trigger re-renders.
 *
 *   head.x  -1 … +1   +1 = your head moved to YOUR right
 *   head.y  -1 … +1   +1 = your head moved up
 *   head.z  -1 … +1   +1 = you leaned in toward the screen
 *   head.active       true while a face is being tracked
 *
 * All three are relative to where you were when tracking started (we
 * calibrate a "neutral" pose from the first frames), so you don't have to
 * sit perfectly centred in front of the camera.
 */

// Pinned to the version installed in node_modules so JS and WASM always match.
const MP_VERSION = '0.10.17';
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

export const head = { x: 0, y: 0, z: 0, active: false };

// How much head movement maps to a full -1…+1 swing. Your head only moves a
// small fraction of the camera frame, so we amplify. Higher = more sensitive.
const GAIN_XY = 3.2;
const GAIN_Z = 3.5;
const CALIBRATION_FRAMES = 15;
const DETECT_INTERVAL_MS = 1000 / 30; // detection is capped at ~30fps

/*
 * One Euro filter — the standard smoother for tracking data. A plain lerp
 * forces a trade-off: smooth OR responsive. One Euro adapts: when you're
 * nearly still it smooths heavily (kills the detector's jitter), and when you
 * move fast it eases off (so it doesn't lag behind you).
 */
function oneEuro(minCutoff = 1.0, beta = 0.02, dCutoff = 1.0) {
  let x = null;
  let dx = 0;
  let lastT = null;
  const alpha = (cutoff, dt) => 1 / (1 + 1 / (2 * Math.PI * cutoff * dt));
  return (value, t) => {
    if (x === null) {
      x = value;
      lastT = t;
      return value;
    }
    const dt = Math.max((t - lastT) / 1000, 1e-3);
    lastT = t;
    const rawDx = (value - x) / dt;
    dx += alpha(dCutoff, dt) * (rawDx - dx);
    const cutoff = minCutoff + beta * Math.abs(dx);
    x += alpha(cutoff, dt) * (value - x);
    return x;
  };
}

const clamp = (v) => Math.max(-1, Math.min(1, v));

let session = null; // { stream, video, detector, rafId, stopped }

/** Starts the webcam + detector. Must be called from a user gesture (tap). */
export async function startHeadTracking() {
  if (session) return;
  const current = { stopped: false };
  session = current;

  try {
    // Load the detector code only when someone actually turns this on, so it
    // never weighs down the initial page load.
    const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
      audio: false,
    });
    current.stream = stream;
    if (current.stopped) throw new Error('stopped');

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true; // iOS: otherwise it tries to go fullscreen
    video.setAttribute('playsinline', '');
    video.srcObject = stream;
    await video.play();
    current.video = video;

    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    const makeDetector = (delegate) =>
      FaceDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
      });
    // GPU is faster, but some phones refuse it. Fall back to CPU.
    current.detector = await makeDetector('GPU').catch(() => makeDetector('CPU'));
    if (current.stopped) throw new Error('stopped');

    runLoop(current);
  } catch (err) {
    stopHeadTracking();
    throw err;
  }
}

export function stopHeadTracking() {
  const s = session;
  session = null;
  head.active = false;
  head.x = head.y = head.z = 0;
  if (!s) return;
  s.stopped = true;
  cancelAnimationFrame(s.rafId);
  s.stream?.getTracks().forEach((t) => t.stop());
  s.detector?.close();
}

function runLoop(s) {
  const fx = oneEuro();
  const fy = oneEuro();
  const fz = oneEuro(0.6, 0.01); // depth is noisier — smooth it harder
  const calib = { n: 0, x: 0, y: 0, d: 0 };
  let lastDetect = 0;

  const tick = (now) => {
    if (s.stopped) return;
    s.rafId = requestAnimationFrame(tick);
    if (now - lastDetect < DETECT_INTERVAL_MS || s.video.readyState < 2) return;
    lastDetect = now;

    const { detections } = s.detector.detectForVideo(s.video, now);
    const kp = detections[0]?.keypoints;
    if (!kp || kp.length < 2) {
      // Lost the face: let the scene drift back to neutral.
      head.active = false;
      head.x *= 0.9;
      head.y *= 0.9;
      head.z *= 0.9;
      return;
    }

    // BlazeFace keypoints: 0 = right eye, 1 = left eye (normalized 0…1).
    const [r, l] = kp;
    const mx = (r.x + l.x) / 2;
    const my = (r.y + l.y) / 2;
    const d = Math.hypot(r.x - l.x, r.y - l.y);

    // Average the first few frames as your "neutral" pose.
    if (calib.n < CALIBRATION_FRAMES) {
      calib.n++;
      calib.x += (mx - calib.x) / calib.n;
      calib.y += (my - calib.y) / calib.n;
      calib.d += (d - calib.d) / calib.n;
      return;
    }

    // The front camera image is NOT mirrored: moving to your right moves you
    // LEFT in the frame, hence the minus on x. Image y points down, hence -y.
    head.x = fx(clamp(-(mx - calib.x) * GAIN_XY), now);
    head.y = fy(clamp(-(my - calib.y) * GAIN_XY), now);
    head.z = fz(clamp((d / calib.d - 1) * GAIN_Z), now);
    head.active = true;
  };
  s.rafId = requestAnimationFrame(tick);
}
