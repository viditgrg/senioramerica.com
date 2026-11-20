(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,c){ return (c||document).querySelector(s); };
  var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };
  var clamp = function(v,a,b){ return Math.min(b, Math.max(a, v)); };
  function wide(){ return window.innerWidth > 900; }

  /* header hides on scroll down, returns on scroll up */
  var hdr = $('#hdr'), lastY = window.scrollY;
  var offersSec = document.getElementById('offers');
  function headerState(){ var y = window.scrollY; if (offersSec && window.innerWidth > 900){ var orc = offersSec.getBoundingClientRect(); if (orc.top < 140 && orc.bottom > 360){ hdr.classList.add('hide'); lastY = y; return; } } if (y < 160){ hdr.classList.remove('hide','compact'); } else if (y > lastY + 6){ hdr.classList.add('hide'); } else if (y < lastY - 6){ hdr.classList.remove('hide'); hdr.classList.add('compact'); } lastY = y; }

  /* menu */
  var menu = $('#menu'), menuBtns = $$('.menu-btn'), menuBtn = menuBtns[0];
  function openMenu(){ menu.classList.add('open'); menuBtns.forEach(function(b){ b.setAttribute('aria-expanded','true'); }); document.body.style.overflow='hidden'; setTimeout(function(){ $('.menu-close',menu).focus(); }, 50); }
  function closeMenu(){ menu.classList.remove('open'); menuBtns.forEach(function(b){ b.setAttribute('aria-expanded','false'); }); document.body.style.overflow=''; }
  menuBtns.forEach(function(b){ b.addEventListener('click', function(){ menuBtn = b; openMenu(); }); });
  $$('[data-close]', menu).forEach(function(el){ el.addEventListener('click', closeMenu); });
  var mparents = $$('.mparent', menu);
  mparents.forEach(function(btn){ btn.addEventListener('click', function(){
    var open = btn.getAttribute('aria-expanded') !== 'true';
    mparents.forEach(function(o){ o.setAttribute('aria-expanded','false'); o.parentNode.classList.remove('on'); });
    if (open){ btn.setAttribute('aria-expanded','true'); btn.parentNode.classList.add('on'); }
  }); });
  document.addEventListener('keydown', function(e){ if (e.key==='Escape' && menu.classList.contains('open')){ closeMenu(); menuBtn.focus(); } });

  /* find senior living */
  var form = $('#find'), where = $('#where'), serr = $('#serr');
  form.addEventListener('submit', function(e){
    e.preventDefault(); serr.textContent='';
    var place = where.value.trim();
    if (!place){ serr.textContent='Enter a zip code or city to search.'; where.focus(); return; }
    $('#mType').textContent = $('#ctype').value; $('#mPlace').textContent = place;
    if (!form.classList.contains('expanded')){ form.classList.add('expanded'); $('#goBtn').firstChild.textContent='Update'; setTimeout(function(){ $('#fname').focus({preventScroll:true}); }, 450); return; }
    var n=$('#fname').value.trim(), ph=$('#fphone').value.trim(), em=$('#femail').value.trim();
    if (!n){ serr.textContent='Add your name so your advisor knows who to ask for.'; $('#fname').focus(); return; }
    if (!ph && !em){ serr.textContent='Add a phone number or email so an advisor can reach you.'; $('#fphone').focus(); return; }
    $('#dTitle').textContent='Thank you, '+n.split(' ')[0]+'.';
    $('#dText').textContent='A '+$('#ctype').value+' advisor near '+place+' will contact you shortly.';
    form.classList.add('sent');
  });

  /* mission line: words fill in as you scroll */
  var ml = $('#missionLine'), words = ml ? ml.textContent.trim().split(/\s+/) : []; if (ml) ml.textContent='';
  var wEls = words.map(function(w,i){ var s=document.createElement('span'); s.className='w'; s.textContent = w + (i<words.length-1?' ':''); ml.appendChild(s); if (false){ var br=document.createElement('br'); br.className='mbr'; ml.appendChild(br); } return s; });
  function missionScene(){
    if (!ml) return;
    if (reduce){ wEls.forEach(function(w){ w.classList.add('on'); }); return; }
    var r = ml.getBoundingClientRect(), H = window.innerHeight;
    var p = clamp((H * .85 - r.top) / (H * .45), 0, 1), n = Math.round(p * wEls.length);
    wEls.forEach(function(w,i){ w.classList.toggle('on', i < n); });
  }

  /* reveal */
  if ('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px'});
    $$('.rv').forEach(function(el){ io.observe(el); });
  } else $$('.rv').forEach(function(el){ el.classList.add('in'); });

  /* offers v3.0: pinned scenes. Scroll sets a target position; a damped rAF loop eases the photo column and the
     text toward it, with a short hold on each photo so every feature rests fully in view before the next arrives. */
  var o2s = $$('[data-o2]').map(function(sc){
    return { el: sc, n: +sc.getAttribute('data-n'), track: $('.o2-track', sc), figs: $$('.o2-track figure', sc), imgs: $$('.o2-track img', sc),
      items: $$('.o2-list li', sc), descs: $$('.o2-desc article', sc), bar: $('.o2-meter .bar i', sc), num: $('.o2-meter .cur', sc), cur: 0, act: -1 };
  });
  function o2range(o){ return Math.max(1, o.el.offsetHeight - window.innerHeight); }
  function o2target(o){
    var p = clamp(-o.el.getBoundingClientRect().top / o2range(o), 0, 1), raw = p * (o.n - 1);
    var i = Math.min(Math.floor(raw), o.n - 2), m = clamp((raw - i - .16) / .68, 0, 1);
    return i + m * m * m * (m * (m * 6 - 15) + 10);
  }
  function o2paint(o){
    if (!wide()){ o.figs.forEach(function(f){ f.style.clipPath = ''; f.style.visibility = ''; }); o.imgs.forEach(function(im){ im.style.transform = ''; }); return; }
    var H = o.track.offsetHeight, G = parseFloat(getComputedStyle(o.el).getPropertyValue('--o2-gap')) || 24, R = ' round 28px)';
    var i0 = Math.min(Math.floor(o.cur), o.n - 1), t = o.cur - i0; if (i0 >= o.n - 1){ i0 = o.n - 1; t = 0; }
    var outB = (1 - t) * H - t * G, inT = (1 - t) * (H + G);
    o.figs.forEach(function(f, i){
      var im = o.imgs[i];
      if (i === i0){
        f.style.visibility = ''; f.style.clipPath = 'inset(0 0 ' + Math.max(0, H - outB).toFixed(1) + 'px 0' + R;
        im.style.transform = reduce ? '' : 'scale(' + (1 + t * .03).toFixed(4) + ')';
      } else if (i === i0 + 1 && t > 0){
        f.style.visibility = ''; f.style.clipPath = 'inset(' + Math.max(0, inT).toFixed(1) + 'px 0 0 0' + R;
        im.style.transform = reduce ? '' : 'scale(' + (1.08 - t * .08).toFixed(4) + ')';
      } else { f.style.visibility = 'hidden'; f.style.clipPath = 'inset(0 0 100% 0' + R; }
    });
    var a = Math.round(o.cur);
    if (a !== o.act){
      o.act = a;
      o.items.forEach(function(li, i){ li.classList.toggle('on', i === a); var bt = li.querySelector('button'); if (bt) bt.setAttribute('aria-expanded', i === a ? 'true' : 'false'); });
      o.descs.forEach(function(ar, i){ ar.classList.toggle('on', i === a); ar.setAttribute('aria-hidden', i === a ? 'false' : 'true'); });
      if (o.num) o.num.textContent = (a < 9 ? '0' : '') + (a + 1);
    }
    if (o.bar) o.bar.style.transform = 'scaleX(' + (o.cur / (o.n - 1)).toFixed(4) + ')';
  }
  var o2raf = 0;
  function o2tick(){
    o2raf = 0; var again = false, H = window.innerHeight;
    o2s.forEach(function(o){
      var r = o.el.getBoundingClientRect(); if (r.bottom < -H || r.top > H * 2) return;
      var t = wide() ? o2target(o) : 0;
      if (reduce) o.cur = t; else { o.cur += (t - o.cur) * .12; if (Math.abs(t - o.cur) < .0004) o.cur = t; else again = true; }
      o2paint(o);
    });
    if (again) o2raf = requestAnimationFrame(o2tick);
  }
  function offersScene(){ if (!o2raf) o2raf = requestAnimationFrame(o2tick); }
  o2s.forEach(function(o){
    $$('[data-go]', o.el).forEach(function(b){
      b.addEventListener('click', function(){
        var i = +b.getAttribute('data-go'), top = o.el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + o2range(o) * (i / (o.n - 1)), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  });

  /* two apps: pinned on desktop; scrolling rolls both step lists up into the centre together */
  var appsSec = $('#appsPin'), wheels = $$('[data-wheel]'), dots = $$('#appDots button'), grid = $('#appsGrid');
  var aCur = -1, aTimer = null, aVis = false;
  function prog(el){ var r = el.getBoundingClientRect(), range = el.offsetHeight - window.innerHeight; return range > 0 ? clamp(-r.top / range, 0, 1) : 0; }
  function paintWheel(f){
    wheels.forEach(function(w){
      var ol = $('ol', w), lis = $$('li', w), h = lis[0].offsetHeight;
      ol.style.transform = 'translateY(' + (-(f + .5) * h) + 'px)';
      lis.forEach(function(li,k){
        var d = k - f, ad = Math.abs(d);
        var op = d < 0 ? clamp(1 - ad * 1.25, 0, 1) : clamp(1 - ad * .62, .18, 1);
        li.style.opacity = op;
        li.style.transform = 'scale(' + (1 - Math.min(ad,1) * .14) + ')';
        li.classList.toggle('on', ad < .5);
      });
    });
  }
  function setScreen(i){
    if (i === aCur) return; aCur = i;
    $$('[data-phone]').forEach(function(ph){ $$('.shot', ph).forEach(function(im,k){ im.classList.toggle('on', k === i); }); });
    dots.forEach(function(d,k){ d.classList.toggle('done', k <= i); d.classList.remove('on'); });
    var hh = document.getElementById('hlHeart'); if (hh && !reduce){ hh.classList.remove('pop'); void hh.offsetWidth; hh.classList.add('pop'); clearTimeout(hh._t); hh._t = setTimeout(function(){ hh.classList.remove('pop'); }, 720); }
  }
  function appsScene(){
    if (!wide()) return;
    var r = appsSec.getBoundingClientRect(); if (r.bottom < -40 || r.top > window.innerHeight + 40) return;
    var p = reduce ? 0 : prog(appsSec), f = clamp(p * 1.12 - .04, 0, 1) * 3;
    paintWheel(f); setScreen(Math.round(f));
  }
  function jumpStep(k){
    if (!wide()){ mobileStep(k); return; }
    var top = appsSec.getBoundingClientRect().top + window.scrollY, range = appsSec.offsetHeight - window.innerHeight;
    window.scrollTo({top: top + range * ((k / 3 + .04) / 1.12), behavior: reduce ? 'auto':'smooth'});
  }
  /* mobile: not pinned, steps advance on a timer instead */
  function mobileStep(k){ var f = (k + 4) % 4; paintWheel(f); aCur = -1; setScreen(f); clearTimeout(aTimer); if (aVis && !reduce && window.innerWidth > 600) aTimer = setTimeout(function(){ mobileStep(f + 1); }, 3400); }
  wheels.forEach(function(w){ $$('li', w).forEach(function(li){ li.addEventListener('click', function(){ jumpStep(+li.getAttribute('data-k')); }); }); });
  dots.forEach(function(d,k){ d.addEventListener('click', function(){ jumpStep(k); }); });
  if ('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ aVis = e.isIntersecting; if (!wide()){ if (aVis) mobileStep(Math.max(aCur,0)); else clearTimeout(aTimer); } }); }, {threshold:.3}).observe(grid); }
  paintWheel(0); setScreen(0);

  /* stories carousel */
  var track = $('#track');
  function stepStory(dir){ var c = $('.story', track); track.scrollBy({left: dir * (c.offsetWidth + 22), behavior: reduce ? 'auto':'smooth'}); }
  $('#sPrev').addEventListener('click', function(){ stepStory(-1); });
  $('#sNext').addEventListener('click', function(){ stepStory(1); });

  var fc = $('#fcard');
  if (fc){ if ('IntersectionObserver' in window && !reduce){ var fio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ fc.classList.add('drawn'); fio.disconnect(); } }); }, {threshold:.25}); fio.observe(fc); } else fc.classList.add('drawn'); }
  $('#toTop').addEventListener('click', function(){ window.scrollTo({top:0, behavior: reduce ? 'auto':'smooth'}); });

  var ticking = false;
  function frame(){ ticking = false; headerState(); missionScene(); offersScene(); appsScene(); }
  window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(frame); } }, {passive:true});
  window.addEventListener('resize', function(){ frame(); });
  frame();
})();

(function(){
  /* v2.9: each step carries its own app screen; on phones it opens under the step you pick */
  document.querySelectorAll('[data-wheel]').forEach(function(w){
    var app = w.getAttribute('data-wheel');
    var shots = document.querySelectorAll('[data-phone="' + app + '"] .shot');
    w.querySelectorAll('li').forEach(function(li, k){
      var src = shots[k]; if (!src) return;
      var box = document.createElement('div'); box.className = 'step-shot';
      var inn = document.createElement('div'); inn.className = 'ss-in';
      var ph = document.createElement('div'); ph.className = 'phone';
      var scr = document.createElement('div'); scr.className = 'scr';
      var c = src.cloneNode(true); c.classList.add('on'); scr.appendChild(c);
      ph.appendChild(scr); inn.appendChild(ph); box.appendChild(inn); li.appendChild(box);
      li.setAttribute('role', 'button'); li.setAttribute('tabindex', '0');
      li.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); li.click(); } });
      li.addEventListener('click', function(){
        if (window.innerWidth > 600) return;
        var prev = w.querySelector('li.on'), top0 = li.getBoundingClientRect().top;
        var ps = prev && prev !== li ? prev.querySelector('.step-shot') : null;
        if (ps) ps.style.transition = 'none';
        requestAnimationFrame(function(){
          var d = li.getBoundingClientRect().top - top0;
          if (Math.abs(d) > 1) window.scrollBy(0, d);
          if (ps) requestAnimationFrame(function(){ ps.style.transition = ''; });
          w.querySelectorAll('li').forEach(function(o){ o.setAttribute('aria-expanded', o.classList.contains('on') ? 'true' : 'false'); });
        });
      }, true);
    });
    w.querySelectorAll('li').forEach(function(o){ o.setAttribute('aria-expanded', o.classList.contains('on') ? 'true' : 'false'); });
  });
})();

