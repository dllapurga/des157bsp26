(function () {
  'use strict';
  console.log('reading js');

  /* ─── ELEMENTS ────────────────────────────────────────────────── */
  const cover = document.querySelector('.cover');
  const coverShadow = document.querySelector('.cover-shadow');
  const scrollCue = document.querySelector('.scroll-cue');
  const susan = document.querySelector('#susan');

  /* ─── COVER – lock scroll on load ────────────────────────────── */
  document.body.style.position = 'fixed';
  document.body.style.top = '0';
  document.body.style.left = '0';
  document.body.style.right = '0';

  let coverDismissed = false;


 // This function builds a CSS clip-path polygon string
// that creates the animated "peel away" effect when the cover dismisses
// p = progress value between 0 (animation start) and 1 (animation end)
function getClipPath(p) {

  // Array that will hold all the corner/edge points of the polygon
  const points = [];

  // Add the top-left corner — this never moves
  points.push('0% 0%');

  // Add the top-right corner — this never moves
  points.push('100% 0%');

  // Calculate how far down the right edge the cover has peeled
  // At p=0 (start): rightTop = 100% (full height, cover is whole)
  // At p=1 (end):   rightTop = 0%   (peeled all the way up)
  const rightTop = Math.max(0, (1 - p) * 100);
  points.push(`100% ${rightTop.toFixed(2)}%`);

  // Loop from right to left across 20 points along the bottom edge
  // This creates the wavy/curved peel effect instead of a straight line
  for (let i = 19; i >= 0; i--) {

    // x = horizontal position of this point (0% to 100%)
    const x = (i / 19) * 100;

    // delay = how much this point lags behind the overall animation
    // points on the left side have a bigger delay, so the peel
    // travels from right to left across the screen
    const delay = (1 - x / 100) * 0.55;

    // localP = the local progress for this specific point
    // accounting for its delay (clamped between 0 and 1)
    const localP = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));

    // eased = smooth in/out curve applied to localP
    // so the peel accelerates and decelerates naturally
    // instead of moving at a constant speed
    const eased = localP < 0.5
      ? 2 * localP * localP                      // ease in  (first half)
      : 1 - Math.pow(-2 * localP + 2, 2) / 2;   // ease out (second half)

    // Add this point to the polygon
    // x% across, and vertically moves from 100% down to 0% as eased goes 0→1
    points.push(`${x.toFixed(1)}% ${(1 - eased) * 100..toFixed(1)}%`);
  }

  // Add the bottom-left corner — this never moves
  points.push('0% 100%');

  // Join all points into a CSS polygon() string and return it
  // e.g. polygon(0% 0%, 100% 0%, 100% 45%, ...)
  return `polygon(${points.join(', ')})`;
}


// This function plays the cover dismissal animation
// It only runs once — coverDismissed prevents it from firing again
function dismissCover() {

  // If the cover has already been dismissed, stop here and do nothing
  if (coverDismissed) return;

  // Mark it as dismissed so this function can't run a second time
  coverDismissed = true;

  // Briefly fade the shadow layer in behind the cover as it starts peeling
  gsap.to(coverShadow, { opacity: 1, duration: 0.3, ease: 'power1.in' });

  // Create a progress object — GSAP will animate its value from 0 to 1
  // We use an object instead of a plain number because GSAP needs
  // a reference it can update over time
  const progress = { value: 0 };

  gsap.to(progress, {
    value: 1,           // animate value from 0 to 1
    duration: 1.2,      // over 1.2 seconds
    ease: 'power2.inOut',

    // onUpdate fires every animation frame
    onUpdate: function () {
      // Update the clip-path to the current peel shape
      cover.style.clipPath = getClipPath(progress.value);
      // Also dim the cover slightly as it peels away
      // at progress=0: brightness(1)    — full brightness
      // at progress=1: brightness(0.72) — slightly darker
      cover.style.filter = `brightness(${1 - progress.value * 0.28})`;
    },

    // onComplete fires once when the animation fully finishes
    onComplete: function () {
      // Hide the cover and shadow completely so they're gone from the page
      cover.style.display = 'none';
      coverShadow.style.display = 'none';
      // Unlock scrolling on the body (was locked when cover was visible)
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      // Make sure the page starts at the top
      window.scrollTo(0, 0);
    }
  });

  // Fade the shadow back out after the peel starts
  // delay of 0.8s so it waits until most of the peel has happened
  gsap.to(coverShadow, { opacity: 0, duration: 0.5, delay: 0.8, ease: 'power1.out' });
}


// Listen for a scroll wheel downward on the cover — dismiss it if detected
cover.addEventListener('wheel', function (e) {
  // deltaY is positive when scrolling down
  if (e.deltaY > 0) dismissCover();
});

// Record where the finger was when the touch first started
let touchStartY = 0;
cover.addEventListener('touchstart', function (e) {
  touchStartY = e.touches[0].clientY;
});

// When the finger lifts, check if it swiped upward more than 40px
// If so, dismiss the cover
cover.addEventListener('touchend', function (e) {
  if (touchStartY - e.changedTouches[0].clientY > 40) dismissCover();
});

// Every time the page scrolls, check how far down we are
// If past 50px, add the 'hidden' class to hide the scroll cue arrow
// If back at the top, remove it to show the arrow again
window.addEventListener('scroll', function () {
  scrollCue.classList.toggle('hidden', window.scrollY > 50);
});

  susan.addEventListener('click', function () { susan.classList.toggle('rotate'); });

  /* ─── MULTI-STEP RECIPE FORM ──────────────────────────────────── */

  const modal = document.querySelector('#recipeModal');
  const modalClose = document.querySelector('#modalClose');
  const btnAdd = document.querySelector('.btn-add');
  const outputArea = document.querySelector('#recipe-output-area');

  const UNITS = ['tsp', 'tbsp', 'cup', 'oz', 'lb', 'g', 'kg', 'ml', 'L', 'fl oz', 'whole', 'pinch', 'bunch', 'slice', 'piece'];
  const QUANTITIES = ['¼', '⅓', '½', '⅔', '¾', '1', '1¼', '1½', '1¾', '2', '2½', '3', '4', '5', '6', '7', '8', '10', '12', 'as needed'];

  let currentStep = 0;
  let uploadedImage = null;

  let ingredientRows = [{ qty: '1', unit: 'cup', name: '' }];
  let stepRows = [''];

  /* ─── LOCAL STORAGE ───────────────────────────────────────────── */

  //* ---- NEED HELP UNDERSTANDING HOW STORING WORKS----*//
  
  function saveToStorage(name, ingredients, steps, image) {
    localStorage.setItem('hinabi_recipeName', name);
    localStorage.setItem('hinabi_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('hinabi_steps', JSON.stringify(steps));
    localStorage.setItem('hinabi_image', image || '');
  }

  function loadFromStorage() {
    const name = localStorage.getItem('hinabi_recipeName');
    const ingredients = JSON.parse(localStorage.getItem('hinabi_ingredients') || 'null');
    const steps = JSON.parse(localStorage.getItem('hinabi_steps') || 'null');
    const image = localStorage.getItem('hinabi_image') || null;

    if (name) {
      uploadedImage = image || null;
      if (ingredients) ingredientRows = ingredients;
      if (steps) stepRows = steps;
      renderOutput(name, ingredients || [], steps || [], image);
    }
  }

  /* ─── MODAL HELPERS ───────────────────────────────────────────── */

  function openModal() {
    currentStep = 0;
    uploadedImage = null;
    document.querySelector('#recipe-name-input').value = '';
    document.querySelector('#recipe-name-input').style.borderColor = '';
    renderIngredientRows();
    renderStepRows();
    document.querySelector('#uploadPreview').style.display = 'none';
    document.querySelector('#previewImg').src = '';
    showPanel(0);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { document.querySelector('#recipe-name-input').focus(); }, 50);
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showPanel(idx) {
    document.querySelectorAll('.form-panel').forEach(function (p, i) {
      p.classList.toggle('active', i === idx);
    });
    document.querySelectorAll('.modal-progress-step').forEach(function (s, i) {
      s.classList.toggle('done', i < idx);
      s.classList.toggle('active', i === idx);
    });
    currentStep = idx;
  }

  /* ─── INGREDIENT ROWS ─────────────────────────────────────────── */

  function renderIngredientRows() {
    const list = document.querySelector('#ingredients-list');
    list.innerHTML = '';
    ingredientRows.forEach(function (row, i) {
      const div = document.createElement('div');
      div.className = 'ingredient-row';
      div.innerHTML = `
        <select data-i="${i}" data-field="qty">
          ${QUANTITIES.map(function (q) { return `<option value="${q}" ${q === row.qty ? 'selected' : ''}>${q}</option>`; }).join('')}
        </select>
        <select data-i="${i}" data-field="unit">
          ${UNITS.map(function (u) { return `<option value="${u}" ${u === row.unit ? 'selected' : ''}>${u}</option>`; }).join('')}
        </select>
        <input type="text" placeholder="Ingredient name" data-i="${i}" data-field="name" value="${row.name}">
      `;
      list.appendChild(div);
    });

    list.querySelectorAll('select, input').forEach(function (el) {
      el.addEventListener('change', function (e) {
        ingredientRows[+e.target.dataset.i][e.target.dataset.field] = e.target.value;
      });
      el.addEventListener('input', function (e) {
        ingredientRows[+e.target.dataset.i][e.target.dataset.field] = e.target.value;
      });
    });
  }

  document.querySelector('#add-ingredient').addEventListener('click', function () {
    ingredientRows.push({ qty: '1', unit: 'cup', name: '' });
    renderIngredientRows();
    document.querySelector('#ingredients-list').lastElementChild
      .querySelector('input').focus();
  });

  document.querySelector('#remove-ingredient').addEventListener('click', function () {
    if (ingredientRows.length > 1) {
      ingredientRows.pop();
      renderIngredientRows();
    }
  });

  /* ─── STEP ROWS ───────────────────────────────────────────────── */

  function renderStepRows() {
    const list = document.querySelector('#steps-list');
    list.innerHTML = '';
    stepRows.forEach(function (text, i) {
      const div = document.createElement('div');
      div.className = 'step-row';
      div.innerHTML = `
        <span class="step-number">${i + 1}.</span>
        <textarea placeholder="Describe this step…" data-i="${i}">${text}</textarea>
      `;
      list.appendChild(div);
    });
    list.querySelectorAll('textarea').forEach(function (el) {
      el.addEventListener('input', function (e) {
        stepRows[+e.target.dataset.i] = e.target.value;
      });
    });
  }

  document.querySelector('#add-step').addEventListener('click', function () {
    stepRows.push('');
    renderStepRows();
    document.querySelector('#steps-list').lastElementChild
      .querySelector('textarea').focus();
  });

  document.querySelector('#remove-step').addEventListener('click', function () {
    if (stepRows.length > 1) {
      stepRows.pop();
      renderStepRows();
    }
  });

  /* ─── IMAGE UPLOAD ────────────────────────────────────────────── */

  function getImageDimensions(dataURL) {
    return new Promise(function (resolve) {
      const img = new Image();
      img.onload = function () { resolve({ width: img.width, height: img.height }); };
      img.src = dataURL;
    });
  }

  document.querySelector('#photoInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = window.URL.createObjectURL(file);

    getImageDimensions(objectUrl).then(async function ({ width, height }) {
      try {
        if (height < 800 && width < 1000) {
          uploadedImage = objectUrl;
          document.querySelector('#previewImg').src = uploadedImage;
          document.querySelector('#uploadPreview').style.display = 'block';
          return;
        }

        const image = await Jimp.read(objectUrl);

        if (height > width) {
          image.resize(Jimp.AUTO, 800);
        } else {
          image.resize(1000, Jimp.AUTO);
        }

        image.quality(82);

        image.getBase64('image/jpeg', function (err, resizedDataUrl) {
          if (err) {
            console.error('Jimp resize error:', err);
            uploadedImage = objectUrl;
          } else {
            uploadedImage = resizedDataUrl;
          }
          document.querySelector('#previewImg').src = uploadedImage;
          document.querySelector('#uploadPreview').style.display = 'block';
        });

      } catch (err) {
        console.error('Jimp could not process image:', err);
        uploadedImage = objectUrl;
        document.querySelector('#previewImg').src = uploadedImage;
        document.querySelector('#uploadPreview').style.display = 'block';
      }
    });
  });

  /* ─── NAVIGATION ──────────────────────────────────────────────── */

  document.querySelector('#next-0').addEventListener('click', function () {
    const nameInput = document.querySelector('#recipe-name-input');
    if (!nameInput.value.trim()) {
      nameInput.style.borderColor = '#d15410';
      nameInput.focus();
      return;
    }
    nameInput.style.borderColor = '';
    showPanel(1);
  });

  document.querySelector('#back-1').addEventListener('click', function () { showPanel(0); });
  document.querySelector('#next-1').addEventListener('click', function () { showPanel(2); });
  document.querySelector('#back-2').addEventListener('click', function () { showPanel(1); });
  document.querySelector('#next-2').addEventListener('click', function () { showPanel(3); });
  document.querySelector('#back-3').addEventListener('click', function () { showPanel(2); });

  document.querySelector('#next-3').addEventListener('click', function () {
    closeModal();
    renderOutput();
    ingredientRows = [{ qty: '1', unit: 'cup', name: '' }];
    stepRows = [''];
  });

  btnAdd.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  /* ─── RENDER OUTPUT ───────────────────────────────────────────── */

  function renderOutput(
    recipeName,
    filledIngredients,
    filledSteps,
    image
  ) {
    if (recipeName === undefined) recipeName = document.querySelector('#recipe-name-input').value.trim();
    if (filledIngredients === undefined) filledIngredients = ingredientRows.filter(function (r) { return r.name.trim(); });
    if (filledSteps === undefined) filledSteps = stepRows.filter(function (s) { return s.trim(); });
    if (image === undefined) image = uploadedImage;

    saveToStorage(recipeName, filledIngredients, filledSteps, image);

    let photoHTML;
    if (image) {
      photoHTML = `<div class="recipe-output-photo"><img src="${image}" alt="Recipe photo"></div>`;
    } else {
      photoHTML = '';
    }


  // Declare the variable that will hold the ingredients HTML string
let ingredientsHTML;

// Check if there are any ingredients to display
// filledIngredients.length is 0 (falsy) if the array is empty
if (filledIngredients.length) {

  // Build the ingredients HTML string
  ingredientsHTML = `
    
    <!-- Small orange label above the list -->
    <p class="recipe-section-label">Ingredients</p>

    <!-- The list container -->
    <ul class="recipe-ingredients-list">

      ${filledIngredients.map(function (r) {
        // Loop through every ingredient object and turn it into a list item
        // r.qty  = the quantity  e.g. "1"
        // r.unit = the unit      e.g. "cup"
        // r.name = the name      e.g. "flour"
        // produces: <li>1 cup — flour</li>
        return `<li>${r.qty} ${r.unit} — ${r.name}</li>`;
      }).join('')}

    </ul>`;
     //.join('') stitches all the <li> strings together with no separator

} else {

  // If there are no ingredients, set it to an empty string so nothing renders
  ingredientsHTML = '';

}

// Declare the variable that will hold the steps HTML string
let stepsHTML;

// Check if there are any steps to display
// filledSteps.length is 0 (falsy) if the array is empty
if (filledSteps.length) {

  // Build the steps HTML string
  stepsHTML = `

    <!-- Small orange label above the list -->
    <p class="recipe-section-label">Instructions</p>

    <!-- Ordered list container (ol = numbered list) -->
    <ol class="recipe-steps-list">

      ${filledSteps.map(function (s, i) {
        // Loop through every step and turn it into a list item
        // s    = the step text         e.g. "Mix the flour and eggs"
        // i    = the index (0, 1, 2…)
        // i+1  = the step number (1, 2, 3…) so it doesn't start at 0

        // produces: <li><span>1.</span><span>Mix the flour and eggs</span></li>
        return `<li>
          <span class="step-num">${i + 1}.</span>
          <span class="step-text">${s}</span>
        </li>`;
      }).join('')}

    </ol>`;
     // .join('') stitches all the <li> strings together with no separator

} else {

  // If there are no steps, set it to an empty string so nothing renders
  stepsHTML = '';

}

    const pageTitle = document.querySelector('.recipe-title');
    if (pageTitle && recipeName) {
      pageTitle.textContent = recipeName;
    }

    outputArea.innerHTML = `
  <div class="recipe-output">
    ${photoHTML}
    ${ingredientsHTML}
    ${stepsHTML}
  </div>`;

    outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ─── INIT – restore saved recipe on page load ────────────────── */
  //   loadFromStorage();

})();