document.addEventListener("DOMContentLoaded", function () {

  /* ===== 헤더 스크롤 ===== */
  const headerBottom = document.querySelector('.header-bottom');

  if (headerBottom) {
    let lastScrollY = 0;

    window.addEventListener('scroll', function () {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        headerBottom.classList.add('hidden');
      } else {
        headerBottom.classList.remove('hidden');
      }

      lastScrollY = currentScrollY;
    });
  }


  /* ===== 슬라이드 ===== */
  const slider = document.querySelector(".banner-slide ul");
  const slides = document.querySelectorAll(".banner-slide li");
  const prevBtn = document.querySelector(".banner-controls .prev");
  const nextBtn = document.querySelector(".banner-controls .next");

  // 슬라이드 없으면 실행 안함 (다른 페이지 보호)
  if (!slider || slides.length === 0) return;

  let current = 0;
  const total = slides.length;

  /* 🔥 슬라이드 복제 (무한슬라이드 핵심) */
  slider.innerHTML += slider.innerHTML;

  function updateSlide() {
    slider.style.transition = "transform 0.5s ease";
    slider.style.transform = `translateX(-${current * 100}%)`;
  }

  /* ===== 자동 슬라이드 ===== */
  let autoSlide = setInterval(() => {
    current++;
    updateSlide();

    // 🔥 끝에서 순간 리셋 (티 안 나게)
    if (current >= total) {
      setTimeout(() => {
        slider.style.transition = "none";
        current = 0;
        slider.style.transform = `translateX(0)`;
      }, 500);
    }

  }, 3000);


  /* ===== 다음 버튼 ===== */
  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      clearInterval(autoSlide);

      current++;
      updateSlide();

      if (current >= total) {
        setTimeout(() => {
          slider.style.transition = "none";
          current = 0;
          slider.style.transform = `translateX(0)`;
        }, 500);
      }
    });
  }


  /* ===== 이전 버튼 ===== */
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      clearInterval(autoSlide);

      // 🔥 뒤로 갈 때도 자연스럽게 만들기
      if (current === 0) {
        slider.style.transition = "none";
        current = total;
        slider.style.transform = `translateX(-${current * 100}%)`;

        setTimeout(() => {
          current--;
          updateSlide();
        }, 20);

      } else {
        current--;
        updateSlide();
      }
    });
  }

});