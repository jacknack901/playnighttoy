// 頑夜 TOY POS v0.5.4｜「不要發票」安全修正
// 基準：Code_POS_v0.5.3_快速登入修正版.gs
// IMPORTANT：以下 4 個函式是「替換既有同名函式」，不要與舊版重複存在。
// 目的：mode=none 時不呼叫光貿、不建立發票紀錄、不產生列印資料，銷售/庫存仍正常入帳；日結排除此類交易。

function pnAmegoV05Mode_(input){
  input=input||{};const mode=cleanText_(input.mode||input.receiptMode)||'paper';
  if(['paper','carrier','tax','donate','none'].indexOf(mode)<0)throw new Error('發票方式不正確。');
  const out={mode:mode,carrier:'',buyerIdentifier:'',buyerName:'',donate:'',buyerEmail:'',buyerPhone:''};
  if(mode==='none')return out;
  if(mode==='carrier'){
    const v=String(input.carrier||input.value||'').trim().toUpperCase();
    if(!/^\/[0-9A-Z.+-]{7}$/.test(v))throw new Error('手機載具格式不正確。');
    out.carrier=v;
  }else if(mode==='tax'){
    const v=String(input.buyerIdentifier||input.value||'').replace(/\D/g,'');
    if(!/^\d{8}$/.test(v))throw new Error('公司統編需為 8 位數。');
    out.buyerIdentifier=v;out.buyerName=cleanText_(input.buyerName)||'';
  }else if(mode==='donate'){
    const v=String(input.donate||input.value||'').replace(/\D/g,'');
    if(!/^\d{3,7}$/.test(v))throw new Error('捐贈碼需為 3～7 位數。');
    out.donate=v;
  }
  out.buyerEmail=cleanText_(input.buyerEmail);
  out.buyerPhone=cleanText_(input.buyerPhone);
  return out;
}

function playNightPosV05PreflightInvoice_(payload){
  payload=payload||{};
  const inv=pnAmegoV05Mode_(payload.invoice||{mode:payload.receiptMode||'paper'});
  if(inv.mode!=='none')pnAmegoV05RequireReady_(inv.mode);
  return inv;
}

function playNightPosV05Checkout_(token,payload){
  const session=playNightPosV05Session_(token,'SALE');payload=payload||{};
  const requestId=normalizeSaleRequestId_(payload.clientRequestId);
  if(requestId.indexOf('PNP5-')!==0)throw new Error('POS v0.5 交易 ID 格式錯誤。');
  const inv=playNightPosV05PreflightInvoice_(payload);
  const labels={paper:'紙本',carrier:'手機載具',tax:'公司統編',donate:'捐贈',none:'不要發票'};
  const userNote=cleanText_(payload.note);
  const note=('[POS v0.5｜電子發票：'+(labels[inv.mode]||inv.mode)+']'+(userNote?' '+userNote:'')).slice(0,500);
  const sale=recordCartSale(token,{
    items:Array.isArray(payload.items)?payload.items:[],
    payment:cleanText_(payload.payment)||'現金',
    note:note,
    customerId:cleanText_(payload.customerId),
    clientRequestId:requestId,
    discountOverrideToken:cleanText_(payload.discountOverrideToken)
  });
  sale.posInvoiceMode=inv.mode;sale.posOperator=session.operator;sale.posVersion='0.5.4-no-invoice';

  if(inv.mode==='none'){
    return {
      ok:true,sale:sale,
      invoice:{ok:true,skipped:true,mode:'none',state:'NO_INVOICE',printRequired:false,base64Data:'',invoiceNumber:''},
      invoiceConfig:pnAmegoV05PublicCfg_(),
      printRequired:false
    };
  }

  const invoice=pnAmegoV05IssueForSale_(token,sale,payload.invoice||{mode:inv.mode});
  return {ok:true,sale:sale,invoice:invoice,invoiceConfig:pnAmegoV05PublicCfg_(),printRequired:!!(invoice&&invoice.invoiceNumber)};
}

function pnAmegoV05Reconcile_(dateKey,refreshRemote){
  const ss=getSpreadsheetV260_(),tz=ss.getSpreadsheetTimeZone()||CONFIG.TIMEZONE;
  dateKey=cleanText_(dateKey)||Utilities.formatDate(new Date(),tz,'yyyy-MM-dd');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateKey))throw new Error('核對日期格式錯誤。');
  const sales=ss.getSheetByName(CONFIG.SALES_SHEET),returns=ss.getSheetByName(CONFIG.RETURN_SHEET);
  let posGross=0,posRefunds=0,noInvoiceGross=0,noInvoiceRefunds=0;
  const txToReq={},txNoInvoice={},orderDate={};
  if(sales&&sales.getLastRow()>=2){
    const width=Math.min(Math.max(sales.getMaxColumns(),23),39),rows=sales.getRange(2,1,sales.getLastRow()-1,width).getValues();
    rows.forEach(function(r){
      const req=String(r[22]||''),tx=String(r[8]||''),order=String(r[20]||''),d=pnAmegoV05DateKey_(r[0],tz);
      const noInvoice=String(r[9]||'').indexOf('[POS v0.5｜電子發票：不要發票]')>=0;
      if(tx){txToReq[tx]=req;txNoInvoice[tx]=noInvoice;}
      if(order&&!orderDate[order])orderDate[order]=d;
      if(req.indexOf('PNP5-')===0&&d===dateKey){
        if(noInvoice)noInvoiceGross+=Number(r[6]||0);else posGross+=Number(r[6]||0);
      }
    });
  }
  if(returns&&returns.getLastRow()>=2){
    const width=Math.min(Math.max(returns.getMaxColumns(),13),20),rows=returns.getRange(2,1,returns.getLastRow()-1,width).getValues();
    rows.forEach(function(r){
      const tx=String(r[1]||''),req=txToReq[tx]||'',d=pnAmegoV05DateKey_(r[12]||r[0],tz),amt=Number(r[6]||0);
      if(req.indexOf('PNP5-')===0&&d===dateKey){
        if(txNoInvoice[tx])noInvoiceRefunds+=amt;else posRefunds+=amt;
      }
    });
  }

  const invoiceRows=[];const invoiceNums=[];const ish=pnAmegoV05InvoiceSheet_();
  if(ish.getLastRow()>=2){
    const rows=ish.getRange(2,1,ish.getLastRow()-1,PN_AMG_V05_INVOICE_HEADERS.length).getValues();
    rows.forEach(function(r,i){const x=pnAmegoV05InvoiceRecFromRow_(r,i+2),saleDate=orderDate[x.orderId]||'';x._saleDate=saleDate;invoiceRows.push(x);if(x.invoiceNumber&&(saleDate===dateKey||pnAmegoV05DateKey_(x.voidedAt,tz)===dateKey))invoiceNums.push(x.invoiceNumber);});
  }
  const allowanceRows=[];const allowanceNums=[];const ash=pnAmegoV05AllowanceSheet_();
  if(ash.getLastRow()>=2){
    const rows=ash.getRange(2,1,ash.getLastRow()-1,PN_AMG_V05_ALLOWANCE_HEADERS.length).getValues();
    rows.forEach(function(r,i){const a=pnAmegoV05AllowanceRecFromRow_(r,i+2);allowanceRows.push(a);if(pnAmegoV05DateKey_(a.allowanceDate,tz)===dateKey&&a.allowanceNumber)allowanceNums.push(a.allowanceNumber);});
  }
  let remoteInvoiceStatus={},remoteAllowanceStatus={},remoteCheckError='';
  if(refreshRemote!==false&&pnAmegoV05Cfg_().enabled){
    try{remoteInvoiceStatus=pnAmegoV05InvoiceStatusBatch_(invoiceNums);remoteAllowanceStatus=pnAmegoV05AllowanceStatusBatch_(allowanceNums);}catch(e){remoteCheckError=e.message||String(e);}
  }
  let issued=0,voided=0,allowances=0,pending=0,error=0,invoiceCount=0;
  invoiceRows.forEach(function(x){
    const saleDate=x._saleDate||'',remote=remoteInvoiceStatus[x.invoiceNumber];
    if(remote){x.remoteType=String(remote.type||x.remoteType||'');x.remoteStatus=Number(remote.status===undefined?x.remoteStatus:remote.status);if(/0501$/.test(x.remoteType))x.state='VOIDED';else if(x.remoteStatus===91)x.state='REMOTE_ERROR';else if(x.invoiceNumber)x.state='OPENED';pnAmegoV05InvoiceSave_(x);}
    if(saleDate===dateKey&&x.invoiceNumber){issued+=x.totalAmount;invoiceCount++;}
    const voidDate=pnAmegoV05DateKey_(x.voidedAt,tz);
    if(voidDate===dateKey||(/0501$/.test(x.remoteType)&&saleDate===dateKey))voided+=x.totalAmount;
    const relevant=saleDate===dateKey||voidDate===dateKey;
    if(relevant){
      if(['UNKNOWN','CHECK_UNKNOWN','ISSUING','VOIDING','VOID_PENDING','VOID_UNKNOWN','CHECKING'].indexOf(x.state)>=0)pending++;
      if(/ERROR/.test(x.state)||Number(x.remoteStatus)===91)error++;
      if(x.voidedAt&&!/0501$/.test(x.remoteType))pending++;
      if(x.invoiceNumber&&!/0501$/.test(x.remoteType)&&Number(x.remoteStatus)!==99&&Number(x.remoteStatus)!==91)pending++;
      if(x.invoiceNumber&&remote&&String(remote.type||'')==='NOT_FOUND')error++;
    }
  });
  allowanceRows.forEach(function(a){
    const d=pnAmegoV05DateKey_(a.allowanceDate,tz),remote=remoteAllowanceStatus[a.allowanceNumber];
    if(remote){a.remoteType=String(remote.type||a.remoteType||'');a.remoteStatus=Number(remote.status===undefined?a.remoteStatus:remote.status);if(/0501$/.test(a.remoteType))a.state='VOIDED';else if(a.remoteStatus===91)a.state='REMOTE_ERROR';else a.state='OPENED';pnAmegoV05AllowanceSave_(a);}
    if(d===dateKey&&a.state!=='VOIDED')allowances+=a.gross;
    if(d===dateKey){
      if(['UNKNOWN','ISSUING','PREPARING'].indexOf(a.state)>=0||a.returnState==='PENDING')pending++;
      if(/ERROR/.test(a.state)||Number(a.remoteStatus)===91)error++;
      if(a.allowanceNumber&&a.state!=='VOIDED'&&Number(a.remoteStatus)!==99&&Number(a.remoteStatus)!==91)pending++;
      if(a.allowanceNumber&&remote&&String(remote.type||'')==='NOT_FOUND')error++;
    }
  });
  if(remoteCheckError)pending++;
  const expected=Math.round((posGross-posRefunds)*100)/100;
  const invoiceNet=Math.round((issued-voided-allowances)*100)/100;
  const diff=Math.round((expected-invoiceNet)*100)/100;
  let storeNet=0;try{storeNet=Number(getDaySummaryByKey_(dateKey).totalSales||0);}catch(ignore){}
  return {
    ok:Math.abs(diff)<0.01&&pending===0&&error===0,date:dateKey,
    posGross:Math.round(posGross*100)/100,posRefunds:Math.round(posRefunds*100)/100,
    noInvoiceGross:Math.round(noInvoiceGross*100)/100,noInvoiceRefunds:Math.round(noInvoiceRefunds*100)/100,
    noInvoiceNet:Math.round((noInvoiceGross-noInvoiceRefunds)*100)/100,
    posInvoiceExpected:expected,invoiceIssued:Math.round(issued*100)/100,
    invoiceVoided:Math.round(voided*100)/100,allowanceGross:Math.round(allowances*100)/100,invoiceNetActivity:invoiceNet,
    difference:diff,pendingCount:pending,errorCount:error,invoiceCount:invoiceCount,storeNetSales:storeNet,
    nonPosCoverageGap:Math.round((storeNet-expected-(noInvoiceGross-noInvoiceRefunds))*100)/100,remoteCheckError:remoteCheckError
  };
}
