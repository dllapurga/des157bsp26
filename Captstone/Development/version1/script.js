(function () {
  'use strict';
  console.log('reading js');

  /* ─── ELEMENTS ────────────────────────────────────────────────── */
  const cover       = document.querySelector('.cover');
  const coverShadow = document.querySelector('.cover-shadow');
  const scrollCue   = document.querySelector('.scroll-cue');
  const susan       = document.getElementById('susan');

  /* ─── COVER – lock scroll on load ────────────────────────────── */
  document.body.style.position = 'fixed';
  document.body.style.top      = '0';
  document.body.style.left     = '0';
  document.body.style.right    = '0';

  let coverDismissed = false;

  function getClipPath(p) {
    const points = [];
    points.push('0% 0%');
    points.push('100% 0%');
    const rightTop = Math.max(0, (1 - p) * 100);
    points.push(`100% ${rightTop.toFixed(2)}%`);
    for (let i = 19; i >= 0; i--) {
      const x      = (i / 19) * 100;
      const delay  = (1 - x / 100) * 0.55;
      const localP = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
      const eased  = localP < 0.5
        ? 2 * localP * localP
        : 1 - Math.pow(-2 * localP + 2, 2) / 2;
      points.push(`${x.toFixed(1)}% ${(1 - eased) * 100..toFixed(1)}%`);
    }
    points.push('0% 100%');
    return `polygon(${points.join(', ')})`;
  }

  function dismissCover() {
    if (coverDismissed) return;
    coverDismissed = true;
    gsap.to(coverShadow, { opacity: 1, duration: 0.3, ease: 'power1.in' });
    const progress = { value: 0 };
    gsap.to(progress, {
      value: 1, duration: 1.2, ease: 'power2.inOut',
      onUpdate: () => {
        cover.style.clipPath = getClipPath(progress.value);
        cover.style.filter   = `brightness(${1 - progress.value * 0.28})`;
      },
      onComplete: () => {
        cover.style.display       = 'none';
        coverShadow.style.display = 'none';
        document.body.style.position = '';
        document.body.style.top      = '';
        document.body.style.left     = '';
        document.body.style.right    = '';
        window.scrollTo(0, 0);
      }
    });
    gsap.to(coverShadow, { opacity: 0, duration: 0.5, delay: 0.8, ease: 'power1.out' });
  }

  cover.addEventListener('wheel',      (e) => { if (e.deltaY > 0) dismissCover(); });
  let touchStartY = 0;
  cover.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; });
  cover.addEventListener('touchend',   (e) => { if (touchStartY - e.changedTouches[0].clientY > 40) dismissCover(); });

  window.addEventListener('scroll', () => {
    scrollCue.classList.toggle('hidden', window.scrollY > 50);
  });

  susan.addEventListener('click', () => { susan.classList.toggle('rotate'); });

  /* ─── MULTI-STEP RECIPE FORM ──────────────────────────────────── */

  const modal      = document.getElementById('recipeModal');
  const modalClose = document.getElementById('modalClose');
  const btnAdd     = document.querySelector('.btn-add');
  const outputArea = document.getElementById('recipe-output-area');

  const UNITS      = ['tsp','tbsp','cup','oz','lb','g','kg','ml','L','fl oz','whole','pinch','bunch','slice','piece'];
  const QUANTITIES = ['¼','⅓','½','⅔','¾','1','1¼','1½','1¾','2','2½','3','4','5','6','7','8','10','12','as needed'];

  let currentStep   = 0;
  let uploadedImage = null;

  let ingredientRows = [{ qty: '1', unit: 'cup', name: '' }];
  let stepRows       = [''];

  /* ─── LOCAL STORAGE ───────────────────────────────────────────── */

//   function saveToStorage(name, ingredients, steps, image) {
//     localStorage.setItem('hinabi_recipeName',  name);
//     localStorage.setItem('hinabi_ingredients', JSON.stringify(ingredients));
//     localStorage.setItem('hinabi_steps',       JSON.stringify(steps));
//     localStorage.setItem('hinabi_image',       image || '');
//   }

//   function loadFromStorage() {
//     const name        = localStorage.getItem('hinabi_recipeName');
//     const ingredients = JSON.parse(localStorage.getItem('hinabi_ingredients') || 'null');
//     const steps       = JSON.parse(localStorage.getItem('hinabi_steps')       || 'null');
//     const image       = localStorage.getItem('hinabi_image') || null;

//     if (name) {
//       uploadedImage  = image || null;
//       if (ingredients) ingredientRows = ingredients;
//       if (steps)       stepRows       = steps;
//       renderOutput(name, ingredients || [], steps || [], image);
//     }
//   }

  /* ─── MODAL HELPERS ───────────────────────────────────────────── */

  function openModal() {
    currentStep   = 0;
    uploadedImage = null;
    document.getElementById('recipe-name-input').value = '';
    document.getElementById('recipe-name-input').style.borderColor = '';
    renderIngredientRows();
    renderStepRows();
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('previewImg').src = '';
    showPanel(0);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('recipe-name-input').focus(), 50);
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showPanel(idx) {
    document.querySelectorAll('.form-panel').forEach((p, i) => {
      p.classList.toggle('active', i === idx);
    });
    document.querySelectorAll('.modal-progress-step').forEach((s, i) => {
      s.classList.toggle('done',   i < idx);
      s.classList.toggle('active', i === idx);
    });
    currentStep = idx;
  }

  /* ─── INGREDIENT ROWS ─────────────────────────────────────────── */

  function renderIngredientRows() {
    const list = document.getElementById('ingredients-list');
    list.innerHTML = '';
    ingredientRows.forEach((row, i) => {
      const div = document.createElement('div');
      div.className = 'ingredient-row';
      div.innerHTML = `
        <select data-i="${i}" data-field="qty">
          ${QUANTITIES.map(q => `<option value="${q}" ${q === row.qty ? 'selected' : ''}>${q}</option>`).join('')}
        </select>
        <select data-i="${i}" data-field="unit">
          ${UNITS.map(u => `<option value="${u}" ${u === row.unit ? 'selected' : ''}>${u}</option>`).join('')}
        </select>
        <input type="text" placeholder="Ingredient name" data-i="${i}" data-field="name" value="${row.name}">
      `;
      list.appendChild(div);
    });

    list.querySelectorAll('select, input').forEach(el => {
      el.addEventListener('change', (e) => {
        ingredientRows[+e.target.dataset.i][e.target.dataset.field] = e.target.value;
      });
      el.addEventListener('input', (e) => {
        ingredientRows[+e.target.dataset.i][e.target.dataset.field] = e.target.value;
      });
    });
  }

  document.getElementById('add-ingredient').addEventListener('click', () => {
    ingredientRows.push({ qty: '1', unit: 'cup', name: '' });
    renderIngredientRows();
    document.getElementById('ingredients-list').lastElementChild
      .querySelector('input').focus();
  });

  document.getElementById('remove-ingredient').addEventListener('click', () => {
    if (ingredientRows.length > 1) {
      ingredientRows.pop();
      renderIngredientRows();
    }
  });

  /* ─── STEP ROWS ───────────────────────────────────────────────── */

  function renderStepRows() {
    const list = document.getElementById('steps-list');
    list.innerHTML = '';
    stepRows.forEach((text, i) => {
      const div = document.createElement('div');
      div.className = 'step-row';
      div.innerHTML = `
        <span class="step-number">${i + 1}.</span>
        <textarea placeholder="Describe this step…" data-i="${i}">${text}</textarea>
      `;
      list.appendChild(div);
    });
    list.querySelectorAll('textarea').forEach(el => {
      el.addEventListener('input', (e) => {
        stepRows[+e.target.dataset.i] = e.target.value;
      });
    });
  }

  document.getElementById('add-step').addEventListener('click', () => {
    stepRows.push('');
    renderStepRows();
    document.getElementById('steps-list').lastElementChild
      .querySelector('textarea').focus();
  });

  document.getElementById('remove-step').addEventListener('click', () => {
    if (stepRows.length > 1) {
      stepRows.pop();
      renderStepRows();
    }
  });

/* ─── IMAGE UPLOAD ────────────────────────────────────────────── */

const getImageDimensions = dataURL => new Promise(resolve => {
  const img = new Image();
  img.onload = () => resolve({ width: img.width, height: img.height });
  img.src = dataURL;
});

document.getElementById('photoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const objectUrl = window.URL.createObjectURL(file);

  getImageDimensions(objectUrl).then(async ({ width, height }) => {
    try {
    
      if (height < 800 && width < 1000) {
        uploadedImage = objectUrl;
        document.getElementById('previewImg').src = uploadedImage;
        document.getElementById('uploadPreview').style.display = 'block';
        return;
      }

      const image = await Jimp.read(objectUrl);

      if (height > width) {
        image.resize(Jimp.AUTO, 800);
      } else {
        image.resize(1000, Jimp.AUTO);
      }

      image.quality(82);

      image.getBase64('image/jpeg', (err, resizedDataUrl) => {
        if (err) {
          console.error('Jimp resize error:', err);
          uploadedImage = objectUrl;
        } else {
          uploadedImage = resizedDataUrl;
        }
        document.getElementById('previewImg').src = uploadedImage;
        document.getElementById('uploadPreview').style.display = 'block';
      });

    } catch (err) {
      console.error('Jimp could not process image:', err);
      uploadedImage = objectUrl;
      document.getElementById('previewImg').src = uploadedImage;
      document.getElementById('uploadPreview').style.display = 'block';
    }
  });
});

  /* ─── NAVIGATION ──────────────────────────────────────────────── */

  document.getElementById('next-0').addEventListener('click', () => {
    const nameInput = document.getElementById('recipe-name-input');
    if (!nameInput.value.trim()) {
      nameInput.style.borderColor = '#d15410';
      nameInput.focus();
      return;
    }
    nameInput.style.borderColor = '';
    showPanel(1);
  });

  document.getElementById('back-1').addEventListener('click', () => showPanel(0));
  document.getElementById('next-1').addEventListener('click', () => showPanel(2));
  document.getElementById('back-2').addEventListener('click', () => showPanel(1));
  document.getElementById('next-2').addEventListener('click', () => showPanel(3));
  document.getElementById('back-3').addEventListener('click', () => showPanel(2));

  document.getElementById('next-3').addEventListener('click', () => {
    closeModal();
    renderOutput();
    ingredientRows = [{ qty: '1', unit: 'cup', name: '' }];
    stepRows       = [''];
  });

  btnAdd.addEventListener('click',     (e) => { e.preventDefault(); openModal(); });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click',      (e) => { if (e.target === modal) closeModal(); });

  /* ─── RENDER OUTPUT ───────────────────────────────────────────── */

  function renderOutput(
    recipeName        = document.getElementById('recipe-name-input').value.trim(),
    filledIngredients = ingredientRows.filter(r => r.name.trim()),
    filledSteps       = stepRows.filter(s => s.trim()),
    image             = uploadedImage
  ) {
    // persist to localStorage
    saveToStorage(recipeName, filledIngredients, filledSteps, image);

    const photoHTML = image
      ? `<div class="recipe-output-photo"><img src="${image}" alt="Recipe photo"></div>`
      : '';

    const ingredientsHTML = filledIngredients.length
      ? `<p class="recipe-section-label">Ingredients</p>
         <ul class="recipe-ingredients-list">
           ${filledIngredients.map(r =>
             `<li>${r.qty} ${r.unit} — ${r.name}</li>`
           ).join('')}
         </ul>`
      : '';

    const stepsHTML = filledSteps.length
      ? `<p class="recipe-section-label">Instructions</p>
         <ol class="recipe-steps-list">
           ${filledSteps.map((s, i) =>
             `<li><span class="step-num">${i + 1}.</span><span class="step-text">${s}</span></li>`
           ).join('')}
         </ol>`
      : '';

    const pageTitle = document.querySelector('.recipe-title');
    if (pageTitle && recipeName) pageTitle.textContent = recipeName;

    outputArea.innerHTML = `
      <div class="recipe-output">
        ${photoHTML}
        ${ingredientsHTML}
        ${stepsHTML}
      </div>
    `;

    outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ─── INIT – restore saved recipe on page load ────────────────── */
//   loadFromStorage();

})();