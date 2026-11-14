/* 頑夜 TOY 商城 UI｜v27.15.7
 * Loaded after shop-enhancements so these responsive rules win.
 */
(function(){
  'use strict';

  var VER='27.15.7';

  function $(id){return document.getElementById(id);}

  function injectFinalCss(){
    if($('wanyeFinalUiStyleV27150')) return;

    var s=document.createElement('style');
    s.id='wanyeFinalUiStyleV27150';
    s.textContent=`
      .cartHeadBtnV27136{
        border:1px solid #d9deea!important;
        background:#fff!important;
        color:#41506a!important;
        border-radius:14px!important;
        box-shadow:none!important;
      }
      .cartBadgeV27136{
        background:#ffd75d!important;
        color:#544510!important;
      }
      .cartPanelV27136{
        background:#fff!important;
        color:#24324a!important;
      }

      .mobileShopNavV27150{display:none}

      @media(max-width:720px){
        #wanyeOfficialLineV27140,#wanyeOfficialLineV27139{
          bottom:78px!important;
          right:10px!important;
        }

        .head{
          grid-template-columns:minmax(0,1fr) auto!important;
          grid-template-rows:auto auto!important;
          gap:8px!important;
          padding:9px 10px 8px!important;
        }
        .brandBlock{grid-column:1!important;grid-row:1!important}
        .headerActions{grid-column:2!important;grid-row:1!important}
        .headerSearch{grid-column:1/3!important;grid-row:2!important}

        .head #homeBtn,
        .head #cartBtnV27136{
          display:none!important;
        }
        .head #orderLookupBtnV27136{
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          height:38px!important;
          padding:0 10px!important;
          border-radius:12px!important;
          font-size:10px!important;
          white-space:nowrap!important;
        }

        .mobileShopNavV27150{
          position:fixed;left:8px;right:8px;bottom:8px;z-index:99960;
          min-height:58px;display:grid;grid-template-columns:repeat(5,1fr);
          border:1px solid #dfe4eb;border-radius:18px;background:rgba(255,255,255,.97);
          box-shadow:0 14px 40px rgba(33,50,75,.18);backdrop-filter:blur(16px);
          padding:5px;
        }
        .mobileShopNavV27150 button,
        .mobileShopNavV27150 a{
          min-width:0;border:0;background:transparent;color:#718096;text-decoration:none;
          border-radius:13px;padding:5px 2px;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:2px;font-size:9px;font-weight:850;
        }
        .mobileShopNavV27150 .ico{font-size:18px;line-height:1}
        .mobileShopNavV27150 .active{
          background:#eef6ff;color:#2f6da9;
        }
        .mobileCartCountV27150{
          position:absolute;transform:translate(9px,-9px);min-width:16px;height:16px;
          padding:0 4px;border-radius:999px;background:#ffd75d;color:#594b13;
          display:grid;place-items:center;font-size:8px;font-weight:950;
        }
      }
    `;
    document.head.appendChild(s);
  }

  function modeClick(mode){
    var b=document.querySelector('[data-mode="'+mode+'"]');
    if(b) b.click();
  }

  function injectMobileNav(){
    if($('mobileShopNavV27150')) return;

    var nav=document.createElement('div');
    nav.id='mobileShopNavV27150';
    nav.className='mobileShopNavV27150';
    nav.innerHTML=
      '<button type="button" data-mobile-mode="all"><span class="ico">⌂</span><span>商品</span></button>'+
      '<button type="button" data-mobile-mode="preorder"><span class="ico">♡</span><span>預購</span></button>'+
      '<button type="button" data-mobile-mode="direct"><span class="ico">▣</span><span>現貨</span></button>'+
      '<button type="button" data-mobile-category><span class="ico">⌗</span><span>分類</span></button>'+
      '<button type="button" data-mobile-cart style="position:relative"><span class="ico">🛒</span><span>購物車</span><span id="mobileCartCountV27150" class="mobileCartCountV27150" style="display:none">0</span></button>';

    document.body.appendChild(nav);

    nav.querySelectorAll('[data-mobile-mode]').forEach(function(b){
      b.onclick=function(){modeClick(b.getAttribute('data-mobile-mode')||'all');};
    });

    var cat=nav.querySelector('[data-mobile-category]');
    if(cat) cat.onclick=function(){
      var el=$('shopDiscover');
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    };

    var cart=nav.querySelector('[data-mobile-cart]');
    if(cart) cart.onclick=function(){
      var btn=$('cartBtnV27136');
      if(btn) btn.click();
    };
  }

  function syncMobileNav(){
    var nav=$('mobileShopNavV27150');
    if(!nav)return;

    var active='';
    document.querySelectorAll('[data-mode]').forEach(function(b){
      if(b.classList.contains('active')) active=b.getAttribute('data-mode')||'';
    });

    nav.querySelectorAll('[data-mobile-mode]').forEach(function(b){
      b.classList.toggle('active',(b.getAttribute('data-mobile-mode')||'')===active);
    });

    var desktopBadge=$('cartCountV27136');
    var mobileBadge=$('mobileCartCountV27150');
    if(mobileBadge){
      var n=desktopBadge?Number(desktopBadge.textContent||0):0;
      mobileBadge.textContent=String(n);
      mobileBadge.style.display=n>0?'grid':'none';
    }
  }

  function improveHeaderButtons(){
    var lookup=$('orderLookupBtnV27136');
    if(lookup) lookup.textContent='查訂單';

    var cart=$('cartBtnV27136');
    if(cart && !cart.dataset.cleanedV27150){
      cart.dataset.cleanedV27150='1';
      var badge=$('cartCountV27136');
      cart.innerHTML='購物車 ';
      if(badge)cart.appendChild(badge);
    }
  }

  function init(){
    injectFinalCss();
    injectMobileNav();
    improveHeaderButtons();
    syncMobileNav();

    var pending=false;
    new MutationObserver(function(){
      if(pending)return;
      pending=true;
      setTimeout(function(){
        pending=false;
        improveHeaderButtons();
        syncMobileNav();
      },40);
    }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  window.WANYE_SHOP_UI_VERSION=VER;

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  }else{
    init();
  }
})();
