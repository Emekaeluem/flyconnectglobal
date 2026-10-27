// Server-side Supabase REST insertion; never expose SUPABASE_SERVICE_ROLE_KEY in browser.
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const b=req.body||{};const name=String(b.name||'').trim();const phone=String(b.phone||'').trim();const email=String(b.email||'').trim();const interest=String(b.interest||'').trim();
 if(b.consent!==true||name.length<2||name.length>100||!/^\+?[0-9 ()-]{7,25}$/.test(phone)||email.length>150||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))||interest.length>150)return res.status(400).json({error:'Check contact information and consent'});
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return res.status(503).json({error:'Lead system not configured'});
 const conv=Array.isArray(b.conversation)?b.conversation.slice(-10).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,1500)})):[];
 try{const response=await fetch(`${process.env.SUPABASE_URL.replace(/\/$/,'')}/rest/v1/ai_leads`,{method:'POST',headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({name,phone,email:email||null,interest:interest||null,conversation:conv,consented_at:new Date().toISOString(),status:'new'})});
 if(!response.ok)throw Error('Database insert failed');return res.status(201).json({ok:true});}catch(e){return res.status(502).json({error:'Enquiry could not be saved'});}
};
