/* 頑夜 TOY POS v0.5.4｜前端「不要發票」規則
 * 套用到目前 POS HTML/APP：
 * 1. 發票按鈕新增 data-mode="none" 的「不要發票」。
 * 2. mode=none 不輸入載具/統編/捐贈碼。
 * 3. checkout payload 傳 invoice:{mode:'none'}。
 * 4. checkout 回傳 invoice.skipped===true 或 printRequired===false 時，絕對禁止呼叫 invoicePrint / NativePOS.print。
 */
function pnPosV054ShouldPrint_(checkoutResponse,selectedMode){
  if(String(selectedMode||'')==='none')return false;
  if(!checkoutResponse||checkoutResponse.printRequired===false)return false;
  if(checkoutResponse.invoice&&checkoutResponse.invoice.skipped===true)return false;
  return !!(checkoutResponse.invoice&&checkoutResponse.invoice.invoiceNumber);
}
function pnPosV054InvoiceMode_(mode,value){
  mode=String(mode||'paper');
  if(mode==='none')return {mode:'none'};
  if(mode==='carrier')return {mode:'carrier',value:String(value||'').trim().toUpperCase()};
  if(mode==='tax')return {mode:'tax',value:String(value||'').replace(/\D/g,'')};
  if(mode==='donate')return {mode:'donate',value:String(value||'').replace(/\D/g,'')};
  return {mode:'paper'};
}
// 觸控按鈕建議：
// <button data-mode="none"><span>✕</span>不要發票</button>
// 結帳成功後：
// if (pnPosV054ShouldPrint_(res, invoiceMode)) { ...既有 invoicePrint 流程... }
// else { 顯示「結帳完成｜不要發票｜不列印」; }
