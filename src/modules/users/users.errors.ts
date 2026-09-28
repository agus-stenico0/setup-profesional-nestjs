import { ConflictError, NotFoundError } from '@common/errors/domain.exception.js';
import { ErrorCodes } from '@common/errors/error-codes.js';

export class UserNotFoundError extends NotFoundError {
  readonly code = ErrorCodes.USER_NOT_FOUND;
  constructor(id: string) {
    super(`El usuario ${id} no existe`, { userId: id });
  }
}

export class EmailAlreadyRegisteredError extends ConflictError {
  readonly code = ErrorCodes.EMAIL_ALREADY_REGISTERED;
  constructor() {
    super('Ese email ya está registrado');
  }
}