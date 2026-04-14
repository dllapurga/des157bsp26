(function () {
'use strict';
console.log('reading js');

document.addEventListener('DOMContentLoaded', () => {
  const h1 = document.querySelector('h1');
  
  h1.innerHTML = [...h1.textContent]
    .map(c => `<span style="display:inline-block;transition:transform 0.6s,opacity 0.6s">${c === ' ' ? '&nbsp;' : c}</span>`)
    .join('');

  h1.addEventListener('mouseenter', () => {
    h1.querySelectorAll('span').forEach(s => {
      s.style.transform = `translate(${(Math.random()-.5)*600}px,${(Math.random()-.5)*400}px) rotate(${Math.random()*720}deg)`;
      s.style.opacity = 0;
    });
  });

  h1.addEventListener('mouseleave', () => {
    h1.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity = '';
    });
  });
});

})();