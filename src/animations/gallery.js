import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initGallery() {
  const track = document.getElementById("gallery-track");
  if (!track) return;

  // On mobile OR under reduced motion, use native horizontal scroll snap
  // instead of the pinned GSAP scrub.
  if (window.innerWidth < 768 || window.__reducedMotion) {
    track.style.overflowX = "auto";
    track.style.scrollSnapType = "x mandatory";
    track.querySelectorAll(".gallery-item").forEach((item) => {
      item.style.scrollSnapAlign = "start";
    });
    return;
  }

  const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 64);

  // Velocity-skew: the track shears slightly with scroll speed (brush smear),
  // settling back to 0 as motion stops.
  const skewTo = gsap.quickTo(track, "skewX", { duration: 0.35, ease: "power3" });

  const st = ScrollTrigger.create({
    id: "gallery",
    trigger: ".gallery-section",
    start: "top top",
    end: () => `+=${Math.abs(getScrollAmount())}`,
    scrub: 1.2,
    pin: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (window.__reducedMotion) return;
      skewTo(gsap.utils.clamp(-6, 6, self.getVelocity() / -260));
    },
    animation: gsap.to(track, {
      x: getScrollAmount,
      ease: "none",
    }),
  });

  // Per-item parallax zoom
  gsap.utils.toArray(".gallery-item img").forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 1.15 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: img.parentElement,
          containerAnimation: st,
          start: "left right",
          end: "right left",
          scrub: true,
        },
      }
    );
  });
}
