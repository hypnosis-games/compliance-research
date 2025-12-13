export default function ConsentScreen(state, emit) {
  return html`
    <div class="screen-shell">
      <div class="screen-card">
        <h1 class="screen-title">
          Cognitive Conditioning Research Study #217
        </h1>
        <p class="screen-subtitle">
          Please read carefully and proceed only if you consent to participate.
        </p>

        <p class="body-text">
          This is an academic study on attention and compliance. You may stop at
          any time and withdraw your participation without penalty.
        </p>

        <p class="body-text">
          By selecting “I consent”, you indicate that you have read and understood
          the information above and agree to participate in this study.
        </p>

        <button
          class="primary-button"
          onclick=${() => emit("nav/goToModule", "pre-test-survey")}
        >
          I consent
        </button>
      </div>
    </div>
  `;
}
