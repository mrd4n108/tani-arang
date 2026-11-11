---
name: gemini-vision-guard
description: Enforces structured JSON output and strict error handling for Gemini Vision API calls.
---

# Guidelines for AI Vision Integration
1. Always require Gemini Vision to return valid Structured JSON (`responseMimeType: "application/json"`).
2. Ensure the JSON schema strictly matches these keys:
   - is_valid_waste (boolean)
   - detected_waste_type (string)
   - moisture_condition (string)
   - ai_confidence (integer 0-100)
   - ai_summary_recommendation (string)
   - ai_Next_steps (array of 3 strings)
3. Never expose GEMINI_API_KEY in frontend code; route all requests through Laravel Service (`App\Services\WasteVisionService`).
4. Wrap all external API requests in try-catch blocks with graceful fallbacks.