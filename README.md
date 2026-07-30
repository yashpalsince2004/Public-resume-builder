# 🚀 AI-Powered ATS Resume Builder

An intelligent, full-stack ATS Resume Optimization & Tailoring Application powered by **Astro**, **React**, and **Google Gemini 3.6 Flash AI**. 

Transform job descriptions into ATS-optimized, high-scoring resumes with live A4 previews, harsh recruiter ATS scoring, 100% native vector PDF exports, Word (`.docx`) exports, and authentic RenderCV-compliant LaTeX (`.tex`) code generation.

---

## ✨ Features

- 🧠 **AI Job Description Tailoring**: Analyzes target JDs and candidate profiles using Gemini 3.6 Flash to rephrase summary, experience bullets, project achievements, and skill categories for maximum ATS keyword density.
- 📊 **Harsh ATS Scoring & Critique Engine**: Evaluates overall ATS score (0–100), provides category breakdowns (Keyword Match, Impact Metrics, Formatting), identifies missing keywords, and offers a **1-Click Auto-Fix** button to fix feedback points dynamically.
- 📄 **100% Native Vector PDF Export**: Uses Chromium's native print engine (`window.print()` + `@media print`) to generate crisp, infinitely sharp vector PDFs with tiny file sizes (~40 KB), selectable text, and zero image/raster pixelation.
- 📜 **RenderCV-Compliant LaTeX Generator**: Exports production-grade `.tex` files adhering 1:1 to RenderCV and LaTeX standard specifications (`Example.tex` architecture).
- 📝 **Multi-Format Downloads**: Download your resume in **PDF**, **Word (`.docx`)**, **LaTeX (`.tex`)**, or copy raw plain text directly to your clipboard.
- 🎨 **Apple-Inspired Glassmorphism Design**: Sleek dark-mode interface with smooth transitions, interactive A4 sheet preview, page pagination controls, and responsive UI components.

---

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/) (Static Site Generation / Server Support)
- **UI Components**: [React 19](https://react.dev/)
- **AI Engine**: [Google Gemini 3.6 Flash API](https://ai.google.dev/) (`@google/genai`)
- **Document Generation**: `docx` (Word), Native `@media print` CSS engine
- **Styling**: Modern Vanilla CSS with CSS custom properties, HSL color tokens, and Apple Human Interface guidelines

---

## 📁 Project Structure

```text
Resume_builder/
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Default profile JSON data & templates
│   ├── components/         # React UI Components
│   │   ├── BuilderApp.jsx           # Main state controller & flow orchestrator
│   │   ├── ResumeBuilderScreen1.jsx # Screen 1: Job Description input & candidate edit
│   │   ├── ResumeBuilderScreen2.jsx # Screen 2: A4 Live Preview, ATS Score & controls
│   │   ├── ResumePreview.jsx        # Fallback preview wrapper
│   │   └── RateLimitModal.jsx       # API key & quota notification modal
│   ├── engine/             # Core AI & Scoring Engines
│   │   ├── atsScorer.js             # Factual ATS scoring algorithm
│   │   ├── geminiKeywordExtractor.js# Gemini API tailoring & critique prompt engine
│   │   ├── keywordExtractor.js      # Keyword extraction utilities
│   │   ├── resumeGenerator.js      # Resume data model orchestrator
│   │   └── resumeMatcher.js        # Matching algorithms
│   ├── pages/              # Astro pages / routes
│   │   ├── index.astro              # Landing page
│   │   └── builder.astro            # Application builder route
│   ├── styles/             # Global CSS styles & design tokens
│   │   └── global.css
│   └── utils/              # Export & Document Helpers
│       ├── docxExport.js            # Word document generator (.docx)
│       ├── latexGenerator.js        # RenderCV LaTeX code generator (.tex)
│       ├── pdfExport.js             # PDF export wrapper
│       └── printExport.js           # Native vector print engine helper
├── Example.tex             # Target RenderCV LaTeX template reference
├── template.tex            # Base TeX template
├── astro.config.mjs        # Astro configuration
└── package.json            # Project dependencies & scripts
```

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: `>= 22.12.0`
- **npm**: `>= 10.0.0`
- **Gemini API Key**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yashpalsince2004/resume_builder.git
   cd resume_builder
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:4321`.

---

## 🧞 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local development server at `http://localhost:4321` |
| `npm run build` | Compiles static production build to `./dist/` |
| `npm run preview` | Previews production build locally |
| `npm run astro ...` | Runs Astro CLI commands |

---

## 📄 Export Options

### 1. Vector PDF (`window.print()`)
Click **Download PDF** or press `Cmd+P` / `Ctrl+P`:
- Produces a **100% Native Vector PDF** (~40 KB file size).
- Crisp text edges at any zoom level (2000%+).
- Real, selectable, and ATS-parseable vector fonts.

### 2. Word Document (`.docx`)
Click **Download Word**:
- Generates an editable `.docx` file using the `docx` library with proper heading styles, margins, and bullet structures.

### 3. RenderCV LaTeX (`.tex`)
Click **`{ } View LaTeX Code`** or **Download LaTeX**:
- Exports clean, compilable LaTeX code matching professional RenderCV templates (`Example.tex`), ready for Overleaf or local TeX compilation.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yashpalsince2004/resume_builder/issues).

---

## 📜 License

This project is licensed under the MIT License.
