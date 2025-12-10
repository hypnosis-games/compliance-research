// views/layouts/layouts-dictionary.js
import ConsentScreen from "./consent-screen.js";
import PersonalInfoScreen from "./personal-info-screen.js";
import PreTestSurvey from "./pre-test-survey.js";
import BreathTrainingInstructions from "./breath-training-instructions.js";
import BreathTrainingScreen from "./breath-training-screen.js";

export const moduleOrder = [
  "consent",
  "personal-info",
  "pre-test-survey",
  "breath-training-intro",
  "breath-training",
];

export default {
  consent: ConsentScreen,
  "personal-info": PersonalInfoScreen,
  "pre-test-survey": PreTestSurvey,
  "breath-training-intro": BreathTrainingInstructions,
  "breath-training": BreathTrainingScreen,
};
