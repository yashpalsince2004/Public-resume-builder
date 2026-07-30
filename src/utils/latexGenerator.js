/**
 * LaTeX Resume Generator
 * Strictly follows the exact structure, preamble, environments, and formatting of template.tex
 * No extra packages or commands added.
 */

function escapeLatex(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\\/g, '\\textasciitilde{}')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export function generateLatexResume(resume) {
  if (!resume) return '';

  const { header, professionalTitle, summary, skills, experience, projects, education, certifications } = resume;

  const name = escapeLatex(header.name || 'John Doe');
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // 1. Preamble & Setup exact copy from template.tex
  let latex = `\\documentclass[10pt, letterpaper]{article}

% Packages:
\\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=2 cm, % seperation between body and page edge from the top
    bottom=2 cm, % seperation between body and page edge from the bottom
    left=2 cm, % seperation between body and page edge from the left
    right=2 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\\usepackage{titlesec} % for customizing section titles
\\usepackage{tabularx} % for making tables with fixed width columns
\\usepackage{array} % tabularx requires this
\\usepackage[dvipsnames]{xcolor} % for coloring text
\\definecolor{primaryColor}{RGB}{0, 79, 144} % define primary color
\\usepackage{enumitem} % for customizing lists
\\usepackage{fontawesome5} % for using icons
\\usepackage{amsmath} % for math
\\usepackage[
    pdftitle={${name}'s CV},
    pdfauthor={${name}},
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\\usepackage[pscoord]{eso-pic} % for floating text on the page
\\usepackage{calc} % for calculating lengths
\\usepackage{bookmark} % for bookmarks
\\usepackage{lastpage} % for getting the total number of pages
\\usepackage{changepage} % for one column entries (adjustwidth environment)
\\usepackage{paracol} % for two and three column entries
\\usepackage{ifthen} % for conditional statements
\\usepackage{needspace} % for avoiding page brake right after the section title
\\usepackage{iftex} % check if engine is pdflatex, xetex or luatex

% Ensure that generate pdf is machine readable/ATS parsable:
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    % \\usepackage[T1]{fontenc} % this breaks sb2nov
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
\\fi



% Some settings:
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt} % remove space before adjustwidth environment
\\pagestyle{empty} % no header or footer
\\setcounter{secnumdepth}{0} % no section numbering
\\setlength{\\parindent}{0pt} % no indentation
\\setlength{\\topskip}{0pt} % no top skip
\\setlength{\\columnsep}{0cm} % set column seperation
\\makeatletter
\\let\\ps@customFooterStyle\\ps@plain % Copy the plain style to customFooterStyle
\\patchcmd{\\ps@customFooterStyle}{\\thepage}{
    \\color{gray}\\textit{\\small ${name} - Page \\thepage{} of \\pageref*{LastPage}}
}{}{} % replace number by desired string
\\makeatother
\\pagestyle{customFooterStyle}

\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]

\\titlespacing{\\section}{
    % left space:
    -1pt
}{
    % top space:
    0.3 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\\renewcommand\\labelitemi{$\\circ$} % custom bullet points
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0.4 cm + 10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights

\\newenvironment{highlightsforbulletentries}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights for bullet entries


\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{
        0.2 cm + 0.00001 cm
    }{
        0.2 cm + 0.00001 cm
    }
}{
    \\end{adjustwidth}
} % new environment for one column entries

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for two column entries

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\linespread{1.5}
}{
    \\par\\kern\\topsep
} % new environment for the header

\\newcommand{\\placelastupdatedtext}{% \\placetextbox{<horizontal pos>}{<vertical pos>}{<stuff>}
  \\AddToShipoutPictureFG*{% Add <stuff> to current page foreground
    \\put(
        \\LenToUnit{\\paperwidth-2 cm-0.2 cm+0.05cm},
        \\LenToUnit{\\paperheight-1.0 cm}
    ){\\vtop{{\\null}\\makebox[0pt][c]{
        \\small\\color{gray}\\textit{Last updated in ${dateStr}}\\hspace{\\widthof{Last updated in ${dateStr}}}
    }}}%
  }%
}%

% save the original href command in a new command:
\\let\\hrefWithoutArrow\\href

% new command for external links:
\\renewcommand{\\href}[2]{\\hrefWithoutArrow{#1}{\\ifthenelse{\\equal{#2}{}}{ }{#2 }\\raisebox{.15ex}{\\footnotesize \\faExternalLink*}}}


\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{}

    \\placelastupdatedtext
    \\begin{header}
        \\textbf{\\fontsize{24 pt}{24 pt}\\selectfont ${name}}

        \\vspace{0.3 cm}

        \\normalsize
`;

  // Contact items exact matching template.tex syntax
  const contactEntries = [];

  if (header.location) {
    contactEntries.push(`\\mbox{{\\color{black}\\footnotesize\\faMapMarker*}\\hspace*{0.13cm}${escapeLatex(header.location)}}%`);
  }
  if (header.email) {
    contactEntries.push(`\\mbox{\\hrefWithoutArrow{mailto:${header.email}}{\\color{black}{\\footnotesize\\faEnvelope[regular]}\\hspace*{0.13cm}${escapeLatex(header.email)}}}%`);
  }
  if (header.phone) {
    contactEntries.push(`\\mbox{\\hrefWithoutArrow{tel:${header.phone}}{\\color{black}{\\footnotesize\\faPhone*}\\hspace*{0.13cm}${escapeLatex(header.phone)}}}%`);
  }
  if (header.portfolio) {
    contactEntries.push(`\\mbox{\\hrefWithoutArrow{https://${header.portfolio}}{\\color{black}{\\footnotesize\\faLink}\\hspace*{0.13cm}${escapeLatex(header.portfolio)}}}%`);
  }
  if (header.linkedin) {
    const cleanUser = header.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/').pop() || header.linkedin;
    const hrefUrl = header.linkedin.startsWith('http') ? header.linkedin : `https://${header.linkedin.includes('linkedin.com') ? header.linkedin : `linkedin.com/in/${header.linkedin}`}`;
    contactEntries.push(`\\mbox{\\hrefWithoutArrow{${hrefUrl}}{\\color{black}{\\footnotesize\\faLinkedinIn}\\hspace*{0.13cm}${escapeLatex(cleanUser)}}}%`);
  }
  if (header.github) {
    const cleanUser = header.github.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/').pop() || header.github;
    const hrefUrl = header.github.startsWith('http') ? header.github : `https://${header.github.includes('github.com') ? header.github : `github.com/${header.github}`}`;
    contactEntries.push(`\\mbox{\\hrefWithoutArrow{${hrefUrl}}{\\color{black}{\\footnotesize\\faGithub}\\hspace*{0.13cm}${escapeLatex(cleanUser)}}}%`);
  }

  if (contactEntries.length > 0) {
    latex += '        ' + contactEntries.join('\n        \\kern 0.25 cm%\n        \\AND%\n        \\kern 0.25 cm%\n        ') + '\n';
  }

  latex += `    \\end{header}

    \\vspace{0.3 cm - 0.3 cm}
`;

  // 1. Professional Summary (using \begin{onecolentry})
  if (summary) {
    latex += `
    \\section{Professional Summary}

        \\begin{onecolentry}
            ${escapeLatex(summary)}
        \\end{onecolentry}
`;
  }

  // 2. Education Section (matching template.tex Education format)
  if (education && education.length > 0) {
    latex += `
    \\section{Education}
`;
    education.forEach((edu, idx) => {
      if (idx > 0) latex += `\n        \\vspace{0.2 cm}\n`;

      const inst = escapeLatex(edu.institution || '');
      const degreeStr = escapeLatex([edu.degree, edu.field].filter(Boolean).join(' in '));
      const yearStr = escapeLatex(edu.year || '');

      latex += `        \\begin{twocolentry}{
            
            
        \\textit{${yearStr}}}
            \\textbf{${inst}}

            \\textit{${degreeStr}}
        \\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
`;
      if (edu.gpa) {
        latex += `                \\item GPA: ${escapeLatex(edu.gpa)}\n`;
      }
      if (edu.coursework && edu.coursework.length > 0) {
        latex += `                \\item \\textbf{Coursework:} ${escapeLatex(edu.coursework.join(', '))}\n`;
      }
      latex += `            \\end{highlights}
        \\end{onecolentry}
`;
    });
  }

  // 3. Experience Section (matching template.tex Experience format)
  if (experience && experience.length > 0) {
    latex += `
    \\section{Experience}
`;
    experience.forEach((exp, idx) => {
      if (idx > 0) latex += `\n        \\vspace{0.2 cm}\n`;

      const titleStr = escapeLatex(exp.title || '');
      const companyStr = escapeLatex(exp.company || '');
      const locStr = escapeLatex(exp.location || '');
      const dateStr = escapeLatex([exp.startDate, exp.endDate].filter(Boolean).join(' – '));

      latex += `        \\begin{twocolentry}{
        ${locStr ? `\\textit{${locStr}}` : ''}    
            
        ${dateStr ? `\\textit{${dateStr}}` : ''}}
            \\textbf{${titleStr}}
            
            ${companyStr ? `\\textit{${companyStr}}` : ''}
        \\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
`;
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.filter(Boolean).forEach(bullet => {
          latex += `                \\item ${escapeLatex(bullet)}\n`;
        });
      }
      latex += `            \\end{highlights}
        \\end{onecolentry}
`;
    });
  }

  // 4. Projects Section (matching template.tex Projects format)
  if (projects && projects.length > 0) {
    latex += `
    \\section{Projects}
`;
    projects.forEach((proj, idx) => {
      if (idx > 0) latex += `\n        \\vspace{0.2 cm}\n`;

      const projName = escapeLatex(proj.name || '');
      const fullUrl = proj.link ? (proj.link.startsWith('http') ? proj.link : `https://${proj.link}`) : '';
      const cleanLink = proj.link ? proj.link.replace(/\/$/, '') : '';
      const linkDisplay = cleanLink ? (cleanLink.split('/').pop() || cleanLink) : '';
      const escapedLinkDisplay = escapeLatex(linkDisplay);

      latex += `        \\begin{twocolentry}{
            
            
        ${fullUrl ? `\\textit{\\href{${fullUrl}}{${escapedLinkDisplay}}}` : ''}}
            \\textbf{${projName}}
        \\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}
`;
      if (proj.description) {
        latex += `                \\item ${escapeLatex(proj.description)}\n`;
      }
      if (proj.highlights) {
        proj.highlights.filter(Boolean).forEach(h => {
          latex += `                \\item ${escapeLatex(h)}\n`;
        });
      }
      if (proj.technologies && proj.technologies.length > 0) {
        latex += `                \\item Tools Used: ${escapeLatex(proj.technologies.join(', '))}\n`;
      }
      latex += `            \\end{highlights}
        \\end{onecolentry}
`;
    });
  }

  // 5. Skills Section (matching Example.tex categorized format)
  const categorized = resume.categorizedSkills || [];
  if (categorized.length > 0) {
    latex += `
    \\section{Skills}
`;
    categorized.forEach((cat, idx) => {
      if (idx > 0) latex += `\n        \\vspace{0.2 cm}\n`;
      const catName = escapeLatex(cat.category || 'Technical Skills');
      const catSkills = (cat.skills || []).map(s => escapeLatex(s)).join(', ');
      latex += `        \\begin{onecolentry}
            \\textbf{${catName}:} ${catSkills}
        \\end{onecolentry}
`;
    });
  } else if (skills && skills.length > 0) {
    latex += `
    \\section{Skills}

        \\begin{onecolentry}
            \\textbf{Skills:} ${skills.map(s => escapeLatex(s)).join(', ')}
        \\end{onecolentry}
`;
  }

  // 6. Certifications & Achievements Section (matching Example.tex twocolentry + samepage format)
  if (certifications && certifications.length > 0) {
    latex += `
    \\section{Certifications \\& Achievements}

        \\begin{samepage}
`;
    certifications.forEach(cert => {
      const cName = typeof cert === 'string' ? cert : cert.name;
      const cIssuer = typeof cert === 'object' ? (cert.issuer || cert.date || '') : '';
      const cUrl = typeof cert === 'object' ? (cert.url || cert.link || '') : '';
      const fullUrl = cUrl ? (cUrl.startsWith('http') ? cUrl : `https://${cUrl}`) : '';

      latex += `            \\begin{twocolentry}{
                ${fullUrl ? `\\textit{\\href{${fullUrl}}{${escapeLatex(cIssuer || 'Link')}}}` : (cIssuer ? `\\textit{${escapeLatex(cIssuer)}}` : '')}}
                \\textbf{${escapeLatex(cName)}}
            \\end{twocolentry}

`;
    });
    latex += `        \\end{samepage}
`;
  }

  latex += `\n\\end{document}\n`;

  return latex;
}

export function downloadLatexFile(resume, filename = 'Resume') {
  const latexContent = generateLatexResume(resume);
  const blob = new Blob([latexContent], { type: 'text/x-tex;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9\-_]/g, '_')}.tex`;
  a.click();
  URL.revokeObjectURL(url);
}
