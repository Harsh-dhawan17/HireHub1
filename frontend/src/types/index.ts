export type UserRole = 'student' | 'recruiter';

export interface User {
  _id: string;
  fullname: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SendOtpInput {
  email: string;
  fullname: string;
}

export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract';

export type ExperienceLevel = 'fresher' | '1-3 years' | '3-5 years' | '5+ years';

export interface JobCompany {
  _id: string;
  fullname: string;
  email: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  position: number;
  company: JobCompany | string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface ApplicationJob {
  _id: string;
  title: string;
  description?: string;
  salary: number;
  location: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
}

export interface ApplicationApplicant {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
}

export interface ExperienceAnswer {
  skill: string;
  years: string;
}

export interface Application {
  _id: string;
  job: ApplicationJob;
  applicant: ApplicationApplicant | string;
  status: ApplicationStatus;
  resumeFileName?: string;
  resumeText?: string;
  phone?: string;
  coverNote?: string;
  experienceAnswers?: ExperienceAnswer[];
  atsScore?: number;
  matchDetails?: {
    matchedSkills?: string[];
    missingSkills?: string[];
    strengths?: string[];
    improvements?: string[];
    summary?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApplyJobPayload {
  resumeFile?: File;
  resumeText?: string;
  phone?: string;
  coverNote?: string;
  experienceAnswers?: ExperienceAnswer[];
}

// API Payloads
export interface RegisterInput {
  fullname: string;
  email: string;
  password: string;
  role: UserRole;
  otp: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  requirements: string[];
  salary: number;
  location: string;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  position: number;
}

export type UpdateJobInput = Partial<CreateJobInput>;

// API Responses
export interface ApiResponse<T = unknown> {
  message: string;
  [key: string]: T | string | undefined;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

export interface JobsResponse {
  message: string;
  jobs: Job[];
}

export interface JobResponse {
  message: string;
  job: Job;
}

export interface ApplicationsResponse {
  message: string;
  applications: Application[];
}

export interface ApplicationResponse {
  message: string;
  application: Application;
}

// ─── AI / Resume Types ────────────────────────────────────────────────────────

export type AtsMatchRating = "Strong Match" | "Moderate Match" | "Low Match";

export interface AtsEvaluation {
  atsScore: number;
  matchRating: AtsMatchRating;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  summary: string;
  isAiPowered?: boolean;
}

export interface AtsMatchResponse {
  message: string;
  evaluation: AtsEvaluation;
  resumeExcerpt: string;
}

export interface ParsedResume {
  detectedSkills: string[];
  email: string;
  phone: string;
  characterCount: number;
  wordCount: number;
}

export interface ParseResumeResponse {
  message: string;
  resumeText: string;
  parsed: ParsedResume;
}
