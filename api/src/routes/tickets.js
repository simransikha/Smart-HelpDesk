// Reopen ticket
router.post('/:id/reopen', auth(), requireRole('agent','admin'), async (req,res,next) => {
  try {
    const t = await Ticket.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    t.status = 'open';
    await t.save();
    await AuditLog.create({ ticket: t._id, action: 'REOPENED', actor: req.user.role, data: {}, traceId: t._id.toString() });
    emitInAppNotification({ userId: t.user, message: `Your ticket "${t.title}" was reopened.`, type: 'ticket_reopened' });
    sendEmailNotification({ to: req.user.email, subject: 'Ticket Reopened', text: `Your ticket "${t.title}" was reopened.` });
    res.json({ ok: true });
  } catch(e) { next(e); }
});

// Close ticket
router.post('/:id/close', auth(), requireRole('agent','admin'), async (req,res,next) => {
  try {
    const t = await Ticket.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    t.status = 'resolved';
    await t.save();
    await AuditLog.create({ ticket: t._id, action: 'CLOSED', actor: req.user.role, data: {}, traceId: t._id.toString() });
    emitInAppNotification({ userId: t.user, message: `Your ticket "${t.title}" was closed.`, type: 'ticket_closed' });
    sendEmailNotification({ to: req.user.email, subject: 'Ticket Closed', text: `Your ticket "${t.title}" was closed.` });
    res.json({ ok: true });
  } catch(e) { next(e); }
});
import { Router } from 'express';
import Joi from 'joi';
import { auth, requireRole } from '../middleware/auth.js';
import Ticket from '../models/Ticket.js';
import AuditLog from '../models/AuditLog.js';
import { runTriage } from '../services/agent/triage.js';
import { sendEmailNotification, emitInAppNotification } from '../utils/notify.js';

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
      category: Joi.string().valid('billing','tech','shipping','other').default('other'),
      attachments: Joi.array().items(Joi.string().uri()).default([])
    });
    const payload = await schema.validateAsync(req.body);
  const t = await Ticket.create({ ...payload, user: req.user.id, messages:[{ sender:'user', text: payload.description }] });
  await AuditLog.create({ ticket: t._id, action:'TICKET_CREATED', actor:'user', data:{}, traceId: t._id.toString() });
  // Trigger triage (fire and forget)
  runTriage(t._id).catch(err=>console.error('triage error', err));
  // Emit notification and email stub
  emitInAppNotification({ userId: req.user.id, message: `Your ticket "${t.title}" was created.`, type: 'ticket_created' });
  sendEmailNotification({ to: req.user.email, subject: 'Ticket Created', text: `Your ticket "${t.title}" was created.` });
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
  // Emit notification and email stub
  emitInAppNotification({ userId: t.user, message: `Your ticket "${t.title}" received a reply.`, type: 'ticket_reply' });
  sendEmailNotification({ to: req.user.email, subject: 'Ticket Reply', text: `Your ticket "${t.title}" received a reply.` });
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
  // Emit notification and email stub
  emitInAppNotification({ userId: userId, message: `You have been assigned ticket "${t.title}".`, type: 'ticket_assigned' });
  sendEmailNotification({ to: req.user.email, subject: 'Ticket Assigned', text: `You have been assigned ticket "${t.title}".` });
  res.json(t);
  }catch(e){ next(e); }
});

export default router;
