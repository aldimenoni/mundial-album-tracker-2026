import type {
  AlbumDto,
  AlbumSummaryDto,
  ApiErrorResponse,
  CompareAlbumDto,
  CreateUserPayload,
  StickerDto,
  UpdateUserStickerPayload,
  UserDto,
  UserStickerDto
} from "@mundial-album/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as unknown;
}

async function request<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as ApiErrorResponse).message === "string"
        ? (payload as ApiErrorResponse).message
        : "API request failed";

    throw new ApiClientError(response.status, message, payload);
  }

  return payload as TResponse;
}

export const api = {
  listStickers(team?: string): Promise<StickerDto[]> {
    const params = new URLSearchParams();

    if (team) {
      params.set("team", team);
    }

    const query = params.toString();
    return request<StickerDto[]>(`/stickers${query ? `?${query}` : ""}`);
  },

  createUser(payload: CreateUserPayload): Promise<UserDto> {
    return request<UserDto>("/users", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  listUsers(): Promise<UserDto[]> {
    return request<UserDto[]>("/users");
  },

  getAlbum(userId: string): Promise<AlbumDto> {
    return request<AlbumDto>(`/albums/${userId}`);
  },

  updateAlbumSticker(
    userId: string,
    stickerId: string,
    payload: UpdateUserStickerPayload
  ): Promise<UserStickerDto> {
    return request<UserStickerDto>(`/albums/${userId}/stickers/${stickerId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },

  getAlbumSummary(userId: string): Promise<AlbumSummaryDto> {
    return request<AlbumSummaryDto>(`/albums/${userId}/summary`);
  },

  compareAlbums(myUserId: string, otherUserId: string): Promise<CompareAlbumDto> {
    return request<CompareAlbumDto>(`/albums/${myUserId}/compare/${otherUserId}`);
  }
};
