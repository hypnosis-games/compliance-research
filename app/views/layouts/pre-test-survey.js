/*
/app/views/layouts/pre-test-survey.js
Constructs the layout for the pre-test survey including navigation controls.
*/
// views/pre-test-survey.js
import { ContentDirector } from "../../directors/content-director.js";

export default function PreTestSurvey(state, emit) {
  console.log("PreTestSurveyLayout state:", state);
  const survey = state.preTestSurvey || {};
  const {
    instructions = [],
    likertOptions = [1, 2, 3, 4, 5],
    likertLabels = {},
    questions = [],
    currentIndex = 0,
    responses = {},
    lastAffirmation = "",
    animPhase = "idle",
    selectedValue = null,
    selectedQuestionId = null,
  } = survey;

  if (!questions.length) {
    return html`<div class="pa4 sans-serif">Loading survey…</div>`;
  }

  const totalQuestions = questions.length;
  const question = questions[currentIndex];
  const answeredCount = Object.keys(responses).filter(
    (id) => responses[id] != null
  ).length;
  const completion = Math.round((answeredCount / totalQuestions) * 100);

  function handleAnswer(value) {
    if (animPhase !== "idle") return;

    const numeric = Number(value);
    const newResponses = {
      ...responses,
      [question.id]: numeric,
    };

    const isPositive = numeric >= 4;
    const fullAffirmation = ContentDirector.getSurveyAffirmation({
      depth: state.conditioning?.depth || 0,
      isPositive,
      previousSelection: lastAffirmation,
    });

    const nextIndex = currentIndex + 1;
    const isLast = nextIndex >= totalQuestions;

    // Phase 1: show affirmation, highlight current
    emit("preTestSurvey/update", {
      responses: newResponses,
      lastAffirmation: fullAffirmation,
      animPhase: "affirm",
      selectedValue: numeric,
      selectedQuestionId: question.id,
    });

    // Phase 2: fade out question card
    window.setTimeout(() => {
      emit("preTestSurvey/update", {
        animPhase: "out",
      });
    }, 500);

    // Phase 3: move to next question or next module
    window.setTimeout(() => {
      if (isLast) {
        emit("preTestSurvey/update", {
          animPhase: "idle",
          lastAffirmation: "",
          selectedValue: null,
          selectedQuestionId: null,
        });
        emit("nav/goToModule", "induction-arcade");
      } else {
        emit("preTestSurvey/update", {
          currentIndex: nextIndex,
          animPhase: "idle",
          lastAffirmation: "",
          selectedValue: null,
          selectedQuestionId: null,
        });
      }
    }, 900);
  }

  const showScale = animPhase === "idle";
  const showAffirmation = animPhase === "affirm" || animPhase === "out";

  const cardClasses = [
    "question-card",
    "animated",
    animPhase === "affirm" ? "phase-affirm" : "",
    animPhase === "out" ? "phase-out" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const selectedForThisQuestion =
    selectedQuestionId === question.id ? selectedValue : null;

  return html`
    <div class="screen-shell pretest-container">
      <div class="screen-card screen-card--tall">
        <div class="flex items-center justify-between mb3">
          <div>
            <h1 class="screen-title mb1">Pre-Test Survey</h1>
            <p class="f6 gray mt0">
              Question ${currentIndex + 1} of ${totalQuestions}
            </p>
          </div>
          <div class="tr">
            <div class="progress-bg">
              <div
                class="progress-bar"
                style="width: ${completion}%;"
              ></div>
            </div>
            <span class="f7 gray mt1 db">
              ${completion}% complete
            </span>
          </div>
        </div>

        <div class="mb3">
          ${instructions.map(
            (line) => html`<p class="lh-copy mv2 f6 gray">${line}</p>`
          )}
        </div>

        <div class="${cardClasses}">
          <p class="f4 mb3 question-text">
            ${question.text}
          </p>

          ${showScale
            ? html`
                <div class="flex justify-between mb2 scale-labels">
                  <span class="f6 gray">
                    ${likertLabels[1] || "1 - Strongly disagree"}
                  </span>
                  <span class="f6 gray">
                    ${likertLabels[5] || "5 - Strongly agree"}
                  </span>
                </div>

                <div
                  class="rating-scale-row ${animPhase !== "idle"
                    ? "disabled"
                    : ""}"
                >
                  ${likertOptions.map((option) => {
                    const isSelected = selectedForThisQuestion === option;
                    return html`
                      <button
                        type="button"
                        class="rating-pill ${isSelected ? "selected" : ""}"
                        onclick=${() => handleAnswer(option)}
                        aria-label="${likertLabels[option] || option}"
                      >
                        ${option}
                      </button>
                    `;
                  })}
                </div>
              `
            : html`
                <div class="affirmation-wrapper">
                  <p class="affirmation-big">
                    ${lastAffirmation || "Good."}
                  </p>
                </div>
              `}
        </div>
      </div>
    </div>
  `;
}

