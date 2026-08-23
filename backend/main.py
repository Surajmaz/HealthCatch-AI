import os
import base64
import asyncio
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests

# load_dotenv() with no path only checks the CURRENT WORKING DIRECTORY.
# If you run `uvicorn main:app` from anywhere other than the `backend/`
# folder itself (e.g. from the project root), it silently finds nothing and
# GEMINI_API_KEY ends up empty — no crash, just an auth error from Google.
# Pointing at this file's own folder makes it work no matter where you
# launch uvicorn from.
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"), override=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("⚠️  GEMINI_API_KEY is empty — check backend/.env exists and has the key.")
    print("    Get a free key at https://aistudio.google.com/apikey")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    # Visit http://127.0.0.1:8000/health in a browser to check the backend
    # is reachable and the key loaded, separately from whether the actual
    # Gemini call works.
    return {"status": "ok", "api_key_loaded": bool(GEMINI_API_KEY)}


@app.post("/chat")
async def chat_with_agent(message: str = Form(""), file: UploadFile = File(None)):
    print("\n🔑 Processing with Gemini API...")

    if not GEMINI_API_KEY:
        return {"reply": "The server is missing its Gemini API key. Add GEMINI_API_KEY to backend/.env and restart the backend."}

    try:
        system_prompt = (
            "You are a highly empathetic AI mental health counselor for 'HealthCatch AI'. "
            "Keep answers brief and helpful. If the user uploads a prescription or medical "
            "image, gently remind them that you are an AI and they should consult a real "
            "doctor, but explain the contents in simple terms."
        )

        parts = [{"text": message if message else "Please analyze this attached file."}]

        if file and file.filename:
            image_data = await file.read()
            base64_image = base64.b64encode(image_data).decode("utf-8")
            mime_type = file.content_type or "image/jpeg"
            parts.append({"inline_data": {"mime_type": mime_type, "data": base64_image}})

        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": parts}],
        }

        # ── Model fallback list, in try-order ────────────────────────────
        # Same lesson as with the old OpenRouter integration: Google retires/
        # renames Gemini models over time (2.0 Flash was shut down June 2026,
        # 2.5 Pro is scheduled to shut down Oct 16 2026, etc). Rather than
        # hard-wiring one model name that can silently stop working, try a
        # short list in order and fall through automatically.
        MODELS_TO_TRY = [
            "gemini-3.7-flash",       # newest GA workhorse model (Aug 13, 2026), multimodal
            "gemini-3.6-flash",       # previous stable GA model, still fully supported, multimodal
            "gemini-3.5-flash-lite",  # lighter/cheaper fallback, still current, multimodal
        ]

        headers = {"Content-Type": "application/json"}
        last_error = None

        for model_id in MODELS_TO_TRY:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent"
            try:
                response = await asyncio.to_thread(
                    requests.post,
                    url,
                    headers=headers,
                    params={"key": GEMINI_API_KEY},
                    json=payload,
                    timeout=30,  # fail fast instead of hanging forever if Gemini stalls
                )
                response_json = response.json()
            except requests.exceptions.Timeout:
                print(f"❌ {model_id} timed out, trying next fallback...")
                last_error = "timeout"
                continue

            candidates = response_json.get("candidates")
            if candidates:
                try:
                    reply = candidates[0]["content"]["parts"][0]["text"]
                except (KeyError, IndexError):
                    # Model responded but with an unexpected shape (e.g. it
                    # was blocked by a safety filter with no text part).
                    finish_reason = candidates[0].get("finishReason", "unknown")
                    print(f"❌ {model_id} returned no usable text (finishReason={finish_reason})")
                    last_error = response_json
                    continue
                print(f"✅ Success with {model_id}")
                return {"reply": reply}
            else:
                print(f"❌ {model_id} error:", response_json.get("error", response_json))
                last_error = response_json
                continue  # try the next model in the list

        # Every model in the fallback list failed.
        if last_error == "timeout":
            return {"reply": "The AI is taking too long to respond right now. Please try again in a moment."}
        print("❌ All Gemini models failed. Last response:", last_error)
        return {"reply": "Sorry, the AI service is temporarily busy. Please try again."}

    except Exception as e:
        print("❌ Error:", str(e))
        return {"reply": f"Technical Issue: {str(e)}"}
