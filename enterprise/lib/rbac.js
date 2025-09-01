'use strict';
function enforceRBAC(user, required){
  const have = new Set(user.roles || []);
  for (const r of required){
    if (!have.has(r)) {
      const err = new Error('forbidden');
      err.status = 403;
      throw err;
    }
  }
}
module.exports = { enforceRBAC };
