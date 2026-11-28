
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return 'NT$ '+Math.round(Number(v||0)).toLocaleString('zh-TW')}
async function groupRpcRead(name,args=[]){
  if(typeof window.rpcRead==='function')return window.rpcRead(name,args);
  if(!window.WANYE_RPC){
    if(typeof window.ensureRpcV281109==='function')await window.ensureRpcV281109();
  }
  if(!window.WANYE_RPC)throw Error('RPC 尚未載入');
  return WANYE_RPC.read(name,args,30000);
}
function groups(raw){const a=raw&&Array.isArray(raw.items)?raw.items:(Array.isArray(raw)?raw:[]);return a.filter(x=>String(x.publicMode||'')==='group'&&!x.closed&&!/暫停|下架|關閉|結束|截止/.test(String(x.status||'')))}
function card(x){
  const target=Math.max(0,Number(x.groupTargetQty||x.total||0));
  const reserved=Math.max(0,Number(x.groupReservedQty||0));
  const remain=Math.max(0,Number(x.remaining??(target-reserved)));
  const pct=target?Math.min(100,Math.round(reserved/target*100)):0;
  const img=x.imageUrl?'<img loading="lazy" decoding="async" src="'+esc(x.imageUrl)+'" alt="'+esc(x.name||'')+'">':'';
  const url='./online.html?group='+encodeURIComponent(x.id)+'#group';
  return '<article class="home-group-card">'+
    '<div class="home-group-media">'+img+'<span class="home-group-badge">集單中</span></div>'+
    '<div class="home-group-body">'+
      '<h3>'+esc(x.name||'一番賞集單')+'</h3>'+
      '<div class="home-group-price">'+money(x.price)+' <small>/ 抽</small></div>'+
      '<div class="home-group-metrics"><div><small>已集</small><strong>'+reserved+'</strong></div><div><small>目標</small><strong>'+target+'</strong></div><div><small>剩餘</small><strong>'+remain+'</strong></div></div>'+
      '<div class="home-group-progress"><i style="width:'+pct+'%"></i></div>'+
      '<div class="home-group-meta">'+(x.groupCloseDate?'截止 '+esc(x.groupCloseDate)+'｜':'')+'完成 '+pct+'%</div>'+
      '<a class="home-group-cta" href="'+url+'">立即集單 →</a>'+
    '</div></article>';
}
async function load(){
  const grid=$('#homeGroupGrid'),section=$('#homeGroupKuji');if(!grid||!section)return;
  try{
    const data=await groupRpcRead('getPublicV283KujiLite',[]);
    const all=groups(data),list=all.slice(0,3);
    const count=$('#homeGroupCount');if(count)count.textContent=String(all.length);
    section.hidden=!all.length;
    grid.innerHTML=all.length?list.map(card).join(''):'';
  }catch(e){
    section.hidden=true;grid.innerHTML='';
  }
}
window.addEventListener('DOMContentLoaded',()=>{setTimeout(load,250);const t=setInterval(()=>{if(!document.hidden)load()},20000);window.addEventListener('pagehide',()=>clearInterval(t),{once:true})});
})();
