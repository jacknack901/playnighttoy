// 頑夜 TOY｜集單抽選號鎖定 Patch v28.12.13
// 用途：替換 Code.gs 內的 augmentKujiGroupLiteV28124_ 與 submitKujiGroupOrderV28124
// 並加入以下 helper。沿用既有 RPC action 名稱，不需改前台 action 名稱。

function kujiGroupNumbersV281213_(v){
  if(Array.isArray(v))return v.map(Number).filter(function(n){return Number.isInteger(n)&&n>0;});
  return String(v||'').split(/[,，\s]+/).map(Number).filter(function(n){return Number.isInteger(n)&&n>0;});
}
function kujiGroupReservedNumberSetV281213_(kujiId){
  var sh=kujiGroupEnsureOrderSheetV28124_(),last=sh.getLastRow(),set={};
  if(last<2)return set;
  var rows=sh.getRange(2,1,last-1,Math.max(22,sh.getLastColumn())).getValues();
  rows.forEach(function(r){
    if(kujiGroupTextV28124_(r[2])!==kujiId)return;
    var status=kujiGroupTextV28124_(r[8]);
    if(status!=='待確認款項'&&status!=='已收款')return;
    kujiGroupNumbersV281213_(r[21]).forEach(function(n){set[n]=true;});
  });
  return set;
}
function kujiGroupPublicPrizeV281213_(setting){
  try{
    if(!setting||!setting.publicCode||typeof getPublicKuji!=='function')return [];
    var d=getPublicKuji(setting.publicCode)||{};
    return Array.isArray(d.prizes)?d.prizes:[];
  }catch(e){return [];}
}
function kujiGroupPublicBoardV281213_(setting,reservedSet){
  var target=Math.max(0,Math.floor(Number(setting&&setting.groupTargetQty||0))),out=[],byNo={};
  try{
    var sh=getSpreadsheetV260_().getSheetByName('線上抽賞籤位');
    if(sh&&sh.getLastRow()>=2){
      var rows=sh.getRange(2,1,sh.getLastRow()-1,Math.min(14,sh.getLastColumn())).getValues();
      rows.forEach(function(r){
        if(kujiGroupTextV28124_(r[1])!==setting.id)return;
        var no=Math.floor(Number(r[3]||0));if(!(no>0))return;
        byNo[no]={
          number:no,status:kujiGroupTextV28124_(r[8])||'未開',
          grade:kujiGroupTextV28124_(r[5]),name:kujiGroupTextV28124_(r[6]),
          imageUrl:kujiGroupTextV28124_(r[7]),reserved:!!reservedSet[no]
        };
      });
    }
  }catch(e){}
  for(var i=1;i<=target;i++){
    var x=byNo[i]||{number:i,status:'未開',grade:'',name:'',imageUrl:'',reserved:false};
    if(reservedSet[i]&&x.status!=='已開')x.reserved=true;
    out.push(x);
  }
  return out;
}

function augmentKujiGroupLiteV28124_(items){
  items=Array.isArray(items)?items.slice():[];
  var settings=kujiGroupReadSettingsV28124_(),stats=kujiGroupOrderStatsMapV28124_(),byId={};
  items.forEach(function(x){if(x&&x.id)byId[String(x.id)]=x;});
  settings.list.forEach(function(s){
    if(!s.publicEnabled)return;
    var st=stats[s.id]||{},target=Math.max(0,Number(s.groupTargetQty||0)),reserved=Math.max(0,Number(st.reservedQty||0));
    var remaining=Math.max(0,target-reserved),closed=kujiGroupClosedV28124_(s,reserved);
    var reservedSet=kujiGroupReservedNumberSetV281213_(s.id);
    var reservedNumbers=Object.keys(reservedSet).map(Number).sort(function(a,b){return a-b;});
    var patch={
      id:s.id,name:s.name,title:s.name,status:closed?'集單截止':'集單中',
      imageUrl:s.imageUrl||'',price:Number(s.price||0),publicCode:s.publicCode||'',
      publicMode:'group',siteCategory:s.siteCategory||'official',
      plannedLaunchDate:s.plannedLaunchDate||'',groupCloseDate:s.groupCloseDate||'',
      groupTargetQty:target,groupDescription:s.groupDescription||'',
      groupReservedQty:reserved,groupConfirmedQty:Number(st.confirmedQty||0),
      groupPendingQty:Number(st.pendingQty||0),groupPaidAmount:Number(st.paidAmount||0),
      groupReservedNumbers:reservedNumbers,
      prizes:kujiGroupPublicPrizeV281213_(s),
      board:kujiGroupPublicBoardV281213_(s,reservedSet),
      total:target,remaining:remaining,majorRemaining:0,closed:closed
    };
    if(byId[s.id])Object.keys(patch).forEach(function(k){byId[s.id][k]=patch[k];});
    else{items.push(patch);byId[s.id]=patch;}
  });
  return items;
}

function submitKujiGroupOrderV28124(kujiIdOrCode,payload){
  payload=payload||{};
  var name=kujiGroupTextV28124_(payload.name);
  var phone=kujiGroupTextV28124_(payload.phone).replace(/[\s-]/g,'');
  var lineId=kujiGroupTextV28124_(payload.lineId);
  var qty=Math.floor(Number(payload.qty||payload.drawCount||0));
  var selected=kujiGroupNumbersV281213_(payload.selectedNumbers||payload.numbers);
  var bankLast5=kujiGroupTextV28124_(payload.bankLast5).replace(/\D/g,'').slice(0,5);
  var deliveryMethod=kujiGroupTextV28124_(payload.deliveryMethod)||'門市取貨';
  var note=kujiGroupTextV28124_(payload.note).slice(0,500);
  var requestId=kujiGroupTextV28124_(payload.requestId||payload.clientRequestId).replace(/[^0-9A-Za-z_-]/g,'').slice(0,120);
  if(!requestId)requestId='KG-'+Date.now()+'-'+Utilities.getUuid().replace(/-/g,'').slice(0,8);
  if(!name)throw new Error('請輸入姓名。');
  if(!/^09\d{8}$/.test(phone))throw new Error('手機號碼格式不正確。');
  if(!lineId)throw new Error('請輸入 LINE ID。');
  if(!Number.isInteger(qty)||qty<=0)throw new Error('抽數請輸入正整數。');
  if(selected.length!==qty)throw new Error('請選滿 '+qty+' 個號碼。');
  if((new Set(selected)).size!==selected.length)throw new Error('選擇號碼不可重複。');
  if(bankLast5&&!/^\d{5}$/.test(bankLast5))throw new Error('匯款後五碼請輸入 5 位數字。');

  var lock=LockService.getScriptLock();lock.waitLock(12000);
  try{
    var setting=kujiGroupFindSettingV28124_(kujiIdOrCode);
    if(!setting||setting.publicMode!=='group')throw new Error('找不到可集單的一番賞。');
    if(!setting.publicEnabled)throw new Error('此集單目前未公開。');
    var target=Math.max(0,Math.floor(Number(setting.groupTargetQty||0)));
    if(!(Number(setting.price||0)>0))throw new Error('此集單尚未設定一抽價格。');
    if(!(target>0))throw new Error('此集單尚未設定目標抽數。');
    selected.forEach(function(n){if(n<1||n>target)throw new Error('號碼 '+n+' 不在 1～'+target+' 範圍內。');});

    var sheet=kujiGroupEnsureOrderSheetV28124_(),last=sheet.getLastRow();
    if(last>=2){
      var reqs=sheet.getRange(2,11,last-1,1).getDisplayValues();
      for(var i=0;i<reqs.length;i++){
        if(kujiGroupTextV28124_(reqs[i][0])===requestId){
          var old=sheet.getRange(i+2,1,1,Math.max(22,sheet.getLastColumn())).getValues()[0];
          return {ok:true,replayed:true,id:kujiGroupTextV28124_(old[0]),status:kujiGroupTextV28124_(old[8]),qty:Number(old[6]||0),selectedNumbers:kujiGroupNumbersV281213_(old[21]),expectedAmount:Number(old[12]||0)};
        }
      }
    }

    var stats=kujiGroupOrderStatsMapV28124_()[setting.id]||{};
    var reserved=Math.max(0,Number(stats.reservedQty||0));
    if(kujiGroupClosedV28124_(setting,reserved))throw new Error('這個集單目前已截止。');
    if(reserved+qty>target)throw new Error('目前只剩 '+Math.max(0,target-reserved)+' 抽可登記。');

    var locked=kujiGroupReservedNumberSetV281213_(setting.id),conflict=selected.filter(function(n){return !!locked[n];});
    if(conflict.length)throw new Error('號碼 '+conflict.join('、')+' 剛剛已被其他客人選走，請重新選號。');

    var now=new Date(),expected=Math.round(Number(setting.price||0)*qty);
    var orderId='KGRP-'+Utilities.formatDate(now,CONFIG.TIMEZONE,'yyyyMMdd-HHmmss')+'-'+Utilities.getUuid().replace(/-/g,'').slice(0,6).toUpperCase();
    var paid=bankLast5?expected:0;
    sheet.appendRow([
      orderId,now,setting.id,setting.publicCode||'',name,phone,qty,note,
      '待確認款項','官網集單',requestId,now,expected,paid,bankLast5?now:'',
      bankLast5,'','',bankLast5?('已填匯款後五碼 '+bankLast5):'尚未填匯款後五碼',
      lineId,deliveryMethod,selected.join(','),now
    ]);
    SpreadsheetApp.flush();
    kujiGroupInvalidatePublicCacheV28124_();
    var summary=getKujiGroupOrdersSummaryV28124_(setting.id);
    return {ok:true,id:orderId,status:'待確認款項',qty:qty,selectedNumbers:selected,expectedAmount:expected,summary:summary};
  }finally{lock.releaseLock();}
}
