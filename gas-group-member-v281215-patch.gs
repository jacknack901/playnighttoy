// 頑夜 TOY｜集單抽會員查詢 v28.12.15
// 需將 getPublicKujiGroupOrdersByPhoneV281215 加入 WANWAN_PUBLIC_READ_ACTIONS_V271
// 並在 invokePublicRpcActionV271_ switch 加入：
// case 'getPublicKujiGroupOrdersByPhoneV281215': return getPublicKujiGroupOrdersByPhoneV281215(args[0],args[1]);

function getPublicKujiGroupOrdersByPhoneV281215(phone,lineId){
  phone=String(phone||'').replace(/[\s-]/g,'');
  lineId=String(lineId||'').trim();
  if(!/^09\d{8}$/.test(phone))throw new Error('手機號碼格式不正確。');
  if(!lineId)throw new Error('請輸入 LINE ID。');

  var sh=kujiGroupEnsureOrderSheetV28124_(),last=sh.getLastRow(),out=[];
  var settings=kujiGroupReadSettingsV28124_(),settingMap=settings.byId||{};
  var ticketSh=getSpreadsheetV260_().getSheetByName('線上抽賞籤位'),ticketByKuji={};
  if(ticketSh&&ticketSh.getLastRow()>=2){
    var tr=ticketSh.getRange(2,1,ticketSh.getLastRow()-1,Math.min(14,ticketSh.getLastColumn())).getValues();
    tr.forEach(function(r){
      var kid=kujiGroupTextV28124_(r[1]),no=Math.floor(Number(r[3]||0));if(!kid||!(no>0))return;
      if(!ticketByKuji[kid])ticketByKuji[kid]={};
      ticketByKuji[kid][no]={
        number:no,status:kujiGroupTextV28124_(r[8])||'未開',
        grade:kujiGroupTextV28124_(r[5]),name:kujiGroupTextV28124_(r[6]),imageUrl:kujiGroupTextV28124_(r[7])
      };
    });
  }

  if(last>=2){
    var rows=sh.getRange(2,1,last-1,Math.max(23,sh.getLastColumn())).getValues();
    rows.forEach(function(r){
      if(String(r[5]||'').replace(/[\s-]/g,'')!==phone)return;
      if(kujiGroupTextV28124_(r[19])!==lineId)return;
      var kid=kujiGroupTextV28124_(r[2]),s=settingMap[kid]||{},nums=typeof kujiGroupNumbersV281213_==='function'?kujiGroupNumbersV281213_(r[21]):[];
      var results=nums.map(function(n){
        var x=(ticketByKuji[kid]||{})[n]||{number:n,status:'未開',grade:'',name:'',imageUrl:''};
        return x;
      });
      out.push({
        id:kujiGroupTextV28124_(r[0]),orderId:kujiGroupTextV28124_(r[0]),
        name:s.name||'集單抽',createdAt:kujiGroupDateTimeTextV28124_(r[1]),
        draws:Math.max(0,Math.floor(Number(r[6]||0))),total:Number(r[12]||0),
        status:kujiGroupTextV28124_(r[8]),selectedNumbers:nums.join('、'),
        selectedNumberList:nums,results:results,publicCode:s.publicCode||kujiGroupTextV28124_(r[3]),
        type:'group'
      });
    });
  }
  out.sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});
  return {ok:true,items:out};
}
