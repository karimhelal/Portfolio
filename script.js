// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  // Close on link click (mobile)
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );
}

// Active link highlighting on scroll
const sections = document.querySelectorAll("main section[id]");
const navLinks = new Map(
  [...document.querySelectorAll('nav a[href^="#"]')].map((a) => [
    a.getAttribute("href")?.slice(1),
    a,
  ])
);

const ob = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      const link = id ? navLinks.get(id) : null;
      if (!link) return;
      if (entry.isIntersecting) {
        document
          .querySelectorAll('nav a[aria-current="true"]')
          .forEach((el) => el.removeAttribute("aria-current"));
        link.setAttribute("aria-current", "true");
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
);
sections.forEach((s) => ob.observe(s));

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Basic contact form validation + mailto fallback
const form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const nameErr = form.querySelector("#name + .error");
    const emailErr = form.querySelector("#email + .error");
    const messageErr = form.querySelector("#message + .error");

    let ok = true;

    if (!name) {
      nameErr.textContent = "Please enter your name.";
      ok = false;
    } else {
      nameErr.textContent = "";
    }

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      emailErr.textContent = "Please enter a valid email.";
      ok = false;
    } else {
      emailErr.textContent = "";
    }

    if (!message || message.length < 10) {
      messageErr.textContent = "Please provide a few details (10+ characters).";
      ok = false;
    } else {
      messageErr.textContent = "";
    }

    if (!ok) return;

    const subject = encodeURIComponent("New project inquiry");
    const body = encodeURIComponent(`Hi Karim,

My name is ${name}.

${message}

You can reach me at ${email}.
`);
    window.location.href = `mailto:karimhelalkh110@gmail.com?subject=${subject}&body=${body}`;
    form.reset();
  });
}
