/* Header search bar with predictive results (Shopify /search/suggest.json). */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var bar = $('#headerSearch');
  var toggle = $('[data-search-toggle]');
  if (!bar) return;

  function setOpen(open) {
    bar.hidden = !open;
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (open) { var i = $('[data-search-input]', bar); if (i) i.focus(); }
  }
  if (toggle) toggle.addEventListener('click', function () { setOpen(bar.hidden); });
  var close = $('[data-search-close]', bar);
  if (close) close.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function money(dollars) {
    var fmt = (window.theme && theme.moneyFormat) || '${{amount}}';
    var n = Number(dollars);
    if (isNaN(n)) return '';
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, function () { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); });
  }

  var form = $('[data-predictive-search]', bar);
  var input = $('[data-search-input]', form);
  var box = $('[data-search-results]', form);
  var timer, last = '';
  function hide() { box.hidden = true; }

  input.addEventListener('input', function () {
    var q = input.value.trim();
    clearTimeout(timer);
    if (q.length < 2) { hide(); last = ''; return; }
    timer = setTimeout(function () {
      if (q === last) return;
      last = q;
      var url = theme.routes.predictiveSearch + '.json?q=' + encodeURIComponent(q) +
        '&resources[type]=product,page,article&resources[limit]=6&resources[options][unavailable_products]=last';
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        if (input.value.trim() !== q) return;
        var res = (data && data.resources && data.resources.results) || {};
        var html = '';
        var products = res.products || [];
        if (products.length) {
          html += '<h5>' + esc(theme.strings.products) + '</h5>';
          products.forEach(function (p) {
            var img = p.featured_image && p.featured_image.url ? p.featured_image.url : p.image;
            html += '<a class="predictive-item" href="' + esc(p.url) + '">' +
              (img ? '<img src="' + esc(img) + (img.indexOf('?') > -1 ? '&' : '?') + 'width=120" alt="" loading="lazy">' : '') +
              '<span><span class="p-title">' + esc(p.title) + '</span><br><span class="p-price">' + money(p.price) + '</span></span></a>';
          });
        }
        var pages = (res.pages || []).concat(res.articles || []);
        if (pages.length) {
          html += '<h5>' + esc(theme.strings.pages) + '</h5>';
          pages.forEach(function (p) { html += '<a class="predictive-item" href="' + esc(p.url) + '"><span class="p-title">' + esc(p.title) + '</span></a>'; });
        }
        if (!html) html = '<p class="predictive-item">' + esc(theme.strings.noResults) + '</p>';
        html += '<a class="predictive-all" href="' + theme.routes.search + '?q=' + encodeURIComponent(q) + '&options[prefix]=last">' + esc(theme.strings.viewAll) + ' →</a>';
        box.innerHTML = html;
        box.hidden = false;
      }).catch(hide);
    }, 220);
  });
  document.addEventListener('click', function (e) { if (!form.contains(e.target)) hide(); });
})();
