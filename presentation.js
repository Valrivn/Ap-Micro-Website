/**
 * presentation.js - Presentation Deck & View Orchestrator
 * Supports keyboard navigation, fullscreen, dual-mode (deck vs document scroll),
 * touch swipe, and modal dialogs.
 */

(function initPresentation() {
  const TOTAL_SLIDES = 5;
  let currentSlide = 1;
  let isDocumentMode = false;

  // DOM Elements
  const body = document.getElementById('app-body');
  const slides = document.querySelectorAll('.slide-section');
  const currentNumEl = document.getElementById('current-slide-num');
  const totalNumEl = document.getElementById('total-slide-num');
  const progressBar = document.getElementById('deck-progress-bar');
  const dots = document.querySelectorAll('.dot-btn');

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnViewToggle = document.getElementById('btn-view-toggle');
  const viewModeLabel = document.getElementById('view-mode-label');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnHelp = document.getElementById('btn-help');

  // Modals
  const graphModal = document.getElementById('graph-modal');
  const helpModal = document.getElementById('help-modal');
  const btnOpenGraph = document.getElementById('btn-open-original-graph');
  const btnCloseGraph = document.getElementById('btn-close-modal');
  const btnCloseHelp = document.getElementById('btn-close-help');

  function updateSlide(index) {
    if (index < 1) index = 1;
    if (index > TOTAL_SLIDES) index = TOTAL_SLIDES;
    currentSlide = index;

    // In deck mode, toggle active class
    slides.forEach((slide) => {
      const slideIndex = parseInt(slide.dataset.index, 10);
      if (slideIndex === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update numbers & progress
    if (currentNumEl) currentNumEl.textContent = currentSlide;
    if (progressBar) progressBar.style.width = `${(currentSlide / TOTAL_SLIDES) * 100}%`;

    // Update Dots
    dots.forEach((dot) => {
      const dotIndex = parseInt(dot.dataset.slide, 10);
      dot.classList.toggle('active', dotIndex === currentSlide);
    });

    // Button states
    if (btnPrev) btnPrev.style.opacity = currentSlide === 1 ? '0.4' : '1';
    if (btnNext) btnNext.style.opacity = currentSlide === TOTAL_SLIDES ? '0.4' : '1';

    // If in document mode, scroll smoothly to target slide
    if (isDocumentMode) {
      const targetSlide = document.getElementById(`slide-${currentSlide}`);
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  function nextSlide() {
    if (currentSlide < TOTAL_SLIDES) {
      updateSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      updateSlide(currentSlide - 1);
    }
  }

  function toggleViewMode() {
    isDocumentMode = !isDocumentMode;
    if (isDocumentMode) {
      body.classList.remove('deck-mode');
      body.classList.add('document-mode');
      if (viewModeLabel) viewModeLabel.textContent = 'Presentation Mode';
    } else {
      body.classList.remove('document-mode');
      body.classList.add('deck-mode');
      if (viewModeLabel) viewModeLabel.textContent = 'Document View';
      updateSlide(currentSlide);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // Event Listeners
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnViewToggle) btnViewToggle.addEventListener('click', toggleViewMode);
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);

  // Dot clicks
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.slide, 10);
      updateSlide(idx);
    });
  });

  // Modal Handlers
  if (btnOpenGraph && graphModal) {
    btnOpenGraph.addEventListener('click', () => {
      graphModal.style.display = 'flex';
    });
  }
  if (btnCloseGraph && graphModal) {
    btnCloseGraph.addEventListener('click', () => {
      graphModal.style.display = 'none';
    });
  }
  if (btnHelp && helpModal) {
    btnHelp.addEventListener('click', () => {
      helpModal.style.display = 'flex';
    });
  }
  if (btnCloseHelp && helpModal) {
    btnCloseHelp.addEventListener('click', () => {
      helpModal.style.display = 'none';
    });
  }

  // Close modals on clicking overlay background
  [graphModal, helpModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }
  });

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    // If modal open, Escape closes it
    if (e.key === 'Escape') {
      if (graphModal) graphModal.style.display = 'none';
      if (helpModal) helpModal.style.display = 'none';
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === 'd') {
      toggleViewMode();
    } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      if (helpModal) helpModal.style.display = 'flex';
    } else if (e.key >= '1' && e.key <= '5') {
      updateSlide(parseInt(e.key, 10));
    }
  });

  // Touch Swipe for Mobile & Tablets
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;

    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });

  // Initial State
  updateSlide(1);
})();
