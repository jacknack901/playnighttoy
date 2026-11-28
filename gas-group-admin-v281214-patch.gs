// 頑夜 TOY｜集單抽後台管理 Patch v28.12.14
// 基準：Code_POS_v0.5.3_快速登入修正版.gs
// 依賴：既有 getKujiGroupOrdersSummaryV28124_、kujiGroupEnsureOrderSheetV28124_、requireSession_

function getKujiGroupAdminWorkspaceV281214(sessionToken,kujiId){
  requireSession_(sessionToken);
  kujiId=kujiGroupTextV28124_(kujiId);
  if(!kujiId)throw new Error('缺少一番賞 ID。');
  var setting=kujiGroupFindSettingV28124_(kujiId);
  if(!setting)throw new Error('找不到這套集單。');

  var sh=kujiGroupEnsureOrderSheetV28124_(),last=sh.getLastRow(),orders=[],ownerByNumber={};
  if(last>=2){
    var rows=sh.getRange(2,1,last-1,Math.max(23,sh.getLastColumn())).getValues();
    rows.forEach(function(r){
      if(kujiGroupTextV28124_(r[2])!==kujiId)return;
      var nums=typeof kujiGroupNumbersV281213_==='function'?kujiGroupNumbersV281213_(r[21]):[];
      var status=kujiGroupTextV28124_(r[8]);
      var item={
        id:kujiGroupTextV28124_(r[0]),createdAt:kujiGroupDateTimeTextV28124_(r[1]),
        name:kujiGroupTextV28124_(r[4]),phone:kujiGroupTextV28124_(r[5]),
        qty:Math.max(0,Math.floor(Number(r[6]||0))),note:kujiGroupTextV28124_(r[7]),
        status:status,expectedAmount:Number(r[12]||0),paidAmount:Number(r[13]||0),
        bankLast5:kujiGroupTextV28124_(r[15]),lineId:kujiGroupTextV28124_(r[19]),
        deliveryMethod:kujiGroupTextV28124_(r[20]),selectedNumbers:nums
      };
      orders.push(item);
      if(status==='待確認款項'||status==='已收款'){
        nums.forEach(function(n){
          ownerByNumber[n]={orderId:item.id,name:item.name,phone:item.phone,status:item.status};
        });
      }
    });
  }
  orders.reverse();

  var target=Math.max(0,Math.floor(Number(setting.groupTargetQty||0))),board=[];
  var ticketSheet=getSpreadsheetV260_().getSheetByName('線上抽賞籤位'),ticketMap={};
  if(ticketSheet&&ticketSheet.getLastRow()>=2){
    var tr=ticketSheet.getRange(2,1,ticketSheet.getLastRow()-1,Math.min(14,ticketSheet.getLastColumn())).getValues();
    tr.forEach(function(r){
      if(kujiGroupTextV28124_(r[1])!==kujiId)return;
      var no=Math.floor(Number(r[3]||0)); if(!(no>0))return;
      ticketMap[no]={
        number:no,status:kujiGroupTextV28124_(r[8])||'未開',
        prizeId:kujiGroupTextV28124_(r[4]),grade:kujiGroupTextV28124_(r[5]),
        name:kujiGroupTextV28124_(r[6]),imageUrl:kujiGroupTextV28124_(r[7])
      };
    });
  }
  for(var n=1;n<=target;n++){
    var b=ticketMap[n]||{number:n,status:'未開',prizeId:'',grade:'',name:'',imageUrl:''};
    b.owner=ownerByNumber[n]||null; board.push(b);
  }
  var prizes=[];
  try{
    var pd=getPublicKuji(setting.publicCode)||{};
    prizes=Array.isArray(pd.prizes)?pd.prizes:[];
  }catch(e){}
  return {ok:true,setting:setting,summary:getKujiGroupOrdersSummaryV28124_(kujiId),orders:orders,board:board,prizes:prizes};
}

function saveKujiGroupRevealV281214(sessionToken,kujiId,number,prize){
  var session=requireSession_(sessionToken);
  kujiId=kujiGroupTextV28124_(kujiId);number=Math.floor(Number(number||0));prize=prize||{};
  if(!kujiId||!(number>0))throw new Error('開獎資料不完整。');
  var grade=kujiGroupTextV28124_(prize.grade),name=kujiGroupTextV28124_(prize.name),
      imageUrl=kujiGroupTextV28124_(prize.imageUrl),prizeId=kujiGroupTextV28124_(prize.id||prize.prizeId);
  if(!grade)throw new Error('請先選擇賞項。');
  if(prize.lastPrize)throw new Error('最後賞不使用一般號碼開獎，請在整套最後一抽時另外處理。');
  var lock=LockService.getScriptLock();lock.waitLock(12000);
  try{
    var setting=kujiGroupFindSettingV28124_(kujiId);
    if(!setting)throw new Error('找不到這套集單。');
    var sum=getKujiGroupOrdersSummaryV28124_(kujiId);
    if(!sum.full)throw new Error('集單尚未完成，不能開始開獎。');
    var owners=kujiGroupReservedNumberSetV281213_(kujiId);
    if(!owners[number])throw new Error('這個號碼沒有客人選擇，不能開獎。');
    var target=Math.max(0,Math.floor(Number(setting.groupTargetQty||0)));
    if(number>target)throw new Error('號碼超出集單範圍。');
    var sh=getSpreadsheetV260_().getSheetByName('線上抽賞籤位');
    if(!sh)throw new Error('找不到線上抽賞籤位工作表。');
    var last=sh.getLastRow(),row=-1;
    if(last>=2){
      var vals=sh.getRange(2,1,last-1,4).getValues();
      for(var i=0;i<vals.length;i++){
        if(kujiGroupTextV28124_(vals[i][1])===kujiId&&Math.floor(Number(vals[i][3]||0))===number){row=i+2;break;}
      }
    }
    var env=ensureKujiSchemaV25_();
    var prizeRow=getKujiPrizeRowsV25_(kujiId).find(function(p){return p.id===prizeId;});
    if(!prizeRow)throw new Error('找不到正式獎項資料。');
    if(prizeRow.lastPrize)throw new Error('最後賞不能用一般號碼開獎。');
    if(Number(prizeRow.remainingQty||0)<=0)throw new Error(prizeRow.grade+' 已經沒有剩餘數量。');
    var existingOpen=false;
    if(row>0){
      var oldStatus=kujiGroupTextV28124_(sh.getRange(row,9).getValue());
      if(oldStatus==='已開')existingOpen=true;
    }
    if(existingOpen)throw new Error(number+' 號已經開獎，不能重複登記。');

    var nextRemain=Number(prizeRow.remainingQty||0)-1;
    var now=new Date(),ticketId='KGRP-'+kujiId.replace(/[^0-9A-Za-z]/g,'').slice(-8)+'-'+String(number).padStart(3,'0');
    var values=[ticketId,kujiId,kujiId,number,prizeId,grade,name,imageUrl,'已開','', 'GROUP-ADMIN-'+Utilities.getUuid().slice(0,8),now,now,session.operator||''];
    if(row>0)sh.getRange(row,1,1,14).setValues([values]);
    else sh.appendRow(values);
    env.prizeSheet.getRange(prizeRow.row,7).setValue(nextRemain);
    env.prizeSheet.getRange(prizeRow.row,12,1,2).setValues([[now,session.operator||'']]);
    var setRec=getKujiRowsV25_().find(function(k){return k.id===kujiId;});
    if(setRec)env.setSheet.getRange(setRec.row,11,1,2).setValues([[now,session.operator||'']]);
    var logRow=findFirstEmptyDataRow_(env.logSheet,2,2);
    var reqId='KGRP-REVEAL-'+kujiId+'-'+number;
    env.logSheet.getRange(logRow,1,1,11).setValues([[
      now,kujiIdV25_('KLOG'),kujiId,prizeRow.id,prizeRow.grade,prizeRow.name,-1,'集單開獎',reqId,session.operator||'','號碼 '+number
    ]]);
    SpreadsheetApp.flush();
    kujiGroupInvalidatePublicCacheV28124_();
    try{CacheService.getScriptCache().remove('online-kuji-public-list-v27197');}catch(e){}
    return {ok:true,number:number,grade:grade,name:name,remainingQty:nextRemain};
  }finally{lock.releaseLock();}
}


function saveKujiGroupRevealBatchV281215(sessionToken,kujiId,items){
  requireSession_(sessionToken);
  kujiId=kujiGroupTextV28124_(kujiId);
  items=Array.isArray(items)?items:[];
  if(!kujiId)throw new Error('缺少一番賞 ID。');
  if(!items.length)throw new Error('沒有要儲存的開獎資料。');
  if(items.length>100)throw new Error('一次最多儲存 100 個開獎號碼。');

  var seen={};
  items.forEach(function(x){
    var n=Math.floor(Number(x&&x.number||0));
    if(!(n>0))throw new Error('開獎號碼格式不正確。');
    if(seen[n])throw new Error('號碼 '+n+' 重複出現在本次草稿。');
    seen[n]=true;
  });

  var results=[];
  items.forEach(function(x){
    results.push(saveKujiGroupRevealV281214(sessionToken,kujiId,x.number,x.prize||{}));
  });
  return {ok:true,count:results.length,results:results};
}
