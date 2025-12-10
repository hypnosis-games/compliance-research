// phaser/spiral-postfx-pipeline.js
export default class SpiralPostFXPipeline extends Phaser.Renderer.WebGL
  .Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      name: "SpiralPostFX",
      fragShader: `
        precision mediump float;

        uniform sampler2D uMainSampler;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uOverlay; // 0..1

        varying vec2 outTexCoord;

        void main() {
          // Base scene color
          vec3 sceneColor = texture2D(uMainSampler, outTexCoord).rgb;

          // Spiral coords in screen space
          vec2 uv = gl_FragCoord.xy / uResolution;
          vec2 p = uv - 0.5;
          float aspect = uResolution.x / uResolution.y;
          p.x *= aspect;

          float r = length(p);
          float angle = atan(p.y, p.x);

          float arms  = 4.0;
          float twist = 12.0;
          float speed = 3.5;

          float theta = angle + r * twist - uTime * speed;
          float v = sin(theta * arms);

          // Soft grayscale 0..1
          float stripes = 0.5 + 0.5 * v;

          // Use overlay as "how much spiral to mix in"
          float intensity = mix(0.5, stripes, 0.8); // 0.5..spiral, fixed contrast
          vec3 spiralColor = vec3(intensity);

          vec3 finalColor = mix(sceneColor, spiralColor, uOverlay);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    this.overlay = 0.0; // default subtlety
  }

  onPreRender() {
    const res = this.renderer;
    this.set2f("uResolution", res.width, res.height);
    this.set1f("uTime", this.game.loop.time / 1000.0);
    this.set1f("uOverlay", this.overlay);
  }

  setOverlay(value) {
    this.overlay = Phaser.Math.Clamp(value, 0, 1);
  }
}
