# 🧠 HealthCatch AI — Mental Wellness Companion

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20TailwindCSS-teal)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-green)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%20API-orange)

**HealthCatch AI** is an intelligent, full-stack mental health support web application designed to offer emotional guidance and empathetic AI counseling in a safe and private digital space.

---

## ✨ Features
- **🤖 AI Counselor Agent:** Real-time conversational AI trained for compassionate emotional support.
- **🛡️ Secure Architecture:** Strict separation of environment secrets and modular FastAPI setup.
- **🎨 Modern Dark UI:** Clean, responsive, and accessible user interface built with React.

---

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** FastAPI, Python, Uvicorn
* **AI Ecosystem:** Google Gemini AI API
* **Version Control:** Git & GitHub

---

## 🚀 How to Run Locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# Create .env file and add GEMINI_API_KEY
uvicorn main:app --reload


#### Fronted Setup
cd frontend
npm install
npm run dev


Created for a better tomorrow