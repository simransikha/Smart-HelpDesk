import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';

const router = Router();

router.post('/register', async (req,res,next)=>{
  try{
    const schema = Joi.object({
      name: Joi.string().min(2).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid('user','agent','admin').default('user')
    });
    const { name, email, password, role } = await schema.validateAsync(req.body);
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ error:'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    res.status(201).json({ id:user._id });
  }catch(e){ next(e); }
});

router.post('/login', async (req,res,next)=>{
  try{
    const schema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
    const { email, password } = await schema.validateAsync(req.body);
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ error:'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if(!ok) return res.status(401).json({ error:'Invalid credentials' });
    const token = jwt.sign({ id:user._id, email:user.email, role:user.role, name:user.name }, process.env.JWT_SECRET || 'dev_secret_change_me', { expiresIn:'2h' });
    res.json({ token, user: { id:user._id, email:user.email, role:user.role, name:user.name } });
  }catch(e){ next(e); }
});

export default router;
