import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, Header, ImageRun, HorizontalPositionAlign, HorizontalPositionRelativeFrom, VerticalPositionAlign, VerticalPositionRelativeFrom } from 'docx';
import type { IImageOptions } from 'docx';
import arzNotuTemplate from '@/images/arznotu_arkaplan.png';
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

const arzNotuPageMargins = {
  top: 2200,
  right: 1200,
  bottom: 1600,
  left: 1200,
};

let arzNotuTemplateBufferPromise: Promise<ArrayBuffer> | null = null;

const loadArzNotuTemplateBuffer = async (): Promise<ArrayBuffer> => {
  if (arzNotuTemplateBufferPromise) {
    return arzNotuTemplateBufferPromise;
  }

  if (typeof window === 'undefined') {
    throw new Error('Arz notu şablonu sadece istemci tarafında yüklenebilir.');
  }

  arzNotuTemplateBufferPromise = fetch(arzNotuTemplate.src).then((response) => {
    if (!response.ok) {
      throw new Error('Arz notu arkaplan görseli yüklenemedi.');
    }
    return response.arrayBuffer();
  });

  return arzNotuTemplateBufferPromise;
};

const buildArzNotuBackgroundHeader = async (): Promise<Header> => {
  const templateBuffer = await loadArzNotuTemplateBuffer();
  const templateData = new Uint8Array(templateBuffer);

  const backgroundImageOptions = {
    data: templateData,
    transformation: {
      width: arzNotuTemplate.width,
      height: arzNotuTemplate.height,
    },
    floating: {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.PAGE,
        align: HorizontalPositionAlign.CENTER,
      },
      verticalPosition: {
        relative: VerticalPositionRelativeFrom.PAGE,
        align: VerticalPositionAlign.TOP,
      },
      allowOverlap: true,
      behindDocument: true,
    },
  } as unknown as IImageOptions; // docx typings expect Svg options; force raster config

  return new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun(backgroundImageOptions),
        ],
        spacing: { after: 0 },
      }),
    ],
  });
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

  return Packer.toBlob(doc);
};

// Arz notu formatında rapor oluşturma fonksiyonu
export const generateCaseReportWithTemplate = async (caseData: any): Promise<Blob> => {
  const arzNotuHeader = await buildArzNotuBackgroundHeader();

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: arzNotuPageMargins,
          },
        },
        headers: {
          default: arzNotuHeader,
        },
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

  return Packer.toBlob(doc);
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
