let isMakai = false;
let animating = false;

function toggleTheme(e) {
  if (animating) return;
  animating = true;

  const portal = document.querySelector('#portal');
  const curtain = document.querySelector('#curtain');
  const rippleLayer = document.querySelector('#rippleLayer');
  const shimmerLine = document.querySelector('#shimmerLine');
  const bgMakai = portal.querySelector('.bg-makai');
  const switchEl = document.querySelector('#switchTrack');
  const pl = document.querySelector('#pill-label');

  const rect = switchEl.getBoundingClientRect();
  const pRect = portal.getBoundingClientRect();
  const rx = rect.left + rect.width  / 2 - pRect.left;
  const ry = rect.top  + rect.height / 2 - pRect.top;
  const size = Math.max(pRect.width, pRect.height) * 2.5;

  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  const rippleColor = isMakai ? '#6aab82' : '#4aaed8';
  ripple.style.cssText = `left:${rx - size/2}px;top:${ry - size/2}px;width:${size}px;height:${size}px;background:${rippleColor};`;
  rippleLayer.appendChild(ripple);

  const lineColor = isMakai ? '#6aab82' : '#4aaed8';
  shimmerLine.style.cssText = `left:-3px;background:linear-gradient(to bottom,transparent,${lineColor}80,${lineColor},${lineColor}80,transparent);opacity:0;transition:left 0.55s cubic-bezier(0.77,0,0.18,1),opacity 0.1s;`;
  setTimeout(() => {
    shimmerLine.style.opacity = '0.8';
    shimmerLine.style.left = '101%';
  }, 10);

  curtain.style.transition = 'none';
  curtain.style.clipPath   = 'ellipse(0% 60% at 0% 50%)';
  curtain.classList.remove('sweeping');
  setTimeout(() => {
    curtain.style.transition = 'clip-path 0.55s cubic-bezier(0.77,0,0.18,1)';
    curtain.classList.add('sweeping');
  }, 30);

  setTimeout(() => {
    isMakai = !isMakai;
    if (isMakai) {
      portal.classList.replace('mauka-active', 'makai-active');
      portal.classList.add('reveal');
      bgMakai.style.transition = 'clip-path 0.55s cubic-bezier(0.77,0,0.18,1)';
      bgMakai.style.clipPath   = 'ellipse(160% 120% at 110% 50%)';
      pl.textContent = 'Makai — Seaward Side';
    } else {
      portal.classList.replace('makai-active', 'mauka-active');
      portal.classList.remove('reveal');
      bgMakai.style.transition = 'clip-path 0.55s cubic-bezier(0.77,0,0.18,1)';
      bgMakai.style.clipPath   = 'ellipse(0% 60% at 110% 50%)';
      pl.textContent = 'Mauka — Mountain Side';
    }
  }, 300);

  setTimeout(() => {
    curtain.style.transition = 'clip-path 0.5s cubic-bezier(0.77,0,0.18,1)';
    curtain.style.clipPath   = 'ellipse(0% 60% at 110% 50%)';
    curtain.classList.remove('sweeping');
  }, 550);

  setTimeout(() => {
    ripple.remove();
    shimmerLine.style.opacity = '0';
    shimmerLine.style.left    = '-3px';
    animating = false;
  }, 1100);
}
