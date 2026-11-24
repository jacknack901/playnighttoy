(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const MOBILE=window.matchMedia&&window.matchMedia('(max-width:820px)').matches;
const PAGE_SIZE=MOBILE?18:24;
const PREVIEW_MODE=location.protocol==='file:'||['localhost','127.0.0.1'].includes(location.hostname);
function readJson(key,fallback){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v}catch(e){return fallback}}
const S={
  products:[],total:0,nextOffset:0,hasMore:false,counts:{},categories:[],ips:[],requestSeq:0,
  mode:'all',ip:'',cat:'',sort:'new',query:'',focus:'',
  favorites:new Set(readJson('wanye:favs',[])),recent:readJson('wanye:recent',[]),cart:readJson('wanye:cart',[]),
  member:null,memberToken:localStorage.getItem('wanye:memberToken')||'',deviceId:localStorage.getItem('wanye:deviceId')||''
};
if(!S.deviceId){S.deviceId='web_'+Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('wanye:deviceId',S.deviceId)}
const mockProducts=[
{id:'m1',name:'Pokémon Center 原創 皮卡丘 睡眠絨毛玩偶',price:1280,category:'娃娃',tags:'寶可夢 Pokémon Center',isNew:true,type:'預購'},
{id:'m2',name:'航海王 魯夫 太陽神尼卡 景品公仔',price:880,category:'景品',tags:'航海王 海賊王',isNew:true,type:'預購'},
{id:'m3',name:'Re:從零開始的異世界生活 愛蜜莉雅 1/7 PVC',price:5980,category:'PVC',tags:'Re:ZERO',type:'預購'},
{id:'m4',name:'七龍珠 Z 孫悟空 超級賽亞人 景品公仔',price:990,category:'景品',tags:'七龍珠',type:'現貨'},
{id:'m5',name:'星之卡比 卡比 睡星抱抱 絨毛玩偶',price:880,category:'娃娃',tags:'卡比',isNew:true,type:'預購'},
{id:'m6',name:'Pokémon 卡比獸 巨大絨毛抱枕',price:2980,category:'娃娃',tags:'寶可夢 Pokémon',type:'預購'},
{id:'m7',name:'Beyblade X 戰鬥陀螺 CX 系列',price:1180,category:'其他',tags:'戰鬥陀螺 Beyblade',type:'預購'},
{id:'m8',name:'三麗鷗 大耳狗 星雲系列 造型夜燈',price:1080,category:'其他',tags:'三麗鷗 大耳狗',type:'預購'}
];
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function money(v){return 'NT$ '+Math.round(Number(v||0)).toLocaleString('zh-TW')}
function rawImg(p){return p&& (p.imageUrl||p.image||p.cover||p.thumbnail)||''}
function thumbUrl(url,size=560){
  url=String(url||'').trim();if(!url)return'';
  try{
    if(/drive\.google\.com\/thumbnail/i.test(url)){
      const u=new URL(url);u.searchParams.set('sz','w'+Math.max(120,Math.min(900,size)));return u.toString();
    }
  }catch(e){}
  return url;
}
function img(p,size){return thumbUrl(rawImg(p),size||560)}
function imageMarkup(p,size,emoji,eager){
  const u=img(p,size),alt=esc(p?.name||p?.title||'商品圖片');
  if(!u)return `<div class="product-fallback">${emoji||'🎁'}</div>`;
  return `<img ${eager?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"'} decoding="async" width="${size||560}" height="${size||560}" src="${esc(u)}" alt="${alt}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="product-fallback" hidden>${emoji||'🎁'}</div>`;
}
function toast(msg){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._tm);t._tm=setTimeout(()=>t.classList.add('hidden'),2200)}
function saveFav(){localStorage.setItem('wanye:favs',JSON.stringify([...S.favorites]));syncCounts()}
function saveRecent(){localStorage.setItem('wanye:recent',JSON.stringify(S.recent.slice(0,30)));syncCounts()}
function saveCart(){localStorage.setItem('wanye:cart',JSON.stringify(S.cart));syncCounts()}
function syncCounts(){$$('[data-fav-count]').forEach(e=>e.textContent=S.favorites.size);$$('[data-recent-count]').forEach(e=>e.textContent=S.recent.length);$$('[data-cart-count]').forEach(e=>{e.textContent=S.cart.length;e.classList.toggle('hidden',!S.cart.length)})}
function dateText(v){if(!v)return'';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleDateString('zh-TW',{month:'2-digit',day:'2-digit'})}
function isClosing(p){if(p?.isClosed)return false;const s=p?.closeDate||p?.deadline||p?.orderCloseDate;if(!s)return false;let d;if(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(String(s))){const m=String(s).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);d=new Date(+m[1],+m[2]-1,+m[3],23,59,59)}else d=new Date(s);const diff=d-new Date();return !isNaN(d)&&diff>=0&&diff<=3*864e5}
function getIp(p){if(p?.ip)return p.ip;const t=((p?.tags||'')+' '+(p?.name||'')).toLowerCase();const pairs=[['寶可夢',['寶可夢','pokemon','pokémon','皮卡丘']],['航海王',['航海王','海賊王','one piece','魯夫','索隆','香吉士']],['七龍珠',['七龍珠','dragon ball','悟空']],['三麗鷗',['三麗鷗','sanrio','大耳狗','酷洛米']],['戰鬥陀螺',['beyblade','戰鬥陀螺']],['Re:ZERO',['re:zero','從零開始']]];for(const [n,ks] of pairs)if(ks.some(k=>t.includes(k.toLowerCase())))return n;return ''}
function productId(p){return String(p?.id||p?.productId||p?.row||p?.name||'')}
function productCard(p){
  const id=esc(productId(p)),fav=S.favorites.has(productId(p));
  const pill=p.isClosed?'已結單':(p.isNew?'新品預購':(p.type||p.category||'商品'));
  return `<article class="product-card ${p.isClosed?'is-closed':''}" data-product-id="${id}"><button class="fav-btn ${fav?'on':''}" data-fav="${id}" aria-label="收藏">${fav?'♥':'♡'}</button><a href="./shop.html?focus=${encodeURIComponent(productId(p))}" data-view="${id}"><div class="product-media">${imageMarkup(p,560,'🎁',false)}<span class="pill ${p.isClosed?'closed':(p.isNew?'pink':'')}">${esc(pill)}</span></div><div class="product-body"><div class="product-name">${esc(p.name||'未命名商品')}</div><div class="product-meta">${esc([getIp(p),p.category,p.type].filter(Boolean).join(' · '))}</div><div class="product-bottom"><div class="price">${money(p.price)}</div>${p.isClosed?'<span class="closed-note">已截止</span>':`<button class="mini-cart" type="button" data-cart="${id}" title="加入暫存清單">＋</button>`}</div></div></a></article>`;
}
function normalizeProducts(d){const c=d&&d.commerce?d.commerce:d||{};let arr=[];for(const key of ['items','products','featured','latest'])if(Array.isArray(c[key])){arr=c[key];break}if(!arr.length&&Array.isArray(d))arr=d;return arr.filter(x=>x&&x.name)}
async function rpcRead(a,args=[]){if(!window.WANYE_RPC)throw new Error('RPC 未載入');return WANYE_RPC.read(a,args)}
async function rpcWrite(a,args=[]){if(!window.WANYE_RPC)throw new Error('RPC 未載入');return WANYE_RPC.write(a,args)}
function cacheGet(key,ttl){try{const x=JSON.parse(sessionStorage.getItem(key)||'null');if(x&&Date.now()-x.t<ttl)return x.v}catch(e){}return null}
function cacheSet(key,v){try{sessionStorage.setItem(key,JSON.stringify({t:Date.now(),v}))}catch(e){}}
async function rpcReadCached(a,args=[],ttl=45000){const key='wanye:v282:'+a+':'+JSON.stringify(args);const hit=cacheGet(key,ttl);if(hit!=null)return hit;const v=await rpcRead(a,args);cacheSet(key,v);return v}
function addGlobalUi(){if($('.backdrop'))return;document.body.insertAdjacentHTML('beforeend',`<div class="backdrop hidden" data-close-ui></div><div class="global-search hidden"><input id="globalSearchInput" placeholder="搜尋商品、作品、角色…"><div class="search-actions"><button class="btn soft" data-close-ui>取消</button><button class="btn blue" id="globalSearchGo">搜尋商城</button></div></div><aside class="cart-drawer hidden"><div class="drawer-head"><h3>我的暫存清單</h3><button class="drawer-close" data-close-ui>×</button></div><div class="cart-list" id="cartList"></div><div class="drawer-total"><span>合計</span><span id="cartTotal">NT$ 0</span></div><p style="font-size:11px;color:#7686a8;line-height:1.6">此區是快速暫存。實際可否結帳仍依商品狀態、結單日與原商城規則判斷。</p><a class="btn primary" style="width:100%" href="./shop.html">前往商城確認商品</a></aside>`)}
function openSearch(){addGlobalUi();$('.backdrop').classList.remove('hidden');$('.global-search').classList.remove('hidden');setTimeout(()=>$('#globalSearchInput')?.focus(),30)}
function openCart(){addGlobalUi();renderCart();$('.backdrop').classList.remove('hidden');$('.cart-drawer').classList.remove('hidden')}
function closeUi(){$('.backdrop')?.classList.add('hidden');$('.global-search')?.classList.add('hidden');$('.cart-drawer')?.classList.add('hidden')}
function renderCart(){const el=$('#cartList');if(!el)return;const items=S.cart.map(id=>S.products.find(p=>productId(p)===String(id))).filter(Boolean);el.innerHTML=items.length?items.map(p=>`<div class="cart-item"><div class="cart-thumb">${imageMarkup(p,160,'🎁',false)}</div><div><b>${esc(p.name)}</b><small>${money(p.price)}</small></div><button class="cart-remove" data-cart-remove="${esc(productId(p))}">×</button></div>`).join(''):'<div class="empty-box">還沒有加入商品</div>';$('#cartTotal').textContent=money(items.reduce((s,p)=>s+Number(p.price||0),0))}
function toggleFav(id){id=String(id);if(S.favorites.has(id))S.favorites.delete(id);else S.favorites.add(id);saveFav();$$(`[data-fav="${CSS.escape(id)}"]`).forEach(b=>{b.classList.toggle('on',S.favorites.has(id));b.textContent=S.favorites.has(id)?'♥':'♡'});if(S.memberToken)rpcWrite('savePublicV28MemberPreference',[S.memberToken,S.deviceId,{type:'favorite',targetId:id,targetName:(S.products.find(p=>productId(p)===id)||{}).name||id,enabled:S.favorites.has(id)}]).catch(()=>{})}
function addRecent(id){id=String(id);S.recent=[id,...S.recent.filter(x=>String(x)!==id)].slice(0,30);saveRecent()}
function toggleCart(id){id=String(id);const p=S.products.find(x=>productId(x)===id);if(p?.isClosed){toast('此商品已結單，不能加入');return}if(S.cart.includes(id)){toast('這個商品已在暫存清單')}else{S.cart.push(id);saveCart();toast('已加入暫存清單')}}
function bindGlobal(){addGlobalUi();document.addEventListener('click',e=>{const f=e.target.closest('[data-fav]');if(f){e.preventDefault();toggleFav(f.dataset.fav);return}const c=e.target.closest('[data-cart]');if(c){e.preventDefault();e.stopPropagation();toggleCart(c.dataset.cart);return}const v=e.target.closest('[data-view]');if(v)addRecent(v.dataset.view);const r=e.target.closest('[data-cart-remove]');if(r){S.cart=S.cart.filter(x=>String(x)!==String(r.dataset.cartRemove));saveCart();renderCart();return}if(e.target.closest('[data-close-ui]'))closeUi();if(e.target.closest('[data-open-search]'))openSearch();if(e.target.closest('[data-open-cart]'))openCart()},{passive:false});$('#globalSearchGo')?.addEventListener('click',()=>{const q=$('#globalSearchInput').value.trim();if(q)location.href='./shop.html?q='+encodeURIComponent(q)});$('#globalSearchInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')$('#globalSearchGo')?.click()});syncCounts()}
function renderHeroCollage(products){const e=$('#heroCollage');if(!e)return;const list=(products.length?products:mockProducts).slice(0,3);e.innerHTML=list.map((p,i)=>`<div class="hero-figure">${imageMarkup(p,420,['⚡','🎁','🌙'][i]||'🎁',i===0)}</div>`).join('')}
function renderHomeProducts(products){const e=$('#homeProducts');if(!e)return;e.innerHTML=products.slice(0,5).map(productCard).join('')||'<div class="empty-box">目前沒有可顯示商品</div>'}
function renderPicks(products){const e=$('#homePicks');if(!e)return;const a=products.slice(0,3);e.innerHTML=a.map((p,i)=>`<a class="pick-card" href="./shop.html?focus=${encodeURIComponent(productId(p))}"><div class="thumb">${imageMarkup(p,260,'⭐',false)}</div><div><span class="pill ${i===1?'pink':'yellow'}" style="position:static;display:inline-block">${['收藏推薦','人氣熱銷','療癒新品'][i]||'精選'}</span><b>${esc(p.name)}</b><strong>${money(p.price)}</strong></div></a>`).join('')}
function genericKujiItems(data){if(Array.isArray(data))return data;for(const k of ['items','kuji','list','sets'])if(Array.isArray(data?.[k]))return data[k];if(data?.overview)return genericKujiItems(data.overview);return[]}
function kujiCard(x){const remain=Number(x.remaining??x.remainingCount??x.left??x.totalRemaining??0);const total=Number(x.total??x.totalCount??x.initialCount??remain??1);const pct=Math.max(0,Math.min(100,total?((total-remain)/total*100):0));const major=x.majorRemaining??x.topPrizeRemaining??x.major??x.aRemaining??'';return `<article class="kuji-card"><div class="cover">${imageMarkup(x,360,'🏆',false)}</div><div><span class="pill yellow" style="position:static;display:inline-flex">${esc(x.status||'一番賞')}</span><h3>${esc(x.name||x.title||'一番賞')}</h3><div class="rate">剩餘 <strong>${remain||'—'} 抽</strong>${major!==''?` · 大賞 <strong>${esc(major)}</strong>`:''}</div><div class="progress"><i style="width:${pct}%"></i></div><a class="btn soft" style="min-height:34px;padding:7px 10px;font-size:11px" href="./kuji.html">查看籤況 →</a></div></article>`}
function renderKujiGrid(id,items,limit=3){const e=$(id);if(!e)return;e.innerHTML=(items||[]).slice(0,limit).map(kujiCard).join('')||'<div class="empty-box">目前沒有公開抽賞資料</div>'}
function eventItems(data){if(Array.isArray(data))return data;for(const k of ['activities','events','raffles'])if(Array.isArray(data?.[k]))return data[k];return[]}
function eventCard(x){return `<article class="event-card"><div class="event-cover">${imageMarkup(x,520,'📣',false)}</div><div class="body"><span class="status-dot ${x.closed?'closed':''}">${x.closed?'已結束':'● 開放中'}</span><h3>${esc(x.name||x.title||'頑夜活動')}</h3><p>${esc(x.description||x.note||'查看活動資訊與報名方式')}</p><a class="btn soft" href="${esc(x.url||x.link||'./activities.html')}">查看活動 →</a></div></article>`}
function renderHomeBundle(bundle){
  let products=Array.isArray(bundle?.products)?bundle.products:normalizeProducts(bundle);if(!products.length&&PREVIEW_MODE)products=mockProducts;S.products=products;
  renderHeroCollage(products);renderHomeProducts(products);renderPicks(products);
  const shopCounts=bundle?.counts?.shop||{};$('#homeNew')&&($('#homeNew').textContent=shopCounts.new??products.filter(p=>p.isNew).length??0);$('#homeClosing')&&($('#homeClosing').textContent=shopCounts.closing??products.filter(isClosing).length);
  const kuji=Array.isArray(bundle?.kuji)?bundle.kuji:genericKujiItems(bundle?.overview||bundle);$('#homeKuji')&&($('#homeKuji').textContent=bundle?.counts?.kuji??kuji.length);$('#homeJapan')&&($('#homeJapan').textContent=bundle?.counts?.japan??(bundle?.japanProxy||[]).length);renderKujiGrid('#homeKujiGrid',kuji,3);
  const ev=Array.isArray(bundle?.events)?bundle.events:eventItems(bundle?.overview||bundle),eg=$('#homeEvents');if(eg)eg.innerHTML=ev.slice(0,3).map(eventCard).join('')||[1,2,3].map(i=>eventCard({title:['門市比賽與活動','社群抽獎企劃','新品限定活動'][i-1]})).join('');
  const set=bundle?.settings||{};if(set.hero_title&&$('#heroTitle'))$('#heroTitle').textContent=set.hero_title;if(set.hero_subtitle&&$('#heroSubtitle'))$('#heroSubtitle').textContent=set.hero_subtitle;if(set.hero_cta&&$('#heroCta'))$('#heroCta').textContent=set.hero_cta;syncCounts();
}
async function initHome(){
  const key='wanye:v282:home-lite';const cached=cacheGet(key,60000);if(cached)renderHomeBundle(cached);
  try{const bundle=await rpcRead('getPublicV28HomeLite',[]);cacheSet(key,bundle);renderHomeBundle(bundle)}catch(e){if(!cached){try{const old=await rpcReadCached('getPublicV28HomeBundle',[],20000);renderHomeBundle(old)}catch(_e){renderHomeBundle(PREVIEW_MODE?{products:mockProducts}:{});}}}
}
function readQuery(){const q=new URLSearchParams(location.search);S.query=q.get('q')||'';S.ip=q.get('ip')||'';S.mode=q.get('filter')||'all';S.focus=q.get('focus')||'';return q}
function shopApiQuery(offset){const q={offset:offset||0,limit:PAGE_SIZE,sort:S.sort,q:S.query||'',category:S.cat||'',ip:S.ip||'',mode:['fav','recent'].includes(S.mode)?'all':S.mode};if(S.mode==='fav')q.ids=[...S.favorites];if(S.mode==='recent')q.ids=S.recent.slice();return q}
function fallbackFilter(items){let a=items.slice();const needle=(S.query||'').trim().toLowerCase();if(needle)a=a.filter(p=>[p.name,p.tags,p.category,p.type,getIp(p)].join(' ').toLowerCase().includes(needle));if(S.ip)a=a.filter(p=>getIp(p)===S.ip);if(S.cat)a=a.filter(p=>String(p.category||'')===S.cat);if(S.mode==='new')a=a.filter(p=>p.isNew);if(S.mode==='closing')a=a.filter(isClosing);if(S.mode==='direct')a=a.filter(p=>/現貨|直購/.test(String(p.type||'')));if(S.mode==='long')a=a.filter(p=>p.isLongTerm||/長期/.test(String(p.tags||'')));if(S.mode==='fav')a=a.filter(p=>S.favorites.has(productId(p)));if(S.mode==='recent')a=a.filter(p=>S.recent.includes(productId(p)));return a}
function shopCacheKey(){return 'wanye:v282:shop:'+JSON.stringify({q:S.query,ip:S.ip,cat:S.cat,mode:S.mode,sort:S.sort})}
function renderChips(){const ips=S.ips.length?S.ips:[...new Set(S.products.map(getIp).filter(Boolean))],cats=S.categories.length?S.categories:[...new Set(S.products.map(p=>p.category).filter(Boolean))];$('#shopIps')&&($('#shopIps').innerHTML=ips.slice(0,16).map(x=>`<button class="chip ${S.ip===x?'on':''}" data-ip="${esc(x)}">${esc(x)}</button>`).join(''));$('#shopCats')&&($('#shopCats').innerHTML=cats.slice(0,24).map(x=>`<button class="chip ${S.cat===x?'on':''}" data-cat="${esc(x)}">${esc(x)}</button>`).join(''))}
function renderShop(reset){const grid=$('#shopGrid');if(!grid)return;const html=S.products.map(productCard).join('')||'<div class="empty-box">找不到符合條件的商品</div>';if(reset)grid.innerHTML=html;else grid.insertAdjacentHTML('beforeend',html);$('#shopResult')&&($('#shopResult').textContent=`共 ${Number(S.total||S.products.length).toLocaleString()} 件商品`);$('#shopTotal')&&($('#shopTotal').textContent=Number(S.counts.all??S.total??S.products.length).toLocaleString());$('#shopNew')&&($('#shopNew').textContent=Number(S.counts.new??S.products.filter(p=>p.isNew).length).toLocaleString());$('#shopClosing')&&($('#shopClosing').textContent=Number(S.counts.closing??S.products.filter(isClosing).length).toLocaleString());$$('[data-shop-mode]').forEach(b=>b.classList.toggle('on',b.dataset.shopMode===S.mode));const more=$('#shopMore');if(more){more.style.display=S.hasMore?'inline-flex':'none';more.disabled=false;more.textContent='載入更多商品'}}
function setShopLoading(reset){const more=$('#shopMore');if(!reset&&more){more.disabled=true;more.textContent='載入中…'}if(reset&&!S.products.length&&$('#shopGrid'))$('#shopGrid').innerHTML='<div class="loading-box">商品快速載入中…</div>'}
async function fetchShopPage(reset=true){
  const seq=++S.requestSeq,offset=reset?0:S.nextOffset;if(reset)setShopLoading(true);else setShopLoading(false);
  const query=shopApiQuery(offset);
  if((S.mode==='fav'||S.mode==='recent')&&(!query.ids||!query.ids.length)){S.products=[];S.total=0;S.hasMore=false;S.nextOffset=0;renderShop(true);return}
  let d=null,usedLite=true;
  try{d=await rpcRead('getPublicV28ShopLite',[query])}catch(e){usedLite=false;try{d=await rpcRead('getPublicShopPageV270',[{offset:0,limit:48,sort:S.sort,q:S.query||''}])}catch(_e){d=null}}
  if(seq!==S.requestSeq)return;
  let items=normalizeProducts(d);if(!usedLite)items=fallbackFilter(items);if(!items.length&&PREVIEW_MODE)items=fallbackFilter(mockProducts);
  if(reset){S.products=items}else{const seen=new Set(S.products.map(productId));items.forEach(p=>{if(!seen.has(productId(p))){S.products.push(p);seen.add(productId(p))}})}
  if(usedLite&&d){S.total=Number(d.total||0);S.nextOffset=Number(d.nextOffset||S.products.length);S.hasMore=!!d.hasMore;S.counts=d.counts||{};S.categories=Array.isArray(d.categories)?d.categories:[];S.ips=Array.isArray(d.ips)?d.ips:[]}else{S.total=S.products.length;S.nextOffset=S.products.length;S.hasMore=false;S.counts={all:S.products.length,new:S.products.filter(p=>p.isNew).length,closing:S.products.filter(isClosing).length};}
  renderChips();renderShop(true);if(reset&&!S.query&&!S.ip&&!S.cat&&S.mode==='all'&&S.sort==='new')cacheSet(shopCacheKey(),{products:S.products,total:S.total,nextOffset:S.nextOffset,hasMore:S.hasMore,counts:S.counts,categories:S.categories,ips:S.ips});
}
async function ensureFocus(){if(!S.focus||S.products.some(p=>productId(p)===S.focus))return;try{const d=await rpcRead('getPublicV28ShopLite',[{offset:0,limit:1,ids:[S.focus]}]);const p=normalizeProducts(d)[0];if(p){S.products=[p,...S.products];renderShop(true);setTimeout(()=>document.querySelector(`[data-product-id="${CSS.escape(S.focus)}"]`)?.scrollIntoView({block:'center',behavior:'smooth'}),80)}}catch(e){}}
function debounce(fn,ms){let t;return function(){clearTimeout(t);const a=arguments;t=setTimeout(()=>fn.apply(this,a),ms)}}
async function initShop(){
  readQuery();$('#shopSearch')&&($('#shopSearch').value=S.query);$('#shopSort')&&($('#shopSort').value=S.sort);
  const cached=!S.query&&!S.ip&&!S.cat&&S.mode==='all'&&S.sort==='new'?cacheGet(shopCacheKey(),45000):null;
  if(cached){Object.assign(S,cached);renderChips();renderShop(true)}
  await fetchShopPage(true);ensureFocus();if(S.focus)addRecent(S.focus);
  const doSearch=debounce(()=>{S.query=$('#shopSearch')?.value||'';fetchShopPage(true)},280);
  $('#shopSearch')?.addEventListener('input',doSearch,{passive:true});$('#shopSearch')?.addEventListener('keydown',e=>{if(e.key==='Enter'){S.query=e.currentTarget.value||'';fetchShopPage(true)}});
  $('#shopSort')?.addEventListener('change',e=>{S.sort=e.currentTarget.value;fetchShopPage(true)});
  document.addEventListener('click',e=>{const m=e.target.closest('[data-shop-mode]');if(m){S.mode=m.dataset.shopMode;fetchShopPage(true);return}const ip=e.target.closest('[data-ip]');if(ip){S.ip=S.ip===ip.dataset.ip?'':ip.dataset.ip;renderChips();fetchShopPage(true);return}const c=e.target.closest('[data-cat]');if(c){S.cat=S.cat===c.dataset.cat?'':c.dataset.cat;renderChips();fetchShopPage(true)}});
  syncCounts();
}
async function initKuji(){let d;try{d=await rpcReadCached('getPublicKujiList',[],45000)}catch(e){}const items=genericKujiItems(d);$('#rateCount')&&($('#rateCount').textContent=items.length);$('#rateActive')&&($('#rateActive').textContent=items.filter(x=>Number(x.remaining||x.remainingCount||1)>0).length);$('#rateMajor')&&($('#rateMajor').textContent=items.reduce((s,x)=>s+Number(x.majorRemaining||x.aRemaining||0),0)||'—');renderKujiGrid('#kujiRateGrid',items,99)}
async function initOnline(){const [a,b]=await Promise.allSettled([rpcReadCached('getPublicOnlineKujiListV27180',[],30000),rpcReadCached('getPublicJapanOnlineProxyListV27276',[],30000)]);const regular=a.status==='fulfilled'?a.value:null,japan=b.status==='fulfilled'?b.value:null;const ri=genericKujiItems(regular),ji=Array.isArray(japan?.items)?japan.items:(Array.isArray(japan)?japan:[]);$('#onlineCount')&&($('#onlineCount').textContent=ri.length);$('#japanCount')&&($('#japanCount').textContent=ji.length);renderKujiGrid('#onlineGrid',ri,99);const g=$('#japanGrid');if(g)g.innerHTML=ji.map(x=>eventCard({title:x.name||x.title||'日本官方線上代抽',description:`${x.expectedDrawAt?'開抽 '+dateText(x.expectedDrawAt):''}${x.reservedCount!=null?' · 已預約 '+x.reservedCount+' 抽':''}`,closed:x.reservationClosed,imageUrl:x.imageUrl||x.image})).join('')||'<div class="empty-box">目前沒有開放中的日本官方代抽</div>'}
async function initActivities(){let d;try{d=await rpcReadCached('getPublicKujiList',[],45000)}catch(e){}let items=eventItems(d);if(!items.length)items=[{title:'門市活動與比賽',description:'最新活動會從後台同步顯示'},{title:'社群抽獎',description:'限定抽獎與活動報名集中查看'}];$('#eventCount')&&($('#eventCount').textContent=items.length);$('#signupCount')&&($('#signupCount').textContent=items.filter(x=>!x.closed).length);$('#raffleCount')&&($('#raffleCount').textContent=items.filter(x=>/抽獎/.test((x.title||'')+(x.name||''))).length);$('#eventGrid')&&($('#eventGrid').innerHTML=items.map(eventCard).join(''))}
function memberRecords(type){const d=S.member?.data||{};const map={preorders:d.preorders,shop:d.shopOrders||d.orders,purchases:d.purchases||d.sales,points:d.pointLedger||d.points,kuji:d.onlineKuji||d.kujiOrders,japan:d.japanProxy||d.japanReservations,activities:d.activities||d.activitySignups};return Array.isArray(map[type])?map[type]:[]}
function renderMember(type='preorders'){$('#memberLogin')?.classList.toggle('hidden',!!S.member);$('#memberPortal')?.classList.toggle('hidden',!S.member);if(!S.member)return;const d=S.member.data||{},c=d.customer||d.member||{};$('#memberName').textContent=c.name||S.member.name||'頑夜會員';$('#memberPhoneMasked').textContent=c.phoneMasked||c.phone||'';$('#memberPoints').textContent=Number(d.pointsBalance||d.points||c.points||0).toLocaleString();$('#memberSpend').textContent=money(d.totalSpend||c.totalSpend||0);$('#memberPreorderCount').textContent=memberRecords('preorders').length;$('#memberShopCount').textContent=memberRecords('shop').length;$('#memberKujiCount').textContent=memberRecords('kuji').length;$('#memberActivityCount').textContent=memberRecords('activities').length;const list=memberRecords(type);$('#memberContent').innerHTML=`<div class="record-list">${list.length?list.map(x=>`<div class="record"><div><b>${esc(x.name||x.productName||x.title||x.orderId||x.id||'紀錄')}</b><small>${esc(x.createdAt||x.date||x.updatedAt||'')}</small></div><span class="tag">${esc(x.status||x.type||'紀錄')}</span></div>`).join(''):'<div class="empty-box">目前沒有這一類紀錄</div>'}</div>`}
async function memberLogin(){const phone=$('#memberPhone').value.replace(/\s/g,'');if(!phone){$('#memberLoginError').textContent='請輸入手機號碼';$('#memberLoginError').classList.remove('hidden');return}const b=$('#memberLoginBtn');b.disabled=true;b.textContent='登入中…';try{const r=await rpcWrite('memberPortalLoginV280',[phone,S.deviceId]);S.member=r;S.memberToken=r.memberToken||r.token||'';if(S.memberToken)localStorage.setItem('wanye:memberToken',S.memberToken);const prefs=r.preferences?.favorites||[];prefs.forEach(x=>S.favorites.add(String(x.id||x.targetId)));saveFav();renderMember()}catch(e){$('#memberLoginError').textContent=e.message||'登入失敗';$('#memberLoginError').classList.remove('hidden')}finally{b.disabled=false;b.textContent='登入我的頑夜'}}
async function refreshMember(){if(!S.memberToken)return;try{const r=await rpcWrite('memberPortalRefreshV280',[S.memberToken,S.deviceId]);S.member=r;renderMember()}catch(e){localStorage.removeItem('wanye:memberToken');S.memberToken=''}}
async function memberLogout(){try{if(S.memberToken)await rpcWrite('memberPortalLogoutV280',[S.memberToken])}catch(e){}S.member=null;S.memberToken='';localStorage.removeItem('wanye:memberToken');renderMember()}
function memberTab(type,btn){$$('[data-member-tab]').forEach(x=>x.classList.remove('on'));btn?.classList.add('on');renderMember(type)}
async function submitWish(){if(!S.memberToken){toast('請先登入會員');if(document.body.dataset.page!=='member')location.href='./member.html';return}const p={productName:$('#wishName')?.value.trim(),url:$('#wishUrl')?.value.trim(),budget:Number($('#wishBudget')?.value||0),note:$('#wishNote')?.value.trim()};if(!p.productName){toast('請輸入想找的商品');return}try{const r=await rpcWrite('submitPublicV28Wish',[S.memberToken,S.deviceId,p]);toast(r?.message||'許願已送出');['#wishName','#wishUrl','#wishBudget','#wishNote'].forEach(s=>{$(s)&&($(s).value='')})}catch(e){toast(e.message||'送出失敗')}}
async function initMember(){await refreshMember();renderMember();syncCounts()}
async function shopMore(){if(!S.hasMore)return;await fetchShopPage(false)}
function initFollow(){const e=$('#homeFollow');if(e)e.innerHTML=['寶可夢','航海王','戰鬥陀螺','三麗鷗'].map(x=>`<a class="chip" href="./shop.html?ip=${encodeURIComponent(x)}">＋ ${x}</a>`).join('')}
window.WANYE={memberLogin,memberLogout,memberTab,submitWish,shopMore,openSearch,openCart};
document.addEventListener('DOMContentLoaded',async()=>{bindGlobal();initFollow();const p=document.body.dataset.page;try{if(p==='home')await initHome();else if(p==='shop')await initShop();else if(p==='kuji')await initKuji();else if(p==='online')await initOnline();else if(p==='activities')await initActivities();else if(p==='member')await initMember()}catch(e){console.error(e);toast('部分資料載入失敗，請重新整理')}syncCounts()});
})();