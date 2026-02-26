(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealSections() {
    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return;

    document.body.classList.add("ready");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    nodes.forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 80, 520)}ms`);
      observer.observe(node);
    });
  }

  function animateTrendBars() {
    const bars = Array.from(document.querySelectorAll(".trend-bar"));
    if (!bars.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      bars.forEach((bar) => bar.classList.add("grow"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const container = entry.target;
          container.classList.add("trend-ready");
          container.querySelectorAll(".trend-bar").forEach((bar, i) => {
            bar.style.transitionDelay = `${i * 45}ms`;
            bar.classList.add("grow");
          });
          obs.unobserve(container);
        });
      },
      { threshold: 0.25 }
    );

    const parents = new Set(bars.map((b) => b.parentElement));
    parents.forEach((parent) => parent && observer.observe(parent));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      revealSections();
      animateTrendBars();
    });
  } else {
    revealSections();
    animateTrendBars();
  }
})();
