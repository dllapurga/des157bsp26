    /* ── AOS init ── */
    AOS.init({
      duration: 800,
      easing: 'ease-out-quart',
      once: true,
      offset: 60,
    });

    /* ── GSAP hero headline stagger word reveal ── */
    (function () {
      const headline = document.getElementById('heroHeadline');
      if (!headline) return;

      // split into word-spans
      const rawHTML = headline.innerHTML;
      const lines = rawHTML.split('<br>');
      headline.innerHTML = lines.map(line => {
        const words = line.trim().split(/\s+/);
        return words.map(w => {
          // preserve em tags
          return `<span class="word-wrap"><span class="word-inner">${w}</span></span>`;
        }).join(' ');
      }).join('<br>');

      const inners = headline.querySelectorAll('.word-inner');

      gsap.to(inners, {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
        delay: 0.3,
      });
    })();

    /* ── GSAP masthead letters animate on load ── */
    (function () {
      const h1 = document.querySelector('.masthead-title h1');
      if (!h1) return;

      const text = h1.innerHTML;
      let wrapped = '';
      let inTag = false;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === '<') { inTag = true; wrapped += text[i]; continue; }
        if (text[i] === '>') { inTag = false; wrapped += text[i]; continue; }
        if (inTag) { wrapped += text[i]; continue; }
        if (text[i] === ' ') { wrapped += ' '; continue; }
        wrapped += `<span class="mletter" style="display:inline-block;">${text[i]}</span>`;
      }
      h1.innerHTML = wrapped;

      gsap.fromTo('.mletter', 
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.04,
          delay: 0.1,
        }
      );
    })();

    /* ── GSAP nav links stagger in ── */
    gsap.fromTo('nav a',
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08, delay: 0.6 }
    );

    /* ── AOS gold rule in identity section ── */
    const ruleEl = document.querySelector('.rule-grow');
    if (ruleEl) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            gsap.to(ruleEl, { width: '100%', duration: 1.4, ease: 'power3.out', delay: 0.4 });
            obs.disconnect();
          }
        });
      }, { threshold: 0.4 });
      obs.observe(ruleEl);
    }

    /* ── GSAP pull-quote word reveal on scroll ── */
    const pq = document.querySelector('.pull-quote');
    if (pq) {
      const words = pq.innerHTML.split(/(\s+)/);
      pq.innerHTML = words.map(w =>
        w.trim() ? `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;"><span class="pqw" style="display:inline-block;">${w}</span></span>` : w
      ).join('');

      const pqObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            gsap.fromTo('.pqw',
              { y: '105%', opacity: 0 },
              { y: '0%', opacity: 1, duration: 0.9, ease: 'power4.out', stagger: 0.04 }
            );
            pqObs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      pqObs.observe(pq);
    }