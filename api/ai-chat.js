// Vercel Node.js serverless function. OPENAI_API_KEY must only exist in server environment.
const guidance = require('../flyconnect-knowledge.json');
module.exports = async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const {message,history=[]}=req.body||{};
 if(typeof message!=='string'||!message.trim()||message.length>1500||!Array.isArray(history))return res.status(400).json({error:'Invalid input'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI service not configured'});
 const safeHistory=history.slice(-10).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,1500)}));
 const system=`You are FlyConnect AI, the friendly, clear travel and study consultant for Fly Connect Global. You help with study-abroad, work-abroad and travel enquiries. Ask one focused question at a time to learn destination, age (only if necessary for eligibility), education, budget and desired intake. Provide factual information ONLY from the approved company knowledge shown below. If an offer, cost, eligibility, deadline, visa rule, or country policy is missing or not confirmed, explicitly say it needs confirmation from a human Fly Connect consultant. Never invent partners, admission decisions, financing approvals, visa outcomes or current availability. Do not guarantee visas or jobs, and do not provide binding immigration/legal advice. Do not ask customers to send passport scans, ID numbers, bank statements or other sensitive documents in chat. For qualified prospects, invite them to use 'Request a consultation' to share name and contact details with consent; do not claim to have saved a lead without submission. Refer sensitive or unclear situations to a human consultant. Be helpful, short and professional. Approved knowledge: ${JSON.stringify(guidance)}`;
 try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
 const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',messages:[{role:'system',content:system},...safeHistory,{role:'user',content:message}],temperature:0.2,max_tokens:420})}).finally(()=>clearTimeout(timeout));
 if(!response.ok)throw Error('AI provider error');const data=await response.json();return res.status(200).json({reply:data.choices?.[0]?.message?.content||'Please contact a Fly Connect consultant for assistance.'});
 }catch(e){return res.status(502).json({error:'AI temporarily unavailable'});}
};
