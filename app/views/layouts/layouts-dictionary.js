// views/layouts/layouts-dictionary.js
import ConsentScreen from "./consent-screen.js";
import PersonalInfoScreen from "./personal-info-screen.js";
import PreTestSurvey from "./pre-test-survey.js";
import InductionArcadeLayout from "./induction-arcade.js";

export const moduleOrder = [
  "consent",
  "personal-info",
  "pre-test-survey",
  "induction-arcade",

];

export default {
  consent: ConsentScreen,
  "personal-info": PersonalInfoScreen,
  "pre-test-survey": PreTestSurvey,
  "induction-arcade": InductionArcadeLayout,
};
