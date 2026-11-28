(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let groups=[],active=null,qty=1,delivery='門市取貨',loading=false,selected=new Set();
const GROUP_CACHE_KEY='wanye:group-kuji:v281219';
const GROUP_CACHE_TTL=2*60*1000;
let lastLoadedAt=0;
function readGroupCache(){
  try{
    const raw=localStorage.getItem(GROUP_CACHE_KEY); if(!raw)return null;
    const d=JSON.parse(raw); if(!d||!Array.isArray(d.items))return null;
    return d;
  }catch(e){return null}
}
function writeGroupCache(items){
  try{localStorage.setItem(GROUP_CACHE_KEY,JSON.stringify({ts:Date.now(),items:items||[]}))}catch(e){}
}
function useGroupCache(){
  const d=readGroupCache(); if(!d||!d.items.length)return false;
  groups=d.items; lastLoadedAt=Number(d.ts||0); renderGroups();
  const c=$('#groupCount');if(c)c.textContent=String(groups.length);
  return true;
}

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return 'NT$ '+Math.round(Number(v||0)).toLocaleString('zh-TW')}
function rpcRead(name,args=[]){if(!window.WANYE_RPC)throw Error('RPC 尚未載入');return WANYE_RPC.read(name,args,30000)}
function rpcWrite(name,args=[]){if(!window.WANYE_RPC)throw Error('RPC 尚未載入');return WANYE_RPC.write(name,args,18000)}
function arr(v){return Array.isArray(v)?v:[]}
function nums(v){return arr(v).map(x=>Number(typeof x==='object'?(x.number??x.no??x.ticketNo):x)).filter(n=>Number.isFinite(n)&&n>0)}
function prizeItems(x){
  const raw=arr(x?.prizes).length?x.prizes:(arr(x?.prizeList).length?x.prizeList:(arr(x?.prizeItems).length?x.prizeItems:[]));
  return raw.map((p,i)=>({grade:String(p.grade||p.rank||p.prize||p.label||String.fromCharCode(65+i)+'賞'),name:String(p.name||p.title||p.prizeName||''),imageUrl:String(p.imageUrl||p.image||'')})).filter(p=>p.grade||p.name);
}
function boardItems(x){
  const raw=arr(x?.board).length?x.board:(arr(x?.groupBoard).length?x.groupBoard:(arr(x?.tickets).length?x.tickets:[]));
  const target=Math.max(0,Number(x?.groupTargetQty||x?.total||x?.totalDraws||0));
  const reserved=new Set(nums(x?.groupReservedNumbers||x?.reservedNumbers||x?.selectedNumbers));
  const byNo=new Map();
  raw.forEach((b,i)=>{
    const n=Number(b?.number??b?.no??b?.ticketNo??i+1); if(!n)return;
    const status=String(b?.status||'');
    byNo.set(n,{number:n,status,grade:String(b?.grade||b?.prize||''),name:String(b?.name||b?.prizeName||''),imageUrl:String(b?.imageUrl||''),reserved:reserved.has(n)||/已選|保留|預約|reserved/i.test(status),opened:/已開|開獎|opened|revealed/i.test(status)||!!b?.grade});
  });
  const total=Math.max(target,...byNo.keys(),0);
  for(let n=1;n<=total;n++) if(!byNo.has(n))byNo.set(n,{number:n,status:'',grade:'',name:'',imageUrl:'',reserved:reserved.has(n),opened:false});
  return [...byNo.values()].sort((a,b)=>a.number-b.number);
}
function groupItems(raw){
  const items=raw&&Array.isArray(raw.items)?raw.items:(Array.isArray(raw)?raw:[]);
  return items.filter(x=>String(x.publicMode||'')==='group');
}
function stateOf(x){
  const b=boardItems(x),opened=b.filter(n=>n.opened).length,target=Math.max(0,Number(x.groupTargetQty||x.total||0)),reserved=Math.max(0,Number(x.groupReservedQty||0)),remain=Math.max(0,Number(x.remaining??(target-reserved)));
  if(opened>0)return {key:'opened',label:'開獎中',remain};
  if(x.closed||remain<=0)return {key:'ready',label:'集單完成',remain};
  return {key:'open',label:'集單中',remain};
}
function switchMode(mode,scroll){
  if(!['regular','group','japan'].includes(mode))mode='regular';
  $$('.online-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  ['regular','group','japan'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('is-active',id===mode)});
  if(mode==='group')loadGroups(false);
  const mobile=window.matchMedia&&window.matchMedia('(max-width:820px)').matches;
  if(scroll&&!mobile){const el=document.getElementById(mode);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
  try{
    const u=new URL(location.href);
    u.hash='';
    history.replaceState(null,'',u.pathname+u.search);
  }catch(e){}
}
window.WANYE_SWITCH_ONLINE_MODE=switchMode;

async function loadGroups(force){
  const grid=$('#groupGrid');
  const hadCache=groups.length?true:useGroupCache();
  const cacheFresh=hadCache && (Date.now()-lastLoadedAt<GROUP_CACHE_TTL);
  if(!force&&cacheFresh)return;
  if(loading)return;
  loading=true;
  if(grid&&!hadCache&&!groups.length)grid.innerHTML='<div class="group-empty group-loading-fast"><b>正在取得最新集單</b><small>第一次載入後，下次會直接顯示快照。</small></div>';
  try{
    const data=await rpcRead('getPublicV283KujiLite',[]);
    const fresh=groupItems(data);
    groups=fresh; lastLoadedAt=Date.now(); writeGroupCache(fresh); renderGroups();
    const c=$('#groupCount');if(c)c.textContent=String(groups.length);
    const wanted=new URLSearchParams(location.search).get('group');
    if(wanted&&groups.some(x=>String(x.id)===String(wanted))&&!active)setTimeout(()=>openGroup(wanted),40);
  }catch(e){
    if(!groups.length&&grid)grid.innerHTML='<div class="group-empty"><b>集單抽目前讀取失敗</b><br><small>'+esc(e&&e.message||e)+'</small></div>';
  }finally{loading=false}
}
window.WANYE_LOAD_GROUP_KUJI=()=>loadGroups(true);

function prizeTeaser(x){
  const ps=prizeItems(x).slice(0,4);
  if(!ps.length)return '<div class="group-prize-teaser muted">獎項內容進入後查看</div>';
  return '<div class="group-prize-teaser">'+ps.map(p=>'<span><b>'+esc(p.grade)+'</b>'+esc(p.name||'獎項')+'</span>').join('')+'</div>';
}
function renderGroups(){
  const grid=$('#groupGrid');if(!grid)return;
  if(!groups.length){grid.innerHTML='<div class="group-empty">目前沒有公開中的集單抽。</div>';return}
  grid.innerHTML=groups.map(x=>{
    const target=Math.max(0,Number(x.groupTargetQty||x.total||0)),reserved=Math.max(0,Number(x.groupReservedQty||0)),remain=Math.max(0,Number(x.remaining??(target-reserved))),pct=target?Math.min(100,Math.round(reserved/target*100)):0,state=stateOf(x);
    const cover=x.imageUrl?'<img loading="lazy" decoding="async" src="'+esc(x.imageUrl)+'" alt="'+esc(x.name||'')+'">':'';
    const action=state.key==='open'?'查看獎項・選號':(state.key==='opened'?'查看開獎':'查看集單結果');
    return '<article class="group-kuji-card">'+
      '<div class="group-kuji-cover">'+cover+'<span class="group-state '+state.key+'">'+state.label+'</span></div>'+
      '<div class="group-kuji-body"><h3>'+esc(x.name||'一番賞集單')+'</h3>'+
      '<div class="group-kuji-price">'+money(x.price)+' <small>/ 抽</small></div>'+
      '<div class="group-kuji-stats"><div><small>已集</small><strong>'+reserved+'</strong></div><div><small>目標</small><strong>'+target+'</strong></div><div><small>剩餘</small><strong>'+remain+'</strong></div></div>'+
      '<div class="group-progress-line"><i style="width:'+pct+'%"></i></div>'+
      prizeTeaser(x)+
      '<div class="group-kuji-deadline">'+(x.groupCloseDate?'截止 '+esc(x.groupCloseDate):'截止時間依公告')+'｜進度 '+pct+'%</div>'+
      '<button class="group-kuji-action" data-group-open="'+esc(x.id)+'">'+action+'</button></div></article>';
  }).join('');
  $$('[data-group-open]',grid).forEach(btn=>btn.addEventListener('click',()=>openGroup(btn.dataset.groupOpen)));
}

async function hydrateGroupDetail(){
  if(!active||!active.publicCode)return;
  if(prizeItems(active).length){active._detailLoaded=true;return;}
  try{
    const d=await rpcRead('getPublicKuji',[active.publicCode]);
    if(d&&typeof d==='object'){
      if(Array.isArray(d.prizes)&&d.prizes.length)active.prizes=d.prizes;
      if(!active.imageUrl&&d.imageUrl)active.imageUrl=d.imageUrl;
      if(!active.name&&d.name)active.name=d.name;
      active._detailLoaded=true;
      renderPrizes();
    }
  }catch(e){console.warn('[group] prize detail fallback',e&&e.message||e)}
}
function renderPrizes(){
  const box=$('#groupPrizeList');if(!box||!active)return;
  const ps=prizeItems(active);
  box.innerHTML=ps.length?ps.map(p=>'<article class="group-prize-item">'+(p.imageUrl?'<img src="'+esc(p.imageUrl)+'" alt="">':'<div class="group-prize-fallback">'+esc(p.grade.slice(0,2))+'</div>')+'<div><b>'+esc(p.grade)+'</b><span>'+esc(p.name||'獎項')+'</span></div></article>').join(''):'<div class="group-prize-empty">目前後台尚未提供獎項圖與獎項名稱。</div>';
}
function renderNumberBoard(){
  const box=$('#groupNumberBoard');if(!box||!active)return;
  const b=boardItems(active),state=stateOf(active);
  if(!b.length){box.innerHTML='<div class="group-prize-empty">目前沒有可顯示的號碼資料。</div>';return}
  box.innerHTML=b.map(n=>{
    const unavailable=n.reserved&&!selected.has(n.number),cls=n.opened?'opened':(unavailable?'reserved':(selected.has(n.number)?'selected':'available'));
    const label=n.opened?(n.grade||'已開'):(unavailable?'已選':(selected.has(n.number)?'✓':''));
    const title=n.opened?esc((n.grade||'')+' '+(n.name||'')):(unavailable?'此號碼已被選走':'選擇 '+n.number+' 號');
    return '<button type="button" class="group-number '+cls+'" data-group-number="'+n.number+'" '+(unavailable||n.opened||state.key!=='open'?'disabled':'')+' title="'+title+'"><strong>'+n.number+'</strong><small>'+esc(label)+'</small></button>';
  }).join('');
}
function openGroup(id){
  active=groups.find(x=>String(x.id)===String(id));if(!active)return;
  qty=1;delivery='門市取貨';selected=new Set();
  const state=stateOf(active);
  $('#groupFormTitle').textContent=active.name||'一番賞集單';
  $('#groupFormMeta').textContent=money(active.price)+' / 抽｜'+state.label+'｜剩 '+Number(active.remaining ?? state.remain ?? 0)+' 抽';
  ['groupName','groupPhone','groupLine','groupLast5','groupNote'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});
  $$('.group-qty-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.qty)===1));
  $$('.group-delivery button').forEach(b=>b.classList.toggle('active',b.dataset.delivery==='門市取貨'));
  $('#groupQtyCustom').value='1';$('#groupMsg').textContent='';$('#groupMsg').className='group-msg';
  renderPrizes();renderNumberBoard();updateSummary();hydrateGroupDetail();
  const order=$('#groupOrderFields'),submit=$('#groupSubmit'),qtyArea=$('#groupQtyArea');
  if(order)order.hidden=state.key!=='open';if(qtyArea)qtyArea.hidden=state.key!=='open';if(submit)submit.hidden=state.key!=='open';
  $('#groupModal').classList.remove('hidden');document.body.style.overflow='hidden';
}
function closeGroup(){active=null;selected.clear();$('#groupModal').classList.add('hidden');document.body.style.overflow=''}
window.WANYE_CLOSE_GROUP=closeGroup;

function setQty(n){
  if(!active)return;
  const remain=Math.max(1,Number(active.remaining||stateOf(active).remain||1));
  qty=Math.max(1,Math.min(remain,Number(n||1)));
  $$('.group-qty-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.qty)===qty));
  $('#groupQtyCustom').value=String(qty);
  while(selected.size>qty)selected.delete([...selected].pop());
  renderNumberBoard();updateSummary();
}
function toggleNumber(n){
  if(!active||stateOf(active).key!=='open')return;
  n=Number(n);const item=boardItems(active).find(x=>x.number===n);if(!item||item.opened||item.reserved)return;
  if(selected.has(n))selected.delete(n);else{
    if(selected.size>=qty){const msg=$('#groupMsg');msg.textContent='本次設定 '+qty+' 抽，最多選 '+qty+' 個號碼。';msg.className='group-msg bad';return}
    selected.add(n);
  }
  renderNumberBoard();updateSummary();
}
function updateSummary(){
  if(!active)return;
  const total=Math.round(Number(active.price||0)*qty),picked=[...selected].sort((a,b)=>a-b);
  const need=Math.max(0,qty-picked.length);
  $('#groupOrderSummary').innerHTML='本次 <b>'+qty+' 抽</b>｜預計 <b>'+money(total)+'</b><br>已選號碼：<b>'+(picked.length?picked.join('、'):'尚未選號')+'</b>'+(need?'<br><span class="group-pick-warning">還要再選 '+need+' 個號碼</span>':'<br><span class="group-pick-ok">號碼已選完成</span>');
}
async function submitGroup(){
  if(!active)return;
  const msg=$('#groupMsg'),btn=$('#groupSubmit');
  const name=$('#groupName').value.trim(),phone=$('#groupPhone').value.replace(/\D/g,''),lineId=$('#groupLine').value.trim(),last5=$('#groupLast5').value.replace(/\D/g,'').slice(0,5),note=$('#groupNote').value.trim();
  const custom=Math.floor(Number($('#groupQtyCustom').value||qty));qty=Math.max(1,custom);
  const picked=[...selected].sort((a,b)=>a-b);
  if(picked.length!==qty){msg.textContent='請先在號碼盤選滿 '+qty+' 個號碼。';msg.className='group-msg bad';return}
  if(!name){msg.textContent='請輸入姓名。';msg.className='group-msg bad';return}
  if(!/^09\d{8}$/.test(phone)){msg.textContent='手機請輸入 09 開頭 10 碼。';msg.className='group-msg bad';return}
  if(!lineId){msg.textContent='請輸入 LINE ID。';msg.className='group-msg bad';return}
  if(last5&&!/^\d{5}$/.test(last5)){msg.textContent='匯款後五碼請輸入 5 位數字。';msg.className='group-msg bad';return}
  btn.disabled=true;btn.textContent='送出中…';msg.textContent='正在鎖定號碼並建立集單紀錄…';msg.className='group-msg';
  const requestId='WEBGROUP-'+Date.now()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const numberNote='選號：'+picked.join(',');
  try{
    const r=await rpcWrite('submitKujiGroupOrderV28124',[active.id,{name,phone,lineId,qty,selectedNumbers:picked,numbers:picked,bankLast5:last5,deliveryMethod:delivery,note:[note,numberNote].filter(Boolean).join('｜'),requestId}]);
    msg.innerHTML='✅ 集單已送出｜編號 <b>'+esc(r.id||'')+'</b><br>選號 <b>'+picked.join('、')+'</b>｜應付 '+money(r.expectedAmount||Number(active.price||0)*qty);
    msg.className='group-msg ok';btn.textContent='已送出';
    setTimeout(async()=>{await loadGroups(true);active=groups.find(x=>String(x.id)===String(active?.id))||active;renderNumberBoard()},180);
  }catch(e){
    msg.textContent=e&&e.message||'送出失敗';msg.className='group-msg bad';btn.disabled=false;btn.textContent='確認送出集單';
  }
}
document.addEventListener('click',e=>{
  const modeBtn=e.target.closest('.online-mode-btn');if(modeBtn){switchMode(modeBtn.dataset.mode,false);return}
  const heroLink=e.target.closest('[data-online-mode-link]');if(heroLink){e.preventDefault();switchMode(heroLink.dataset.onlineModeLink,false);return}
  const q=e.target.closest('.group-qty-btn');if(q){setQty(q.dataset.qty);return}
  const n=e.target.closest('[data-group-number]');if(n){toggleNumber(n.dataset.groupNumber);return}
  const d=e.target.closest('.group-delivery button');if(d){delivery=d.dataset.delivery;$$('.group-delivery button').forEach(b=>b.classList.toggle('active',b===d));return}
  if(e.target.id==='groupModal')closeGroup();
});
document.addEventListener('input',e=>{if(e.target.id==='groupQtyCustom'){qty=Math.max(1,Math.floor(Number(e.target.value||1)));while(selected.size>qty)selected.delete([...selected].pop());$$('.group-qty-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.qty)===qty));renderNumberBoard();updateSummary()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#groupModal').classList.contains('hidden'))closeGroup()});
window.WANYE_SUBMIT_GROUP=submitGroup;
// pageshow-v281224: 手機回到線上抽賞頁時固定從頁首開始，避免瀏覽器恢復舊捲動位置。
window.addEventListener('pageshow',()=>{
  const mobile=window.matchMedia&&window.matchMedia('(max-width:820px)').matches;
  if(!mobile)return;
  try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(e){window.scrollTo(0,0)}
});
window.addEventListener('DOMContentLoaded',()=>{
  const qsMode=new URLSearchParams(location.search).get('mode');
  const mode=['regular','group','japan'].includes(qsMode)?qsMode:'regular';
  const mobile=window.matchMedia&&window.matchMedia('(max-width:820px)').matches;
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  if(mobile){
    try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(e){window.scrollTo(0,0)}
    requestAnimationFrame(()=>{try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(e){window.scrollTo(0,0)}});
    setTimeout(()=>{try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(e){window.scrollTo(0,0)}},80);
  }
  useGroupCache();
  switchMode(mode,false);
  if(mode==='group')loadGroups(false);
  else if('requestIdleCallback' in window)requestIdleCallback(()=>loadGroups(false),{timeout:1800});
  else setTimeout(()=>loadGroups(false),900);
});
})();