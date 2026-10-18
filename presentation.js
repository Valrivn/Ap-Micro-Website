/**
 * presentation.js - Presentation Deck & View Orchestrator
 * Supports 6 slides, keyboard navigation, fullscreen, dual-mode (deck vs document scroll),
 * in-place Canva tabs on Slide 2, full 7-slide Canva carousel gallery, and touch swipes.
 */

(function initPresentation() {
  const TOTAL_SLIDES = 6;
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
  const helpModal = document.getElementById('help-modal');
  const btnCloseHelp = document.getElementById('btn-close-help');

  const canvaGalleryModal = document.getElementById('canva-gallery-modal');
  const btnOpenCanvaGallery = document.getElementById('btn-open-canva-gallery');
  const btnCloseCanvaGallery = document.getElementById('btn-close-canva-gallery');
  const btnGalleryPrev = document.getElementById('btn-gallery-prev');
  const btnGalleryNext = document.getElementById('btn-gallery-next');
  const galleryImg = document.getElementById('gallery-img');
  const galleryCaption = document.getElementById('gallery-caption');
  const thumbBtns = document.querySelectorAll('.thumb-btn');

  let currentCanvaSlide = 1;
  const canvaSlideTitles = [
    'Slide 1: Title & Authors (Smoot-Hawley)',
    'Slide 2: Background (Hoover, 1920s Farm Crisis)',
    'Slide 3: Core Thesis Statement',
    'Slide 4: Domestic Market & Hand-drawn AP Micro Graph',
    'Slide 5: The Exporting Country (Swiss Watches & Cuban Sugar)',
    'Slide 6: Did It Work? (Banking & Agricultural Defaults)',
    'Slide 7: The Solution & Sources (FDR, RTAA & GATT)'
  ];

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

  function handleDocumentScroll() {
    if (!isDocumentMode || !progressBar) return;
    const scrollH = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollH > 0) {
      const pct = (window.scrollY / scrollH) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }
  }

  window.addEventListener('scroll', handleDocumentScroll, { passive: true });

  function toggleViewMode() {
    isDocumentMode = !isDocumentMode;
    if (isDocumentMode) {
      body.classList.remove('deck-mode');
      body.classList.add('document-mode');
      if (viewModeLabel) viewModeLabel.textContent = 'Presentation Mode';
      handleDocumentScroll();
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

  // Slide 2 Tab Switcher (Vector Model vs Canva Slide 4)
  const tabBtnVector = document.getElementById('tab-btn-vector');
  const tabBtnCanva = document.getElementById('tab-btn-canva');
  const paneVector = document.getElementById('pane-vector');
  const paneCanva = document.getElementById('pane-canva');

  if (tabBtnVector && tabBtnCanva && paneVector && paneCanva) {
    tabBtnVector.addEventListener('click', () => {
      tabBtnVector.classList.add('active');
      tabBtnCanva.classList.remove('active');
      paneVector.style.display = 'block';
      paneCanva.style.display = 'none';
    });

    tabBtnCanva.addEventListener('click', () => {
      tabBtnCanva.classList.add('active');
      tabBtnVector.classList.remove('active');
      paneCanva.style.display = 'block';
      paneVector.style.display = 'none';
    });
  }

  // Canva Gallery Carousel Logic
  function setCanvaGallerySlide(idx) {
    if (idx < 1) idx = 1;
    if (idx > 7) idx = 7;
    currentCanvaSlide = idx;

    if (galleryImg) {
      galleryImg.src = `assets/canva-slide-${currentCanvaSlide}.png`;
    }
    if (galleryCaption) {
      galleryCaption.textContent = canvaSlideTitles[currentCanvaSlide - 1];
    }

    thumbBtns.forEach((btn) => {
      const bIdx = parseInt(btn.dataset.idx, 10);
      btn.classList.toggle('active', bIdx === currentCanvaSlide);
    });
  }

  if (btnOpenCanvaGallery && canvaGalleryModal) {
    btnOpenCanvaGallery.addEventListener('click', () => {
      canvaGalleryModal.style.display = 'flex';
      setCanvaGallerySlide(currentCanvaSlide);
    });
  }

  if (btnCloseCanvaGallery && canvaGalleryModal) {
    btnCloseCanvaGallery.addEventListener('click', () => {
      canvaGalleryModal.style.display = 'none';
    });
  }

  if (btnGalleryPrev) {
    btnGalleryPrev.addEventListener('click', () => {
      setCanvaGallerySlide(currentCanvaSlide > 1 ? currentCanvaSlide - 1 : 7);
    });
  }

  if (btnGalleryNext) {
    btnGalleryNext.addEventListener('click', () => {
      setCanvaGallerySlide(currentCanvaSlide < 7 ? currentCanvaSlide + 1 : 1);
    });
  }

  thumbBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      setCanvaGallerySlide(idx);
    });
  });

  // Event Listeners for Nav Controls
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

  // Help Modal Handlers
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
  [helpModal, canvaGalleryModal].forEach((modal) => {
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
    // Escape closes modals
    if (e.key === 'Escape') {
      if (helpModal) helpModal.style.display = 'none';
      if (canvaGalleryModal) canvaGalleryModal.style.display = 'none';
      return;
    }

    // If Canva Gallery Modal is open, Left/Right arrow keys navigate the gallery
    const isGalleryOpen = canvaGalleryModal && canvaGalleryModal.style.display !== 'none';
    if (isGalleryOpen) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentCanvaSlide < canvaSlideTitles.length) {
          updateCanvaSlide(currentCanvaSlide + 1);
        }
        return;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentCanvaSlide > 1) {
          updateCanvaSlide(currentCanvaSlide - 1);
        }
        return;
      }
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
    } else if (e.key >= '1' && e.key <= '6') {
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
