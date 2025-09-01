import fetch from 'node-fetch';

export class OAuth2 {
  constructor({ tokenUrl, clientId, clientSecret, refreshToken }){
    this.tokenUrl = tokenUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
    this._access = null;
  }

  async _refresh(){
    const body = new URLSearchParams();
    body.set('grant_type','refresh_token');
    body.set('client_id', this.clientId);
    body.set('client_secret', this.clientSecret);
    body.set('refresh_token', this.refreshToken);

    const res = await fetch(this.tokenUrl, { method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body });
    if (!res.ok) throw new Error('token refresh failed '+res.status);
    const j = await res.json();
    this._access = { token: j.access_token, expires_at: Date.now() + (Number(j.expires_in || 3600)-60)*1000 };
    return this._access.token;
  }

  async getToken(){
    if (!this._access || Date.now() > this._access.expires_at) {
      return this._refresh();
    }
    return this._access.token;
  }

  async authHeader(){
    const t = await this.getToken();
    return { 'authorization': `Bearer ${t}` };
  }
}
