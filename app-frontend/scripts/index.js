// ============================================
// INDEX.JS - Animaciones Awwwards Level
// Sin brillo neón, carrusel de testimonios corregido
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
// 2. CUSTOM CURSOR
// ============================================




// ============================================
// 4. ANIMATED COUNTER
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
// 5. FLOATING CARDS ANIMATION
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
// 6. GRADIENT ORBS ANIMATION
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
// 7. SCROLL INDICATOR
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
// 8. FEATURES CARDS REVEAL
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
// 9. SECTION HEADERS REVEAL
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
// 10. TESTIMONIALS SLIDER - CORREGIDO
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
// 11. CTA SECTION PARALLAX
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
// 12. SMOOTH SCROLL FOR ANCHOR LINKS
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
// 13. PARALLAX HERO IMAGE
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
// 14. STATUS CARD ANIMATION
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