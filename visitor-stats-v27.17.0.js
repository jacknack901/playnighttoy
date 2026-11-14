(function(){
  'use strict';

  var VERSION='27.17.0';
  var script=document.currentScript;
  var PAGE=String((script&&script.getAttribute('data-page'))||'').toLowerCase();
  if(PAGE!=='home'&&PAGE!=='shop')PAGE=(/shop\.html/i.test(location.pathname)?'shop':'home');

  var GAS_URL=String(window.WANWAN_GAS_EXEC_URL||'').trim();
  var VISITOR_KEY='wanye_public_visitor_id_v27170';
  var DISPLAY_ID='wanyeTodayVisitorsV27170';

  function getVisitorId(){
    try{
      var id=localStorage.getItem(VISITOR_KEY);
      if(id&&id.length>=16)return id;
      if(window.crypto&&typeof window.crypto.randomUUID==='function'){
        id=window.crypto.randomUUID();
      }else{
        id='wv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
      }
      localStorage.setItem(VISITOR_KEY,id);
      return id;
    }catch(e){
      // localStorage 被封鎖時，以 sessionStorage 優先，至少重新整理不重算。
      try{
        var sid=sessionStorage.getItem(VISITOR_KEY);
        if(sid)return sid;
        sid='wvs-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
        sessionStorage.setItem(VISITOR_KEY,sid);
        return sid;
      }catch(_){
        return 'ephemeral-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      }
    }
  }

  function ensureDisplay(){
    var el=document.getElementById(DISPLAY_ID);
    if(el)return el;

    el=document.createElement('div');
    el.id=DISPLAY_ID;
    el.setAttribute('aria-label','本日瀏覽人數');
    el.title='本日唯一瀏覽｜同一瀏覽器重複進入或重新整理不重複計算';
    el.style.cssText=[
      'max-width:1180px',
      'margin:14px auto 8px',
      'padding:0 16px',
      'text-align:right',
      'font-size:10px',
      'line-height:1.4',
      'letter-spacing:.02em',
      'opacity:.28',
      'color:inherit',
      'user-select:none',
      'transition:opacity .18s ease'
    ].join(';');

    el.textContent='今日瀏覽 —';
    el.addEventListener('mouseenter',function(){el.style.opacity='.62';});
    el.addEventListener('mouseleave',function(){el.style.opacity='.28';});
    document.body.appendChild(el);
    return el;
  }

  function setCount(n){
    var el=ensureDisplay();
    n=Number(n||0);
    el.textContent='今日瀏覽 '+Math.max(0,Math.floor(n)).toLocaleString('zh-TW');
  }

  function jsonp(action,args,ok,fail){
    if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(GAS_URL)){
      if(typeof fail==='function')fail(new Error('GAS URL 未設定'));
      return;
    }

    var cb='__wanye_visit_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
    var scriptEl=document.createElement('script');
    var done=false;
    var timer=setTimeout(function(){
      if(done)return;
      done=true;
      cleanup();
      if(typeof fail==='function')fail(new Error('visitor timeout'));
    },12000);

    function cleanup(){
      clearTimeout(timer);
      try{delete window[cb];}catch(e){window[cb]=undefined;}
      try{scriptEl.remove();}catch(e){}
    }

    window[cb]=function(res){
      if(done)return;
      done=true;
      cleanup();
      if(res&&res.ok===true){
        if(typeof ok==='function')ok(res.data||{});
      }else if(typeof fail==='function'){
        fail(new Error((res&&res.error)||'visitor api failed'));
      }
    };

    scriptEl.async=true;
    scriptEl.onerror=function(){
      if(done)return;
      done=true;
      cleanup();
      if(typeof fail==='function')fail(new Error('visitor network failed'));
    };

    var sep=GAS_URL.indexOf('?')>=0?'&':'?';
    scriptEl.src=GAS_URL+sep+
      'bridge=jsonp&action='+encodeURIComponent(action)+
      '&args='+encodeURIComponent(JSON.stringify(args||[]))+
      '&callback='+encodeURIComponent(cb)+
      '&_='+Date.now();

    document.head.appendChild(scriptEl);
  }

  function track(){
    ensureDisplay();

    // 讓首頁主要內容先載，瀏覽統計延後，不拖慢首屏。
    var visitorId=getVisitorId();

    jsonp('getPublicDailyVisitorV27170',[PAGE,visitorId],function(res){
      if(!res)return;
      var count=PAGE==='shop'?Number(res.shop||0):Number(res.home||0);
      setCount(count);
    },function(){
      // 統計失敗不影響網站功能，也不顯示錯誤給客人。
    });
  }

  function start(){
    ensureDisplay();
    if('requestIdleCallback' in window){
      requestIdleCallback(track,{timeout:2500});
    }else{
      setTimeout(track,1200);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();

  window.WANYE_VISITOR_STATS_VERSION=VERSION;
})();
