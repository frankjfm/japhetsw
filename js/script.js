/* js/script.js - enhanced interactions: theme toggle, modal, portfolio filters, contact form */
(function(){
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav toggle for mobile
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('primary-menu');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.style.display = expanded ? 'none' : 'flex';
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  function applySavedTheme(){
    const t = localStorage.getItem('theme');
    if(t === 'light') document.documentElement.classList.add('light');
  }
  applySavedTheme();
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      document.documentElement.classList.toggle('light');
      const isLight = document.documentElement.classList.contains('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      themeToggle.textContent = isLight ? '☀️' : '🌙';
    });
  }

  // Active nav link
  document.querySelectorAll('.nav-list a').forEach(a=>{
    if(location.pathname.endsWith(a.getAttribute('href')) || (location.pathname === '/' && a.getAttribute('href').endsWith('index.html'))){
      a.setAttribute('aria-current','page');
    }
  });

  // Reveal / counters
  const counters = document.querySelectorAll('.number');
  if(counters.length){
    const counterObserver = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const el = entry.target;
          const target = Number(el.dataset.target) || 0;
          let start = 0;
          const duration = 1200;
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

  // Project modal
  const modal = document.getElementById('project-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  function openModal(title,desc){
    if(!modal) return;
    modal.setAttribute('aria-hidden','false');
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
  }
  function closeModal(){
    if(!modal) return;
    modal.setAttribute('aria-hidden','true');
  }
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.open-project');
    if(btn){
      openModal(btn.dataset.title, btn.dataset.desc);
    }
    if(e.target.closest('.modal-close') || (e.target === modal)) closeModal();
  });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeModal(); });

  // Portfolio filters
  document.querySelectorAll('.filter').forEach(f=>{
    f.addEventListener('click', ()=>{
      document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));
      f.classList.add('active');
      const filter = f.dataset.filter;
      document.querySelectorAll('.project').forEach(p=>{
        if(filter === 'all' || p.dataset.category === filter) p.style.display = '';
        else p.style.display = 'none';
      });
    });
  });

  // Contact form (fake submit)
  const form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const status = document.getElementById('form-status');
      status.textContent = 'Sending…';
      setTimeout(()=>{
        status.textContent = 'Thanks — your message has been received. We will reply soon.';
        form.reset();
      },1000);
    });
  }

})();
