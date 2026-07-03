export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly body: ApiErrorBody;

  constructor(statusCode: number, body: ApiErrorBody) {
    const message =
      typeof body.message === "string" ? body.message : body.message.join("; ");
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.body = body;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let body: ApiErrorBody = {
      statusCode: response.status,
      message: response.statusText || "Request failed",
    };

    try {
      const json = (await response.json()) as Partial<ApiErrorBody>;
      body = {
        statusCode: json.statusCode ?? response.status,
        message: json.message ?? body.message,
        error: json.error,
        path: json.path,
        timestamp: json.timestamp,
      };
    } catch {
      // resposta não-JSON
    }

    return new ApiError(response.status, body);
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }
}
