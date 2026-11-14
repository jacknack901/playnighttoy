(function(){
  'use strict';

  var VERSION='27.17.1-headless';
  var current=document.currentScript;
  var PAGE=String((current&&current.getAttribute('data-page'))||'').toLowerCase();
  if(PAGE!=='home'&&PAGE!=='shop'){
    PAGE=/shop\.html/i.test(location.pathname)?'shop':'home';
  }

  var GAS_URL=String(window.WANWAN_GAS_EXEC_URL||'').trim();
  var VISITOR_KEY='wanye_public_visitor_id_v27170';
  var SENT_PREFIX='wanye_public_visitor_sent_v27171_';

  function taipeiDay(){
    try{
      return new Intl.DateTimeFormat('en-CA',{
        timeZone:'Asia/Taipei',
        year:'numeric',month:'2-digit',day:'2-digit'
      }).format(new Date());
    }catch(e){
      var d=new Date();
      return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    }
  }

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

  function sentKey(){
    return SENT_PREFIX+PAGE+'_'+taipeiDay();
  }

  function alreadySentToday(){
    try{return localStorage.getItem(sentKey())==='1';}
    catch(e){
      try{return sessionStorage.getItem(sentKey())==='1';}
      catch(_){return false;}
    }
  }

  function markSentToday(){
    try{
      localStorage.setItem(sentKey(),'1');
      return;
    }catch(e){}
    try{sessionStorage.setItem(sentKey(),'1');}catch(_){}
  }

  function jsonp(action,args,ok,fail){
    if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(GAS_URL)){
      if(typeof fail==='function')fail(new Error('GAS URL 未設定'));
      return;
    }

    var cb='__wanye_visit_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
    var script=document.createElement('script');
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
      try{script.remove();}catch(e){}
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

    script.async=true;
    script.onerror=function(){
      if(done)return;
      done=true;
      cleanup();
      if(typeof fail==='function')fail(new Error('visitor network failed'));
    };

    var sep=GAS_URL.indexOf('?')>=0?'&':'?';
    script.src=GAS_URL+sep+
      'bridge=jsonp&action='+encodeURIComponent(action)+
      '&args='+encodeURIComponent(JSON.stringify(args||[]))+
      '&callback='+encodeURIComponent(cb)+
      '&_='+Date.now();

    document.head.appendChild(script);
  }

  function track(){
    // 完全隱藏：不建立任何前台統計 UI。
    if(alreadySentToday())return;

    jsonp('getPublicDailyVisitorV27170',[PAGE,getVisitorId()],function(){
      markSentToday();
    },function(){
      // 統計失敗不影響官網／商城。
    });
  }

  function start(){
    if('requestIdleCallback' in window){
      requestIdleCallback(track,{timeout:2500});
    }else{
      setTimeout(track,1200);
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',start,{once:true});
  }else{
    start();
  }

  window.WANYE_VISITOR_STATS_VERSION=VERSION;
})();