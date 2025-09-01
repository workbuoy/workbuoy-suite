// lib/connectors/jira.js
import fetch from 'node-fetch';

/**
 * JiraConnector
 * Supports Atlassian Cloud REST API v3.
 * Auth: Basic (email:api_token) or Bearer (PAT) – pass in via opts.authHeader.
 */
export class JiraConnector {
  constructor({ baseUrl, email, apiToken, authHeader } = {}){
    this.baseUrl = baseUrl?.replace(/\/$/, '') || 'https://your-domain.atlassian.net';
    if(authHeader){
      this.authHeader = authHeader;
    }else if(email && apiToken){
      const b64 = Buffer.from(`${email}:${apiToken}`).toString('base64');
      this.authHeader = `Basic ${b64}`;
    }else{
      this.authHeader = null;
    }
  }
  async _req(path){
    if(!this.authHeader) throw new Error('jira_auth_missing');
    const r = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Accept': 'application/json', 'Authorization': this.authHeader }
    });
    if(!r.ok){
      const t = await r.text().catch(()=>'');
      const msg = `jira_http_${r.status}`;
      throw Object.assign(new Error(msg), { status:r.status, body:t });
    }
    return r.json();
  }
  /**
   * Fetch issues with JQL. Supports incremental via updated >= since (ISO).
   */
  async fetchIssues({ jql = 'order by created DESC', since, limit = 50 } = {}){
    let _jql = jql;
    if(since){
      const esc = since.replace(/"/g,'\"');
      const sinceClause = `updated >= "${esc}"`;
      _jql = _jql ? `${sinceClause} AND (${_jql})` : sinceClause;
    }
    const qs = new URLSearchParams({ jql: _jql, maxResults: String(Math.min(limit,100)), fields: 'summary,status,assignee,updated' });
    const data = await this._req(`/rest/api/3/search?${qs.toString()}`);
    const issues = (data.issues || []).map(i => ({
      key: i.key,
      summary: i.fields?.summary,
      status: i.fields?.status?.name,
      assignee: i.fields?.assignee?.displayName || null,
      updated: i.fields?.updated
    }));
    return issues;
  }
}
export default JiraConnector;
