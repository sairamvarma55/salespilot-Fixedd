import OpenAI from 'openai';

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      leadName,
      company,
      product,
      conversation,
      goal,
      tone,
    } = body || {};

    if (!leadName || !product) {
      return Response.json(
        { error: 'Lead name and product are required.' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: 'OpenAI API key is not configured.' },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
You are SalesPilot AI, a concise sales follow-up assistant.

Write one natural message a salesperson can send to a lead.

Lead: ${leadName}
Company: ${company || 'Unknown'}
Product/service: ${product}
Goal: ${goal || 'Get a reply'}
Tone: ${tone || 'Professional and friendly'}
Previous conversation: ${conversation || 'None provided'}

Rules:
- Do not invent facts.
- Do not invent discounts, prices, promises, or relationships.
- Keep the message concise and natural.
- Make it appropriate for WhatsApp or email.
- Return only the message.
- Do not include analysis or labels.
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      input: prompt,
    });

    return Response.json({
      mode: 'live',
      message: response.output_text,
    });
  } catch (error) {
    console.error('Generation error:', error);

    return Response.json(
      {
        error: error?.message || 'Generation failed.',
      },
      { status: 500 }
    );
  }
}
