(function () {
  var KEY = 'an_cookie_consent';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function update(v) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: v === 'granted' ? 'granted' : 'denied' });
    }
  }
  function build() {
    var el = document.createElement('div');
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie preferences');
    var base = document.querySelector('a[href$="cookies.html"]');
    var href = base ? base.getAttribute('href') : 'cookies.html';
    el.innerHTML = '<p>We use analytics cookies to understand how the site is used and improve it. They are only set if you accept. <a href="' + href + '">Cookie Policy</a></p>' +
      '<div class="cookie-actions"><button type="button" class="cookie-btn cookie-decline">Decline</button><button type="button" class="cookie-btn cookie-accept">Accept</button></div>';
    document.body.appendChild(el);
    el.querySelector('.cookie-accept').addEventListener('click', function () { set('granted'); update('granted'); el.remove(); });
    el.querySelector('.cookie-decline').addEventListener('click', function () { set('denied'); update('denied'); el.remove(); });
  }
  function show() { if (!document.querySelector('.cookie-banner')) build(); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) { e.preventDefault(); show(); }
  });
  if (!get()) show();
})();
