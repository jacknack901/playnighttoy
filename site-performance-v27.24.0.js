/* 頑夜 TOY｜全站效能與動效 v27.24.0 */
(function(){
  'use strict';
  if(window.__WANYE_PERF_V27240)return;
  window.__WANYE_PERF_V27240=1;

  var reduce=false;
  try{reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}

  function injectCss(){
    if(document.getElementById('wanyePerfStyleV27240'))return;
    var s=document.createElement('style');
    s.id='wanyePerfStyleV27240';
    s.textContent=[
      ':root{--wanye-ease:cubic-bezier(.22,.78,.26,1)}',
      'html{scroll-behavior:smooth}',
      'body{transition:opacity .18s ease}',
      '.wanye-page-enter{animation:wanyePageIn .28s var(--wanye-ease) both}',
      '@keyframes wanyePageIn{from{opacity:.72}to{opacity:1}}',
      '.wanye-reveal{opacity:0;transform:translate3d(0,14px,0);transition:opacity .42s var(--wanye-ease),transform .42s var(--wanye-ease)}',
      '.wanye-reveal.wanye-visible{opacity:1;transform:none}',
      '.wanye-fast-reveal{animation:wanyeCardIn .32s var(--wanye-ease) both}',
      '@keyframes wanyeCardIn{from{opacity:0;transform:translate3d(0,10px,0) scale(.992)}to{opacity:1;transform:none}}',
      'button,a,.btn,.typeTab,.chip,.headBtn{transition:transform .15s ease,box-shadow .2s ease,background-color .2s ease,border-color .2s ease,opacity .2s ease}',
      'button:active,.btn:active,.typeTab:active,.chip:active,.headBtn:active{transform:scale(.975)}',
      'img{transition:opacity .28s ease,transform .38s var(--wanye-ease)}',
      'img.wanye-img-loading{opacity:.12}',
      'img.wanye-img-ready{opacity:1}',
      '.wanye-loading-shimmer{position:relative;overflow:hidden!important;min-height:54px}',
      '.wanye-loading-shimmer:after{content:"";position:absolute;inset:0;transform:translateX(-110%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.68),transparent);animation:wanyeShimmer 1.25s infinite}',
      '@keyframes wanyeShimmer{to{transform:translateX(110%)}}',
      '.card,.productCard,.eventCard,.prize,.flowBlock,.sectionCard{content-visibility:auto;contain-intrinsic-size:1px 320px}',
      '.modal,.cartPanelV27136,.selectorModal{content-visibility:visible}',
      '@media(max-width:720px){.wanye-reveal{transform:translate3d(0,9px,0)}}',
      '@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}.wanye-page-enter,.wanye-fast-reveal,.wanye-loading-shimmer:after{animation:none!important}.wanye-reveal{opacity:1!important;transform:none!important;transition:none!important}*{scroll-behavior:auto!important}}'
    ].join('');
    document.head.appendChild(s);
  }

  var revealObserver=null;
  function ensureRevealObserver(){
    if(reduce||revealObserver||!('IntersectionObserver' in window))return;
    revealObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting)return;
        entry.target.classList.add('wanye-visible');
        revealObserver.unobserve(entry.target);
      });
    },{rootMargin:'90px 0px',threshold:.025});
  }

  function optimizeImage(img,index){
    if(!img||img.dataset.wanyePerf==='1')return;
    img.dataset.wanyePerf='1';
    img.decoding='async';
    var rect=null;
    try{rect=img.getBoundingClientRect();}catch(e){}
    var nearTop=rect&&rect.top<window.innerHeight*1.2;
    if(!nearTop && !img.hasAttribute('loading'))img.loading='lazy';
    if(!nearTop)try{img.fetchPriority='low';}catch(e){}
    if(!img.complete){
      img.classList.add('wanye-img-loading');
      img.addEventListener('load',function(){
        img.classList.remove('wanye-img-loading');
        img.classList.add('wanye-img-ready');
      },{once:true});
      img.addEventListener('error',function(){img.classList.remove('wanye-img-loading');},{once:true});
    }else{
      img.classList.add('wanye-img-ready');
    }
  }

  function isRevealTarget(el){
    if(!el||el.nodeType!==1)return false;
    return el.matches&&el.matches('.card,.productCard,.eventCard,.ipCard,.prize,.trustItem,.featuredFrame,.sectionCard,.flowBlock,.lookupOrderV27136');
  }

  function process(root){
    root=root||document;
    var imgs=[];
    if(root.matches&&root.matches('img'))imgs=[root];
    else if(root.querySelectorAll)imgs=Array.prototype.slice.call(root.querySelectorAll('img'));
    imgs.forEach(optimizeImage);

    var els=[];
    if(isRevealTarget(root))els=[root];
    else if(root.querySelectorAll)els=Array.prototype.slice.call(root.querySelectorAll('.card,.productCard,.eventCard,.ipCard,.prize,.trustItem,.featuredFrame,.sectionCard,.flowBlock,.lookupOrderV27136'));
    ensureRevealObserver();
    els.forEach(function(el,i){
      if(el.dataset.wanyeReveal==='1')return;
      el.dataset.wanyeReveal='1';
      if(reduce){el.classList.add('wanye-visible');return;}
      if(i<4 && el.getBoundingClientRect().top<window.innerHeight*1.15){
        el.classList.add('wanye-fast-reveal');
      }else if(revealObserver){
        el.classList.add('wanye-reveal');
        revealObserver.observe(el);
      }
    });

    if(root.querySelectorAll){
      Array.prototype.forEach.call(root.querySelectorAll('.empty,.stateBox,.ipEmpty'),function(el){
        var t=String(el.textContent||'');
        el.classList.toggle('wanye-loading-shimmer',/載入中|讀取中|同步中|請稍候/.test(t));
      });
    }
  }

  var pending=false,queue=[];
  function queueProcess(node){
    queue.push(node||document);
    if(pending)return;
    pending=true;
    requestAnimationFrame(function(){
      pending=false;
      var q=queue.splice(0);
      q.slice(-20).forEach(process);
    });
  }

  function prefetchLink(a){
    if(!a||a.dataset.wanyePrefetched==='1')return;
    var href=a.href||'';
    if(!href||href.indexOf(location.origin)!==0)return;
    if(!/\.html(?:[?#]|$)|\/$/.test(href))return;
    a.dataset.wanyePrefetched='1';
    var l=document.createElement('link');
    l.rel='prefetch';l.href=href;l.as='document';
    document.head.appendChild(l);
  }

  function init(){
    injectCss();
    document.body.classList.add('wanye-page-enter');
    process(document);

    if('MutationObserver' in window){
      new MutationObserver(function(muts){
        muts.forEach(function(m){
          Array.prototype.forEach.call(m.addedNodes||[],function(n){if(n&&n.nodeType===1)queueProcess(n);});
        });
      }).observe(document.body,{childList:true,subtree:true});
    }

    document.addEventListener('pointerover',function(e){
      var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
      if(a)prefetchLink(a);
    },{passive:true});

    window.addEventListener('pageshow',function(){document.body.style.opacity='1';},{passive:true});
  }

  window.WANYE_IDLE=function(fn,timeout){
    if('requestIdleCallback' in window)return requestIdleCallback(fn,{timeout:timeout||1200});
    return setTimeout(fn,Math.min(timeout||600,600));
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();