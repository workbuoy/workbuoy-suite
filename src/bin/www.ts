// Runtime entrypoint: starts HTTP server using exported app
import app from '../server';

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(JSON.stringify({ event: 'server_started', port, env: process.env.NODE_ENV || 'development' }));
});
