(function(){
  'use strict';

  window.isPokemonCenterItemV27211=function(item){
    if(!item)return false;
    var hay=[
      item.category,item.tags,item.tag,item.note,item.sourceName,item.source,item.marketplaceSource
    ].join(' ').toUpperCase();
    return hay.indexOf('寶可夢中心')>=0 ||
      hay.indexOf('POKÉMON CENTER')>=0 ||
      hay.indexOf('POKEMON CENTER')>=0;
  };

  var oldFiltered=window.clientFilteredProducts;
  var oldCats=window.clientAvailableCategories;
  var oldRender=window.render;
  var oldCard=window.cardHtml;

  window.clientFilteredProducts=function(){
    var arr=typeof oldFiltered==='function'?oldFiltered():[];
    if(window.ACTIVE_MODE==='pokemonCenter'){
      arr=arr.filter(function(x){
        return x && !x.isClosed && window.isPokemonCenterItemV27211(x);
      });
    }
    return arr;
  };

  window.clientAvailableCategories=function(){
    if(window.ACTIVE_MODE!=='pokemonCenter'){
      return typeof oldCats==='function'?oldCats():[];
    }
    var seen={},cats=[];
    (window.ALL_PRODUCTS_CACHE||[]).forEach(function(x){
      if(!x || x.isClosed || !window.isPokemonCenterItemV27211(x))return;
      var cat=typeof window.categoryOf==='function'?window.categoryOf(x):String(x.category||'');
      if(cat&&!seen[cat]){seen[cat]=1;cats.push(cat);}
    });
    return typeof window.sortProductCategories==='function'?window.sortProductCategories(cats):cats;
  };

  window.cardHtml=function(x,i,featureTag){
    var html=typeof oldCard==='function'?oldCard(x,i,featureTag):'';
    if(!window.isPokemonCenterItemV27211(x))return html;

    var badges='';
    if(html.indexOf('>寶可夢</span>')<0){
      badges+='<span class="badge ip">寶可夢</span>';
    }
    badges+='<span class="badge pcSourceV27211">寶可夢中心</span>';
    return html.replace('<div class="badges">','<div class="badges">'+badges);
  };

  window.render=function(){
    if(typeof oldRender==='function')oldRender();
    if(window.ACTIVE_MODE==='pokemonCenter'){
      var t=document.getElementById('resultTitle');
      if(t)t.textContent='寶可夢中心｜寶可夢系列';
    }
  };

  var tabs=document.getElementById('typeTabs');
  if(tabs && !tabs.querySelector('[data-mode="pokemonCenter"]')){
    var btn=document.createElement('button');
    btn.className='typeTab pokemonCenter';
    btn.type='button';
    btn.setAttribute('data-mode','pokemonCenter');
    btn.textContent='寶可夢中心';
    var preorder=tabs.querySelector('[data-mode="preorder"]');
    if(preorder && preorder.nextSibling)tabs.insertBefore(btn,preorder.nextSibling);
    else tabs.appendChild(btn);
  }

  if(!document.getElementById('pokemonCenterStyleV27211')){
    var style=document.createElement('style');
    style.id='pokemonCenterStyleV27211';
    style.textContent=[
      '.typeTab.pokemonCenter{font-weight:950}',
      '.typeTab.pokemonCenter.active{background:#fff6cf;color:#6d5700;box-shadow:inset 0 0 0 1px #f0d764}',
      '.pcSourceV27211{background:#fff6cf!important;border-color:#f0d764!important;color:#6d5700!important}'
    ].join('');
    document.head.appendChild(style);
  }

  try{
    window.ALL_PRODUCTS_CACHE_KEY='WANYE_SHOP_ALL_V27211';
    sessionStorage.removeItem('WANYE_SHOP_ALL_V27157');
  }catch(e){}

  if(typeof window.renderModeTabs==='function')window.renderModeTabs();
  if(window.ALL_PRODUCTS_READY && typeof window.applyClientFilters==='function'){
    window.applyClientFilters();
  }
})();
