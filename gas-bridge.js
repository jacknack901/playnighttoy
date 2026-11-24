(function(){
  'use strict';
  let seq=0;
  function endpoint(){return String(window.WANWAN_GAS_EXEC_URL||'').trim();}
  function jsonp(action,args,timeout){
    return new Promise(function(resolve,reject){
      const url=endpoint(); if(!url){reject(new Error('尚未設定 GAS 網址'));return;}
      const cb='__wanye_cb_'+Date.now()+'_'+(++seq);
      const s=document.createElement('script');
      const timer=setTimeout(clean,timeout||18000);
      function clean(err){clearTimeout(timer);try{delete window[cb]}catch(e){};if(s.parentNode)s.parentNode.removeChild(s);if(err)reject(err);}
      window[cb]=function(payload){clearTimeout(timer);try{delete window[cb]}catch(e){};if(s.parentNode)s.parentNode.removeChild(s);if(payload&&payload.ok){resolve(payload.data)}else reject(new Error(payload&&payload.error||'讀取失敗'));};
      s.onerror=function(){clean(new Error('連線失敗'));};
      const q=new URLSearchParams({bridge:'jsonp',callback:cb,action:String(action||''),args:JSON.stringify(Array.isArray(args)?args:[])});
      s.src=url+'?'+q.toString(); document.head.appendChild(s);
    });
  }
  function write(action,args,timeout){
    return new Promise(function(resolve,reject){
      const url=endpoint(); if(!url){reject(new Error('尚未設定 GAS 網址'));return;}
      const requestId='v281_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const iframe=document.createElement('iframe'); iframe.name='wanye_rpc_'+requestId; iframe.style.display='none'; document.body.appendChild(iframe);
      const form=document.createElement('form'); form.method='POST'; form.action=url; form.target=iframe.name; form.style.display='none';
      const fields={bridge:'form',action:String(action||''),args:JSON.stringify(Array.isArray(args)?args:[]),requestId:requestId};
      Object.keys(fields).forEach(k=>{const i=document.createElement('input');i.type='hidden';i.name=k;i.value=fields[k];form.appendChild(i)}); document.body.appendChild(form);
      let done=false; const max=timeout||22000; const started=Date.now();
      function finish(err,data){if(done)return;done=true;try{form.remove();iframe.remove()}catch(e){};err?reject(err):resolve(data);}
      form.submit();
      (function poll(){ if(Date.now()-started>max){finish(new Error('送出逾時，請再試一次'));return;} jsonp('getPublicFormRpcAckV271210',[requestId],6000).then(r=>{if(r&&r.ready){const p=r.payload||{};if(p.ok)finish(null,p.data);else finish(new Error(p.error||'送出失敗'));}else setTimeout(poll,550);}).catch(()=>setTimeout(poll,700)); })();
    });
  }
  window.WANYE_RPC={read:jsonp,write:write};
})();