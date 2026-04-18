import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeResumesBody, AnalyzeResumesResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import pdfParse from "pdf-parse";

const router = Router();

async function extractTextFromBase64Pdf(base64) {
  const buffer = Buffer.from(base64, "base64");
  const data = await pdfParse(buffer);
  return data.text;
}

router.post("/recruiter/analyze", async (req, res) => {
  const parsed = AnalyzeResumesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { jobDescriptionBase64, resumesBase64, resumeNames } = parsed.data;

  let jobDescriptionText;
  try {
    jobDescriptionText = await extractTextFromBase64Pdf(jobDescriptionBase64);
  } catch (err) {
    req.log.error({ err }, "Failed to parse job description PDF");
    res.status(400).json({ error: "Failed to parse job description PDF. Please ensure it is a valid PDF file." });
    return;
  }

  if (!jobDescriptionText.trim()) {
    res.status(400).json({ error: "Job description PDF appears to be empty or unreadable." });
    return;
  }

  const results = [];

  for (let i = 0; i < resumesBase64.length; i++) {
    const resumeBase64 = resumesBase64[i];
    const resumeName = resumeNames?.[i] ?? `Resume ${i + 1}`;

    let resumeText;
    try {
      resumeText = await extractTextFromBase64Pdf(resumeBase64);
    } catch (err) {
      req.log.warn({ err, resumeName }, "Failed to parse resume PDF");
      results.push({
        name: resumeName,
        type: "Unknown",
        email: "N/A",
        contact: "N/A",
        topThreeSkills: "N/A",
        summary: `Failed to parse PDF: ${resumeName}`,
        pros: "N/A",
        cons: "Could not read PDF",
        rating: 0,
        decision: "Rejected",
        matchScore: 0,
        matchingSkills: [],
        missingSkills: []
      });
      continue;
    }

    if (!resumeText.trim()) {
      results.push({
        name: resumeName,
        type: "Unknown",
        email: "N/A",
        contact: "N/A",
        topThreeSkills: "N/A",
        summary: `Empty or unreadable PDF: ${resumeName}`,
        pros: "N/A",
        cons: "PDF appears empty or uses unsupported encoding",
        rating: 0,
        decision: "Rejected",
        matchScore: 0,
        matchingSkills: [],
        missingSkills: []
      });
      continue;
    }

    try {
      const systemPrompt = `You are an expert AI Recruiter. Analyze the given resume against the job description and return a strict JSON object with no markdown formatting.

SCORING RULES:
- Skills match: 50% weight
- Experience relevance: 30% weight  
- Education: 20% weight
- Match score range: 0-100
- Rating range: 0-10 (rating = matchScore / 10)
- Decision logic:
  - Score > 70 → "Selected"
  - Score 40-70 → "Review"  
  - Score < 40 → "Rejected"

Be strict and realistic. Do not give inflated scores.

Return ONLY this JSON object:
{
  "name": "Full candidate name from resume",
  "type": "Job role/type the candidate fits (e.g. Software Engineer, Data Analyst)",
  "email": "Email from resume or N/A",
  "contact": "Phone number from resume or N/A",
  "topThreeSkills": "Skill1, Skill2, Skill3",
  "summary": "2-3 sentence professional summary of the candidate",
  "pros": "Key strengths relevant to the job (2-3 points)",
  "cons": "Key weaknesses or gaps (2-3 points)",
  "rating": 7.5,
  "decision": "Selected",
  "matchScore": 75,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"]
}`;

      const userPrompt = `JOB DESCRIPTION:
${jobDescriptionText}

RESUME:
${resumeText}

Analyze this resume against the job description and return the JSON assessment.`;

      const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_completion_tokens: 8192,
        messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }],

        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from AI");
      }

      const analysisResult = JSON.parse(content);
      results.push({
        name: analysisResult.name ?? resumeName,
        type: analysisResult.type ?? "Unknown",
        email: analysisResult.email ?? "N/A",
        contact: analysisResult.contact ?? "N/A",
        topThreeSkills: analysisResult.topThreeSkills ?? "N/A",
        summary: analysisResult.summary ?? "N/A",
        pros: analysisResult.pros ?? "N/A",
        cons: analysisResult.cons ?? "N/A",
        rating: typeof analysisResult.rating === "number" ? analysisResult.rating : 0,
        decision: analysisResult.decision ?? "Rejected",
        matchScore: typeof analysisResult.matchScore === "number" ? analysisResult.matchScore : 0,
        matchingSkills: Array.isArray(analysisResult.matchingSkills) ? analysisResult.matchingSkills : [],
        missingSkills: Array.isArray(analysisResult.missingSkills) ? analysisResult.missingSkills : []
      });
    } catch (err) {
      req.log.error({ err, resumeName }, "Failed to analyze resume");
      results.push({
        name: resumeName,
        type: "Unknown",
        email: "N/A",
        contact: "N/A",
        topThreeSkills: "N/A",
        summary: "Analysis failed",
        pros: "N/A",
        cons: "Analysis could not be completed",
        rating: 0,
        decision: "Rejected",
        matchScore: 0,
        matchingSkills: [],
        missingSkills: []
      });
    }
  }

  try {
    const validated = AnalyzeResumesResponse.parse({ results });
    res.json(validated);
  } catch (err) {
    logger.error({ err }, "Response validation failed");
    res.json({ results });
  }
});

export default router;