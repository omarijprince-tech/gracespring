/* Blue Star theme — vanilla behaviors in the spirit of the Grace Spring
   React components: header menu + search, qty steppers, ZIP checker,
   product variants/gallery, carousels, slideshows, filters and an AJAX
   cart drawer on Shopify's Cart API. Listeners are delegated so content
   loaded later (recommendations, cart drawer) works without rebinding. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  }

  function formatMoney(cents) {
    var fmt = (window.theme && theme.moneyFormat) || '${{amount}}';
    var n = (cents / 100).toFixed(2);
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, k) {
      if (k === 'amount_no_decimals') return Math.round(cents / 100).toLocaleString('en-US');
      if (k === 'amount_with_comma_separator') return n.replace('.', ',');
      return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
    });
  }

  /* ---------- Header dropdown (compact widths) ---------- */
  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#mobileMenu');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(menu.hidden); });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) setMenu(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- Header search + predictive results ---------- */
  var searchBar = $('#headerSearch');
  var searchToggle = $('[data-search-toggle]');
  function setSearch(open) {
    if (!searchBar) return;
    searchBar.hidden = !open;
    if (searchToggle) searchToggle.setAttribute('aria-expanded', String(open));
    if (open) { setMenu(false); var i = $('[data-search-input]', searchBar); if (i) i.focus(); }
  }
  if (searchToggle) searchToggle.addEventListener('click', function () { setSearch(searchBar.hidden); });
  $$('[data-search-close]').forEach(function (b) { b.addEventListener('click', function () { setSearch(false); }); });

  $$('[data-predictive-search]').forEach(function (form) {
    var input = $('[data-search-input]', form);
    var box = $('[data-search-results]', form);
    if (!input || !box) return;
    var timer, last = '';
    function close() { box.hidden = true; }
    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(timer);
      if (q.length < 2) { close(); return; }
      timer = setTimeout(function () {
        if (q === last) return;
        last = q;
        var url = theme.routes.predictiveSearch + '.json?q=' + encodeURIComponent(q) +
          '&resources[type]=product,page,article&resources[limit]=6&resources[options][unavailable_products]=last';
        fetch(url).then(function (r) { return r.json(); }).then(function (data) {
          var res = (data && data.resources && data.resources.results) || {};
          var html = '';
          var products = res.products || [];
          if (products.length) {
            html += '<h5>' + theme.strings.products + '</h5>';
            products.forEach(function (p) {
              var img = p.featured_image && p.featured_image.url ? p.featured_image.url : p.image;
              var price = p.price !== undefined ? formatMoney(Math.round(parseFloat(p.price) * 100)) : '';
              html += '<a class="predictive-item" href="' + p.url + '">' +
                (img ? '<img src="' + img + (img.indexOf('?') > -1 ? '&' : '?') + 'width=120" alt="" loading="lazy">' : '') +
                '<span><span class="p-title">' + escapeHtml(p.title) + '</span><br><span class="p-price">' + price + '</span></span></a>';
            });
          }
          var pages = (res.pages || []).concat(res.articles || []);
          if (pages.length) {
            html += '<h5>' + theme.strings.pages + '</h5>';
            pages.forEach(function (p) { html += '<a class="predictive-item" href="' + p.url + '"><span class="p-title">' + escapeHtml(p.title) + '</span></a>'; });
          }
          if (!html) html = '<p class="predictive-item">' + theme.strings.noResults + '</p>';
          html += '<a class="predictive-all" href="' + theme.routes.search + '?q=' + encodeURIComponent(q) + '&options[prefix]=last">' + theme.strings.viewAll + ' →</a>';
          box.innerHTML = html;
          box.hidden = false;
        }).catch(close);
      }, 220);
    });
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) close(); });
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    setMenu(false);
    setSearch(false);
    closeCart();
  });

  /* ---------- Quantity steppers (delegated) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-qty] [data-step]');
    if (!b) return;
    var box = b.closest('[data-qty]');
    var input = $('input[name="quantity"]', box);
    var next = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(b.dataset.step, 10));
    input.value = next;
    $('output', box).textContent = next;
  });

  /* ---------- ZIP checker ---------- */
  function parsePrefixes(spec) {
    var list = [];
    (spec || '').split(',').forEach(function (part) {
      var p = part.trim().split('-');
      if (!p[0]) return;
      var a = parseInt(p[0], 10), b = parseInt(p[1] || p[0], 10);
      for (var i = a; i <= b; i++) list.push(i);
    });
    return list;
  }
  $$('[data-zip-checker]').forEach(function (form) {
    var prefixes = parsePrefixes(form.dataset.prefixes);
    var result = form.parentNode.querySelector('[data-zip-result]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var z = form.zip.value.trim();
      result.className = 'zip-result';
      if (!/^\d{5}$/.test(z)) {
        result.textContent = result.dataset.invalid;
        result.classList.add('no');
        return;
      }
      var ok = prefixes.indexOf(parseInt(z.slice(0, 3), 10)) !== -1;
      result.textContent = (ok ? result.dataset.ok : result.dataset.no).replace('[zip]', z);
      result.classList.add(ok ? 'ok' : 'no');
    });
  });

  /* ---------- Product roots: gallery + variant picker ---------- */
  function showImage(root, src, mediaId) {
    var main = $('.product-gallery-main img', root);
    if (main && src) { main.removeAttribute('srcset'); main.src = src; }
    $$('[data-thumb]', root).forEach(function (o) { o.classList.toggle('active', String(o.dataset.mediaId) === String(mediaId)); });
  }

  $$('[data-product-root]').forEach(function (root) {
    $$('[data-thumb]', root).forEach(function (t) {
      t.addEventListener('click', function () { showImage(root, t.dataset.thumb, t.dataset.mediaId); });
    });

    var data = $('[data-variants]', root);
    if (!data) return;
    var variants = JSON.parse(data.textContent);
    var idInput = $('[data-variant-id]', root);
    var btn = $('[data-add-btn]', root);
    var price = $('[data-price]', root);
    var compare = $('[data-compare]', root);
    var isProductPage = !!root.closest('.template-product') && !root.closest('.section');

    $$('[data-option]', root).forEach(function (r) {
      r.addEventListener('change', function () {
        var chosen = $$('.opt-group', root).map(function (g) { var c = $('[data-option]:checked', g); return c ? c.value : null; });
        var v = variants.find(function (x) { return x.options.every(function (o, i) { return o === chosen[i]; }); });
        if (!v) { if (btn) btn.disabled = true; return; }
        if (idInput) idInput.value = v.id;
        if (btn) {
          btn.disabled = !v.available;
          btn.textContent = v.available ? btn.dataset.labelAdd : btn.dataset.labelSold;
        }
        if (price) price.textContent = formatMoney(v.price);
        if (compare) {
          compare.hidden = !(v.compare_at_price > v.price);
          if (v.compare_at_price) compare.textContent = formatMoney(v.compare_at_price);
        }
        if (v.featured_media && v.featured_media.preview_image) {
          showImage(root, v.featured_media.preview_image.src + '&width=1000', v.featured_media.id);
        }
        if (isProductPage) {
          var url = new URL(window.location.href);
          url.searchParams.set('variant', v.id);
          history.replaceState(null, '', url);
        }
      });
    });
  });

  /* ---------- Product carousels ---------- */
  $$('[data-rail]').forEach(function (rail) {
    var wrap = rail.closest('.container');
    var step = function (dir) {
      var card = rail.firstElementChild;
      var w = card ? card.getBoundingClientRect().width + 22 : rail.clientWidth;
      rail.scrollBy({ left: dir * w, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    var prev = $('[data-rail-prev]', wrap), next = $('[data-rail-next]', wrap);
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
  });

  /* ---------- Slideshow with text ---------- */
  $$('[data-slideshow]').forEach(function (show) {
    var track = $('[data-slides]', show);
    var dots = $$('[data-slide-dot]', show);
    var count = track.children.length;
    if (count < 2) return;
    var index = 0, timer = null;
    function go(i) {
      index = (i + count) % count;
      track.scrollTo({ left: track.clientWidth * index, behavior: reduceMotion ? 'auto' : 'smooth' });
      dots.forEach(function (d, k) { d.classList.toggle('active', k === index); });
    }
    track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== index) { index = i; dots.forEach(function (d, k) { d.classList.toggle('active', k === index); }); }
    }, { passive: true });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(parseInt(d.dataset.slideDot, 10)); restart(); }); });
    var p = $('[data-slide-prev]', show), n = $('[data-slide-next]', show);
    if (p) p.addEventListener('click', function () { go(index - 1); restart(); });
    if (n) n.addEventListener('click', function () { go(index + 1); restart(); });
    function restart() {
      clearInterval(timer);
      if (show.dataset.autoplay === 'true' && !reduceMotion) {
        timer = setInterval(function () { go(index + 1); }, parseInt(show.dataset.interval, 10) || 7000);
      }
    }
    show.addEventListener('mouseenter', function () { clearInterval(timer); });
    show.addEventListener('mouseleave', restart);
    restart();
  });

  /* ---------- Crossfading image (image with text) ---------- */
  $$('[data-fader]').forEach(function (box) {
    var slides = $$('.split-slide', box);
    if (slides.length < 2 || reduceMotion) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove('active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
    }, parseInt(box.dataset.interval, 10) || 5000);
  });

  /* ---------- Product recommendations ---------- */
  $$('[data-recommendations]').forEach(function (sec) {
    if (sec.children.length) return;
    fetch(sec.dataset.url).then(function (r) { return r.text(); }).then(function (html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      var fresh = $('[data-recommendations]', tmp);
      if (fresh && fresh.innerHTML.trim()) sec.innerHTML = fresh.innerHTML;
    }).catch(function () {});
  });

  /* ---------- Collection filters: submit on change ---------- */
  $$('[data-facets]').forEach(function (form) {
    var t;
    form.addEventListener('change', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var params = new URLSearchParams(new FormData(form));
        Array.from(params.keys()).forEach(function (k) { if (params.get(k) === '') params.delete(k); });
        window.location.search = params.toString();
      }, 350);
    });
  });

  /* ---------- Share: copy link ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy-link]');
    if (!b) return;
    if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copyLink).then(function () { toast(b.dataset.copied); });
  });

  /* ---------- Cart drawer ---------- */
  var drawer = $('#cartDrawer');
  var overlay = $('[data-cart-overlay]');
  var contents = $('[data-cart-contents]');

  function openCart() {
    if (!drawer) return;
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.focus();
  }
  function closeCart() {
    if (!drawer) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }
  function refreshCart() {
    return fetch(theme.routes.cart + '?view=drawer', { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        contents.innerHTML = html;
        var count = $('[data-drawer-count]', contents);
        if (count) $$('[data-cart-count]').forEach(function (c) { c.textContent = count.textContent; });
      });
  }

  if (drawer) {
    $$('[data-cart-open]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (document.body.classList.contains('template-cart')) return;
        e.preventDefault();
        openCart();
      });
    });
    $$('[data-cart-close]').forEach(function (b) { b.addEventListener('click', closeCart); });
    overlay.addEventListener('click', closeCart);

    contents.addEventListener('click', function (e) {
      var b = e.target.closest('[data-line-change]');
      if (!b) return;
      drawer.classList.add('loading');
      fetch(theme.routes.cartChange + '.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: b.dataset.lineChange, quantity: Math.max(0, parseInt(b.dataset.qtyTo, 10)) })
      })
        .then(refreshCart)
        .catch(function () { toast(theme.strings.error); })
        .finally(function () { drawer.classList.remove('loading'); });
    });

    document.addEventListener('submit', function (e) {
      var form = e.target.closest('form[data-ajax-add]');
      if (!form) return;
      e.preventDefault();
      var submit = $('[type="submit"]', form);
      if (submit) submit.disabled = true;
      fetch(theme.routes.cartAdd + '.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
        .then(function () { return refreshCart(); })
        .then(function () { toast(theme.strings.added); openCart(); })
        .catch(function (err) { toast((err && err.description) || theme.strings.error); })
        .finally(function () { if (submit) submit.disabled = false; });
    });
  }

  /* ---------- Customer login: toggle password recovery ---------- */
  $$('[data-toggle-recover]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      $('#recover').hidden = !$('#recover').hidden;
      $('#login').hidden = !$('#login').hidden;
    });
  });
  if (window.location.hash === '#recover' && $('#recover')) { $('#recover').hidden = false; $('#login').hidden = true; }
})();
