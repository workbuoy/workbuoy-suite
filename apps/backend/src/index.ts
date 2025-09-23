import app from './app.secure.js';
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`[workbuoy] secure app listening on :${port}`));
