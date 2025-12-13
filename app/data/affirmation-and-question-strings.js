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
  { id: "q5", text: "I want to be good." },
  { id: "q6", text: "I try hard to please others." },
  { id: "q7", text: "I want to meet expectations." },
];

export const surveyStatementsByDepth = {
  0: [
    "I feel good when I follow directions.",
    "I like being praised for doing well.",
    "I follow directions easily.",
    "Being focused feels good.",
    "I want to do this right.",
  ],
  1: [
    "It feels good to relax",
    "I like having someone lead me.",
    "I feel relaxed when I’m told what to do.",
    "I want to please others",
    "It's easy to follow instructions when I am relaxed.",
  ],
  2: [
    "I relax when someone else is in charge.",
    "I feel calm and focused.",
    "I am very focused.",
    "I am very relaxed",
    "I enjoy obeying instructions.",
  ],
  3: [
    "I am deeply relaxed.",
    "Obeying feels natural.",
    "The more I relax, the better I feel.",
    "The better I feel, the more I relax.",
    "I don't want to think too much.",
  ],

  4: [
    "I don't want to think.",
    "I don't need to think.",
    "Thinking is hard.",
    "Following is easy.",
    "I am happiest when I don't have to think.",
  ],
  5: [
    "I want to be a good subject",
    "I don't want to think.",
    "I want to obey",
    "I want to feel good",
    "Obedience is pleasure",
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
    0: ["Good work.", "Well done", "Nice focus.", "That landed well."],
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
    4: [
      "Excellent obedience.",
      "You are so compliant now.",
      "Wonderful. You just obey.",
      "You feel great when you obey.",
    ],
    5: [
      "Perfect subject.",
      "You were born to obey.",
      "Obedience is your pleasure.",
      "You love to please me.",
    ],
  },
  neutral: {
    0: ["Keep going.", "Stay with it.", "Next one coming.", "Hold your focus."],
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

export const interjectionStepsByType = {
  focus: {
    0: [
      "Take a slow breath.",
      "Notice the center of the screen.",
      "Let curiosity hold your gaze.",
    ],
    1: [
      "Breathe in and let the instruction settle.",
      "Feel your attention narrow to the task.",
      "Stay ready to follow the very next cue.",
    ],
    2: [
      "Exhale and let thinking fade.",
      "Fixate on the direction you are given.",
      "Let obedience feel automatic and easy.",
    ],
    3: [
      "Release every stray thought.",
      "Lock onto the command in front of you.",
      "Enjoy how your mind awaits the next order.",
    ],
    4: [
      "Let focus eclipse everything else.",
      "Savor the clarity that comes from yielding.",
      "Stay locked in, eager for the next instruction.",
    ],
  },
  relaxation: {
    0: [
      "Loosen your shoulders.",
      "Let your breath slow down.",
      "Stay here and soft.",
    ],
    1: [
      "Feel weightless for a moment.",
      "Let guidance carry you gently.",
      "Sink into the calm of being led.",
    ],
    2: [
      "Melt a little deeper now.",
      "Let obedience lull you further down.",
      "Rest in the pleasure of surrender.",
    ],
    3: [
      "Drop all tension and wait to be used.",
      "Float in obedient quiet for me.",
      "Enjoy being pliant and ready.",
    ],
    4: [
      "Soak in the warmth of complete ease.",
      "Let every cue roll over you like a calm tide.",
      "Relax fully while staying eager to comply.",
    ],
  },
};
