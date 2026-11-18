  function el(id){return document.getElementById(id);}

  /* ---------------- REVEAL AL HACER SCROLL ---------------- */
  const io=new IntersectionObserver((es)=>{es.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('in'),(i%4)*70);io.unobserve(e.target);}})},{threshold:.14});
  document.querySelectorAll('.reveal').forEach(e=>io.observe(e));

  /* ---------------- SEARCH DOCK (header) ---------------- */
  (function(){
    const dock=el('searchDock');
    const iconBtn=el('searchDockIcon');
    const form=el('searchDockForm');
    const input=el('searchDockInput');
    const closeBtn=el('searchDockClose');
    if(!dock)return;

    function openDock(){ dock.classList.add('is-open'); setTimeout(()=>input.focus(),150); }
    function closeDock(){ dock.classList.remove('is-open'); input.value=''; iconBtn.focus(); }
    iconBtn.addEventListener('click',openDock);
    closeBtn.addEventListener('click',e=>{ e.preventDefault(); closeDock(); });
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const q=input.value.trim();
      if(q) window.location.href='colecciones.html?q='+encodeURIComponent(q);
    });
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&dock.classList.contains('is-open'))closeDock();
    });
  })();

  /* ---------------- MENÚ HAMBURGUESA (móvil) ---------------- */
  (function(){
    const toggle=el('menuToggle');
    const mobileMenu=el('mobileMenu');
    const closeBtn=el('mobileMenuClose');
    if(!toggle||!mobileMenu)return;

    function openMenu(){
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden','false');
      toggle.setAttribute('aria-expanded','true');
      document.body.classList.add('overflow-hidden');
    }
    function closeMenu(){
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden','true');
      toggle.setAttribute('aria-expanded','false');
      document.body.classList.remove('overflow-hidden');
      toggle.focus();
    }
    toggle.addEventListener('click',openMenu);
    closeBtn.addEventListener('click',closeMenu);
    mobileMenu.querySelectorAll('[data-mmclose]').forEach(e=>e.addEventListener('click',closeMenu));
    mobileMenu.querySelectorAll('.mobile-menu__panel a').forEach(a=>a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&mobileMenu.classList.contains('is-open'))closeMenu();
    });
  })();
