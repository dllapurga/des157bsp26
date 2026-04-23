
  
//   (async () => {
//     const response = await fetch('data.json');
//     const data = await response.json();

//     const langMeta = {
//       "English":   { color: "#7eb8d4", tag: "EN", desc: "West Germanic" },
//       "Cantonese": { color: "#e07b6a", tag: "粵", desc: "Sino-Tibetan" },
//       "Tagalog":   { color: "#82c98a", tag: "TL", desc: "Austronesian" },
//       "Hawaiian":  { color: "#c97bbf", tag: "HAW", desc: "Polynesian" },
//     };

//     const grid = document.getElementById('daysGrid');
//     const panelContent = document.getElementById('panelContent');
//     const emptyState = document.getElementById('emptyState');
//     let activeIndex = null;

//     data.days.forEach((day, i) => {
//       const btn = document.createElement('button');
//       btn.className = 'day-btn';
//       btn.setAttribute('aria-label', day.full);

//       const dateNum = day.date.split(' ')[1];

//       const dotsHTML = day.languages.map(lang => {
//         const c = (langMeta[lang] || {}).color || '#888';
//         return `<div class="day-dot" style="background:${c}"></div>`;
//       }).join('');

//       btn.innerHTML = `
//         <span class="day-label">${day.label}</span>
//         <span class="day-date">${dateNum}</span>
//         <div class="day-dots">${dotsHTML}</div>
//       `;

//       btn.addEventListener('click', () => selectDay(i, btn));
//       grid.appendChild(btn);
//     });

//     function selectDay(index, btn) {
    
//       if (activeIndex === index) {
//         activeIndex = null;
//         btn.classList.remove('active');
//         panelContent.classList.remove('visible');
//         emptyState.style.display = 'flex';
//         return;
//       }

//       activeIndex = index;
//       document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
//       btn.classList.add('active');

//       const day = data.days[index];
//       emptyState.style.display = 'none';

//       panelContent.classList.remove('visible');
//       void panelContent.offsetWidth; 

//       const langsHTML = day.languages.map(lang => {
//         const meta = langMeta[lang] || { color: '#888', tag: '??', desc: '' };
//         return `
//           <div class="lang-item">
//             <div class="lang-pip" style="background:${meta.color}; box-shadow: 0 0 8px ${meta.color}55;"></div>
//             <span class="lang-name">${lang}</span>
//             <span class="lang-tag" style="color:${meta.color}; border-color:${meta.color}55">${meta.tag}</span>
//           </div>
//         `;
//       }).join('');

//       const count = day.languages.length;
//       const plural = count === 1 ? 'language' : 'languages';

//       panelContent.innerHTML = `
//         <p class="panel-date">${day.full}</p>
//         <p class="panel-sublabel">Languages spoken</p>
//         <div class="lang-list">${langsHTML}</div>
//         <div class="divider"></div>
//         <p class="lang-count"><span>${count}</span> ${plural} spoken this day</p>
//       `;

//       panelContent.classList.add('visible');
//     }
  

// })();