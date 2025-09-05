/**
 * MODERN DARK PORTFOLIO - JAVASCRIPT
 * Karim Helal Portfolio 2025
 *
 * Features:
 * - Advanced animations and scroll effects
 * - GitHub API integration
 * - Performance optimized with throttling/debouncing
 * - Modern ES6+ JavaScript
 * - Accessibility support
 * - Mobile-first responsive interactions
 */

// ========================================================================
// UTILITY FUNCTIONS & HELPERS
// ========================================================================

// Modern DOM selectors
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Performance optimization utilities
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Animation frame utilities
const raf = (callback) => {
  return requestAnimationFrame(callback);
};

const rafThrottle = (callback) => {
  let requestId = null;
  return (...args) => {
    if (requestId === null) {
      requestId = raf(() => {
        callback(...args);
        requestId = null;
      });
    }
  };
};

// Utility functions
const lerp = (start, end, factor) => start + (end - start) * factor;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const map = (value, inMin, inMax, outMin, outMax) =>
  ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

// Device detection
const isMobile = () => window.innerWidth <= 768;
const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
const isDesktop = () => window.innerWidth > 1024;
const isTouchDevice = () =>
  "ontouchstart" in window || navigator.maxTouchPoints > 0;

// ========================================================================
// GLOBAL STATE MANAGEMENT
// ========================================================================

const App = {
  state: {
    isLoading: true,
    currentSection: "hero",
    scrollY: 0,
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth,
    isMenuOpen: false,
    prefersReducedMotion: false,
    theme: "dark",
  },

  elements: {
    // Core elements
    body: $("body"),
    header: $(".header"),
    loadingScreen: $("#loading-screen"),
    navToggle: $(".nav__toggle"),
    navMenu: $(".nav__menu"),
    menuBackdrop: $(".menu-backdrop"),

    // Interactive elements
    navLinks: $$(".nav__link"),
    buttons: $$(".btn"),
    projectCards: $$(".project-card"),
    skillItems: $$(".skill-item"),
    contactForm: $("#contact-form"),

    // Animation elements
    revealElements: $$(".reveal"),
    particles: $$(".particle"),
    floatingElements: $$(".floating-element"),
    cursorFollower: $(".cursor-follower"),
  },

  animations: {
    typewriter: null,
    particles: [],
    scrollAnimations: new Map(),
    activeAnimations: new Set(),
  },

  // GitHub API cache
  github: {
    cache: new Map(),
    lastFetch: 0,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
  },
};

// ========================================================================
// INITIALIZATION & SETUP
// ========================================================================

// Initialize application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Karim Helal Portfolio initializing...");

  // Initialize core systems
  initializeApp();

  console.log("✅ Portfolio loaded successfully!");
});

async function initializeApp() {
  try {
    // Setup user preferences
    setupUserPreferences();

    // Initialize core components
    await initLoader();
    initNavigation();
    initScrollSystem();
    initAnimations();
    initInteractions();

    // Initialize content systems
    initTypewriter();
    initGitHubIntegration();
    initContactForm();

    // Initialize visual effects
    initCursorFollower();
    initParticleSystem();

    // Initialize utilities
    initKeyboardNavigation();
    initPerformanceMonitoring();
    updateCurrentYear();

    // Mark app as ready
    App.state.isLoading = false;
  } catch (error) {
    console.error("Failed to initialize app:", error);
    handleInitializationError(error);
  }
}

function setupUserPreferences() {
  // Check for reduced motion preference
  App.state.prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Listen for preference changes
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", (e) => {
      App.state.prefersReducedMotion = e.matches;
      updateAnimationPreferences();
    });

  // Setup focus-visible polyfill
  document.addEventListener("keydown", () => {
    App.elements.body.classList.add("user-is-tabbing");
  });

  document.addEventListener("mousedown", () => {
    App.elements.body.classList.remove("user-is-tabbing");
  });
}

function updateAnimationPreferences() {
  if (App.state.prefersReducedMotion) {
    // Disable complex animations
    App.elements.body.style.setProperty("--duration-normal", "0.01ms");
    App.elements.body.style.setProperty("--duration-slow", "0.01ms");

    // Stop particle animations
    App.animations.particles.forEach((particle) => particle.stop());
  }
}

function handleInitializationError(error) {
  // Graceful degradation
  console.error("Portfolio initialization failed:", error);

  // Hide loading screen anyway
  if (App.elements.loadingScreen) {
    App.elements.loadingScreen.classList.add("hidden");
  }

  // Enable basic functionality
  enableBasicFunctionality();
}

function enableBasicFunctionality() {
  // Basic navigation
  App.elements.navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = $(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

// ========================================================================
// LOADING SCREEN
// ========================================================================

async function initLoader() {
  if (!App.elements.loadingScreen) return;

  // Simulate loading time for better UX
  const minLoadTime = 1500;
  const startTime = Date.now();

  // Wait for all critical resources
  await Promise.all([
    waitForFonts(),
    waitForImages(),
    new Promise((resolve) => setTimeout(resolve, minLoadTime)),
  ]);

  const loadTime = Date.now() - startTime;
  const remainingTime = Math.max(0, minLoadTime - loadTime);

  // Ensure minimum load time for smooth transition
  setTimeout(() => {
    hideLoader();
  }, remainingTime);
}

function waitForFonts() {
  return new Promise((resolve) => {
    if ("fonts" in document) {
      document.fonts.ready.then(resolve);
    } else {
      // Fallback for older browsers
      setTimeout(resolve, 100);
    }
  });
}

function waitForImages() {
  const images = $$('img[loading="eager"], img:not([loading])');
  const promises = Array.from(images).map((img) => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.addEventListener("load", resolve);
        img.addEventListener("error", resolve);
      }
    });
  });

  return Promise.all(promises);
}

function hideLoader() {
  if (!App.elements.loadingScreen) return;

  App.elements.loadingScreen.classList.add("hidden");

  // Remove from DOM after animation
  setTimeout(() => {
    if (App.elements.loadingScreen && App.elements.loadingScreen.parentNode) {
      App.elements.loadingScreen.parentNode.removeChild(
        App.elements.loadingScreen
      );
    }
  }, 500);

  // Trigger entrance animations
  setTimeout(() => {
    triggerEntranceAnimations();
  }, 200);
}

function triggerEntranceAnimations() {
  // Animate hero elements
  const heroElements = $$("#hero .animate-fadeInUp");
  heroElements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 150);
  });

  // Start counter animations
  startCounterAnimations();
}

// ========================================================================
// NAVIGATION SYSTEM
// ========================================================================

function initNavigation() {
  // Mobile menu toggle
  if (App.elements.navToggle) {
    App.elements.navToggle.addEventListener("click", toggleMobileMenu);
  }

  // Menu backdrop click
  if (App.elements.menuBackdrop) {
    App.elements.menuBackdrop.addEventListener("click", closeMobileMenu);
  }

  // Navigation links
  App.elements.navLinks.forEach((link) => {
    link.addEventListener("click", handleNavLinkClick);
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && App.state.isMenuOpen) {
      closeMobileMenu();
    }
  });

  // Setup scroll spy
  initScrollSpy();

  // Setup header scroll effects
  initHeaderScrollEffects();
}

function toggleMobileMenu() {
  App.state.isMenuOpen = !App.state.isMenuOpen;

  App.elements.navToggle.setAttribute("aria-expanded", App.state.isMenuOpen);
  App.elements.navMenu.classList.toggle("open", App.state.isMenuOpen);
  App.elements.menuBackdrop.classList.toggle("open", App.state.isMenuOpen);

  // Prevent body scroll when menu is open
  document.body.style.overflow = App.state.isMenuOpen ? "hidden" : "";

  // Animate menu items
  if (App.state.isMenuOpen) {
    animateMenuItems();
  }
}

function closeMobileMenu() {
  App.state.isMenuOpen = false;

  App.elements.navToggle.setAttribute("aria-expanded", "false");
  App.elements.navMenu.classList.remove("open");
  App.elements.menuBackdrop.classList.remove("open");
  document.body.style.overflow = "";
}

function animateMenuItems() {
  const menuItems = App.elements.navMenu.querySelectorAll(".nav__link");
  menuItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
    item.classList.add("animate-slideInLeft");
  });
}

function handleNavLinkClick(e) {
  const href = e.target.getAttribute("href");

  if (href && href.startsWith("#")) {
    e.preventDefault();

    const targetId = href.slice(1);
    const target = $(`#${targetId}`);

    if (target) {
      smoothScrollTo(target);
      closeMobileMenu();
    }
  }
}

function smoothScrollTo(target) {
  const headerHeight = App.elements.header.offsetHeight;
  const targetPosition = target.offsetTop - headerHeight - 20;

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });
}

// ========================================================================
// SCROLL SYSTEM
// ========================================================================

function initScrollSystem() {
  // Setup scroll event listener with throttling
  const handleScroll = rafThrottle(() => {
    App.state.scrollY = window.pageYOffset;
    updateScrollAnimations();
  });

  window.addEventListener("scroll", handleScroll, { passive: true });

  // Setup resize handler
  const handleResize = debounce(() => {
    App.state.windowHeight = window.innerHeight;
    App.state.windowWidth = window.innerWidth;
    updateScrollAnimations();
  }, 250);

  window.addEventListener("resize", handleResize);

  // Initialize scroll reveal
  initScrollReveal();
}

function initScrollSpy() {
  const sections = $$("main section[id]");
  const navLinks = new Map();

  // Build navigation links map
  App.elements.navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      const sectionId = href.slice(1);
      navLinks.set(sectionId, link);
    }
  });

  // Setup intersection observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.getAttribute("id");
        const link = navLinks.get(sectionId);

        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          // Remove active from all links
          navLinks.forEach((navLink) => navLink.classList.remove("active"));

          // Add active to current link
          if (link) {
            link.classList.add("active");
            App.state.currentSection = sectionId;
          }
        }
      });
    },
    {
      threshold: [0.3, 0.5, 0.7],
      rootMargin: "-20% 0px -70% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function initHeaderScrollEffects() {
  const updateHeader = rafThrottle(() => {
    if (App.state.scrollY > 100) {
      App.elements.header.classList.add("scrolled");
    } else {
      App.elements.header.classList.remove("scrolled");
    }
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
}

function initScrollReveal() {
  if (!window.IntersectionObserver) {
    // Fallback for older browsers
    App.elements.revealElements.forEach((el) => {
      el.classList.add("revealed");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  App.elements.revealElements.forEach((el) => observer.observe(el));
}

function revealElement(element) {
  element.classList.add("revealed");

  // Special handling for different reveal types
  if (element.classList.contains("skill-category")) {
    animateSkillBars(element);
  }

  if (element.classList.contains("timeline-item")) {
    animateTimelineItem(element);
  }
}

function updateScrollAnimations() {
  // Update parallax effects
  updateParallaxEffects();

  // Update scroll progress
  updateScrollProgress();
}

function updateParallaxEffects() {
  if (App.state.prefersReducedMotion) return;

  const scrollRatio = App.state.scrollY / App.state.windowHeight;

  // Animate floating elements
  App.elements.floatingElements.forEach((element, index) => {
    const speed = (index + 1) * 0.1;
    const yPos = Math.sin(scrollRatio * Math.PI + index) * 20;
    const rotation = scrollRatio * 90 + index * 45;

    element.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
  });

  // Animate particles
  App.elements.particles.forEach((particle, index) => {
    const speed = (index + 1) * 0.05;
    const yPos = -scrollRatio * 100 * speed;

    particle.style.transform = `translateY(${yPos}px)`;
  });
}

function updateScrollProgress() {
  const scrollHeight =
    document.documentElement.scrollHeight - App.state.windowHeight;
  const progress = clamp(App.state.scrollY / scrollHeight, 0, 1);

  // Update any progress indicators
  const progressBars = $$(".scroll-progress");
  progressBars.forEach((bar) => {
    bar.style.transform = `scaleX(${progress})`;
  });
}

// ========================================================================
// ANIMATIONS SYSTEM
// ========================================================================

function initAnimations() {
  // Setup global animation observer
  setupAnimationObserver();

  // Initialize specific animations
  if (!App.state.prefersReducedMotion) {
    initFloatingAnimations();
    initGlowAnimations();
  }
}

function setupAnimationObserver() {
  // Track all active animations for performance
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.classList) {
          trackAnimations(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function trackAnimations(element) {
  const animatedElements = element.matches('[class*="animate-"]')
    ? [element]
    : Array.from(element.querySelectorAll('[class*="animate-"]'));

  animatedElements.forEach((el) => {
    App.animations.activeAnimations.add(el);

    // Clean up when animation ends
    el.addEventListener(
      "animationend",
      () => {
        App.animations.activeAnimations.delete(el);
      },
      { once: true }
    );
  });
}

function initFloatingAnimations() {
  App.elements.floatingElements.forEach((element, index) => {
    const animation = element.animate(
      [
        { transform: "translateY(0px) rotate(0deg)" },
        { transform: "translateY(-20px) rotate(180deg)" },
        { transform: "translateY(0px) rotate(360deg)" },
      ],
      {
        duration: 6000 + index * 1000,
        iterations: Infinity,
        easing: "ease-in-out",
      }
    );

    App.animations.particles.push(animation);
  });
}

function initGlowAnimations() {
  const glowElements = $$(".btn--primary, .logo");
  glowElements.forEach((element) => {
    element.style.animation = "glow 2s ease-in-out infinite alternate";
  });
}

// ========================================================================
// TYPEWRITER EFFECT
// ========================================================================

function initTypewriter() {
  const typewriterElement = $(".typewriter");
  if (!typewriterElement) return;

  const words = typewriterElement.getAttribute("data-words")?.split(",") || [
    "Full-Stack .NET Developer",
    "Data Scientist",
    "Problem Solver",
    "CS Student",
  ];

  App.animations.typewriter = new TypewriterEffect(typewriterElement, words);
  App.animations.typewriter.start();
}

class TypewriterEffect {
  constructor(element, words) {
    this.element = element;
    this.words = words.map((word) => word.trim());
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.type();
  }

  stop() {
    this.isRunning = false;
  }

  type() {
    if (!this.isRunning) return;

    const currentWord = this.words[this.currentWordIndex];

    if (this.isDeleting) {
      this.currentCharIndex--;
      this.element.textContent = currentWord.substring(
        0,
        this.currentCharIndex
      );
    } else {
      this.currentCharIndex++;
      this.element.textContent = currentWord.substring(
        0,
        this.currentCharIndex
      );
    }

    let typeSpeed = this.isDeleting ? 75 : 150;

    // Add randomness for natural feel
    typeSpeed += Math.random() * 50;

    if (!this.isDeleting && this.currentCharIndex === currentWord.length) {
      typeSpeed = 2000; // Pause at end
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
      typeSpeed = 500; // Pause before next word
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// ========================================================================
// COUNTER ANIMATIONS
// ========================================================================

function startCounterAnimations() {
  const counters = $$("[data-count]");
  counters.forEach((counter) => {
    animateCounter(counter);
  });
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute("data-count"));
  const duration = 2000;
  const start = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(target * easeOut);

    element.textContent = current;

    if (progress < 1) {
      raf(updateCounter);
    } else {
      element.textContent = target;
    }
  }

  raf(updateCounter);
}

// ========================================================================
// SKILL BARS ANIMATION
// ========================================================================

function animateSkillBars(container) {
  const skillItems = container.querySelectorAll(".skill-item");

  skillItems.forEach((item, index) => {
    const skillLevel = item.querySelector(".skill-level");
    if (!skillLevel) return;

    const level = skillLevel.getAttribute("data-level") || "0";

    setTimeout(() => {
      skillLevel.style.setProperty("--level", `${level}%`);

      // Add number animation
      const numberElement = item.querySelector(".skill-percentage");
      if (numberElement) {
        animateSkillPercentage(numberElement, parseInt(level));
      }
    }, index * 200);
  });
}

function animateSkillPercentage(element, target) {
  const duration = 1500;
  const start = performance.now();

  function updatePercentage(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(target * easeOut);

    element.textContent = `${current}%`;

    if (progress < 1) {
      raf(updatePercentage);
    }
  }

  raf(updatePercentage);
}

// ========================================================================
// GITHUB INTEGRATION
// ========================================================================

async function initGitHubIntegration() {
  // GitHub repositories to fetch
  const repositories = [
    "Fifa-World-Cup-Qatar-2022",
    "Adidas",
    "Portfolio",
    "datasets",
    "E-learning-platform",
  ];

  try {
    const repoData = await fetchGitHubRepos(repositories);
    updateProjectStats(repoData);
    updateGitHubStats(repoData);
  } catch (error) {
    console.warn("GitHub API unavailable:", error);
    // Graceful fallback - hide stats or show static data
    hideGitHubStats();
  }
}

async function fetchGitHubRepos(repositories) {
  const username = "karimhelal";
  const now = Date.now();

  // Check cache
  if (now - App.github.lastFetch < App.github.cacheDuration) {
    const cached = App.github.cache.get("repositories");
    if (cached) return cached;
  }

  const promises = repositories.map((repo) =>
    fetch(`https://api.github.com/repos/${username}/${repo}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        console.warn(`Failed to fetch ${repo}:`, error);
        return null;
      })
  );

  const results = await Promise.all(promises);
  const validResults = results.filter((result) => result !== null);

  // Cache results
  App.github.cache.set("repositories", validResults);
  App.github.lastFetch = now;

  return validResults;
}

function updateProjectStats(repoData) {
  const projectCards = $$(".project-card");

  repoData.forEach((repo, index) => {
    if (!repo || index >= projectCards.length) return;

    const card = projectCards[index];
    const starsElement = card.querySelector(`#${getRepoSlug(repo.name)}-stars`);
    const forksElement = card.querySelector(`#${getRepoSlug(repo.name)}-forks`);

    if (starsElement) {
      animateStatNumber(starsElement, repo.stargazers_count || 0);
    }

    if (forksElement) {
      animateStatNumber(forksElement, repo.forks_count || 0);
    }

    // Add last updated info
    addLastUpdatedInfo(card, repo.updated_at);
  });
}

function updateGitHubStats(repoData) {
  const totalStars = repoData.reduce(
    (sum, repo) => sum + (repo.stargazers_count || 0),
    0
  );
  const totalForks = repoData.reduce(
    (sum, repo) => sum + (repo.forks_count || 0),
    0
  );

  // Update global stats if elements exist
  const statsContainer = $(".github-stats");
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat">
        <span class="stat-number">${totalStars}</span>
        <span class="stat-label">Total Stars</span>
      </div>
      <div class="stat">
        <span class="stat-number">${totalForks}</span>
        <span class="stat-label">Total Forks</span>
      </div>
      <div class="stat">
        <span class="stat-number">${repoData.length}</span>
        <span class="stat-label">Public Repos</span>
      </div>
    `;
  }
}

function getRepoSlug(repoName) {
  return repoName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function animateStatNumber(element, target) {
  const duration = 1000;
  const start = performance.now();

  function updateStat(currentTime) {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(target * easeOut);

    element.textContent = current;

    if (progress < 1) {
      raf(updateStat);
    }
  }

  raf(updateStat);
}

function addLastUpdatedInfo(card, updatedAt) {
  if (!updatedAt) return;

  const date = new Date(updatedAt);
  const timeAgo = getTimeAgo(date);

  const existingInfo = card.querySelector(".last-updated");
  if (existingInfo) return;

  const infoElement = document.createElement("div");
  infoElement.className = "last-updated";
  infoElement.innerHTML = `<small>Updated ${timeAgo}</small>`;

  const projectContent = card.querySelector(".project-content");
  if (projectContent) {
    projectContent.appendChild(infoElement);
  }
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 30) return `${diffInDays} days ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

function hideGitHubStats() {
  const statElements = $$('[id$="-stars"], [id$="-forks"]');
  statElements.forEach((element) => {
    element.textContent = "-";
  });
}

// ========================================================================
// CONTACT FORM
// ========================================================================

function initContactForm() {
  if (!App.elements.contactForm) return;

  // Setup form validation
  setupFormValidation();

  // Setup character counter
  setupCharacterCounter();

  // Setup form submission
  App.elements.contactForm.addEventListener("submit", handleFormSubmission);

  // Setup floating labels
  setupFloatingLabels();
}

function setupFormValidation() {
  const inputs = App.elements.contactForm.querySelectorAll(
    "input, textarea, select"
  );

  inputs.forEach((input) => {
    // Real-time validation
    input.addEventListener("input", () => validateField(input));
    input.addEventListener("blur", () => validateField(input));

    // Enhanced accessibility
    input.addEventListener("invalid", (e) => {
      e.preventDefault();
      showFieldError(input, input.validationMessage);
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const isRequired = field.hasAttribute("required");
  let errorMessage = "";

  // Clear previous errors
  clearFieldError(field);

  // Required field validation
  if (isRequired && !value) {
    errorMessage = `${getFieldLabel(field)} is required`;
  }

  // Type-specific validation
  else if (value) {
    switch (type) {
      case "email":
        if (!isValidEmail(value)) {
          errorMessage = "Please enter a valid email address";
        }
        break;

      case "text":
        if (field.name === "name" && value.length < 2) {
          errorMessage = "Name must be at least 2 characters";
        }
        break;

      default:
        if (field.tagName === "TEXTAREA") {
          const minLength = field.getAttribute("minlength") || 20;
          if (value.length < minLength) {
            errorMessage = `Message must be at least ${minLength} characters`;
          }
        }
    }
  }

  if (errorMessage) {
    showFieldError(field, errorMessage);
    return false;
  }

  showFieldSuccess(field);
  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getFieldLabel(field) {
  const label = App.elements.contactForm.querySelector(
    `label[for="${field.id}"]`
  );
  return label ? label.textContent : field.name;
}

function showFieldError(field, message) {
  const errorElement = field.parentElement.querySelector(".form-error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }

  field.classList.add("error");
  field.setAttribute("aria-invalid", "true");
}

function clearFieldError(field) {
  const errorElement = field.parentElement.querySelector(".form-error");
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.remove("show");
  }

  field.classList.remove("error", "success");
  field.removeAttribute("aria-invalid");
}

function showFieldSuccess(field) {
  field.classList.add("success");
  field.setAttribute("aria-invalid", "false");
}

function setupCharacterCounter() {
  const messageField = App.elements.contactForm.querySelector("#message");
  const charCountElement =
    App.elements.contactForm.querySelector(".char-count");

  if (messageField && charCountElement) {
    messageField.addEventListener("input", () => {
      const count = messageField.value.length;
      const maxLength = 500;

      charCountElement.textContent = count;

      if (count > maxLength * 0.9) {
        charCountElement.style.color = "var(--color-warning)";
      } else {
        charCountElement.style.color = "var(--color-text-tertiary)";
      }
    });
  }
}

function setupFloatingLabels() {
  const formGroups = App.elements.contactForm.querySelectorAll(".form-group");

  formGroups.forEach((group) => {
    const input = group.querySelector("input, textarea, select");
    const label = group.querySelector(".form-label");

    if (!input || !label) return;

    // Check initial state
    updateLabelState(input, label);

    // Handle focus/blur events
    input.addEventListener("focus", () => {
      label.classList.add("focused");
    });

    input.addEventListener("blur", () => {
      updateLabelState(input, label);
    });

    input.addEventListener("input", () => {
      updateLabelState(input, label);
    });
  });
}

function updateLabelState(input, label) {
  if (input.value.trim() || input === document.activeElement) {
    label.classList.add("focused");
  } else {
    label.classList.remove("focused");
  }
}

async function handleFormSubmission(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Validate all fields
  const inputs = form.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );
  let isValid = true;

  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  if (!isValid) {
    showFormError("Please correct the errors above");
    return;
  }

  // Show loading state
  setSubmitButtonState(submitBtn, "loading");

  try {
    // Simulate form submission (replace with actual endpoint)
    await submitFormData(data);

    // Show success state
    setSubmitButtonState(submitBtn, "success");
    showFormSuccess("Message sent successfully!");

    // Reset form after delay
    setTimeout(() => {
      form.reset();
      setSubmitButtonState(submitBtn, "default");
      clearAllFieldErrors(form);
    }, 3000);
  } catch (error) {
    console.error("Form submission failed:", error);
    setSubmitButtonState(submitBtn, "error");
    showFormError("Failed to send message. Please try again.");

    setTimeout(() => {
      setSubmitButtonState(submitBtn, "default");
    }, 3000);
  }
}

async function submitFormData(data) {
  // Create mailto link for now (replace with actual form handler)
  const { name, email, subject, message } = data;
  const emailSubject = encodeURIComponent(
    `Portfolio Contact: ${subject || "General Inquiry"}`
  );
  const emailBody = encodeURIComponent(
    `
Hi Karim,

Name: ${name}
Email: ${email}

Message:
${message}

Best regards,
${name}
  `.trim()
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Open email client
  window.location.href = `mailto:karimhelalkh110@gmail.com?subject=${emailSubject}&body=${emailBody}`;
}

function setSubmitButtonState(button, state) {
  const textElement = button.querySelector(".btn-text");
  const loadingElement = button.querySelector(".btn-loading");

  button.className = button.className.replace(
    /\b(loading|success|error)\b/g,
    ""
  );

  switch (state) {
    case "loading":
      button.classList.add("loading");
      button.disabled = true;
      if (textElement) textElement.style.display = "none";
      if (loadingElement) loadingElement.style.display = "inline-flex";
      break;

    case "success":
      button.classList.add("success");
      button.disabled = true;
      if (textElement) {
        textElement.textContent = "Message Sent!";
        textElement.style.display = "inline";
      }
      if (loadingElement) loadingElement.style.display = "none";
      break;

    case "error":
      button.classList.add("error");
      button.disabled = false;
      if (textElement) {
        textElement.textContent = "Try Again";
        textElement.style.display = "inline";
      }
      if (loadingElement) loadingElement.style.display = "none";
      break;

    default:
      button.disabled = false;
      if (textElement) {
        textElement.textContent = "Send Message";
        textElement.style.display = "inline";
      }
      if (loadingElement) loadingElement.style.display = "none";
  }
}

function showFormError(message) {
  showFormMessage(message, "error");
}

function showFormSuccess(message) {
  showFormMessage(message, "success");
}

function showFormMessage(message, type) {
  // Remove existing messages
  const existingMessage =
    App.elements.contactForm.querySelector(".form-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageElement = document.createElement("div");
  messageElement.className = `form-message form-message--${type}`;
  messageElement.textContent = message;
  messageElement.setAttribute("role", type === "error" ? "alert" : "status");

  // Insert message
  const formActions = App.elements.contactForm.querySelector(".form-actions");
  formActions.insertBefore(messageElement, formActions.firstChild);

  // Auto-remove after delay
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 5000);
}

function clearAllFieldErrors(form) {
  const fields = form.querySelectorAll("input, textarea, select");
  fields.forEach((field) => clearFieldError(field));
}

// ========================================================================
// PROJECT FILTERING
// ========================================================================

function initProjectFiltering() {
  const filterButtons = $$(".filter-btn");
  const projectCards = $$(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Filter projects
      filterProjects(projectCards, filter);
    });
  });
}

function filterProjects(projects, filter) {
  projects.forEach((project, index) => {
    const category = project.getAttribute("data-category");
    const shouldShow = filter === "all" || category === filter;

    if (shouldShow) {
      project.style.display = "block";
      setTimeout(() => {
        project.style.opacity = "1";
        project.style.transform = "translateY(0)";
      }, index * 100);
    } else {
      project.style.opacity = "0";
      project.style.transform = "translateY(20px)";
      setTimeout(() => {
        project.style.display = "none";
      }, 300);
    }
  });
}

// ========================================================================
// INTERACTIVE ELEMENTS
// ========================================================================

function initInteractions() {
  // Initialize project filtering
  initProjectFiltering();

  // Setup hover effects
  setupHoverEffects();

  // Setup click effects
  setupClickEffects();

  // Setup intersection animations
  setupIntersectionAnimations();
}

function setupHoverEffects() {
  // Card hover effects
  const cards = $$(".project-card, .testimonial-card, .blog-card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      if (!isTouchDevice()) {
        card.style.transform = "translateY(-8px)";
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  // Button hover effects
  App.elements.buttons.forEach((button) => {
    button.addEventListener("mouseenter", () => {
      if (!isTouchDevice()) {
        button.style.transform = "translateY(-2px)";
      }
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
    });
  });
}

function setupClickEffects() {
  // Add ripple effect to buttons
  App.elements.buttons.forEach((button) => {
    button.addEventListener("click", createRippleEffect);
  });
}

function createRippleEffect(e) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  `;

  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);

  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
}

function setupIntersectionAnimations() {
  // Timeline animations
  const timelineItems = $$(".timeline-item");
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateTimelineItem(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  timelineItems.forEach((item) => timelineObserver.observe(item));
}

function animateTimelineItem(item) {
  item.classList.add("animate-slideInLeft");

  // Animate timeline content with delay
  const content = item.querySelector(".timeline-content");
  if (content) {
    setTimeout(() => {
      content.classList.add("animate-fadeInUp");
    }, 200);
  }
}

// ========================================================================
// CURSOR FOLLOWER (Desktop Only)
// ========================================================================

function initCursorFollower() {
  if (!App.elements.cursorFollower || isMobile() || isTouchDevice()) {
    if (App.elements.cursorFollower) {
      App.elements.cursorFollower.style.display = "none";
    }
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  // Track mouse movement
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor following
  function updateCursor() {
    cursorX = lerp(cursorX, mouseX, 0.1);
    cursorY = lerp(cursorY, mouseY, 0.1);

    App.elements.cursorFollower.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

    raf(updateCursor);
  }

  updateCursor();

  // Cursor states for interactive elements
  const interactiveElements = $$("a, button, .project-card, .skill-item");
  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      App.elements.cursorFollower.classList.add("hover");
    });

    element.addEventListener("mouseleave", () => {
      App.elements.cursorFollower.classList.remove("hover");
    });
  });
}

// ========================================================================
// PARTICLE SYSTEM
// ========================================================================

function initParticleSystem() {
  if (App.state.prefersReducedMotion || isMobile()) return;

  const heroSection = $("#hero");
  if (!heroSection) return;

  // Create additional particles dynamically
  createFloatingParticles(heroSection);
}

function createFloatingParticles(container) {
  const particleCount = isMobile() ? 3 : 5;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 8}s;
      animation-duration: ${8 + Math.random() * 4}s;
    `;

    const particlesContainer = container.querySelector(".hero__particles");
    if (particlesContainer) {
      particlesContainer.appendChild(particle);
    }
  }
}

// ========================================================================
// KEYBOARD NAVIGATION
// ========================================================================

function initKeyboardNavigation() {
  // Enhanced keyboard navigation
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "Escape":
        if (App.state.isMenuOpen) {
          closeMobileMenu();
        }
        break;

      case "Tab":
        // Add visual focus indicators
        App.elements.body.classList.add("user-is-tabbing");
        break;

      case " ":
      case "Enter":
        // Enhanced button activation
        if (e.target.classList.contains("btn")) {
          e.target.click();
        }
        break;
    }
  });

  // Remove tab focus class on mouse interaction
  document.addEventListener("mousedown", () => {
    App.elements.body.classList.remove("user-is-tabbing");
  });
}

// ========================================================================
// PERFORMANCE MONITORING
// ========================================================================

function initPerformanceMonitoring() {
  // Performance metrics
  const performanceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === "measure") {
        console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
      }
    });
  });

  if (window.PerformanceObserver) {
    performanceObserver.observe({ entryTypes: ["measure", "navigation"] });
  }

  // Monitor animation performance
  let frameCount = 0;
  let lastTime = performance.now();

  function monitorFPS() {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

      // Warn if FPS drops below 30
      if (fps < 30 && App.animations.activeAnimations.size > 0) {
        console.warn(
          `Low FPS detected: ${fps}fps with ${App.animations.activeAnimations.size} active animations`
        );
      }

      frameCount = 0;
      lastTime = currentTime;
    }

    raf(monitorFPS);
  }

  // Only monitor in development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    monitorFPS();
  }
}

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

function updateCurrentYear() {
  const yearElement = $("#current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function initCodeAnimation() {
  const codeElement = $("#animated-code");
  if (!codeElement) return;

  const codeSnippet = `var me = new Person()
{
    Name = "Karim Helal",
    Role = "Computer Science Student",
    University = "Damietta University",
    Passion = "Backend Development",
    Skills = new[] { "C#", ".NET", "SQL", "Machine Learning" },
    Dream = "To become a professional .NET Backend Developer
    with AI skills"
};

me.Introduce();
`;

  typeCode(codeElement, codeSnippet);
}

function typeCode(element, code) {
  let index = 0;
  const speed = 50;

  function type() {
    if (index < code.length) {
      element.textContent = code.slice(0, index + 1);
      index++;
      setTimeout(type, speed);
    }
  }

  // Start typing after hero animations
  setTimeout(type, 2000);
}

// ========================================================================
// ERROR HANDLING & FALLBACKS
// ========================================================================

// Global error handler
window.addEventListener("error", (e) => {
  console.error("Portfolio error:", e.error);

  // Graceful degradation
  if (e.error && e.error.message.includes("animation")) {
    // Disable animations on error
    App.state.prefersReducedMotion = true;
    updateAnimationPreferences();
  }
});

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);

  // Handle specific promise rejections
  if (e.reason && e.reason.message.includes("GitHub")) {
    hideGitHubStats();
  }
});

// ========================================================================
// SERVICE WORKER REGISTRATION
// ========================================================================

if ("serviceWorker" in navigator && window.location.protocol === "https:") {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully:", registration);
    } catch (error) {
      console.log("Service Worker registration failed:", error);
    }
  });
}

// ========================================================================
// ANALYTICS INTEGRATION
// ========================================================================

function initAnalytics() {
  // Google Analytics 4 integration
  if (typeof gtag !== "undefined") {
    // Track page view
    gtag("config", "GA_MEASUREMENT_ID", {
      page_title: document.title,
      page_location: window.location.href,
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener(
      "scroll",
      throttle(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
            100
        );

        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
          maxScroll = scrollPercent;
          gtag("event", "scroll", {
            event_category: "engagement",
            event_label: `${scrollPercent}%`,
          });
        }
      }, 1000)
    );

    // Track section views
    const sections = $$("section[id]");
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            gtag("event", "section_view", {
              event_category: "navigation",
              event_label: entry.target.id,
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }
}

// Initialize analytics in production
if (
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  initAnalytics();
}

// ========================================================================
// EXPORT FOR TESTING (if needed)
// ========================================================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    App,
    initializeApp,
    TypewriterEffect,
    animateCounter,
    validateField,
    isValidEmail,
  };
}

// ========================================================================
// ADDITIONAL INITIALIZATION
// ========================================================================

// Initialize code animation after DOM load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initCodeAnimation, 3000);
});

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // Pause animations when page is hidden
    App.animations.particles.forEach((animation) => animation.pause());
  } else {
    // Resume animations when page is visible
    App.animations.particles.forEach((animation) => animation.play());
  }
});

// ========================================================================
// END OF SCRIPT
// ========================================================================

console.log("🎯 Portfolio JavaScript loaded successfully!");
