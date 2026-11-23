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
    ' body.hx-mob .hx-lkbtn,body.hx-mob .hx-clbtn{display:none}',
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
    '.hx-szg{display:flex;gap:4px}.hx-sz2{display:none}.hx-mv{display:inline-flex}.hx-flash{animation:hxflash 1s ease-out}@keyframes hxflash{0%{box-shadow:0 0 0 3px #E3BD79,0 0 30px rgba(227,189,121,.7)}100%{box-shadow:0 0 0 0 rgba(227,189,121,0)}}.hx-tbb .f2{display:none}.hx-fold .hx-tbb .f1{display:none}.hx-fold .hx-tbb .f2{display:inline}',
    '@media(min-width:700px) and (max-width:1023px){.hx-sz3{display:none}.hx-sz2{display:flex}}',
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
    m.tasks.filter(function (x) { return !x.held && x.t.date <= today; }).forEach(function (x) {
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
    return '<div class="hx-card fx-tilt hx-12 hx-in" style="grid-column:span 12"><div class="hx-k">Your own studio content &middot; ' + starts + '</div>' +
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

  /* ---------- daily quote, live clock ---------- */
  var QUOTES = [
    ["Whatever the mind can conceive and believe, it can achieve.", "Napoleon Hill"],
    ["Desire is the starting point of all achievement.", "Napoleon Hill"],
    ["Action is the real measure of intelligence.", "Napoleon Hill"],
    ["Cherish your visions and your dreams, as they are the children of your soul.", "Napoleon Hill"],
    ["Strength and growth come only through continuous effort and struggle.", "Napoleon Hill"],
    ["Enter action with boldness.", "Robert Greene, The 48 Laws of Power (Law 28)"],
    ["Plan all the way to the end.", "Robert Greene, The 48 Laws of Power (Law 29)"],
    ["Re-create yourself.", "Robert Greene, The 48 Laws of Power (Law 25)"],
    ["Court attention at all cost.", "Robert Greene, The 48 Laws of Power (Law 6)"],
    ["The future belongs to those who learn more skills and combine them in creative ways.", "Robert Greene"],
    ["Becoming is better than being.", "Carol Dweck, Mindset"],
    ["Habits are the compound interest of self-improvement.", "James Clear, Atomic Habits"],
    ["I am not a product of my circumstances. I am a product of my decisions.", "Stephen Covey"],
    ["Begin with the end in mind.", "Stephen Covey"],
    ["Courage starts with showing up and letting ourselves be seen.", "Brene Brown"],
    ["First forget inspiration. Habit is more dependable.", "Octavia E. Butler"],
    ["All that you touch you change. All that you change changes you.", "Octavia E. Butler"],
    ["Nothing will work unless you do.", "Maya Angelou"],
    ["You may encounter many defeats, but you must not be defeated.", "Maya Angelou"],
    ["If they don't give you a seat at the table, bring a folding chair.", "Shirley Chisholm"],
    ["I got my start by giving myself a start.", "Madam C.J. Walker"],
    ["Don't sit down and wait for the opportunities to come. Get up and make them.", "Madam C.J. Walker"],
    ["There are years that ask questions and years that answer.", "Zora Neale Hurston"],
    ["Your silence will not protect you.", "Audre Lorde"],
    ["Look closely at the present you are constructing: it should look like the future you are dreaming.", "Alice Walker"],
    ["There is no limit to what we, as women, can accomplish.", "Michelle Obama"],
    ["She believed she could, so she did.", "R.S. Grey"],
    ["Well-behaved women seldom make history.", "Laurel Thatcher Ulrich"],
    ["You must do the thing you think you cannot do.", "Eleanor Roosevelt"],
    ["I attribute my success to this: I never gave or took any excuse.", "Florence Nightingale"],
    ["Inaction breeds doubt and fear. Action breeds confidence and courage.", "Dale Carnegie"],
    ["Whether you think you can, or you think you can't, you're right.", "Henry Ford"],
    ["You don't have to be great to start, but you have to start to be great.", "Zig Ziglar"],
    ["Start where you are. Use what you have. Do what you can.", "Arthur Ashe"],
    ["It always seems impossible until it's done.", "Nelson Mandela"],
    ["If there is no struggle, there is no progress.", "Frederick Douglass"],
    ["Excellence is not an act, but a habit.", "Will Durant"],
    ["What you seek is seeking you.", "Rumi"],
    ["A journey of a thousand miles begins with a single step.", "Lao Tzu"],
    ["Luck is what happens when preparation meets opportunity.", "Seneca"],
    ["Do the thing and you will have the power.", "Ralph Waldo Emerson"],
    ["Don't count the days, make the days count.", "Muhammad Ali"],
    ["Well done is better than well said.", "Benjamin Franklin"],
    ["Either write something worth reading or do something worth writing.", "Benjamin Franklin"],
    ["Stay hungry, stay foolish.", "Steve Jobs"],
    ["Done is better than perfect.", "Sheryl Sandberg"],
    ["You miss 100% of the shots you don't take.", "Wayne Gretzky"],
    ["Fortune favors the bold.", "Virgil"],
    ["Success is the sum of small efforts, repeated day in and day out.", "Robert Collier"],
    ["The harder I work, the luckier I get.", "Samuel Goldwyn"],
    ["Hard choices, easy life. Easy choices, hard life.", "Jerzy Gregorek"],
    ["Be so good they can't ignore you.", "Steve Martin"],
    ["Opportunity is missed by most people because it is dressed in overalls and looks like work.", "Thomas Edison"],
    ["Impossible is just an opinion.", "Paulo Coelho"]
  ];
  function dayNum() { var d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5); }
  function quotePick() { var i = (dayNum() + (S.qoff || 0)) % QUOTES.length; return QUOTES[i]; }
  function quoteHtml() {
    var q = quotePick();
    return '<div class="hx-quote"><div class="hx-qk">Today\'s mindset</div><div class="hx-qt">&ldquo;' + E(q[0]) + '&rdquo;</div><div class="hx-qa">&mdash; ' + E(q[1]) + '</div>' +
      '<button class="hx-qn" onclick="hxQuote()" aria-label="Show another quote">Another</button></div>';
  }
  window.hxQuote = function () { S.qoff = (S.qoff || 0) + 1; var el = document.querySelector('#homeCmd .hx-quote'); if (el) el.outerHTML = quoteHtml(); };
  function clockTxt() {
    var d = new Date(), a = '', b = '';
    try { a = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); b = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); } catch (e) {}
    return a + ' &middot; ' + b;
  }
  setInterval(function () { var el = document.getElementById('hxClock'); if (el) el.innerHTML = clockTxt(); }, 15000);

  /* ---------- account trail (from account-log.json) ---------- */
  var GM = 'https://mail.google.com/mail/?authuser=creativemetrixbgcs@gmail.com#';
  function gmUrl(x) { if (!x) return ''; return x.indexOf('q:') === 0 ? GM + 'search/' + encodeURIComponent(x.slice(2)) : x; }
  function gmSearch(q) { return GM + 'search/' + encodeURIComponent(q); }
  function fmtD(d) {
    if (!d) return ''; var p = String(d).split('-');
    if (p.length === 2) return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+p[1] - 1] + ' ' + p[0];
    if (p.length < 3) return d;
    var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return M[+p[1] - 1] + ' ' + (+p[2]) + (+p[0] !== new Date().getFullYear() ? ', ' + p[0] : '');
  }
  function loadTrail() {
    fetch('account-log.json?ts=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { S.trail = j; try { ls.set('bgcs_trail_cache', JSON.stringify(j)); } catch (e) {} trailRefresh(); renderHome(); })
      .catch(function () { if (!S.trail) { try { S.trail = JSON.parse(ls.get('bgcs_trail_cache', 'null')); } catch (e) {} if (S.trail) { trailRefresh(); renderHome(); } } });
  }
  function trailAcct(id) { return S.trail && S.trail.accounts ? S.trail.accounts[String(id)] : null; }
  function trailTodoGet() { try { return JSON.parse(ls.get('bgcs_trail_todo', '{}')) || {}; } catch (e) { return {}; } }
  window.hxTrailTodo = function (k) { var t = trailTodoGet(); if (t[k]) delete t[k]; else t[k] = 1; ls.set('bgcs_trail_todo', JSON.stringify(t)); if (t[k]) { winsAdd(); buzz(10); } renderTrail(); };
  var DIRI = { out: ['&#8599;', 'You sent'], 'in': ['&#8601;', 'They wrote'], call: ['&#9742;', 'Call'], invite: ['&#128197;', 'Invite'], note: ['&#9998;', 'Note'] };
  var TAGS = { win: 'Good sign', flag: 'Heads up', overdue: 'Overdue', draft: 'Not sent', sched: 'Scheduled', invoice: 'Invoice / paperwork', meet: 'Meeting' };
  function itemHtml(x) {
    var di = DIRI[x.dir] || DIRI.note;
    var sub = x.gm ? '<a class="tr-a" href="' + E(gmUrl(x.gm)) + '" target="_blank" rel="noopener">' + E(x.sub) + '</a>' : E(x.sub);
    return '<div class="tr-it tr-' + E(x.dir) + '"><div class="tr-ic" title="' + di[1] + '">' + di[0] + '</div><div class="tr-bd"><div class="tr-hd"><b>' + fmtD(x.d) + '</b> <span class="tr-wh">' + E(x.who) + '</span>' + (x.tag && TAGS[x.tag] ? ' <span class="tr-tag t-' + x.tag + '">' + TAGS[x.tag] + '</span>' : '') + '</div>' +
      '<div class="tr-sb">' + sub + '</div><div class="tr-sm">' + E(x.sum) + '</div></div></div>';
  }
  function phaseHtml(p) {
    var st = { done: 'Done', active: 'In progress', waiting: 'Waiting on them', todo: 'Not started' }[p.state] || '';
    var inner = p.items && p.items.length ? p.items.map(itemHtml).join('') : '<div class="tr-mu" style="padding:8px 2px">Nothing logged yet.</div>';
    var open = p.state === 'active' || p.state === 'waiting' || (p.items || []).length <= 2;
    return '<details class="tr-ph"' + (open ? ' open' : '') + '><summary><span class="tr-n">' + p.n + '</span><span class="tr-pt">' + E(p.title) + '</span><span class="tr-st s-' + p.state + '">' + st + '</span><span class="tr-ct">' + (p.items || []).length + ' item' + ((p.items || []).length === 1 ? '' : 's') + '</span></summary>' + inner + '</details>';
  }
  window.renderTrail = function () {
    var box = document.getElementById('trailBox'); if (!box) return;
    var id = typeof currentProfileId !== 'undefined' ? currentProfileId : null;
    var lead = id != null ? financialProspects.find(function (x) { return x.id === id; }) : null;
    if (!S.trail) { box.innerHTML = '<div class="tr-mu">Loading the email trail...</div>'; loadTrail(); return; }
    var a = trailAcct(id);
    var gq = (a && a.gq) || (lead && lead.email ? 'from:' + lead.email + ' OR to:' + lead.email : '');
    var gbtn = gq ? '<a class="tr-btn pri" href="' + E(gmSearch(gq)) + '" target="_blank" rel="noopener">Open all Gmail for this account</a>' : '';
    if (!a) { box.innerHTML = '<div class="tr-card"><b>No email trail logged for this account yet.</b><p class="tr-mu" style="margin-top:6px">Tonight\'s Gmail check adds it as soon as there is something sent, received, scheduled or drafted.</p><div class="tr-row">' + gbtn + '</div></div>'; return; }
    var tdo = trailTodoGet(), h = '';
    h += '<div class="tr-hero"><div class="tr-k">Where this stands</div><div class="tr-h1">' + E(a.headline) + '</div><div class="tr-row">' + gbtn + '<span class="tr-mu">Read from Gmail ' + fmtD(S.trail.generated) + '</span></div></div>';
    if (a.todo && a.todo.length) h += '<div class="tr-card"><div class="tr-k">What to do next</div>' + a.todo.map(function (t, i) { var k = id + ':' + i, on = !!tdo[k]; return '<label class="tr-todo' + (on ? ' on' : '') + '"><input type="checkbox" ' + (on ? 'checked ' : '') + 'onchange="hxTrailTodo(\'' + k + '\')"><span>' + E(t) + '</span></label>'; }).join('') + '</div>';
    var f = a.facts || {};
    h += '<div class="tr-grid">' +
      '<div class="tr-card"><div class="tr-k">Address</div><div>' + (f.address ? E(f.address) : '<span class="tr-mu">Not in any email yet.</span>') + '</div></div>' +
      '<div class="tr-card"><div class="tr-k">Phone</div><div>' + (f.phone ? E(f.phone) : '<span class="tr-mu">Not in any email yet.</span>') + '</div></div>' +
      '<div class="tr-card"><div class="tr-k">Main email</div><div>' + (f.email ? '<a class="tr-a" href="mailto:' + E(f.email) + '">' + E(f.email) + '</a>' : '<span class="tr-mu">None yet.</span>') + '</div></div>' +
      '<div class="tr-card"><div class="tr-k">Last reply</div><div>' + (a.lastReply ? '<b>' + fmtD(a.lastReply.d) + '</b> ' + E(a.lastReply.who) + '<div class="tr-mu">' + E(a.lastReply.text) + '</div>' : '<span class="tr-mu">No human reply in Gmail.</span>') + '</div></div></div>';
    if (a.schedule && a.schedule.length) h += '<div class="tr-card"><div class="tr-k">Program schedule and dates</div>' + a.schedule.map(function (s) { return '<div class="tr-sc"><div class="tr-dt">' + E(s.approx ? s.t : fmtD(s.d)) + (s.approx ? '' : '<small>' + E(s.t || '') + '</small>') + '</div><div><b>' + E(s.title) + '</b><div class="tr-mu">' + E(s.detail || '') + '</div></div></div>'; }).join('') + '</div>';
    h += '<div class="tr-k tr-sec">The 3 phases</div>' + (a.phases || []).map(phaseHtml).join('');
    if (a.contacts && a.contacts.length) h += '<div class="tr-k tr-sec">People and team</div><div class="tr-grid">' + a.contacts.map(function (c) {
      return '<div class="tr-card"><b>' + E(c.name) + '</b><div class="tr-mu">' + E(c.role) + '</div>' + (c.email ? '<div><a class="tr-a" href="mailto:' + E(c.email) + '">' + E(c.email) + '</a></div>' : '') + (c.phone ? '<div>' + E(c.phone) + '</div>' : '') + (c.addr ? '<div class="tr-mu">' + E(c.addr) + '</div>' : '') + (c.note ? '<div class="tr-mu" style="margin-top:4px">' + E(c.note) + '</div>' : '') + ((c.linked || []).length ? '<div class="tr-lk">Works with: ' + c.linked.map(E).join(', ') + '</div>' : '') + '</div>';
    }).join('') + '</div>';
    if (a.docs && a.docs.length) h += '<div class="tr-k tr-sec">Invoices, paperwork and meeting links</div><div class="tr-card">' + a.docs.map(function (d) { var u = d.url || gmUrl(d.gm); return '<div class="tr-doc"><b>' + E(d.type) + '</b> <span class="tr-mu">' + fmtD(d.date) + '</span><div class="tr-mu">' + E(d.note) + '</div>' + (u ? '<a class="tr-a" href="' + E(u) + '" target="_blank" rel="noopener">Open</a>' : '') + '</div>'; }).join('') + '</div>';
    if (a.flags && a.flags.length) h += '<div class="tr-card tr-warn"><div class="tr-k">Heads up</div>' + a.flags.map(function (t) { return '<p>' + E(t) + '</p>'; }).join('') + '</div>';
    if (a.related && a.related.length) h += '<div class="tr-k tr-sec">Connected accounts</div><div class="tr-row">' + a.related.map(function (r) { var q = financialProspects.find(function (x) { return x.id === r.id; }); return q ? '<button class="tr-chip" onclick="homeOpen(' + r.id + ',\'trail\')">' + E(q.org) + ' <small>' + E(r.why) + '</small></button>' : ''; }).join('') + '</div>';
    box.innerHTML = h;
  };
  window.renderTrailContacts = function () {
    var oc = document.getElementById('orgChartContainer'); if (!oc || !S.trail) return;
    var id = typeof currentProfileId !== 'undefined' ? currentProfileId : null, a = trailAcct(id);
    if (!a || !a.contacts || !a.contacts.length) return;
    oc.innerHTML = a.contacts.map(function (c) { return '<div class="tr-card"><b>' + E(c.name) + '</b><div class="tr-mu">' + E(c.role) + '</div>' + (c.email ? '<div><a class="tr-a" href="mailto:' + E(c.email) + '">' + E(c.email) + '</a></div>' : '') + (c.phone ? '<div>' + E(c.phone) + '</div>' : '') + ((c.linked || []).length ? '<div class="tr-lk">Works with: ' + c.linked.map(E).join(', ') + '</div>' : '') + '</div>'; }).join('');
  };
  function trailRefresh() {
    var pv = document.getElementById('profileView'); if (!pv || pv.classList.contains('hidden')) return;
    var t = document.getElementById('tabContent-trail'); if (t && !t.classList.contains('hidden')) renderTrail();
    renderTrailContacts();
  }
  loadTrail();

  /* ---------- coach: pace, next moves ---------- */
  function weekStart() { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
  function inWeek(ds) { if (!ds) return false; var t = new Date(String(ds).slice(0, 10) + 'T00:00:00'), ws = weekStart(), we = new Date(ws); we.setDate(we.getDate() + 7); return t >= ws && t < we; }
  function paceModel(m) {
    var P = m.P, now = new Date(), end = new Date('2026-12-31T23:59:59');
    var days = Math.max(1, Math.ceil((end - now) / 864e5)), weeks = Math.max(1, Math.ceil(days / 7));
    var need = Math.max(0, m.cap - m.slots), perClass = 12;
    var target = Math.max(5, Math.ceil(need * perClass / weeks));
    var sent = P.filter(function (p) { return inWeek(p.emailSentDate); }).length;
    var calls = P.filter(function (p) { return inWeek(p.callDate) || (p.activities || []).some(function (a) { return /call|phone|dm|text/i.test(a.type || '') && inWeek(a.date); }); }).length;
    var follow = P.filter(function (p) { return inWeek(p.fuDate); }).length;
    var emailed = P.filter(function (p) { return ['First Touch Sent', 'Lead', 'Invoice Pending', 'Closed Won', 'Closed Lost'].indexOf(p.stage) >= 0; }).length;
    var replied = P.filter(function (p) { return ['Lead', 'Invoice Pending', 'Closed Won'].indexOf(p.stage) >= 0; }).length;
    var booked = P.filter(function (p) { return ['Invoice Pending', 'Closed Won'].indexOf(p.stage) >= 0; }).length;
    var drafts = P.filter(function (p) { return p.stage === 'Email Drafted'; });
    var wd = (now.getDay() + 6) % 7, expected = Math.ceil(target * (wd + 1) / 7);
    return { weeks: weeks, days: days, need: need, target: target, sent: sent, calls: calls, follow: follow, emailed: emailed, replied: replied, booked: booked, drafts: drafts, expected: expected, behind: Math.max(0, expected - sent), daily: Math.max(1, Math.ceil(target / 5)) };
  }
  function bar(v, t) { var pct = Math.min(100, Math.round(v / Math.max(1, t) * 100)); return '<div class="co-bar"><i style="width:' + pct + '%"></i></div>'; }
  function movesList(m, pm) {
    /* Top 3 = sending drafts that are ready. Held items (Molly, Deena) never show here. Waiting-on-them chasing comes after. */
    var out = [], today = m.today;
    pm.drafts.filter(function (p) { return p.email && p.draftReady && !p.hold; }).slice(0, 3).forEach(function (p) { out.push({ t: 'Read and send the draft to ' + p.org, o: 'Rewritten and waiting in Gmail', pid: p.id, min: 2, tab: 'trail' }); });
    if (out.length < 3) m.stale.slice(0, 3 - out.length).forEach(function (p) { out.push({ t: 'Follow up with ' + p.org, o: 'First email sent ' + fmtD(p.emailSentDate) + ', no reply', pid: p.id, min: 3, tab: 'trail' }); });
    if (out.length < 3) m.tasks.filter(function (x) { return !x.held && x.t.date <= today; }).slice(0, 3 - out.length).forEach(function (x) { out.push({ t: x.t.title, o: x.p.org, pid: x.p.id, min: 5, tab: 'tasks' }); });
    return out.slice(0, 3);
  }
  function coachCard(m) {
    var pm = paceModel(m), mv = movesList(m, pm);
    var ahead = pm.sent >= pm.expected;
    var head = ahead ? 'You are on pace. Keep it rolling.' : 'We are behind schedule, and it is fixable.';
    var say = ahead
      ? pm.sent + ' first emails out this week against a target of ' + pm.target + '. Keep the same rhythm and do not coast.'
      : pm.sent + ' of ' + pm.target + ' first emails went out this week. ' + (pm.drafts.length ? pm.drafts.length + ' drafts are already written and sitting in Gmail, so the hardest part is done. ' : '') + 'Today, send ' + pm.daily + ' and one follow-up, then stop. Small and finished beats big and stuck.';
    var moves = mv.length ? mv.map(function (x, i) { return '<div class="co-mv"><span class="co-n">' + (i + 1) + '</span><div style="min-width:0;flex:1"><b>' + E(x.t) + '</b><div class="tr-mu">' + E(x.o) + ' &middot; about ' + x.min + ' min</div></div><button class="hx-btn pri" onclick="homeOpen(' + x.pid + ',\'' + x.tab + '\')">Open</button></div>'; }).join('') : '<p class="hx-mu">Nothing urgent. Pick one organization and research it for 10 minutes.</p>';
    return '<div class="hx-card fx-tilt hx-in"><div class="hx-k">Coach &middot; ' + pm.days + ' days to Dec 31</div>' +
      '<div class="co-h">' + E(head) + '</div><p class="hx-mu" style="margin:4px 0 10px">' + E(say) + '</p>' +
      '<div class="co-grid"><div><div class="co-l"><span>First emails this week</span><b>' + pm.sent + ' / ' + pm.target + '</b></div>' + bar(pm.sent, pm.target) + '</div>' +
      '<div><div class="co-l"><span>Follow-ups sent</span><b>' + pm.follow + ' / ' + Math.max(m.stale.length, 1) + ' due</b></div>' + bar(pm.follow, Math.max(m.stale.length, 1)) + '</div>' +
      '<div><div class="co-l"><span>Calls or DMs</span><b>' + pm.calls + ' / 5</b></div>' + bar(pm.calls, 5) + '</div>' +
      '<div><div class="co-l"><span>Classes booked</span><b>' + m.slots + ' / ' + m.cap + '</b></div>' + bar(m.slots, m.cap) + '</div></div>' +
      '<p class="hx-mu" style="margin:10px 0 6px;font-size:12px"><b style="color:#F3E8D6">The math:</b> to land ' + pm.need + ' more recurring classes by Dec 31 you need about ' + pm.target + ' new first emails a week, a follow-up on every email 5 days old, and 5 calls or DMs. Your own numbers so far: ' + pm.emailed + ' organizations emailed, ' + pm.replied + ' replied, ' + pm.booked + ' booked. That is the pace we are working from. It is an estimate, so we adjust it as real results come in.</p>' +
      '<div class="hx-k" style="margin-top:10px">Your next 3 small moves</div>' + moves +
      '<div class="hx-btnrow" style="margin-top:10px"><button class="hx-btn pri" onclick="hxTimer()">' + (S.timer ? 'Stop sprint (' + timerFmt() + ')' : 'Start a 10-minute sprint') + '</button><button class="hx-btn" onclick="hxAsk(\'Give me a 3-step plan for the next hour. Use my pipeline, be direct, keep it small.\')">Ask for a plan</button><button class="hx-btn" onclick="hxNudge()">Straight talk</button></div></div>';
  }

  /* ---------- upcoming events ---------- */
  var PREP = ['Send Dr. Bowden the student link and your AI tools answer (promised by Fri Nov 20)', 'Get rooms and start times for all 4 sessions', 'Ask if the parent take-home card with the QR code is approved', 'Print the QR cards once approved', 'Test the student page on a Chromebook', 'Pack laptop, USB-C and HDMI adapters, hotspot, printed class codes', 'Confirm W-9 and payment timing with accounts payable', 'Finalize the 4 session plans (game plan below)', 'After Dec 3: ask for a testimonial and an introduction to other schools'];
  function prepGet() { try { return JSON.parse(ls.get('bgcs_home_prep', '{}')) || {}; } catch (e) { return {}; } }
  window.hxPrep = function (i) { var t = prepGet(); if (t[i]) delete t[i]; else { t[i] = 1; winsAdd(); buzz(10); } ls.set('bgcs_home_prep', JSON.stringify(t)); renderHome(); };
  function eventsCard(m) {
    var today = m.today, ev = [];
    if (S.trail && S.trail.accounts) Object.keys(S.trail.accounts).forEach(function (id) {
      (S.trail.accounts[id].schedule || []).forEach(function (s) { if (s.d && s.d >= today) { var q = m.P.find(function (x) { return String(x.id) === id; }); ev.push({ d: s.d, approx: s.approx, t: s.t, title: s.title, org: q ? q.org : '', id: id }); } });
    });
    ev.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    function inDays(d) { var n = Math.round((new Date(d + 'T00:00:00') - new Date(today + 'T00:00:00')) / 864e5); return n === 0 ? 'today' : n === 1 ? 'tomorrow' : 'in ' + n + ' days'; }
    var list = ev.slice(0, 6).map(function (e) { return '<div class="hx-row" onclick="homeOpen(' + e.id + ',\'trail\')" style="cursor:pointer"><div class="ev-d"><b>' + E(e.approx ? e.t : fmtD(e.d)) + '</b>' + (e.approx ? '' : '<small>' + inDays(e.d) + '</small>') + '</div><div style="min-width:0"><b style="color:#F3E8D6">' + E(e.title) + '</b><div class="hx-mu" style="font-size:12px">' + E(e.org) + (e.t && !e.approx ? ' &middot; ' + E(e.t) : '') + '</div></div></div>'; }).join('') || '<p class="hx-mu">Nothing dated yet.</p>';
    var pr = prepGet(), done = 0; PREP.forEach(function (_, i) { if (pr[i]) done++; });
    var prep = PREP.map(function (t, i) { return '<label class="tr-todo' + (pr[i] ? ' on' : '') + '"><input type="checkbox" ' + (pr[i] ? 'checked ' : '') + 'onchange="hxPrep(' + i + ')"><span>' + E(t) + '</span></label>'; }).join('');
    return '<div class="hx-card fx-tilt hx-in"><div class="hx-k">Coming up &middot; plan for it</div>' + list +
      '<div class="hx-k" style="margin-top:12px">InspiHER prep &middot; ' + done + ' of ' + PREP.length + ' done</div>' + bar(done, PREP.length) + prep +
      '<div class="ev-qr"><img src="inspiher-qr.png" alt="QR code to the Season 2 parent sign-up page" width="112" height="112"><div style="min-width:0;flex:1"><b style="color:#F3E8D6">Parent QR code</b><p class="hx-mu" style="font-size:12px;margin:2px 0 8px">Scans to the Season 2 sign-up page. Do not hand out until the district approves the take-home card.</p><div class="hx-btnrow"><a class="hx-btn pri" href="season2.html?src=inspiher" target="_blank" rel="noopener">Open the page</a><a class="hx-btn" href="inspiher-qr.png" download="inspiher-season2-qr.png">Download QR</a><a class="hx-btn" href="parent-card.html" target="_blank" rel="noopener">Print card</a><a class="hx-btn" href="inspiher-plan.html" target="_blank" rel="noopener">Session plan</a></div></div></div></div>';
  }

  /* ---------- styles for the new pieces ---------- */
  (function () {
    var css = [
      '.hx-quote{position:relative;margin:0 0 14px;padding:16px 64px 16px 18px;border-radius:16px;border:1px solid rgba(199,153,79,.35);background:linear-gradient(135deg,rgba(199,153,79,.16),rgba(59,34,22,.9));}',
      '.hx-qk{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#C7994F;font-weight:800;margin-bottom:6px}',
      '.hx-qt{font-family:Fraunces,Georgia,serif;font-size:clamp(17px,2.4vw,23px);line-height:1.3;color:#F3E8D6;font-weight:600}',
      '.hx-qa{margin-top:6px;font-size:12.5px;color:#CDBA99}',
      '.hx-qn{position:absolute;right:12px;top:12px;border:1px solid rgba(199,153,79,.4);background:transparent;color:#E3BD79;border-radius:999px;padding:5px 11px;font-size:11px;font-weight:800;cursor:pointer}',
      '.co-h{font-family:Fraunces,Georgia,serif;font-size:21px;font-weight:700;color:#F3E8D6;line-height:1.25}',
      '.co-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px 16px}',
      '.co-l{display:flex;justify-content:space-between;gap:6px;font-size:12px;color:#CDBA99;margin-bottom:4px}.co-l b{color:#F3E8D6}',
      '.co-bar{height:8px;border-radius:99px;background:rgba(199,153,79,.16);overflow:hidden}.co-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#C7994F,#F0CC8C)}',
      '.co-mv{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(199,153,79,.14)}.co-mv:last-of-type{border-bottom:0}',
      '.co-n{flex:none;width:26px;height:26px;border-radius:50%;background:rgba(199,153,79,.22);color:#E3BD79;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center}',
      '.ev-d{flex:none;min-width:70px;color:#E3BD79}.ev-d small{display:block;color:#9c8a6c;font-size:11px}',
      '.ev-qr{display:flex;gap:12px;align-items:flex-start;margin-top:12px;padding:10px;border-radius:12px;background:rgba(0,0,0,.18);border:1px solid rgba(199,153,79,.2)}.ev-qr img{border-radius:8px;background:#fff;padding:5px;flex:none}',
      '.tr-hero,.tr-card{border:1px solid rgba(199,153,79,.25);background:rgba(59,34,22,.7);border-radius:14px;padding:14px 16px;margin-bottom:12px;color:#F3E8D6}',
      '.tr-hero{border-left:4px solid #C7994F;background:linear-gradient(135deg,rgba(199,153,79,.14),rgba(59,34,22,.8))}',
      '.tr-h1{font-family:Fraunces,Georgia,serif;font-size:19px;font-weight:700;line-height:1.3;margin:2px 0 10px}',
      '.tr-k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#C7994F;font-weight:800;margin-bottom:6px}.tr-sec{margin:18px 2px 8px}',
      '.tr-mu{color:#CDBA99;font-size:12.5px;line-height:1.45}',
      '.tr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}.tr-grid .tr-card{margin-bottom:0}',
      '.tr-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
      '.tr-btn{display:inline-block;border-radius:10px;padding:9px 14px;font-size:13px;font-weight:800;text-decoration:none;border:1px solid rgba(199,153,79,.5);color:#E3BD79}.tr-btn.pri{background:linear-gradient(135deg,#C7994F,#A9792F);color:#1d120e;border-color:transparent}',
      '.tr-a{color:#E3BD79;text-decoration:underline;text-underline-offset:2px}',
      '.tr-todo{display:flex;gap:10px;align-items:flex-start;padding:8px 2px;cursor:pointer;font-size:14px;line-height:1.4}.tr-todo input{margin-top:3px;width:18px;height:18px;accent-color:#C7994F;flex:none}.tr-todo.on span{opacity:.5;text-decoration:line-through}',
      '.tr-sc{display:flex;gap:12px;padding:8px 0;border-bottom:1px solid rgba(199,153,79,.14)}.tr-sc:last-child{border-bottom:0}.tr-dt{flex:none;min-width:84px;color:#E3BD79;font-weight:800}.tr-dt small{display:block;color:#9c8a6c;font-weight:600}',
      '.tr-ph{border:1px solid rgba(199,153,79,.25);background:rgba(59,34,22,.6);border-radius:14px;margin-bottom:10px;overflow:hidden}',
      '.tr-ph>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:12px 14px;flex-wrap:wrap}.tr-ph>summary::-webkit-details-marker{display:none}',
      '.tr-n{flex:none;width:28px;height:28px;border-radius:50%;background:#C7994F;color:#1d120e;font-weight:900;display:flex;align-items:center;justify-content:center}',
      '.tr-pt{font-weight:800;color:#F3E8D6;flex:1;min-width:140px}.tr-ct{color:#9c8a6c;font-size:12px}',
      '.tr-st{font-size:11px;font-weight:800;border-radius:99px;padding:3px 9px;border:1px solid rgba(199,153,79,.4);color:#E3BD79}.tr-st.s-active{background:rgba(199,153,79,.22)}.tr-st.s-done{opacity:.75}.tr-st.s-todo{opacity:.55}',
      '.tr-it{display:flex;gap:10px;padding:10px 14px;border-top:1px solid rgba(199,153,79,.14)}',
      '.tr-ic{flex:none;width:28px;height:28px;border-radius:8px;background:rgba(199,153,79,.16);color:#E3BD79;display:flex;align-items:center;justify-content:center;font-size:15px}.tr-in .tr-ic{background:rgba(240,204,140,.3)}',
      '.tr-bd{min-width:0;flex:1}.tr-hd{font-size:12.5px;color:#CDBA99}.tr-hd b{color:#E3BD79}.tr-wh{margin-left:4px}',
      '.tr-sb{font-weight:700;font-size:13.5px;color:#F3E8D6;margin-top:1px;overflow-wrap:anywhere}.tr-sm{font-size:13px;color:#CDBA99;margin-top:2px;line-height:1.45}',
      '.tr-tag{font-size:10px;font-weight:800;border-radius:99px;padding:2px 7px;margin-left:4px;border:1px solid rgba(199,153,79,.45);color:#E3BD79}.tr-tag.t-win{background:rgba(199,153,79,.25)}.tr-tag.t-overdue,.tr-tag.t-flag{border-color:#f0a090;color:#f0a090}',
      '.tr-lk{margin-top:6px;font-size:12px;color:#E3BD79}.tr-doc{padding:8px 0;border-bottom:1px solid rgba(199,153,79,.14)}.tr-doc:last-child{border-bottom:0}',
      '.tr-warn{border-color:rgba(240,160,144,.5)}.tr-warn p{margin:4px 0;font-size:13.5px;line-height:1.45}',
      '.tr-chip{border:1px solid rgba(199,153,79,.45);background:rgba(199,153,79,.1);color:#F3E8D6;border-radius:99px;padding:7px 12px;font-size:12.5px;font-weight:700;cursor:pointer}.tr-chip small{color:#CDBA99;font-weight:500;margin-left:4px}'
    ].join('');
    var st = document.createElement('style'); st.id = 'hx-extra-css'; st.textContent = css; document.head.appendChild(st);
  })();



  /* ---------- straight-talk pop-up: stay on the goal ---------- */
  (function () {
    var css = '.hx-nd{position:fixed;inset:0;z-index:99999;background:rgba(20,10,6,.78);display:flex;align-items:center;justify-content:center;padding:18px;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}' +
      '.hx-ndc{max-width:460px;width:100%;border-radius:20px;border:1px solid rgba(199,153,79,.6);background:linear-gradient(160deg,#3B2216,#2A160E);padding:22px;color:#F3E8D6;box-shadow:0 20px 60px rgba(0,0,0,.6)}' +
      '.hx-ndc h3{font-family:Fraunces,Georgia,serif;font-size:24px;line-height:1.2;margin:4px 0 10px}.hx-ndc p{font-size:15px;line-height:1.5;color:#E8D9BF;margin:0 0 10px}.hx-ndc .nk{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#E3BD79;font-weight:800}' +
      '.hx-ndc .nb{display:flex;flex-direction:column;gap:8px;margin-top:14px}.hx-ndc button{border-radius:12px;padding:13px 14px;font-size:15px;font-weight:800;cursor:pointer;border:1px solid rgba(199,153,79,.5);background:transparent;color:#E3BD79}.hx-ndc button.p{background:linear-gradient(135deg,#C7994F,#A9792F);color:#1d120e;border-color:transparent}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  })();
  function nudgeClose() { var n = document.getElementById('hxNudge'); if (n) n.remove(); }
  function nudgeCheck(force) {
    try {
      if (document.getElementById('hxNudge')) return;
      var pv = document.getElementById('pipelineView'); if (pv && pv.classList.contains('hidden')) return;
      var prof = document.getElementById('profileView'); if (prof && !prof.classList.contains('hidden')) return;
      if (S.edit || S.timer) return;
      var last = +ls.get('bgcs_nudge_at', '0') || 0;
      if (!force && Date.now() - last < 3 * 3600 * 1000) return;
      var m = coModel(), pm = paceModel(m);
      var behind = pm.sent < pm.expected && (pm.drafts.length > 0 || m.stale.length > 0 || m.overdue.length > 0);
      if (!force && !behind) return;
      var mv = movesList(m, pm), first = mv[0];
      var d = document.createElement('div'); d.id = 'hxNudge'; d.className = 'hx-nd'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
      d.innerHTML = '<div class="hx-ndc"><div class="nk">Straight talk from your coach</div><h3>Is this moving the goal, or is it busywork?</h3>' +
        '<p>This week: <b>' + pm.sent + ' of ' + pm.target + '</b> first emails sent. <b>' + pm.drafts.length + '</b> drafts are written and still unsent. <b>' + m.stale.length + '</b> follow-ups are due. Booked recurring: <b>$' + Math.round(m.slots * m.c.classVal).toLocaleString() + '</b> of $' + Math.round(m.c.goal).toLocaleString() + '.</p>' +
        '<p>New tabs, new tools and new ideas do not pay you. A sent email can. Do one small thing right now' + (first ? ': <b>' + E(first.t) + '</b>' : '') + '. Ten minutes, then you can decide what is next.</p>' +
        '<div class="nb"><button class="p" id="hxNdGo">Okay. Start my 10-minute sprint</button><button id="hxNdLater">Not now. Remind me in 3 hours</button></div></div>';
      document.body.appendChild(d);
      ls.set('bgcs_nudge_at', String(Date.now()));
      document.getElementById('hxNdGo').onclick = function () { nudgeClose(); if (!S.timer) timerStart(); if (first) homeOpen(first.pid, first.tab); };
      document.getElementById('hxNdLater').onclick = nudgeClose;
    } catch (e) {}
  }
  window.hxNudge = function () { nudgeCheck(true); };
  setTimeout(function () { nudgeCheck(false); }, 6000);
  var hiddenAt = 0;
  document.addEventListener('visibilitychange', function () { if (document.hidden) hiddenAt = Date.now(); else if (hiddenAt && Date.now() - hiddenAt > 30 * 60000) setTimeout(function () { nudgeCheck(false); }, 1500); });


  /* ---------- news, split into separate sections ---------- */
  var OLDCAT = { 'AI news': 'AI in education', 'Funding': 'Grants', 'Market': 'Radar', 'Competitor': 'Radar' };
  function nCat(i) { return OLDCAT[i.cat] || i.cat; }
  function daysTo(ds) { return Math.round((new Date(ds + 'T00:00:00') - new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00')) / 864e5); }
  window.hxCopyN = function (i) {
    var x = S.cb && S.cb[i]; if (!x) return;
    var t = x.title + '\n' + (x.why || '') + '\nSource: ' + (x.source || '') + (x.date ? ', ' + fmtD(x.date) : '') + (x.url ? '\n' + x.url : '');
    function ok() { toast('Copied. Paste it into your email.'); buzz(10); }
    try { navigator.clipboard.writeText(t).then(ok, function () { fallbackCopy(t); ok(); }); } catch (e) { fallbackCopy(t); ok(); }
  };
  function fallbackCopy(t) { var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove(); }
  function newsSection(cat, title, empty) {
    var n = S.news, items = n && n.items ? n.items.filter(function (i) { return nCat(i) === cat; }) : [];
    var head = '<div class="hx-k">' + E(title) + (n && n.generated ? ' &middot; checked ' + fmtD(n.generated) : '') + '</div>';
    if (!n) return '<div class="hx-card fx-tilt hx-in">' + head + '<p class="hx-mu">' + (S.newsErr ? 'Could not load this section. Tap refresh.' : 'Loading...') + '</p></div>';
    items.sort(function (a, b) {
      if (cat === 'Grants') { if (a.deadline && b.deadline) return a.deadline < b.deadline ? -1 : 1; if (a.deadline) return -1; if (b.deadline) return 1; }
      return (b.date || '') < (a.date || '') ? -1 : 1;
    });
    var rows = items.slice(0, 6).map(function (i) {
      var idx = (S.cb = S.cb || []).push(i) - 1, chips = '';
      if (i.deadline) { var d = daysTo(i.deadline); chips += '<span class="hx-tag" style="' + (d >= 0 && d <= 14 ? 'background:rgba(240,160,144,.2);color:#f0a090' : '') + '">' + (d < 0 ? 'Closed ' + fmtD(i.deadline) : 'Closes ' + fmtD(i.deadline) + (d <= 30 ? ' (' + d + ' days)' : '')) + '</span> '; }
      if (i.amount) chips += '<span class="hx-tag">' + E(i.amount) + '</span> ';
      if (i.kind === 'funding-risk') chips += '<span class="hx-tag" style="background:rgba(240,160,144,.2);color:#f0a090">Funding risk</span> ';
      if (i.kind === 'lead') chips += '<span class="hx-tag">New lead source</span> ';
      var fresh = i.date && daysTo(i.date) >= -3 ? '<span class="hx-tag">New</span> ' : '';
      return '<div class="hx-row"><div style="min-width:0;flex:1">' + fresh + chips + (chips || fresh ? '<br>' : '') + (i.url ? '<a class="hx-a" href="' + E(i.url) + '" target="_blank" rel="noopener">' + E(i.title) + '</a>' : '<b>' + E(i.title) + '</b>') +
        (i.who ? '<p class="hx-mu" style="margin-top:3px;font-size:12px"><b style="color:#F3E8D6">Who can apply:</b> ' + E(i.who) + '</p>' : '') +
        (i.why ? '<p class="hx-mu" style="margin-top:3px"><b style="color:#F3E8D6">How to use it:</b> ' + E(i.why) + '</p>' : '') +
        (i.verify ? '<p class="hx-mu" style="margin-top:3px;font-size:12px"><b style="color:#E3BD79">Verify:</b> ' + E(i.verify) + '</p>' : '') +
        '<p style="font-size:11px;color:#9c8a6c;margin-top:3px">' + E(i.source || '') + (i.date ? ' &middot; ' + E(fmtD(i.date)) : '') + ' &middot; <a href="javascript:void(0)" class="hx-a" onclick="hxCopyN(' + idx + ')">Copy for an email</a></p></div></div>';
    }).join('');
    return '<div class="hx-card fx-tilt hx-in">' + head + (rows || '<p class="hx-mu">' + E(empty) + '</p>') + (n.note && cat === 'Grants' ? '<p style="font-size:11px;color:#9c8a6c;margin-top:8px">' + E(n.note) + '</p>' : '') + '</div>';
  }

  /* ---------- links: every link for the business in one place ---------- */
  var SITE = 'https://raevenbrown.github.io/thebrowngirlsstudio/';
  var GM = 'https://mail.google.com/mail/?authuser=creativemetrixbgcs@gmail.com';
  var LINK_GROUPS = [
    { id: 'site', t: 'Your website and pages', s: 'These live on your site.' },
    { id: 'forms', t: 'Google Forms and sign-ups', s: 'Where parents and schools sign up.' },
    { id: 'google', t: 'Gmail, calendar and Drive', s: 'All under creativemetrixbgcs@gmail.com.' },
    { id: 'back', t: 'Behind the scenes', s: 'The code, the cloud sync and the database. You rarely need these.' },
    { id: 'demo', t: 'Lab project demos', s: 'Live demos linked from your Lab Projects page.' }
  ];
  var LINKS = [
    { g: 'site', n: 'Pipeline (this app)', u: SITE + 'pipeline.html', w: 'Your pipeline, coach and email trail.', top: 1 },
    { g: 'site', n: 'Main website', u: SITE, w: 'The Brown Girls Creative Studio home page.', top: 1 },
    { g: 'site', n: 'The AI Lab', u: SITE + 'labs.html', w: 'Program page: classes, December cohort and waitlist buttons.', top: 1 },
    { g: 'site', n: 'Student Studio', u: SITE + 'portal.html', w: 'Student page. Its button goes to the Spring 2027 waitlist.' },
    { g: 'site', n: 'Free Family AI Event page', u: SITE + 'free-event.html', w: 'Event page with a parent waitlist button.' },
    { g: 'site', n: 'Season 2 interest page', u: SITE + 'season2.html', w: 'The page the InspiHER QR opens. It points to the interest form.', note: 'Hold this one back from Newton families until the district approves it.' },
    { g: 'site', n: 'Season 2 interest page (QR version)', u: SITE + 'season2.html?src=inspiher', w: 'Same page, tagged so you know the visit came from the QR code.' },
    { g: 'site', n: 'Parent card', u: SITE + 'parent-card.html', w: 'The printable card with the QR code on it.' },
    { g: 'site', n: 'InspiHER QR code image', u: SITE + 'inspiher-qr.png', w: 'The QR itself, for flyers, slides and the table sign.' },
    { g: 'site', n: 'InspiHER session plan', u: SITE + 'inspiher-plan.html', w: 'The game plan for each InspiHER session.' },
    { g: 'site', n: 'Lab projects', u: SITE + 'lab-projects.html', w: 'Applied AI labs and engines you can show to schools.' },
    { g: 'site', n: 'Student project showcase', u: SITE + 'class-projects.html', w: 'NCSA student project showcase.' },

    { g: 'forms', n: 'Waitlist form (short link)', u: 'https://forms.gle/EsHCzdzKTUwTjp7g8', w: 'The link on the AI Lab page, the free event page and the Season 2 page.', top: 1 },
    { g: 'forms', n: 'Spring 2027 waitlist form', u: 'https://docs.google.com/forms/d/e/1FAIpQLSc3iR7g3Suo_yJnBKXmLaYNYc2sHLgG4pxm6IsJuq1nZ6Rvfw/viewform', w: 'The link on the Student Studio page.' },
    { g: 'forms', n: 'December 2026 Cohort Waitlist (edit and responses)', u: 'https://docs.google.com/forms/d/11LHu_5zcZ7uFfi06kSMV-ViG7eQqvu7iCAvoDB3apo8/edit', w: 'The only form in your Drive. Open it here to see who signed up.', note: 'I could not tell from here whether this is the same form as the short link above. Open both once and check the title.' },

    { g: 'google', n: 'Gmail inbox', u: GM + '#inbox', w: 'Replies come here.', top: 1 },
    { g: 'google', n: 'Gmail drafts', u: GM + '#drafts', w: 'The emails waiting for you to send.' },
    { g: 'google', n: 'Gmail scheduled', u: GM + '#scheduled', w: 'Emails set to go out later.' },
    { g: 'google', n: 'Gmail sent', u: GM + '#sent', w: 'Everything you have sent.' },
    { g: 'google', n: 'Google Calendar', u: 'https://calendar.google.com/calendar?authuser=creativemetrixbgcs@gmail.com', w: 'Meetings, InspiHER dates and your work blocks.' },
    { g: 'google', n: 'Start a Google Meet', u: 'https://meet.google.com/new', w: 'Opens a new meeting you can paste into an invite.' },
    { g: 'google', n: 'Drive: The Brown Girls Creative Studio', u: 'https://drive.google.com/drive/folders/1tiULlwLpYEQsMze5I3yT2VW2o6lV6Hvf', w: 'Studio folder.' },
    { g: 'google', n: 'Drive: The AI Lab', u: 'https://drive.google.com/drive/folders/1qiitUCbCztSJMPoxMuisvIc3_mPpcFuy', w: 'Career Day run of show, facilitation guide, proposal, December schedule and handouts.' },

    { g: 'back', n: 'Site code on GitHub', u: 'https://github.com/raevenbrown/thebrowngirlsstudio', w: 'Where the site and this app live. Public.' },
    { g: 'back', n: 'Private data backup on GitHub', u: 'https://github.com/raevenbrown/bgcs-data-sync', w: 'Where the pipeline syncs between your devices. Private.' },
    { g: 'back', n: 'Supabase project', u: 'https://supabase.com/dashboard/project/qlgnstoesdzmkcmyaqyw', w: 'Database and the coach chat function.' },

    { g: 'demo', n: 'Creative Metrix', u: 'https://v0-open-in-v0-gamma-nine-95.vercel.app/integrations', w: 'Integrations demo.' },
    { g: 'demo', n: 'AutoGuard Claims Dashboard', u: 'https://autoguard-claims-dashboard-lyuc6v8avzfjjmt5kt4qn3.streamlit.app/', w: 'Claims dashboard demo.' },
    { g: 'demo', n: 'Coles Navigate360 IR Engine', u: 'https://ksu-institutional-ir-engine-nsfzyeyxgrogvxuzssmxib.streamlit.app/', w: 'Institutional research demo.' },
    { g: 'demo', n: 'Omnimetrix MSP Console', u: 'https://omnimetrix-msp-engine-mbx2qgs8zkdv2vx5jkprkd.streamlit.app/', w: 'Managed services console demo.' }
  ];
  var LINK_GAPS = [
    'No Instagram, TikTok, LinkedIn or YouTube link appears on any page of your site. Send them to me and I will add them here and to the site.',
    'Your site runs on a github.io address. A custom domain would look more professional on emails and the QR card. Say the word and I will walk you through it.',
    'Your Google Form responses sheet is not in your Drive search. Open the form, tap Responses, then the sheet icon, and send me the link so it lives here.'
  ];
  function linksCustom() { try { return JSON.parse(ls.get('bgcs_links_custom', '[]')) || []; } catch (e) { return []; } }
  function safeUrl(u) { u = String(u || '').trim(); if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u; return /^https?:\/\/[^\s"'<>]+\.[^\s"'<>]+$/i.test(u) ? u : ''; }
  window.hxLinkCopy = function (u) {
    function ok() { toast('Link copied.'); buzz(10); }
    try { navigator.clipboard.writeText(u).then(ok, function () { fallbackCopy(u); ok(); }); } catch (e) { fallbackCopy(u); ok(); }
  };
  window.hxLinkAdd = function (ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var f = ev && ev.target && ev.target.elements ? ev.target.elements : {}, n = (f.n && f.n.value) || '', u = safeUrl(f.u && f.u.value);
    n = n.trim().slice(0, 80);
    if (!n || !u) { toast('Add a name and a full link, like https://example.com'); return false; }
    var a = linksCustom(); a.push({ id: Date.now(), n: n, u: u }); ls.set('bgcs_links_custom', JSON.stringify(a));
    toast('Saved to your links.'); buzz(12); linksRefresh(); return false;
  };
  window.hxLinkDel = function (id) { ls.set('bgcs_links_custom', JSON.stringify(linksCustom().filter(function (x) { return x.id !== id; }))); linksRefresh(); };
  window.hxLinkFilter = function (q) {
    q = String(q || '').toLowerCase(); S.linkQ = q;
    document.querySelectorAll('.hx-lk').forEach(function (r) { r.style.display = !q || (r.getAttribute('data-q') || '').indexOf(q) >= 0 ? '' : 'none'; });
    document.querySelectorAll('.hx-lkg').forEach(function (g) { var any = g.querySelector('.hx-lk:not([style*="none"])'); g.style.display = (!q || any) ? '' : 'none'; });
  };
  function linkRow(l, mine) {
    var q = (l.n + ' ' + (l.w || '') + ' ' + l.u).toLowerCase();
    return '<div class="hx-row hx-lk" data-q="' + E(q) + '"><div style="min-width:0;flex:1">' +
      '<b style="font-size:14.5px">' + E(l.n) + '</b>' +
      (l.w ? '<p class="hx-mu" style="margin-top:2px">' + E(l.w) + '</p>' : '') +
      (l.note ? '<p class="hx-mu" style="margin-top:3px;font-size:12px"><b style="color:#E3BD79">Note:</b> ' + E(l.note) + '</p>' : '') +
      '<p style="font-size:11px;color:#9c8a6c;margin-top:3px;word-break:break-all">' + E(l.u.replace(/^https?:\/\/(www\.)?/, '')) + '</p></div>' +
      '<div style="display:flex;gap:6px;flex-shrink:0;align-items:center;flex-wrap:wrap;justify-content:flex-end">' +
      '<a class="hx-btn pri" href="' + E(l.u) + '" target="_blank" rel="noopener">Open</a>' +
      '<button class="hx-btn" data-u="' + E(l.u) + '" onclick="hxLinkCopy(this.getAttribute(\'data-u\'))">Copy</button>' +
      (mine ? '<button class="hx-btn" onclick="hxLinkDel(' + l.id + ')" aria-label="Remove ' + E(l.n) + '">Remove</button>' : '') + '</div></div>';
  }
  function linksBody() {
    var top = LINKS.filter(function (l) { return l.top; });
    var quick = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 12px">' + top.map(function (l) { return '<a class="hx-btn pri" href="' + E(l.u) + '" target="_blank" rel="noopener">' + E(l.n.replace(' (this app)', '')) + '</a>'; }).join('') + '</div>';
    var groups = LINK_GROUPS.map(function (g) {
      var items = LINKS.filter(function (l) { return l.g === g.id; });
      return '<div class="hx-lkg" style="margin-top:14px"><div class="hx-k">' + E(g.t) + ' &middot; ' + items.length + '</div><p class="hx-mu" style="margin-bottom:4px">' + E(g.s) + '</p>' + items.map(function (l) { return linkRow(l); }).join('') + '</div>';
    }).join('');
    var mine = linksCustom();
    var mineHtml = '<div class="hx-lkg" style="margin-top:14px"><div class="hx-k">Links you added &middot; ' + mine.length + '</div>' +
      (mine.length ? mine.map(function (l) { return linkRow(l, true); }).join('') : '<p class="hx-mu">Nothing yet. Add any link you use for the business below, like a Canva design, a sheet or a social page.</p>') +
      '<form onsubmit="return hxLinkAdd(event)" style="margin-top:10px;display:grid;gap:8px"><input name="n" placeholder="Name (example: Canva flyer)" maxlength="80" style="padding:11px 12px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid rgba(227,189,121,.3);color:#F3E8D6;font-size:16px"><input name="u" inputmode="url" placeholder="Link (https://...)" style="padding:11px 12px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid rgba(227,189,121,.3);color:#F3E8D6;font-size:16px"><button class="hx-btn pri" type="submit" style="justify-content:center">Save this link</button></form></div>';
    var gaps = '<div class="hx-lkg" style="margin-top:14px"><div class="hx-k">Not connected yet</div>' + LINK_GAPS.map(function (g) { return '<div class="hx-row"><div class="hx-mu" style="color:#F3E8D6">' + E(g) + '</div></div>'; }).join('') + '</div>';
    return '<input type="search" placeholder="Search your links" oninput="hxLinkFilter(this.value)" value="' + E(S.linkQ || '') + '" style="width:100%;padding:11px 12px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid rgba(227,189,121,.3);color:#F3E8D6;font-size:16px;margin-bottom:10px" aria-label="Search your links">' + quick + groups + mineHtml + gaps;
  }
  function linksCard(plain) {
    return '<div class="hx-card' + (plain ? '' : ' fx-tilt hx-in') + '"><div class="hx-k">Every link for the business</div><p class="hx-mu" style="margin-bottom:6px">One place for the site, the forms, Gmail, Drive and the demos. Tap Open, or Copy to paste into an email.</p>' + linksBody() + '</div>';
  }
  function linksRefresh() {
    var pg = document.getElementById('linksPage');
    if (pg && pg.offsetParent !== null) { var y = window.scrollY; window.hxLinksPage(); window.scrollTo(0, y); if (S.linkQ) window.hxLinkFilter(S.linkQ); }
    else renderHome();
  }
  window.hxLinksPage = function () { var pg = document.getElementById('linksPage'); if (pg) pg.innerHTML = linksCard(true); };
  window.hxLinksGo = function () {
    buzz(8);
    if (isMobile() && pipelineVisible()) window.hxTab('links');
    else if (typeof switchMainView === 'function') switchMainView('links');
  };

  /* ---------- files: every document in one place (links only; private files stay in Drive) ---------- */
  function fxF(id) { return 'https://drive.google.com/drive/folders/' + id; }
  function fxX(id) { return 'https://drive.google.com/file/d/' + id + '/view'; }
  function fxD(id) { return 'https://docs.google.com/document/d/' + id + '/edit'; }
  function fxS(id) { return 'https://docs.google.com/spreadsheets/d/' + id + '/edit'; }
  function fxP(id) { return 'https://docs.google.com/presentation/d/' + id + '/edit'; }
  var FILE_GROUPS = [
    { id: 'start', t: 'Start here', s: 'The documents you reach for most.' },
    { id: 'lab', t: 'The AI Lab program', s: 'Run of show, guides, rubric, schedule and proposal. The Pages files download first, then open in Pages on your Mac or iPhone.' },
    { id: 'studio', t: 'Studio folders in Drive', s: 'One folder per kind of paper. The two marked Private hold money and legal papers.' },
    { id: 'cap', t: 'Capstone: Jade and Steve', s: 'The report, slides, script, findings and demo video.' }
  ];
  var FILES = [
    { g: 'start', k: 'Doc', n: 'The AI Lab: Class Offer', u: fxD('1PQ76QBX4rKO9upx_E5cgObrmd5aNLBrN5iU_Ur_N0XE'), w: 'The one-page offer: $125 per student per month, about 20 per class, no long-term contract.', top: 1 },
    { g: 'start', k: 'Doc', n: 'Running the Studio with Claude as a Full Team', u: fxD('147LKT9duVgnk2FKqYCrA6MrsfRRMJGhArlPg0T--iF0'), w: 'Which Claude job covers sales, marketing, finance, legal and the rest.' },
    { g: 'start', k: 'Sheet', n: 'Contract lead tracker', u: fxS('1UW97Or2r9kIQVj01fYfy7_H3S1G4tkT26JEWwGMfUlI'), w: 'The older contract-lead tracking sheet.' },
    { g: 'start', k: 'Folder', n: 'The AI Lab (Drive folder)', u: fxF('1qiitUCbCztSJMPoxMuisvIc3_mPpcFuy'), w: 'Everything for the program in one folder.', top: 1 },
    { g: 'lab', k: 'Pages', n: '01 Career Day Run of Show', u: fxX('10ltaX7Pa_u9L8X8U82skfNtCmCIIDZkG'), w: 'The minute-by-minute plan for the free event.' },
    { g: 'lab', k: 'Pages', n: '02 Facilitation and Presentation Guide', u: fxX('13vFHRGCHqfmY-Dd0eIsrZtKxAhZ0AI5c'), w: 'What to say and do while you teach.' },
    { g: 'lab', k: 'Pages', n: '03 STEM Sprint Challenges', u: fxX('1ivzXTSfMFBDQ8ZDzodq9n2zzvCajGDE8'), w: 'The challenges, including the ten-cup stack.' },
    { g: 'lab', k: 'Pages', n: '04 Student Prototype Rubric', u: fxX('141OkFkmAc_xhCQMQk31ffh83HKGjCHiB'), w: 'How student work is scored.' },
    { g: 'lab', k: 'Pages', n: '05 Prompting and Website Build Handout', u: fxX('1FVw08PQ-RehxKLPX9oALj8DNIoe9cv4e'), w: 'The student handout.' },
    { g: 'lab', k: 'Pages', n: '06 December Cohort Schedule', u: fxX('1jYkT3TqoY7SvS4-8s1n5f6596a3ZJ0Ww'), w: 'Dates and times for the December cohort.' },
    { g: 'lab', k: 'Pages', n: '07 School Partnership Proposal', u: fxX('1WrA1HcuRpyvikiKP_MLAI0Hk6O6bu4Ka'), w: 'The proposal you hand a school.', note: 'Check that its price and term match the one-page offer before you send it.' },
    { g: 'lab', k: 'Pages', n: '08 Operations, Growth and Delivery Workflow', u: fxX('1-FWCkXgs_EtnGizF3chVXObg7pyoDAe5'), w: 'How the program runs from first email to final showcase.' },
    { g: 'lab', k: 'PDF', n: 'Career Day Content Shot List (iPhone filming guide)', u: fxX('1dr9PaIWhtiBdYQGsbIXFmqjC9IhozCth'), w: 'The checklist of shots to film on the day.' },
    { g: 'studio', k: 'Folder', n: 'The Brown Girls Creative Studio', u: fxF('1tiULlwLpYEQsMze5I3yT2VW2o6lV6Hvf'), w: 'The top studio folder.' },
    { g: 'studio', k: 'Folder', n: 'Programs and Curriculum', u: fxF('1sMimEPBvwie0ECkQQbhJbPVL3yS0fDn9'), w: 'Program documents and the waitlist form.' },
    { g: 'studio', k: 'Folder', n: 'Partners and Outreach', u: fxF('1Lr3EWPZi4qSwQFgKiggz_EqKfKfz_xCQ'), w: 'Agreements and lead trackers.' },
    { g: 'studio', k: 'Folder', n: 'Marketing and Social', u: fxF('1FEURWUMmokbfKDiToCvbPC698tqqnsEM'), w: 'Content, flyers and posts.' },
    { g: 'studio', k: 'Folder', n: 'Student Work (no names or faces)', u: fxF('1nznbD1oxMQ9O_IOZszUuwAL6Fd_be4b1'), w: 'Work you can show without naming or picturing a student.' },
    { g: 'studio', k: 'Folder', n: 'Finances', u: fxF('1HH4L_541FnBprS0PdvNNshpIoDXw_VKR'), w: 'Invoices, receipts and money records.', priv: 1 },
    { g: 'studio', k: 'Folder', n: 'Legal and Tax', u: fxF('1d6BNzSUL8w1oAxoFXdvrrmJLWYTFjAnz'), w: 'Tax and legal papers.', priv: 1 },
    { g: 'cap', k: 'Doc', n: 'Research report', u: fxD('13XO2AqUL3sSo9Yqg1UrWMGl4vxRpPlM7A3oY6OBa00g'), w: 'Can a local AI be trusted with my own documents?' },
    { g: 'cap', k: 'PDF', n: 'Research report (PDF)', u: fxX('1zjcbt_dKMOHuXrgTSATK4rOWJE0VlwMV'), w: 'The same report as a PDF.' },
    { g: 'cap', k: 'Slides', n: 'Capstone defense slides', u: fxP('1GEJv82dkV-3vhppA3MzzDv73lH-mpNa9O1CJJmTBfYI'), w: 'The slides, with speaker notes.' },
    { g: 'cap', k: 'PDF', n: 'Defense script', u: fxX('1uKw2vcYkfK8Iv2Fj0kkbWWsb6_gzK9mA'), w: 'What you say on each slide.' },
    { g: 'cap', k: 'PDF', n: 'Findings log', u: fxX('1EvmkblqHRwxntTACJPUZc2zk1Fg98ICK'), w: 'Your test notes and results.' },
    { g: 'cap', k: 'Video', n: 'Demo video', u: fxX('18u8ZK03FqF5TqkjkdOXJKwHV86WkyluW'), w: 'The recording of Jade and Steve running offline.' },
    { g: 'cap', k: 'Folder', n: 'Code: Jade and Steve', u: fxF('1tyuEwrIqQeptURwA-LfDeUq4ZTOoY05T'), w: 'The scripts that run the two assistants.' },
    { g: 'cap', k: 'Folder', n: 'Raeven: School and Career', u: fxF('1PeR8XDHOpuN507qdhfOMT6wPl7PzplPZ'), w: 'Coursework and career papers.', priv: 1 }
  ];
  function filesCustom() { try { return JSON.parse(ls.get('bgcs_files_custom', '[]')) || []; } catch (e) { return []; } }
  window.hxFileAdd = function (ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var f = ev && ev.target && ev.target.elements ? ev.target.elements : {}, n = ((f.n && f.n.value) || '').trim().slice(0, 80), u = safeUrl(f.u && f.u.value);
    if (!n || !u) { toast('Add a name and a full link, like https://drive.google.com/...'); return false; }
    var a = filesCustom(); a.push({ id: Date.now(), n: n, u: u, c: ((f.c && f.c.value) || 'mine') }); ls.set('bgcs_files_custom', JSON.stringify(a));
    toast('Saved to your files.'); buzz(12); filesRefresh(); return false;
  };
  window.hxFileDel = function (id) { ls.set('bgcs_files_custom', JSON.stringify(filesCustom().filter(function (x) { return x.id !== id; }))); filesRefresh(); };
  window.hxFileFilter = function (q) {
    q = String(q || '').toLowerCase(); S.fileQ = q;
    document.querySelectorAll('.hx-fl').forEach(function (r) { r.style.display = !q || (r.getAttribute('data-q') || '').indexOf(q) >= 0 ? '' : 'none'; });
    document.querySelectorAll('.hx-flg').forEach(function (g) { var any = g.querySelector('.hx-fl:not([style*="none"])'); g.style.display = (!q || any) ? '' : 'none'; });
  };
  function fileRow(l, mine) {
    var q = (l.n + ' ' + (l.w || '') + ' ' + (l.k || '') + (l.priv ? ' private' : '')).toLowerCase();
    var badge = function (t, hot) { return '<span style="display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:999px;margin-left:8px;vertical-align:2px;border:1px solid ' + (hot ? 'rgba(227,189,121,.7);color:#E3BD79' : 'rgba(199,153,79,.35);color:#c9b48a') + '">' + E(t) + '</span>'; };
    return '<div class="hx-row hx-fl" data-q="' + E(q) + '"><div style="min-width:0;flex:1">' +
      '<b style="font-size:14.5px">' + E(l.n) + '</b>' + (l.k ? badge(l.k) : '') + (l.priv ? badge('Private', 1) : '') +
      (l.w ? '<p class="hx-mu" style="margin-top:2px">' + E(l.w) + '</p>' : '') +
      (l.note ? '<p class="hx-mu" style="margin-top:3px;font-size:12px"><b style="color:#E3BD79">Note:</b> ' + E(l.note) + '</p>' : '') + '</div>' +
      '<div style="display:flex;gap:6px;flex-shrink:0;align-items:center;flex-wrap:wrap;justify-content:flex-end">' +
      '<a class="hx-btn pri" href="' + E(l.u) + '" target="_blank" rel="noopener">Open</a>' +
      '<button class="hx-btn" data-u="' + E(l.u) + '" onclick="hxLinkCopy(this.getAttribute(\'data-u\'))">Copy</button>' +
      (mine ? '<button class="hx-btn" onclick="hxFileDel(' + l.id + ')" aria-label="Remove ' + E(l.n) + '">Remove</button>' : '') + '</div></div>';
  }
  function filesBody() {
    var inp = 'padding:11px 12px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid rgba(227,189,121,.3);color:#F3E8D6;font-size:16px';
    var top = FILES.filter(function (l) { return l.top; });
    var quick = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 12px">' + top.map(function (l) { return '<a class="hx-btn pri" href="' + E(l.u) + '" target="_blank" rel="noopener">' + E(l.n.replace(' (Drive folder)', '')) + '</a>'; }).join('') + '</div>';
    var groups = FILE_GROUPS.map(function (g) {
      var items = FILES.filter(function (l) { return l.g === g.id; });
      return '<div class="hx-flg" style="margin-top:14px"><div class="hx-k">' + E(g.t) + ' &middot; ' + items.length + '</div><p class="hx-mu" style="margin-bottom:4px">' + E(g.s) + '</p>' + items.map(function (l) { return fileRow(l); }).join('') + '</div>';
    }).join('');
    var mine = filesCustom();
    var cats = FILE_GROUPS.map(function (g) { return '<option value="' + g.id + '">' + E(g.t) + '</option>'; }).join('') + '<option value="mine" selected>Other</option>';
    var catName = {}; FILE_GROUPS.forEach(function (g) { catName[g.id] = g.t; });
    var mineHtml = '<div class="hx-flg" style="margin-top:14px"><div class="hx-k">Files you added &middot; ' + mine.length + '</div>' +
      (mine.length ? mine.map(function (l) { return fileRow({ id: l.id, n: l.n, u: l.u, k: catName[l.c] || '', w: '' }, true); }).join('') : '<p class="hx-mu">Nothing yet. Paste the link to any file you want here, like a Drive PDF, a Canva design or a signed agreement.</p>') +
      '<form onsubmit="return hxFileAdd(event)" style="margin-top:10px;display:grid;gap:8px"><input name="n" placeholder="Name (example: Signed school agreement)" maxlength="80" style="' + inp + '" aria-label="File name"><input name="u" inputmode="url" placeholder="Link (https://...)" style="' + inp + '" aria-label="File link"><select name="c" style="' + inp + '" aria-label="Where it belongs">' + cats + '</select><button class="hx-btn pri" type="submit" style="justify-content:center">Save this file</button></form>' +
      '<p class="hx-mu" style="margin-top:6px;font-size:12px">Files you add here stay on this device. The ones above are on every device.</p></div>';
    var mac = '<div class="hx-flg" style="margin-top:14px"><div class="hx-k">Keep a copy on your Mac</div>' +
      '<div class="hx-row"><div class="hx-mu" style="color:#F3E8D6">Your documents live in Google Drive, so this tab holds links, not the files. To have a spare on your Mac, install Google Drive for desktop and set the studio folders to be available offline. The Pages files already open on your Mac once downloaded.</div></div>' +
      '<div class="hx-row"><div class="hx-mu" style="color:#F3E8D6">Private papers such as your tax and money records are not kept in this app or on the public site, and that is on purpose.</div></div></div>';
    return '<input type="search" placeholder="Search your files" oninput="hxFileFilter(this.value)" value="' + E(S.fileQ || '') + '" style="width:100%;' + inp + ';margin-bottom:10px" aria-label="Search your files">' + quick + groups + mineHtml + mac;
  }
  function filesCard(plain) {
    return '<div class="hx-card' + (plain ? '' : ' fx-tilt hx-in') + '"><div class="hx-k">Your files</div><p class="hx-mu" style="margin-bottom:6px">Every document in one place. Tap Open to see it in Drive, or Copy to paste the link into an email.</p>' + filesBody() + '</div>';
  }
  function filesRefresh() {
    var pg = document.getElementById('filesPage');
    if (pg && pg.offsetParent !== null) { var y = window.scrollY; window.hxFilesPage(); window.scrollTo(0, y); if (S.fileQ) window.hxFileFilter(S.fileQ); }
    else renderHome();
  }
  window.hxFilesPage = function () { var pg = document.getElementById('filesPage'); if (pg) pg.innerHTML = filesCard(true); };

  /* ---------- digital marketing: paid clipping campaigns ---------- */
  var CLIP_SUBS = [['start', 'Start here'], ['plat', 'Where to find campaigns'], ['camps', 'My campaigns'], ['accts', 'Accounts by platform'], ['tips', 'Tips and tricks'], ['watch', 'Watch-outs']];
  var CLIP_PLATS = ['TikTok', 'Instagram', 'YouTube Shorts', 'X', 'Other'];
  var CLIP_STATUS = ['Watching', 'Applied', 'Active', 'Paused', 'Done'];
  var CLIP_SRC = [
    ['Content Rewards: what clippers earn (Nov 16, 2026, the platform\'s own listings)', 'https://contentrewards.com/articles/how-much-do-clippers-make'],
    ['Reap: how to become a clipper (Nov 2026, sells a clipping tool)', 'https://reap.video/blog/how-to-become-a-clipper'],
    ['Clipped: best clipping platforms (Oct 2026, author sells a clipping app)', 'https://clipped.cc/blog/best-clipping-platforms-2026'],
    ['NextClip: best clipping platforms (2026, sells a clipping tool)', 'https://www.nextclip.pro/blog/best-clipping-platforms-2026'],
    ['Dexerto: YouTube Shorts and re-uploaded content (Oct 5, 2026)', 'https://www.dexerto.com/youtube/youtube-cracks-down-on-clipping-channels-in-shorts-update-prioritizing-original-content-3415700'],
    ['Cut.Pro: reposts and original-content rules on X, Meta and YouTube (2026, sells clipping tools)', 'https://cut.pro/en/blog/reposts-dont-pay-x-meta-youtube-2026']
  ];
  var CLIP_FIND = [
    { n: 'Whop Content Rewards', how: 'A marketplace. Each campaign sets its own rate, rules and budget. You join or apply, post, then submit the link.', rate: 'Median listed rate about $1.00 per 1,000 views. Half of campaigns list $1.00 to $2.00. Technology campaigns run highest, about $1.58.', watch: '10% fee on per-view campaigns. A clip stops earning 30 days after you submit it. Submit within 30 minutes of posting. Buying views is a permanent ban.', u: 'https://contentrewards.com/' },
    { n: 'Vyro', how: 'Creator-run clipping programs. Rate is set per campaign.', rate: 'Live campaigns reported at $1.50 and $2.50 per 1,000 views. Other sources say $1 to $2, some about $3.', watch: 'Income stops if the creator ends the program. Brand rules are strict. Pays through Stripe or PayPal. Some campaigns cap payouts.' },
    { n: 'Klippify', how: 'Campaign platform with one-click joining and AI view checks.', rate: 'Advertised at $1 per 1,000 verified views, paid weekly.', watch: 'Flat rate and a smaller list of campaigns than Whop. Fraud checks can void a payout.' },
    { n: 'ClipAffiliates', how: 'Brands set the rate and the budget cap. Views are checked through the social platforms.', rate: 'Set by each brand.', watch: 'One source says no per-post caps. Check each campaign\'s budget before you start.', u: 'https://www.clipaffiliates.com/blog/how-to-start-clipping', ul: 'Their how-to guide' },
    { n: 'Promote.fun', how: 'Campaign platform.', rate: '$0.20 to $2.25 per 1,000 views depending on the campaign.', watch: 'Wide range. Read the rate before you clip.' },
    { n: 'Clipping.io', how: 'Campaign platform paid by views.', rate: 'Set per campaign. It claims $1.5 million paid out, which is its own claim.', watch: 'Confirm the rate and payout method inside the platform.' },
    { n: 'Clipping.net', how: 'Campaign platform.', rate: 'About $50 per 100,000 views, which is $0.50 per 1,000.', watch: 'Lowest rate here and often a 100,000-view minimum before you get paid.' },
    { n: 'Kick streamer programs', how: 'Individual streamers fund their own clipping programs.', rate: 'No figures published. Budgets can beat marketplace rates.', watch: 'Ends when the streamer ends it. Strict rules. High competition.' },
    { n: 'Direct deals with mid-size creators', how: 'You pitch creators with about 10K to 500K followers using sample clips. This is where your own outreach skill pays off.', rate: 'Negotiated: a rate per 1,000 views or a flat monthly fee.', watch: 'No platform protection. You track views and chase payment yourself, so get terms in writing.' },
    { n: 'X native clipping', how: 'Launched Nov 9, 2026. Clip 5 to 60 seconds, up to 30% of another creator\'s video, and repost with commentary.', rate: 'No per-view rate published. You and the original creator both have to be enrolled in Original Content Rewards to earn.', watch: 'Reported eligibility: 18+, Premium, 500 verified followers and 500,000 impressions in 90 days. Treat it as a bonus.' },
    { n: 'Fiverr (sell clipping as a service)', how: 'Podcasters and coaches pay you per clip or per batch.', rate: 'You set the price. Pay is not tied to views.', watch: 'Fiverr takes a fee on each order and prices are competitive.' }
  ];
  var CLIP_PLAT_TIPS = {
    'TikTok': ['Median listed rate about $1.00 per 1,000 views.', 'Upload from your phone or the app itself. Another app\'s watermark gets clips rejected.', 'Most campaigns need a public account.'],
    'Instagram': ['Median listed rate about $1.00 per 1,000 views.', 'Post as a Reel. Meta says it favors original creators over reposters, so add your own captions, framing or commentary.', 'Use the paid partnership label when the brief asks for it.'],
    'YouTube Shorts': ['Median listed rate about $1.10 to $1.43 per 1,000 views, the highest of the four.', 'YouTube is cutting the reach of re-uploaded Shorts that add nothing of your own (reported Oct 5, 2026). Add commentary, a real edit or a story.', 'Minor template tweaks do not count as adding value.'],
    'X': ['Median listed rate about $1.00 per 1,000 views.', 'Native clipping launched Nov 9, 2026 and pays only if you and the original creator are both enrolled in Original Content Rewards.', 'Keep it as a bonus until you confirm you qualify.'],
    'Other': ['Kick, Twitch, podcasts and brand pages. Rates are negotiated or set by the program.', 'Write the terms down before you post anything.']
  };
  var CLIP_TIPS = [
    ['Pick one niche first', 'Technology campaigns post the highest median rate, about $1.58. AI and education creators are the same people you pitch for The AI Lab, so every clip doubles as research.'],
    ['Start on the strongest second', 'Open on the punchline, the bold claim or the reaction. Most clips run 15 to 45 seconds.'],
    ['Captions on every clip', 'Many people watch with the sound off. Big, clear captions, kept out of the zone the app covers.'],
    ['9:16 and no old watermarks', 'Reframe to vertical. Export without another app\'s logo. Watermarks are a common reason for rejection.'],
    ['Read the brief like a contract', 'Missing a required tag, mention, hook, length or ad disclosure is the most common reason a clip gets rejected. Copy the required lines into your caption before you post.'],
    ['Post natively, once per platform', 'Upload to each app yourself. Do not post duplicates to the same account.'],
    ['Submit the link right away', 'Some campaigns require submission within 30 minutes of posting. Do it while the app is still open.'],
    ['Do not change what they meant', 'Do not cut a quote so it says something different. Brands remove campaigns and ban clippers for it.'],
    ['Volume beats perfect', 'A few breakout clips usually come out of many posts. Post several a day once you have a rhythm.'],
    ['Review at two weeks', 'Look at which hooks, topics and lengths got views. Make more of those and drop the rest.'],
    ['Add something of your own', 'YouTube, Meta and X are all pushing down pure re-uploads. A short line of commentary, a better edit or a story keeps your reach.'],
    ['Use your best clips as a portfolio', 'Once you have a few that did well, pitch mid-size creators directly. Direct deals can beat marketplace rates.']
  ];
  var CLIP_WATCH = [
    ['Never pay to join', 'Legitimate marketplaces do not charge you to join. If a page asks for money up front, walk away.'],
    ['Never share a login', 'No campaign needs your password. Do not rent, sell or hand over an account.'],
    ['Never buy views', 'Bought or bot views void payouts. Content Rewards lists it as a permanent ban.'],
    ['Earnings can be held or rejected', 'Pay starts after brand approval. Content Rewards holds earnings for rounds of about 10 days. Some clippers report holds of up to 90 days and rejected views. Do not count the money until it lands.'],
    ['Income can vanish overnight', 'Creator programs end when the creator ends them. Spread across at least two campaigns.'],
    ['Fees and caps shrink the number', 'Content Rewards takes 10% on per-view campaigns. Each campaign caps what one clip can earn. Realistic net estimates run from about $0.50 to $4 per 1,000 views, an unsourced estimate, so plan on the low end.'],
    ['Rules on re-uploads keep tightening', 'YouTube, Meta and X all announced limits on unoriginal content in 2026. Always add something of your own and re-check the rules each month.'],
    ['These are income, so track them', 'Payouts are income. Keep a record of every payout and ask a tax professional how to report it. I am not a tax advisor.'],
    ['Rates are claims, not promises', 'Every rate on this page comes from the platforms\' own listings or from articles by companies that sell clipping tools. Check the live campaign before you commit.']
  ];

  function clipCamps() { try { return JSON.parse(ls.get('bgcs_clip_camps', '[]')) || []; } catch (e) { return []; } }
  function clipCampsSet(a) { ls.set('bgcs_clip_camps', JSON.stringify(a)); }
  function clipAccts() { try { return JSON.parse(ls.get('bgcs_clip_accts', '{}')) || {}; } catch (e) { return {}; } }
  function clipSub() { var v = S.clipSub || ls.get('bgcs_clip_sub', 'start'); return CLIP_SUBS.some(function (x) { return x[0] === v; }) ? v : 'start'; }
  function cmoney(n) { n = Math.round(n * 100) / 100; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); }
  function campEarn(c) { return (c.views || 0) / 1000 * (c.rate || 0) * (1 - (c.fee || 0) / 100); }
  function clipInput(extra) { return 'style="padding:11px 12px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid rgba(227,189,121,.3);color:#F3E8D6;font-size:16px;width:100%" ' + (extra || ''); }

  window.hxClipSub = function (id) { S.clipSub = id; ls.set('bgcs_clip_sub', id); buzz(8); clipRefresh(); };
  window.hxClipCalc = function (el) {
    var r = el.closest('.clc'); if (!r) return;
    function g(k) { var i = r.querySelector('[data-k=' + k + ']'); return parseFloat(i && i.value) || 0; }
    var views = g('v'), rate = g('r'), fee = Math.min(100, g('f')), goal = g('g');
    var net = rate * (1 - fee / 100);
    r.querySelector('[data-o=earn]').textContent = cmoney(views / 1000 * net);
    r.querySelector('[data-o=need]').textContent = net > 0 && goal > 0 ? Math.ceil(goal / net * 1000).toLocaleString('en-US') + ' views' : 'Add a rate and a goal';
  };
  window.hxClipAdd = function (ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var f = ev && ev.target && ev.target.elements ? ev.target.elements : {};
    var n = ((f.n && f.n.value) || '').trim().slice(0, 80); if (!n) { toast('Give the campaign a name first.'); return false; }
    var a = clipCamps(); a.push({ id: Date.now(), n: n, p: (f.p && f.p.value) || 'TikTok', rate: parseFloat(f.r && f.r.value) || 0, fee: f.f && f.f.value !== '' ? Math.min(100, parseFloat(f.f.value) || 0) : 10, st: 'Watching', views: 0, niche: ((f.k && f.k.value) || '').trim().slice(0, 40), added: dayKey(new Date()) });
    clipCampsSet(a); toast('Campaign saved.'); buzz(12); clipRefresh(); return false;
  };
  window.hxClipSt = function (id) { var a = clipCamps(); a.forEach(function (c) { if (c.id === id) c.st = CLIP_STATUS[(CLIP_STATUS.indexOf(c.st) + 1) % CLIP_STATUS.length]; }); clipCampsSet(a); buzz(8); clipRefresh(); };
  window.hxClipV = function (id, v) { var a = clipCamps(); a.forEach(function (c) { if (c.id === id) c.views = Math.max(0, parseInt(v, 10) || 0); }); clipCampsSet(a); clipRefresh(); };
  window.hxClipRm = function (id) { clipCampsSet(clipCamps().filter(function (c) { return c.id !== id; })); clipRefresh(); };
  window.hxClipAcct = function (p, v) { var a = clipAccts(); a[p] = (v || '').trim().slice(0, 60); ls.set('bgcs_clip_accts', JSON.stringify(a)); };

  function clipStart() {
    var camps = clipCamps(), act = camps.filter(function (c) { return c.st === 'Active'; }).length;
    return '<div class="hx-row" style="display:block"><b style="color:#E3BD79">Straight talk</b><p class="hx-mu" style="color:#F3E8D6;margin-top:4px">Clipping is side income that builds slowly. At a $1.50 rate and a 10% fee, $500 takes about 370,000 approved views. It will not close the gap to $14k by January on its own. I suggest a cap of 3 hours a week until your first emails are out. Change it if you disagree, but pick a number and hold to it.</p></div>' +
      '<div class="hx-k" style="margin-top:14px">What clipping is</div><p class="hx-mu">You cut a short moment from a creator\'s, streamer\'s or brand\'s long video and post it on your own accounts. The campaign pays a set rate per 1,000 approved views. Clips are only allowed when the campaign says so in its brief.</p>' +
      '<div class="hx-k" style="margin-top:14px">Your first week</div>' +
      [['Day 1', 'Pick one niche. Open one fresh account on TikTok and one on Instagram. Keep them separate from your personal account and The AI Lab accounts.'], ['Day 2', 'Join two or three campaigns that have a clear brief and budget left. Add them to My campaigns.'], ['Days 3 to 6', 'Post two clips a day. Submit every link the moment you post.'], ['Day 7', 'Check what got approved. Write down which hook worked.']].map(function (x) { return '<div class="hx-row"><div style="min-width:64px;font-weight:800;color:#E3BD79">' + x[0] + '</div><div class="hx-mu" style="color:#F3E8D6">' + x[1] + '</div></div>'; }).join('') +
      '<div class="hx-k" style="margin-top:14px">Before you join any campaign</div><p class="hx-mu">Check the rate per 1,000 views, the minimum before a clip is reviewed, the maximum one clip can earn, the budget left, the brief (tags, hooks, length, disclosure), the review window, the payout method and the fee.</p>' +
      '<div class="hx-k" style="margin-top:14px">What would it pay?</div><div class="clc" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px"><label class="hx-mu">Approved views<input data-k="v" type="number" inputmode="numeric" min="0" value="100000" oninput="hxClipCalc(this)" ' + clipInput() + '></label><label class="hx-mu">Rate per 1,000 views ($)<input data-k="r" type="number" inputmode="decimal" min="0" step="0.05" value="1.5" oninput="hxClipCalc(this)" ' + clipInput() + '></label><label class="hx-mu">Platform fee (%)<input data-k="f" type="number" inputmode="decimal" min="0" max="100" value="10" oninput="hxClipCalc(this)" ' + clipInput() + '></label><label class="hx-mu">Money goal ($)<input data-k="g" type="number" inputmode="decimal" min="0" value="500" oninput="hxClipCalc(this)" ' + clipInput() + '></label>' +
      '<div class="hx-row" style="grid-column:1/-1;display:flex;justify-content:space-between;gap:10px"><div><span class="hx-mu">You would earn</span><div data-o="earn" style="font-size:26px;font-weight:900;color:#E3BD79">$135</div></div><div style="text-align:right"><span class="hx-mu">Views needed for your goal</span><div data-o="need" style="font-size:20px;font-weight:900;color:#E3BD79">370,371 views</div></div></div></div>' +
      '<p class="hx-mu" style="margin-top:8px">You have ' + camps.length + ' campaign' + (camps.length === 1 ? '' : 's') + ' saved and ' + act + ' active.</p>';
  }
  function clipPlat() {
    return '<p class="hx-mu">Rates below come from the platforms\' own pages and from articles by companies that sell clipping tools. They are claims, not promises. Open the live campaign and confirm before you join.</p>' + CLIP_FIND.map(function (p) {
      return '<div class="hx-row" style="display:block"><b style="font-size:14.5px">' + E(p.n) + '</b>' +
        '<p class="hx-mu" style="margin-top:3px"><b style="color:#F3E8D6">How it works:</b> ' + E(p.how) + '</p>' +
        '<p class="hx-mu" style="margin-top:3px"><b style="color:#F3E8D6">Pays:</b> ' + E(p.rate) + '</p>' +
        '<p class="hx-mu" style="margin-top:3px"><b style="color:#E3BD79">Watch:</b> ' + E(p.watch) + '</p>' +
        '<div style="margin-top:8px"><a class="hx-btn pri" href="' + E(p.u || ('https://www.google.com/search?q=' + encodeURIComponent(p.n + ' clipping'))) + '" target="_blank" rel="noopener">' + (p.u ? E(p.ul || 'Open') : 'Search it') + '</a></div></div>';
    }).join('') + '<div class="hx-k" style="margin-top:14px">Where this came from</div>' + CLIP_SRC.map(function (s) { return '<div class="hx-row"><a class="hx-a" href="' + E(s[1]) + '" target="_blank" rel="noopener">' + E(s[0]) + '</a></div>'; }).join('');
  }
  function clipCampsView() {
    var a = clipCamps(), tv = 0, te = 0;
    a.forEach(function (c) { tv += c.views || 0; te += campEarn(c); });
    var rows = a.map(function (c) {
      return '<div class="hx-row" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div style="min-width:0"><b style="font-size:14.5px">' + E(c.n) + '</b><p class="hx-mu" style="margin-top:2px">' + E(c.p) + (c.niche ? ' &middot; ' + E(c.niche) : '') + ' &middot; ' + cmoney(c.rate || 0) + ' per 1,000 &middot; fee ' + (c.fee || 0) + '%</p></div><button class="hx-btn" onclick="hxClipSt(' + c.id + ')" aria-label="Change status">' + E(c.st) + '</button></div>' +
        '<div style="display:flex;gap:10px;align-items:center;margin-top:8px;flex-wrap:wrap"><label class="hx-mu" style="display:flex;gap:6px;align-items:center">Approved views <input type="number" inputmode="numeric" min="0" value="' + (c.views || 0) + '" onchange="hxClipV(' + c.id + ',this.value)" style="width:110px;padding:8px 10px;border-radius:10px;background:rgba(0,0,0,.28);border:1px solid rgba(227,189,121,.3);color:#F3E8D6;font-size:16px"></label><span style="font-weight:900;color:#E3BD79">' + cmoney(campEarn(c)) + ' after fee</span><button class="hx-btn" style="margin-left:auto" onclick="hxClipRm(' + c.id + ')" aria-label="Remove ' + E(c.n) + '">Remove</button></div></div>';
    }).join('');
    return '<div class="hx-row" style="display:flex;justify-content:space-between;gap:10px"><div><span class="hx-mu">Approved views</span><div style="font-size:24px;font-weight:900;color:#E3BD79">' + tv.toLocaleString('en-US') + '</div></div><div style="text-align:right"><span class="hx-mu">Earned after fees</span><div style="font-size:24px;font-weight:900;color:#E3BD79">' + cmoney(te) + '</div></div></div>' +
      (rows || '<p class="hx-mu" style="margin-top:8px">No campaigns yet. Add the first one below. Tap its status button to move it from Watching to Applied to Active.</p>') +
      '<div class="hx-k" style="margin-top:14px">Add a campaign</div><form onsubmit="return hxClipAdd(event)" style="display:grid;gap:8px"><input name="n" placeholder="Campaign or creator name" maxlength="80" ' + clipInput() + '><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><select name="p" ' + clipInput() + '>' + CLIP_PLATS.map(function (p) { return '<option>' + E(p) + '</option>'; }).join('') + '</select><input name="k" placeholder="Niche (example: tech)" maxlength="40" ' + clipInput() + '><input name="r" type="number" inputmode="decimal" min="0" step="0.05" placeholder="Rate per 1,000 ($)" ' + clipInput() + '><input name="f" type="number" inputmode="decimal" min="0" max="100" placeholder="Fee % (10)" ' + clipInput() + '></div><button class="hx-btn pri" type="submit" style="justify-content:center">Save campaign</button></form>';
  }
  function clipAcctView() {
    var accts = clipAccts(), camps = clipCamps();
    return '<p class="hx-mu">One block per platform. Keep each clip account to one niche so the app learns who to show it to.</p>' + CLIP_PLATS.map(function (p) {
      var cs = camps.filter(function (c) { return c.p === p; }), v = 0; cs.forEach(function (c) { v += c.views || 0; });
      return '<div class="hx-row" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:15px">' + E(p) + '</b><span class="hx-mu">' + cs.length + ' campaign' + (cs.length === 1 ? '' : 's') + ' &middot; ' + v.toLocaleString('en-US') + ' views</span></div>' +
        '<input value="' + E(accts[p] || '') + '" placeholder="Your clip account handle" maxlength="60" onchange="hxClipAcct(\'' + p.replace(/'/g, '') + '\',this.value)" ' + clipInput('aria-label="' + E(p) + ' account handle"') + '>' +
        '<ul class="hx-mu" style="margin:8px 0 0 18px;list-style:disc">' + (CLIP_PLAT_TIPS[p] || []).map(function (t) { return '<li style="margin-top:3px">' + E(t) + '</li>'; }).join('') + '</ul>' +
        (cs.length ? '<p class="hx-mu" style="margin-top:6px"><b style="color:#F3E8D6">Campaigns here:</b> ' + cs.map(function (c) { return E(c.n) + ' (' + E(c.st) + ')'; }).join(', ') + '</p>' : '') + '</div>';
    }).join('');
  }
  function clipList(items) { return items.map(function (t) { return '<div class="hx-row" style="display:block"><b style="font-size:14.5px">' + E(t[0]) + '</b><p class="hx-mu" style="margin-top:3px">' + E(t[1]) + '</p></div>'; }).join(''); }
  function clipBody() {
    var cur = clipSub();
    var nav = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 12px">' + CLIP_SUBS.map(function (x) { return '<button class="hx-btn' + (x[0] === cur ? ' pri' : '') + '" onclick="hxClipSub(\'' + x[0] + '\')" aria-pressed="' + (x[0] === cur) + '">' + E(x[1]) + '</button>'; }).join('') + '</div>';
    var body = cur === 'start' ? clipStart() : cur === 'plat' ? clipPlat() : cur === 'camps' ? clipCampsView() : cur === 'accts' ? clipAcctView() : cur === 'tips' ? clipList(CLIP_TIPS) : clipList(CLIP_WATCH);
    return nav + body;
  }
  function clipCard(plain) {
    return '<div class="hx-card' + (plain ? '' : ' fx-tilt hx-in') + '"><div class="hx-k">Digital marketing: clipping for pay</div><p class="hx-mu" style="margin-bottom:2px">This is for clipping other creators, streamers and brands through paid campaigns. It is separate from your own studio content.</p>' + clipBody() + '</div>';
  }
  function clipRefresh() {
    var pg = document.getElementById('clipPage');
    if (pg && pg.offsetParent !== null) { var y = window.scrollY; window.hxClipPage(); window.scrollTo(0, y); }
    else renderHome();
  }
  window.hxClipPage = function () { var pg = document.getElementById('clipPage'); if (pg) pg.innerHTML = clipCard(true); };
  window.hxClipGo = function () { buzz(8); if (isMobile() && pipelineVisible()) window.hxTab('clips'); else if (typeof switchMainView === 'function') switchMainView('clipping'); };

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
    S.cb = [];
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
    var dateTxt = '<span id="hxClock">' + clockTxt() + '</span> &middot; ';
    var strip = '<div class="hx-strip"><div class="hx-hi"><div class="hx-hello">' + greeting() + ', Raeven</div><div class="hx-sub">' + dateTxt + E(levelName(wToday)) + ' &middot; ' + wToday + ' win' + (wToday === 1 ? '' : 's') + ' today</div></div>' +
      '<div class="hx-sr"><div class="hx-pips">' + pips + '</div><div class="hx-flame" title="Day streak">&#128293; ' + stk + '</div>' +
      '<button class="hx-rf hx-lkbtn" onclick="hxLinksGo()" aria-label="Open all your links" title="All your links"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></button>' +
      '<button class="hx-rf hx-clbtn" onclick="hxClipGo()" aria-label="Open clipping for pay" title="Clipping for pay"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/></svg></button>' +
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
        var ti = x.p.clientTasks.indexOf(x.t), od = !x.held && x.t.date < today, td = !x.held && x.t.date === today;
        return '<div class="hx-swipe" data-pid="' + x.p.id + '" data-ti="' + ti + '"><div class="hx-swipe-bg">Done &#10003;</div><div class="hx-row hx-swipe-fg"><input type="checkbox" class="hx-chk" onclick="hxDone(' + x.p.id + ',' + ti + ',event)" aria-label="Mark done"><div style="min-width:0;flex:1"><div style="font-size:14.5px;font-weight:700;color:#F3E8D6">' + E(x.t.title) + (x.held ? ' <span class="hx-chip" style="cursor:default;margin-left:4px">On hold</span>' : '') + '</div><div style="font-size:12px;color:#CDBA99"><a class="hx-a" href="javascript:void(0)" onclick="homeOpen(' + x.p.id + ')">' + E(x.p.org) + '</a> &middot; <span style="' + (od ? 'color:#f0a090;font-weight:800' : td ? 'color:#E3BD79;font-weight:800' : '') + '">' + (od ? 'Overdue ' : td ? 'Today ' : '') + E(x.t.date) + '</span></div></div></div></div>';
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
       ['News and grants', 'Every night at 8:13 PM it checks Georgia schools and AI, talking points, grants and new client leads. Only items that help you are kept.']
      ].map(function (a) { return '<div class="hx-row"><div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:800;color:#F3E8D6">' + E(a[0]) + ' <span class="hx-tag">auto</span></div><div class="hx-mu" style="font-size:12px">' + E(a[1]) + '</div></div></div>'; }).join('') + '</div>';

    var hot = P.filter(function (p) { return p.stage === 'Lead' || p.stage === 'Invoice Pending'; });
    var hotHtml = hot.length ? hot.map(function (p) { var ta = trailAcct(p.id), lr = ta && ta.lastReply, a = (p.activities || [])[0]; var cnt2 = ta ? ta.phases.reduce(function (n, ph) { return n + (ph.items || []).length; }, 0) : 0; return '<div class="hx-row" onclick="homeOpen(' + p.id + ',\'trail\')" style="cursor:pointer"><div style="min-width:0"><a class="hx-a" href="javascript:void(0)">' + E(p.org) + '</a> <span class="hx-tag">' + E(p.stage) + '</span>' + (lr ? '<div class="hx-mu" style="font-size:12px"><b style="color:#E3BD79">' + fmtD(lr.d) + '</b> ' + E(lr.who) + ': ' + E(lr.text) + '</div>' : (a ? '<div class="hx-mu" style="font-size:12px">' + E(a.date) + ': ' + E(a.title) + '</div>' : '')) + (cnt2 ? '<div class="hx-mu" style="font-size:11px;margin-top:2px">' + cnt2 + ' emails logged &middot; tap to read all</div>' : '') + '</div></div>'; }).join('') : '<p class="hx-mu">No replies logged yet.</p>';
    var warm = '<div class="hx-card fx-tilt hx-4 hx-in"><div class="hx-k">Who replied &middot; ' + hot.length + '</div>' + hotHtml + '</div>';

    var comp = (typeof AD_COMP !== 'undefined' ? AD_COMP : []).slice(0, 3).map(function (x) { return '<div class="hx-row"><div><a class="hx-a" href="' + E(x[2]) + '" target="_blank" rel="noopener">' + E(x[0]) + '</a><div class="hx-mu" style="font-size:12px">' + E(x[1]) + '</div></div></div>'; }).join('');
    var take = (typeof AD_TAKE !== 'undefined' ? AD_TAKE : [])[0];
    var compCard = '<div class="hx-card fx-tilt hx-4 hx-in"><div class="hx-k">Competitors and how to win</div>' + comp + (take ? '<p class="hx-mu" style="margin-top:8px"><b style="color:#F3E8D6">Your edge:</b> ' + E(take) + '</p>' : '') + '<a class="hx-a" href="#view=advisor" onclick="switchMainView(\'advisor\')" style="font-size:12px;display:inline-block;margin-top:8px">Open the AI Coach &rarr;</a></div>';

    var verLine = '<div class="hx-ver">Version ' + E(BUILD) + ' &middot; <button onclick="hxRefresh()">Refresh now</button></div>';
    var CARDS = {
      next: function () { return hero; }, goal: function () { return ring; }, river: function () { return river; },
      tasks: function () { return tasksCardFn(mob ? (S.tab === 'board' ? 8 : 3) : 5); },
      quick: function () { return quick; }, warm: function () { return warm; }, autos: function () { return autos; },
      newsga: function () { return newsSection('GA schools', 'Georgia schools and AI', 'Nothing new from Georgia districts that passes the filter.'); },
      newsai: function () { return newsSection('AI in education', 'AI in education: talking points', 'No new talking points today.'); },
      grants: function () { return newsSection('Grants', 'Grants and funding', 'No grants that fit you right now.'); },
      radar: function () { return newsSection('Radar', 'New clients radar and funding shifts', 'Nothing new on the radar.'); },
      files: function () { return filesCard(); }, links: function () { return linksCard(); }, clipping: function () { return clipCard(); }, comp: function () { return compCard; }, marketing: function () { return marketingCard(); },
      coach: function () { return coachCard(m); }, events: function () { return eventsCard(m); }
    };
    var lk = mob ? 'c' : 'w', L = layoutGet(lk), sub = mob ? (TAB_TILES[S.tab] || TAB_TILES.today) : null;
    var avail = L.order.filter(function (id) { return sub ? sub.indexOf(id) >= 0 : (id !== 'links' && id !== 'clipping' && id !== 'files'); });
    var vis = avail.filter(function (id) { return !L.hidden[id]; });
    var hid = avail.filter(function (id) { return L.hidden[id]; });
    var tilesHtml = vis.map(function (id) { return tileHtml(id, CARDS[id](), L); }).join('');
    var body = panelHtml(lk, hid) + '<div class="hx-board">' + (tilesHtml || '<div class="hx-empty">Every card here is hidden. Tap the sliders button at the top to bring them back.</div>') + '</div>' + ((!mob || S.tab === 'today') ? verLine : '');
    box.className = S.edit ? 'hx-editing' : '';
    box.innerHTML = strip + quoteHtml() + body;
    var bd = boardEl(); if (bd) { applySpans(bd); [].forEach.call(bd.querySelectorAll('.hx-tile'), syncTool); fitNow(); observe(bd); }
    countUp(box);
    if (!S.animated && !reduce) { requestAnimationFrame(function () { var fg = box.querySelector('.hx-ring .fg'); if (fg) { void fg.getBoundingClientRect(); fg.style.strokeDashoffset = fg.getAttribute('data-off'); } }); }
    S.animated = true;
    try { drawBar(); } catch (e) {}
  }

  /* ---------- customizable dashboard: tiles, drag, resize, hide, fold ---------- */
  var TILES = [['river', 'Where everyone is'], ['next', 'Do this next'], ['goal', 'Goal'], ['tasks', 'Your list'], ['quick', 'Quick actions'],
    ['warm', 'Who replied'], ['autos', 'Running for you'], ['newsga', 'Georgia schools and AI'], ['newsai', 'AI talking points'], ['grants', 'Grants and funding'], ['radar', 'New clients radar'], ['comp', 'Competitors'], ['marketing', 'Studio content'], ['links', 'All your links'], ['files', 'Your files'], ['clipping', 'Clipping for pay'], ['coach', 'Coach'], ['events', 'Coming up']];
  var TLABEL = {}; TILES.forEach(function (t) { TLABEL[t[0]] = t[1]; });
  var SIZES = ['S', 'M', 'L', 'F'];
  var TAB_TILES = { today: ['coach', 'next', 'tasks', 'events', 'quick', 'goal', 'autos'], board: ['river', 'warm', 'tasks'], clips: ['clipping', 'marketing'], links: ['files', 'links'], intel: ['grants', 'radar', 'newsga', 'newsai', 'comp'] };
  var LKEY = { w: 'bgcs_home_layout', c: 'bgcs_home_layout_c' };
  var DEFL = {
    w: { order: ['coach', 'river', 'next', 'goal', 'events', 'tasks', 'quick', 'warm', 'autos', 'grants', 'radar', 'newsga', 'newsai', 'comp', 'marketing', 'links', 'files', 'clipping'],
         size: { coach: 'L', events: 'M', river: 'F', next: 'L', goal: 'S', tasks: 'L', quick: 'S', warm: 'S', autos: 'S', grants: 'M', radar: 'M', newsga: 'M', newsai: 'M', comp: 'S', marketing: 'F', links: 'F', files: 'F', clipping: 'F' } },
    c: { order: ['coach', 'next', 'tasks', 'events', 'quick', 'goal', 'autos', 'river', 'warm', 'grants', 'radar', 'newsga', 'newsai', 'comp', 'clipping', 'marketing', 'files', 'links'],
         size: { coach: 'F', events: 'F', next: 'F', tasks: 'F', quick: 'M', goal: 'M', autos: 'F', river: 'F', warm: 'F', grants: 'F', radar: 'F', newsga: 'F', newsai: 'F', comp: 'F', marketing: 'F', links: 'F', files: 'F', clipping: 'F' } }
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
    ['events', 'coach'].forEach(function (id) { if (L.order.indexOf(id) < 0 && d.order.indexOf(id) >= 0) L.order.unshift(id); });
    if (L.order.indexOf('files') < 0) { var fi = L.order.indexOf('links'); if (fi >= 0) L.order.splice(fi, 0, 'files'); }
    if (L.order.indexOf('clipping') < 0) { var mi = L.order.indexOf('marketing'); if (mi >= 0) L.order.splice(mi, 0, 'clipping'); }
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
    if (name === 'focus') (k === 'w' ? ['newsga', 'newsai', 'radar', 'comp', 'autos', 'marketing'] : ['comp', 'autos']).forEach(function (id) { L.hidden[id] = 1; });
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
      '<button class="hx-tbb hx-mv" data-hxa="up" aria-label="Move ' + lab + ' up">&#9650;</button><button class="hx-tbb hx-mv" data-hxa="down" aria-label="Move ' + lab + ' down">&#9660;</button><button class="hx-tbb hx-mv" data-hxa="top" aria-label="Move ' + lab + ' to the top">Top</button>' +
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
    } else if (act === 'top' && tile) {
      moveTop(tile);
    } else if (act === 'preset') {
      layoutSave(k, presetLayout(k, b.getAttribute('data-v'))); renderHome(); toast('Layout applied');
    } else if (act === 'reset') {
      ls.set(LKEY[k], 'null'); renderHome(); toast('Back to the original layout');
    } else if (act === 'done') {
      setEdit(false); try { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); } catch (e2) {}
    }
  });
  function rectKey(t) { var r = t.getBoundingClientRect(); return Math.round(r.left) + ':' + Math.round(r.top + window.scrollY); }
  function flash(tile) { tile.classList.remove('hx-flash'); void tile.offsetWidth; tile.classList.add('hx-flash'); setTimeout(function () { tile.classList.remove('hx-flash'); }, 1100); }
  function moveTile(tile, dir, focusGrip) {
    var board = boardEl(); if (!board) return;
    var before = rectKey(tile), moved = false, guard = 0;
    while (guard++ < 12) {
      var ts = tilesOf(board), i = ts.indexOf(tile), j = i + dir; if (i < 0 || j < 0 || j >= ts.length) break;
      if (dir < 0) board.insertBefore(tile, ts[j]); else board.insertBefore(ts[j], tile);
      applySpans(board); fitNow(); moved = true;
      if (rectKey(tile) !== before) break;
    }
    persistOrder(board); applySpans(board); fitNow();
    try { tile.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
    flash(tile);
    if (!moved || rectKey(tile) === before) toast(dir < 0 ? 'Already at the top' : 'Already at the bottom');
    if (focusGrip) { var g = tile.querySelector('.hx-grip'); if (g) g.focus({ preventScroll: true }); }
  }
  function moveTop(tile) {
    var board = boardEl(); if (!board) return;
    var ts = tilesOf(board); if (ts[0] === tile) { toast('Already at the top'); flash(tile); return; }
    board.insertBefore(tile, ts[0]); persistOrder(board); applySpans(board); fitNow();
    try { tile.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
    flash(tile); toast('Moved to the top');
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
    ['clips', 'Clipping', '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>'],
    ['links', 'Files', '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'],
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
  try { window.hxLinksPage(); window.hxClipPage(); window.hxFilesPage(); } catch (e) {}
  loadNews();
  setInterval(loadNews, 15 * 60 * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { try { renderHome(); } catch (e) {} } });
  window.addEventListener('storage', function () { try { renderHome(); } catch (e) {} });
})();
