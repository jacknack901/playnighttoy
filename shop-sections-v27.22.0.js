/* 頑夜 TOY 商城前台分類｜v27.22.0
 * 上方順序：全部商品｜預購商品｜寶可夢中心｜一番賞整套｜現貨商品｜結單商品｜線上抽賞
 * 一番賞整套目前只建立入口與 hook；正式辨識規則待後續提供。
 */
(function(){
  'use strict';
  var VER='27.22.0';

  function isPokemonCenter(item){
    if(!item)return false;
    var hay=[item.category,item.tags,item.tag,item.note,item.sourceName,item.source,item.marketplaceSource]
      .join(' ').toUpperCase();
    return hay.indexOf('寶可夢中心')>=0 || hay.indexOf('POKÉMON CENTER')>=0 || hay.indexOf('POKEMON CENTER')>=0;
  }

  function isIchibanSet(item){
    if(!item)return false;
    // 目前只接受明確標記，不會把一般「一番賞」商品誤歸類。
    var hay=[item.category,item.tags,item.tag,item.note,item.sourceName,item.source,item.marketplaceSource]
      .join(' ').toUpperCase();
    return hay.indexOf('一番賞整套')>=0 || hay.indexOf('整套一番賞')>=0 || hay.indexOf('ICHIBAN SET')>=0;
  }

  window.isPokemonCenterItemV27220=isPokemonCenter;
  window.isIchibanSetItemV27220=isIchibanSet;

  function arrangeTabs(){
    var tabs=document.getElementById('typeTabs');
    if(!tabs)return;
    var all=tabs.querySelector('[data-mode="all"]');
    var pre=tabs.querySelector('[data-mode="preorder"]');
    var direct=tabs.querySelector('[data-mode="direct"]');
    var closed=tabs.querySelector('[data-mode="closed"]');
    var online=tabs.querySelector('a[href*="online-kuji.html"]');

    function ensure(mode,label,cls){
      var b=tabs.querySelector('[data-mode="'+mode+'"]');
      if(!b){
        b=document.createElement('button');
        b.type='button';
        b.setAttribute('data-mode',mode);
        b.className='typeTab '+(cls||'');
      }
      b.textContent=label;
      return b;
    }

    var pc=ensure('pokemonCenter','寶可夢中心','pokemonCenterV27220');
    var set=ensure('ichibanSet','一番賞整套','ichibanSetV27220');
    if(all)all.textContent='全部商品';
    if(pre)pre.textContent='預購商品';
    if(direct)direct.textContent='現貨商品';
    if(closed)closed.textContent='結單商品';
    if(online)online.textContent='線上抽賞';

    [all,pre,pc,set,direct,closed,online].forEach(function(el){if(el)tabs.appendChild(el);});

    if(typeof window.renderModeTabs==='function')window.renderModeTabs();
  }

  function specialFilter(arr,mode){
    arr=Array.isArray(arr)?arr:[];
    if(mode==='pokemonCenter')return arr.filter(function(x){return x&&!x.isClosed&&isPokemonCenter(x);});
    if(mode==='ichibanSet')return arr.filter(function(x){return x&&!x.isClosed&&isIchibanSet(x);});
    return arr;
  }

  var oldClientFiltered=window.clientFilteredProducts;
  if(typeof oldClientFiltered==='function'){
    window.clientFilteredProducts=function(){
      var arr=oldClientFiltered.apply(this,arguments)||[];
      return specialFilter(arr,window.ACTIVE_MODE);
    };
  }

  var oldAvailableCats=window.clientAvailableCategories;
  if(typeof oldAvailableCats==='function'){
    window.clientAvailableCategories=function(){
      if(window.ACTIVE_MODE!=='pokemonCenter'&&window.ACTIVE_MODE!=='ichibanSet'){
        return oldAvailableCats.apply(this,arguments);
      }
      var arr=specialFilter((window.ALL_PRODUCTS_CACHE||[]).slice(),window.ACTIVE_MODE);
      if(window.ACTIVE_IP){
        arr=arr.filter(function(x){
          var ip=typeof window.inferIp==='function'?window.inferIp(x&&x.name):null;
          if(isPokemonCenter(x))ip={label:'寶可夢'};
          return !!(ip&&ip.label===window.ACTIVE_IP);
        });
      }
      var seen={},cats=[];
      arr.forEach(function(x){
        var c=typeof window.categoryOf==='function'?window.categoryOf(x):String((x&&x.category)||'');
        if(c&&!seen[c]){seen[c]=1;cats.push(c);}
      });
      return typeof window.sortProductCategories==='function'?window.sortProductCategories(cats):cats;
    };
  }

  var oldRender=window.render;
  if(typeof oldRender==='function'){
    window.render=function(){
      // 完整商品快取還沒完成時，也不要短暫把其他商品顯示在專區裡。
      var restoreItems=null,restoreTotal=null;
      if((window.ACTIVE_MODE==='pokemonCenter'||window.ACTIVE_MODE==='ichibanSet')&&!window.ALL_PRODUCTS_READY&&window.SHOP_DATA){
        restoreItems=window.SHOP_DATA.items;
        restoreTotal=window.SHOP_TOTAL;
        window.SHOP_DATA.items=specialFilter((restoreItems||[]).slice(),window.ACTIVE_MODE);
        window.SHOP_TOTAL=window.SHOP_DATA.items.length;
      }
      oldRender.apply(this,arguments);
      if(restoreItems!==null){window.SHOP_DATA.items=restoreItems;window.SHOP_TOTAL=restoreTotal;}
      var title=document.getElementById('resultTitle');
      if(title&&window.ACTIVE_MODE==='pokemonCenter')title.textContent='寶可夢中心｜寶可夢系列';
      if(title&&window.ACTIVE_MODE==='ichibanSet')title.textContent='一番賞整套';
    };
  }

  var oldCard=window.cardHtml;
  if(typeof oldCard==='function'){
    window.cardHtml=function(x,i,featureTag){
      var html=oldCard.apply(this,arguments);
      if(!html)return html;
      var badges='';
      if(isPokemonCenter(x)){
        if(html.indexOf('>寶可夢</span>')<0)badges+='<span class="badge ip">寶可夢</span>';
        badges+='<span class="badge pokemonCenterBadgeV27220">寶可夢中心</span>';
      }
      if(isIchibanSet(x))badges+='<span class="badge ichibanSetBadgeV27220">一番賞整套</span>';
      return badges?html.replace('<div class="badges">','<div class="badges">'+badges):html;
    };
  }

  function injectCss(){
    if(document.getElementById('shopSectionsStyleV27220'))return;
    var s=document.createElement('style');
    s.id='shopSectionsStyleV27220';
    s.textContent='\
      .typeTab.pokemonCenterV27220.active{background:#fff4c7!important;color:#625000!important;box-shadow:inset 0 0 0 1px #efd46b!important}\
      .typeTab.ichibanSetV27220.active{background:#f2edff!important;color:#665195!important;box-shadow:inset 0 0 0 1px #d8ccf5!important}\
      .pokemonCenterBadgeV27220{background:#fff4c7!important;border-color:#efd46b!important;color:#625000!important}\
      .ichibanSetBadgeV27220{background:#f2edff!important;border-color:#d8ccf5!important;color:#665195!important}\
    ';
    document.head.appendChild(s);
  }

  function invalidateOldCache(){
    try{
      window.ALL_PRODUCTS_CACHE_KEY='WANYE_SHOP_ALL_V27220';
      sessionStorage.removeItem('WANYE_SHOP_ALL_V27157');
      sessionStorage.removeItem('WANYE_SHOP_ALL_V27211');
    }catch(e){}
  }

  function init(){
    injectCss();
    invalidateOldCache();
    arrangeTabs();
    if(window.ALL_PRODUCTS_READY&&typeof window.applyClientFilters==='function')window.applyClientFilters();
  }

  window.WANYE_SHOP_SECTIONS_VERSION=VER;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
