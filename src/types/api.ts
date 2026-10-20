export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface AnalysisRecord {
  _id: string;
  userId: string;
  fileName: string;
  fileType: string;
  originalText?: string;
  summary: string;
  sprintId?: string;
  createdAt: string;
}

export interface SprintUpload {
  day: number;
  analysisId: AnalysisRecord | string;
  fileName: string;
  uploadedAt: string;
}

export interface SprintRecord {
  _id: string;
  userId: string;
  name: string;
  durationDays: number;
  expectedResult: string;
  aggregatedSummary: string;
  uploads: SprintUpload[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiError {
  msg?: string;
  message?: string;
}

export type UploadResult = AnalysisRecord | {
  analysis: AnalysisRecord;
  sprint?: SprintRecord;
};
