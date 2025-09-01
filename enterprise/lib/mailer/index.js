import nodemailer from 'nodemailer';

function isProd(){ return process.env.NODE_ENV==='production'; }

let transporter;
export function getTransport(){
  if(!isProd()){
    return {
      sendMail: async (opts)=>{
        console.log('[MAIL:DEV]', opts);
        return { messageId: 'dev' };
      }
    }
  }
  if(!transporter){
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT||587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}

export async function sendEmail({to,subject,text,html,type='generic'}){
  const from = process.env.SMTP_FROM || 'WorkBuoy <no-reply@workbuoy.app>';
  const t = getTransport();
  const info = await t.sendMail({ from, to, subject, text, html });
  try {
    const { wbPortalEmailSent } = await import('../metrics/registry.js');
    wbPortalEmailSent.labels(type).inc();
  } catch {}
  return info;
}
