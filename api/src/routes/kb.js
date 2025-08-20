import { Router } from 'express';
import Joi from 'joi';
import { auth, requireRole } from '../middleware/auth.js';
import Article from '../models/Article.js';

const router = Router();

router.get('/', auth(false), async (req,res,next)=>{
  try{
    const q = (req.query.query || '').trim();
    if(!q){
      const all = await Article.find({ status:'published' }).sort({ createdAt:-1 }).limit(50);
      return res.json(all);
    }
    const results = await Article.find({ status:'published', $text: { $search: q } }, { score: { $meta:'textScore' } }).sort({ score: { $meta:'textScore' } }).limit(20);
    res.json(results);
  }catch(e){ next(e); }
});

router.get('/:id', auth(false), async (req,res,next)=>{
  try{
    const a = await Article.findById(req.params.id);
    if(!a) return res.status(404).json({ error:'Not found' });
    res.json(a);
  }catch(e){ next(e); }
});

router.post('/', auth(), requireRole('admin'), async (req,res,next)=>{
  try{
    const schema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      body: Joi.string().allow('').default(''),
      tags: Joi.array().items(Joi.string()).default([]),
      status: Joi.string().valid('draft','published').default('draft')
    });
    const payload = await schema.validateAsync(req.body);
    const a = await Article.create(payload);
    res.status(201).json(a);
  }catch(e){ next(e); }
});

router.put('/:id', auth(), requireRole('admin'), async (req,res,next)=>{
  try{
    const schema = Joi.object({
      title: Joi.string(),
      content: Joi.string(),
      body: Joi.string().allow(''),
      tags: Joi.array().items(Joi.string()),
      status: Joi.string().valid('draft','published')
    });
    const payload = await schema.validateAsync(req.body);
    const a = await Article.findByIdAndUpdate(req.params.id, payload, { new:true });
    if(!a) return res.status(404).json({ error:'Not found' });
    res.json(a);
  }catch(e){ next(e); }
});

router.delete('/:id', auth(), requireRole('admin'), async (req,res,next)=>{
  try{
    const del = await Article.findByIdAndDelete(req.params.id);
    if(!del) return res.status(404).json({ error:'Not found' });
    res.json({ ok:true });
  }catch(e){ next(e); }
});

export default router;
