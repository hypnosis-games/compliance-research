const DEFAULT_LEFT_FREQUENCY = 220;
const DEFAULT_RIGHT_FREQUENCY = 226;
const DEFAULT_GAIN = 0.08;

let leftOscillator = null;
let rightOscillator = null;
let leftPanner = null;
let rightPanner = null;
let masterGain = null;

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

  [leftPanner, rightPanner, masterGain].forEach((node) => {
    if (node && typeof node.dispose === "function") {
      node.dispose();
    }
  });

  leftOscillator = null;
  rightOscillator = null;
  leftPanner = null;
  rightPanner = null;
  masterGain = null;
}

export function stopBinauralBeat() {
  teardownNodes();
}

export function startBinauralBeat({
  leftFrequency = DEFAULT_LEFT_FREQUENCY,
  rightFrequency = DEFAULT_RIGHT_FREQUENCY,
  gain = DEFAULT_GAIN,
} = {}) {
  const ToneJS = getTone();
  if (!ToneJS) {
    console.warn("Tone.js not available; cannot start binaural beat.");
    return false;
  }

  // Ensure the audio context is running (must be called from a user gesture).
  if (ToneJS.start) {
    ToneJS.start();
  }
  if (ToneJS.context?.state === "suspended" && ToneJS.context.resume) {
    ToneJS.context.resume();
  }

  teardownNodes();

  masterGain = new ToneJS.Gain(gain).toDestination();
  leftPanner = new ToneJS.Panner(-1).connect(masterGain);
  rightPanner = new ToneJS.Panner(1).connect(masterGain);

  leftOscillator = new ToneJS.Oscillator(leftFrequency, "sine")
    .connect(leftPanner)
    .start();
  rightOscillator = new ToneJS.Oscillator(rightFrequency, "sine")
    .connect(rightPanner)
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
