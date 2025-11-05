document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('.carousel-track img');
  let current = 0;

  function updateCarousel() {
    images.forEach((img, i) => {
      img.classList.remove('active', 'left', 'right');
      if (i === current) img.classList.add('active');
      else if (i === (current - 1 + images.length) % images.length) img.classList.add('left');
      else if (i === (current + 1) % images.length) img.classList.add('right');
    });
  }

  let autoSlide = setInterval(() => {
    current = (current + 1) % images.length;
    updateCarousel();
  }, 4000);

  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');

  if (prevBtn && nextBtn) {  // 確認按鈕存在
    prevBtn.addEventListener('click', () => {
      current = (current - 1 + images.length) % images.length;
      updateCarousel();
      resetAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
      current = (current + 1) % images.length;
      updateCarousel();
      resetAutoSlide();
    });
  }

  function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => {
      current = (current + 1) % images.length;
      updateCarousel();
    }, 4000);
  }

  // 初始化
  updateCarousel();
});
