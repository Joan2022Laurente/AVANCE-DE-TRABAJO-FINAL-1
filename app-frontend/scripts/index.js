// ============================================
// INDEX.JS - Animaciones Awwwards Level
// Con Stacking Cards Animation Premium (Optimized & Robust)
// ============================================

gsap.registerPlugin(ScrollTrigger);

// ============================================
// 1. PAGE LOADER (con protección de errores)
// ============================================
window.addEventListener("load", () => {
  const loader = document.querySelector(".page-loader");
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  if (loader) {
    tl.to(".loader-bar", {
      width: "100%",
      duration: 1.5,
      ease: "power2.inOut",
    })
      .to(".loader-content", {
        opacity: 0,
        y: -50,
        duration: 0.5,
      })
      .to(".page-loader", {
        opacity: 0,
        duration: 0.5,
        onComplete: () => (loader.style.display = "none"),
      });
  }

  // Hero content entrada segura
  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .from(".hero-badge", { opacity: 0, y: 30, duration: 0.8 })
    .from(
      ".title-line",
      { opacity: 0, y: 50, stagger: 0.2, duration: 1 },
      "-=0.3"
    )
    .from(".hero-subtitle", { opacity: 0, y: 30, duration: 0.8 }, "-=0.5")
    .from(
      ".hero-buttons .btn",
      { opacity: 0, y: 30, stagger: 0.15, duration: 0.8 },
      "-=0.4"
    )
    .from(
      ".hero-stats .stat-item",
      { opacity: 0, y: 30, stagger: 0.1, duration: 0.8 },
      "-=0.4"
    )
    .from(
      ".hero-main-image",
      { opacity: 0, scale: 0.8, duration: 1, ease: "back.out(1.2)" },
      "-=0.8"
    )
    .from(
      ".floating-card",
      {
        opacity: 0,
        scale: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.7)",
      },
      "-=0.5"
    );
});

// ============================================
// 2. ANIMATED COUNTER (con validación)
// ============================================
const animateCounter = (el) => {
  const target = parseInt(el.dataset.target);
  if (isNaN(target)) return;

  gsap.to(el, {
    innerHTML: target,
    duration: 2,
    ease: "power1.inOut",
    snap: { innerHTML: 1 },
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
      once: true,
    },
  });
};

document.querySelectorAll(".stat-number").forEach(animateCounter);

// ============================================
// 3. FLOATING CARDS ANIMATION (loop suave y seguro)
// ============================================
const safeFloat = (selector, y, rot, dur, delay = 0) => {
  if (document.querySelector(selector)) {
    gsap.to(selector, {
      y,
      rotation: rot,
      repeat: -1,
      yoyo: true,
      duration: dur,
      ease: "sine.inOut",
      delay,
    });
  }
};

safeFloat(".card-1", -20, -5, 2.5);
safeFloat(".card-2", -15, 5, 3, 0.5);
safeFloat(".card-3", -18, -3, 2.8, 1);

// ============================================
// 4. GRADIENT ORBS ANIMATION
// ============================================
[
  [".orb-1", 100, -100, 1.2, 8],
  [".orb-2", -80, 80, 0.8, 10],
  [".orb-3", 50, 100, 1.1, 7],
].forEach(([sel, x, y, s, d]) => {
  if (document.querySelector(sel)) {
    gsap.to(sel, {
      x,
      y,
      scale: s,
      repeat: -1,
      yoyo: true,
      duration: d,
      ease: "sine.inOut",
    });
  }
});

// ============================================
// 6. STACKING CARDS ANIMATION (Optimizado y seguro)
// ============================================
function initStackingCards() {
  const cards = gsap.utils.toArray(".stack-card");
  const wrapper = document.querySelector(".stacking-cards-wrapper");
  if (!cards.length || !wrapper)
    return console.warn("⚠️ No se encontraron las cards o wrapper");

  cards.forEach((card, i) => {
    const initProps =
      i === 0
        ? { y: 0, opacity: 1, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0 }
        : {
            y: 100 + i * 20,
            opacity: 0,
            scale: 0.9,
            rotateX: -15,
            rotateY: gsap.utils.random(-5, 5),
            rotateZ: gsap.utils.random(-3, 3),
          };
    gsap.set(card, {
      ...initProps,
      zIndex: cards.length - i,
      transformOrigin: "center center",
    });
  });

  const mainTL = gsap.timeline({
    scrollTrigger: {
      trigger: ".ssttt",
      start: "top top",
      end: "+=400%",
      scrub: 1,
      pin: ".stacking-cards-wrapper",
      anticipatePin: 1,
      pinSpacing: true,
      pinType: "fixed",
      invalidateOnRefresh: true,
      onRefresh: () => ScrollTrigger.refresh(true),
    },
  });

  cards.forEach((card, i) => {
    const shine = card.querySelector(".card-shine");
    if (i > 0) {
      mainTL.to(
        cards[i - 1],
        {
          scale: 0.95,
          filter: "blur(8px)",
          opacity: 0.1,
          y: -20,
          duration: 1,
          ease: "power2.inOut",
        },
        i * 1.5
      );
      mainTL.to(
        card,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          duration: 1,
          ease: "back.out(1.3)",
          onStart: () => {
            if (shine) {
              gsap.fromTo(
                shine,
                { opacity: 0, x: -200, y: -200 },
                {
                  opacity: 1,
                  x: 200,
                  y: 200,
                  duration: 0.8,
                  ease: "power2.out",
                  onComplete: () =>
                    gsap.to(shine, { opacity: 0, duration: 0.3 }),
                }
              );
            }
          },
        },
        i * 1.5
      );
    }
    if (i === cards.length - 1) {
      mainTL.to(
        cards,
        {
          opacity: 0,
          scale: 0.8,
          y: -50,
          filter: "blur(10px)",
          stagger: 0.05,
          duration: 1,
          ease: "power2.in",
        },
        cards.length * 1.5 + 0.5
      );
    }
  });
}

setTimeout(() => {
  if (document.querySelector(".stacking-section")) initStackingCards();
}, 100);

// ============================================
// 7. FEATURES CARDS REVEAL
// ============================================
gsap.utils.toArray(".feature-card").forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      end: "top 60%",
      toggleActions: "play none none reverse",
    },
    opacity: 0,
    y: 60,
    rotation: 5,
    duration: 0.8,
    delay: i * 0.1,
    ease: "power3.out",
  });
});

document.querySelectorAll(".feature-card").forEach((card) => {
  const bg = card.querySelector(".icon-bg");
  if (!bg) return;
  card.addEventListener("mouseenter", () =>
    gsap.to(bg, { scale: 15, opacity: 0.1, duration: 0.6, ease: "power2.out" })
  );
  card.addEventListener("mouseleave", () =>
    gsap.to(bg, { scale: 1, opacity: 0, duration: 0.6, ease: "power2.out" })
  );
});

// ============================================
// 8. SECTION HEADERS REVEAL
// ============================================
gsap.utils.toArray(".reveal-line").forEach((line, i) => {
  gsap.from(line, {
    scrollTrigger: { trigger: line, start: "top 85%" },
    opacity: 0,
    y: 50,
    duration: 1,
    delay: i * 0.2,
    ease: "power3.out",
  });
});

// ============================================
// 9. TESTIMONIALS SLIDER
// ============================================
let currentTestimonial = 0;
const testimonials = document.querySelectorAll(".testimonial-card");
const dots = document.querySelectorAll(".testimonial-dots .dot");
const prev = document.querySelector(".testimonial-prev");
const next = document.querySelector(".testimonial-next");
let rotateInt;

function showTestimonial(i) {
  if (!testimonials.length) return;
  if (i < 0) i = testimonials.length - 1;
  if (i >= testimonials.length) i = 0;
  currentTestimonial = i;
  testimonials.forEach((t, idx) => {
    t.classList.toggle("active", idx === i);
    if (idx === i)
      gsap.fromTo(
        t,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6 }
      );
  });
  dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
}

[next, prev].forEach(
  (btn) =>
    btn &&
    btn.addEventListener("click", () => {
      showTestimonial(
        btn === next ? currentTestimonial + 1 : currentTestimonial - 1
      );
      resetRotate();
    })
);

dots.forEach((dot, i) =>
  dot.addEventListener("click", () => {
    showTestimonial(i);
    resetRotate();
  })
);

function autoRotate() {
  rotateInt = setInterval(() => showTestimonial(currentTestimonial + 1), 5000);
}
function resetRotate() {
  clearInterval(rotateInt);
  autoRotate();
}

autoRotate();

const tSection = document.querySelector(".testimonial-section");
if (tSection) {
  tSection.addEventListener("mouseenter", () => clearInterval(rotateInt));
  tSection.addEventListener("mouseleave", autoRotate);
}

// ============================================
// 10. CTA SECTION PARALLAX
// ============================================
[
  [".cta-orb-1", -100, 50, 1.3],
  [".cta-orb-2", 100, -50, 0.8],
].forEach(([sel, y, x, s]) => {
  if (document.querySelector(sel)) {
    gsap.to(sel, {
      scrollTrigger: {
        trigger: ".final-cta",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
      y,
      x,
      scale: s,
    });
  }
});

// ============================================
// 11. SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
    }
  });
});

// ============================================
// 12. PARALLAX HERO IMAGE
// ============================================
if (document.querySelector(".hero-main-image")) {
  gsap.to(".hero-main-image", {
    scrollTrigger: {
      trigger: ".hero-section",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
    y: 150,
    scale: 1.1,
    ease: "none",
  });
}

// ============================================
// 13. STATUS CARD ANIMATION
// ============================================
gsap.from(".status-card", {
  scrollTrigger: { trigger: ".status-card", start: "top 80%" },
  opacity: 0,
  y: 50,
  scale: 0.95,
  duration: 0.8,
  ease: "back.out(1.2)",
});

// ============================================
// 14. STACKING SECTION HEADER
// ============================================
gsap.from(".stacking-section .section-header", {
  scrollTrigger: { trigger: ".stacking-section", start: "top 80%", once: true },
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power3.out",
});

// ============================================
// 15. PERFORMANCE OPTIMIZATIONS
// ============================================
window.addEventListener("load", () => ScrollTrigger.refresh());
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 300);
});
window.addEventListener("orientationchange", () => ScrollTrigger.refresh());

console.log("🎨 UTP+Schedule - Stacking Cards Animation (Optimized Build)");
