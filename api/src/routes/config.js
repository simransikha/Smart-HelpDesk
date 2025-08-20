import { Router } from 'express';
import Joi from 'joi';
import { auth, requireRole } from '../middleware/auth.js';
import Config from '../models/Config.js';

const router = Router();

router.get('/config', auth(), requireRole('admin'), async (req,res,next)=>{
  try{
    const cfg = await Config.findOne({}) || await Config.create({});
    res.json(cfg);
  }catch(e){ next(e); }
});

router.put('/config', auth(), requireRole('admin'), async (req,res,next)=>{
  try{
    const schema = Joi.object({
      autoCloseEnabled: Joi.boolean(),
      confidenceThreshold: Joi.number().min(0).max(1),
      thresholds: Joi.object({
        billing: Joi.number().min(0).max(1),
        tech: Joi.number().min(0).max(1),
        shipping: Joi.number().min(0).max(1),
        other: Joi.number().min(0).max(1)
      })
    });
    const payload = await schema.validateAsync(req.body);
    const cfg = await Config.findOneAndUpdate({}, payload, { upsert:true, new:true });
    res.json(cfg);
  }catch(e){ next(e); }
});

export default router;
