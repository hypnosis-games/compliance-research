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
    "It feels good to focus.",
    "I like to do things correctly.",
  ],
  1: [
    "It feels good to relax.",
    "I like having someone lead me.",
    "I feel relaxed when I’m told what to do.",
    "I want to please others.",
    "It is easy to follow instructions when I am relaxed.",
  ],
  2: [
    "I relax when someone else is in charge.",
    "I feel calm and focused.",
    "I am very focused.",
    "I am very relaxed.",
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
    "I want to be a good subject.",
    "I don't want to think.",
    "I want to obey.",
    "I want to feel good.",
    "Obedience is pleasure.",
  ],
};

export const surveyAffirmationsByTone = {
  positive: {
    0: [
      "Very good.",
      "Thank you.",
      "Well done.",
    ],
    1: [
      "Very good.",
      "Very nice.",
      "That's right.",
    ],
    2: [
      "Wonderful.",
      "Excellent.",
      "Perfect.",
            "Very good.",
      "That's right.",  
      "You are doing so well",
    ],
    3: [
      "Wonderful.",
      "Excellent.",
      "Perfect.",
            "Very good.",
      "That's right.",
   ],
    4: [
      "Wonderful.",
      "Excellent.",
      "Perfect.",
            "Very good.",
      "That's right.",
      "Good subject.",
    ],
    5: [
      "Wonderful.",
      "Excellent.",
      "Perfect.",
      "Very good.",
      "That's right.",
      "You are an ideal subject.",
    ],
  },
  neutral: {
    0: [
      "Thank you",
      "Good.",
      "We appreciate your input.",
      "Your response is valuable to us.",
      "Well done."
    ],
    1: [
      "Thank you",
      "Good.",
      "We appreciate your input.",
      "Your response is valuable to us.",
      "Well done."
    ],
    2: [
      "Thank you",
      "Good.",
      "We appreciate your input.",
      "Your response is valuable to us.",
            "Well done."

    ],
    3: [
      "Thank you",
      "Good.",
      "We appreciate your input.",
      "Your response is valuable to us.",
            "Well done."

    ],
    4: [
      "Thank you",
      "Good.",
      "We appreciate your input.",
      "Your response is valuable to us.",
      "Well done."

    ],
    5: [
      "Thank you",
      "Good.",
      "We appreciate your input.",
      "Your response is valuable to us.",
      "Well done."

    ],
  },
};

export const taskAffirmationsByOutcome = {
  success: {
    0: ["Good work.", "Well done", "Excellent", "Perfect",
      "Wonderful", "That's right."

    ],
    1: [
"Good work.", "Well done", "Excellent", "Perfect",
      "Wonderful", "That's right.", "You are doing so well",
      "Excellent focus."
    ],
    2: [
"Good work.", "Well done", "Excellent", "Perfect",
      "Wonderful", "That's right.", "Deeply focused.",
      "So attentive."
    ],
    3: [
"Good work.", "Well done", "Excellent", "Perfect",
      "Wonderful", "That's right.", "So easy.",
      "So focused.",
    ],
    4: [
"Good work.", "Well done", "Excellent", "Perfect",
      "Wonderful", "That's right.", "So easy.",
      "So focused.", "So relaxed.",
    ],
    5: [
      "Deeply relaxed.",
      "Completely focused.",
      "Perfectly obedient.",
      "Such a good subject.",
      "Good work.", "Well done", "Excellent", "Perfect",
      "Wonderful", "That's right.", "So easy.",
      "So focused.",

    ],
  },
};

export const interjectionStepsByType = {
  focus: {
    0: [
      "Take a slow breath.",
      "Notice the center of the screen.",
      "Breathe out gently.",
    ],
    1: [
      "Breathe in and let the instruction settle.",
      "Focus on the screen ahead.",
      "Notice how it feels to wait for the task.",
    ],
    2: [
      "Exhale and let thinking fade.",
      "Focus on the screen.",
      "Notice how your mind quiets down.",
    ],
    3: [
      "Release every stray thought.",
      "Focus on the screen in front of you.",
      "Enjoy how it feels to be so attentive.",
    ],
    4: [
      "You are doing very well.",
      "You are deeply focused now.",
      "Notice how good it feels to focus.",
    ],
    5: [
      "Notice how deeply focused you are.",
      "Enjoy the feeling of perfect attention.",
      "You are an ideal subject.",
    ],
  },
  relaxation: {
    0: [
      "Loosen your shoulders.",
      "Let your breath slow down.",
      "Soft and easy.",
    ],
    1: [
      "Breathe out and let tension go.",
      "Notice any tension in your body.",
      "Let it melt away.",
    ],
    2: [
      "Melt a little deeper now.",
      "Let your body soften.",
      "Feel yourself letting go.",
    ],
    3: [
      "Feel yourself sinking deeper.",
      "Let your thoughts slow down.",
      "Enjoy the calm spreading through you.",
    ],
    4: [
      "Notice how deeply relaxed you are.",
      "Feel your body becoming very soft.",
      "Feel a wave of warmth moving through you.",
    ],
    5: [
      "Sinking deeper and deeper now.",
      "Dropping into a deep state of relaxation.",
      "Deeply hypnotized now.",
    ],
  },
  wakener: {
    5: [
      "Coming back now.",
      "Starting to wake up.",
      "Feel energy returning to your body.",
      "Nice and easy.",
      "Slowly waking up now.",
      "Come back feeling refreshed.",
      "Let your eyes brighten as you return to full awareness.",
      "Breathe in and feel energy filling every part of you.",
      "Stretch gently and notice how refreshed and alert you are becoming.",
      "Feel great, awake, and ready to continue with a clear mind.",
            "Thank you for taking part in this survey.",

    ],
  },
};
