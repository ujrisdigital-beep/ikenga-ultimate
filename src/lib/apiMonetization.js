// IKENGA API Monetization (G4 - 8hrs)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function trackAPIUsage(userId, endpoint, tokensUsed) {
  const pricing = {
    '/api/generate': 0.02, // £0.02 per generation
    '/api/brand-analyze': 0.01,
    '/api/uju-cycle': 0.015
  };
  
  const cost = (pricing[endpoint] || 0.01) * tokensUsed;
  
  await stripe.usageRecords.create({
    customer: userId,
    quantity: Math.round(cost * 100), // Convert to pence
    timestamp: Math.floor(Date.now() / 1000)
  });
  
  // Log to Supabase for analytics
  await supabase.from('api_usage').insert({
    user_id: userId,
    endpoint,
    tokens_used: tokensUsed,
    cost_gbp: cost,
    timestamp: new Date()
  });
}
