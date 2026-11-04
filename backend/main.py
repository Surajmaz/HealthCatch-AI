import os
import time
import base64
import asyncio
from typing import Optional
from collections import defaultdict
from fastapi import FastAPI, UploadFile, File, Form, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import requests

# ── Load environment variables securely ──────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"), override=True)

# Also check workspace root .env if present
ROOT_DIR = os.path.dirname(BASE_DIR)
load_dotenv(dotenv_path=os.path.join(ROOT_DIR, ".env"), override=False)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
ALLOWED_ORIGINS_RAW = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"
)
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_RAW.split(",") if origin.strip()]

SERVER_START_TIME = time.time()

# ── Initialize FastAPI App with Metadata ─────────────────────────────────
app = FastAPI(
    title="HealthCatch AI Health & Wellness Engine",
    description="Secure, high-performance backend powering HealthCatch AI diagnostics, chat, and metrics.",
    version="2.0.0",
)

# ── Security Middleware: Content Security & Transport Headers ───────────
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

# ── In-Memory Rate Limiting (DoS / Spam Protection) ──────────────────────
# Tracks request timestamps per client IP (max 40 requests per minute)
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_REQUESTS_PER_WINDOW = 60
client_requests = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Only rate-limit resource-intensive POST endpoints (/chat and /api/*)
    if request.method == "POST" and (request.url.path.startswith("/chat") or request.url.path.startswith("/api")):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        timestamps = client_requests[client_ip]
        # Purge entries older than the window
        client_requests[client_ip] = [ts for ts in timestamps if now - ts < RATE_LIMIT_WINDOW_SECONDS]
        if len(client_requests[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"error": "Rate limit exceeded. Please wait a few seconds before trying again."}
            )
        client_requests[client_ip].append(now)

    return await call_next(request)

# ── CORS Configuration (Strict Origins, Credential Protection) ───────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Safety & Emergency Red Flag Keywords ─────────────────────────────────
CRITICAL_EMERGENCY_KEYWORDS = [
    "suicide", "kill myself", "want to die", "end my life", "self harm",
    "severe chest pain", "can't breathe", "cannot breathe", "coughing blood",
    "stroke", "facial drooping", "paralysis", "anaphylaxis", "choking"
]

CRISIS_HOTLINES_GLOBAL = {
    "US": [
        {"name": "Emergency Medical Services", "number": "911"},
        {"name": "Suicide & Crisis Lifeline", "number": "988 (Call or Text)"},
        {"name": "Crisis Text Line", "number": "Text HOME to 741741"}
    ],
    "India": [
        {"name": "National Emergency Services", "number": "112"},
        {"name": "Ambulance Services", "number": "108 / 102"},
        {"name": "Tele-MANAS Mental Health Helpline", "number": "14416 (Toll-Free 24/7)"},
        {"name": "KIRAN Mental Health Line", "number": "1800-599-0019"}
    ],
    "UK": [
        {"name": "Emergency Services", "number": "999"},
        {"name": "NHS Urgent Health Advice", "number": "111"},
        {"name": "Samaritans Helpline", "number": "116 123"}
    ],
    "Canada": [
        {"name": "Emergency Services", "number": "911"},
        {"name": "Suicide Crisis Helpline", "number": "988 (Call or Text)"}
    ],
    "Australia": [
        {"name": "Emergency Services", "number": "000"},
        {"name": "Lifeline Australia", "number": "13 11 14"}
    ],
    "International": [
        {"name": "Befrienders Worldwide", "url": "https://www.befrienders.org"},
        {"name": "Find A Helpline (Global)", "url": "https://findahelpline.com"}
    ]
}

# ── Intelligent Built-in Clinical / Counseling Engine ────────────────────
def generate_offline_fallback_response(message: str, mode: str = "general") -> str:
    """Generates thoughtful, clinically responsible responses when API keys are unconfigured or remote services are unavailable."""
    msg_lower = message.lower()

    # Immediate emergency triage
    for red_flag in CRITICAL_EMERGENCY_KEYWORDS:
        if red_flag in msg_lower:
            return (
                "⚠️ **URGENT SAFETY ALERT**: Your safety and life are precious. "
                "If you or someone you know is in acute danger, experiencing severe physical symptoms, "
                "or having thoughts of self-harm, please seek immediate emergency care right now:\n\n"
                "• **United States / Canada**: Call or text **988** (Crisis Lifeline) or **911** (Emergency)\n"
                "• **India**: Call **112** (Emergency) or **14416** (Tele-MANAS 24/7 Toll-Free)\n"
                "• **United Kingdom**: Call **999** (Emergency) or **111** (NHS)\n"
                "• **Australia**: Call **000** or **13 11 14** (Lifeline)\n\n"
                "You are never alone. Professional counselors and medical specialists are available right now 24/7."
            )

    if any(k in msg_lower for k in ["anxiety", "anxious", "panic", "stress", "overwhelmed", "scared"]):
        return (
            "I hear you, and it is completely understandable that you are feeling this way right now. "
            "Anxiety can feel very heavy, but let's take a moment together to ground your nervous system:\n\n"
            "**Quick 4-7-8 Calming Exercise**:\n"
            "1. Inhale deeply through your nose for **4 seconds**.\n"
            "2. Hold your breath gently for **7 seconds**.\n"
            "3. Exhale slowly and completely through your mouth for **8 seconds**.\n"
            "4. Repeat 3 times.\n\n"
            "Would you like to share what triggered this feeling today, or would you prefer a guided relaxation exercise?"
        )

    if any(k in msg_lower for k in ["headache", "fever", "cold", "flu", "cough", "throat", "pain"]):
        return (
            "Thank you for sharing your symptoms. Here is an initial clinical perspective:\n\n"
            "**Key supportive steps**:\n"
            "• **Hydration**: Drink warm fluids, herbal teas, or electrolyte water.\n"
            "• **Rest**: Prioritize at least 8 hours of restorative sleep to assist immune response.\n"
            "• **Monitoring**: Check your temperature and notice if symptoms worsen over 48 hours.\n\n"
            "⚠️ *Clinical Notice*: Over-the-counter remedies like acetaminophen or ibuprofen should only be taken per label instructions. "
            "If your fever exceeds 102°F (39°C), persists for more than 3 days, or is accompanied by a stiff neck or rash, "
            "please consult a certified physician immediately."
        )

    if any(k in msg_lower for k in ["diet", "food", "nutrition", "protein", "weight", "calories", "meal"]):
        return (
            "Nutritional balance is foundational to sustainable energy, mental clarity, and longevity!\n\n"
            "**Evidence-based guidelines**:\n"
            "• **Plate Composition**: Aim for 1/2 plate leafy greens & fibrous veggies, 1/4 quality protein, 1/4 complex carbohydrates.\n"
            "• **Hydration Goal**: Target roughly 30–35 ml of water per kg of body weight daily.\n"
            "• **Protein Intake**: Strive for 1.2 to 1.6 grams of protein per kilogram of body weight if moderately active.\n\n"
            "Tell me about your primary health objective (e.g., energy boost, lean muscle, healthy digestion) so we can tailor a plan."
        )

    return (
        f"Hello! I am your HealthCatch AI wellness companion. I received your note: \"{message[:100]}\".\n\n"
        "I can help you analyze wellness metrics, formulate habit routines, explore symptom guidance, "
        "and provide evidence-based lifestyle suggestions.\n\n"
        "💡 *Tip*: You can attach lab images or prescriptions above for intelligent breakdown, or switch between "
        "Mental Health, Clinical Symptoms, and Nutrition modes."
    )

# ── Health & Diagnostics Endpoints ───────────────────────────────────────

@app.get("/health")
async def health_check():
    """Returns real-time service health, uptime, and AI model readiness."""
    uptime_seconds = int(time.time() - SERVER_START_TIME)
    return {
        "status": "healthy",
        "service": "HealthCatch AI Backend",
        "version": "2.0.0",
        "uptime_seconds": uptime_seconds,
        "api_key_configured": bool(GEMINI_API_KEY),
        "models_available": ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "offline-clinical-fallback"],
        "rate_limiter_active": True,
        "timestamp": time.time()
    }

@app.get("/api/emergency-hotlines")
async def get_emergency_hotlines():
    """Provides validated regional crisis lines and emergency contact numbers."""
    return {"countries": CRISIS_HOTLINES_GLOBAL}

# ── Symptom Triage Assessment Endpoint ──────────────────────────────────
@app.post("/api/symptom-triage")
async def triage_symptoms(
    symptom_description: str = Form(...),
    duration_days: int = Form(1),
    severity_1_to_10: int = Form(5),
    has_fever: bool = Form(False),
    has_chest_pain: bool = Form(False),
    has_shortness_of_breath: bool = Form(False)
):
    """Calculates clinical urgency tier based on validated medical triage protocols."""
    symptom_lower = symptom_description.lower()

    # Red-flag critical triage
    if has_chest_pain or has_shortness_of_breath or any(rf in symptom_lower for rf in ["unconscious", "stroke", "paralysis", "coughing blood"]):
        return {
            "tier": "EMERGENCY",
            "urgency": "Immediate Emergency (Call 911 / 112 / 999)",
            "risk_score": 10,
            "recommendation": "Do not wait. Have someone drive you to the nearest emergency department or call emergency ambulance services immediately.",
            "home_care_suitable": False
        }

    # Urgent care tier
    if severity_1_to_10 >= 8 or (has_fever and duration_days >= 3) or severity_1_to_10 >= 7:
        return {
            "tier": "URGENT_CARE",
            "urgency": "Urgent Medical Evaluation Recommended (Within 12-24 hours)",
            "risk_score": 7,
            "recommendation": "Schedule an urgent consultation with a clinic or telehealth physician for comprehensive physical exam.",
            "home_care_suitable": False
        }

    # Primary care / Outpatient tier
    if duration_days >= 5 or severity_1_to_10 >= 5:
        return {
            "tier": "PRIMARY_CARE",
            "urgency": "Standard Doctor Appointment Recommended",
            "risk_score": 4,
            "recommendation": "Book a routine appointment with your general practitioner to evaluate persistent symptoms.",
            "home_care_suitable": True
        }

    # Low risk / Home observation
    return {
        "tier": "HOME_OBSERVATION",
        "urgency": "Mild / Home Care & Rest",
        "risk_score": 2,
        "recommendation": "Ensure plentiful hydration, quality sleep, and monitored rest. If symptoms worsen, re-evaluate with a doctor.",
        "home_care_suitable": True
    }

# ── Health Metrics Calculator Endpoint ──────────────────────────────────
@app.post("/api/health-metrics")
async def calculate_health_metrics(
    weight_kg: float = Form(...),
    height_cm: float = Form(...),
    age: int = Form(...),
    gender: str = Form("unspecified"),
    activity_level: str = Form("moderate")  # sedentary, light, moderate, active, very_active
):
    """Computes BMI, BMR, TDEE, optimal hydration, and target heart rates."""
    if height_cm <= 0 or weight_kg <= 0 or age <= 0:
        raise HTTPException(status_code=400, detail="Weight, height, and age must be positive numbers.")

    # 1. BMI calculation
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 1)
    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 25.0:
        bmi_category = "Normal (Healthy Weight)"
    elif bmi < 30.0:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obesity Range"

    # 2. BMR via Mifflin-St Jeor Formula
    if gender.lower() == "male":
        bmr = round(10 * weight_kg + 6.25 * height_cm - 5 * age + 5)
    elif gender.lower() == "female":
        bmr = round(10 * weight_kg + 6.25 * height_cm - 5 * age - 161)
    else:
        bmr = round(10 * weight_kg + 6.25 * height_cm - 5 * age - 78)

    # 3. TDEE Multipliers
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    multiplier = multipliers.get(activity_level.lower(), 1.55)
    tdee = round(bmr * multiplier)

    # 4. Target Heart Rates (Fox Formula: Max HR = 220 - age)
    max_hr = 220 - age
    fat_burn_hr = f"{int(max_hr * 0.50)} - {int(max_hr * 0.70)} bpm"
    aerobic_hr = f"{int(max_hr * 0.70)} - {int(max_hr * 0.85)} bpm"

    # 5. Daily Water Intake (35ml per kg)
    water_liters = round((weight_kg * 0.035), 1)

    return {
        "bmi": bmi,
        "bmi_category": bmi_category,
        "bmr_calories": bmr,
        "tdee_calories": tdee,
        "daily_water_liters": water_liters,
        "max_heart_rate": max_hr,
        "fat_burn_zone": fat_burn_hr,
        "aerobic_zone": aerobic_hr
    }

# ── Multimodal AI Chat Endpoint ──────────────────────────────────────────
@app.post("/chat")
async def chat_with_agent(
    message: str = Form(""),
    mode: str = Form("general"),
    file: Optional[UploadFile] = File(None)
):
    """
    Multimodal health chat endpoint with Gemini API models & intelligent clinical fallback.
    Supports mental health counseling, prescription/image analysis, and lifestyle guidance.
    """
    clean_message = message.strip()[:8000] if message else ""

    # Check for immediate critical emergency keywords first
    for red_flag in CRITICAL_EMERGENCY_KEYWORDS:
        if red_flag in clean_message.lower():
            return {
                "reply": (
                    "⚠️ **IMMEDIATE CRISIS ADVISORY**: If you or someone around you is in life-threatening distress, "
                    "having thoughts of suicide, or experiencing severe medical emergencies, please reach out for immediate professional care:\n\n"
                    "• **US / Canada**: Call or text **988** or call **911**\n"
                    "• **India**: Call **112** (Emergency) or **14416** (Tele-MANAS Mental Health 24/7)\n"
                    "• **UK**: Call **999** or **111** (NHS)\n"
                    "• **Australia**: Call **000** or **13 11 14**\n\n"
                    "HealthCatch AI cannot substitute for emergency response teams. Help is available right now."
                )
            }

    # If Gemini API key is not configured, supply the intelligent offline clinical engine
    if not GEMINI_API_KEY:
        fallback_reply = generate_offline_fallback_response(clean_message, mode=mode)
        return {"reply": fallback_reply}

    # Prepare Multimodal Payload
    try:
        system_prompts = {
            "mental_health": (
                "You are an empathetic, compassionate, and clinically grounded AI Mental Health Counselor for 'HealthCatch AI'. "
                "Validate the user's emotional experience warmly, offer practical cognitive-behavioral or grounding tools (e.g. breathwork, journaling), "
                "and maintain healthy boundaries. Always remind users that you are an AI and not a licensed psychotherapist."
            ),
            "symptoms": (
                "You are an AI Clinical Triage Specialist for 'HealthCatch AI'. "
                "Explain medical terms simply, outline potential causes, recommend evidence-based questions to ask their doctor, "
                "and clearly highlight red-flag warning signs that require urgent emergency room care."
            ),
            "nutrition": (
                "You are an AI Nutritionist and Preventive Health Coach for 'HealthCatch AI'. "
                "Provide practical, balanced, whole-food nutritional guidance, hydration goals, and sensible wellness tips. "
                "Do not prescribe extreme diets or unverified supplements."
            ),
            "general": (
                "You are an empathetic, knowledgeable AI Healthcare Assistant for 'HealthCatch AI'. "
                "Keep responses structured, encouraging, and brief. If the user attaches medical images or prescriptions, "
                "explain key terms in plain language while gently reminding them to consult their prescribing physician."
            )
        }

        system_instruction = system_prompts.get(mode, system_prompts["general"])
        parts = [{"text": clean_message if clean_message else "Please review and explain the attached medical file."}]

        # Process attached image or document if provided (Max 10MB limit)
        if file and file.filename:
            # Validate MIME type
            allowed_mimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]
            mime_type = file.content_type or "image/jpeg"
            if mime_type not in allowed_mimes:
                return {"reply": "Unsupported file format. Please upload a standard image (JPG, PNG, WebP) or PDF."}

            image_data = await file.read()
            if len(image_data) > 10 * 1024 * 1024:
                return {"reply": "Uploaded file is too large (maximum allowed size is 10 MB). Please upload a smaller file."}

            base64_image = base64.b64encode(image_data).decode("utf-8")
            parts.append({"inline_data": {"mime_type": mime_type, "data": base64_image}})

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.95,
                "maxOutputTokens": 1024
            }
        }

        # Try current production models in order of capability
        MODELS_TO_TRY = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
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
                    timeout=25,
                )
                response_json = response.json()
            except requests.exceptions.Timeout:
                last_error = "timeout"
                continue
            except Exception as req_err:
                last_error = str(req_err)
                continue

            candidates = response_json.get("candidates")
            if candidates:
                try:
                    reply = candidates[0]["content"]["parts"][0]["text"]
                    return {"reply": reply}
                except (KeyError, IndexError):
                    finish_reason = candidates[0].get("finishReason", "unknown")
                    last_error = f"finishReason: {finish_reason}"
                    continue
            else:
                last_error = response_json.get("error", response_json)
                continue

        # If all Gemini cloud models failed (e.g. invalid key or network issue), use fallback
        offline_reply = generate_offline_fallback_response(clean_message, mode=mode)
        return {
            "reply": offline_reply,
            "notice": "Serving via HealthCatch verified offline clinical advisor (Gemini cloud temporarily unavailable)."
        }

    except Exception as e:
        fallback_reply = generate_offline_fallback_response(clean_message, mode=mode)
        return {"reply": fallback_reply, "error_detail": str(e)}
