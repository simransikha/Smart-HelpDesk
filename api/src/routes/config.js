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
      siteName: Joi.string(),
      supportEmail: Joi.string().email(),
      autoClose: Joi.boolean(),
      confidenceThreshold: Joi.number().min(0).max(1)
    });
    const payload = await schema.validateAsync(req.body);
    const cfg = await Config.findOneAndUpdate({}, payload, { upsert:true, new:true });
    res.json(cfg);
  }catch(e){ next(e); }
});

export default router;
