// ============================================
// INDEX.JS - Animaciones Awwwards Level
// Con Stacking Cards Animation Premium
// ============================================

gsap.registerPlugin(ScrollTrigger);

// ============================================
// 1. PAGE LOADER
// ============================================
window.addEventListener('load', () => {
  const tl = gsap.timeline();
  
  tl.to('.loader-bar', {
    width: '100%',
    duration: 1.5,
    ease: 'power2.inOut'
  })
  .to('.loader-content', {
    opacity: 0,
    y: -50,
    duration: 0.5
  })
  .to('.page-loader', {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      document.querySelector('.page-loader').style.display = 'none';
    }
  })
  .from('.hero-badge', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out'
  })
  .from('.title-line', {
    opacity: 0,
    y: 50,
    stagger: 0.2,
    duration: 1,
    ease: 'power3.out'
  }, '-=0.3')
  .from('.hero-subtitle', {
    opacity: 0,
    y: 30,
    duration: 0.8
  }, '-=0.5')
  .from('.hero-buttons .btn', {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.8
  }, '-=0.4')
  .from('.hero-stats .stat-item', {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.8
  }, '-=0.4')
  .from('.hero-main-image', {
    opacity: 0,
    scale: 0.8,
    duration: 1,
    ease: 'back.out(1.2)'
  }, '-=0.8')
  .from('.floating-card', {
    opacity: 0,
    scale: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: 'back.out(1.7)'
  }, '-=0.5');
});

// ============================================
// 2. ANIMATED COUNTER
// ============================================
const animateCounter = (element) => {
  const target = parseInt(element.dataset.target);
  gsap.to(element, {
    innerHTML: target,
    duration: 2,
    ease: 'power1.inOut',
    snap: { innerHTML: 1 },
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true
    }
  });
};

document.querySelectorAll('.stat-number').forEach(animateCounter);

// ============================================
// 3. FLOATING CARDS ANIMATION
// ============================================
gsap.to('.card-1', {
  y: -20,
  rotation: -5,
  repeat: -1,
  yoyo: true,
  duration: 2.5,
  ease: 'sine.inOut'
});

gsap.to('.card-2', {
  y: -15,
  rotation: 5,
  repeat: -1,
  yoyo: true,
  duration: 3,
  ease: 'sine.inOut',
  delay: 0.5
});

gsap.to('.card-3', {
  y: -18,
  rotation: -3,
  repeat: -1,
  yoyo: true,
  duration: 2.8,
  ease: 'sine.inOut',
  delay: 1
});

// ============================================
// 4. GRADIENT ORBS ANIMATION
// ============================================
gsap.to('.orb-1', {
  x: 100,
  y: -100,
  scale: 1.2,
  repeat: -1,
  yoyo: true,
  duration: 8,
  ease: 'sine.inOut'
});

gsap.to('.orb-2', {
  x: -80,
  y: 80,
  scale: 0.8,
  repeat: -1,
  yoyo: true,
  duration: 10,
  ease: 'sine.inOut'
});

gsap.to('.orb-3', {
  x: 50,
  y: 100,
  scale: 1.1,
  repeat: -1,
  yoyo: true,
  duration: 7,
  ease: 'sine.inOut'
});

// ============================================
// 5. SCROLL INDICATOR
// ============================================
gsap.to('.scroll-wheel', {
  y: 10,
  repeat: -1,
  yoyo: true,
  duration: 0.8,
  ease: 'power1.inOut'
});

// Hide on scroll
ScrollTrigger.create({
  trigger: '.hero-section',
  start: 'bottom top',
  onEnter: () => {
    gsap.to('.scroll-indicator', {
      opacity: 0,
      duration: 0.3
    });
  },
  onLeaveBack: () => {
    gsap.to('.scroll-indicator', {
      opacity: 1,
      duration: 0.3
    });
  }
});

// ============================================
// 6. STACKING CARDS ANIMATION - ÉPICO
// ============================================
const initStackingCards = () => {
  const cards = gsap.utils.toArray('.stack-card');
  const stackingSection = document.querySelector('.stacking-section');
  
  if (!cards.length || !stackingSection) {
    console.log('⚠️ No se encontraron las cards o la sección');
    return;
  }

  console.log(`✅ ${cards.length} cards encontradas`);

  // Estado inicial: todas las cards ocultas excepto la primera
  cards.forEach((card, index) => {
    if (index > 0) {
      gsap.set(card, {
        y: 100 + (index * 20),
        opacity: 0,
        scale: 0.9,
        rotateX: -15,
        rotateY: gsap.utils.random(-5, 5),
        rotateZ: gsap.utils.random(-3, 3),
        transformOrigin: 'center center',
        zIndex: cards.length - index
      });
    } else {
      gsap.set(card, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        zIndex: cards.length
      });
    }
  });

  // Timeline principal controlado por scroll
  const mainTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.ssttt',
      start: 'top top',
      end: '+=400%',
      scrub: 1,
      pin: '.stacking-cards-wrapper',
      pinSpacing: true,
      markers: false, // Cambiar a true para debug
      anticipatePin: 1,
      pinType: 'fixed',
      onEnter: () => console.log('🎬 Entrando a stacking section'),
      onLeave: () => console.log('👋 Saliendo de stacking section'),
      onRefresh: (self) => {
        // Forzar centrado correcto en refresh
        const wrapper = document.querySelector('.stacking-cards-wrapper');
        if (wrapper) {
          wrapper.style.left = '50%';
          wrapper.style.top = '50%';
        }
      }
    }
  });

  cards.forEach((card, index) => {
    const cardShine = card.querySelector('.card-shine');
    const isLastCard = index === cards.length - 1;

    // Animación de entrada de cada card
    if (index > 0) {
      // Card anterior se hace blur y se escala
      mainTimeline.to(cards[index - 1], {
        scale: 0.95,
        filter: 'blur(8px)',
        opacity: 0.1,
        y: -20,
        duration: 1,
        ease: 'power2.inOut'
      }, index * 1.5);

      // Card nueva entra
      mainTimeline.to(card, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        duration: 1,
        ease: 'back.out(1.3)',
        onStart: () => {
          console.log(`🎴 Card ${index + 1} entrando`);
          // Efecto de brillo al entrar
          if (cardShine) {
            gsap.fromTo(cardShine, 
              {
                opacity: 0,
                x: -200,
                y: -200
              },
              {
                opacity: 1,
                x: 200,
                y: 200,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => {
                  gsap.to(cardShine, {
                    opacity: 0,
                    duration: 0.3
                  });
                }
              }
            );
          }
        }
      }, index * 1.5);
    }

    // Animación especial para la última card
    if (isLastCard) {
      // Fade out final de todas las cards
      mainTimeline.to(cards, {
        opacity: 0,
        scale: 0.8,
        y: -50,
        filter: 'blur(10px)',
        stagger: 0.05,
        duration: 1,
        ease: 'power2.in'
      }, (cards.length * 1.5) + 0.5);
    }
  });

  console.log('✨ Stacking cards animation initialized');
};

// Inicializar después de que el DOM esté listo
setTimeout(() => {
  if (document.querySelector('.stacking-section')) {
    initStackingCards();
  } else {
    console.log('❌ .stacking-section no encontrada');
  }
}, 100);

// ============================================
// 7. FEATURES CARDS REVEAL
// ============================================
gsap.utils.toArray('.feature-card').forEach((card, index) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      end: 'top 60%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 60,
    rotation: 5,
    duration: 0.8,
    delay: index * 0.1,
    ease: 'power3.out'
  });
});

// Feature card hover effect
document.querySelectorAll('.feature-card').forEach(card => {
  const iconBg = card.querySelector('.icon-bg');
  
  card.addEventListener('mouseenter', () => {
    gsap.to(iconBg, {
      scale: 15,
      opacity: 0.1,
      duration: 0.6,
      ease: 'power2.out'
    });
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(iconBg, {
      scale: 1,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out'
    });
  });
});

// ============================================
// 8. SECTION HEADERS REVEAL
// ============================================
gsap.utils.toArray('.reveal-line').forEach((line, index) => {
  gsap.from(line, {
    scrollTrigger: {
      trigger: line,
      start: 'top 85%'
    },
    opacity: 0,
    y: 50,
    duration: 1,
    delay: index * 0.2,
    ease: 'power3.out'
  });
});

// ============================================
// 9. TESTIMONIALS SLIDER - CORREGIDO
// ============================================
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.testimonial-dots .dot');
const prevBtn = document.querySelector('.testimonial-prev');
const nextBtn = document.querySelector('.testimonial-next');
let autoRotateInterval;

function showTestimonial(index) {
  // Validar índice
  if (index < 0) index = testimonials.length - 1;
  if (index >= testimonials.length) index = 0;
  
  currentTestimonial = index;
  
  // Actualizar testimonios
  testimonials.forEach((card, i) => {
    if (i === index) {
      card.classList.add('active');
      gsap.fromTo(card, 
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      );
    } else {
      card.classList.remove('active');
    }
  });
  
  // Actualizar dots
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Event listeners para botones
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    showTestimonial(currentTestimonial + 1);
    resetAutoRotate();
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    showTestimonial(currentTestimonial - 1);
    resetAutoRotate();
  });
}

// Event listeners para dots
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showTestimonial(index);
    resetAutoRotate();
  });
});

// Auto-rotate testimonials
function startAutoRotate() {
  autoRotateInterval = setInterval(() => {
    showTestimonial(currentTestimonial + 1);
  }, 5000);
}

function resetAutoRotate() {
  clearInterval(autoRotateInterval);
  startAutoRotate();
}

// Iniciar auto-rotate
startAutoRotate();

// Pausar auto-rotate cuando el mouse está sobre los testimonios
const testimonialSection = document.querySelector('.testimonial-section');
if (testimonialSection) {
  testimonialSection.addEventListener('mouseenter', () => {
    clearInterval(autoRotateInterval);
  });
  
  testimonialSection.addEventListener('mouseleave', () => {
    startAutoRotate();
  });
}

// ============================================
// 10. CTA SECTION PARALLAX
// ============================================
gsap.to('.cta-orb-1', {
  scrollTrigger: {
    trigger: '.final-cta',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1
  },
  y: -100,
  x: 50,
  scale: 1.3
});

gsap.to('.cta-orb-2', {
  scrollTrigger: {
    trigger: '.final-cta',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1
  },
  y: 100,
  x: -50,
  scale: 0.8
});

// ============================================
// 11. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(href);
    
    if (target) {
      const offset = 80;
      const targetPosition = target.offsetTop - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// 12. PARALLAX HERO IMAGE
// ============================================
gsap.to('.hero-main-image', {
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1
  },
  y: 150,
  scale: 1.1,
  ease: 'none'
});

// ============================================
// 13. STATUS CARD ANIMATION
// ============================================
gsap.from('.status-card', {
  scrollTrigger: {
    trigger: '.status-card',
    start: 'top 80%'
  },
  opacity: 0,
  y: 50,
  scale: 0.95,
  duration: 0.8,
  ease: 'back.out(1.2)'
});

// ============================================
// 14. STACKING SECTION HEADER ANIMATION
// ============================================
gsap.from('.stacking-section .section-header', {
  scrollTrigger: {
    trigger: '.stacking-section',
    start: 'top 80%',
    once: true
  },
  opacity: 0,
  y: 50,
  duration: 1,
  ease: 'power3.out'
});

// ============================================
// 15. PERFORMANCE OPTIMIZATIONS
// ============================================

// Refresh ScrollTrigger cuando las imágenes se cargan
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

// Resize handler optimizado
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});

console.log('🎨 UTP+Schedule - Stacking Cards Animation Loaded');