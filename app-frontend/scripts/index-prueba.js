// ============================================
// STACKING CARDS PRO - GSAP + ScrollTrigger
// ============================================
gsap.registerPlugin(ScrollTrigger);

function initStackingCards() {
  const cards = gsap.utils.toArray(".stack-card");
  const wrapper = document.querySelector(".stacking-cards-wrapper");
  const section = document.querySelector(".stacking-section");

  if (!cards.length || !wrapper || !section) return;

  // Limpia triggers anteriores si se reinicia
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.killTweensOf("*");

  // Ajuste dinámico de altura para evitar cortes
  section.style.minHeight = `${cards.length * 120}vh`;

  // Estado inicial de las cards
  cards.forEach((card, i) => {
    gsap.set(card, {
      y: i === 0 ? 0 : 100 + i * 20,
      opacity: i === 0 ? 1 : 0,
      scale: i === 0 ? 1 : 0.9,
      rotateX: i === 0 ? 0 : -15,
      rotateY: gsap.utils.random(-5, 5),
      rotateZ: gsap.utils.random(-3, 3),
      zIndex: cards.length - i,
      transformOrigin: "center bottom",
    });
  });

  // Timeline principal
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: wrapper,
      start: "center center", // Comienza cuando el wrapper está centrado
      end: () => "+=" + wrapper.offsetHeight * cards.length * 1.25,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onEnter: () =>
        gsap.to(wrapper, { y: 0, duration: 0.4, ease: "power2.out" }),
      onLeaveBack: () =>
        gsap.to(wrapper, { y: 0, duration: 0.3, ease: "power1.inOut" }),
      onRefreshInit: () =>
        gsap.set(wrapper, { clearProps: "all" }), // evita glitches
      markers: false,
    },
  });

  // Animación secuencial (stacking elegante)
  cards.forEach((card, i) => {
    const prev = cards[i - 1];
    const shine = card.querySelector(".card-shine");
    const isLast = i === cards.length - 1;

    if (i > 0) {
      // Desenfoca la anterior
      tl.to(
        prev,
        {
          scale: 0.95,
          filter: "blur(8px)",
          opacity: 0.1,
          duration: 0.6,
        },
        i
      );

      // Trae la siguiente con efecto 3D y brillo
      tl.to(
        card,
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          duration: 0.9,
          ease: "back.out(1.4)",
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
        i
      );
    }

    // Última animación: desvanecer todo suavemente
    if (isLast) {
      tl.to(
        cards,
        {
          opacity: 0,
          scale: 0.85,
          y: -60,
          filter: "blur(12px)",
          stagger: 0.05,
          duration: 1,
          ease: "power2.inOut",
        },
        i + 1
      );
    }
  });

  ScrollTrigger.refresh();
}

// ===============================
// Inicialización segura
// ===============================
function safeInit() {
  try {
    initStackingCards();
  } catch (e) {
    console.error("Error inicializando Stacking Cards:", e);
  }
}

// Espera a que cargue todo el DOM
window.addEventListener("load", () => {
  safeInit();

  // Prevención avanzada de bugs en cambios de pantalla
  const refreshAll = gsap.utils.debounce(() => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    safeInit();
    ScrollTrigger.refresh(true);
  }, 500);

  window.addEventListener("resize", refreshAll);
  window.addEventListener("orientationchange", refreshAll);
  window.addEventListener("scroll", gsap.utils.debounce(() => ScrollTrigger.refresh(), 300));
});
