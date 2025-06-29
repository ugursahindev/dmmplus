import { NextRequest, NextResponse } from 'next/server';

// OpenAI API için basit bir implementation (openai paketi olmadan)
async function callOpenAI(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return null; // Return null to handle error in the main function
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Sen bir haber özetleme asistanısın. Verilen metni maksimum 3 cümleyle Türkçe özetle. Sadece önemli bilgileri içer.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: 'Metin çok kısa, en az 50 karakter olmalı' },
        { status: 400 }
      );
    }

    // Eğer API key yoksa, basit bir özet döndür
    if (!process.env.OPENAI_API_KEY) {
      // Basit özet algoritması
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      const summary = sentences.slice(0, 2).join(' ');
      return NextResponse.json({ 
        summary: summary || text.substring(0, 150) + '...',
        isAI: false 
      });
    }

    // OpenAI ile özet oluştur
    const summary = await callOpenAI(text);

    return NextResponse.json({ 
      summary,
      isAI: true 
    });

  } catch (error) {
    console.error('Özet oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Özet oluşturulamadı' },
      { status: 500 }
    );
  }
}