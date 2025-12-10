export default function ConsentScreen(state, emit) {
  return html`
    <div class="pa4 sans-serif bg-white dark-gray">
      <h1 class="f3 mb3">Cognitive Conditioning Research Study #217</h1>
      <p class="lh-copy mb4">
        This is an academic study on attention and compliance. You may stop at
        any time.
      </p>
      <button
        class="f5 link dim br2 ph3 pv2 mb2 dib white bg-dark-blue"
        onclick=${() => emit("navigateToModule", "personal-info")}
      >
        I consent
      </button>
    </div>
  `;
}
