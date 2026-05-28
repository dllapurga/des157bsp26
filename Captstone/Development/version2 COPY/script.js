(function () {
  'use strict';
  console.log('reading js');

  /* ─── AOS ───────────────────────────────────────────── */
  AOS.init({
    duration: 700,
    once: false
  });

  /* ─── elements ─────────────────────────────────────── */
  const cover = document.querySelector('.cover');
  const coverShadow = document.querySelector('.cover-shadow');
  const scrollCue = document.querySelector('.scroll-cue');
  const susan = document.querySelector('#susan');
  const recipeTitle = document.querySelector('#recipe-title');
  const recipeImage = document.querySelector('#recipe-image');
  const characterImage = document.querySelector('#character-image');
  const explanationImage = document.querySelector('#explanation-image');
  const recipeVideo = document.querySelector('#recipe-video');
  const stepsImage = document.querySelector('#steps-image');

  /* ─── recipe data ──────────────────────────────────── */
  const recipes = [
    'Chinese Egg Custard',
    'Dinuguan',
    'Chicken Adobo',
    'Pinapaitan'
  ];

  const recipeImages = [
    'images/tartrecipe.png',
    'images/dinuguanrecipe.png',
    'images/Adoborecipe.png',
    'images/pinapaitanrecipe.png'
  ];

  const stepsImages = [
    'images/eggtartsteps.png',
    'images/dinuguansteps.png',
    'images/adobosteps.png',
    'images/pinapaitansteps.png'
  ];

  const characterImages = [
    'images/popocutout.png',
    'images/lolocutout.png',
    'images/lolacutout.png',
    'images/ondongcutout.png'
  ];

  const explanationImages = [
    'images/popoexplanation.png',
    'images/loloexplanation.png',
    'images/lolaexplanation.png',
    'images/ondongexplanation.png'
  ];

  const videoSources = [
    'images/popo.mp4',
    'images/lolo.mp4',
    'images/lola.mp4',
    'images/ondong.mp4'
  ];

  let currentRecipe = 0;

  /* ─── lock scroll on load ─────────────────── */
  document.body.classList.add('cover-active');
  let coverDismissed = false;

  /* ─── table rotation ──────────────────────────────── */
  let currentRotation = 0;

  /* ─── cover peel ──────────────────────────────── */
  /* ─── code from outside source because peel animation felt fitting for "cook book" feel ──────────────────────────────── */
  function getClipPath(p) {
    const points = [];
    points.push('0% 0%');
    points.push('100% 0%');
    const rightTop = Math.max(0, (1 - p) * 100);
    points.push(`100% ${rightTop.toFixed(2)}%`);
    for (let i = 19; i >= 0; i--) {
      const x = (i / 19) * 100;
      const delay = (1 - x / 100) * 0.55;
      const localP = Math.max(
        0,
        Math.min(1, (p - delay) / (1 - delay))
      );
      const eased =
        localP < 0.5
          ? 2 * localP * localP
          : 1 - Math.pow(-2 * localP + 2, 2) / 2;
      points.push(
        `${x.toFixed(1)}% ${((1 - eased) * 100).toFixed(1)}%`
      );
    }
    points.push('0% 100%');
    return `polygon(${points.join(', ')})`;
  }

  /* ─── so that the peel animation doesnt fire again ──── */
  function dismissCover() {
    if (coverDismissed) return;
    coverDismissed = true;
    gsap.to(coverShadow, {
      opacity: 1,
      duration: 0.3,
      ease: 'power1.in'
    });
    const progress = { value: 0 };
    gsap.to(progress, {
      value: 1,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: function () {
        cover.style.clipPath = getClipPath(progress.value);
        cover.style.filter = `brightness(${1 - progress.value * 0.28})`;
      },
      onComplete: function () {
        cover.style.display = 'none';
        coverShadow.style.display = 'none';
        document.body.classList.remove('cover-active');
        window.scrollTo(0, 0);
      }
    });

    /* ─── cover shadow ───────────────────────────────── */
    gsap.to(coverShadow, {
      opacity: 0,
      duration: 0.5,
      delay: 0.8,
      ease: 'power1.out'
    });
  }

  /* ─── cover screen interaction ──────────────────────── */
  cover.addEventListener('wheel', function (e) {
    if (e.deltaY > 0) dismissCover();
  });

  let touchStartY = 0;

  cover.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  });

  cover.addEventListener('touchend', function (e) {
    if (touchStartY - e.changedTouches[0].clientY > 40) {
      dismissCover();
    }
  });

  /* ─── hide scroll cue ────────────────────────────────── */
  window.addEventListener('scroll', function () {
    scrollCue.classList.toggle('hidden', window.scrollY > 50);
  });

  /* ─── modal ──────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    if (e.target.id === 'modal-close') {
      document.getElementById('modal-overlay').classList.add('hidden');
    }
  });

  /* ─── lazy susan rotation, title, and image ──────────── */
  susan.addEventListener('click', function () {
    currentRotation += 90;
    susan.style.transform = 'rotate(' + currentRotation + 'deg)';

    recipeTitle.classList.add('hidden-fade');
    stepsImage.classList.add('hidden-fade');
    characterImage.classList.add('hidden-fade');
    explanationImage.classList.add('hidden-fade');
    recipeVideo.classList.add('hidden-fade');

    setTimeout(function () {
      currentRecipe = (currentRecipe + 1) % recipes.length;
      recipeTitle.textContent = recipes[currentRecipe];
      recipeImage.src = recipeImages[currentRecipe];
      stepsImage.src = stepsImages[currentRecipe];
      characterImage.src = characterImages[currentRecipe];
      explanationImage.src = explanationImages[currentRecipe];
      recipeVideo.src = videoSources[currentRecipe];
      recipeVideo.load();
      recipeVideo.pause();

      recipeTitle.classList.remove('hidden-fade');
      stepsImage.classList.remove('hidden-fade');
      characterImage.classList.remove('hidden-fade');
      explanationImage.classList.remove('hidden-fade');
      recipeVideo.classList.remove('hidden-fade');
    }, 180);
  });

})();