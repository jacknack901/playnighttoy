/* v28.11.18 | Daily unique visitor reporting; independent of catalogue loading. */
(function(){
'use strict';
const page=document.body?.dataset.page;if(!['home','shop'].includes(page)||location.protocol==='file:'||['localhost','127.0.0.1'].includes(location.hostname))return;
const ID_KEY='wanye:visitor-id:v281118',ACK_KEY='wanye:visitor-ack:v281118:'+page;
const FALLBACK="https://script.google.com/macros/s/AKfycbxLJqANquTNnLlY7Zb5tR851EobSPTAsVho5SxYjBv2quX-B7uOqyBEcj5BdG5m8xw/exec";
let memoryId='',memoryAck='',timer=0,inFlight=false,failures=0;
function get(k){try{return localStorage.getItem(k)||''}catch(e){return ''}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function day(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function visitorId(){let id=get(ID_KEY)||memoryId;if(id.length<8){id=typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():'v-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-'+Math.random().toString(36).slice(2);set(ID_KEY,id)}memoryId=id;return id}
function schedule(ms){clearTimeout(timer);if(!document.hidden)timer=setTimeout(report,ms)}
function report(){
if(document.hidden||inFlight)return;
const today=day();if((get(ACK_KEY)||memoryAck)===today){schedule(60000);return}
const url=String(window.WANWAN_GAS_EXEC_URL||FALLBACK).trim();if(!url){schedule(15000);return}
inFlight=true;const cb='__wanye_visit_'+Date.now()+'_'+Math.random().toString(36).slice(2),s=document.createElement('script');
let done=false,timeout=0;
function finish(payload){if(done)return;done=true;clearTimeout(timeout);delete window[cb];s.remove();inFlight=false;const d=payload?.data;if(payload?.ok===true&&d?.page===page&&/^\d{4}-\d{2}-\d{2}$/.test(String(d.date||''))){memoryAck=String(d.date);set(ACK_KEY,memoryAck);failures=0;schedule(60000)}else{failures++;schedule(Math.min(120000,15000*Math.pow(2,Math.min(3,failures-1))))}}
window[cb]=finish;s.async=true;s.onerror=()=>finish(null);timeout=setTimeout(()=>finish(null),18000);const q=new URLSearchParams({visitorPing:'1',page,vid:visitorId(),callback:cb});s.src=url+(url.includes('?')?'&':'?')+q.toString();document.head.appendChild(s);
}
function wake(){clearTimeout(timer);if(!document.hidden&&!inFlight)schedule(600)}
document.addEventListener('visibilitychange',wake);window.addEventListener('pageshow',wake);window.addEventListener('online',wake);
wake();
})();