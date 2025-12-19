// Gemini AI Integration
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

function getAIInstance() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("your_actual_key")) {
    console.error("CRITICAL: GEMINI_API_KEY is not set or invalid");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

export function isAIAvailable(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!apiKey && !apiKey.includes("your_actual_key");
}

export async function optimizeAchievement(
  text: string,
  type: string = "summary"
): Promise<string> {
  const genAI = getAIInstance();
  if (!genAI) {
    if (text.includes("JSON") || text.includes("array")) return "[]";
    return enhanceTextFallback(text, type);
  }

  // FIXED: Changed from 1.5-flash to gemini-pro
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompts: Record<string, string> = {
    summary: `Act as a career coach. Rewrite this summary: "${text}". Return only the summary.`,
    achievement: `Act as a career coach. Transform this duty into an achievement: "${text}". Return only the achievement.`,
    experience: `Rewrite this work experience: "${text}". Return only the description.`,
  };

  const finalPrompt = text.includes("JSON")
    ? text
    : prompts[type] || prompts.achievement;

  try {
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return response
      .text()
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (error) {
    console.error("Gemini optimization error:", error);
    return text.includes("JSON") ? "[]" : enhanceTextFallback(text, type);
  }
}

export async function generateCoverLetter(
  jobTitle: string,
  company: string,
  jobDescription: string,
  candidateName: string,
  candidateSummary: string,
  skills: string[]
): Promise<string> {
  const genAI = getAIInstance();
  if (!genAI)
    return generateCoverLetterFallback(
      jobTitle,
      company,
      candidateName,
      skills
    );

  // FIXED: Changed from 1.5-flash to gemini-pro
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Write a cover letter for ${candidateName} applying for ${jobTitle} at ${company}. Desc: ${jobDescription}. Summary: ${candidateSummary}. Skills: ${skills.join(
    ", "
  )}.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return (
      response.text().trim() ||
      generateCoverLetterFallback(jobTitle, company, candidateName, skills)
    );
  } catch (error) {
    return generateCoverLetterFallback(
      jobTitle,
      company,
      candidateName,
      skills
    );
  }
}

export async function analyzeJobMatch(
  userSkills: string[],
  jobRequirements: string[],
  jobDescription: string
): Promise<{
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
}> {
  const basicMatch = calculateBasicMatch(userSkills, jobRequirements);
  const genAI = getAIInstance();
  if (!genAI) return basicMatch;

  // STABLE VERSION: Uses gemini-pro
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `Analyze compatibility. Candidate: ${userSkills.join(
    ", "
  )}. Requirements: ${jobRequirements.join(
    ", "
  )}. Job Desc: ${jobDescription}. Respond ONLY with JSON: {"matchPercentage": number, "matchedSkills": [], "missingSkills": []}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response
      .text()
      .trim()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(text);
    return {
      matchPercentage: parsed.matchPercentage || basicMatch.matchPercentage,
      matchedSkills: parsed.matchedSkills || basicMatch.matchedSkills,
      missingSkills: parsed.missingSkills || basicMatch.missingSkills,
    };
  } catch (error) {
    return basicMatch;
  }
}

// --- Fallbacks remain the same ---
function enhanceTextFallback(text: string, type: string): string {
  const actionVerbs = ["Developed", "Implemented", "Managed", "Optimized"];
  if (type === "summary") return text.trim();
  return `${
    actionVerbs[Math.floor(Math.random() * actionVerbs.length)]
  } ${text.toLowerCase()}`;
}

function generateCoverLetterFallback(
  jobTitle: string,
  company: string,
  candidateName: string,
  skills: string[]
): string {
  return `Dear Hiring Manager,\n\nI am interested in the ${jobTitle} role at ${company}. My skills in ${skills
    .slice(0, 3)
    .join(", ")} make me a great fit.\n\nBest,\n${candidateName}`;
}

function calculateBasicMatch(userSkills: string[], jobRequirements: string[]) {
  const matchedSkills = userSkills.filter((s) => jobRequirements.includes(s));
  const missingSkills = jobRequirements.filter((r) => !userSkills.includes(r));
  const matchPercentage =
    jobRequirements.length > 0
      ? Math.round((matchedSkills.length / jobRequirements.length) * 100)
      : 0;
  return { matchPercentage, matchedSkills, missingSkills };
}
