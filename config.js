// 頑夜 GitHub Pages 公開前台設定｜v27.16.4
window.WANWAN_GAS_EXEC_URL = 'https://script.google.com/macros/s/AKfycbxLJqANquTNnLlY7Zb5tR851EobSPTAsVho5SxYjBv2quX-B7uOqyBEcj5BdG5m8xw/exec';
window.WANWAN_HOME_URL = 'https://jacknack901.github.io/playnighttoy/';
window.WANWAN_SHOP_URL = 'https://jacknack901.github.io/playnighttoy/shop.html';
window.WANWAN_SITE_BASE_URL = 'https://jacknack901.github.io/playnighttoy/';
window.WANWAN_OFFICIAL_LINE_URL = 'https://lin.ee/sUCSbJV';
window.WANWAN_SHOP_FRONTEND_VERSION = '27.15.3';
window.WANWAN_HOME_FRONTEND_VERSION = '27.16.4';

(function(){
  'use strict';

  function addOfficialLineButton(){
    if(document.getElementById('wanyeOfficialLineV27160'))return;

    var style=document.createElement('style');
    style.id='wanyeOfficialLineStyleV27160';
    style.textContent=[
      '#wanyeOfficialLineV27160{position:fixed;right:18px;bottom:20px;z-index:99980;display:flex;align-items:center;gap:8px;text-decoration:none;background:#06c755;color:#fff;border-radius:999px;padding:10px 14px 10px 10px;box-shadow:0 10px 32px rgba(0,0,0,.22);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;font-weight:900}',
      '#wanyeOfficialLineV27160 .lineIcon{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;color:#06c755;font-size:11px;font-weight:1000}',
      '#wanyeOfficialLineV27160 .lineText{font-size:12px;white-space:nowrap}',
      '@media(max-width:680px){#wanyeOfficialLineV27160{right:12px;bottom:78px;padding:8px}#wanyeOfficialLineV27160 .lineIcon{width:40px;height:40px}#wanyeOfficialLineV27160 .lineText{display:none}}'
    ].join('');
    document.head.appendChild(style);

    var a=document.createElement('a');
    a.id='wanyeOfficialLineV27160';
    a.href=String(window.WANWAN_OFFICIAL_LINE_URL||'https://lin.ee/sUCSbJV');
    a.target='_blank';
    a.rel='noopener';
    a.setAttribute('aria-label','官方 LINE');
    a.innerHTML='<span class="lineIcon">LINE</span><span class="lineText">官方 LINE</span>';
    document.body.appendChild(a);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addOfficialLineButton);
  else addOfficialLineButton();
})();
