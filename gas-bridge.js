(function(){
  'use strict';
  var GAS_URL=String(window.WANWAN_GAS_EXEC_URL||'').trim();
  var READ={
    getPublicKujiVersionV260:1,getPublicKujiList:1,getPublicCommerceV260:1,
    getPublicSoldKujiListV260:1,getPublicKuji:1,getPublicShopPageV270:1,getPublicShopProductV270:1
  };
  var WRITE={
    submitRaffleSignupV2587:1,submitKujiActivitySignupV2544:1,submitPublicPreorderV2544:1,
    submitKujiGroupPaymentV2523:1,submitShopInquiryV267:1,submitShopOrderV266:1
  };
  var seq=0;

  function cfgError(fail){
    var msg='尚未設定 Apps Script /exec 網址，請先修改 config.js。';
    if(typeof fail==='function') fail({message:msg}); else if(window.console) console.error(msg);
  }
  function cleanupScript(script,cb){
    try{ if(script&&script.parentNode) script.parentNode.removeChild(script); }catch(e){}
    try{ delete window[cb]; }catch(e){ window[cb]=undefined; }
  }
  function runJsonpUrl(url,ok,fail){
    var cbMatch=url.match(/[?&]callback=([^&]+)/);
    var cb=cbMatch?decodeURIComponent(cbMatch[1]):('__wanye_jsonp_'+Date.now()+'_'+(++seq));
    var script=document.createElement('script');
    var done=false;
    var timer=setTimeout(function(){
      if(done)return;done=true;cleanupScript(script,cb);
      if(typeof fail==='function')fail({message:'讀取逾時，請稍後再試。'});
    },25000);
    window[cb]=function(res){
      if(done)return;done=true;clearTimeout(timer);cleanupScript(script,cb);
      if(!res||res.ok!==true){ if(typeof fail==='function') fail({message:(res&&res.error)||'讀取失敗。'}); return; }
      if(typeof ok==='function') ok(res.data);
    };
    script.async=true;
    script.onerror=function(){
      if(done)return;done=true;clearTimeout(timer);cleanupScript(script,cb);
      if(typeof fail==='function')fail({message:'Apps Script GET 讀取失敗。'});
    };
    script.src=url;
    document.head.appendChild(script);
  }
  function legacyKujiJsonp(action,args,ok,fail){
    var cb='__wanye_legacy_'+Date.now()+'_'+(++seq);
    var sep=GAS_URL.indexOf('?')>=0?'&':'?';
    var url=GAS_URL+sep+'callback='+encodeURIComponent(cb)+'&_='+Date.now();
    if(action==='getPublicKujiList'){
      url+='&api=kuji-list';
    }else if(action==='getPublicKuji'){
      url+='&api=kuji&k='+encodeURIComponent((args&&args[0])||'');
    }else{
      if(typeof fail==='function') fail({message:'不支援的舊版一番賞讀取。'});
      return;
    }
    runJsonpUrl(url,ok,fail);
  }
  function jsonp(action,args,ok,fail){
    if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(GAS_URL)) return cfgError(fail);
    // v27.1.2：一番賞優先走原本既有的公開 JSONP API，兼容尚未更新到 v27.1 的 Apps Script 部署。
    if(action==='getPublicKujiList'||action==='getPublicKuji'){
      return legacyKujiJsonp(action,args,ok,function(){
        jsonpBridge(action,args,ok,fail);
      });
    }
    return jsonpBridge(action,args,ok,fail);
  }
  function jsonpBridge(action,args,ok,fail){
    var cb='__wanye_jsonp_'+Date.now()+'_'+(++seq);
    var sep=GAS_URL.indexOf('?')>=0?'&':'?';
    var url=GAS_URL+sep+'bridge=jsonp&action='+encodeURIComponent(action)+'&args='+encodeURIComponent(JSON.stringify(Array.isArray(args)?args:[]))+'&callback='+encodeURIComponent(cb)+'&_='+Date.now();
    runJsonpUrl(url,ok,fail);
  }
  function formPost(action,args,ok,fail){
    if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(GAS_URL)) return cfgError(fail);
    var requestId='BR-'+Date.now()+'-'+(++seq)+'-'+Math.random().toString(36).slice(2,9);
    var frame=document.createElement('iframe');
    frame.name='wanye_bridge_'+requestId;
    frame.style.display='none';
    frame.setAttribute('aria-hidden','true');
    document.body.appendChild(frame);
    var form=document.createElement('form');
    form.method='POST'; form.action=GAS_URL; form.target=frame.name; form.style.display='none';
    function input(name,value){var x=document.createElement('input');x.type='hidden';x.name=name;x.value=value;form.appendChild(x);}
    input('bridge','form'); input('action',action); input('args',JSON.stringify(Array.isArray(args)?args:[])); input('requestId',requestId);
    document.body.appendChild(form);
    var done=false;
    function finish(){
      window.removeEventListener('message',onmsg);
      try{form.remove();}catch(e){}
      setTimeout(function(){try{frame.remove();}catch(e){}},50);
    }
    function onmsg(ev){
      var m=ev&&ev.data;
      if(!m||m.__wanyeBridgeV271!==true||m.requestId!==requestId)return;
      if(done)return;done=true;clearTimeout(timer);finish();
      var res=m.payload||{};
      if(res.ok===true){if(typeof ok==='function')ok(res.data);}else if(typeof fail==='function')fail({message:res.error||'送出失敗。'});
    }
    window.addEventListener('message',onmsg);
    var timer=setTimeout(function(){
      if(done)return;done=true;finish();
      if(typeof fail==='function')fail({message:'送出逾時，請確認網路後再試；若已成功送出請勿重複操作。'});
    },30000);
    try{form.submit();}catch(err){
      if(done)return;done=true;clearTimeout(timer);finish();
      if(typeof fail==='function')fail({message:err&&err.message?err.message:'送出失敗。'});
    }
  }
  function rpc(action,args,ok,fail){
    if(READ[action]) return jsonp(action,args,ok,fail);
    if(WRITE[action]) return formPost(action,args,ok,fail);
    if(typeof fail==='function') fail({message:'不支援的公開功能：'+action});
  }
  function makeRunner(success,failure){
    var runner={
      withSuccessHandler:function(fn){return makeRunner(fn,failure);},
      withFailureHandler:function(fn){return makeRunner(success,fn);}
    };
    return new Proxy(runner,{get:function(target,prop){
      if(prop in target)return target[prop];
      return function(){rpc(String(prop),Array.prototype.slice.call(arguments),success,failure);return runner;};
    }});
  }
  window.google=window.google||{};
  window.google.script=window.google.script||{};
  Object.defineProperty(window.google.script,'run',{configurable:true,get:function(){return makeRunner(null,null);}});
})();
