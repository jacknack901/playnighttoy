// 頑夜 GitHub Pages 公開前台設定｜v27.13.9
window.WANWAN_GAS_EXEC_URL = 'https://script.google.com/macros/s/AKfycbxLJqANquTNnLlY7Zb5tR851EobSPTAsVho5SxYjBv2quX-B7uOqyBEcj5BdG5m8xw/exec';
window.WANWAN_HOME_URL = 'https://jacknack901.github.io/playnighttoy/';
window.WANWAN_SHOP_URL = 'https://jacknack901.github.io/playnighttoy/shop.html';
window.WANWAN_SITE_BASE_URL = 'https://jacknack901.github.io/playnighttoy/';
window.WANWAN_OFFICIAL_LINE_URL = 'https://lin.ee/sUCSbJV';

(function(){
  'use strict';
  function addOfficialLineButtonV27139(){
    if(document.getElementById('wanyeOfficialLineV27139')) return;
    var style=document.createElement('style');
    style.id='wanyeOfficialLineStyleV27139';
    style.textContent='\n#wanyeOfficialLineV27139{position:fixed;right:18px;bottom:20px;z-index:99980;display:flex;align-items:center;gap:8px;text-decoration:none;background:#06c755;color:#fff;border-radius:999px;padding:10px 14px 10px 10px;box-shadow:0 10px 32px rgba(0,0,0,.28);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;font-weight:900;transition:transform .18s,box-shadow .18s}#wanyeOfficialLineV27139:hover{transform:translateY(-2px);box-shadow:0 14px 38px rgba(0,0,0,.34)}#wanyeOfficialLineV27139 .lineIconV27139{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#fff;color:#06c755;font-size:12px;font-weight:1000;letter-spacing:-.5px}#wanyeOfficialLineV27139 .lineTextV27139{font-size:13px;white-space:nowrap}@media(max-width:640px){#wanyeOfficialLineV27139{right:12px;bottom:14px;padding:8px}#wanyeOfficialLineV27139 .lineIconV27139{width:42px;height:42px}#wanyeOfficialLineV27139 .lineTextV27139{display:none}}';
    document.head.appendChild(style);
    var a=document.createElement('a');
    a.id='wanyeOfficialLineV27139';
    a.href=String(window.WANWAN_OFFICIAL_LINE_URL||'https://lin.ee/sUCSbJV');
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.setAttribute('aria-label','聯繫頑夜 TOY 官方 LINE');
    a.title='官方 LINE 聯繫';
    a.innerHTML='<span class="lineIconV27139">LINE</span><span class="lineTextV27139">官方 LINE</span>';
    document.body.appendChild(a);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addOfficialLineButtonV27139);
  else addOfficialLineButtonV27139();
})();
