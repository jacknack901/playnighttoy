
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
function groups(raw){const a=raw&&Array.isArray(raw.items)?raw.items:(Array.isArray(raw)?raw:[]);return a.filter(x=>String(x.publicMode||'')==='group'&&!x.closed)}
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
  const grid=$('#homeGroupGrid');if(!grid)return;
  try{
    const data=await groupRpcRead('getPublicV283KujiLite',[]);
    const list=groups(data).slice(0,3);
    const count=$('#homeGroupCount');if(count)count.textContent=String(groups(data).length);
    grid.innerHTML=list.length?list.map(card).join(''):'<div class="home-group-empty">目前沒有開放中的集單抽。</div>';
  }catch(e){
    grid.innerHTML='<div class="home-group-empty">集單抽暫時無法更新，請進入線上抽賞頁重新整理。</div>';
  }
}
window.addEventListener('DOMContentLoaded',()=>setTimeout(load,350));
})();
