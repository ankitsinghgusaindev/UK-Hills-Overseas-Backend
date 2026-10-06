import type {
  ApiResponse,
  ApiSuccessResponse,
} from "@/types/api";

import { ClientApiError } from "./client-api-error";

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  let result: ApiResponse<T>;

  try {
    result = await response.json();
  } catch {
    throw new ClientApiError(
      "Invalid server response",
      response.status,
    );
  }

  if (!response.ok || !result.success) {
    if (!result.success) {
      throw new ClientApiError(
        result.message,
        response.status,
        result.errors,
      );
    }

    throw new ClientApiError(
      "Request failed",
      response.status,
    );
  }

  return result;
}

export const apiClient = {
  get<T>(url: string) {
    return request<T>(url, {
      method: "GET",
    });
  },

  post<T>(url: string, body: unknown) {
    return request<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  patch<T>(url: string, body: unknown) {
    return request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  put<T>(url: string, body: unknown) {
    return request<T>(url, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete<T>(url: string) {
    return request<T>(url, {
      method: "DELETE",
    });
  },
};