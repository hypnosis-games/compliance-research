/*
/app/views/partials/intermission-survey.js
Displays the intermission survey interface between induction arcade sessions.
*/
// views/partials/intermission-survey.js
export default function IntermissionSurvey({ survey = {}, emit }) {
  const {
    instructions = [],
    likertOptions = [],
    likertLabels = {},
    questions = [],
    currentIndex = 0,
    responses = {},
    lastAffirmation = "",
    animPhase = "idle",
    selectedValue = null,
    selectedQuestionId = null,
  } = survey;

  if (!questions.length) return null;

  const totalQuestions = questions.length;
  const question = questions[currentIndex];
  if (!question) return null;
  const answeredCount = Object.keys(responses).filter(
    (id) => responses[id] != null
  ).length;
  const completion = Math.round((answeredCount / totalQuestions) * 100);

  function handleAnswer(value) {
    emit("inductionArcade/answerSurveyQuestion", value);
  }

  const showScale = animPhase === "idle";
  const selectedForThisQuestion =
    selectedQuestionId === question.id ? selectedValue : null;

  return html`
    <div class="screen-shell intermission-survey-shell">
      <div class="screen-card screen-card--tall">
        <div class="flex items-center justify-between mb3">
          <div>
            <h1 class="screen-title mb1">Quick check-in</h1>
            <p class="f6 gray mt0">
              ${completion}% complete · Question ${currentIndex + 1} of
              ${totalQuestions}
            </p>
          </div>
        </div>

        <div class="mb3">
          ${instructions.map(
            (line) => html`<p class="lh-copy mv2 f6 instruction-line">${line}</p>`
          )}
        </div>

        <div class="question-card animated">
          <p class="f4 mb3 question-text">${question.text}</p>

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
                  <p class="affirmation-big">${lastAffirmation || "Good."}</p>
                </div>
              `}
        </div>
      </div>
    </div>
  `;
}
