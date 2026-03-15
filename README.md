# ✨ Jewelify — AI-Powered Jewelry Design

## Overview

**Jewelify** is a full-stack MERN + Flask application that transforms hand-drawn jewelry sketches into stunning, photorealistic images using advanced deep learning. It also supports text-to-image generation and a personalized collection gallery.

---

## Features

| Feature | Description |
|--------|-------------|
| 🎨 **Sketch-to-Jewelry** | Upload a sketch → get a realistic gold/diamond/platinum jewelry image |
| 💬 **Text-to-Design** | Generate jewelry visuals from text prompts |
| 📁 **Collection Gallery** | Browse and manage all your generated designs |
| 🛠️ **Dev Mode** | Run with mock responses and structured logging — no ML models needed |
| 🔑 **Env Config** | Centralized environment variables for easier deployment |

---

## Quick Start

### Prerequisites
- **Node.js** (v18+)
- **Python 3.8+** with `pip`

---

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Set Up Python Environment

**Option A — Development mode** *(no ML models needed, fast setup)*:
```bash
./scripts/setup.sh --dev
```

**Option B — Full AI pipeline** *(requires ML models and hardware acceleration)*:
```bash
./scripts/setup.sh
```

- Download the trained `.h5` model from [this link](https://drive.google.com/file/d/1FFodj1KsoHN1KyNaPr5T_0WbR3CCn1UL/view?usp=sharing).  
- Place the downloaded file in the `api/model/` folder.  
- Ensure that the file name is **`generator.h5`**.  

### 3. Configure Environment

Jewelify uses environment variables for configuration. Copy the example files and update them with your settings.

```bash
cp api/.env.example api/.env            # Set MONGO_URI, SESSION_SECRET, etc.
cp api/model/.env.example api/model/.env # Set APP_MODE, LOG_LEVEL, etc.
cp client/.env.example client/.env     # Set REACT_APP_API_URL
```

---

## Running the Application

### 🛠️ Development Mode *(recommended for frontend development)*
No ML models required. The backend returns realistic mock responses.
```bash
npm run dev
```

### 🚀 Actual Mode *(requires ML models)*
Runs the full AI processing pipeline.
```bash
npm run actual
```

### 🌐 Web Only *(Node.js API + React, no Flask)*
```bash
npm run web
```

---

## Development Mode Explained

When started with `--mode dev`, the Flask server:

- **Does NOT load** TensorFlow, PyTorch, or any ML models
- Returns a **randomly selected placeholder jewelry image** (from `mock_images/`)
- Simulates a realistic **1–2 second inference delay**
- Returns **mock metadata** (`model_name`, `confidence`) in the same response format as actual mode
- Exposes `/api/health` → `{ "mode": "development" }` to confirm the active mode

The frontend works identically in both modes.

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check — returns current mode |
| `/api/upload` | POST | Upload sketch → get processed image |
| `/api/text-image-save` | POST | Save a text-generated image to collection |
| `/processed/<user>/<file>` | GET | Serve a processed image |

---

## Notes

- Keep `api/.env`, `api/model/.env`, and `client/.env` **out of version control** (`.gitignore` handles this)
- Only commit `.env.example` files
- The `mock_images/` folder contains safe placeholder images and **is** committed

---

🎉 *Enjoy transforming your jewelry ideas into breathtaking realities with Jewelify!* 💎✨
