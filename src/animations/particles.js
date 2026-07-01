export const heroParticlesConfig = {
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    number: { value: 40, density: { enable: true, width: 1200 } },
    color: { value: ["#48929B", "#EDE8DE", "#C8960C"] },
    shape: { type: "circle" },
    opacity: {
      value: { min: 0.1, max: 0.5 },
      animation: { enable: true, speed: 0.8, sync: false },
    },
    size: {
      value: { min: 2, max: 8 },
      animation: { enable: true, speed: 2, sync: false },
    },
    move: {
      enable: true,
      speed: { min: 0.5, max: 1.5 },
      direction: "top",
      outModes: { default: "out", top: "destroy", bottom: "none" },
    },
  },
  interactivity: { events: { onHover: { enable: false } } },
  detectRetina: true,
};

// 墨はね — splattered ink flecks (not party confetti): desaturated sumi tones,
// smaller, fewer, so the survey climax reads as brush ink, not celebration.
export const surveyConfettiConfig = {
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    number: { value: 0 },
    color: { value: ["#2C2828", "#3A3636", "#C53D43", "#C8960C"] },
    shape: { type: ["circle"] },
    opacity: { value: { min: 0.45, max: 0.9 } },
    size: { value: { min: 2, max: 7 } },
    move: {
      enable: true,
      speed: { min: 7, max: 17 },
      direction: "none",
      gravity: { enable: true, acceleration: 11 },
      outModes: { default: "destroy" },
    },
    rotate: {
      value: { min: 0, max: 360 },
      animation: { enable: true, speed: 50 },
    },
    wobble: { enable: true, distance: 12, speed: { min: 8, max: 14 } },
  },
  emitters: {
    direction: "top",
    life: { count: 1, duration: 0.3, delay: 0 },
    rate: { delay: 0.1, quantity: 110 },
    size: { width: 100, height: 0 },
    position: { x: 50, y: 100 },
  },
  detectRetina: true,
};
