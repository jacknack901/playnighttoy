/* 頑夜 TOY 商城 UI｜v27.15.8
 * Loaded after shop-enhancements so these responsive rules win.
 */
(function(){
  'use strict';

  var VER='27.15.8';

  function $(id){return document.getElementById(id);}

  function injectFinalCss(){
    if($('wanyeFinalUiStyleV27150')) return;

    var s=document.createElement('style');
    s.id='wanyeFinalUiStyleV27150';
    s.textContent=`
      /* v27.15.8｜商城統一視覺：白底／天空藍／淡黃／淡紫 */
      .cartHeadBtnV27136{
        border:1px solid #d9deea!important;
        background:#fff!important;
        color:#41506a!important;
        border-radius:14px!important;
        box-shadow:0 4px 14px rgba(40,61,93,.04)!important;
      }
      .cartHeadBtnV27136:hover{
        border-color:#aac7ea!important;
        background:#f7fbff!important;
        color:#2f679f!important;
      }
      .cartBadgeV27136{
        background:#ffd75d!important;
        color:#5f4d0f!important;
        border:1px solid #efd06a!important;
        box-shadow:none!important;
      }

      .cartMaskV27136{
        background:rgba(43,55,74,.46)!important;
        backdrop-filter:blur(10px)!important;
      }
      .cartPanelV27136{
        width:min(800px,100%)!important;
        background:#ffffff!important;
        color:#24324a!important;
        border:1px solid #dfe5ed!important;
        border-radius:24px!important;
        box-shadow:0 30px 90px rgba(36,50,74,.22)!important;
        overflow:auto!important;
      }
      .cartHeadV27136{
        background:
          linear-gradient(135deg,#eef7ff 0%,#ffffff 56%,#fff8db 100%)!important;
        border-bottom:1px solid #e3e9f0!important;
        padding:17px 18px!important;
      }
      .cartHeadV27136:before{
        content:"";position:absolute;left:0;right:0;top:0;height:4px;
        background:linear-gradient(90deg,#4d91e6,#ffd75d,#b9a9e8);
      }
      .cartHeadV27136 strong{
        color:#26364e!important;
        font-size:20px!important;
      }
      .cartCloseV27136{
        background:#fff!important;
        color:#647187!important;
        border:1px solid #dce3eb!important;
        box-shadow:0 5px 15px rgba(44,67,98,.06)!important;
      }
      .cartCloseV27136:hover{
        background:#f3f8ff!important;
        color:#2d6ea9!important;
      }

      .cartBodyV27136{
        background:#fbfcfe!important;
        padding:16px 18px 20px!important;
      }
      .cartItemV27136{
        margin-bottom:9px!important;
        padding:12px!important;
        background:#fff!important;
        border:1px solid #e2e7ee!important;
        border-radius:16px!important;
        box-shadow:0 5px 16px rgba(35,57,86,.045)!important;
      }
      .cartItemV27136:last-child{border-bottom:1px solid #e2e7ee!important}
      .cartItemV27136 img{
        border:1px solid #edf0f4!important;
        background:#f8fafc!important;
        object-fit:contain!important;
        padding:3px!important;
      }
      .cartItemNameV27136{
        color:#2b3950!important;
        font-weight:900!important;
      }
      .cartSubV27136{color:#8994a5!important}
      .cartQtyV27136 button{
        border:1px solid #cfe0f1!important;
        background:#eef6ff!important;
        color:#326ca7!important;
      }
      .cartQtyV27136 button:hover{
        background:#dfeeff!important;
        border-color:#abccea!important;
      }
      .cartQtyV27136 input{
        border:1px solid #dce3eb!important;
        background:#fff!important;
        color:#344158!important;
        border-radius:9px!important;
      }
      .cartRemoveV27136{
        color:#a96961!important;
        background:#fff4ef!important;
        border:1px solid #efcec4!important;
        border-radius:9px!important;
        padding:7px 9px!important;
      }
      .cartRemoveV27136:hover{background:#ffe9e2!important}

      .cartCheckV271315{
        background:#eef6ff!important;
        color:#456b91!important;
        border:1px solid #cfe1f2!important;
      }
      .cartCheckV271315.bad{
        background:#fff1f3!important;
        color:#a95162!important;
        border-color:#efc7cf!important;
      }
      .cartItemV27136.blockedV271315{
        background:#fff8f7!important;
        border-color:#efc9c5!important;
        opacity:1!important;
      }
      .cartBlockedV271315{color:#b35161!important}

      .cartSummaryV27136{
        margin-top:16px!important;
        padding:15px!important;
        background:
          linear-gradient(135deg,#eef7ff 0%,#ffffff 58%,#fff9df 100%)!important;
        border:1px solid #d9e6f2!important;
        border-radius:17px!important;
      }
      .cartSummaryRowV27136{
        color:#56657b!important;
      }
      .cartSummaryRowV27136 b{color:#30445f!important}
      .cartSummaryRowV27136.total{
        padding-top:11px!important;
        margin-top:10px!important;
        border-top:1px dashed #cbd9e7!important;
        color:#2e70b4!important;
      }
      .cartSummaryRowV27136.total b{
        color:#2e70b4!important;
        font-size:22px!important;
      }

      .cartPlanV27136 label{
        color:#42526a!important;
        background:#fff!important;
        border:1px solid #dce3eb!important;
        border-radius:13px!important;
        padding:11px!important;
        transition:.16s ease!important;
      }
      .cartPlanV27136 label:hover{
        border-color:#a9cae9!important;
        background:#f7fbff!important;
      }
      .cartPlanV27136 label:has(input:checked){
        border-color:#7fb1e4!important;
        background:#eef6ff!important;
        box-shadow:0 0 0 3px rgba(77,145,230,.08)!important;
      }
      .cartPlanV27136 input{accent-color:#4d91e6!important}

      .cartBankV27136{
        background:#fff9df!important;
        color:#5e552c!important;
        border:1px solid #efdf98!important;
        border-radius:15px!important;
      }
      .cartBankV27136 b{
        color:#384b63!important;
        letter-spacing:.06em!important;
      }

      .cartFormV27136 label{color:#68758a!important;font-weight:850!important}
      .cartFormV27136 input,
      .cartFormV27136 textarea{
        border:1px solid #dce3eb!important;
        background:#fff!important;
        color:#2d3a50!important;
        border-radius:11px!important;
        outline:none!important;
      }
      .cartFormV27136 input:focus,
      .cartFormV27136 textarea:focus{
        border-color:#8db7e4!important;
        box-shadow:0 0 0 3px rgba(77,145,230,.08)!important;
      }

      .cartActionsV27136{margin-top:16px!important}
      .cartPrimaryV27136{
        background:linear-gradient(135deg,#5ba0ea,#3e82cf)!important;
        color:#fff!important;
        box-shadow:0 8px 20px rgba(77,145,230,.18)!important;
      }
      .cartPrimaryV27136:hover{filter:brightness(.98)}
      .cartSecondaryV27136{
        background:#f2f4f7!important;
        color:#637086!important;
        border:1px solid #dfe4ea!important;
      }
      .cartAddBtnV27136{
        background:#4d91e6!important;
        border:1px solid #4d91e6!important;
        color:#fff!important;
      }

      .cartEmptyV27136{
        color:#8994a5!important;
        background:#fff!important;
        border:1px dashed #d8e0e8!important;
        border-radius:16px!important;
        margin:4px 0!important;
      }
      .cartToastV27136{
        background:#31435c!important;
        color:#fff!important;
        border:1px solid rgba(255,255,255,.18)!important;
        box-shadow:0 10px 30px rgba(36,50,74,.18)!important;
      }

      .lookupInputRowV27136 input{
        border:1px solid #dce3eb!important;
        background:#fff!important;
        color:#2d3a50!important;
      }
      .lookupInputRowV27136 button{
        background:#4d91e6!important;
        color:#fff!important;
      }
      .lookupOrderV27136{
        border:1px solid #e0e6ed!important;
        background:#fff!important;
        color:#344158!important;
        box-shadow:0 4px 14px rgba(40,61,93,.04)!important;
      }
      .lookupOrderV27136 .oid{color:#8794a6!important}
      .lookupStatusV27136 span{
        background:#eef6ff!important;
        color:#3b6f9e!important;
        border:1px solid #d2e5f7!important;
      }
      .lookupNoticeV27136{color:#7f8b9d!important}
      .cartErrorV27136{
        color:#a94d61!important;
        background:#fff1f3!important;
        border:1px solid #efc7cf!important;
        border-radius:10px!important;
        padding:9px 10px!important;
      }
      .cartOkV27136{
        color:#347b57!important;
        background:#edf9f2!important;
        border:1px solid #c9ead6!important;
        border-radius:10px!important;
        padding:9px 10px!important;
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

        .cartMaskV27136{align-items:flex-end!important;padding:0!important}
        .cartPanelV27136{
          width:100%!important;
          max-height:94dvh!important;
          border-radius:24px 24px 0 0!important;
          border-bottom:0!important;
        }
        .cartBodyV27136{padding:13px 12px 18px!important}
        .cartItemV27136{grid-template-columns:62px 1fr!important}
        .cartItemV27136 img{width:62px!important;height:62px!important}
        .cartRemoveV27136{grid-column:2!important;justify-self:start!important}

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
