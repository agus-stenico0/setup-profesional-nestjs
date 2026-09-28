import { UnauthorizedError } from '@common/errors/domain.exception.js';
import { ErrorCodes } from '@common/errors/error-codes.js';

export class InvalidCredentialsError extends UnauthorizedError {
  readonly code = ErrorCodes.INVALID_CREDENTIALS;
  constructor() {
    super('Email o contraseña incorrectos');
  }
}

export class InvalidRefreshTokenError extends UnauthorizedError {
  readonly code = ErrorCodes.INVALID_REFRESH_TOKEN;
  constructor() {
    super('La sesión expiró. Iniciá sesión de nuevo.');
  }
}