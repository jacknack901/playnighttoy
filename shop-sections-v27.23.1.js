/* 頑夜 TOY 商城前台分類｜v27.23.1 */
(function(){
  'use strict';

  var VER='27.24.2';
  var DIRECT_MARKET_URL_V27231='https://myship.7-11.com.tw/general/detail/GM2611179779077';

  function sourceTextV27231_(x){
    x=x||{};
    return [
      x.name,x.category,x.tags,x.tag,x.note,x.notes,x.remark,x.memo,
      x.sourceWebsite,x.sourceName,x.source,x.referenceUrl,x.referenceURL,
      x.importKey,x.importIdentity,x.importId
    ].join(' ').toUpperCase();
  }

  function isPokemonCenterV27231_(x){
    var s=sourceTextV27231_(x);
    return s.indexOf('POKÉMON CENTER')>=0 ||
      s.indexOf('POKEMON CENTER')>=0 ||
      s.indexOf('寶可夢中心')>=0;
  }

  function isIchibanSetV27231_(x){
    var s=sourceTextV27231_(x);
    return s.indexOf('一番賞整套')>=0 ||
      s.indexOf('整套一番賞')>=0 ||
      s.indexOf('ICHIBAN SET')>=0;
  }

  window.isPokemonCenterV27231_=isPokemonCenterV27231_;
  window.isIchibanSetV27231_=isIchibanSetV27231_;

  function rebuildTabs(){
    var tabs=document.getElementById('typeTabs');
    if(!tabs)return;

    var online=tabs.querySelector('a[href*="online-kuji.html"]');
    tabs.innerHTML='';

    function btn(mode,label,cls){
      var b=document.createElement('button');
      b.type='button';
      b.className='typeTab '+(cls||'');
      b.setAttribute('data-mode',mode);
      b.textContent=label;
      return b;
    }

    tabs.appendChild(btn('all','全部商品','active'));
    tabs.appendChild(btn('preorder','預購商品','pre'));
    tabs.appendChild(btn('pokemonCenter','寶可夢中心',''));
    tabs.appendChild(btn('ichibanSet','一番賞整套',''));
    tabs.appendChild(btn('direct','現貨商品','direct'));
    tabs.appendChild(btn('closed','結單商品','closed'));

    if(online){
      online.textContent='線上抽賞';
      tabs.appendChild(online);
    }else{
      var a=document.createElement('a');
      a.className='typeTab';
      a.href='./online-kuji.html';
      a.style.cssText='text-decoration:none;display:inline-flex;align-items:center;justify-content:center';
      a.textContent='線上抽賞';
      tabs.appendChild(a);
    }

    if(typeof window.renderModeTabs==='function')window.renderModeTabs();
  }

  function patchModeFilters(){
    var oldFiltered=window.clientFilteredProducts;
    if(typeof oldFiltered==='function'&&!oldFiltered.__v27231){
      var wrapped=function(){
        var arr=oldFiltered.apply(this,arguments)||[];
        if(window.ACTIVE_MODE==='pokemonCenter'){
          arr=(window.ALL_PRODUCTS_CACHE||[]).slice().filter(function(x){
            return x&&!x.isClosed&&isPokemonCenterV27231_(x);
          });
        }else if(window.ACTIVE_MODE==='ichibanSet'){
          arr=(window.ALL_PRODUCTS_CACHE||[]).slice().filter(function(x){
            return x&&!x.isClosed&&isIchibanSetV27231_(x);
          });
        }
        return arr;
      };
      wrapped.__v27231=true;
      window.clientFilteredProducts=wrapped;
    }

    var oldCats=window.clientAvailableCategories;
    if(typeof oldCats==='function'&&!oldCats.__v27231){
      var wrappedCats=function(){
        if(window.ACTIVE_MODE!=='pokemonCenter'&&window.ACTIVE_MODE!=='ichibanSet'){
          return oldCats.apply(this,arguments);
        }
        var arr=(window.ALL_PRODUCTS_CACHE||[]).slice().filter(function(x){
          if(!x||x.isClosed)return false;
          return window.ACTIVE_MODE==='pokemonCenter'
            ? isPokemonCenterV27231_(x)
            : isIchibanSetV27231_(x);
        });
        var seen={},cats=[];
        arr.forEach(function(x){
          var c=typeof window.categoryOf==='function'?window.categoryOf(x):String((x&&x.category)||'');
          if(c&&!seen[c]){seen[c]=1;cats.push(c);}
        });
        return typeof window.sortProductCategories==='function'?window.sortProductCategories(cats):cats;
      };
      wrappedCats.__v27231=true;
      window.clientAvailableCategories=wrappedCats;
    }
  }

  function patchRender(){
    var oldRender=window.render;
    if(typeof oldRender==='function'&&!oldRender.__v27231){
      var wrapped=function(){
        var out=oldRender.apply(this,arguments);
        var title=document.getElementById('resultTitle');
        if(title&&window.ACTIVE_MODE==='preorder')title.textContent='預購商品';
        if(title&&window.ACTIVE_MODE==='pokemonCenter')title.textContent='寶可夢中心｜寶可夢系列';
        if(title&&window.ACTIVE_MODE==='ichibanSet')title.textContent='一番賞整套';
        if(title&&window.ACTIVE_MODE==='closed')title.textContent='結單商品／歷史商品';
        return out;
      };
      wrapped.__v27231=true;
      window.render=wrapped;
    }
  }

  function patchCards(){
    var oldCard=window.cardHtml;
    if(typeof oldCard==='function'&&!oldCard.__v27231){
      var wrapped=function(x,i,featureTag){
        if(window.SHOP_DATA)window.SHOP_DATA.directMarketUrl=DIRECT_MARKET_URL_V27231;
        var html=oldCard.apply(this,arguments);
        if(!html)return html;

        if(x&&x.type==='直購'){
          html=html.replace(/<a class="buy buyLink" href="[^"]*"/g,
            '<a class="buy buyLink" href="'+DIRECT_MARKET_URL_V27231+'"');
        }

        if(isPokemonCenterV27231_(x)){
          html=html.replace(/<div class="meta">[^<]*<\/div>/,
            '<div class="meta">預計到貨 約 2 週</div>');
          html=html.replace('<div class="badges">',
            '<div class="badges"><span class="badge ip">寶可夢中心</span>');
        }

        if(isIchibanSetV27231_(x)){
          html=html.replace('<div class="badges">',
            '<div class="badges"><span class="badge ip">一番賞整套</span>');
        }

        return html;
      };
      wrapped.__v27231=true;
      window.cardHtml=wrapped;
    }
  }

  function patchOpenOrder(){
    var oldOpen=window.openOrder;
    if(typeof oldOpen==='function'&&!oldOpen.__v27231){
      var wrapped=function(id){
        var x=typeof window.findProduct==='function'?window.findProduct(id):null;
        if(x&&x.type==='直購'){
          window.open(DIRECT_MARKET_URL_V27231,'_blank','noopener');
          return;
        }
        return oldOpen.apply(this,arguments);
      };
      wrapped.__v27231=true;
      window.openOrder=wrapped;
    }
  }

  function bustCache(){
    try{
      window.ALL_PRODUCTS_CACHE_KEY='WANYE_SHOP_ALL_V27242';
      [
        'WANYE_SHOP_ALL_V27157',
        'WANYE_SHOP_ALL_V27211',
        'WANYE_SHOP_ALL_V27220',
        'WANYE_SHOP_ALL_V27221',
        'WANYE_SHOP_ALL_V27231'
      ].forEach(function(k){sessionStorage.removeItem(k);});
    }catch(e){}
  }

  function init(){
    bustCache();
    patchModeFilters();
    patchRender();
    patchCards();
    patchOpenOrder();
    rebuildTabs();

    if(window.SHOP_DATA)window.SHOP_DATA.directMarketUrl=DIRECT_MARKET_URL_V27231;
    if(window.ALL_PRODUCTS_READY&&typeof window.applyClientFilters==='function'){
      window.applyClientFilters();
    }
  }

  window.WANYE_SHOP_SECTIONS_VERSION=VER;

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){setTimeout(init,0);});
  }else{
    setTimeout(init,0);
  }
})();