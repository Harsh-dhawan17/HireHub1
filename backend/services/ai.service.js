const { GoogleGenAI } = require("@google/genai");

// Common tech skills dictionary for NLP fallback
const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
  "React", "React.js", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "Redux", "Zustand", "HTML", "CSS", "Tailwind CSS", "Bootstrap",
  "Node.js", "Express", "Express.js", "Nest.js", "Django", "FastAPI", "Flask", "Spring Boot", "ASP.NET",
  "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Elasticsearch", "Prisma", "Mongoose", "Firebase", "Supabase",
  "Docker", "Kubernetes", "AWS", "Google Cloud", "GCP", "Azure", "CI/CD", "GitHub Actions", "Terraform", "Linux",
  "REST API", "GraphQL", "WebSockets", "gRPC", "Microservices", "Jest", "Mocha", "Cypress", "Git", "GitHub", "Agile", "Scrum"
];

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function skillMatchesText(skill, text) {
  const escaped = escapeRegex(skill);
  const regex = new RegExp(`(?:^|\\b|\\W)${escaped}(?:$|\\b|\\W)`, "i");
  return regex.test(text);
}

/**
 * Fallback algorithmic ATS analyzer
 */
function algorithmicATS(resumeText, job) {
  const text = (resumeText || "").toLowerCase();
  const jobTitle = (job.title || "").toLowerCase();
  const jobDesc = (job.description || "").toLowerCase();
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];

  // 1. Skill Extraction from candidate text
  const detectedCandidateSkills = COMMON_SKILLS.filter(skill => skillMatchesText(skill, text));

  const matchedSkills = [];
  const missingSkills = [];

  // Match against requirements
  requirements.forEach(req => {
    const reqClean = req.trim();
    if (!reqClean) return;
    const reqLower = reqClean.toLowerCase();
    
    // Check if requirement text appears in resume
    if (skillMatchesText(reqClean, text) || text.includes(reqLower)) {
      matchedSkills.push(reqClean);
    } else {
      // Check if any detected candidate skill matches part of the requirement
      const partialMatch = detectedCandidateSkills.some(s => reqLower.includes(s.toLowerCase()));
      if (partialMatch) {
        matchedSkills.push(reqClean);
      } else {
        missingSkills.push(reqClean);
      }
    }
  });

  // Also check general job description skills
  COMMON_SKILLS.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (jobDesc.includes(skillLower) && !matchedSkills.some(m => m.toLowerCase().includes(skillLower))) {
      if (skillMatchesText(skill, text)) {
        matchedSkills.push(skill);
      } else if (!missingSkills.some(m => m.toLowerCase().includes(skillLower))) {
        missingSkills.push(skill);
      }
    }
  });

  // Remove duplicates
  const uniqueMatched = Array.from(new Set(matchedSkills));
  const uniqueMissing = Array.from(new Set(missingSkills)).slice(0, 6);

  // 2. Score Calculation
  const totalChecked = uniqueMatched.length + uniqueMissing.length;
  let baseScore = totalChecked > 0 ? Math.round((uniqueMatched.length / totalChecked) * 75) : 40;

  // Title keyword overlap bonus
  const titleWords = jobTitle.split(/\s+/).filter(w => w.length > 2);
  let titleMatches = 0;
  titleWords.forEach(w => {
    if (text.includes(w)) titleMatches++;
  });
  if (titleWords.length > 0) {
    baseScore += Math.round((titleMatches / titleWords.length) * 15);
  }

  // Experience level factor
  if (job.experienceLevel === "fresher" && (text.includes("intern") || text.includes("project") || text.includes("degree"))) {
    baseScore += 10;
  } else if (text.includes("experience") || text.includes("year")) {
    baseScore += 8;
  }

  const atsScore = Math.min(Math.max(baseScore, 25), 98);

  // 3. Match Rating
  let matchRating = "Low Match";
  if (atsScore >= 75) matchRating = "Strong Match";
  else if (atsScore >= 50) matchRating = "Moderate Match";

  // 4. Strengths & Improvements
  const strengths = [];
  if (uniqueMatched.length > 0) {
    strengths.push(`Matches critical core technologies: ${uniqueMatched.slice(0, 3).join(", ")}`);
  }
  if (titleMatches > 0) {
    strengths.push(`Resume reflects key terminology aligned with "${job.title}"`);
  }
  if (text.includes("project") || text.includes("built") || text.includes("developed")) {
    strengths.push("Practical project implementation experience highlighted");
  }

  const improvements = [];
  if (uniqueMissing.length > 0) {
    improvements.push(`Include exposure to missing prerequisite skills: ${uniqueMissing.slice(0, 3).join(", ")}`);
  }
  improvements.push("Quantify achievements using metrics (e.g. 'improved performance by 25%')");
  improvements.push(`Highlight competencies specifically requested for '${job.title}'`);

  return {
    atsScore,
    matchRating,
    matchedSkills: uniqueMatched,
    missingSkills: uniqueMissing,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    summary: `Candidate profile achieves a ${atsScore}% match score with ${uniqueMatched.length} aligned core competencies for ${job.title}.`,
    isAiPowered: false,
  };
}

/**
 * AI-Powered ATS Matcher using Gemini API (with seamless fallback)
 */
async function matchResumeWithJob(resumeText, job) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return algorithmicATS(resumeText, job);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert Enterprise Applicant Tracking System (ATS) Evaluator.
Analyze the following candidate resume text against the provided job posting.

JOB DETAILS:
- Title: ${job.title || "Software Engineer"}
- Description: ${job.description || "N/A"}
- Required Skills: ${(Array.isArray(job.requirements) ? job.requirements : []).join(", ")}
- Job Type: ${job.jobType || "full-time"}
- Experience Level: ${job.experienceLevel || "fresher"}

CANDIDATE RESUME:
${resumeText.slice(0, 4500)}

Calculate an objective ATS compatibility assessment. Return ONLY a valid JSON object with the following exact structure:
{
  "atsScore": <number between 15 and 98>,
  "matchRating": "<Strong Match | Moderate Match | Low Match>",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["missingSkill1", "missingSkill2"],
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement tip 1", "improvement tip 2"],
  "summary": "<2-sentence executive summary on candidate suitability for this position>"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text || "";
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    }
    const parsed = JSON.parse(rawText);

    return {
      atsScore: Math.min(Math.max(Number(parsed.atsScore) || 50, 0), 100),
      matchRating: parsed.matchRating || "Moderate Match",
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      summary: parsed.summary || "Evaluation completed successfully.",
      isAiPowered: true,
    };
  } catch (error) {
    console.warn("Gemini ATS evaluation error, falling back to algorithmic analyzer:", error.message);
    return algorithmicATS(resumeText, job);
  }
}

/**
 * Parse Resume Information with AI enhancement and regex fallback
 */
async function parseResumeText(resumeText) {
  const text = resumeText || "";

  // 1. Detect skills via keyword scanner
  const detectedSkills = COMMON_SKILLS.filter(skill => skillMatchesText(skill, text));

  // 2. Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // 3. Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  const basicResult = {
    detectedSkills,
    email,
    phone,
    characterCount: text.length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return basicResult;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert Resume Information Extractor.
Extract technical skills, contact email, and contact phone number from the resume below.

RESUME CONTENT:
${text.slice(0, 4500)}

Return ONLY a valid JSON object matching this exact format:
{
  "detectedSkills": ["skill1", "skill2"],
  "email": "<extracted email or empty string>",
  "phone": "<extracted phone or empty string>"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let rawText = response.text || "";
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    }
    const parsed = JSON.parse(rawText);

    // Combine AI skills with dictionary detected skills for maximum accuracy
    const combinedSkills = Array.from(
      new Set([
        ...(Array.isArray(parsed.detectedSkills) ? parsed.detectedSkills : []),
        ...detectedSkills,
      ])
    );

    return {
      detectedSkills: combinedSkills,
      email: parsed.email || email,
      phone: parsed.phone || phone,
      characterCount: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  } catch (err) {
    console.warn("AI resume parsing error, using algorithmic extractor:", err.message);
    return basicResult;
  }
}

module.exports = {
  matchResumeWithJob,
  parseResumeText,
};
