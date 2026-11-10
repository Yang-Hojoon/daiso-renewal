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

/* =========================================================
   아래부터는 기획서 "기능 명세"에 적은 동작입니다.
   위의 슬라이드 코드는 슬라이드가 없는 페이지에서 return으로 끝나기 때문에,
   동작마다 따로 DOMContentLoaded를 걸어 모든 페이지에서 실행되게 했습니다.
   ========================================================= */

/* ---------- 공통: 토스트(잠깐 떴다 사라지는 안내 문구) ---------- */
function showToast(message) {
  let toast = document.querySelector('.toast');

  // 토스트 요소가 없으면 한 번만 만들어 둡니다.
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');   // 화면 읽기 프로그램이 문구를 읽어 주도록
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  // 이전에 걸어 둔 타이머가 있으면 지우고, 2초 뒤에 다시 숨깁니다.
  clearTimeout(toast.hideTimer);
  toast.hideTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 2000);
}


/* ---------- 기능 명세 3: 알림 아이콘 색상 (읽지 않음 빨강 / 읽음 검정) ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const READ_KEY = 'daisoNotiRead';

  // 알림 목록 페이지에 들어오면 "알림을 읽었다"고 기록합니다.
  // sessionStorage는 브라우저 탭을 닫으면 지워져서, 다시 방문하면 처음 상태로 돌아갑니다.
  if (location.pathname.indexOf('mobile_notificationspage.html') !== -1) {
    sessionStorage.setItem(READ_KEY, 'true');
  }

  // 읽은 상태라면, 빨간 알림 아이콘을 검정 아이콘으로 바꿉니다.
  if (sessionStorage.getItem(READ_KEY) === 'true') {
    const alarmImgs = document.querySelectorAll('.alarm-btn img[src$="/Notifications.png"]');
    alarmImgs.forEach(function (img) {
      img.src = 'img/No Notifications.png';
      img.alt = '알림 없음';
    });
  }
});


/* ---------- 기능 명세 3: 상품 카드 찜 / 담기 ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll('.product-card');
  if (cards.length === 0) return;   // 상품 카드가 없는 페이지에서는 실행하지 않음

  cards.forEach(function (card) {
    const img = card.querySelector('img');
    if (!img) return;

    // 원본 크기가 112 x 257인 상품 카드 이미지에만 버튼을 겹칩니다.
    // (다른 모양의 배너 이미지는 건너뜀)
    function setup() {
      if (img.naturalWidth !== 112 || img.naturalHeight !== 257) return;
      if (card.querySelector('.card-overlay')) return;   // 이미 만들었으면 다시 만들지 않음

      // 이미지 속 하트가 빨간색인지 확인해서, 처음 찜 상태를 알아냅니다.
      let likedAtStart = false;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 112;
        canvas.height = 257;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const pixel = ctx.getImageData(97, 136, 1, 1).data;   // 하트 가운데 부분 색
        likedAtStart = pixel[0] > 180 && pixel[1] < 100 && pixel[2] < 100;
      } catch (e) {
        likedAtStart = false;   // 색을 읽지 못하면 찜 안 한 상태로 시작
      }

      // 이미지 위에 겹칠 투명한 층과 버튼들을 만듭니다.
      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';
      overlay.innerHTML =
        '<span class="card-badge"></span>' +
        '<span class="card-badge"></span>' +
        '<span class="card-badge"></span>' +
        '<button type="button" class="card-heart" aria-label="찜하기"></button>' +
        '<button type="button" class="card-cart" aria-label="장바구니 담기"></button>';
      card.appendChild(overlay);

      const heartBtn = overlay.querySelector('.card-heart');
      const cartBtn = overlay.querySelector('.card-cart');
      let liked = likedAtStart;
      heartBtn.setAttribute('aria-pressed', liked);

      // 하트를 누르면 찜 상태를 바꿉니다.
      heartBtn.addEventListener('click', function (event) {
        event.preventDefault();      // 카드 링크(#)로 이동하지 않도록
        event.stopPropagation();
        liked = !liked;
        heartBtn.classList.toggle('liked', liked);
        // 처음 이미지와 상태가 달라졌을 때만 새 하트를 그려서 덮습니다.
        heartBtn.classList.toggle('changed', liked !== likedAtStart);
        heartBtn.setAttribute('aria-pressed', liked);
        showToast(liked ? '찜 목록에 추가했어요' : '찜 목록에서 삭제했어요');
      });

      // 담기를 누르면 장바구니 상태를 바꾸고, 배송 이모티콘에 표시를 합니다.
      cartBtn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const inCart = card.classList.toggle('in-cart');
        cartBtn.setAttribute('aria-label', inCart ? '장바구니에서 빼기' : '장바구니 담기');
        showToast(inCart ? '장바구니에 담았어요' : '장바구니에서 뺐어요');
      });
    }

    // 이미지가 이미 불러와졌으면 바로, 아니면 다 불러온 뒤에 실행합니다.
    if (img.complete) {
      setup();
    } else {
      img.addEventListener('load', setup);
    }
  });
});


/* ---------- 기능 명세 4: 셀프 계산 진입 시 지정 매장 확인 팝업 ---------- */
document.addEventListener("DOMContentLoaded", function () {
  if (location.pathname.indexOf('mobile_store-SelfCheckout.html') === -1) return;

  const STARTED_KEY = 'daisoSelfCheckoutStarted';

  // 이번 방문에서 이미 "셀프계산 시작하기"를 눌렀다면 다시 묻지 않습니다.
  if (sessionStorage.getItem(STARTED_KEY) === 'true') return;

  // GPS로 자동 지정된 매장 (프로토타입이라 화면에 있는 매장으로 고정)
  const storeName = '신촌본점';

  const dim = document.createElement('div');
  dim.className = 'popup-dim';
  dim.innerHTML =
    '<div class="store-popup" role="dialog" aria-modal="true" aria-labelledby="store-popup-title">' +
      '<button type="button" class="popup-close" aria-label="닫기">&times;</button>' +
      '<h2 id="store-popup-title">셀프계산</h2>' +
      '<p class="popup-store">현재 지정된 매장: <strong>' + storeName + '</strong></p>' +
      '<p class="popup-question">선택하신 매장에서<br>셀프계산을 진행할까요?</p>' +
      '<p class="popup-note">매장이 다를 경우 매장을 변경해 주세요</p>' +
      '<button type="button" class="popup-btn popup-start">셀프계산 시작하기</button>' +
      '<button type="button" class="popup-btn popup-change">매장 변경</button>' +
    '</div>';
  document.body.appendChild(dim);

  function closePopup() {
    dim.remove();
  }

  // 시작하기: 기록을 남기고 팝업을 닫습니다.
  dim.querySelector('.popup-start').addEventListener('click', function () {
    sessionStorage.setItem(STARTED_KEY, 'true');
    closePopup();
  });

  // 매장 변경: 매장 위치 찾기 페이지로 이동합니다.
  dim.querySelector('.popup-change').addEventListener('click', function () {
    location.href = 'mobile_store-FindStoreLocation.html';
  });

  // X 버튼: 팝업만 닫습니다. (다음에 들어오면 다시 물어봄)
  dim.querySelector('.popup-close').addEventListener('click', closePopup);
});


/* ---------- 기능 명세 1: 카메라 검색 (촬영 / 갤러리 → 바코드 검색 / 유사 상품 검색) ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const cameraBg = document.querySelector('.camera-bg');
  if (!cameraBg) return;   // 카메라 검색 화면에서만 실행

  const container = cameraBg.parentElement;   // .payment-camera

  // 카메라 화면 그림(402 x 926) 안에서 셔터와 갤러리 버튼의 위치 (가운데 좌표, 지름)
  const IMG_W = 402;
  const IMG_H = 926;
  const SHUTTER = { x: 201, y: 818, size: 76 };
  const GALLERY = { x: 358, y: 832, size: 44 };

  // 셔터 위치에 겹치는 투명 버튼
  const shutterBtn = document.createElement('button');
  shutterBtn.type = 'button';
  shutterBtn.className = 'camera-hotspot';
  shutterBtn.setAttribute('aria-label', '촬영하기');

  // 갤러리 위치에 겹치는 투명 버튼
  const galleryBtn = document.createElement('button');
  galleryBtn.type = 'button';
  galleryBtn.className = 'camera-hotspot';
  galleryBtn.setAttribute('aria-label', '갤러리에서 사진 불러오기');

  // 갤러리에서 사진을 고르는 창을 여는 숨은 입력창
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.hidden = true;

  container.appendChild(shutterBtn);
  container.appendChild(galleryBtn);
  container.appendChild(fileInput);

  // 그림이 화면 크기에 맞게 잘려서(object-fit: cover) 보이기 때문에,
  // 화면 크기에 맞춰 버튼 위치를 다시 계산합니다.
  function placeButtons() {
    const w = cameraBg.clientWidth;
    const h = cameraBg.clientHeight;
    const scale = Math.max(w / IMG_W, h / IMG_H);
    const offsetX = (w - IMG_W * scale) / 2;
    const offsetY = (h - IMG_H * scale) / 2;

    [[shutterBtn, SHUTTER], [galleryBtn, GALLERY]].forEach(function (pair) {
      const btn = pair[0];
      const spot = pair[1];
      const size = spot.size * scale;
      btn.style.width = size + 'px';
      btn.style.height = size + 'px';
      btn.style.left = (offsetX + spot.x * scale - size / 2) + 'px';
      btn.style.top = (offsetY + spot.y * scale - size / 2) + 'px';
    });
  }
  placeButtons();
  window.addEventListener('resize', placeButtons);
  if (!cameraBg.complete) cameraBg.addEventListener('load', placeButtons);

  // 검색 방식을 고르는 바텀시트
  function openSearchSheet(sourceText) {
    const dim = document.createElement('div');
    dim.className = 'sheet-dim';
    dim.innerHTML =
      '<div class="search-sheet" role="dialog" aria-modal="true" aria-labelledby="search-sheet-title">' +
        '<h2 id="search-sheet-title">어떤 방법으로 찾을까요?</h2>' +
        '<button type="button" class="sheet-option" data-type="barcode">바코드로 상품 찾기' +
          '<span>상품의 바코드를 인식해 상품 정보를 확인해요</span></button>' +
        '<button type="button" class="sheet-option" data-type="similar">비슷한 다이소 상품 찾기' +
          '<span>' + sourceText + ' 속 물건과 비슷한 다이소 상품을 찾아요</span></button>' +
        '<button type="button" class="sheet-cancel">취소</button>' +
      '</div>';
    document.body.appendChild(dim);

    // 바깥 어두운 부분이나 취소를 누르면 닫습니다.
    dim.addEventListener('click', function (event) {
      if (event.target === dim || event.target.classList.contains('sheet-cancel')) {
        dim.remove();
      }
    });

    // 검색 방식을 고르면, 선택한 방식으로 검색을 시작한다고 안내합니다.
    dim.querySelectorAll('.sheet-option').forEach(function (option) {
      option.addEventListener('click', function () {
        dim.remove();
        if (option.dataset.type === 'barcode') {
          showToast('바코드 검색 결과 화면은 준비 중이에요');
        } else {
          showToast('유사 상품 검색 결과 화면은 준비 중이에요');
        }
      });
    });
  }

  // 셔터를 누르면 → 촬영한 사진으로 검색 방식 선택
  shutterBtn.addEventListener('click', function () {
    openSearchSheet('촬영한 사진');
  });

  // 갤러리를 누르면 → 사진을 고른 뒤 검색 방식 선택
  galleryBtn.addEventListener('click', function () {
    fileInput.click();
  });
  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      openSearchSheet('고른 사진');
      fileInput.value = '';   // 같은 사진을 다시 골라도 동작하도록 초기화
    }
  });
});
