export function reminderEmailTemplate({ invoiceId, customerName }:{ invoiceId:string; customerName?:string }){
  return `Hei${customerName ? ' ' + customerName : ''},
Dette er en vennlig påminnelse om faktura ${invoiceId}.
Vennlig hilsen, Teamet`;
}
