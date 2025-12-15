import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE ||
  "https://eden-api.redmushroom-c729ca5a.eastus2.azurecontainerapps.io";

export const apiClient = axios.create({
  baseURL
});

export interface QueryRequest {
  question: string;
  startDate?: string;
  endDate?: string;
  user?: string;
}

export interface QueryResponse {
  answer: string;
  stats?: Record<string, string | number>;
}

export const askQuestion = async (payload: QueryRequest) => {
  const { data } = await apiClient.post<QueryResponse>("/api/query", payload);
  return data;
};
