import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

/**
 * Export tailored resume data to Microsoft Word (.docx) format using docx library.
 */
export async function exportToWord(resume, filename = 'Resume') {
  if (!resume) return;

  const { header, professionalTitle, summary, skills, experience, projects, education, certifications, achievements, links } = resume;

  const children = [];

  // 1. Header (Name & Title)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: header.name || 'Resume',
          bold: true,
          size: 32, // 16pt
          font: 'Arial',
          color: '111827',
        }),
      ],
    })
  );

  if (professionalTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: professionalTitle,
            size: 24, // 12pt
            font: 'Arial',
            color: '4B5563',
          }),
        ],
      })
    );
  }

  // Contact line
  const contactItems = [header.email, header.phone, header.location].filter(Boolean);
  if (contactItems.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: contactItems.join('  •  '),
            size: 18, // 9pt
            font: 'Arial',
            color: '6B7280',
          }),
        ],
      })
    );
  }

  // Links line
  const linkItems = [header.linkedin, header.github, header.portfolio].filter(Boolean);
  if (linkItems.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: linkItems.join('  •  '),
            size: 18, // 9pt
            font: 'Arial',
            color: '0066CC',
          }),
        ],
      })
    );
  }

  // Helper function for section headings
  const addSectionHeader = (title) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spaceBefore: 240,
        spaceAfter: 120,
        border: {
          bottom: { color: '0066CC', space: 1, value: BorderStyle.SINGLE, size: 12 },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: 'Arial',
            color: '0066CC',
          }),
        ],
      })
    );
  };

  // 2. Summary
  if (summary) {
    addSectionHeader('Professional Summary');
    children.push(
      new Paragraph({
        spaceAfter: 120,
        children: [
          new TextRun({
            text: summary,
            size: 20, // 10pt
            font: 'Arial',
            color: '374151',
          }),
        ],
      })
    );
  }

  // 3. Technical Skills
  if (skills && skills.length > 0) {
    addSectionHeader('Technical Skills');
    children.push(
      new Paragraph({
        spaceAfter: 120,
        children: [
          new TextRun({
            text: skills.join('  •  '),
            size: 20, // 10pt
            font: 'Arial',
            color: '374151',
          }),
        ],
      })
    );
  }

  // 4. Experience
  if (experience && experience.length > 0) {
    addSectionHeader('Professional Experience');
    for (const exp of experience) {
      // Role & Dates
      children.push(
        new Paragraph({
          spaceBefore: 120,
          spaceAfter: 40,
          children: [
            new TextRun({
              text: `${exp.title}${exp.company ? ` — ${exp.company}` : ''}`,
              bold: true,
              size: 20,
              font: 'Arial',
              color: '1F2937',
            }),
            new TextRun({
              text: `\t${[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}`,
              size: 18,
              font: 'Arial',
              color: '6B7280',
            }),
          ],
        })
      );

      if (exp.location) {
        children.push(
          new Paragraph({
            spaceAfter: 40,
            children: [
              new TextRun({
                text: exp.location,
                italics: true,
                size: 18,
                font: 'Arial',
                color: '6B7280',
              }),
            ],
          })
        );
      }

      if (exp.bullets && exp.bullets.length > 0) {
        for (const bullet of exp.bullets.filter(Boolean)) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spaceAfter: 40,
              children: [
                new TextRun({
                  text: bullet,
                  size: 19,
                  font: 'Arial',
                  color: '374151',
                }),
              ],
            })
          );
        }
      }
    }
  }

  // 5. Projects
  if (projects && projects.length > 0) {
    addSectionHeader('Projects');
    for (const proj of projects) {
      children.push(
        new Paragraph({
          spaceBefore: 120,
          spaceAfter: 40,
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 20,
              font: 'Arial',
              color: '1F2937',
            }),
            proj.link
              ? new TextRun({
                  text: ` — ${proj.link}`,
                  size: 18,
                  font: 'Arial',
                  color: '0066CC',
                })
              : new TextRun({ text: '' }),
          ],
        })
      );

      if (proj.description) {
        children.push(
          new Paragraph({
            spaceAfter: 40,
            children: [
              new TextRun({
                text: proj.description,
                size: 19,
                font: 'Arial',
                color: '4B5563',
              }),
            ],
          })
        );
      }

      if (proj.technologies && proj.technologies.length > 0) {
        children.push(
          new Paragraph({
            spaceAfter: 40,
            children: [
              new TextRun({
                text: 'Technologies: ',
                bold: true,
                size: 18,
                font: 'Arial',
                color: '374151',
              }),
              new TextRun({
                text: proj.technologies.join(', '),
                size: 18,
                font: 'Arial',
                color: '4B5563',
              }),
            ],
          })
        );
      }

      if (proj.highlights && proj.highlights.length > 0) {
        for (const h of proj.highlights.filter(Boolean)) {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              spaceAfter: 40,
              children: [
                new TextRun({
                  text: h,
                  size: 19,
                  font: 'Arial',
                  color: '374151',
                }),
              ],
            })
          );
        }
      }
    }
  }

  // 6. Education
  if (education && education.length > 0) {
    addSectionHeader('Education');
    for (const edu of education) {
      children.push(
        new Paragraph({
          spaceBefore: 100,
          spaceAfter: 40,
          children: [
            new TextRun({
              text: `${[edu.degree, edu.field].filter(Boolean).join(' in ')}${edu.institution ? ` — ${edu.institution}` : ''}`,
              bold: true,
              size: 20,
              font: 'Arial',
              color: '1F2937',
            }),
            edu.year
              ? new TextRun({
                  text: `\t${edu.year}`,
                  size: 18,
                  font: 'Arial',
                  color: '6B7280',
                })
              : new TextRun({ text: '' }),
          ],
        })
      );
    }
  }

  // 7. Certifications
  if (certifications && certifications.length > 0) {
    addSectionHeader('Certifications');
    for (const cert of certifications) {
      const name = typeof cert === 'string' ? cert : cert.name;
      const issuer = typeof cert === 'object' ? cert.issuer : '';
      const date = typeof cert === 'object' ? cert.date : '';
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spaceAfter: 40,
          children: [
            new TextRun({
              text: `${name}${issuer ? ` — ${issuer}` : ''}${date ? ` (${date})` : ''}`,
              size: 19,
              font: 'Arial',
              color: '374151',
            }),
          ],
        })
      );
    }
  }

  // Generate docx Blob & download
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9\-_]/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
