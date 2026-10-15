import apiClient from "./client";
import {
  CreateJobInput,
  Job,
  JobResponse,
  JobsResponse,
  UpdateJobInput,
} from "../types";

export const jobApi = {
  getAllJobs: async (): Promise<Job[]> => {
    const { data } = await apiClient.get<JobsResponse>("/job");
    return data.jobs;
  },

  getJobById: async (id: string): Promise<Job> => {
    const { data } = await apiClient.get<JobResponse>(`/job/${id}`);
    return data.job;
  },

  createJob: async (payload: CreateJobInput): Promise<Job> => {
    const { data } = await apiClient.post<JobResponse>("/job/create", payload);
    return data.job;
  },

  updateJob: async (id: string, payload: UpdateJobInput): Promise<Job> => {
    const { data } = await apiClient.put<JobResponse>(`/job/${id}`, payload);
    return data.job;
  },

  deleteJob: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(`/job/${id}`);
    return data;
  },
};
