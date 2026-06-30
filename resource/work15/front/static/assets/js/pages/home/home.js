// 페이지 전환 효과
function initPageTransition() {
  const fadeEl = document.querySelector('.home-fade-out');

  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  setTimeout(() => {
    document.querySelector('body').classList.remove("scroll-fix")
  }, 300)
  setTimeout(() => {
    fadeEl.remove();
  }, 400);
}

// 스크롤시 header 토글
function initHeaderScroll() {
  const header = document.querySelector("#header");
  let lastScrollY = window.scrollY;
  const threshold = 10;

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;

    if (currentScrollY <= 0) {
      header.classList.remove("is-scroll");
    } else if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        header.classList.add("is-scroll");
        header.querySelector(".menu-list").classList.add('hidden');
      } else {
        header.classList.remove("is-scroll");
      }

      lastScrollY = currentScrollY;
    }
  });
}

// 비주얼 영역에서 스크롤 시 카드영역으로 바로 이동
function initSectionScroll() {
  const sectionCard = document.querySelector(".section-card");
  let isAnimating = false;

  window.addEventListener("wheel", (e) => {
    if ( isAnimating || e.deltaY <= 0 ) return;

    const sectionTop = sectionCard.offsetTop;
    if (window.scrollY < sectionTop - 100) {
      e.preventDefault();

      isAnimating = true;

      window.scrollTo({
        top: sectionTop,
        behavior: "smooth"
      });

      setTimeout(() => {
        isAnimating = false;
      }, 800);
    }
  }, { passive: false });
}


const visualSwiperImg = new Swiper(".section-visual .img-swiper", {
  speed: 800,
  loop: true,
  effect: 'fade',
  fadeEffect: {
    crossFade: true
  },
});
const visualSwiperText = new Swiper(".section-visual .text-swiper", {
  speed: 800,
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true
  },
});
visualSwiperImg.controller.control = visualSwiperText;
visualSwiperText.controller.control = visualSwiperImg;

const visualSection = document.querySelector(".section-visual");

visualSection.addEventListener("mouseenter", () => {
  visualSwiperText.autoplay.stop();
});

visualSection.addEventListener("mouseleave", () => {
  visualSwiperText.autoplay.start();
});


const cardSwiper = new Swiper(".section-card .swiper", {
  speed: 100,
  slidesPerView: "auto",
  spaceBetween: 20,
  grabCursor: true,
  resistanceRatio: 0,
  freeMode: {
    enabled: true,
    momentum: false,
  },
  watchOverflow: true,
  on: {
    setTranslate(swiper) {
      if (swiper.isLocked) {
        swiper.el.style.setProperty("--shadow-opacity", 0);
        return;
      }

      // 왼쪽 끝에서 얼마나 이동했는지
      const moved = Math.abs(swiper.translate - swiper.minTranslate());

      // 0~40px 이동 구간에서 opacity 0→1
      const opacity = Math.min(moved / 30, 1);
      swiper.el.style.setProperty("--shadow-opacity", opacity);
    }
  }
});

const serviceSwiper = new Swiper(".section-service .swiper", {
  allowTouchMove: false,
  speed: 10,
  loop: true,
  autoplay: {
    delay: 200,
  },
})

const placeSwiper = new Swiper(".section-place .swiper", {
  allowTouchMove: false,
  speed: 800,
  loop: true,
  autoplay: {
    delay: 2000,
  },
  effect: 'fade',
  fadeEffect: {
    crossFade: true
  },
})


const storyList = document.querySelector(".story-list");
const storyItems = storyList.querySelectorAll(".story-item");

let activeItem = storyItems[0];
let isDragging = false;
let isMoved = false;
let startX = 0;
let scrollLeft = 0;

setActiveItem(activeItem);
updateScrollable();

// 활성 카드 변경
function setActiveItem(item) {
  activeItem?.classList.remove("is-active");
  item?.classList.add("is-active");
  activeItem = item;
}

// 스크롤 가능 여부에 따라 상태 변경
function updateScrollable() {
  storyList.classList.toggle(
    "is-scrollable",
    storyList.scrollWidth > storyList.clientWidth
  );

  if (!storyList.classList.contains("is-scrollable")) {
    storyList.classList.remove("dragging");
  }
}

// hover
storyItems.forEach(item => {
  item.addEventListener("mouseenter", () => {
    if (isDragging) return;

    setActiveItem(item);
  });
});

storyList.addEventListener("mousedown", e => {
  if (!storyList.classList.contains("is-scrollable")) return;

  isDragging = true;
  isMoved = false;

  startX = e.pageX;
  scrollLeft = storyList.scrollLeft;
});

storyList.addEventListener("mousemove", e => {
  if (!isDragging) return;

  const walk = e.pageX - startX;

  // 일정 거리 이상 이동했을 때 드래그 시작
  if (Math.abs(walk) > 10 && !isMoved) {
    isMoved = true;
    storyList.classList.add("dragging");

    storyItems.forEach(item => {
      item.classList.remove("is-active");
    });
  }

  e.preventDefault();
  storyList.scrollLeft = scrollLeft - walk;
});

window.addEventListener("mouseup", e => {
  if (!isDragging) return;

  isDragging = false;
  storyList.classList.remove("dragging");

  // 드래그 종료 후 현재 마우스 아래 카드 활성화
  const hoveredItem = e.target.closest(".story-item");
  if (hoveredItem) {
    setActiveItem(hoveredItem);
  }

  setTimeout(() => {
    isMoved = false;
  }, 0);
});


document.addEventListener("DOMContentLoaded", () => {
  initPageTransition();
  initHeaderScroll();
  initSectionScroll();
});

window.addEventListener("resize", updateScrollable);