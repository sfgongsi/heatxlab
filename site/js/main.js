/* ========================================
   HEATX Lab - Interactive Scripts
   ======================================== */

// ========== Carousel ==========
(function() {
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (!slides.length) return;

  let currentSlide = 0;
  let autoPlayTimer = null;
  const DEFAULT_DELAY = 5500;

  // Each slide plays for a fixed 5.5s. A slide may override its own duration
  // with data-duration="8000" (milliseconds) on the .carousel-slide element.
  function delayFor(index) {
    const slide = slides[index];
    const parsed = slide && slide.dataset ? parseInt(slide.dataset.duration, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 1000 ? parsed : DEFAULT_DELAY;
  }

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    if (dotsContainer) dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.carousel-dot');

  // --- Timing control: exactly ONE pending timer at any moment ---
  // Using a self-clearing setTimeout chain (instead of setInterval) guarantees
  // every slide gets its full duration and no timer can stack up (which used to
  // make the carousel run at double speed after touch/hover events).
  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();                  // never leave a second timer behind
    if (document.hidden) return;     // background tabs would throttle us
    autoPlayTimer = setTimeout(nextSlide, delayFor(currentSlide));
  }

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');

    startAutoPlay(); // restart once, from this slide's own duration
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Pause on hover
  const carouselSection = document.getElementById('carousel');
  if (carouselSection) {
    carouselSection.addEventListener('mouseenter', stopAutoPlay);
    carouselSection.addEventListener('mouseleave', startAutoPlay);
  }

  // Pause while the tab is in the background so timing stays predictable
  // when the visitor comes back.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoPlay();
    else startAutoPlay();
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  if (carouselSection) {
    carouselSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    carouselSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    });
  }

  startAutoPlay();
})();

// ========== Header scroll effect ==========
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// ========== Smooth scroll for anchor links ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ========== Scroll animation observer ==========
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.product-card, .feature-card, .why-card, .testimonial-card, .blog-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Stagger delay for grid items
document.querySelectorAll('.products-grid .product-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.1}s`;
});

document.querySelectorAll('.features-grid .feature-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.05}s`;
});

document.querySelectorAll('.blog-grid .blog-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.05}s`;
});

// ========== Mobile menu toggle ==========
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');

// Create overlay element
const mobileOverlay = document.createElement('div');
mobileOverlay.className = 'mobile-menu-overlay';
document.body.appendChild(mobileOverlay);

function closeMobileMenu() {
  if (navLinks) navLinks.classList.remove('mobile-open');
  if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
  mobileOverlay.classList.remove('active');
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    mobileMenuBtn.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
  });
}

// Close mobile menu when a nav link is clicked
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// Close mobile menu when clicking outside (on overlay)
mobileOverlay.addEventListener('click', closeMobileMenu);

// Close mobile menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

// ========== Language switcher ==========
(function() {
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!langDropdown.contains(e.target) && e.target !== langBtn) {
        langDropdown.classList.remove('open');
      }
    });
    langDropdown.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', () => {
        langDropdown.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        langBtn.querySelector('.lang-current').textContent = opt.dataset.code;
        langDropdown.classList.remove('open');
      });
    });
  }
})();

// ========== Initialize on load ==========
document.addEventListener('DOMContentLoaded', () => {
  highlightNav();
});

// Active nav link highlighting (homepage sections)
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.style.color = 'var(--primary)';
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNav);
