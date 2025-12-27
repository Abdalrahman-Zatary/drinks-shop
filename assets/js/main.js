(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    const list = Array.from(document.querySelectorAll(".carousel .list .item"));
    const carousel = document.querySelector(".carousel");
    const mockup = document.querySelector(".mockup");
    const dots = Array.from(document.querySelectorAll(".flavor-nav .dot"));
    const navLinks = Array.from(document.querySelectorAll(".navbar .links a"));

    let count = list.length;
    let active = 0;
    let left_each_item = count > 1 ? 100 / (count - 1) : 0;
    let refreshInterval = null;

    function changeNavbarColor(index) {
      try {
        const el = list[index];
        if (!el) return;
        const color = getComputedStyle(el)
          .getPropertyValue("--background")
          .trim();
        if (color) {
          document.documentElement.style.setProperty("--flavor-color", color);
        } else {
          const s = el.getAttribute("style") || "";
          const match = s.match(/--background:\s*([^;]+)/);
          if (match)
            document.documentElement.style.setProperty(
              "--flavor-color",
              match[1].trim()
            );
        }
      } catch (e) {
        console.warn("changeNavbarColor error", e);
      }
    }

    function changeCarousel(index, direction = "next") {
      try {
        let hidden_old = document.querySelector(".item.hidden");
        if (hidden_old) hidden_old.classList.remove("hidden");

        let active_old = document.querySelector(".item.active");
        if (active_old) {
          active_old.classList.remove("active");
          active_old.classList.add("hidden");
        }

        if (!list[index]) return;
        list[index].classList.add("active");

        changeNavbarColor(index);

        let leftMockup = left_each_item * index;
        if (mockup) mockup.style.setProperty("--left", leftMockup + "%");

        dots.forEach((d) => d.classList.remove("active"));
        const dot = dots.find((d) => Number(d.dataset.index) === Number(index));
        if (dot) dot.classList.add("active");

        active = index;
        clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
          goNext();
        }, 5000);
      } catch (e) {
        console.error("changeCarousel error", e);
      }
    }

    function goNext() {
      const nextIndex = active >= count - 1 ? 0 : active + 1;
      if (carousel) carousel.classList.remove("right");
      changeCarousel(nextIndex, "next");
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", function () {
        const idx = Number(this.getAttribute("data-index"));
        if (isNaN(idx)) return;
        if (idx === active) {
          clearInterval(refreshInterval);
          refreshInterval = setInterval(() => {
            goNext();
          }, 5000);
          return;
        }
        if (idx < active && carousel) carousel.classList.add("right");
        else if (carousel) carousel.classList.remove("right");
        changeCarousel(idx);
      });
    });

    refreshInterval = setInterval(() => {
      goNext();
    }, 5000);

    if (list.length) changeCarousel(active);

    function wrapLettersSafe(link) {
      if (link.dataset.lettersWrapped) return;
      const nodes = Array.from(link.childNodes);
      nodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (!text || text.trim().length === 0) return;
          const frag = document.createDocumentFragment();
          [...text].forEach((ch, i) => {
            const span = document.createElement("span");
            span.textContent = ch === " " ? "\u00A0" : ch;
            span.style.setProperty("--i", String(i));
            frag.appendChild(span);
          });
          link.replaceChild(frag, node);
        }
      });
      link.dataset.lettersWrapped = "1";
    }

    try {
      navLinks.forEach((link) => wrapLettersSafe(link));
    } catch (e) {
      console.error("wrap letters error", e);
    }

    changeNavbarColor(active);
  }
})();
