import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function test() {
  try {
    console.log("Testing Gemini with key starting with:", process.env.GEMINI_API_KEY?.substring(0, 10));
    const result = await model.generateContent("Hello, world!");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (err: any) {
    console.error("Error:", err.message, err.status, err);
  }
}

test();
