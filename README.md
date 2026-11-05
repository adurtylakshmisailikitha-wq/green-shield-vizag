# 🌱 Green Shield Vizag

> **Turn one-off tree plantation drives into photo-verified sapling survival logs across Visakhapatnam.**

Green Shield Vizag is a civic-tech urban arboriculture platform built for Visakhapatnam, Andhra Pradesh. It combines GPS sapling tagging, AI-powered health diagnosis (via Google Gemini 3.8 Flash vision reasoning), automated volunteer care task dispatch, corporate CSR survival impact reporting (PDF export), and bilingual (English / Telugu) community grievance tracking.

---

## 🌟 Key Features

- **📸 AI Sapling Health Inspection**: Upload or capture field photos. Google Gemini 3.8 Flash assesses leaf turgor, soil dryness, physical guard condition, survival score (0–100%), and calculates required hydration in liters.
- **🗺️ Live Interactive Map**: Leaflet-powered dark mode map tracking sapling coordinates, status (Healthy, Needs Water, Critical Wilting, Damaged Guard), ward numbers, and historical audit timeline.
- **🛡️ Automated Task Dispatch**: Critical wilting or dry soil triggers automated care tasks assigned to university NSS wings (Andhra University, GITAM Green Club, Rotary Youth).
- **📊 CSR Impact Exporter**: Generate verifiable PDF audit reports with survival percentages, ward breakdowns, and green credits for ESG/CSR compliance.
- **🏛️ Community Grievance Tracking**: Citizen complaint portal with automated Telugu/English support and pre-filled inquiry generation.
- **🌐 Bilingual UI**: Instant toggle between English and Telugu (తెలుగు) across all views.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Leaflet, Canvas Confetti, jsPDF
- **Backend / API**: Express / Node.js 22, Google GenAI SDK (`@google/genai`)
- **AI Vision Model**: `gemini-3.8-flash`
- **Deploy Options**: Vercel (Frontend + Serverless Functions) or Render (Full-Stack Web Service)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/<your-username>/green-shield-vizag.git
cd green-shield-vizag
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Add your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment Guides

For complete, step-by-step instructions to deploy to **GitHub**, **Vercel**, and **Render**, see [DEPLOYMENT.md](./DEPLOYMENT.md).

- **Vercel (All-in-One)**: Deploy frontend + Serverless Gemini API on Vercel in 2 minutes.
- **Render (Full-Stack)**: Deploy unified Express + React server using `render.yaml`.
- **Hybrid (Vercel + Render)**: Host frontend on Vercel edge and backend on Render web service.

---

## 📜 License

Apache-2.0
