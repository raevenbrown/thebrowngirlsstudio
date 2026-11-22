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

  var S = { tab: (function () { try { return localStorage.getItem('bgcs_home_tab') || 'today'; } catch (e) { return 'today'; } })(), skip: 0, showAll: false, newsFilter: 'All', news: null, newsErr: false, timer: null, timerLeft: 0, animated: false, edit: false, dirty: false };

  /* ---------- styles ---------- */
  var css = [
    '#homeCmd{position:relative;isolation:isolate;overflow-x:clip;--g:#C7994F;--gl:#E3BD79;--tx:#F3E8D6;--mu:#CDBA99;padding:6px 0 90px}',
    '#homeCmd:before,#homeCmd:after{content:"";position:absolute;z-index:-1;border-radius:50%;filter:blur(70px);opacity:.28;pointer-events:none}',
    '#homeCmd:before{width:420px;height:420px;left:-120px;top:-60px;background:#8a5a2b;animation:hxf1 18s ease-in-out infinite alternate}',
    '#homeCmd:after{width:360px;height:360px;right:-100px;top:240px;background:#C7994F;animation:hxf2 22s ease-in-out infinite alternate}',
    '@keyframes hxf1{to{transform:translate(70px,50px)}}@keyframes hxf2{to{transform:translate(-60px,-40px)}}',
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
    '.hx-strip{display:flex;align-items:center;justify-content:space-between;gap:12px 16px;flex-wrap:wrap;padding:2px 4px 18px}',
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
    ' html:has(body.hx-mob),body.hx-mob{overflow-x:clip}.hx-swipe-fg>div,.hx-row>div{min-width:0;overflow-wrap:anywhere}',
    ' body.hx-mob .hx-river{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;overflow:visible;padding:4px 0 6px}body.hx-mob .hx-stage{flex:none;min-width:0;padding:12px 6px}',
    ' main>header button[onclick="exportCSV()"]{display:none}main>header #pageTitle,main>header button[onclick^="openFinancialProspectModal"]{white-space:nowrap}',
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
    /* greeting strip */
    '.hx-hello{font-family:Fraunces,Georgia,serif;font-size:clamp(1.4rem,2.4vw,1.85rem);font-weight:700;line-height:1.12;color:var(--tx)}',
    '.hx-sub{font-size:12.5px;color:var(--mu);margin-top:4px}',
    '.hx-sr{display:flex;align-items:center;gap:10px}',
    '.hx-rf.on{background:linear-gradient(135deg,#E3BD79,#C7994F);color:#2A160E;border-color:transparent}',
    /* customizable board */
    '.hx-board{display:flex;flex-direction:column;gap:16px;min-width:0}',
    '.hx-tile{position:relative;min-width:0;max-width:100%;display:flex;flex-direction:column}.hx-tile>.hx-tb{flex:none}',
    '@media(min-width:700px){.hx-board{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-rows:8px;column-gap:16px;row-gap:0;grid-auto-flow:row dense}.hx-tile{grid-column:span var(--sp,12);align-self:start;margin-bottom:16px}}',
    '.hx-tile>.hx-card{margin:0;flex:1 1 auto}',
    '.hx-k:before{content:"";display:inline-block;width:12px;height:3px;border-radius:3px;background:linear-gradient(90deg,#C7994F,#F0CC8C);margin-right:8px;vertical-align:middle;position:relative;top:-1px}',
    '.hx-next .hx-k:before{display:none}.hx-tile .hx-k{padding-right:36px}',
    '.hx-tile.hx-fold>.hx-card{max-height:56px;overflow:hidden;padding-bottom:12px}',
    '.hx-tile.hx-fold>.hx-card *{visibility:hidden}.hx-tile.hx-fold>.hx-card .hx-k,.hx-tile.hx-fold>.hx-card .hx-k *,.hx-tile.hx-fold>.hx-card .hx-chev,.hx-tile.hx-fold>.hx-card .hx-chev *{visibility:visible}',
    '.hx-tile.hx-fold .hx-k{margin-bottom:0}',
    '.hx-chev{position:absolute;top:10px;right:10px;z-index:5;width:30px;height:30px;border-radius:50%;border:1px solid rgba(199,153,79,.3);background:rgba(0,0,0,.22);color:var(--mu);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;opacity:.55;transition:opacity .15s,transform .25s,background .15s}',
    '.hx-card:hover .hx-chev,.hx-chev:focus-visible{opacity:1}.hx-chev:hover{background:rgba(199,153,79,.22);color:var(--gl)}.hx-chev svg{width:15px;height:15px}',
    '.hx-fold .hx-chev{transform:rotate(180deg);opacity:1}',
    '@media(hover:none){.hx-chev{opacity:.85;width:34px;height:34px}}',
    '.hx-tb,.hx-rz{display:none}',
    '.hx-editing .hx-tb{display:flex}',
    '.hx-tb{align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px;padding:5px 6px;border-radius:14px;background:rgba(199,153,79,.13);border:1px solid rgba(227,189,121,.4)}',
    '.hx-grip{width:40px;height:36px;border-radius:10px;border:1px solid rgba(199,153,79,.5);background:rgba(199,153,79,.2);color:var(--gl);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;padding:0;flex:none;display:inline-flex;align-items:center;justify-content:center}',
    '.hx-grip svg{width:20px;height:20px}.hx-grip:active{cursor:grabbing}',
    '.hx-tl{flex:1 1 70px;min-width:0;font-size:12px;font-weight:800;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.hx-tbb{min-width:34px;height:34px;padding:0 9px;border-radius:10px;border:1px solid rgba(199,153,79,.3);background:rgba(0,0,0,.25);color:var(--mu);font-size:11.5px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}',
    '.hx-tbb:hover{border-color:rgba(227,189,121,.7);color:var(--tx)}.hx-tbb.on{background:linear-gradient(135deg,#E3BD79,#C7994F);color:#2A160E;border-color:transparent}',
    '.hx-szg{display:flex;gap:4px}.hx-sz2{display:none}.hx-mv{display:none}.hx-tbb .f2{display:none}.hx-fold .hx-tbb .f1{display:none}.hx-fold .hx-tbb .f2{display:inline}',
    '@media(min-width:700px) and (max-width:1023px){.hx-sz3{display:none}.hx-sz2{display:flex}}',
    '@media(max-width:1023px){.hx-mv{display:inline-flex}}',
    '@media(max-width:699px){.hx-szg{display:none!important}}',
    '.hx-editing .hx-rz{display:inline-flex;position:absolute;right:8px;bottom:8px;z-index:6;width:34px;height:34px;align-items:center;justify-content:center;border-radius:10px;border:1px solid rgba(227,189,121,.65);background:rgba(42,22,14,.88);color:var(--gl);cursor:ew-resize;touch-action:none;padding:0}',
    '.hx-rz svg{width:18px;height:18px}',
    '@media(max-width:699px){.hx-editing .hx-rz{display:none}}',
    '.hx-editing .hx-tile{outline:1.5px dashed rgba(227,189,121,.4);outline-offset:5px;border-radius:22px}',
    '.hx-editing .hx-card{pointer-events:none;transform:none!important}.hx-editing .hx-chev{display:none}',
    '.hx-tile.hx-drag-src{opacity:.28}',
    '.hx-ghost{position:fixed!important;left:0;top:0;z-index:99995;pointer-events:none;transform-origin:0 0;opacity:.95;max-height:520px;overflow:hidden;border-radius:22px;box-shadow:0 30px 60px -14px rgba(0,0,0,.9)}.hx-ghost .hx-chev{display:none}',
    'body.hx-dragging{user-select:none;-webkit-user-select:none;cursor:grabbing}',
    '.hx-panel{display:none;margin-bottom:18px;padding:16px 18px;border-radius:20px;background:linear-gradient(145deg,rgba(98,60,34,.55),rgba(29,19,14,.88));border:1px solid rgba(227,189,121,.45)}',
    '.hx-editing .hx-panel{display:block;animation:hxin .3s both}',
    '.hx-pn{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap}',
    '.hx-pt{font-family:Fraunces,Georgia,serif;font-size:18px;font-weight:700;color:var(--tx);margin-bottom:2px}',
    '.hx-pl{font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--g);margin:14px 0 7px}',
    '.hx-prow{display:flex;gap:8px;flex-wrap:wrap}',
    '.hx-empty{grid-column:span 12;padding:34px 18px;text-align:center;color:var(--mu);border:1px dashed rgba(199,153,79,.35);border-radius:20px}',
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
    if (drag || rsz) { S.dirty = true; return; }
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
    var dateTxt = ''; try { dateTxt = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ' &middot; '; } catch (e) {}
    var strip = '<div class="hx-strip"><div class="hx-hi"><div class="hx-hello">' + greeting() + ', Raeven</div><div class="hx-sub">' + dateTxt + E(levelName(wToday)) + ' &middot; ' + wToday + ' win' + (wToday === 1 ? '' : 's') + ' today</div></div>' +
      '<div class="hx-sr"><div class="hx-pips">' + pips + '</div><div class="hx-flame" title="Day streak">&#128293; ' + stk + '</div>' +
      '<button class="hx-rf hx-cz' + (S.edit ? ' on' : '') + '" onclick="hxEdit()" aria-label="Customize your dashboard" title="Customize: move, resize, hide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h9M19 6h1M4 12h3M13 12h7M4 18h11M21 18h-1"/><circle cx="16" cy="6" r="2.2"/><circle cx="10" cy="12" r="2.2"/><circle cx="18" cy="18" r="2.2"/></svg></button>' +
      '<button class="hx-rf' + (upd.busy ? ' spin' : '') + '" onclick="hxRefresh()" aria-label="Refresh the app" title="Refresh"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg></button></div></div>';

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
    var compCard = '<div class="hx-card fx-tilt hx-4 hx-in"><div class="hx-k">Competitors and how to win</div>' + comp + (take ? '<p class="hx-mu" style="margin-top:8px"><b style="color:#F3E8D6">Your edge:</b> ' + E(take) + '</p>' : '') + '<a class="hx-a" href="#view=advisor" onclick="switchMainView(\'advisor\')" style="font-size:12px;display:inline-block;margin-top:8px">Open the AI Coach &rarr;</a></div>';

    var verLine = '<div class="hx-ver">Version ' + E(BUILD) + ' &middot; <button onclick="hxRefresh()">Refresh now</button></div>';
    var CARDS = {
      next: function () { return hero; }, goal: function () { return ring; }, river: function () { return river; },
      tasks: function () { return tasksCardFn(mob ? (S.tab === 'board' ? 8 : 3) : 5); },
      quick: function () { return quick; }, warm: function () { return warm; }, autos: function () { return autos; },
      news: function () { return newsCard(); }, comp: function () { return compCard; }, marketing: function () { return marketingCard(); }
    };
    var lk = mob ? 'c' : 'w', L = layoutGet(lk), sub = mob ? (TAB_TILES[S.tab] || TAB_TILES.today) : null;
    var avail = L.order.filter(function (id) { return !sub || sub.indexOf(id) >= 0; });
    var vis = avail.filter(function (id) { return !L.hidden[id]; });
    var hid = avail.filter(function (id) { return L.hidden[id]; });
    var tilesHtml = vis.map(function (id) { return tileHtml(id, CARDS[id](), L); }).join('');
    var body = panelHtml(lk, hid) + '<div class="hx-board">' + (tilesHtml || '<div class="hx-empty">Every card here is hidden. Tap the sliders button at the top to bring them back.</div>') + '</div>' + ((!mob || S.tab === 'today') ? verLine : '');
    box.className = S.edit ? 'hx-editing' : '';
    box.innerHTML = strip + body;
    var bd = boardEl(); if (bd) { applySpans(bd); [].forEach.call(bd.querySelectorAll('.hx-tile'), syncTool); fitNow(); observe(bd); }
    countUp(box);
    if (!S.animated && !reduce) { requestAnimationFrame(function () { var fg = box.querySelector('.hx-ring .fg'); if (fg) { void fg.getBoundingClientRect(); fg.style.strokeDashoffset = fg.getAttribute('data-off'); } }); }
    S.animated = true;
    try { drawBar(); } catch (e) {}
  }

  /* ---------- customizable dashboard: tiles, drag, resize, hide, fold ---------- */
  var TILES = [['river', 'Where everyone is'], ['next', 'Do this next'], ['goal', 'Goal'], ['tasks', 'Your list'], ['quick', 'Quick actions'],
    ['warm', 'Who replied'], ['autos', 'Running for you'], ['news', 'Market intel'], ['comp', 'Competitors'], ['marketing', 'Digital marketing']];
  var TLABEL = {}; TILES.forEach(function (t) { TLABEL[t[0]] = t[1]; });
  var SIZES = ['S', 'M', 'L', 'F'];
  var TAB_TILES = { today: ['next', 'tasks', 'quick', 'goal', 'autos'], board: ['river', 'warm', 'tasks'], clips: ['marketing'], intel: ['news', 'comp'] };
  var LKEY = { w: 'bgcs_home_layout', c: 'bgcs_home_layout_c' };
  var DEFL = {
    w: { order: ['river', 'next', 'goal', 'tasks', 'quick', 'warm', 'autos', 'news', 'comp', 'marketing'],
         size: { river: 'F', next: 'L', goal: 'S', tasks: 'L', quick: 'S', warm: 'S', autos: 'S', news: 'L', comp: 'S', marketing: 'F' } },
    c: { order: ['next', 'tasks', 'quick', 'goal', 'autos', 'river', 'warm', 'news', 'comp', 'marketing'],
         size: { next: 'F', tasks: 'F', quick: 'M', goal: 'M', autos: 'F', river: 'F', warm: 'F', news: 'F', comp: 'F', marketing: 'F' } }
  };
  var GRIP = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></svg>';
  var CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  var RZ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>';
  var drag = null, rsz = null;

  function lkey() { return isMobile() ? 'c' : 'w'; }
  function layoutGet(k) {
    var d = DEFL[k], raw = null; try { raw = JSON.parse(ls.get(LKEY[k], 'null')); } catch (e) { raw = null; }
    if (!raw || typeof raw !== 'object') raw = {};
    var L = { order: [], size: {}, hidden: {}, fold: {} };
    (Array.isArray(raw.order) ? raw.order : []).forEach(function (id) { if (TLABEL[id] && L.order.indexOf(id) < 0) L.order.push(id); });
    d.order.forEach(function (id) { if (L.order.indexOf(id) < 0) L.order.push(id); });
    TILES.forEach(function (t) {
      var id = t[0], s = raw.size && raw.size[id];
      L.size[id] = SIZES.indexOf(s) >= 0 ? s : d.size[id];
      if (raw.hidden && raw.hidden[id]) L.hidden[id] = 1;
      if (raw.fold && raw.fold[id]) L.fold[id] = 1;
    });
    return L;
  }
  function layoutSave(k, L) { ls.set(LKEY[k], JSON.stringify(L)); }
  function presetLayout(k, name) {
    var d = DEFL[k], L = { order: d.order.slice(), size: {}, hidden: {}, fold: {} };
    Object.keys(d.size).forEach(function (id) { L.size[id] = d.size[id]; });
    if (name === 'focus') (k === 'w' ? ['news', 'comp', 'autos', 'marketing'] : ['comp', 'autos']).forEach(function (id) { L.hidden[id] = 1; });
    if (name === 'marketing' && k === 'w') { L.order = ['marketing'].concat(d.order.filter(function (x) { return x !== 'marketing'; })); L.fold.comp = 1; L.fold.autos = 1; }
    return L;
  }
  function mergeOrder(full, vis) { var out = full.slice(), j = 0; for (var i = 0; i < out.length; i++) { if (vis.indexOf(out[i]) >= 0) out[i] = vis[j++]; } return out; }

  function toolbarHtml(id) {
    var lab = E(TLABEL[id]);
    function sb(v, t) { return '<button class="hx-tbb" data-hxa="size" data-v="' + v + '" aria-label="Make ' + lab + ' ' + t + '">' + t + '</button>'; }
    return '<div class="hx-tb"><button class="hx-grip" aria-label="Move ' + lab + '. Drag, or use the arrow keys." title="Drag to move">' + GRIP + '</button><span class="hx-tl">' + lab + '</span>' +
      '<span class="hx-szg hx-sz3">' + sb('S', '1/3') + sb('M', '1/2') + sb('L', '2/3') + sb('F', 'Full') + '</span>' +
      '<span class="hx-szg hx-sz2">' + sb('M', '1/2') + sb('F', 'Full') + '</span>' +
      '<button class="hx-tbb hx-mv" data-hxa="up" aria-label="Move ' + lab + ' up">&#9650;</button><button class="hx-tbb hx-mv" data-hxa="down" aria-label="Move ' + lab + ' down">&#9660;</button>' +
      '<button class="hx-tbb" data-hxa="fold" aria-label="Fold or open ' + lab + '"><span class="f1">Fold</span><span class="f2">Open</span></button>' +
      '<button class="hx-tbb" data-hxa="hide" aria-label="Hide ' + lab + '">Hide</button></div>';
  }
  function tileHtml(id, html, L) {
    var chev = '<button class="hx-chev" data-hxa="fold" aria-label="Fold or open ' + E(TLABEL[id]) + '" title="Fold or open">' + CHEV + '</button>';
    html = html.replace(/^(<div class="hx-card[^>]*>)/, '$1' + chev);
    return '<section class="hx-tile' + (L.fold[id] ? ' hx-fold' : '') + '" data-id="' + id + '" data-size="' + L.size[id] + '">' + toolbarHtml(id) + html +
      '<button class="hx-rz" data-hxa="rz" aria-label="Drag sideways to resize ' + E(TLABEL[id]) + '" title="Drag sideways to resize">' + RZ + '</button></section>';
  }
  function panelHtml(k, hid) {
    var pr = k === 'w' ? [['balanced', 'Balanced'], ['focus', 'Focus'], ['marketing', 'Marketing week']] : [['balanced', 'Balanced'], ['focus', 'Focus']];
    var hint = k === 'w' ? 'Hold the dotted handle and drag a card to move it. Drag the arrow in a card corner to resize. Fold or hide what you do not need today.'
      : 'Hold the dotted handle and drag a card, or tap the arrows, to move it. Fold or hide what you do not need today.';
    return '<div class="hx-panel" role="region" aria-label="Customize your dashboard"><div class="hx-pn"><div style="flex:1 1 240px;min-width:0"><div class="hx-pt">Make it yours</div><div class="hx-mu" style="font-size:12.5px">' + hint + ' Saved on this device.</div></div>' +
      '<button class="hx-btn pri" data-hxa="done">Done</button></div>' +
      '<div class="hx-pl">Layouts</div><div class="hx-prow">' + pr.map(function (x) { return '<button class="hx-chip" data-hxa="preset" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '<button class="hx-chip" data-hxa="reset">Reset</button></div>' +
      (hid.length ? '<div class="hx-pl">Hidden cards (tap to bring back)</div><div class="hx-prow">' + hid.map(function (id) { return '<button class="hx-chip" data-hxa="show" data-id="' + id + '">+ ' + E(TLABEL[id]) + '</button>'; }).join('') + '</div>' : '') + '</div>';
  }

  /* spans and masonry packing */
  function boardEl() { return document.querySelector('#homeCmd .hx-board'); }
  function tilesOf(board) {
    var a = [].slice.call(board.children).filter(function (t) { return t.classList && t.classList.contains('hx-tile'); });
    if (a.some(function (t) { return t.style.order !== ''; })) a.sort(function (x, y) { return (+x.style.order || 0) - (+y.style.order || 0); });
    return a;
  }
  function idsOf(board) { return tilesOf(board).map(function (t) { return t.getAttribute('data-id'); }); }
  function spanFor(sz) {
    var w = window.innerWidth;
    if (w >= 1024) return { S: 4, M: 6, L: 8, F: 12 }[sz] || 12;
    if (w >= 700) return (sz === 'S' || sz === 'M') ? 6 : 12;
    return 12;
  }
  function applySpans(board) {
    var ts = tilesOf(board), w = window.innerWidth, i;
    var sp = ts.map(function (t) { return spanFor(t.getAttribute('data-size')); });
    if (w >= 700 && w < 1024) { for (i = 0; i < sp.length; i++) { if (sp[i] === 6) { if (i + 1 < sp.length && sp[i + 1] === 6) i++; else sp[i] = 12; } } }
    ts.forEach(function (t, j) { t.style.setProperty('--sp', sp[j]); t.setAttribute('data-sp', sp[j]); });
  }
  /* Packs tiles like masonry: each tile goes where it sits highest, empty space beside a tile is filled by widening it,
     and a gap under a tile is closed by stretching it down to the next card. So there is no dead space. */
  function fitNow() {
    var board = boardEl(); if (!board) return;
    var ts = tilesOf(board), grid = getComputedStyle(board).display === 'grid';
    if (!grid) { ts.forEach(function (t) { t.style.gridColumn = ''; t.style.gridRow = ''; t.style.alignSelf = ''; t.removeAttribute('data-fill'); }); return; }
    if (!ts.length) return;
    var sp = ts.map(function (t) { return +t.getAttribute('data-sp') || 12; });
    ts.forEach(function (t, i) { t.style.gridColumn = 'span ' + sp[i]; t.style.gridRow = 'auto'; t.style.alignSelf = 'start'; });
    var hp = ts.map(function (t) { return Math.max(1, Math.ceil((t.offsetHeight + 16) / 8)); });
    var bot = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], P = [], c, i, j;
    ts.forEach(function (t, k) {
      var s = sp[k], bc = 0, by = 1e9, y, q;
      for (c = 0; c <= 12 - s; c++) { y = 0; for (q = c; q < c + s; q++) if (bot[q] > y) y = bot[q]; if (y < by) { by = y; bc = c; } }
      for (q = bc; q < bc + s; q++) bot[q] = by + hp[k];
      P.push({ c: bc, y: by, s: s, h: hp[k] });
    });
    function hit(a, b) { return a.c < b.c + b.s && b.c < a.c + a.s && a.y < b.y + b.h && b.y < a.y + a.h; }
    function freeCol(a, col) { var probe = { c: col, s: 1, y: a.y, h: a.h }; for (var q = 0; q < P.length; q++) if (P[q] !== a && hit(probe, P[q])) return false; return true; }
    P.forEach(function (a, k) {
      var grew = false;
      while (a.c + a.s < 12 && freeCol(a, a.c + a.s)) { a.s++; grew = true; }
      while (a.c > 0 && freeCol(a, a.c - 1)) { a.c--; a.s++; grew = true; }
      if (grew) { ts[k].style.gridColumn = (a.c + 1) + ' / span ' + a.s; a.h = Math.max(1, Math.ceil((ts[k].offsetHeight + 16) / 8)); }
    });
    var maxY = 0; P.forEach(function (a) { if (a.y + a.h > maxY) maxY = a.y + a.h; });
    P.forEach(function (a, k) {
      if (ts[k].classList.contains('hx-fold')) { a.fold = true; return; }
      var lim = maxY;
      P.forEach(function (b) { if (b !== a && b.y >= a.y + a.h && b.c < a.c + a.s && a.c < b.c + b.s && b.y < lim) lim = b.y; });
      if (lim > a.y + a.h && (lim - a.y - a.h) * 8 <= 300) a.h = lim - a.y;
    });
    P.forEach(function (a, k) {
      var t = ts[k];
      t.style.gridColumn = (a.c + 1) + ' / span ' + a.s; t.style.gridRow = (a.y + 1) + ' / span ' + a.h;
      t.style.alignSelf = a.fold ? 'start' : 'stretch'; t.setAttribute('data-fill', a.s);
    });
  }
  var fitRaf = 0;
  function fit() { if (fitRaf) return; fitRaf = requestAnimationFrame(function () { fitRaf = 0; fitNow(); }); }
  var ro = null; try { if (window.ResizeObserver) ro = new ResizeObserver(function () { fit(); }); } catch (e) { ro = null; }
  function observe(board) { if (!ro) return; try { ro.disconnect(); [].forEach.call(board.querySelectorAll('.hx-tile'), function (t) { ro.observe(t); }); } catch (e) {} }
  window.addEventListener('resize', function () { var b = boardEl(); if (b) { applySpans(b); fit(); } });
  try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); }); } catch (e) {}
  function syncTool(tile) {
    var s = tile.getAttribute('data-size');
    [].forEach.call(tile.querySelectorAll('.hx-tb [data-hxa="size"]'), function (b) {
      var v = b.getAttribute('data-v'), two = !!b.closest('.hx-sz2');
      b.classList.toggle('on', two ? (v === 'M' ? (s === 'S' || s === 'M') : (s === 'L' || s === 'F')) : v === s);
    });
  }
  function persistOrder(board) { var k = lkey(), L = layoutGet(k); L.order = mergeOrder(L.order, idsOf(board)); layoutSave(k, L); }
  function refreshPanel() {
    var k = lkey(), L = layoutGet(k), sub = isMobile() ? (TAB_TILES[S.tab] || TAB_TILES.today) : null;
    var hid = L.order.filter(function (id) { return L.hidden[id] && (!sub || sub.indexOf(id) >= 0); });
    var p = document.querySelector('#homeCmd .hx-panel'); if (p) p.outerHTML = panelHtml(k, hid);
  }
  function setEdit(on) {
    S.edit = !!on; var box = document.getElementById('homeCmd'); if (!box) return;
    box.classList.toggle('hx-editing', S.edit);
    [].forEach.call(box.querySelectorAll('.hx-cz'), function (b) { b.classList.toggle('on', S.edit); });
    fit();
    if (S.edit) { var p = box.querySelector('.hx-panel'); try { if (p && p.getBoundingClientRect().top < 0) window.scrollBy({ top: p.getBoundingClientRect().top - 70, behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {} }
  }
  window.hxEdit = function () { setEdit(!S.edit); };

  /* actions (buttons inside tiles and the panel) */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-hxa]'); if (!b || !b.closest('#homeCmd')) return;
    var act = b.getAttribute('data-hxa'), tile = b.closest('.hx-tile'), id = tile ? tile.getAttribute('data-id') : b.getAttribute('data-id');
    var k = lkey(), L = layoutGet(k), board = boardEl();
    if (act === 'fold' && tile) {
      var f = !tile.classList.contains('hx-fold'); tile.classList.toggle('hx-fold', f);
      if (f) L.fold[id] = 1; else delete L.fold[id]; layoutSave(k, L); fit();
    } else if (act === 'hide' && tile) {
      L.hidden[id] = 1; layoutSave(k, L); tile.remove(); refreshPanel(); fit();
      if (board && !tilesOf(board).length) renderHome();
    } else if (act === 'show') {
      delete L.hidden[id]; layoutSave(k, L); renderHome();
    } else if (act === 'size' && tile) {
      var v = b.getAttribute('data-v'); tile.setAttribute('data-size', v); L.size[id] = v; layoutSave(k, L); applySpans(board); syncTool(tile); fit();
    } else if ((act === 'up' || act === 'down') && tile) {
      moveTile(tile, act === 'up' ? -1 : 1, true);
    } else if (act === 'preset') {
      layoutSave(k, presetLayout(k, b.getAttribute('data-v'))); renderHome(); toast('Layout applied');
    } else if (act === 'reset') {
      ls.set(LKEY[k], 'null'); renderHome(); toast('Back to the original layout');
    } else if (act === 'done') {
      setEdit(false); try { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); } catch (e2) {}
    }
  });
  function moveTile(tile, dir, focusGrip) {
    var board = boardEl(); if (!board) return;
    var ts = tilesOf(board), i = ts.indexOf(tile), j = i + dir; if (i < 0 || j < 0 || j >= ts.length) return;
    if (dir < 0) board.insertBefore(tile, ts[j]); else board.insertBefore(ts[j], tile);
    persistOrder(board); applySpans(board); fitNow();
    try { tile.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
    if (focusGrip) { var g = tile.querySelector('.hx-grip'); if (g) g.focus(); }
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && S.edit && !drag && !rsz) { setEdit(false); return; }
    var g = e.target.classList && e.target.classList.contains('hx-grip') ? e.target : null; if (!g || !S.edit) return;
    var d = (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : 0;
    if (d) { e.preventDefault(); moveTile(g.closest('.hx-tile'), d, true); }
  });

  /* drag to reorder */
  var SC = 0.6;
  function orderTiles(board, ids) { ids.forEach(function (id, i) { var t = board.querySelector('.hx-tile[data-id="' + id + '"]'); if (t) t.style.order = i; }); }
  function moveGhost() { var d = drag; d.ghost.style.transform = 'translate(' + (d.x - d.ox * SC) + 'px,' + (d.y - d.oy * SC) + 'px) scale(' + SC + ')'; }
  function dragStart(e, grip) {
    var tile = grip.closest('.hx-tile'), board = boardEl(); if (!tile || !board || drag) return;
    e.preventDefault();
    var r = tile.getBoundingClientRect(), gh = tile.cloneNode(true);
    gh.classList.add('hx-ghost'); gh.style.width = r.width + 'px';
    [].forEach.call(gh.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
    [].forEach.call(gh.querySelectorAll('.hx-in'), function (n) { n.classList.remove('hx-in'); });
    document.body.appendChild(gh);
    orderTiles(board, idsOf(board));
    tile.classList.add('hx-drag-src');
    drag = { tile: tile, id: tile.getAttribute('data-id'), board: board, ghost: gh, ox: e.clientX - r.left, oy: e.clientY - r.top, x: e.clientX, y: e.clientY, t: 0, sv: 0, raf: 0, pid: e.pointerId };
    try { grip.setPointerCapture(e.pointerId); } catch (_) {}
    document.body.classList.add('hx-dragging'); moveGhost(); buzz(10);
  }
  function hover() {
    var d = drag, now = Date.now(); if (!d || now - d.t < 120) return;
    var els = document.elementsFromPoint(d.x, d.y), tgt = null;
    for (var i = 0; i < els.length; i++) { var t = els[i].closest ? els[i].closest('.hx-tile') : null; if (t && t !== d.tile && d.board.contains(t)) { tgt = t; break; } }
    if (!tgt) return;
    var rr = tgt.getBoundingClientRect(), sr = d.tile.getBoundingClientRect();
    var stacked = Math.abs((sr.left + sr.width / 2) - (rr.left + rr.width / 2)) < 0.35 * Math.max(sr.width, rr.width);
    var before = stacked ? d.y < rr.top + rr.height / 2 : d.x < rr.left + rr.width / 2;
    var cur = idsOf(d.board), tid = tgt.getAttribute('data-id');
    var nxt = cur.filter(function (x) { return x !== d.id; }); nxt.splice(nxt.indexOf(tid) + (before ? 0 : 1), 0, d.id);
    if (nxt.join() === cur.join()) return;
    orderTiles(d.board, nxt); applySpans(d.board); fitNow(); d.t = now;
  }
  function scrollStep() {
    var d = drag; if (!d) return; d.raf = 0; if (!d.sv) return;
    window.scrollBy(0, d.sv); hover(); d.raf = requestAnimationFrame(scrollStep);
  }
  function autoScroll() {
    var d = drag, vh = window.innerHeight, y = d.y;
    d.sv = y < 90 ? -Math.min(24, Math.ceil((90 - y) / 4)) : y > vh - 90 ? Math.min(24, Math.ceil((y - (vh - 90)) / 4)) : 0;
    if (d.sv && !d.raf) d.raf = requestAnimationFrame(scrollStep);
  }
  function dragEnd(cancel) {
    var d = drag; if (!d) return; drag = null;
    if (d.raf) cancelAnimationFrame(d.raf);
    d.ghost.remove(); d.tile.classList.remove('hx-drag-src'); document.body.classList.remove('hx-dragging');
    if (!cancel) { tilesOf(d.board).forEach(function (t) { d.board.appendChild(t); }); }
    [].forEach.call(d.board.children, function (t) { if (t.style) t.style.order = ''; });
    if (!cancel) persistOrder(d.board);
    applySpans(d.board); fitNow();
    if (S.dirty) { S.dirty = false; renderHome(); }
  }

  /* drag sideways to resize */
  function rszStart(e, h) {
    var tile = h.closest('.hx-tile'), board = boardEl(); if (!tile || !board || rsz) return;
    e.preventDefault();
    var tr = tile.getBoundingClientRect(), br = board.getBoundingClientRect();
    rsz = { tile: tile, board: board, id: tile.getAttribute('data-id'), pid: e.pointerId, x0: e.clientX, w0: tr.width, bw: br.width, cur: tile.getAttribute('data-size') };
    try { h.setPointerCapture(e.pointerId); } catch (_) {}
    document.body.classList.add('hx-dragging');
  }
  function rszMove(e) {
    var r = rsz, w = r.w0 + (e.clientX - r.x0), col = (r.bw - 11 * 16) / 12, span = (w + 16) / (col + 16);
    var opts = window.innerWidth >= 1024 ? [['S', 4], ['M', 6], ['L', 8], ['F', 12]] : [['M', 6], ['F', 12]];
    var best = opts[0]; opts.forEach(function (o) { if (Math.abs(o[1] - span) < Math.abs(best[1] - span)) best = o; });
    if (best[0] === r.cur) return;
    r.cur = best[0]; r.tile.setAttribute('data-size', best[0]); applySpans(r.board); syncTool(r.tile); fitNow();
  }
  function rszEnd() {
    var r = rsz; if (!r) return; rsz = null; document.body.classList.remove('hx-dragging');
    var k = lkey(), L = layoutGet(k); L.size[r.id] = r.cur; layoutSave(k, L);
    if (S.dirty) { S.dirty = false; renderHome(); }
  }

  document.addEventListener('pointerdown', function (e) {
    if (!S.edit || (e.pointerType === 'mouse' && e.button !== 0)) return;
    var g = e.target.closest && e.target.closest('#homeCmd .hx-grip'); if (g) { dragStart(e, g); return; }
    var h = e.target.closest && e.target.closest('#homeCmd .hx-rz'); if (h) rszStart(e, h);
  });
  document.addEventListener('pointermove', function (e) {
    if (rsz && e.pointerId === rsz.pid) { rszMove(e); return; }
    if (!drag || e.pointerId !== drag.pid) return;
    drag.x = e.clientX; drag.y = e.clientY; moveGhost(); autoScroll(); hover();
  });
  document.addEventListener('pointerup', function (e) { if (rsz && e.pointerId === rsz.pid) rszEnd(); else if (drag && e.pointerId === drag.pid) dragEnd(false); });
  document.addEventListener('pointercancel', function (e) { if (rsz && e.pointerId === rsz.pid) rszEnd(); else if (drag && e.pointerId === drag.pid) dragEnd(true); });

  /* ---------- bottom tab bar (phone) ---------- */
  var TABS = [
    ['today', 'Today', '<path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4"/>'],
    ['board', 'Board', '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>'],
    ['clips', 'Clips', '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>'],
    ['intel', 'Intel', '<path d="M3 17l5-5 4 4 8-9"/><path d="M15 7h5v5"/>'],
    ['coach', 'Ask', '<path d="M4 5h16v10H9l-5 4z"/>']
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
