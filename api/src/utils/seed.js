import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Ticket from '../models/Ticket.js';
import Config from '../models/Config.js';

dotenv.config();
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/helpdesk';

async function run(){
  await mongoose.connect(uri);
  console.log('Seeding...');

  await Promise.all([User.deleteMany({}), Article.deleteMany({}), Ticket.deleteMany({})]);

  const passwordHash = await bcrypt.hash('password', 10);
  const [admin, agent, user] = await User.create([
    { name:'Admin', email:'admin@example.com', passwordHash, role:'admin' },
    { name:'Agent', email:'agent@example.com', passwordHash, role:'agent' },
    { name:'Alice', email:'alice@example.com', passwordHash, role:'user' },
  ]);

  await Config.deleteMany({});
  await Config.create({ autoCloseEnabled: true, confidenceThreshold: 0.8 });

  const articles = await Article.create([
    { title:'How to request a refund', body:'To request a refund, provide invoice number and reason. Refunds are processed in 5–7 days.', tags:['billing','refund'], status:'published' },
    { title:'Fix common login errors', body:'Clear cache, reset password, check 2FA settings. Error codes E101, E102 described.', tags:['tech','login','error'], status:'published' },
    { title:'Shipping timelines', body:'Standard delivery takes 3–5 business days. Track shipment via tracking ID.', tags:['shipping','delivery'], status:'published' },
  ]);

  const ticket = await Ticket.create({
    user: user._id,
    title:'Need a refund',
    description:'I was double charged on invoice #1234, please refund.',
    category:'other',
    messages:[{ sender:'user', text:'Initial ticket' }]
  });

  console.log('Users:', { admin:admin.email, agent:agent.email, user:user.email, password:'password' });
  console.log('Articles:', articles.map(a=>a.title));
  console.log('Ticket:', ticket.title);
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(e=>{ console.error(e); process.exit(1); });
