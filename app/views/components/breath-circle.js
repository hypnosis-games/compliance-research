export default function BreathCircle({
  started,
  breathPhase,
  holding,
  onHoldStart,
  onHoldEnd,
}) {
  let size;
  if (!started) {
    size = 80; // px, small starting idle circle
  } else {
    size = breathPhase === "inhale" ? 200 : 100;
  }

  const color = holding ? "light-blue" : "light-gray";

  return html`
    <div
      class="br-100 center mb4 bg-${color}"
      style="
        width: ${size}px;
        height: ${size}px;
        transition: all 3s ease-in-out;
      "
      onmousedown=${onHoldStart}
      onmouseup=${onHoldEnd}
      ontouchstart=${onHoldStart}
      ontouchend=${onHoldEnd}
    ></div>
  `;
}
