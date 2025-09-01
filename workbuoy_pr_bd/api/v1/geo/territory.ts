import express from 'express';
export const router = express.Router();
router.post('/territory/assign', (req,res)=>{
  // placeholder: return static assignment
  res.json({ assigned: true });
});
