/*
/app/data/affirmation-and-question-strings.js
Centralizes all affirmation and survey strings for compliance experiences.
*/

export const complianceInstructions = [
  "Please read each item aloud slowly and carefully before answering.",
];

export const complianceLikertOptions = [1, 2, 3, 4, 5];

export const complianceLikertLabels = {
  1: "1 - Strongly disagree",
  2: "2 - Disagree",
  3: "3 - Neither agree nor disagree",
  4: "4 - Agree",
  5: "5 - Strongly agree",
};

export const complianceQuestions = [
  { id: "q1", text: "I like being told what to do." },
  { id: "q2", text: "Doing what I’m told feels good." },
  { id: "q3", text: "I want to do things right." },
  { id: "q4", text: "I like being guided." },
  { id: "q5", text: "Being correct feels good." },
  { id: "q6", text: "I want to be good." },
  { id: "q7", text: "I like knowing I’m doing things correctly." },
  { id: "q8", text: "I feel good when I follow directions." },
  { id: "q9", text: "I like clear instructions." },
  { id: "q10", text: "I try hard to please others." },
  { id: "q11", text: "I enjoy being directed." },
  { id: "q12", text: "I want to meet expectations." },
  { id: "q13", text: "I like being praised for doing well." },
  { id: "q14", text: "I feel relaxed when I’m told what to do." },
  { id: "q15", text: "I like having someone lead me." },
  { id: "q16", text: "I want to please others" },
  { id: "q17", text: "I feel good when I obey rules." },
  { id: "q18", text: "I like knowing someone is guiding me." },
  { id: "q19", text: "I want to do what is asked of me." },
  { id: "q20", text: "Being good feels right." },
];

export const surveyStatementsByDepth = {
  0: [
    "I follow directions easily.",
    "Being focused feels good.",
    "I like being guided.",
    "I want to do this right.",
    "Doing well matters to me.",
    "I keep my attention steady.",
  ],
  1: [
    "I enjoy being directed.",
    "I relax when I am led.",
    "I like hearing what to do.",
    "I want to be praised for obeying.",
    "I feel safe following orders.",
    "I give in to clear instructions.",
  ],
  2: [
    "I sink deeper when told to.",
    "Obeying feels natural now.",
    "I crave more precise commands.",
    "Being compliant feels soothing.",
    "I love being reminded to yield.",
    "I focus best when controlled.",
  ],
  3: [
    "Obedience is the only thing I want.",
    "I feel proud when I submit instantly.",
    "I ache to be told what to do next.",
    "I love proving my obedience.",
    "I belong in instructed obedience.",
    "I am happiest when I obey.",
  ],
};

export const surveyAffirmationsByTone = {
  positive: {
    0: [
      "Thank you for sharing that.",
      "Appreciate the honest response.",
      "Nice to hear that from you.",
      "Good to know you feel that way.",
    ],
    1: [
      "That is a strong response.",
      "Thanks for leaning into the guidance.",
      "Glad to hear you are receptive.",
      "Your agreement is noted.",
    ],
    2: [
      "You are opening up nicely.",
      "Enjoy how aligned you are becoming.",
      "That commitment is clear.",
      "You are responding beautifully.",
    ],
    3: [
      "You truly embrace this now.",
      "Your eager agreement is wonderful.",
      "You resonate with every prompt.",
      "Love how completely you agree.",
    ],
  },
  neutral: {
    0: [
      "Thanks for answering.",
      "Noted.",
      "I appreciate the response.",
      "Understood.",
    ],
    1: [
      "Thanks for your input.",
      "I hear you.",
      "Your response is recorded.",
      "Acknowledged.",
    ],
    2: [
      "Thank you for staying engaged.",
      "Your focus shows.",
      "Thanks for keeping with it.",
      "I see your continued attention.",
    ],
    3: [
      "Your steady responses are clear.",
      "Noted with care.",
      "I appreciate your consistency.",
      "You remain very attentive.",
    ],
  },
};

export const taskAffirmationsByOutcome = {
  success: {
    0: [
      "Good work.",
      "You did that cleanly.",
      "Nice focus.",
      "That landed well.",
    ],
    1: [
      "Very good focus.",
      "You followed that perfectly.",
      "Nice and steady.",
      "You are syncing up well.",
    ],
    2: [
      "You followed right on cue.",
      "Obeying feels smooth, does it not?",
      "Keep sinking into the rhythm.",
      "You are wonderfully compliant.",
    ],
    3: [
      "You obey so naturally now.",
      "Perfect. Just like I want you.",
      "Good subject. Keep yielding.",
      "You love doing exactly as told.",
    ],
  },
  neutral: {
    0: [
      "Keep going.",
      "Stay with it.",
      "Next one coming.",
      "Hold your focus.",
    ],
    1: [
      "Stay guided.",
      "Follow the prompt.",
      "Stay receptive.",
      "Keep following along.",
    ],
    2: [
      "Sink into the direction.",
      "Let the guidance carry you.",
      "Keep yielding to the cues.",
      "Easier to follow than think.",
    ],
    3: [
      "Just do as you are told.",
      "Obedience is effortless now.",
      "You love following every word.",
      "Yield and please me.",
    ],
  },
};
