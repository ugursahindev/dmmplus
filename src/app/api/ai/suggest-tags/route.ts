import { NextRequest, NextResponse } from 'next/server';

// Basit anahtar kelime çıkarma
function extractKeywords(text: string): string[] {
  // Yaygın Türkçe stop words
  const stopWords = new Set([
    've', 'veya', 'ile', 'için', 'bir', 'bu', 'da', 'de', 
    'ki', 'ne', 'ya', 'ama', 'ancak', 'fakat', 'çünkü',
    'olan', 'olarak', 'gibi', 'daha', 'çok', 'en', 'her',
    'bazı', 'tüm', 'bütün', 'hiç', 'şey', 'zaman', 'yer'
  ]);

  // Metni küçük harfe çevir ve kelimelere ayır
  const words = text.toLowerCase()
    .replace(/[.,!?;:"'()\[\]{}]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Kelime frekansını hesapla
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // En sık geçen kelimeleri seç
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

// OpenAI ile etiket önerisi
async function suggestTagsWithAI(title: string, description: string) {
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
          content: 'Dezenformasyon vakası için en uygun 5 etiketi Türkçe olarak öner. Sadece virgülle ayrılmış etiketleri döndür, başka bir şey yazma.'
        },
        {
          role: 'user',
          content: `Başlık: ${title}\nAçıklama: ${description}`
        }
      ],
      max_tokens: 50,
      temperature: 0.5
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI API error');
  }

  const data = await response.json();
  const tags = data.choices[0].message.content
    .split(',')
    .map((tag: string) => tag.trim())
    .filter((tag: string) => tag.length > 0);

  return tags;
}

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Başlık ve açıklama gerekli' },
        { status: 400 }
      );
    }

    let tags: string[];
    let isAI = false;

    // OpenAI kullan
    if (process.env.OPENAI_API_KEY) {
      try {
        tags = await suggestTagsWithAI(title, description);
        isAI = true;
      } catch (error) {
        // Hata durumunda basit yönteme geç
        console.error('AI tag suggestion failed:', error);
        tags = extractKeywords(`${title} ${description}`);
      }
    } else {
      // API key yoksa basit yöntem kullan
      tags = extractKeywords(`${title} ${description}`);
    }

    // Özel etiketler ekle (vaka tipine göre)
    const specialTags: string[] = [];
    const lowerText = `${title} ${description}`.toLowerCase();
    
    if (lowerText.includes('sahte') || lowerText.includes('fake')) {
      specialTags.push('sahte-içerik');
    }
    if (lowerText.includes('video')) {
      specialTags.push('video');
    }
    if (lowerText.includes('sağlık') || lowerText.includes('aşı')) {
      specialTags.push('sağlık');
    }
    if (lowerText.includes('seçim') || lowerText.includes('siyasi')) {
      specialTags.push('siyasi');
    }

    // Benzersiz etiketleri birleştir
    const uniqueTags = new Set([...tags, ...specialTags]);
    const allTags = Array.from(uniqueTags).slice(0, 6);

    return NextResponse.json({ 
      tags: allTags,
      isAI 
    });

  } catch (error) {
    console.error('Etiket önerisi hatası:', error);
    return NextResponse.json(
      { error: 'Etiket önerisi oluşturulamadı' },
      { status: 500 }
    );
  }
}