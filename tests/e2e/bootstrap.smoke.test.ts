import express from 'express';
import request from 'supertest';
import app from '../../src/server';

describe('bootstrap smoke', () => {
  it('healthz', async () => {
    const res = await request(app).get('/healthz').expect(200);
    expect(res.body.ok).toBe(true);
  });
});
