export abstract class DomainException extends Error {
  abstract readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

export abstract class NotFoundError extends DomainException {}
export abstract class ConflictError extends DomainException {}
export abstract class ForbiddenError extends DomainException {}
export abstract class UnauthorizedError extends DomainException {}
export abstract class ValidationError extends DomainException {}