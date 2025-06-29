import { NextRequest, NextResponse } from 'next/server';

interface RiskFactors {
  platformRisk: number;
  contentTypeRisk: number;
  geographicRisk: number;
  viralityRisk: number;
  legalRisk: number;
}

// Platform risk skorları
const platformRiskScores: Record<string, number> = {
  'TWITTER': 7,
  'FACEBOOK': 6,
  'INSTAGRAM': 5,
  'YOUTUBE': 8,
  'TIKTOK': 9,
  'WHATSAPP': 9,
  'TELEGRAM': 8,
  'NEWS_WEBSITE': 7,
  'OTHER': 5
};

// İçerik tipi risk skorları
const contentTypeScores: Record<string, number> = {
  'YALAN_HABER': 9,
  'MANIPULASYON': 8,
  'YANLIS_BILGI': 7,
  'SAHTE_ICERIK': 10,
  'KOMPLO_TEORISI': 8,
  'NEFRET_SOYLEMI': 10,
  'PROPAGANDA': 9,
  'DEEPFAKE': 10
};

// Coğrafi kapsam risk skorları
const geographicScores: Record<string, number> = {
  'LOCAL': 3,
  'REGIONAL': 5,
  'NATIONAL': 8,
  'INTERNATIONAL': 10
};

// Risk hesaplama fonksiyonu
function calculateRiskScore(caseData: any): { score: number; factors: RiskFactors; recommendation: string } {
  const factors: RiskFactors = {
    platformRisk: 0,
    contentTypeRisk: 0,
    geographicRisk: 0,
    viralityRisk: 0,
    legalRisk: 0
  };

  // Platform riski
  factors.platformRisk = platformRiskScores[caseData.platform] || 5;

  // İçerik tipi riski
  factors.contentTypeRisk = contentTypeScores[caseData.disinformationType] || 7;

  // Coğrafi kapsam riski
  factors.geographicRisk = geographicScores[caseData.geographicScope] || 5;

  // Viralite riski (priority'ye göre)
  factors.viralityRisk = caseData.priority === 'HIGH' ? 9 : 
                         caseData.priority === 'MEDIUM' ? 6 : 3;

  // Hukuki risk (içeriğe göre basit analiz)
  const content = `${caseData.title} ${caseData.description}`.toLowerCase();
  if (content.includes('sahte') || content.includes('deepfake')) {
    factors.legalRisk = 9;
  } else if (content.includes('yalan') || content.includes('asılsız')) {
    factors.legalRisk = 7;
  } else if (content.includes('yanıltıcı') || content.includes('manipüle')) {
    factors.legalRisk = 6;
  } else {
    factors.legalRisk = 5;
  }

  // Ağırlıklı ortalama
  const weights = {
    platform: 0.15,
    contentType: 0.30,
    geographic: 0.20,
    virality: 0.20,
    legal: 0.15
  };

  const totalScore = Math.round(
    factors.platformRisk * weights.platform +
    factors.contentTypeRisk * weights.contentType +
    factors.geographicRisk * weights.geographic +
    factors.viralityRisk * weights.virality +
    factors.legalRisk * weights.legal
  );

  // Öneri oluştur
  let recommendation = '';
  if (totalScore >= 8) {
    recommendation = 'ACİL: Bu vaka yüksek risk taşımaktadır. Derhal hukuki değerlendirmeye alınmalı ve ilgili bakanlıkla koordine edilmelidir.';
  } else if (totalScore >= 6) {
    recommendation = 'ÖNCELİKLİ: Orta-yüksek risk seviyesi. 24 saat içinde değerlendirilmeli ve gerekli aksiyonlar alınmalıdır.';
  } else if (totalScore >= 4) {
    recommendation = 'NORMAL: Orta risk seviyesi. Rutin süreçte değerlendirilebilir.';
  } else {
    recommendation = 'DÜŞÜK: Düşük risk seviyesi. Standart prosedür uygulanabilir.';
  }

  return {
    score: totalScore,
    factors,
    recommendation
  };
}

export async function POST(request: NextRequest) {
  try {
    const caseData = await request.json();

    // Gerekli alanları kontrol et
    if (!caseData.platform || !caseData.priority || !caseData.geographicScope) {
      return NextResponse.json(
        { error: 'Eksik veri: platform, priority ve geographicScope gerekli' },
        { status: 400 }
      );
    }

    // Risk skoru hesapla
    const { score, factors, recommendation } = calculateRiskScore(caseData);

    // Risk seviyesini belirle
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (score >= 8) {
      riskLevel = 'CRITICAL';
    } else if (score >= 6) {
      riskLevel = 'HIGH';
    } else if (score >= 4) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    // Detaylı analiz
    const analysis = {
      platformAnalysis: `${caseData.platform} platformu ${factors.platformRisk}/10 risk puanına sahip.`,
      contentAnalysis: `İçerik tipi "${caseData.disinformationType || 'Belirtilmemiş'}" ${factors.contentTypeRisk}/10 risk seviyesinde.`,
      geographicAnalysis: `${caseData.geographicScope} kapsam ${factors.geographicRisk}/10 risk taşıyor.`,
      viralityAnalysis: `${caseData.priority} öncelik seviyesi ${factors.viralityRisk}/10 viralite riski oluşturuyor.`,
      legalAnalysis: `Hukuki risk değerlendirmesi: ${factors.legalRisk}/10`
    };

    return NextResponse.json({
      score,
      riskLevel,
      factors,
      recommendation,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Risk skoru hesaplama hatası:', error);
    return NextResponse.json(
      { error: 'Risk skoru hesaplanamadı' },
      { status: 500 }
    );
  }
}