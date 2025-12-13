  // phaser/spiral-pipeline.js

  export default class SpiralPipeline extends Phaser.Renderer.WebGL.Pipelines
    .SinglePipeline {
    constructor(game) {
      super({
        game,
        name: "SpiralPipeline",
        renderer: game.renderer,
        fragShader: `
      precision mediump float;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uOpacity;

  void main() {
    // Normalized coords, center at 0.0
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = uv - 0.5;

    // Fix aspect so spiral isn't squished
    float aspect = uResolution.x / uResolution.y;
    p.x *= aspect;

    float r = length(p);
    float angle = atan(p.y, p.x);

    // Spiral params
    float arms   = 2.0;   // how many "double" spirals – try 2, 3, 4
    float twist  = 12.0;  // how tightly it spirals
    float speed  = 1.5;   // rotation speed

    // Make angle depend on radius for a spiral
    float theta = angle + r * twist - uTime * speed;

    // Black/white bands along the spiral
    float v = sin(theta * arms);

    // Soft grayscale, 0..1
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
