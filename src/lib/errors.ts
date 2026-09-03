export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
    public readonly code: string = 'BAD_REQUEST'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ConfigurationError extends AppError {
  constructor() {
    super('서비스 설정 오류로 요청을 처리할 수 없습니다.', 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ConfigurationError';
  }
}
