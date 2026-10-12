/* The Brown Girls Creative Studio - visitor tracker (uses your existing Supabase project).
   Add to index.html, labs.html, class-projects.html and lab-projects.html, just before </body>:
   <script src="tracker.js" defer></script>
   Logs: page, day/time, city/region/country (no IP address saved), device, and active seconds on the page. */
(function () {
  var SB_URL = "https://qlgnstoesdzmkcmyaqyw.supabase.co", SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZ25zdG9lc2R6bWtjbXlhcXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczNjg2NDgsImV4cCI6MjEwMjk0NDY0OH0.7p3zQALq-208_CLcHEsHAEePx0QoA4AN8BxCrzJ9CuQ";
  if (navigator.webdriver) return;
  var ls = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  if (/[?&]notrack/.test(location.search)) ls('bgcs_notrack', '1');
  if (ls('bgcs_notrack') === '1') return; /* devices that opened your Dashboard are skipped */
  function rid() { var a = new Uint8Array(10); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  var vid = ls('bgcs_vid'), ret = !!vid; if (!vid) { vid = rid(); ls('bgcs_vid', vid); }
  var sid = rid(), ua = navigator.userAgent;
  var dev = (/iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) ? 'Tablet' : (/Mobi|iPhone|Android.*Mobile/i.test(ua) ? 'Phone' : 'Computer');
  var os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : 'Other';
  var br = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var refHost = ''; try { refHost = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
  var H = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };
  function geo() {
    try { var c = sessionStorage.getItem('bgcs_geo'); if (c) return Promise.resolve(JSON.parse(c)); } catch (e) {}
    var ctl = new AbortController(); setTimeout(function () { ctl.abort(); }, 3500);
    return fetch('https://ipwho.is/?fields=success,city,region,country', { signal: ctl.signal }).then(function (r) { return r.json(); }).then(function (j) {
      var g = j && j.success ? { city: j.city || '', region: j.region || '', country: j.country || '' } : {};
      try { sessionStorage.setItem('bgcs_geo', JSON.stringify(g)); } catch (e) {} return g;
    }).catch(function () { return {}; });
  }
  geo().then(function (g) {
    var sec = 0, sent = 0;
    fetch(SB_URL + '/rest/v1/site_visits', { method: 'POST', headers: Object.assign({ 'Prefer': 'return=minimal' }, H), keepalive: true,
      body: JSON.stringify({ sid: sid, vid: vid, t: Date.now(), page: page, title: (document.title || '').slice(0, 100), ref: refHost, dev: dev, os: os, br: br,
        sw: screen.width, sh: screen.height, tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || ''), city: g.city || '', region: g.region || '', country: g.country || '', ret: ret, sec: 0 }) }).catch(function () {});
    function flush() { if (sec !== sent) { sent = sec; fetch(SB_URL + '/rest/v1/rpc/bump_visit', { method: 'POST', headers: H, keepalive: true, body: JSON.stringify({ p_sid: sid, p_sec: sec }) }).catch(function () {}); } }
    setInterval(function () { if (document.visibilityState === 'visible') sec++; if (sec % 15 === 0) flush(); }, 1000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(); });
    window.addEventListener('pagehide', flush);
  });
})();
