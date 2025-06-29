'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Chip, Textarea, Progress } from '@nextui-org/react';
import { Sparkles, Tag, AlertTriangle, FileText } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface AIAssistantProps {
  onSummaryGenerated?: (summary: string) => void;
  onTagsGenerated?: (tags: string[]) => void;
  initialText?: string;
  caseData?: any;
}

export function AIAssistant({ 
  onSummaryGenerated, 
  onTagsGenerated, 
  initialText = '',
  caseData 
}: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [riskScore, setRiskScore] = useState<any>(null);

  // Özet oluştur
  const generateSummary = async () => {
    if (!initialText) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/ai/summarize', { text: initialText });
      
      setSummary(response.data.summary);
      onSummaryGenerated?.(response.data.summary);
    } catch (error) {
      console.error('Özet oluşturma hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Etiket öner
  const suggestTags = async () => {
    if (!caseData?.title || !caseData?.description) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/ai/suggest-tags', {
        title: caseData.title,
        description: caseData.description
      });
      
      setTags(response.data.tags);
      onTagsGenerated?.(response.data.tags);
    } catch (error) {
      console.error('Etiket önerisi hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Risk skoru hesapla
  const calculateRisk = async () => {
    if (!caseData) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/api/ai/risk-score', caseData);
      
      setRiskScore(response.data);
    } catch (error) {
      console.error('Risk skoru hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'primary';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card className="mt-4">
      <CardBody className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Asistan</h3>
        </div>

        {/* Özet Oluşturma */}
        <div className="space-y-2">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            startContent={<FileText className="w-4 h-4" />}
            onPress={generateSummary}
            isLoading={isLoading}
            isDisabled={!initialText}
          >
            Otomatik Özet Oluştur
          </Button>
          
          {summary && (
            <Textarea
              label="AI Özeti"
              value={summary}
              minRows={2}
              readOnly
              variant="bordered"
              classNames={{
                input: "text-sm",
              }}
            />
          )}
        </div>

        {/* Etiket Önerisi */}
        <div className="space-y-2">
          <Button
            size="sm"
            color="secondary"
            variant="flat"
            startContent={<Tag className="w-4 h-4" />}
            onPress={suggestTags}
            isLoading={isLoading}
            isDisabled={!caseData?.title}
          >
            Etiket Öner
          </Button>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  onClose={() => {
                    const newTags = tags.filter((_, i) => i !== index);
                    setTags(newTags);
                  }}
                >
                  {tag}
                </Chip>
              ))}
            </div>
          )}
        </div>

        {/* Risk Skoru */}
        <div className="space-y-2">
          <Button
            size="sm"
            color="warning"
            variant="flat"
            startContent={<AlertTriangle className="w-4 h-4" />}
            onPress={calculateRisk}
            isLoading={isLoading}
            isDisabled={!caseData}
          >
            Risk Skoru Hesapla
          </Button>
          
          {riskScore && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Skoru</span>
                <Chip 
                  color={getRiskColor(riskScore.riskLevel)} 
                  size="sm"
                  variant="flat"
                >
                  {riskScore.score}/10 - {riskScore.riskLevel}
                </Chip>
              </div>
              
              <Progress
                value={riskScore.score * 10}
                color={getRiskColor(riskScore.riskLevel)}
                className="mb-2"
              />
              
              <div className="bg-default-100 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Öneri:</p>
                <p className="text-sm text-default-600">{riskScore.recommendation}</p>
              </div>
              
              {riskScore.factors && (
                <div className="space-y-1 text-xs text-default-500">
                  <div>Platform Riski: {riskScore.factors.platformRisk}/10</div>
                  <div>İçerik Riski: {riskScore.factors.contentTypeRisk}/10</div>
                  <div>Coğrafi Risk: {riskScore.factors.geographicRisk}/10</div>
                  <div>Yayılma Riski: {riskScore.factors.viralityRisk}/10</div>
                  <div>Hukuki Risk: {riskScore.factors.legalRisk}/10</div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}