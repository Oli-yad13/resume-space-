import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import { JOB_RECOMMENDATIONS_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

type JobRecommendation = {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  category: string;
  experienceLevel: string;
  employmentType: string;
  locationType: string;
  views: number;
  createdAt: string;
  aiScore: number;
  aiReasoning: string;
};

type RecommendationsResponse = {
  recommendations: JobRecommendation[];
  resumeUsed: {
    id: string;
    title: string;
  };
};

export const getJobRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await axios.get<RecommendationsResponse, AxiosResponse<RecommendationsResponse>>(
    "/job/recommendations/ai",
  );

  return response.data;
};

export const useJobRecommendations = () => {
  const {
    data,
    error,
    isPending: loading,
    refetch,
  } = useQuery({
    queryKey: JOB_RECOMMENDATIONS_KEY,
    queryFn: getJobRecommendations,
    // Cache for 10 minutes
    staleTime: 1000 * 60 * 10,
    // Retry once on error
    retry: 1,
  });

  return {
    recommendations: data?.recommendations || [],
    resumeUsed: data?.resumeUsed,
    loading,
    error,
    refetch,
  };
};

