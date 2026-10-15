import apiClient from "./client";
import {
  Application,
  ApplicationResponse,
  ApplicationsResponse,
  ApplicationStatus,
  ApplyJobPayload,
} from "../types";

export const applicationApi = {
  applyForJob: async (
    jobId: string,
    payload?: ApplyJobPayload
  ): Promise<Application> => {
    let body: any = {};

    if (payload?.resumeFile || payload?.experienceAnswers) {
      const form = new FormData();
      if (payload.resumeFile) {
        form.append("resumeFile", payload.resumeFile);
      }
      if (payload.resumeText) {
        form.append("resumeText", payload.resumeText);
      }
      if (payload.phone) {
        form.append("phone", payload.phone);
      }
      if (payload.coverNote) {
        form.append("coverNote", payload.coverNote);
      }
      if (payload.experienceAnswers && payload.experienceAnswers.length > 0) {
        form.append(
          "experienceAnswers",
          JSON.stringify(payload.experienceAnswers)
        );
      }
      body = form;
    } else if (payload) {
      body = payload;
    }

    const { data } = await apiClient.post<ApplicationResponse>(
      `/application/apply/${jobId}`,
      body
    );
    return data.application;
  },

  getMyApplications: async (): Promise<Application[]> => {
    const { data } = await apiClient.get<ApplicationsResponse>(
      "/application/my-applications"
    );
    return data.applications;
  },

  getRecruiterApplications: async (): Promise<Application[]> => {
    const { data } = await apiClient.get<ApplicationsResponse>(
      "/application/recruiter"
    );
    return data.applications;
  },

  updateApplicationStatus: async (
    applicationId: string,
    status: ApplicationStatus
  ): Promise<Application> => {
    const { data } = await apiClient.put<ApplicationResponse>(
      `/application/${applicationId}/status`,
      { status }
    );
    return data.application;
  },
};
