const DEFAULT_LEFT_FREQUENCY = 220;
const DEFAULT_RIGHT_FREQUENCY = 230;
const DEFAULT_GAIN = 0.08;

let leftOscillator = null;
let rightOscillator = null;
let stereoMerger = null;
let masterGain = null;
let toneReadyPromise = null;

function getTone() {
  if (typeof Tone !== "undefined") return Tone;
  if (typeof window !== "undefined" && window.Tone) return window.Tone;
  return null;
}

function teardownNodes() {
  [leftOscillator, rightOscillator].forEach((osc) => {
    if (osc) {
      osc.stop();
      osc.disconnect();
      if (typeof osc.dispose === "function") {
        osc.dispose();
      }
    }
  });

  [stereoMerger, masterGain].forEach((node) => {
    if (node && typeof node.dispose === "function") {
      node.dispose();
    }
  });

  leftOscillator = null;
  rightOscillator = null;
  stereoMerger = null;
  masterGain = null;
}

export function stopBinauralBeat() {
  teardownNodes();
}

export async function warmBinauralBeatContext() {
  const ToneJS = getTone();
  if (!ToneJS) return false;

  return ensureToneReady(ToneJS);
}

async function ensureToneReady(ToneJS) {
  if (!ToneJS) return false;

  if (toneReadyPromise) return toneReadyPromise;

  toneReadyPromise = (async () => {
    // iOS Safari requires AudioContext resume from a user gesture. Tone.start()
    // and context.resume() return promises, so await both to ensure the
    // context is ready before creating any nodes.
    if (typeof ToneJS.start === "function") {
      await ToneJS.start();
    }

    if (ToneJS.context?.state === "suspended" && ToneJS.context.resume) {
      await ToneJS.context.resume();
    }

    return true;
  })();

  try {
    await toneReadyPromise;
    return true;
  } catch (err) {
    console.warn("Tone.js could not start audio context", err);
    toneReadyPromise = null;
    return false;
  }
}

export async function startBinauralBeat({
  leftFrequency = DEFAULT_LEFT_FREQUENCY,
  rightFrequency = DEFAULT_RIGHT_FREQUENCY,
  gain = DEFAULT_GAIN,
} = {}) {
  const ToneJS = getTone();
  if (!ToneJS) {
    console.warn("Tone.js not available; cannot start binaural beat.");
    return false;
  }

  const toneReady = await ensureToneReady(ToneJS);
  if (!toneReady) return false;

  teardownNodes();

  masterGain = new ToneJS.Gain(gain).toDestination();
  stereoMerger = new ToneJS.Merge().connect(masterGain);

  leftOscillator = new ToneJS.Oscillator(leftFrequency, "sine")
    .connect(stereoMerger.left)
    .start();
  rightOscillator = new ToneJS.Oscillator(rightFrequency, "sine")
    .connect(stereoMerger.right)
    .start();

  return true;
}

export function updateBinauralBeat({ leftFrequency, rightFrequency } = {}) {
  const ToneJS = getTone();
  if (!ToneJS || !leftOscillator || !rightOscillator) return;

  const rampTime = 0.2;

  if (typeof leftFrequency === "number") {
    leftOscillator.frequency.rampTo(leftFrequency, rampTime);
  }

  if (typeof rightFrequency === "number") {
    rightOscillator.frequency.rampTo(rightFrequency, rampTime);
  }
}

export {
  DEFAULT_LEFT_FREQUENCY,
  DEFAULT_RIGHT_FREQUENCY,
  DEFAULT_GAIN,
};
