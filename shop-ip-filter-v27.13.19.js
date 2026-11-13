(function(){
  'use strict';
  var VER='27.13.19';
  var ACTIVE_IP_V271319='';
  var ACTIVE_SEARCH_V271319='';
  var PREV_SEARCH_V271319='';
  var DISCOVERED_V271319={};

  var RULES_V271319=[
    {label:'寶可夢',aliases:['寶可夢','Pokemon','Pokémon','皮卡丘','伊布','噴火龍','妙蛙種子','傑尼龜']},
    {label:'航海王',aliases:['航海王','海賊王','ONE PIECE','One Piece']},
    {label:'鬼滅之刃',aliases:['鬼滅之刃','鬼滅']},
    {label:'七龍珠',aliases:['七龍珠','Dragon Ball','DRAGON BALL']},
    {label:'獵人',aliases:['HUNTER×HUNTER','HUNTER X HUNTER','獵人']},
    {label:'JOJO的奇妙冒險',aliases:['JOJO的奇妙冒險','JOJO']},
    {label:'原神',aliases:['原神','Genshin']},
    {label:'魔法少女小圓',aliases:['魔法少女小圓','魔法少女まどか','Madoka Magica','瓦爾普吉斯的迴天','美樹沙耶香','佐倉杏子']},
    {label:'崩壞：星穹鐵道',aliases:['崩壞：星穹鐵道','崩壞 星穹鐵道','星穹鐵道','Honkai Star Rail']},
    {label:'絕區零',aliases:['絕區零','Zenless Zone Zero','ZZZ']},
    {label:'賽馬娘',aliases:['賽馬娘','Uma Musume','春烏菈菈','春烏拉拉','初春烏拉拉']},
    {label:'槍彈辯駁',aliases:['槍彈辯駁','彈丸論破','Danganronpa']},
    {label:'吉伊卡哇',aliases:['吉伊卡哇','ちいかわ','Chiikawa']},
    {label:'鋼彈',aliases:['鋼彈','GUNDAM','Gundam']},
    {label:'Hololive',aliases:['Hololive','HOLOLIVE','hololive']},
    {label:'初音未來',aliases:['初音未來','初音ミク','Hatsune Miku','MIKU']},
    {label:'咒術迴戰',aliases:['咒術迴戰','咒術回戰','Jujutsu Kaisen']},
    {label:'火影忍者',aliases:['火影忍者','NARUTO','Naruto']},
    {label:'BLEACH',aliases:['BLEACH','死神']},
    {label:'我的英雄學院',aliases:['我的英雄學院','我英','My Hero Academia']},
    {label:'SPY×FAMILY',aliases:['SPY×FAMILY','SPY X FAMILY','間諜家家酒']},
    {label:'鏈鋸人',aliases:['鏈鋸人','電鋸人','Chainsaw Man']},
    {label:'葬送的芙莉蓮',aliases:['葬送的芙莉蓮','芙莉蓮','Frieren']},
    {label:'Re:從零開始',aliases:['Re:從零開始','Re：從零開始','RE:ZERO','Re:Zero']},
    {label:'刀劍神域',aliases:['刀劍神域','Sword Art Online','SAO']},
    {label:'新世紀福音戰士',aliases:['新世紀福音戰士','EVANGELION','EVA']},
    {label:'孤獨搖滾',aliases:['孤獨搖滾','Bocchi the Rock']},
    {label:'戀上換裝娃娃',aliases:['戀上換裝娃娃','更衣人偶墜入愛河','海夢','My Dress-Up Darling']},
    {label:'藍色監獄',aliases:['藍色監獄','Blue Lock']},
    {label:'藍色檔案',aliases:['藍色檔案','蔚藍檔案','Blue Archive']},
    {label:'遊戲王',aliases:['遊戲王','Yu-Gi-Oh','YUGIOH']},
    {label:'美少女戰士',aliases:['美少女戰士','Sailor Moon']},
    {label:'光之美少女',aliases:['光之美少女','光美','Precure','Pretty Cure']},
    {label:'三麗鷗',aliases:['三麗鷗','Sanrio','SANRIO','Hello Kitty','酷洛米','大耳狗','布丁狗']},
    {label:'卡比',aliases:['星之卡比','卡比','Kirby']},
    {label:'蠟筆小新',aliases:['蠟筆小新','Crayon Shin-chan','小新']},
    {label:'哆啦A夢',aliases:['哆啦A夢','Doraemon']},
    {label:'排球少年',aliases:['排球少年','Haikyu']},
    {label:'進擊的巨人',aliases:['進擊的巨人','Attack on Titan']},
    {label:'葬送的芙莉蓮',aliases:['葬送的芙莉蓮','芙莉蓮','Frieren']},
    {label:'精靈村',aliases:['精靈村']},
    {label:'銀河特快車',aliases:['銀河特快車']}
  ];

  var GENERIC_V271319={
    'GSC':1,'HOBBYCHATON':1,'GOOD':1,'SMILE':1,'GOODSMILE':1,'VERTEX':1,'ALTER':1,'BANDAI':1,'BANPRESTO':1,'SEGA':1,'TAITO':1,'FURYU':1,'KOTOBUKIYA':1,'MEGAHOUSE':1,
    'PVC':1,'GK':1,'DX':1,'SP':1,'FIGURE':1,'公仔':1,'景品':1,'模型':1,'雕像':1,'預購':1,'再販':1,'限定':1,'無比例':1,'黏土人':1,'黏土娃':1,
    'POP':1,'UP':1,'PARADE':1,'LOOK':1,'一番賞':1,'盲盒':1,'扭蛋':1,'盒玩':1,'中盒':1,'套組':1,'SET':1
  };

  function normV271319(s){return String(s||'').replace(/[\u3000]/g,' ').replace(/\s+/g,' ').trim();}
  function findKnownV271319(name){
    var raw=normV271319(name),low=raw.toLowerCase();
    for(var i=0;i<RULES_V271319.length;i++){
      var r=RULES_V271319[i];
      for(var j=0;j<r.aliases.length;j++){
        var a=String(r.aliases[j]||'');
        if(a&&low.indexOf(a.toLowerCase())>=0)return {label:r.label,search:a,aliases:r.aliases.slice(),known:true};
      }
    }
    return null;
  }
  function guessV271319(name){
    var s=normV271319(name)
      .replace(/[（(][^）)]*[）)]/g,' ')
      .replace(/【[^】]*】/g,' ')
      .replace(/\[[^\]]*\]/g,' ')
      .replace(/\b\d+\/\d+\b/g,' ')
      .replace(/\b\d+(?:\.\d+)?\s*(?:cm|CM|mm|MM)\b/g,' ')
      .replace(/黏土人\s*\d+(?:-DX)?/gi,' ')
      .replace(/POP\s*UP\s*PARADE(?:\s*BQ)?/gi,' ')
      .replace(/\b(?:PVC|GK|DX|SP|FIGURE|GSC|HOBBYCHATON|VERTEX|ALTER|BANDAI|BANPRESTO|SEGA|TAITO|FURYU|KOTOBUKIYA|MEGAHOUSE)\b/gi,' ')
      .replace(/無比例|比例|再販|預購|限定|景品|公仔|模型|雕像|驚喜黏土人|黏土娃/g,' ')
      .replace(/[｜|／/,:：·・]+/g,' ')
      .replace(/\s+/g,' ').trim();
    if(!s)return null;
    var parts=s.split(' ').filter(Boolean);
    for(var i=0;i<parts.length;i++){
      var t=parts[i].replace(/^\d+[.-]?/,'').trim();
      if(!t||GENERIC_V271319[t.toUpperCase()])continue;
      if(/^\d+$/.test(t))continue;
      if(t.length<2)continue;
      if(/^(?:第?\d+|L|S|M|XL)$/i.test(t))continue;
      return {label:t,search:t,aliases:[t],known:false};
    }
    return null;
  }
  function inferV271319(name){return findKnownV271319(name)||guessV271319(name);}

  function rememberV271319(item){
    if(!item||!item.name)return;
    var ip=inferV271319(item.name);if(!ip)return;
    var key=ip.label;
    if(!DISCOVERED_V271319[key])DISCOVERED_V271319[key]={label:key,search:ip.search,known:ip.known,ids:{}};
    if(item.id)DISCOVERED_V271319[key].ids[String(item.id)]=1;
  }
  function discoverV271319(){
    try{
      var all=[];
      if(window.SHOP_DATA&&Array.isArray(window.SHOP_DATA.items))all=all.concat(window.SHOP_DATA.items);
      if(window.FEATURED_V275){if(Array.isArray(window.FEATURED_V275.direct))all=all.concat(window.FEATURED_V275.direct);if(Array.isArray(window.FEATURED_V275.closing))all=all.concat(window.FEATURED_V275.closing);}
      if(window.FOCUS_ITEM)all.push(window.FOCUS_ITEM);
      all.forEach(rememberV271319);
    }catch(e){}
  }
  function listV271319(){
    return Object.keys(DISCOVERED_V271319).map(function(k){var x=DISCOVERED_V271319[k],n=Object.keys(x.ids||{}).length;return {label:x.label,search:x.search,known:x.known,count:n};}).sort(function(a,b){if(a.known!==b.known)return a.known?-1:1;if(b.count!==a.count)return b.count-a.count;return a.label.localeCompare(b.label,'zh-Hant');});
  }
  function escV271319(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function injectStyleV271319(){
    if(document.getElementById('wanyeIpStyleV271319'))return;
    var s=document.createElement('style');s.id='wanyeIpStyleV271319';s.textContent='\n#wanyeIpWrapV271319{margin-top:8px;padding:9px 10px 10px;border:1px solid var(--line,#34283f);background:rgba(21,17,27,.82);border-radius:14px}#wanyeIpWrapV271319 .ipHeadV271319{display:flex;align-items:center;gap:8px;margin-bottom:6px;color:#d9cfe2;font-size:12px;font-weight:900}#wanyeIpWrapV271319 .ipHeadV271319 small{color:var(--sub,#ad9fba);font-weight:600}.ipTagV271319{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:999px;background:#2d2140;border:1px solid #55406d;color:#d9c5f5;font-size:10px;font-weight:900;vertical-align:1px}@media(max-width:650px){#wanyeIpWrapV271319{padding:8px}#wanyeIpWrapV271319 .chip{font-size:12px;padding:7px 10px}}';document.head.appendChild(s);
  }
  function ensureUiV271319(){
    var cats=document.getElementById('categoryChips'),search=document.getElementById('search');if(!cats||!search)return false;
    injectStyleV271319();
    var wrap=document.getElementById('wanyeIpWrapV271319');
    if(!wrap){wrap=document.createElement('div');wrap.id='wanyeIpWrapV271319';wrap.innerHTML='<div class="ipHeadV271319">🎯 作品 / IP <small>依商品名稱自動判斷</small></div><div id="wanyeIpChipsV271319" class="chips"></div>';cats.insertAdjacentElement('afterend',wrap);}
    if(search.dataset.ipBoundV271319!=='1'){
      search.dataset.ipBoundV271319='1';
      search.addEventListener('input',function(){
        var v=String(search.value||'').trim();
        if(ACTIVE_IP_V271319&&v!==ACTIVE_SEARCH_V271319){ACTIVE_IP_V271319='';ACTIVE_SEARCH_V271319='';renderChipsV271319();}
      });
    }
    return true;
  }
  function selectIpV271319(label,searchTerm){
    var search=document.getElementById('search');if(!search)return;
    if(!ACTIVE_IP_V271319)PREV_SEARCH_V271319=String(search.value||'');
    ACTIVE_IP_V271319=label;ACTIVE_SEARCH_V271319=searchTerm;
    search.value=searchTerm;
    renderChipsV271319();
    search.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function clearIpV271319(){
    var search=document.getElementById('search');if(!search)return;
    var restore=ACTIVE_IP_V271319?PREV_SEARCH_V271319:String(search.value||'');
    ACTIVE_IP_V271319='';ACTIVE_SEARCH_V271319='';PREV_SEARCH_V271319='';
    search.value=restore||'';
    renderChipsV271319();
    search.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function renderChipsV271319(){
    if(!ensureUiV271319())return;
    discoverV271319();
    var box=document.getElementById('wanyeIpChipsV271319');if(!box)return;
    var arr=listV271319();
    var html='<button type="button" class="chip '+(!ACTIVE_IP_V271319?'active':'')+'" data-ip-clear="1">全部 IP</button>';
    html+=arr.map(function(x){return '<button type="button" class="chip '+(ACTIVE_IP_V271319===x.label?'active':'')+'" data-ip-label="'+escV271319(x.label)+'" data-ip-search="'+escV271319(x.search)+'">'+escV271319(x.label)+'</button>';}).join('');
    box.innerHTML=html;
    var clear=box.querySelector('[data-ip-clear]');if(clear)clear.onclick=clearIpV271319;
    box.querySelectorAll('[data-ip-label]').forEach(function(b){b.onclick=function(){selectIpV271319(b.getAttribute('data-ip-label')||'',b.getAttribute('data-ip-search')||'');};});
  }
  function decorateCardsV271319(){
    document.querySelectorAll('#grid .card,#featuredGridV275 .card').forEach(function(card){
      var nameEl=card.querySelector('.name'),cat=card.querySelector('.cat');if(!nameEl||!cat)return;
      var ip=inferV271319(nameEl.textContent||'');if(!ip)return;
      var old=cat.querySelector('.ipTagV271319');if(old)old.remove();
      var tag=document.createElement('span');tag.className='ipTagV271319';tag.textContent='IP｜'+ip.label;cat.appendChild(tag);
    });
  }
  function refreshV271319(){discoverV271319();renderChipsV271319();decorateCardsV271319();}
  function watchV271319(){
    var pending=false,run=function(){if(pending)return;pending=true;setTimeout(function(){pending=false;refreshV271319();},30);};
    ['grid','featuredGridV275','categoryChips'].forEach(function(id){var el=document.getElementById(id);if(el)new MutationObserver(run).observe(el,{childList:true,subtree:true});});
    window.addEventListener('popstate',run);run();
    var tries=0,t=setInterval(function(){tries++;run();if(tries>40)clearInterval(t);},500);
  }
  function initV271319(){if(!document.getElementById('categoryChips')||!document.getElementById('search'))return;watchV271319();}
  window.WANYE_IP_FILTER_VERSION=VER;
  window.wanyeInferIpV271319=inferV271319;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initV271319);else initV271319();
})();
