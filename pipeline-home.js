/* Pipeline home: the new face. Loaded after the main pipeline script; it replaces renderHome().
   Brown and gold, light 3D depth, one clear next action, live data, market digest, and a coach chat. */
(function () {
  'use strict';
  var BUILD = (function () { try { var m = /[?&]b=([^&]+)/.exec((document.currentScript && document.currentScript.src) || ''); return m ? decodeURIComponent(m[1]) : '0'; } catch (e) { return '0'; } })();
  try { if (/[?&]r=\d+/.test(location.search) && history.replaceState) history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}

  var CHAT_URL = 'https://qlgnstoesdzmkcmyaqyw.supabase.co/functions/v1/pipeline-chat';
  var STAGES = ['Prospect', 'Email Drafted', 'First Touch Sent', 'Lead', 'Invoice Pending', 'Closed Won'];
  var STAGE_HINT = { 'Prospect': 'Researching', 'Email Drafted': 'Ready to send', 'First Touch Sent': 'Waiting', 'Lead': 'They replied', 'Invoice Pending': 'Almost paid', 'Closed Won': 'Signed' };
  var reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var E = function (x) { return String(x == null ? '' : x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var S = { tab: (function () { try { return localStorage.getItem('bgcs_home_tab') || 'today'; } catch (e) { return 'today'; } })(), skip: 0, showAll: false, newsFilter: 'All', news: null, newsErr: false, timer: null, timerLeft: 0, animated: false };

  /* ---------- styles ---------- */
  var css = [
    '#homeCmd{position:relative;isolation:isolate;overflow-x:clip;--g:#C7994F;--gl:#E3BD79;--tx:#F3E8D6;--mu:#CDBA99;padding:6px 0 90px}',
    '#homeCmd:before,#homeCmd:after{content:"";position:absolute;z-index:-1;border-radius:50%;filter:blur(70px);opacity:.28;pointer-events:none}',
    '#homeCmd:before{width:420px;height:420px;left:-120px;top:-60px;background:#8a5a2b;animation:hxf1 18s ease-in-out infinite alternate}',
    '#homeCmd:after{width:360px;height:360px;right:-100px;top:240px;background:#C7994F;animation:hxf2 22s ease-in-out infinite alternate}',
    '@keyframes hxf1{to{transform:translate(70px,50px)}}@keyframes hxf2{to{transform:translate(-60px,-40px)}}',
    '.hx-grid{display:grid;gap:16px;grid-template-columns:repeat(12,minmax(0,1fr))}',
    '.hx-grid>*{grid-column:span 12;min-width:0}',
    '@media(min-width:1024px){.hx-7{grid-column:span 7}.hx-5{grid-column:span 5}.hx-4{grid-column:span 4}.hx-8{grid-column:span 8}}',
    '.hx-card{position:relative;border-radius:22px;padding:18px 20px;color:var(--tx);background:linear-gradient(145deg,rgba(74,45,29,.82),rgba(29,19,14,.94));border:1px solid rgba(199,153,79,.24);box-shadow:0 1px 0 rgba(255,235,200,.08) inset,0 18px 40px -18px rgba(0,0,0,.75),0 4px 10px -4px rgba(0,0,0,.5);transition:transform .25s ease,box-shadow .25s ease,border-color .25s;transform-style:preserve-3d;will-change:transform}',
    '.hx-card:hover{border-color:rgba(227,189,121,.5);box-shadow:0 1px 0 rgba(255,235,200,.1) inset,0 26px 50px -20px rgba(0,0,0,.85),0 0 0 1px rgba(199,153,79,.08)}',
    '.hx-card .hx-z{transform:translateZ(22px)}',
    '.hx-k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:var(--g);margin-bottom:8px}',
    '.hx-h1{font-family:Fraunces,Georgia,serif;font-size:clamp(1.55rem,3.2vw,2.2rem);line-height:1.12;font-weight:700;color:var(--tx)}',
    '.hx-mu{color:var(--mu);font-size:13px;line-height:1.5}',
    '.hx-btn{display:inline-flex;align-items:center;gap:6px;border-radius:14px;padding:10px 16px;font-weight:800;font-size:13px;cursor:pointer;border:1px solid rgba(199,153,79,.4);color:var(--tx);background:rgba(199,153,79,.1);transition:transform .15s,background .15s,box-shadow .15s}',
    '.hx-btn:hover{background:rgba(199,153,79,.2);transform:translateY(-2px)}.hx-btn:active{transform:translateY(0) scale(.98)}',
    '.hx-btn.pri{background:linear-gradient(135deg,#E3BD79,#C7994F);color:#2A160E;border-color:transparent;box-shadow:0 10px 24px -10px rgba(199,153,79,.8)}',
    '.hx-btn.pri:hover{background:linear-gradient(135deg,#F0CC8C,#D3A55A)}',
    '.hx-next{background:linear-gradient(145deg,rgba(98,60,34,.9),rgba(34,21,15,.96));border-color:rgba(227,189,121,.4)}',
    '.hx-pulse{display:inline-block;width:9px;height:9px;border-radius:50%;background:#E3BD79;box-shadow:0 0 0 0 rgba(227,189,121,.7);animation:hxp 2s infinite;margin-right:8px}',
    '@keyframes hxp{70%{box-shadow:0 0 0 10px rgba(227,189,121,0)}100%{box-shadow:0 0 0 0 rgba(227,189,121,0)}}',
    '.hx-ring{width:150px;height:150px;flex:none}.hx-ring circle{fill:none;stroke-width:11;stroke-linecap:round}',
    '.hx-ring .bg{stroke:rgba(255,235,200,.09)}.hx-ring .fg{stroke:url(#hxg);transition:stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 0 8px rgba(227,189,121,.5))}',
    '.hx-river{display:flex;gap:10px;overflow-x:auto;padding:6px 2px 10px;scroll-snap-type:x proximity}',
    '.hx-stage{flex:1 0 128px;scroll-snap-align:start;position:relative;border-radius:18px;padding:14px 12px;text-align:center;cursor:pointer;background:linear-gradient(160deg,rgba(80,50,32,.8),rgba(30,20,15,.95));border:1px solid rgba(199,153,79,.2);box-shadow:0 12px 22px -14px #000,0 1px 0 rgba(255,235,200,.07) inset;transition:transform .25s,border-color .25s}',
    '.hx-stage:hover{transform:translateY(-5px) rotateX(6deg);border-color:rgba(227,189,121,.55)}',
    '.hx-stage:not(:last-child):after{content:"";position:absolute;right:-11px;top:50%;width:12px;height:2px;background:linear-gradient(90deg,var(--g),transparent);background-size:200% 100%;animation:hxflow 1.6s linear infinite}',
    '@keyframes hxflow{to{background-position:-200% 0}}',
    '.hx-n{font-size:30px;font-weight:900;color:var(--gl);line-height:1}',
    '.hx-row{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid rgba(199,153,79,.13)}.hx-row:last-child{border:0}',
    '.hx-chk{appearance:none;-webkit-appearance:none;width:22px;height:22px;border-radius:8px;border:2px solid rgba(199,153,79,.6);background:transparent;flex:none;margin-top:1px;cursor:pointer;transition:all .2s;position:relative}',
    '.hx-chk:hover{background:rgba(199,153,79,.2);transform:scale(1.1)}',
    '.hx-chip{display:inline-block;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;border:1px solid rgba(199,153,79,.3);color:var(--mu);background:rgba(0,0,0,.2);cursor:pointer}',
    '.hx-chip.on{background:rgba(199,153,79,.22);color:var(--gl);border-color:rgba(227,189,121,.6)}',
    '.hx-tag{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:2px 7px;border-radius:6px;background:rgba(199,153,79,.15);color:var(--gl)}',
    '.hx-a{color:var(--gl);text-decoration:none;font-weight:700}.hx-a:hover{text-decoration:underline}',
    '.hx-conf{position:fixed;width:9px;height:9px;border-radius:2px;z-index:99999;pointer-events:none;animation:hxc .9s ease-out forwards}',
    '@keyframes hxc{to{transform:translate(var(--dx),var(--dy)) rotate(540deg);opacity:0}}',
    '.hx-in{animation:hxin .55s cubic-bezier(.2,.8,.2,1) both}@keyframes hxin{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
    /* chat dock */
    '#hxDock{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:60;font-family:"Public Sans",system-ui,sans-serif}',
    '#hxFab{width:60px;height:60px;border-radius:50%;border:0;cursor:pointer;color:#2A160E;font-weight:900;font-size:22px;background:linear-gradient(135deg,#F0CC8C,#C7994F);box-shadow:0 16px 30px -10px rgba(199,153,79,.85),0 0 0 4px rgba(42,22,14,.9);transition:transform .2s}',
    '#hxFab:hover{transform:translateY(-3px) scale(1.05)}',
    '#hxPanel{position:absolute;right:0;bottom:74px;width:min(420px,calc(100vw - 28px));height:min(580px,calc(100dvh - 130px));display:none;flex-direction:column;border-radius:22px;overflow:hidden;background:linear-gradient(160deg,#3a2316,#1b120d);border:1px solid rgba(227,189,121,.4);box-shadow:0 30px 60px -20px #000;color:#F3E8D6}',
    '#hxPanel.open{display:flex;animation:hxin .3s both}',
    '.hxm{max-width:88%;padding:10px 13px;border-radius:16px;font-size:13.5px;line-height:1.5;white-space:normal;word-wrap:break-word}',
    '.hxm.u{align-self:flex-end;background:linear-gradient(135deg,#E3BD79,#C7994F);color:#2A160E;border-bottom-right-radius:5px}',
    '.hxm.a{align-self:flex-start;background:rgba(255,235,200,.08);border:1px solid rgba(199,153,79,.2);border-bottom-left-radius:5px}',
    '.hxdots span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:#E3BD79;animation:hxd 1s infinite}.hxdots span:nth-child(2){animation-delay:.15s}.hxdots span:nth-child(3){animation-delay:.3s}',
    '@keyframes hxd{50%{transform:translateY(-5px);opacity:.4}}',
    '.hx-input{width:100%;background:rgba(0,0,0,.35);border:1px solid rgba(199,153,79,.3);border-radius:14px;color:#F3E8D6;padding:11px 13px;font-size:16px;outline:none}.hx-input:focus{border-color:#E3BD79}',
    '.hx-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 4px 14px}',
    '.hx-pips{display:flex;gap:6px}.hx-pip{width:26px;height:9px;border-radius:9px;background:rgba(255,235,200,.14);transition:background .4s,box-shadow .4s}.hx-pip.on{background:linear-gradient(90deg,#C7994F,#F0CC8C);box-shadow:0 0 10px rgba(227,189,121,.6)}',
    '.hx-flame{font-weight:900;font-size:15px;color:#E3BD79;background:rgba(199,153,79,.14);border:1px solid rgba(199,153,79,.3);padding:5px 10px;border-radius:999px}',
    '.hx-btnrow{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}',
    '.hx-qgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.hx-q{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:13px 12px;border-radius:16px;border:1px solid rgba(199,153,79,.28);background:linear-gradient(155deg,rgba(90,56,34,.7),rgba(32,21,15,.9));color:#F3E8D6;cursor:pointer;transition:transform .15s,border-color .2s}',
    '.hx-q:hover{transform:translateY(-3px);border-color:rgba(227,189,121,.6)}.hx-q:active{transform:scale(.97)}',
    '.hx-q span{font-size:20px;line-height:1}.hx-q b{font-size:13.5px;margin-top:4px}.hx-q i{font-style:normal;font-size:11px;color:#9c8a6c}',
    '.hx-swipe{position:relative;overflow:hidden;border-radius:12px}',
    '.hx-swipe-bg{position:absolute;inset:0;display:flex;align-items:center;padding-left:16px;font-weight:900;color:#2A160E;background:linear-gradient(90deg,#E3BD79,#C7994F);opacity:0;border-radius:12px}',
    '.hx-swipe-fg{position:relative;background:#241711;touch-action:pan-y}',
    '#hxToast{position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translate(-50%,20px);z-index:100000;background:#2A160E;color:#F3E8D6;border:1px solid rgba(227,189,121,.6);padding:11px 18px;border-radius:999px;font-weight:700;font-size:13.5px;box-shadow:0 14px 30px -10px #000;opacity:0;pointer-events:none;transition:all .3s;max-width:90vw;text-align:center}',
    '#hxToast.show{opacity:1;transform:translate(-50%,0)}',
    '#hxVeil{position:fixed;inset:0;z-index:9990;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);animation:hxin .2s both}',
    '#hxSheet{position:fixed;left:0;right:0;bottom:0;z-index:9991;max-height:78dvh;overflow-y:auto;padding:10px 18px calc(20px + env(safe-area-inset-bottom));border-radius:26px 26px 0 0;background:linear-gradient(170deg,#3a2316,#1b120d);border:1px solid rgba(227,189,121,.35);border-bottom:0;color:#F3E8D6;box-shadow:0 -20px 50px -10px #000;animation:hxup .3s cubic-bezier(.2,.8,.2,1) both}',
    '@keyframes hxup{from{transform:translateY(100%)}to{transform:none}}',
    '@media(min-width:700px){#hxSheet{left:50%;right:auto;width:520px;transform:translateX(-50%);animation:hxin .25s both}}',
    '.hx-grab{width:44px;height:5px;border-radius:5px;background:rgba(255,235,200,.25);margin:0 auto 12px}',
    '#hxBar{position:fixed;left:0;right:0;bottom:0;z-index:70;display:none;justify-content:space-around;padding:6px 6px calc(6px + env(safe-area-inset-bottom));background:rgba(26,17,12,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid rgba(199,153,79,.3)}',
    '.hx-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 0 4px;border:0;background:none;color:#9c8a6c;font-size:10.5px;font-weight:800;letter-spacing:.03em;cursor:pointer;min-height:52px;border-radius:14px;transition:color .2s,transform .15s}',
    '.hx-tab svg{width:23px;height:23px}.hx-tab.on{color:#E3BD79}.hx-tab.on svg{filter:drop-shadow(0 0 6px rgba(227,189,121,.7))}.hx-tab:active{transform:scale(.92)}',
    '.hx-rf{width:40px;height:40px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(199,153,79,.4);background:rgba(199,153,79,.12);color:#E3BD79;cursor:pointer;padding:0;flex:none}',
    '.hx-rf svg{width:19px;height:19px;transition:transform .5s}.hx-rf:active svg{transform:rotate(180deg)}.hx-rf.spin svg{animation:hxspin .8s linear infinite}@keyframes hxspin{to{transform:rotate(360deg)}}',
    '#hxUpd{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 8px);z-index:99990;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px 10px 16px;border-radius:18px;background:linear-gradient(135deg,#E3BD79,#C7994F);color:#2A160E;font-weight:800;font-size:14px;box-shadow:0 16px 36px -10px rgba(0,0,0,.7);animation:hxdown .35s cubic-bezier(.2,.8,.2,1) both}',
    '#hxUpd .hx-btn{background:#2A160E;color:#F3E8D6;border-color:#2A160E;min-height:38px;padding:8px 14px}@keyframes hxdown{from{transform:translateY(-130%)}to{transform:none}}',
    '#hxPtr{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 6px);transform:translate(-50%,-60px);z-index:99980;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:#2A160E;border:1px solid rgba(227,189,121,.5);color:#E3BD79;font-size:12.5px;font-weight:800;opacity:0;pointer-events:none;transition:opacity .15s}',
    '#hxPtr.show{opacity:1}#hxPtr span{display:inline-block;transition:transform .2s;font-size:15px}#hxPtr.rdy{background:#E3BD79;color:#2A160E}',
    '.hx-ver{grid-column:span 12;text-align:center;font-size:12px;color:#9c8a6c;padding:6px 0 2px}.hx-ver button{background:none;border:0;color:#E3BD79;font-weight:800;font-size:12px;text-decoration:underline;padding:6px 4px;cursor:pointer}',
    '#hxChips{display:none;flex-wrap:wrap;gap:8px;margin-bottom:12px}',
    '@media(max-width:1023px){',
    ' body.hx-mob #hxStats,body.hx-mob #outreachSummaryCard,body.hx-mob #hxFunnelWrap{display:none}',
    ' body.hx-mob[data-hxtab=board] #outreachSummaryCard,body.hx-mob[data-hxtab=board] #hxFunnelWrap{display:block}',
    ' body.hx-mob #pipelineView{padding-bottom:calc(100px + env(safe-area-inset-bottom))}',
    ' body.hx-mob #hxChips{display:flex}',
    ' body.hx-mob .hx-river{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;overflow:visible;padding:4px 0 6px}body.hx-mob .hx-stage{flex:none;min-width:0;padding:12px 6px}',
    ' body.hx-mob main>header button[onclick="exportCSV()"]{display:none}body.hx-mob main>header #pageTitle,body.hx-mob main>header button[onclick^="openFinancialProspectModal"]{white-space:nowrap}',
    ' body.hx-mob #hxFunnelWrap>div:first-child{display:block;border:0;padding-bottom:4px}body.hx-mob #hxFunnelWrap>div:first-child p{display:none}',
    ' body.hx-mob #salesFunnelContainer{flex-direction:column;overflow:visible;gap:0}',
    ' body.hx-mob #salesFunnelContainer>.hx-col{display:none;min-width:0;width:100%;flex:none}body.hx-mob #salesFunnelContainer>.hx-col.hx-show{display:block}',
    ' #homeCmd{padding-bottom:0}.hx-card{padding:16px 16px;border-radius:20px}',
    ' .hx-btn{min-height:46px;padding:11px 16px;font-size:14px}.hx-btnrow .hx-btn{flex:1 1 calc(50% - 8px);justify-content:center}.hx-btnrow .hx-btn.pri{flex:1 1 100%}',
    ' .hx-chip{min-height:34px;display:inline-flex;align-items:center;padding:4px 12px}',
    ' .hx-chk{width:28px;height:28px;border-radius:10px}.hx-row{padding:12px 0}',
    ' #hxFab{display:none}',
    ' #hxPanel{position:fixed;inset:0;width:auto;height:auto;border-radius:0;bottom:calc(66px + env(safe-area-inset-bottom))}',
    ' #hxDock{right:0;bottom:0}',
    '}',
    '@media(prefers-reduced-motion:reduce){#homeCmd:before,#homeCmd:after,.hx-stage:after,.hx-pulse{animation:none}.hx-card,.hx-btn,.hx-stage{transition:none}.hx-in{animation:none}}'
  ].join('\n');
  var st = document.createElement('style'); st.id = 'hxStyle'; st.textContent = css; document.head.appendChild(st);

  /* ---------- helpers ---------- */
  function money(n) { return '$' + Math.round(n).toLocaleString(); }
  function greeting() { var h = new Date().getHours(); return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
  function winsGet() { try { return JSON.parse(ls.get('bgcs_home_wins', '{}')) || {}; } catch (e) { return {}; } }
  function dayKey(d) { return d.toISOString().slice(0, 10); }
  function winsAdd() { var w = winsGet(), k = dayKey(new Date()); w[k] = (w[k] || 0) + 1; ls.set('bgcs_home_wins', JSON.stringify(w)); }
  function streak() { var w = winsGet(), n = 0, d = new Date(); if (!w[dayKey(d)]) d.setDate(d.getDate() - 1); while (w[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }
  function confetti(x, y) {
    if (reduce) return;
    var cols = ['#E3BD79', '#C7994F', '#F3E8D6', '#8a5a2b'];
    for (var i = 0; i < 22; i++) {
      var c = document.createElement('i'); c.className = 'hx-conf';
      c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.background = cols[i % cols.length];
      var a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 110;
      c.style.setProperty('--dx', Math.cos(a) * r + 'px'); c.style.setProperty('--dy', (Math.sin(a) * r - 40) + 'px');
      document.body.appendChild(c); setTimeout(function (el) { return function () { el.remove(); }; }(c), 950);
    }
  }
  function countUp(root) {
    var els = root.querySelectorAll('[data-count]');
    els.forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count')) || 0, pre = el.getAttribute('data-pre') || '';
      if (reduce || S.animated) { el.textContent = pre + Math.round(to).toLocaleString(); return; }
      var t0 = performance.now(), dur = 900;
      (function step(t) { var p = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - p, 3)); el.textContent = pre + Math.round(v).toLocaleString(); if (p < 1) requestAnimationFrame(step); })(t0);
    });
  }

  /* ---------- next action ---------- */
  function candidates(m) {
    var out = [], today = m.today;
    m.tasks.filter(function (x) { return x.t.date <= today; }).forEach(function (x) {
      out.push({ kind: 'task', title: x.t.title, org: x.p.org, pid: x.p.id, ti: x.p.clientTasks.indexOf(x.t), why: (x.t.date < today ? 'Overdue since ' : 'Due ') + x.t.date + '. Small step, then it is off your mind.' });
    });
    m.stale.forEach(function (p) {
      out.push({ kind: 'follow', title: 'Follow up with ' + p.org, org: p.org, pid: p.id, why: 'Sent ' + p.emailSentDate + ', no reply yet. One short, specific nudge about something real on their end.' });
    });
    var drafted = m.P.filter(function (p) { return p.stage === 'Email Drafted'; });
    if (drafted.length) out.push({ kind: 'send', title: 'Review and send ' + Math.min(3, drafted.length) + ' drafted email' + (Math.min(3, drafted.length) === 1 ? '' : 's'), org: '', why: drafted.length + ' are waiting in Gmail. You send them yourself, spaced out, so each one reads personal.' });
    out.push({ kind: 'plan', title: 'Pick one organization and research it for 10 minutes', org: '', why: 'One real fact about them beats ten generic emails. Write it in the draft, then stop.' });
    return out;
  }

  /* ---------- timer ---------- */
  function timerFmt() { var s = S.timerLeft; return ('0' + Math.floor(s / 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2); }
  function timerStart() {
    if (S.timer) { clearInterval(S.timer); S.timer = null; S.timerLeft = 0; document.title = S.title0 || document.title; renderHome(); return; }
    S.title0 = document.title; S.timerLeft = 600;
    S.timer = setInterval(function () {
      S.timerLeft--;
      var el = document.getElementById('hxTimer'); if (el) el.textContent = timerFmt();
      document.title = timerFmt() + ' focus';
      if (S.timerLeft <= 0) { clearInterval(S.timer); S.timer = null; document.title = S.title0; winsAdd(); var b = document.getElementById('hxFocusBtn'); confetti(window.innerWidth / 2, 160); renderHome(); }
    }, 1000);
    renderHome();
  }

  /* ---------- automations ---------- */
  function resetDay() {
    var m = coModel(), n = 0;
    m.overdue.forEach(function (x) { if (x.t.date < m.today) { x.t.date = m.today; n++; } });
    if (n) { saveFinancialProspects(); }
    renderHome();
    return n;
  }

  /* ---------- news ---------- */
  function loadNews() {
    fetch('news-feed.json?ts=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { S.news = j; S.newsErr = false; renderHome(); })
      .catch(function () { S.newsErr = true; if (!S.news) renderHome(); });
  }
  var CATS = { 'Competitor': 'Competitors', 'Market': 'Who to market to', 'AI news': 'AI and tech', 'Funding': 'Funding' };
  function newsCard() {
    var n = S.news, body;
    if (!n || !n.items || !n.items.length) {
      body = '<p class="hx-mu">' + ((S.newsErr || n) ? 'No digest yet. Your first one lands after tonight\'s run (about 8 PM).' : 'Loading your digest...') + '</p>';
    } else {
      var cats = ['All'].concat(Object.keys(CATS).filter(function (c) { return n.items.some(function (i) { return i.cat === c; }); }));
      var chips = cats.map(function (c) { return '<span class="hx-chip' + (S.newsFilter === c ? ' on' : '') + '" onclick="hxNews(\'' + c + '\')">' + E(c === 'All' ? 'All' : CATS[c]) + '</span>'; }).join(' ');
      var items = n.items.filter(function (i) { return S.newsFilter === 'All' || i.cat === S.newsFilter; }).slice(0, 6).map(function (i) {
        return '<div class="hx-row"><div style="min-width:0"><span class="hx-tag">' + E(CATS[i.cat] || i.cat || 'Note') + '</span> ' +
          (i.url ? '<a class="hx-a" href="' + E(i.url) + '" target="_blank" rel="noopener">' + E(i.title) + '</a>' : '<b>' + E(i.title) + '</b>') +
          (i.why ? '<p class="hx-mu" style="margin-top:3px"><b style="color:#F3E8D6">Why it matters to you:</b> ' + E(i.why) + '</p>' : '') +
          '<p style="font-size:11px;color:#9c8a6c;margin-top:2px">' + E(i.source || '') + (i.date ? ' &middot; ' + E(i.date) : '') + '</p></div></div>';
      }).join('');
      body = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">' + chips + '</div>' + items +
        (n.note ? '<p style="font-size:11px;color:#9c8a6c;margin-top:8px">' + E(n.note) + '</p>' : '');
    }
    var when = n && n.generated ? ' &middot; updated ' + E(n.generated) : '';
    return '<div class="hx-card fx-tilt hx-5 hx-in"><div class="hx-k">Market intel' + when + '</div>' + body + '</div>';
  }


  /* ---------- marketing: clip tracker ---------- */
  var CLIP_FLOW = ['Idea', 'Filmed', 'Edited', 'Posted'];
  var CLIP_IDEAS = [
    'I built a website with AI in 60 seconds (screen recording)',
    '3 ways kids can use AI that are not cheating',
    'What a free AI hour at your after-school program looks like',
    'AI myths vs facts for parents',
    'Teach your kid a study method with AI (demo)',
    'Behind the scenes: planning four sessions for InspiHER (no student faces)'
  ];
  function clipsGet() { try { return JSON.parse(ls.get('bgcs_clips', '[]')) || []; } catch (e) { return []; } }
  function clipsSet(a) { ls.set('bgcs_clips', JSON.stringify(a)); }
  function mondayKey() { var d = new Date(); d.setHours(0, 0, 0, 0); var w = d.getDay(); d.setDate(d.getDate() - (w === 0 ? 6 : w - 1)); return d.toISOString().slice(0, 10); }
  function marketingCard() {
    var clips = clipsGet(), mon = mondayKey(), tdy = dayKey(new Date());
    var posted = clips.filter(function (c) { return c.status === 'Posted' && c.posted && c.posted >= mon; }).length;
    var goal = 5, pct = Math.min(100, Math.round(posted / goal * 100));
    var starts = tdy < '2026-11-23' ? 'Starts Monday, Nov 23' : 'This week';
    var ideas = CLIP_IDEAS.map(function (t, i) { return '<span class="hx-chip" onclick="hxIdea(' + i + ')" title="Add to your list">+ ' + E(t.length > 46 ? t.slice(0, 44) + '...' : t) + '</span>'; }).join(' ');
    var list = clips.length ? clips.slice().reverse().slice(0, 7).map(function (c) {
      return '<div class="hx-row"><div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:700;color:#F3E8D6">' + E(c.title) + '</div><div class="hx-mu" style="font-size:12px">' + E(c.platform) + (c.posted ? ' &middot; posted ' + E(c.posted) : '') + '</div></div>' +
        '<button class="hx-chip' + (c.status === 'Posted' ? ' on' : '') + '" onclick="hxClipNext(' + c.id + ')" title="Tap to move to the next step">' + E(c.status) + '</button>' +
        (c.status === 'Posted' ? '<input type="number" min="0" value="' + (c.views || 0) + '" onchange="hxClipViews(' + c.id + ',this.value)" title="Views" style="width:72px;background:rgba(0,0,0,.35);border:1px solid rgba(199,153,79,.3);border-radius:10px;color:#F3E8D6;padding:4px 6px;font-size:12px">' : '') +
        '<button class="hx-chip" onclick="hxClipDel(' + c.id + ')" aria-label="Delete">&times;</button></div>';
    }).join('') : '<p class="hx-mu">No clips yet. Tap an idea below to start your list.</p>';
    return '<div class="hx-card fx-tilt hx-12 hx-in" style="grid-column:span 12"><div class="hx-k">Digital marketing &middot; ' + starts + '</div>' +
      '<div style="display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))"><div>' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:15px;font-weight:800;color:#F3E8D6">Weekly clip goal</div><div style="font-weight:900;color:#E3BD79">' + posted + ' / ' + goal + '</div></div>' +
      '<div style="height:9px;border-radius:9px;background:rgba(255,235,200,.1);margin:8px 0 10px;overflow:hidden"><div style="height:9px;width:' + pct + '%;background:linear-gradient(90deg,#C7994F,#F0CC8C);transition:width .8s"></div></div>' +
      '<p class="hx-mu">Plan: film 5 clips together, post one a day. Every clip ends with the same call to action: the free-event page.</p>' +
      '<p class="hx-mu" style="margin-top:8px"><b style="color:#F3E8D6">Link in every bio:</b> <a class="hx-a" href="free-event.html" target="_blank" rel="noopener">free-event.html</a></p>' +
      '<p class="hx-mu" style="margin-top:8px;color:#f0c0b0"><b>Rule:</b> no student faces, names or work on camera unless a parent and the school have signed off. Use screen recordings and voiceover.</p></div>' +
      '<div><form onsubmit="return hxClipAdd(event)" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><input id="hxClipT" class="hx-input" style="flex:1 1 180px;font-size:14px;padding:9px 11px" placeholder="New clip idea..."><select id="hxClipP" class="hx-input" style="flex:0 0 auto;width:auto;font-size:14px;padding:9px 11px"><option>TikTok</option><option>Instagram</option><option>YouTube Shorts</option><option>Facebook</option></select><button class="hx-btn pri" type="submit">Add</button></form>' + list +
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' + ideas + '</div></div></div></div>';
  }
  window.hxClipAdd = function (ev) { if (ev && ev.preventDefault) ev.preventDefault(); var t = (document.getElementById('hxClipT').value || '').trim(), pl = document.getElementById('hxClipP').value; if (!t) return false; var a = clipsGet(); a.push({ id: Date.now(), title: t.slice(0, 140), platform: pl, status: 'Idea', views: 0 }); clipsSet(a); renderHome(); return false; };
  window.hxIdea = function (i) { var a = clipsGet(); a.push({ id: Date.now() + i, title: CLIP_IDEAS[i], platform: 'TikTok', status: 'Idea', views: 0 }); clipsSet(a); renderHome(); };
  window.hxClipNext = function (id) { var a = clipsGet(); a.forEach(function (c) { if (c.id === id) { var i = CLIP_FLOW.indexOf(c.status); if (i < CLIP_FLOW.length - 1) { c.status = CLIP_FLOW[i + 1]; if (c.status === 'Posted') { c.posted = dayKey(new Date()); winsAdd(); confetti(window.innerWidth / 2, 220); } } else { c.status = 'Idea'; c.posted = ''; } } }); clipsSet(a); renderHome(); };
  window.hxClipViews = function (id, v) { var a = clipsGet(); a.forEach(function (c) { if (c.id === id) c.views = Math.max(0, parseInt(v, 10) || 0); }); clipsSet(a); };
  window.hxClipDel = function (id) { clipsSet(clipsGet().filter(function (c) { return c.id !== id; })); renderHome(); };

  /* ---------- render ---------- */
  var mq = null; try { mq = window.matchMedia('(max-width:1023px)'); } catch (e) {}
  function isMobile() { return !!(mq && mq.matches); }
  function toast(msg) {
    var t = document.getElementById('hxToast'); if (!t) { t = document.createElement('div'); t.id = 'hxToast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show'; clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = ''; }, 2600);
  }
  function buzz(n) { try { if (navigator.vibrate) navigator.vibrate(n || 12); } catch (e) {} }
  var WIN_GOAL = 3;
  function levelName(w) { return w >= 6 ? 'Unstoppable' : w >= WIN_GOAL ? 'Day made' : w >= 1 ? 'On a roll' : 'Warm-up'; }

  function renderHome() {
    var box = document.getElementById('homeCmd'); if (!box) return;
    var m = coModel(), P = m.P, today = m.today, mob = isMobile();
    var booked = m.slots * m.c.classVal, pct = Math.min(100, Math.round(booked / m.c.goal * 100));
    var C = 2 * Math.PI * 54, off = C * (1 - pct / 100);
    var cands = candidates(m), cur = cands[S.skip % cands.length];
    var w = winsGet(), wToday = w[dayKey(new Date())] || 0, stk = streak();
    var cnt = function (s) { return P.filter(function (p) { return p.stage === s; }).length; };

    var actBtns = '';
    if (cur.kind === 'task') actBtns += '<button class="hx-btn pri" onclick="hxDone(' + cur.pid + ',' + cur.ti + ',event)">Done &#10003;</button>';
    if (cur.kind === 'follow') actBtns += '<button class="hx-btn pri" onclick="homeOpen(' + cur.pid + ')">Open ' + E(cur.org) + '</button><button class="hx-btn" onclick="hxAsk(\'Help me write one specific, non-generic follow-up for ' + E(cur.org).replace(/'/g, '') + '. Ask me what I know about them first, then draft it.\')">Draft with coach</button>';
    if (cur.kind === 'task' && cur.pid) actBtns += '<button class="hx-btn" onclick="homeOpen(' + cur.pid + ')">Open</button>';
    if (cur.kind === 'plan' || cur.kind === 'send') actBtns += '<button class="hx-btn pri" onclick="hxAsk(\'' + (cur.kind === 'send' ? 'Which of my drafted emails should I send first today, and why?' : 'Which organization in my pipeline should I research next, and what should I look for?') + '\')">Ask coach</button>';
    actBtns += '<button class="hx-btn" id="hxFocusBtn" onclick="hxTimer()">' + (S.timer ? 'Stop timer' : 'Focus 10 min') + '</button>';
    if (cands.length > 1) actBtns += '<button class="hx-btn" onclick="hxSkip()">Not this one</button>';

    var pips = ''; for (var i = 0; i < WIN_GOAL; i++) pips += '<span class="hx-pip' + (i < wToday ? ' on' : '') + '"></span>';
    var strip = '<div class="hx-strip"><div><div class="hx-k" style="margin:0">' + greeting() + ', Raeven</div><div style="font-size:12px;color:#CDBA99">' + E(levelName(wToday)) + ' &middot; ' + wToday + ' win' + (wToday === 1 ? '' : 's') + ' today</div></div><div style="display:flex;align-items:center;gap:10px"><div class="hx-pips">' + pips + '</div><div class="hx-flame" title="Day streak">&#128293; ' + stk + '</div><button class="hx-rf' + (upd.busy ? ' spin' : '') + '" onclick="hxRefresh()" aria-label="Refresh the app" title="Refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button></div></div>';

    var hero =
      '<div class="hx-card fx-tilt hx-next hx-7 hx-in"><div class="hx-z">' +
      '<div class="hx-k"><span class="hx-pulse"></span>Do this next</div>' +
      '<div class="hx-h1">' + E(cur.title) + '</div>' +
      (cur.org && cur.kind !== 'follow' ? '<p class="hx-mu" style="margin-top:4px">' + E(cur.org) + '</p>' : '') +
      '<p class="hx-mu" style="margin-top:8px">' + E(cur.why) + '</p>' +
      (S.timer ? '<div style="margin-top:12px;font-size:34px;font-weight:900;color:#E3BD79;font-variant-numeric:tabular-nums" id="hxTimer">' + timerFmt() + '</div>' : '') +
      '<div class="hx-btnrow">' + actBtns + '</div></div></div>';

    var ring =
      '<div class="hx-card fx-tilt hx-5 hx-in"><div class="hx-z"><div class="hx-k">Goal &middot; ' + money(m.c.goal) + ' a month</div>' +
      '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap"><svg class="hx-ring" viewBox="0 0 130 130"><defs><linearGradient id="hxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0CC8C"/><stop offset="1" stop-color="#C7994F"/></linearGradient></defs>' +
      '<circle class="bg" cx="65" cy="65" r="54"/><circle class="fg" cx="65" cy="65" r="54" transform="rotate(-90 65 65)" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (S.animated || reduce ? off.toFixed(1) : C.toFixed(1)) + '" data-off="' + off.toFixed(1) + '"/>' +
      '<text x="65" y="63" text-anchor="middle" fill="#F3E8D6" font-size="22" font-weight="900">' + pct + '%</text><text x="65" y="80" text-anchor="middle" fill="#CDBA99" font-size="9">of goal booked</text></svg>' +
      '<div style="flex:1;min-width:150px"><div style="font-size:30px;font-weight:900;color:#F3E8D6" data-count="' + booked + '" data-pre="$">' + money(booked) + '</div><div class="hx-mu">recurring booked &middot; ' + m.slots + ' of ' + m.cap + ' class slots</div>' +
      '<p class="hx-mu" style="margin-top:8px">Full house is ' + money(m.capRev) + ', which is <b style="color:#f0a090">' + money(m.gap) + ' short</b>. Closing that gap takes a sixth class, a higher group price, or paid workshops. The $750 InspiHER fee is one time, so it is not counted here.</p></div></div></div></div>';

    var river = '<div class="hx-card hx-in" style="grid-column:span 12"><div class="hx-k">Where everyone is</div><div class="hx-river">' +
      STAGES.map(function (s) { return '<div class="hx-stage" onclick="hxToKanban()"><div class="hx-n" data-count="' + cnt(s) + '">' + cnt(s) + '</div><div style="font-size:12px;font-weight:800;color:#F3E8D6;margin-top:6px">' + E(s) + '</div><div style="font-size:11px;color:#9c8a6c">' + E(STAGE_HINT[s]) + '</div></div>'; }).join('') + '</div></div>';

    function tasksCardFn(limit) {
      var wk = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      var due = m.tasks.filter(function (x) { return x.t.date <= wk; });
      var shown = S.showAll ? m.tasks.slice(0, 40) : due.slice(0, limit);
      var tl = shown.length ? shown.map(function (x) {
        var ti = x.p.clientTasks.indexOf(x.t), od = x.t.date < today, td = x.t.date === today;
        return '<div class="hx-swipe" data-pid="' + x.p.id + '" data-ti="' + ti + '"><div class="hx-swipe-bg">Done &#10003;</div><div class="hx-row hx-swipe-fg"><input type="checkbox" class="hx-chk" onclick="hxDone(' + x.p.id + ',' + ti + ',event)" aria-label="Mark done"><div style="min-width:0;flex:1"><div style="font-size:14.5px;font-weight:700;color:#F3E8D6">' + E(x.t.title) + '</div><div style="font-size:12px;color:#CDBA99"><a class="hx-a" href="javascript:void(0)" onclick="homeOpen(' + x.p.id + ')">' + E(x.p.org) + '</a> &middot; <span style="' + (od ? 'color:#f0a090;font-weight:800' : td ? 'color:#E3BD79;font-weight:800' : '') + '">' + (od ? 'Overdue ' : td ? 'Today ' : '') + E(x.t.date) + '</span></div></div></div></div>';
      }).join('') : '<p class="hx-mu">Nothing due this week. Nice. Pick an organization to research.</p>';
      return '<div class="hx-card fx-tilt hx-7 hx-in"><div class="hx-k">Your list &middot; ' + m.tasks.length + ' open' + (m.overdue.length ? ' &middot; <span style="color:#f0a090">' + m.overdue.length + ' due now</span>' : '') + '</div>' + (mob ? '<p style="font-size:11px;color:#9c8a6c;margin:-2px 0 4px">Swipe a task right to finish it.</p>' : '') + tl +
        (m.tasks.length > shown.length || S.showAll ? '<div style="margin-top:8px"><span class="hx-chip" onclick="hxAll()">' + (S.showAll ? 'Show less' : 'Show all ' + m.tasks.length) + '</span></div>' : '') + '</div>';
    }

    var feedApplied = 0; try { var fa = JSON.parse(ls.get('bgcs_feed_applied', '[]')); feedApplied = Array.isArray(fa) ? fa.length : Object.keys(fa).length; } catch (e) {}
    var drafted = P.filter(function (p) { return p.stage === 'Email Drafted'; }).length;
    var quick = '<div class="hx-card hx-4 hx-in"><div class="hx-k">Quick actions</div><div class="hx-qgrid">' +
      '<button class="hx-q" onclick="hxSheet()"><span>&#9993;</span><b>I sent an email</b><i>' + drafted + ' drafts waiting</i></button>' +
      '<button class="hx-q" onclick="hxReset()"><span>&#8635;</span><b>Reset my day</b><i>Overdue &rarr; today</i></button>' +
      '<button class="hx-q" onclick="hxAsk(\'Build my plan for today from my pipeline. Max 3 things, in order.\')"><span>&#10024;</span><b>Plan my day</b><i>Ask the coach</i></button>' +
      '<button class="hx-q" onclick="coCopy()"><span>&#128203;</span><b>Copy summary</b><i>Paste into Claude</i></button></div></div>';
    var autos = '<div class="hx-card fx-tilt hx-4 hx-in"><div class="hx-k">Running for you</div>' +
      [['Gmail to pipeline', 'Every night at 7:41 PM it logs what you sent and who replied. ' + (feedApplied ? feedApplied + ' updates applied so far.' : '')],
       ['Market digest', 'Every night at 8:13 PM it researches competitors, who to market to, AI news and funding.']
      ].map(function (a) { return '<div class="hx-row"><div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:800;color:#F3E8D6">' + E(a[0]) + ' <span class="hx-tag">auto</span></div><div class="hx-mu" style="font-size:12px">' + E(a[1]) + '</div></div></div>'; }).join('') + '</div>';

    var hot = P.filter(function (p) { return p.stage === 'Lead' || p.stage === 'Invoice Pending'; });
    var hotHtml = hot.length ? hot.map(function (p) { var a = (p.activities || [])[0]; return '<div class="hx-row" onclick="homeOpen(' + p.id + ')" style="cursor:pointer"><div style="min-width:0"><a class="hx-a" href="javascript:void(0)">' + E(p.org) + '</a> <span class="hx-tag">' + E(p.stage) + '</span>' + (a ? '<div class="hx-mu" style="font-size:12px">' + E(a.date) + ': ' + E(a.title) + '</div>' : '') + '</div></div>'; }).join('') : '<p class="hx-mu">No replies logged yet.</p>';
    var warm = '<div class="hx-card fx-tilt hx-4 hx-in"><div class="hx-k">Who replied &middot; ' + hot.length + '</div>' + hotHtml + '</div>';

    var comp = (typeof AD_COMP !== 'undefined' ? AD_COMP : []).slice(0, 3).map(function (x) { return '<div class="hx-row"><div><a class="hx-a" href="' + E(x[2]) + '" target="_blank" rel="noopener">' + E(x[0]) + '</a><div class="hx-mu" style="font-size:12px">' + E(x[1]) + '</div></div></div>'; }).join('');
    var take = (typeof AD_TAKE !== 'undefined' ? AD_TAKE : [])[0];
    var compCard = '<div class="hx-card fx-tilt hx-4 hx-in"><div class="hx-k">Competitors and how to win</div>' + comp + (take ? '<p class="hx-mu" style="margin-top:8px"><b style="color:#F3E8D6">Your edge:</b> ' + E(take) + '</p>' : '') + '<a class="hx-a" href="#view=advisor" onclick="switchMainView(\'advisor\')" style="font-size:12px;display:inline-block;margin-top:8px">Open full advisor &rarr;</a></div>';

    var verLine = '<div class="hx-ver">Version ' + E(BUILD) + ' &middot; <button onclick="hxRefresh()">Refresh now</button></div>';
    var body;
    if (mob) {
      var tab = S.tab;
      if (tab === 'board') body = river + warm + tasksCardFn(8);
      else if (tab === 'clips') body = marketingCard();
      else if (tab === 'intel') body = newsCard() + compCard;
      else body = hero + tasksCardFn(3) + quick + ring + autos + verLine;
      body = '<div class="hx-grid">' + body + '</div>';
    } else {
      body = '<div class="hx-grid">' + hero + ring + river + marketingCard() + tasksCardFn(5) + newsCard() + quick + warm + compCard + autos + verLine + '</div>';
    }
    box.className = '';
    box.innerHTML = strip + body;
    countUp(box);
    if (!S.animated && !reduce) { requestAnimationFrame(function () { var fg = box.querySelector('.hx-ring .fg'); if (fg) { void fg.getBoundingClientRect(); fg.style.strokeDashoffset = fg.getAttribute('data-off'); } }); }
    S.animated = true;
    try { drawBar(); } catch (e) {}
  }

  /* ---------- bottom tab bar (phone) ---------- */
  var TABS = [
    ['today', 'Today', '<path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4"/>'],
    ['board', 'Board', '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>'],
    ['clips', 'Clips', '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>'],
    ['intel', 'Intel', '<path d="M3 17l5-5 4 4 8-9"/><path d="M15 7h5v5"/>'],
    ['coach', 'Coach', '<path d="M4 5h16v10H9l-5 4z"/>']
  ];
  function pipelineVisible() { var v = document.getElementById('pipelineView'); var pv = document.getElementById('profileView'); return !!v && !v.classList.contains('hidden') && (!pv || pv.classList.contains('hidden')); }
  function drawBar() {
    var b = document.getElementById('hxBar');
    if (!b) { b = document.createElement('nav'); b.id = 'hxBar'; document.body.appendChild(b); }
    var show = isMobile() && pipelineVisible();
    b.style.display = show ? 'flex' : 'none';
    document.body.classList.toggle('hx-mob', show);
    document.body.setAttribute('data-hxtab', S.tab);
    b.innerHTML = TABS.map(function (t) {
      var on = t[0] === S.tab && t[0] !== 'coach';
      return '<button class="hx-tab' + (on ? ' on' : '') + '" onclick="hxTab(\'' + t[0] + '\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + t[2] + '</svg><span>' + t[1] + '</span></button>';
    }).join('');
  }
  window.hxTab = function (t) {
    if (t === 'coach') { window.hxToggle(); return; }
    S.tab = t; ls.set('bgcs_home_tab', t); buzz(8);
    var p = document.getElementById('hxPanel'); if (p) p.classList.remove('open');
    renderHome(); try { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  };

  /* ---------- quick log sheet: I sent an email ---------- */
  function sheetClose() { var s = document.getElementById('hxSheet'); if (s) s.remove(); var o = document.getElementById('hxVeil'); if (o) o.remove(); }
  window.hxSheet = function () {
    sheetClose();
    var P = (financialProspects || []).filter(function (p) { return p.stage === 'Email Drafted' || p.stage === 'Prospect'; });
    var veil = document.createElement('div'); veil.id = 'hxVeil'; veil.onclick = sheetClose; document.body.appendChild(veil);
    var sh = document.createElement('div'); sh.id = 'hxSheet';
    sh.innerHTML = '<div class="hx-grab"></div><div style="font-family:Fraunces,Georgia,serif;font-weight:700;font-size:19px;margin-bottom:2px">Which one did you send?</div><p class="hx-mu" style="margin-bottom:8px">Tap it and I will move it to First Touch Sent and add a follow-up for 6 days from now.</p>' +
      (P.length ? P.map(function (p) { return '<div class="hx-row" style="align-items:center"><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:14.5px">' + E(p.org) + '</div><div class="hx-mu" style="font-size:12px">' + E(p.stage) + (p.email ? ' &middot; ' + E(p.email) : '') + '</div></div><button class="hx-btn pri" onclick="hxSent(' + p.id + ')">Sent</button></div>'; }).join('') : '<p class="hx-mu">No drafted emails to log. The nightly sync also picks up anything you send.</p>') +
      '<div style="margin-top:12px"><button class="hx-btn" onclick="hxSheetClose()" style="width:100%;justify-content:center">Close</button></div>';
    document.body.appendChild(sh);
  };
  window.hxSheetClose = sheetClose;
  window.hxSent = function (pid) {
    var p = (financialProspects || []).find(function (x) { return x.id === pid; }); if (!p) return;
    var d = new Date(), iso = dayKey(d), fu = new Date(d.getTime() + 6 * 86400000).toISOString().slice(0, 10);
    p.stage = 'First Touch Sent'; p.emailSentDate = iso;
    (p.activities = p.activities || []).unshift({ type: 'Email', date: iso, person: '', title: 'Emailed (marked sent from phone)', phone: '', email: p.email || '', message: 'First email sent.', nextSteps: 'Follow up in 5-7 days if no reply.', followUpDone: false });
    (p.clientTasks = p.clientTasks || []).push({ title: 'Follow up with ' + p.org, desc: 'No reply yet. Make it specific to them.', date: fu, assignee: 'Raeven Brown', urgency: 'Medium', done: false, active: true });
    /* tell the nightly sync this send is already logged so it does not add it twice */
    try { var A = JSON.parse(ls.get('bgcs_feed_applied', '[]')) || []; var k = 'usent-' + pid + '-' + iso.replace(/-/g, ''); if (A.indexOf(k) < 0) { A.push(k); ls.set('bgcs_feed_applied', JSON.stringify(A)); } } catch (e) {}
    saveFinancialProspects(); winsAdd(); buzz(20); confetti(window.innerWidth / 2, window.innerHeight * 0.45);
    toast('Logged. Follow-up set for ' + fu + '.'); sheetClose(); renderHome();
    var w = (winsGet()[dayKey(new Date())] || 0); if (w === WIN_GOAL) setTimeout(function () { toast('3 wins today. Day made.'); confetti(window.innerWidth / 2, 160); }, 1800);
  };

  /* ---------- swipe to finish a task ---------- */
  (function () {
    var row = null, x0 = 0, y0 = 0, dx = 0, lock = '';
    document.addEventListener('touchstart', function (e) { var r = e.target.closest && e.target.closest('.hx-swipe'); if (!r || e.target.closest('a,input,button')) { row = null; return; } row = r; var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; dx = 0; lock = ''; }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!row) return; var t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
      if (!lock) { if (Math.abs(mx) > 10 || Math.abs(my) > 10) lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'; }
      if (lock === 'y') { row = null; return; }
      if (lock === 'x') { dx = Math.max(0, Math.min(mx, 170)); var fg = row.querySelector('.hx-swipe-fg'); fg.style.transition = 'none'; fg.style.transform = 'translateX(' + dx + 'px)'; row.querySelector('.hx-swipe-bg').style.opacity = Math.min(1, dx / 90); }
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!row) return; var r = row; row = null; var fg = r.querySelector('.hx-swipe-fg');
      if (dx > 95) { var pid = parseInt(r.getAttribute('data-pid'), 10), ti = parseInt(r.getAttribute('data-ti'), 10); fg.style.transition = 'transform .2s'; fg.style.transform = 'translateX(110%)'; var t = e.changedTouches[0]; setTimeout(function () { window.hxDone(pid, ti, { clientX: t.clientX, clientY: t.clientY }); }, 160); buzz(18); }
      else { fg.style.transition = 'transform .2s'; fg.style.transform = ''; r.querySelector('.hx-swipe-bg').style.opacity = 0; }
    }, { passive: true });
  })();

  /* ---------- actions exposed to inline handlers ---------- */
  window.hxDone = function (pid, ti, ev) { var x = ev && (ev.clientX || 0), y = ev && (ev.clientY || 0); var p = (financialProspects || []).find(function (q) { return q.id === pid; }); var was = p && p.clientTasks[ti] && p.clientTasks[ti].done; homeDone(pid, ti); if (!was) { winsAdd(); buzz(18); confetti(x || window.innerWidth / 2, y || 200); renderHome(); if ((winsGet()[dayKey(new Date())] || 0) === WIN_GOAL) { toast('3 wins today. Day made.'); } } };
  window.hxSkip = function () { S.skip++; renderHome(); };
  window.hxAll = function () { S.showAll = !S.showAll; renderHome(); };
  window.hxTimer = timerStart;
  window.hxReset = function () { var n = resetDay(); confetti(window.innerWidth / 2, 200); };
  window.hxNews = function (c) { S.newsFilter = c; renderHome(); };
  window.hxToKanban = function () { var el = document.getElementById('financialKanbanContainer'); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); };
  window.renderHome = renderHome;

  /* ---------- tilt ---------- */
  var fine = false; try { fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) {}
  if (fine && !reduce) {
    document.addEventListener('mousemove', function (e) {
      var c = e.target.closest && e.target.closest('.fx-tilt'); if (!c) return;
      var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      c.style.transform = 'perspective(900px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 6).toFixed(2) + 'deg) translateY(-3px)';
    });
    document.addEventListener('mouseout', function (e) { var c = e.target.closest && e.target.closest('.fx-tilt'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
  }

  /* ---------- coach chat ---------- */
  var chat = [];
  try { chat = JSON.parse(ls.get('bgcs_home_chat', '[]')) || []; } catch (e) { chat = []; }
  var sending = false;

  function buildContext() {
    var m = coModel(), L = [];
    L.push('Today ' + m.today + '. Goal ' + money(m.c.goal) + '/mo; class value ' + money(m.c.classVal) + '; max classes ' + m.cap + '; slots signed ' + m.slots + '; full-house revenue ' + money(m.capRev) + '; gap ' + money(m.gap) + '.');
    var by = {}; m.P.forEach(function (p) { by[p.stage] = (by[p.stage] || 0) + 1; });
    L.push('Stages: ' + Object.keys(by).map(function (k) { return k + ' ' + by[k]; }).join(', ') + '.');
    L.push('PROSPECTS:');
    m.P.slice(0, 45).forEach(function (p) { var a = (p.activities || [])[0]; L.push('- ' + p.org + ' [' + p.stage + ']' + (p.emailSentDate ? ' sent ' + p.emailSentDate : '') + (a ? ' | last: ' + a.date + ' ' + a.title : '')); });
    L.push('OPEN TASKS (soonest first):');
    m.tasks.slice(0, 20).forEach(function (x) { L.push('- ' + x.t.date + ' ' + x.p.org + ': ' + x.t.title); });
    if (typeof AD_COMP !== 'undefined') { L.push('COMPETITORS (public listings):'); AD_COMP.forEach(function (x) { L.push('- ' + x[0] + ': ' + x[1]); }); }
    if (S.news && S.news.items) { L.push('LATEST DIGEST (' + (S.news.generated || '') + '):'); S.news.items.slice(0, 6).forEach(function (i) { L.push('- [' + i.cat + '] ' + i.title + (i.why ? ' -- ' + i.why : '')); }); }
    return L.join('\n').slice(0, 11500);
  }
  function fmtMsg(t) { return E(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  function drawChat() {
    var el = document.getElementById('hxMsgs'); if (!el) return;
    var h = chat.length ? '' : '<div class="hxm a">Hi Raeven. I can see your pipeline. Ask me what to do first, who to email, or to help word something. I can suggest, but I can\'t send or change anything.</div>';
    chat.forEach(function (c) { h += '<div class="hxm ' + (c.role === 'user' ? 'u' : 'a') + '">' + fmtMsg(c.content) + '</div>'; });
    if (sending) h += '<div class="hxm a"><span class="hxdots"><span></span><span></span><span></span></span></div>';
    el.innerHTML = h; el.scrollTop = el.scrollHeight;
  }
  function setNote(t) { var n = document.getElementById('hxNote'); if (n) { n.innerHTML = t || ''; n.style.display = t ? 'block' : 'none'; } }
  function buildDock() {
    if (document.getElementById('hxDock')) return;
    var d = document.createElement('div'); d.id = 'hxDock';
    d.innerHTML =
      '<div id="hxPanel" role="dialog" aria-label="Pipeline coach">' +
      '<div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(199,153,79,.25)"><div><div style="font-family:Fraunces,Georgia,serif;font-weight:700;font-size:17px">Pipeline coach</div><div style="font-size:11px;color:#CDBA99">Knows your pipeline. Honest, short answers.</div></div><div style="display:flex;gap:6px"><button class="hx-chip" onclick="hxSettings()">Passcode</button><button class="hx-chip" onclick="hxClear()">Clear</button><button class="hx-chip" onclick="hxToggle()" aria-label="Close">&times;</button></div></div>' +
      '<div id="hxNote" style="display:none;margin:10px 14px 0;padding:10px 12px;border-radius:12px;background:rgba(240,160,144,.12);border:1px solid rgba(240,160,144,.35);font-size:12.5px;line-height:1.45"></div>' +
      '<div id="hxPass" style="display:none;margin:10px 14px 0"><input id="hxPassIn" class="hx-input" type="password" placeholder="Pipeline passcode" autocomplete="off"><div style="margin-top:8px;display:flex;gap:8px"><button class="hx-btn pri" onclick="hxSavePass()">Save</button><button class="hx-btn" onclick="hxSettings()">Cancel</button></div></div>' +
      '<div id="hxMsgs" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px"></div>' +
      '<div style="padding:0 14px 8px;display:flex;gap:6px;flex-wrap:wrap">' +
      ['What should I do first today?', 'Who should I market to next?', 'Review my pipeline honestly'].map(function (q) { return '<span class="hx-chip" onclick="hxAsk(\'' + q + '\')">' + q + '</span>'; }).join('') + '</div>' +
      '<form onsubmit="return hxSend(event)" style="padding:10px 14px 14px;display:flex;gap:8px;border-top:1px solid rgba(199,153,79,.2)"><input id="hxIn" class="hx-input" placeholder="Ask about your pipeline..." autocomplete="off"><button class="hx-btn pri" type="submit">Send</button></form></div>' +
      '<button id="hxFab" onclick="hxToggle()" aria-label="Open pipeline coach">&#10024;</button>';
    document.body.appendChild(d); drawChat();
  }
  window.hxToggle = function () { var p = document.getElementById('hxPanel'); p.classList.toggle('open'); if (p.classList.contains('open')) { drawChat(); var i = document.getElementById('hxIn'); if (i && fine) i.focus(); } };
  window.hxSettings = function () { var p = document.getElementById('hxPass'); p.style.display = p.style.display === 'none' ? 'block' : 'none'; var i = document.getElementById('hxPassIn'); if (i) { i.value = ''; if (p.style.display === 'block') i.focus(); } };
  window.hxSavePass = function () { var v = (document.getElementById('hxPassIn').value || '').trim(); if (v) { ls.set('bgcs_home_pass', v); setNote(''); document.getElementById('hxPass').style.display = 'none'; } };
  window.hxClear = function () { chat = []; ls.set('bgcs_home_chat', '[]'); drawChat(); setNote(''); };
  window.hxAsk = function (q) { var p = document.getElementById('hxPanel'); if (!p.classList.contains('open')) window.hxToggle(); send(q); };
  window.hxSend = function (ev) { if (ev && ev.preventDefault) ev.preventDefault(); var i = document.getElementById('hxIn'); var v = (i.value || '').trim(); if (v) { i.value = ''; send(v); } return false; };

  function send(text) {
    if (sending) return;
    var pass = ls.get('bgcs_home_pass', '');
    chat.push({ role: 'user', content: text }); chat = chat.slice(-30); ls.set('bgcs_home_chat', JSON.stringify(chat));
    if (!pass) { drawChat(); setNote('Enter your pipeline passcode first (the Passcode button above). It stays on this device only.'); var p = document.getElementById('hxPass'); if (p) p.style.display = 'block'; return; }
    sending = true; setNote(''); drawChat();
    fetch(CHAT_URL, { method: 'POST', headers: { 'content-type': 'application/json', 'x-pipeline-pass': pass }, body: JSON.stringify({ messages: chat.slice(-10), context: buildContext() }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (x) {
        sending = false;
        if (x.status === 200 && x.j.reply) { chat.push({ role: 'assistant', content: x.j.reply }); chat = chat.slice(-30); ls.set('bgcs_home_chat', JSON.stringify(chat)); setNote(''); }
        else {
          chat.pop();
          if (x.j.error === 'not_configured') setNote('The coach is built but not switched on yet. Two secrets need to be set once in Supabase: <b>ANTHROPIC_API_KEY</b> and <b>PIPELINE_PASS</b>.');
          else if (x.j.error === 'bad_passcode') { ls.set('bgcs_home_pass', ''); setNote('That passcode did not match. Tap Passcode and try again.'); }
          else setNote(E(x.j.message || 'Something went wrong. Try again in a moment.'));
        }
        ls.set('bgcs_home_chat', JSON.stringify(chat)); drawChat();
      })
      .catch(function () { sending = false; chat.pop(); ls.set('bgcs_home_chat', JSON.stringify(chat)); setNote('Could not reach the coach. Check your connection and try again.'); drawChat(); });
  }

  /* ---------- stage chips for the board (phone) ---------- */
  function syncChips() {
    var cont = document.getElementById('salesFunnelContainer'); if (!cont) return;
    var cols = [].slice.call(cont.children).filter(function (c) { return c.getAttribute && c.getAttribute('data-stage'); });
    if (!cols.length) return;
    var names = cols.map(function (c) { return c.getAttribute('data-stage'); });
    var P = (typeof financialProspects !== 'undefined' && financialProspects) || [], cnt = {};
    P.forEach(function (p) { cnt[p.stage] = (cnt[p.stage] || 0) + 1; });
    if (!S.stage || names.indexOf(S.stage) < 0) {
      var saved = ls.get('bgcs_home_stage', ''); S.stage = names.indexOf(saved) >= 0 ? saved : (cnt['Email Drafted'] ? 'Email Drafted' : (names.filter(function (n) { return cnt[n]; })[0] || names[0]));
    }
    var chips = document.getElementById('hxChips');
    if (!chips) { chips = document.createElement('div'); chips.id = 'hxChips'; cont.parentNode.insertBefore(chips, cont); }
    chips.innerHTML = names.map(function (n) { return '<button type="button" class="hx-chip' + (n === S.stage ? ' on' : '') + '" data-s="' + E(n) + '" onclick="hxStage(this.getAttribute(\'data-s\'))">' + E(n) + ' &middot; ' + (cnt[n] || 0) + '</button>'; }).join('');
    cols.forEach(function (c) { c.classList.toggle('hx-show', c.getAttribute('data-stage') === S.stage); });
  }
  window.hxStage = function (n) { S.stage = n; ls.set('bgcs_home_stage', n); buzz(8); syncChips(); };
  (function () { var cont = document.getElementById('salesFunnelContainer'); if (cont && window.MutationObserver) { new MutationObserver(function () { try { syncChips(); } catch (e) {} }).observe(cont, { childList: true }); } try { syncChips(); } catch (e) {} })();

  /* ---------- updates: refresh button, pull down, new-version banner ---------- */
  var upd = { busy: false, remote: null };
  function spinAll(on) { [].forEach.call(document.querySelectorAll('.hx-rf'), function (b) { b.classList.toggle('spin', !!on); }); }
  function hardRefresh(msg) {
    if (upd.busy) return; upd.busy = true; spinAll(true); buzz(14); toast(msg || 'Refreshing...');
    var base = location.pathname.replace(/[^\/]*$/, ''), done = false;
    function go() { if (done) return; done = true; try { if (window.caches && caches.keys) caches.keys().then(function (k) { k.forEach(function (n) { caches.delete(n); }); }); } catch (e) {} location.replace(location.pathname + '?r=' + Date.now() + (location.hash || '#view=pipeline')); }
    setTimeout(go, 7000);
    function reload(u) { return fetch(base + u, { cache: 'reload' }).catch(function () {}); }
    fetch(base + 'version.json?t=' + Date.now(), { cache: 'reload' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (j) { var v = (j && j.v) || BUILD; return Promise.all([reload('pipeline.html'), reload('pipeline-home.js?b=' + encodeURIComponent(v)), reload('outreach-feed.json'), reload('news-feed.json')]); })
      .then(go, go);
  }
  window.hxRefresh = function () { hardRefresh('Refreshing...'); };
  window.hxUpdate = function () { hardRefresh('Updating...'); };
  function updBanner(show) {
    var b = document.getElementById('hxUpd');
    if (!show) { if (b) b.remove(); return; }
    if (b) return; b = document.createElement('div'); b.id = 'hxUpd';
    b.innerHTML = '<span>New version ready</span><button class="hx-btn" onclick="hxUpdate()">Update now</button>';
    document.body.appendChild(b); buzz(10);
  }
  function checkVersion() {
    return fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (!j || !j.v) return; upd.remote = j.v; updBanner(String(j.v) !== String(BUILD)); }).catch(function () {});
  }
  (function () {
    var y0 = 0, dy = 0, on = false, el = null;
    function ind() { if (!el) { el = document.createElement('div'); el.id = 'hxPtr'; el.innerHTML = '<span>&darr;</span><b>Pull to refresh</b>'; document.body.appendChild(el); } return el; }
    document.addEventListener('touchstart', function (e) {
      on = isMobile() && (window.scrollY || 0) <= 0 && e.touches.length === 1 && !(e.target.closest && e.target.closest('#hxPanel,#hxSheet,#hxBar,.fixed,input,textarea,select,.hx-swipe'));
      if (on) { y0 = e.touches[0].clientY; dy = 0; }
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (!on) return; var d = e.touches[0].clientY - y0;
      if (d <= 8 || (window.scrollY || 0) > 0) { if (el) el.className = ''; dy = 0; return; }
      dy = Math.min(d, 150); var i = ind(), ready = dy > 85;
      i.style.transform = 'translate(-50%,' + (Math.min(dy, 110) * 0.6 - 40) + 'px)'; i.className = (ready ? 'rdy ' : '') + 'show';
      i.querySelector('b').textContent = ready ? 'Release to refresh' : 'Pull to refresh'; i.firstChild.style.transform = 'rotate(' + (ready ? 180 : 0) + 'deg)';
    }, { passive: true });
    document.addEventListener('touchend', function () { if (!on) return; on = false; var go = dy > 85; if (el) el.className = ''; dy = 0; if (go) hardRefresh('Refreshing...'); }, { passive: true });
  })();
  setTimeout(checkVersion, 2500);
  setInterval(checkVersion, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) checkVersion(); });

  /* ---------- go live ---------- */
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { renderHome(); });
  try { var _smv = window.switchMainView; if (typeof _smv === 'function') { window.switchMainView = function () { var r = _smv.apply(this, arguments); try { drawBar(); } catch (e) {} return r; }; } } catch (e) {}
  setInterval(function () { try { drawBar(); } catch (e) {} }, 900);
  buildDock();
  renderHome();
  loadNews();
  setInterval(loadNews, 15 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { try { renderHome(); } catch (e) {} } });
  window.addEventListener('storage', function () { try { renderHome(); } catch (e) {} });
})();
