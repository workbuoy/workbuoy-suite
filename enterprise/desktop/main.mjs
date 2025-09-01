import { app, BrowserWindow, protocol } from 'electron';

function createWindow(){
  const win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: { preload: new URL('./preload.mjs', import.meta.url).pathname }
  });
  win.loadURL(process.env.WB_DESKTOP_START_URL || 'http://localhost:8080/portal');
}

app.whenReady().then(()=>{
  protocol.registerSchemesAsPrivileged([{ scheme:'workbuoy', privileges:{ standard:true, secure:true } }]);
  createWindow();
  app.on('activate', ()=>{ if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', ()=>{ if (process.platform!=='darwin') app.quit(); });
