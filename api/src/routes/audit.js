import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();

router.get('/tickets/:id/audit', auth(), async (req,res,next)=>{
  try{
    const logs = await AuditLog.find({ ticket: req.params.id }).sort({ createdAt: 1 });
    res.json(logs);
  }catch(e){ next(e); }
});

export default router;
