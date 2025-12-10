// phaser/spiral-pipeline.js

export default class SpiralPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
  constructor(game) {
    super({
      game,
      renderer: game.renderer,
      fragShader: `
        precision mediump float;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uOpacity;

        void main() {
          vec2 uv = gl_FragCoord.xy / uResolution;
          vec2 p = (uv - 0.5) * vec2(1.0, -1.0);
          float r = length(p);
          float angle = atan(p.y, p.x);
          float arms = 8.0;
          float radialFreq = 5.0;
          float speed = 1.5;
          float v = sin(angle * arms + r * radialFreq - uTime * speed);
          float stripes = 0.5 + 0.5 * v;
          vec3 col = vec3(stripes);
          gl_FragColor = vec4(col, uOpacity);
        }
      `,
      uniforms: ["uResolution", "uTime", "uOpacity"],
    });

    this.opacity = 1;
  }

  setOpacity(value) {
    this.opacity = value;
  }

  onPreRender() {
    const res = this.renderer;
    this.set2f("uResolution", res.width, res.height);
    this.set1f("uTime", this.game.loop.time / 1000);
    this.set1f("uOpacity", this.opacity);
  }
}
