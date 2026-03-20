// AI Analysis API

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const { skills, interests, resources } = await req.json();

    const prompt = `你是AI创业顾问。根据用户背景推荐3-5个赚钱方向。

用户背景：
- 技能: ${skills || '未填写'}
- 兴趣: ${interests || '未填写'}
- 资源: ${resources || '未填写'}

用中文回复，每个方向包含：名称、为什么适合、如何起步。`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const result = data.choices?.[0]?.message?.content || 'No result';
    return NextResponse.json({ result });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
