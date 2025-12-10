// views/layouts/induction-arcade-layout.js

export default function InductionArcadeLayout(state, emit) {
  const arcade = state.inductionArcade || {};
  const { env = {}, lastAffirmation = "" } = arcade;

  const depthPercent = Math.round((env.depthLevel || 0) * 100);

  function onNextClick(e) {
    e.preventDefault();
    emit("navigateNextModule");
  }

  return html`
    <section class="layout induction-arcade-layout">
      <header class="module-header">
        <h1>Induction Arcade</h1>
        <p class="module-subtitle">
          Follow the tiny tasks. Let the rhythm guide you deeper.
        </p>
      </header>

      <div class="induction-arcade-body">
        <div class="induction-arcade-status">
          <div class="status-row">
            <span class="status-label">Depth:</span>
            <span class="status-value">${depthPercent}%</span>
          </div>
          <div class="status-row">
            <span class="status-label">Spiral:</span>
            <span class="status-value">
              ${(env.spiralIntensity ?? 0).toFixed(2)}
            </span>
          </div>
          <div class="status-row">
            <span class="status-label">Beat:</span>
            <span class="status-value">
              ${(env.beatIntensity ?? 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div class="induction-arcade-affirmation">
          <p class="affirmation-text">
            ${lastAffirmation || "Watch the shapes. Follow the instructions."}
          </p>
        </div>

        <div class="induction-arcade-controls">
          <button class="primary-btn" onclick=${onNextClick}>
            Continue to next part
          </button>
        </div>

        <p class="induction-arcade-hint">
          The visual game is running behind this overlay. Just follow the
          shapes and taps on the screen.
        </p>
      </div>
    </section>
  `;
}
