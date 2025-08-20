import { Router } from 'express';
import Joi from 'joi';
import { auth, requireRole } from '../middleware/auth.js';
import Ticket from '../models/Ticket.js';
import AuditLog from '../models/AuditLog.js';
import { runTriage } from '../services/agent/triage.js';

const router = Router();

router.get('/', auth(), async (req,res,next)=>{
  try{
    const filter = {};
    if(req.user.role === 'user') filter.user = req.user.id;
    if(req.query.status) filter.status = req.query.status;
    const tickets = await Ticket.find(filter).sort({ createdAt:-1 }).limit(100);
    res.json(tickets);
  }catch(e){ next(e); }
});

router.get('/:id', auth(), async (req,res,next)=>{
  try{
    const t = await Ticket.findById(req.params.id);
    if(!t) return res.status(404).json({ error:'Not found' });
    if(req.user.role==='user' && t.user.toString()!==req.user.id) return res.status(403).json({ error:'Forbidden' });
    res.json(t);
  }catch(e){ next(e); }
});

router.post('/', auth(), async (req,res,next)=>{
  try{
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      category: Joi.string().valid('billing','tech','shipping','other').default('other')
    });
    const payload = await schema.validateAsync(req.body);
    const t = await Ticket.create({ ...payload, user: req.user.id, messages:[{ sender:'user', text: payload.description }] });
    await AuditLog.create({ ticket: t._id, action:'TICKET_CREATED', actor:'user', data:{}, traceId: t._id.toString() });
    // Trigger triage (fire and forget)
    runTriage(t._id).catch(err=>console.error('triage error', err));
    res.status(201).json(t);
  }catch(e){ next(e); }
});

router.post('/:id/reply', auth(), async (req,res,next)=>{
  try{
    const schema = Joi.object({ text: Joi.string().required() });
    const { text } = await schema.validateAsync(req.body);
    const t = await Ticket.findById(req.params.id);
    if(!t) return res.status(404).json({ error:'Not found' });
    if(req.user.role==='user' && t.user.toString()!==req.user.id) return res.status(403).json({ error:'Forbidden' });
    const sender = req.user.role==='user' ? 'user' : 'agent';
    t.messages.push({ sender, text });
    t.status = 'open';
    await t.save();
    await AuditLog.create({ ticket: t._id, action:'MESSAGE_POSTED', actor: sender, data:{}, traceId: t._id.toString() });
    res.json({ ok:true });
  }catch(e){ next(e); }
});

router.post('/:id/assign', auth(), requireRole('admin','agent'), async (req,res,next)=>{
  try{
    const schema = Joi.object({ userId: Joi.string().required() });
    const { userId } = await schema.validateAsync(req.body);
    const t = await Ticket.findByIdAndUpdate(req.params.id, { assignedTo: userId }, { new: true });
    if(!t) return res.status(404).json({ error:'Not found' });
    await AuditLog.create({ ticket: t._id, action:'ASSIGNED', actor: 'admin', data:{ to:userId }, traceId: t._id.toString() });
    res.json(t);
  }catch(e){ next(e); }
});

export default router;
