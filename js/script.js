/* js/script.js
   Vanilla JS for Japhet's Wings site
   Features: mobile nav toggle, dropdown, sticky header, scroll reveal, counters, hero network animation, smooth scroll, current year
*/
(function(){
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-menu');
  const siteHeader = document.getElementById('site-header');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('show');
      navToggle.querySelector('.hamburger').classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e)=>{
      if(!navList.contains(e.target) && !navToggle.contains(e.target)){
        navList.classList.remove('show');
        navToggle.setAttribute('aria-expanded','false');
      }
    });
  }

  // Dropdown
  document.querySelectorAll('.has-dropdown').forEach((item)=>{
    const btn = item.querySelector('.dropdown-toggle');
    const menu = item.querySelector('.dropdown');
    btn.addEventListener('click',(e)=>{
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('open');
    });
    // keyboard support
    btn.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        item.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
        btn.focus();
      }
    });
  });

  // Sticky header shadow on scroll
  const headerObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) siteHeader.classList.add('scrolled');
      else siteHeader.classList.remove('scrolled');
    });
  },{root:null,threshold:0,rootMargin:'-80px 0px 0px 0px'});
  headerObserver.observe(document.querySelector('#hero'));

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href === '#') return;
      if(href.startsWith('#')){
        e.preventDefault();
        const target = document.querySelector(href);
        if(target){
          const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
          window.scrollTo({top,behavior: prefersReducedMotion ? 'auto' : 'smooth'});
          // close mobile menu after click
          if(navList.classList.contains('show')){
            navList.classList.remove('show');
            navToggle.setAttribute('aria-expanded','false');
          }
        }
      }
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if(revealEls.length){
    const observer = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    },{threshold:0.12});
    revealEls.forEach(el=>observer.observe(el));
  }

  // Animated counters
  const counters = document.querySelectorAll('.number');
  if(counters.length){
    const counterObserver = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const el = entry.target;
          const target = Number(el.dataset.target) || 0;
          let start = 0;
          const duration = 1500;
          const startTime = performance.now();
          function step(now){
            const progress = Math.min((now - startTime) / duration, 1);
            el.textContent = Math.floor(progress * target + 0.0001);
            if(progress < 1) requestAnimationFrame(step);
            else el.textContent = target + (target>1?'+':'');
          }
          if(!prefersReducedMotion) requestAnimationFrame(step);
          else el.textContent = target;
          obs.unobserve(el);
        }
      });
    },{threshold:0.6});
    counters.forEach(c=>counterObserver.observe(c));
  }

  // Current year
  const yearEl = document.getElementById('current-year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Hero network canvas animation
  function setupHeroCanvas(){
    const container = document.querySelector('.hero-canvas');
    if(!container) return;
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height, nodes;
    function resize(){
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    }

    function initNodes(){
      nodes = [];
      const count = Math.max(6, Math.floor(width/160));
      for(let i=0;i<count;i++){
        nodes.push({
          x:Math.random()*width,
          y:Math.random()*height,
          vx:(Math.random()*1-0.5)*0.4,
          vy:(Math.random()*1-0.5)*0.4,
          r:2+Math.random()*3
        });
      }
    }

    function draw(){
      ctx.clearRect(0,0,width,height);
      // lines
      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
          const a = nodes[i], b = nodes[j];
          const dx = a.x-b.x, dy = a.y-b.y;
          const d = Math.sqrt(dx*dx+dy*dy);
          if(d<120){
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(6,182,212,'+(1 - d/120)*0.12+')';
            ctx.lineWidth = 1;
            ctx.moveTo(a.x,a.y);
            ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      nodes.forEach(n=>{
        ctx.beginPath();
        const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*6);
        g.addColorStop(0,'rgba(6,182,212,0.9)');
        g.addColorStop(0.4,'rgba(37,99,235,0.35)');
        g.addColorStop(1,'rgba(6,182,212,0)');
        ctx.fillStyle = g;
        ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fill();
      });
    }

    function step(){
      for(let n of nodes){
        n.x += n.vx; n.y += n.vy;
        if(n.x<0||n.x>width) n.vx *= -1;
        if(n.y<0||n.y>height) n.vy *= -1;
      }
      draw();
      if(!prefersReducedMotion) requestAnimationFrame(step);
    }

    window.addEventListener('resize', ()=>{resize();initNodes();});
    resize();initNodes();step();
  }
  setupHeroCanvas();

  // Mark core sections with reveal class for animation
  document.querySelectorAll('section').forEach(sec=>sec.classList.add('reveal'));

})();
