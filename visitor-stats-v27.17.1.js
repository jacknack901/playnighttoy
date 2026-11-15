(function(){
  'use strict';

  if(window.__WANYE_VISITOR_TRACKING_V27172)return;
  window.__WANYE_VISITOR_TRACKING_V27172=1;

  var VERSION='27.17.2-reliable';
  var current=document.currentScript;
  var PAGE=String((current&&current.getAttribute('data-page'))||'').toLowerCase();
  if(PAGE!=='home'&&PAGE!=='shop'){
    PAGE=/shop\.html/i.test(location.pathname)?'shop':'home';
  }

  var GAS_URL=String(window.WANWAN_GAS_EXEC_URL||'').trim();
  var VISITOR_KEY='wanye_public_visitor_id_v27170';

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

  function sendJsonp(ok,fail){
    if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(GAS_URL)){
      if(typeof fail==='function')fail();
      return;
    }

    var cb='__wanye_visit_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
    var el=document.createElement('script');
    var done=false;
    var timer=setTimeout(function(){
      if(done)return;
      done=true;
      cleanup();
      if(typeof fail==='function')fail();
    },12000);

    function cleanup(){
      clearTimeout(timer);
      try{delete window[cb];}catch(e){window[cb]=undefined;}
      try{el.remove();}catch(e){}
    }

    window[cb]=function(res){
      if(done)return;
      done=true;
      cleanup();
      if(res&&res.ok===true){
        if(typeof ok==='function')ok(res.data||{});
      }else if(typeof fail==='function'){
        fail();
      }
    };

    el.async=true;
    el.onerror=function(){
      if(done)return;
      done=true;
      cleanup();
      if(typeof fail==='function')fail();
    };

    var sep=GAS_URL.indexOf('?')>=0?'&':'?';
    el.src=GAS_URL+sep+
      'bridge=jsonp&action=getPublicDailyVisitorV27170'+
      '&args='+encodeURIComponent(JSON.stringify([PAGE,getVisitorId()]))+
      '&callback='+encodeURIComponent(cb)+
      '&_='+Date.now();

    document.head.appendChild(el);
  }

  function track(){
    // v27.17.2：
    // 每次進頁都送一次，真正是否 +1 由 Apps Script 伺服器去重。
    // 因此重新整理不會增加人數，但也不會被舊 localStorage 標記卡住。
    sendJsonp(function(){},function(){
      // 第一次失敗，5 秒後只重試一次。
      setTimeout(function(){sendJsonp(function(){},function(){});},5000);
    });
  }

  function start(){
    setTimeout(track,350);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }

  window.WANYE_VISITOR_STATS_VERSION=VERSION;
})();