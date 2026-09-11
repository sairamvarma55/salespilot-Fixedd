import OpenAI from 'openai';

export async function POST(req) {
  try {
    const body = await req.json();
    const { leadName, company, product, conversation, goal, tone } = body || {};
    if (!leadName || !product) {
      return Response.json({ error: 'Lead name and product are required.' }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({
        mode: 'demo',
        message: `Hi ${leadName}, I wanted to follow up regarding ${product}. ${goal || 'Would you be open to a quick chat this week?'}\n\nBest regards`
      });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `You are SalesPilot AI, a concise sales follow-up assistant. Write one natural message a salesperson can send to a lead.\nLead: ${leadName}\nCompany: ${company || 'Unknown'}\nProduct/service: ${product}\nGoal: ${goal || 'Get a reply'}\nTone: ${tone || 'Professional and friendly'}\nPrevious conversation: ${conversation || 'None provided'}\nRules: Do not invent facts, discounts, prices, promises, or relationships. Keep it concise. Return only the message, no analysis or labels.`;
    const response = await client.responses.create({ model: process.env.OPENAI_MODEL || 'gpt-5-mini', input: prompt });
    return Response.json({ mode: 'live', message: response.output_text });
  } catch (e) {
    return Response.json({ error: e?.message || 'Generation failed.' }, { status: 500 });
  }
}
