import apiClient from "./client";
import { AtsMatchResponse, ParseResumeResponse } from "../types";

export const aiApi = {
  /**
   * Match a resume against a specific job by jobId
   * OR against custom job data (title, description, requirements)
   */
  matchResume: async (params: {
    file?: File;
    resumeText?: string;
    jobId?: string;
    title?: string;
    description?: string;
    requirements?: string[];
    jobType?: string;
    experienceLevel?: string;
  }): Promise<AtsMatchResponse> => {
    const form = new FormData();

    if (params.file) {
      form.append("resumeFile", params.file);
    } else if (params.resumeText) {
      form.append("resumeText", params.resumeText);
    }

    if (params.jobId) {
      form.append("jobId", params.jobId);
    } else {
      if (params.title) form.append("title", params.title);
      if (params.description) form.append("description", params.description);
      if (params.requirements) {
        params.requirements.forEach((req) => form.append("requirements", req));
      }
      if (params.jobType) form.append("jobType", params.jobType);
      if (params.experienceLevel)
        form.append("experienceLevel", params.experienceLevel);
    }

    const { data } = await apiClient.post<AtsMatchResponse>("/ai/match", form);
    return data;
  },

  /**
   * Parse skills and metadata from a resume file or text
   */
  parseResume: async (params: {
    file?: File;
    resumeText?: string;
  }): Promise<ParseResumeResponse> => {
    const form = new FormData();

    if (params.file) {
      form.append("resumeFile", params.file);
    } else if (params.resumeText) {
      form.append("resumeText", params.resumeText);
    }

    const { data } = await apiClient.post<ParseResumeResponse>(
      "/ai/parse",
      form
    );
    return data;
  },
};
