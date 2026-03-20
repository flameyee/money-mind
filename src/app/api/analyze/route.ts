// AI Analysis API

import { NextRequest, NextResponse } from 'next/server';

const API_KEY = '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';

export async function POST(req: NextRequest) {
  try {
    const { skills, interests, resources } = await req.json();

    if (!skills && !interests) {
      return NextResponse.json(
        { error: 'Please provide your skills or interests' },
        { status: 400 }
      );
    }

    const prompt = `You are a professional AI business advisor. User wants to find a way to make money.

User background:
- Skills: ${skills || 'Not provided'}
- Interests: ${interests || 'Not provided'}  
- Resources: ${resources || 'Not provided'}

Analyze and give 3-5 possible money-making directions. Each includes:
1. Direction name
2. Why it's suitable
3. How to start (first step)
4. Priority (high/medium/low)

Remind: This is AI advice, decisions are user's responsibility.

Reply in Chinese.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://money-mind-azure-six.vercel.app',
        'X-Title': 'MoneyMind',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: 'You are a professional AI business advisor.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || 'No result';

    return NextResponse.json({ result });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
