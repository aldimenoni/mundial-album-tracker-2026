import { ApiClientError } from "./client";

type ApiErrorPayload = {
  message?: string;
  issues?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    const payload = error.payload as ApiErrorPayload | null;

    if (payload && typeof payload === "object" && payload.issues) {
      const fieldErrors = Object.values(payload.issues.fieldErrors ?? {}).flatMap(
        (messages) => messages ?? []
      );
      const formErrors = payload.issues.formErrors ?? [];
      const issueMessage = [...formErrors, ...fieldErrors].find(Boolean);

      if (issueMessage) {
        return issueMessage;
      }
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado.";
}
