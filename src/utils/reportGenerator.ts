import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { Case } from '@/types';

const statusLabels: Record<string, string> = {
  IDP_FORM: 'IDP Formu',
  HUKUK_INCELEMESI: 'Hukuk İncelemesi',
  SON_KONTROL: 'Son Kontrol',
  RAPOR_URETIMI: 'Rapor Üretimi',
  KURUM_BEKLENIYOR: 'Kurum Bekleniyor',
  TAMAMLANDI: 'Tamamlandı',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
  CRITICAL: 'Kritik',
};

const platformLabels: Record<string, string> = {
  TWITTER: 'Twitter',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  YOUTUBE: 'YouTube',
  WHATSAPP: 'WhatsApp',
  TELEGRAM: 'Telegram',
  TIKTOK: 'TikTok',
  OTHER: 'Diğer',
};

// Standart rapor oluşturma fonksiyonu
export const generateCaseReport = async (caseData: any): Promise<Blob> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Başlık
          new Paragraph({
            children: [
              new TextRun({
                text: 'DMM+ VAKA RAPORU',
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // Vaka Bilgileri Tablosu
          new Paragraph({
            children: [
              new TextRun({
                text: 'Vaka Bilgileri',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Vaka No', bold: true })]
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: caseData.caseNumber || '' })]
                    })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Başlık', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: caseData.title || '' })]
                    })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Platform', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: platformLabels[caseData.platform] || caseData.platform || '' })]
                    })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Durum', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: statusLabels[caseData.status] || caseData.status || '' })]
                    })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Öncelik', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: priorityLabels[caseData.priority] || caseData.priority || '' })]
                    })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Oluşturulma Tarihi', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('tr-TR') : '' })]
                    })],
                  }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),

          // Açıklama
          new Paragraph({
            children: [
              new TextRun({
                text: 'Açıklama',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: caseData.description || '',
              }),
            ],
            spacing: {
              after: 400,
            },
          }),

          // Uzman Değerlendirmesi
          ...(caseData.idpAssessment ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'UZMAN DEĞERLENDİRMESİ',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: caseData.idpAssessment,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
          ] : []),

          // Hukuki Görüş
          ...(caseData.legalAssessment ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'HUKUKİ GÖRÜŞ',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: caseData.legalAssessment,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
          ] : []),

          // İç Rapor
          ...(caseData.internalReport ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'İÇ RAPOR (MAKAM NOTU)',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: caseData.internalReport,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
          ] : []),

          // Kurum Yanıtı
          ...(caseData.institutionResponse ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'KURUM YANITI',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: caseData.institutionResponse,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
          ] : []),

          // Rapor Tarihi
          new Paragraph({
            children: [
              new TextRun({
                text: `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
              }),
            ],
            spacing: {
              before: 400,
            },
            alignment: AlignmentType.RIGHT,
          }),

          // Rapor Bilgisi
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bu rapor DMM+ sistemi tarafından otomatik olarak oluşturulmuştur.',
              }),
            ],
            spacing: {
              before: 200,
            },
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: 'strong',
          name: 'Strong',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            bold: true,
          },
        },
      ],
    },
  });

  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

// Arz notu formatında rapor oluşturma fonksiyonu
export const generateCaseReportWithTemplate = async (caseData: any): Promise<Blob> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Başlık - Arz Notu Formatı
          new Paragraph({
            children: [
              new TextRun({
                text: 'ARZ NOTU',
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // Vaka Bilgileri
          new Paragraph({
            children: [
              new TextRun({
                text: 'Vaka Bilgileri',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),

          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Vaka No', bold: true })]
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: caseData.caseNumber || '' })]
                    })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Başlık', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: caseData.title || '' })]
                    })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Platform', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: platformLabels[caseData.platform] || caseData.platform || '' })]
                    })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Durum', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: statusLabels[caseData.status] || caseData.status || '' })]
                    })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: 'Oluşturulma Tarihi', bold: true })]
                    })],
                    shading: { fill: 'F2F2F2' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ 
                      children: [new TextRun({ text: caseData.createdAt ? new Date(caseData.createdAt).toLocaleDateString('tr-TR') : '' })]
                    })],
                  }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),

          // Açıklama
          new Paragraph({
            children: [
              new TextRun({
                text: 'Açıklama',
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: caseData.description || '',
              }),
            ],
            spacing: {
              after: 400,
            },
          }),

          // Uzman Değerlendirmesi
          ...(caseData.idpAssessment ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'UZMAN DEĞERLENDİRMESİ',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: caseData.idpAssessment,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
          ] : []),

          // Hukuki Görüş
          ...(caseData.legalAssessment ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'HUKUKİ GÖRÜŞ',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: caseData.legalAssessment,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
          ] : []),

          // İç Rapor
          ...(caseData.internalReport ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'İÇ RAPOR (MAKAM NOTU)',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: caseData.internalReport,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
          ] : []),

          // Kurum Yanıtı
          ...(caseData.institutionResponse ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'KURUM YANITI',
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: caseData.institutionResponse,
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
          ] : []),

          // Rapor Tarihi
          new Paragraph({
            children: [
              new TextRun({
                text: `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
              }),
            ],
            spacing: {
              before: 400,
            },
            alignment: AlignmentType.RIGHT,
          }),

          // Rapor Bilgisi
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bu arz notu DMM+ sistemi tarafından otomatik olarak oluşturulmuştur.',
              }),
            ],
            spacing: {
              before: 200,
            },
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: 'strong',
          name: 'Strong',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            bold: true,
          },
        },
      ],
    },
  });

  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

export const downloadReport = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
