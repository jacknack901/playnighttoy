
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let groups=[], active=null, qty=1, delivery='門市取貨', loading=false;

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return 'NT$ '+Math.round(Number(v||0)).toLocaleString('zh-TW')}
function rpcRead(name,args=[]){if(!window.WANYE_RPC)throw Error('RPC 尚未載入');return WANYE_RPC.read(name,args,30000)}
function rpcWrite(name,args=[]){if(!window.WANYE_RPC)throw Error('RPC 尚未載入');return WANYE_RPC.write(name,args,18000)}

function switchMode(mode,scroll){
  if(!['regular','group','japan'].includes(mode))mode='regular';
  $$('.online-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  ['regular','group','japan'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('is-active',id===mode)});
  if(mode==='group')loadGroups(false);
  if(scroll){const el=document.getElementById(mode);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
  try{history.replaceState(null,'','#'+mode)}catch(e){}
}
window.WANYE_SWITCH_ONLINE_MODE=switchMode;

function groupItems(raw){
  const items=raw&&Array.isArray(raw.items)?raw.items:(Array.isArray(raw)?raw:[]);
  return items.filter(x=>String(x.publicMode||'')==='group');
}
async function loadGroups(force){
  if(loading)return;
  loading=true;
  const grid=$('#groupGrid');
  if(grid&&!groups.length)grid.innerHTML='<div class="group-empty">集單抽載入中…</div>';
  try{
    const data=await rpcRead('getPublicV283KujiLite',[]);
    groups=groupItems(data);
    renderGroups();
    const c=$('#groupCount'); if(c)c.textContent=String(groups.length);
    const wanted=new URLSearchParams(location.search).get('group');
    if(wanted&&groups.some(x=>String(x.id)===String(wanted))&&!active){
      setTimeout(()=>openGroup(wanted),80);
    }
  }catch(e){
    if(grid)grid.innerHTML='<div class="group-empty"><b>集單抽目前讀取失敗</b><br><small>'+esc(e&&e.message||e)+'</small></div>';
  }finally{loading=false}
}
window.WANYE_LOAD_GROUP_KUJI=()=>loadGroups(true);

function renderGroups(){
  const grid=$('#groupGrid'); if(!grid)return;
  if(!groups.length){grid.innerHTML='<div class="group-empty">目前沒有公開中的集單抽。</div>';return}
  grid.innerHTML=groups.map(x=>{
    const target=Math.max(0,Number(x.groupTargetQty||x.total||0));
    const reserved=Math.max(0,Number(x.groupReservedQty||0));
    const remain=Math.max(0,Number(x.remaining??(target-reserved)));
    const pct=target?Math.min(100,Math.round(reserved/target*100)):0;
    const closed=!!x.closed||remain<=0;
    const cover=x.imageUrl?'<img loading="lazy" decoding="async" src="'+esc(x.imageUrl)+'" alt="'+esc(x.name||'')+'">':'';
    return '<article class="group-kuji-card">'+
      '<div class="group-kuji-cover">'+cover+'<span class="group-state">'+(closed?'集單截止':'集單中')+'</span></div>'+
      '<div class="group-kuji-body">'+
        '<h3>'+esc(x.name||'一番賞集單')+'</h3>'+
        '<div class="group-kuji-price">'+money(x.price)+' <small>/ 抽</small></div>'+
        '<div class="group-kuji-stats"><div><small>已集</small><strong>'+reserved+'</strong></div><div><small>目標</small><strong>'+target+'</strong></div><div><small>剩餘</small><strong>'+remain+'</strong></div></div>'+
        '<div class="group-progress-line"><i style="width:'+pct+'%"></i></div>'+
        '<div class="group-kuji-deadline">'+(x.groupCloseDate?'截止 '+esc(x.groupCloseDate):'截止時間依公告')+'｜進度 '+pct+'%</div>'+
        (x.groupDescription?'<div class="group-kuji-desc">'+esc(x.groupDescription)+'</div>':'')+
        '<button class="group-kuji-action" '+(closed?'disabled':'')+' data-group-open="'+esc(x.id)+'">'+(closed?'已截止':'我要集單')+'</button>'+
      '</div></article>';
  }).join('');
  $$('[data-group-open]',grid).forEach(btn=>btn.addEventListener('click',()=>openGroup(btn.dataset.groupOpen)));
}

function openGroup(id){
  active=groups.find(x=>String(x.id)===String(id)); if(!active)return;
  qty=1; delivery='門市取貨';
  $('#groupFormTitle').textContent=active.name||'一番賞集單';
  $('#groupFormMeta').textContent=money(active.price)+' / 抽｜剩 '+Number(active.remaining||0)+' 抽可登記';
  ['groupName','groupPhone','groupLine','groupLast5','groupNote'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});
  $$('.group-qty-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.qty)===1));
  $$('.group-delivery button').forEach(b=>b.classList.toggle('active',b.dataset.delivery==='門市取貨'));
  $('#groupMsg').textContent=''; $('#groupMsg').className='group-msg';
  updateSummary();
  $('#groupModal').classList.remove('hidden');
  document.body.style.overflow='hidden';
}
function closeGroup(){active=null;$('#groupModal').classList.add('hidden');document.body.style.overflow=''}
window.WANYE_CLOSE_GROUP=closeGroup;

function setQty(n){
  if(!active)return;
  const remain=Math.max(1,Number(active.remaining||1));
  qty=Math.max(1,Math.min(remain,Number(n||1)));
  $$('.group-qty-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.qty)===qty));
  $('#groupQtyCustom').value=String(qty);
  updateSummary();
}
function updateSummary(){
  if(!active)return;
  const total=Math.round(Number(active.price||0)*qty);
  $('#groupOrderSummary').innerHTML='本次 <b>'+qty+' 抽</b>｜預計 <b>'+money(total)+'</b><br>送出後會建立集單紀錄，由頑夜確認款項與後續開團。';
}
async function submitGroup(){
  if(!active)return;
  const msg=$('#groupMsg'),btn=$('#groupSubmit');
  const name=$('#groupName').value.trim(),phone=$('#groupPhone').value.replace(/\D/g,''),lineId=$('#groupLine').value.trim(),last5=$('#groupLast5').value.replace(/\D/g,'').slice(0,5),note=$('#groupNote').value.trim();
  const custom=Math.floor(Number($('#groupQtyCustom').value||qty)); qty=Math.max(1,custom);
  if(!name){msg.textContent='請輸入姓名。';msg.className='group-msg bad';return}
  if(!/^09\d{8}$/.test(phone)){msg.textContent='手機請輸入 09 開頭 10 碼。';msg.className='group-msg bad';return}
  if(!lineId){msg.textContent='請輸入 LINE ID。';msg.className='group-msg bad';return}
  if(last5 && !/^\d{5}$/.test(last5)){msg.textContent='匯款後五碼請輸入 5 位數字。';msg.className='group-msg bad';return}
  btn.disabled=true;btn.textContent='送出中…';msg.textContent='正在建立集單紀錄…';msg.className='group-msg';
  const requestId='WEBGROUP-'+Date.now()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
  try{
    const r=await rpcWrite('submitKujiGroupOrderV28124',[active.id,{name,phone,lineId,qty,bankLast5:last5,deliveryMethod:delivery,note,requestId}]);
    msg.innerHTML='✅ 集單已送出｜編號 <b>'+esc(r.id||'')+'</b><br>抽數 '+Number(r.qty||qty)+'｜應付 '+money(r.expectedAmount||Number(active.price||0)*qty);
    msg.className='group-msg ok';
    btn.textContent='已送出';
    setTimeout(async()=>{await loadGroups(true)},500);
  }catch(e){
    msg.textContent=e&&e.message||'送出失敗';msg.className='group-msg bad';btn.disabled=false;btn.textContent='確認送出集單';
  }
}

document.addEventListener('click',e=>{
  const modeBtn=e.target.closest('.online-mode-btn'); if(modeBtn){switchMode(modeBtn.dataset.mode,true);return}
  const heroLink=e.target.closest('[data-online-mode-link]'); if(heroLink){e.preventDefault();switchMode(heroLink.dataset.onlineModeLink,true);return}
  const q=e.target.closest('.group-qty-btn'); if(q){setQty(q.dataset.qty);return}
  const d=e.target.closest('.group-delivery button'); if(d){delivery=d.dataset.delivery;$$('.group-delivery button').forEach(b=>b.classList.toggle('active',b===d));return}
  if(e.target.id==='groupModal')closeGroup();
});
document.addEventListener('input',e=>{if(e.target.id==='groupQtyCustom'){qty=Math.max(1,Math.floor(Number(e.target.value||1)));updateSummary()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#groupModal').classList.contains('hidden'))closeGroup()});
window.WANYE_SUBMIT_GROUP=submitGroup;

window.addEventListener('DOMContentLoaded',()=>{
  const hash=location.hash.replace('#','');
  switchMode(['regular','group','japan'].includes(hash)?hash:'regular',false);
  loadGroups(false);
});
})();
