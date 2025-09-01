import { describe,it,expect } from '@jest/globals';
import { logger } from '../lib/logging.js';

describe('logger',()=>{
  it('logs at info by default', ()=>{
    logger.info('msg',{a:1});
  });
});
