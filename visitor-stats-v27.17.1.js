(function(){
  'use strict';

  if(window.__WANYE_VISITOR_V27150)return;
  window.__WANYE_VISITOR_V27150=1;

  var current=document.currentScript;
  var PAGE=String((current&&current.getAttribute('data-page'))||'').toLowerCase();
  if(PAGE!=='home'&&PAGE!=='shop') PAGE=/shop\.html/i.test(location.pathname)?'shop':'home';

  var GAS_URL=String(window.WANWAN_GAS_EXEC_URL||'').trim();
  var KEY='wanye_public_visitor_id_v27150';

  function visitorId(){
    try{
      var id=localStorage.getItem(KEY);
      if(id&&id.length>=16)return id;
      id=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():
        ('wv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2));
      localStorage.setItem(KEY,id);
      return id;
    }catch(e){
      try{
        var sid=sessionStorage.getItem(KEY);
        if(sid)return sid;
        sid='wvs-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
        sessionStorage.setItem(KEY,sid);
        return sid;
      }catch(_){
        return 'ep-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      }
    }
  }

  function ping(retry){
    if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(GAS_URL))return;

    var cb='__wanye_vping_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
    var script=document.createElement('script');
    var done=false;
    var timer=setTimeout(function(){
      if(done)return;
      done=true;
      cleanup();
      if(!retry)setTimeout(function(){ping(true);},3500);
    },10000);

    function cleanup(){
      clearTimeout(timer);
      try{delete window[cb];}catch(e){window[cb]=undefined;}
      try{script.remove();}catch(e){}
    }

    window[cb]=function(){
      if(done)return;
      done=true;
      cleanup();
    };

    script.onerror=function(){
      if(done)return;
      done=true;
      cleanup();
      if(!retry)setTimeout(function(){ping(true);},3500);
    };

    var sep=GAS_URL.indexOf('?')>=0?'&':'?';
    script.src=GAS_URL+sep+
      'visitorPing=1'+
      '&page='+encodeURIComponent(PAGE)+
      '&vid='+encodeURIComponent(visitorId())+
      '&callback='+encodeURIComponent(cb)+
      '&_='+Date.now();

    document.head.appendChild(script);
  }

  function start(){setTimeout(function(){ping(false);},500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
