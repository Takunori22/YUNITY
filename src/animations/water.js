import { gsap } from "gsap";

// ============================================================
//  water.js — fullscreen WebGL caustics / 湯 background
//  Hand-rolled GLSL (no deps). Colour is driven by window.__temp
//  (the temperature journey): cold 藍 night → warm 紅/山吹 steam.
//  Pointer creates ripples. Single RAF via gsap.ticker.
//  Reduced motion / no-WebGL → CSS gradient fallback (.no-water).
// ============================================================

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform float uTime;
uniform vec2  uRes;
uniform float uTemp;     // 0 cold night … 1 warm steam
uniform vec3  uMouse;    // xy in px (y from top), z strength

// Iterated sine domain-warp caustics (classic approximation)
float caustic(vec2 uv, float t) {
  vec2 p = uv;
  float c = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    p = uv + vec2(
      cos(t * 0.6 + p.y * 3.0 + fi),
      sin(t * 0.5 + p.x * 3.0 + fi)
    ) * 0.35;
    c += 1.0 / length(vec2(sin(p.x * 4.0 + t), cos(p.y * 4.0 + t)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.0), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  vec2 suv = uv; suv.x *= aspect;

  float t = uTime * 0.18;

  // pointer ripple
  vec2 m = uMouse.xy / uRes.xy;
  m.y = 1.0 - m.y;
  m.x *= aspect;
  float d = distance(suv, m);
  float ripple = sin(d * 38.0 - uTime * 4.0) * exp(-d * 6.0) * uMouse.z;

  float c = caustic(suv * 2.2 + ripple * 0.5, t);

  // temperature colour ramp — light (cream) background
  vec3 deep  = mix(vec3(0.965, 0.952, 0.910), vec3(0.977, 0.944, 0.890), uTemp);
  vec3 cool  = vec3(0.28, 0.57, 0.61);                                  // 浅葱
  vec3 warm  = mix(vec3(0.80, 0.60, 0.06), vec3(0.77, 0.24, 0.26),
                   smoothstep(0.5, 1.0, uTemp));                        // 山吹 → 紅
  vec3 light = mix(cool, warm, smoothstep(0.25, 0.85, uTemp));

  float depth = smoothstep(0.0, 1.0, uv.y);
  // subtractive caustics: tinted shadows on bright cream ground
  vec3 col = deep - light * c * 0.055 * (0.4 + 0.6 * depth);
  col += (light - deep) * max(ripple, 0.0) * 0.15;
  col = clamp(col, 0.0, 1.0);

  // subtle vignette on light background
  float vig = smoothstep(1.35, 0.25, length(uv - 0.5));
  col *= 0.96 + 0.04 * vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

let gl = null;
let canvas = null;
let uTime, uRes, uTemp, uMouse;
let dpr = 1;
let paused = false;
const mouse = { x: -1e3, y: -1e3, str: 0 };

function compile(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("water shader:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, w, h);
}

function onPointer(e) {
  mouse.x = e.clientX * dpr;
  mouse.y = e.clientY * dpr;
  mouse.str = 1.0;
}

function render(time) {
  if (paused) return;
  gl.uniform1f(uTime, time);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform1f(uTemp, window.__temp || 0);
  gl.uniform3f(uMouse, mouse.x, mouse.y, mouse.str);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  mouse.str *= 0.94; // decay ripple
}

export function initWater() {
  // Reduced motion → static CSS gradient fallback, no GL loop.
  if (window.__reducedMotion) {
    document.body.classList.add("no-water");
    return;
  }

  canvas = document.createElement("canvas");
  canvas.id = "water-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  // Any WebGL setup failure → remove canvas, fall back to the CSS gradient.
  const bail = () => {
    canvas?.remove();
    canvas = null;
    gl = null;
    document.body.classList.add("no-water");
  };

  gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false });
  if (!gl) return bail();

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return bail();

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("water program link failed:", gl.getProgramInfoLog(prog));
    return bail();
  }
  gl.useProgram(prog);

  // fullscreen triangle
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  if (loc < 0) return bail();
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  uTime = gl.getUniformLocation(prog, "uTime");
  uRes = gl.getUniformLocation(prog, "uRes");
  uTemp = gl.getUniformLocation(prog, "uTemp");
  uMouse = gl.getUniformLocation(prog, "uMouse");
  if (!uTime || !uRes || !uTemp || !uMouse) return bail();

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
  });

  gsap.ticker.add(render);
}
