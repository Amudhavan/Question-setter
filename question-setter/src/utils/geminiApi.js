import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key should be injected via environment variables to prevent leaking
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Missing VITE_GEMINI_API_KEY environment variable. Please add it to your .env file or Vercel dashboard.");
}

const genAI = new GoogleGenerativeAI(API_KEY || 'MISSING_KEY');

export async function generateMCQTest(prompt, numQuestions = 25) {
  try {
    // For structured output, we use gemini-2.5-flash
    // Flash is usually faster for this kind of generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `
      You are an expert educational content creator. The user will provide a prompt or topic.
      Your task is to generate EXACTLY ${numQuestions} multiple-choice questions based on that prompt.
      You MUST respond with ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
      
      The JSON object must follow this strict schema:
      {
        "topic": "Main overall topic of the test",
        "questions": [
          {
            "question": "The question text",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctOptionIndex": 0, // Integer 0-3 representing the correct option
            "explanation": "Detailed explanation of why this option is correct and others are wrong.",
            "subTopic": "A specific sub-topic this question tests (e.g., 'Syntax', 'History', 'Logic')"
          }
        ]
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\nUser Prompt: " + prompt }] }],
      generationConfig: {
        temperature: 0.7,
      }
    });

    const responseText = result.response.text();
    
    // Clean up potential markdown blocks if the model ignores the instruction
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating test from Gemini:", error);
    throw new Error("Failed to generate test. Please try again or refine your prompt.");
  }
}
