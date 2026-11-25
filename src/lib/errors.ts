export interface AppErrorOptions {
  retryAfterSeconds?: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfterSeconds?: number;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number = 400,
    code: string = 'BAD_REQUEST',
    options?: AppErrorOptions
  ) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = options?.retryAfterSeconds;
    this.details = options?.details;
  }
}

export class ConfigurationError extends AppError {
  constructor() {
    super('서비스 설정 오류로 요청을 처리할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ConfigurationError';
  }
}
