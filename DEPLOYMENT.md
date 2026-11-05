# 🚀 Step-by-Step Deployment Guide: GitHub, Vercel & Render

This guide provides exact, copy-pasteable instructions for deploying **Green Shield Vizag**.

You have three deployment choices:
1. **Option A (Recommended & Fastest)**: **100% Vercel** (Frontend + Serverless Gemini API all on Vercel — free, zero maintenance).
2. **Option B (Full-Stack Unified)**: **100% Render** (Single Node.js/Express web service that serves both Vite frontend and backend).
3. **Option C (Split Architecture)**: **Vercel for Frontend + Render for Backend** (Frontend on Vercel edge, Express API on Render).

---

## 📌 Step 1: Push Code to GitHub

First, upload your codebase to a new GitHub repository.

### 1.1 Create a New Repository on GitHub
1. Log in to [GitHub](https://github.com/).
2. In the top right corner, click **+** and select **New repository**.
3. Name your repository (e.g., `green-shield-vizag`).
4. Set visibility to **Public** or **Private**.
5. **Do NOT** check "Add a README file" or ".gitignore" (these already exist in your project).
6. Click **Create repository**.

### 1.2 Initialize Git & Push from Your Terminal
Run the following commands in your project's root folder:

```bash
# Initialize git
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Green Shield Vizag platform"

# Rename branch to main
git branch -M main

# Link to your new GitHub repository (replace with your repository URL)
git remote add origin https://github.com/<YOUR-USERNAME>/green-shield-vizag.git

# Push to GitHub
git push -u origin main
```

*(If prompted, log in with your GitHub Personal Access Token or SSH key).*

---

## ⚡ Option A: Deploy Entirely on Vercel (Recommended)

Thanks to the preconfigured `vercel.json` and `/api/audit-sapling.ts` serverless function, Vercel hosts both the React Vite frontend and the serverless Gemini AI inspection backend together under one domain.

### Steps:
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New…** → **Project**.
3. Locate `green-shield-vizag` in the repository list and click **Import**.
4. Configure the project settings:
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
6. Click **Deploy**.
7. Vercel will build the frontend and register the `/api/audit-sapling` serverless route. Once done, you'll receive your live URL (e.g. `https://green-shield-vizag.vercel.app`)!

---

## 🚂 Option B: Deploy Entirely on Render (Full-Stack)

Render runs the Node.js / Express server (`server.ts`) which serves the compiled static files from `dist/` and handles `/api/audit-sapling`.

### Steps:
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `green-shield-vizag` repo.
4. Fill in the service configuration:
   - **Name**: `green-shield-vizag`
   - **Region**: Choose the closest region (e.g. `Singapore` or `Frankfurt`)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
5. Add **Environment Variables**:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(paste your Gemini API key)*
   - `NODE_VERSION`: `22` (Render will use Node 22)
6. Click **Deploy Web Service**.
7. Render will install dependencies, build the Vite app to `dist/`, and boot up the Express server on Render's dynamic port. Your app will be live at `https://green-shield-vizag.onrender.com`.

---

## 🔀 Option C: Split Deployment (Vercel Frontend + Render Backend)

If you prefer having the static frontend served via Vercel's global CDN and a dedicated Express server on Render:

### Part 1: Deploy Backend to Render
1. In Render, create a **New +** → **Web Service** connected to your repository.
2. Configuration:
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start`
   - Environment Variables:
     - `NODE_ENV` = `production`
     - `GEMINI_API_KEY` = `your_gemini_api_key`
     - `NODE_VERSION` = `22`
3. Click **Deploy Web Service**.
4. Copy your backend URL once live: e.g. `https://green-shield-vizag-backend.onrender.com`.

### Part 2: Deploy Frontend to Vercel
1. In Vercel, import your GitHub repository.
2. Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://green-shield-vizag-backend.onrender.com` *(your Render backend URL)*
3. Click **Deploy**.
4. The client will now route all sapling inspection calls across to your Render backend with CORS automatically handled!

---

## 🔐 Environment Variables Summary

| Variable Name | Required Where | Description |
|---|---|---|
| `GEMINI_API_KEY` | Vercel (Option A) or Render (Option B & C) | Google Gemini API Key for tree inspection vision reasoning |
| `VITE_API_URL` | Vercel (Only for Option C) | URL of your external backend if frontend & backend are separated |
| `NODE_ENV` | Render (`production`) | Tells Express to serve compiled static files from `dist/` |
| `NODE_VERSION` | Render (`22`) | Ensures Render runs Node.js 22 LTS |

---

## 🛠️ Verification & Troubleshooting Checklist

1. **Leaflet Map Not Rendering Properly**:
   - Leaflet CSS is loaded from the CDN in `index.html`. Ensure there are no Content Security Policy (CSP) headers blocking `unpkg.com`.
2. **Gemini Inspection Fails / Times Out**:
   - Verify `GEMINI_API_KEY` is spelled correctly in your host's Environment Variables panel.
   - If the key is not set, the app automatically uses realistic urban forestry fallback diagnoses so user testing never breaks.
3. **Render Free Tier Spin-down**:
   - Render's free tier sleeps after 15 minutes of inactivity. The first request after sleep may take ~30–45 seconds. Vercel (Option A) does not suffer from cold-start sleep delays.
4. **CORS Errors**:
   - If using Option C, `server.ts` already has permissive CORS headers enabled (`Access-Control-Allow-Origin: *`).
