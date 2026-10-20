/* Blue Star theme — small vanilla behaviors ported from the Grace Spring
   React components: header menu, qty steppers, ZIP checker, product
   gallery/variants, and an AJAX cart drawer on Shopify's Cart API. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

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

  /* ---------- Header dropdown (compact widths) ---------- */
  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#mobileMenu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(menu.hidden); });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- Quantity steppers on product forms ---------- */
  $$('[data-qty]').forEach(function (box) {
    var out = $('output', box);
    var input = $('input[name="quantity"]', box);
    $$('[data-step]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var next = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(b.dataset.step, 10));
        input.value = next;
        out.textContent = next;
      });
    });
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

  /* ---------- Product page: gallery + variant picker ---------- */
  $$('[data-gallery]').forEach(function (g) {
    var main = $('.product-gallery-main img', g);
    $$('[data-thumb]', g).forEach(function (t) {
      t.addEventListener('click', function () {
        if (main) { main.removeAttribute('srcset'); main.src = t.dataset.thumb; }
        $$('[data-thumb]', g).forEach(function (o) { o.classList.toggle('active', o === t); });
      });
    });
  });

  function formatMoney(cents) {
    var fmt = (window.theme && theme.moneyFormat) || '${{amount}}';
    var n = (cents / 100).toFixed(2);
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, k) {
      if (k === 'amount_no_decimals') return Math.round(cents / 100).toLocaleString('en-US');
      if (k === 'amount_with_comma_separator') return n.replace('.', ',');
      return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 });
    });
  }

  $$('[data-product-form]').forEach(function (form) {
    var data = $('[data-variants]', form);
    if (!data) return;
    var variants = JSON.parse(data.textContent);
    var idInput = $('[data-variant-id]', form);
    var btn = $('[data-add-btn]', form);
    var price = $('[data-price]');
    var compare = $('[data-compare]');
    $$('[data-option]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        var chosen = $$('[data-option]:checked', form).map(function (i) { return i.value; });
        var v = variants.find(function (x) { return x.options.every(function (o, i) { return o === chosen[i]; }); });
        if (!v) { btn.disabled = true; return; }
        idInput.value = v.id;
        btn.disabled = !v.available;
        btn.textContent = v.available ? btn.dataset.labelAdd : btn.dataset.labelSold;
        if (price) price.textContent = formatMoney(v.price);
        if (compare) {
          compare.hidden = !(v.compare_at_price > v.price);
          if (v.compare_at_price) compare.textContent = formatMoney(v.compare_at_price);
        }
        var url = new URL(window.location.href);
        url.searchParams.set('variant', v.id);
        history.replaceState(null, '', url);
      });
    });
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
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

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

    $$('form[data-ajax-add]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
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
