(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function rpc(name,args=[]){
  if(typeof window.rpcRead==='function')return window.rpcRead(name,args);
  if(!window.WANYE_RPC&&typeof window.ensureRpcV281109==='function')await window.ensureRpcV281109();
  if(!window.WANYE_RPC)throw Error('RPC 尚未載入');
  return WANYE_RPC.read(name,args,30000);
}
function rows(raw){
  const a=raw&&Array.isArray(raw.items)?raw.items:(Array.isArray(raw)?raw:[]);
  return a.filter(x=>{
    if(!x||String(x.publicMode||'')==='group'||x.closed)return false;
    const s=String(x.status||'');
    if(/暫停|下架|關閉|結束|截止/.test(s))return false;
    return true;
  });
}
function card(x){
  const total=Math.max(0,Number(x.totalDraws??x.total??x.initialCount??0));
  const remain=Math.max(0,Number(x.remaining??x.remainingCount??total));
  const major=Math.max(0,Number(x.majorRemaining??0));
  const pct=total?Math.max(0,Math.min(100,Math.round((total-remain)/total*100))):0;
  const img=x.imageUrl?'<img loading="lazy" decoding="async" src="'+esc(x.imageUrl)+'" alt="'+esc(x.name||x.title||'')+'">':'';
  const id=String(x.id||x.settingId||'');
  return '<article class="home-group-card">'+
    '<div class="home-group-media">'+img+'<span class="home-group-badge">公開中</span></div>'+
    '<div class="home-group-body">'+
      '<h3>'+esc(x.name||x.title||'一番賞配率')+'</h3>'+
      '<div class="home-group-metrics"><div><small>剩餘</small><strong>'+remain+'</strong></div><div><small>總抽數</small><strong>'+total+'</strong></div><div><small>大賞</small><strong>'+major+'</strong></div></div>'+
      '<div class="home-group-progress"><i style="width:'+pct+'%"></i></div>'+
      '<div class="home-group-meta">目前已抽 '+pct+'%</div>'+
      '<a class="home-group-cta" href="./kuji.html'+(id?'?id='+encodeURIComponent(id):'')+'">查看完整配率 →</a>'+
    '</div></article>';
}
async function load(){
  const section=$('#homeRateSection'),grid=$('#homeRateGrid');if(!section||!grid)return;
  try{
    let data=null;try{data=await rpc('getPublicV283KujiLite',[])}catch(e){data=await rpc('getPublicKujiList',[])}
    const all=rows(data),list=all.slice(0,3);
    section.hidden=!all.length;
    grid.innerHTML=all.length?list.map(card).join(''):'';
  }catch(e){
    section.hidden=true;grid.innerHTML='';
  }
}
window.addEventListener('DOMContentLoaded',()=>{setTimeout(load,300);const t=setInterval(()=>{if(!document.hidden)load()},20000);window.addEventListener('pagehide',()=>clearInterval(t),{once:true})});
})();