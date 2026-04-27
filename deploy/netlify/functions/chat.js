require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { message, history } = JSON.parse(event.body);

  // Basic validation
  if (!message) {
    return { statusCode: 400, body: 'Message is required' };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful cybersecurity assistant for the GUARDBULLDOG platform. Your goal is to answer user questions about phishing and security. If the user seems frustrated or asks to speak to a person, respond with the exact phrase: `AGENT_ESCALATION`.' },
        ...history,
        { role: 'user', content: message },
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: aiResponse }),
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get response from AI' }),
    };
  }
};
