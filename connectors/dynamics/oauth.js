import fetch from 'node-fetch';

export class OAuthCC {
  constructor({ tenantId, clientId, clientSecret, scope }){
    this.tenantId = tenantId;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.scope = scope; // e.g. https://org.crm4.dynamics.com/.default
    this._access = null;
  }

  async _fetchToken(){
    const url = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    const form = new URLSearchParams();
    form.set('grant_type','client_credentials');
    form.set('client_id', this.clientId);
    form.set('client_secret', this.clientSecret);
    form.set('scope', this.scope);
    const res = await fetch(url, { method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body: form });
    if (!res.ok) throw new Error('dynamics token failed '+res.status);
    const j = await res.json();
    this._access = { token: j.access_token, expires_at: Date.now() + (Number(j.expires_in || 3600)-60)*1000 };
    return this._access.token;
  }

  async getToken(){
    if (!this._access || Date.now() > this._access.expires_at) return this._fetchToken();
    return this._access.token;
  }

  async authHeader(){ return { authorization: `Bearer ${await this.getToken()}` }; }
}
