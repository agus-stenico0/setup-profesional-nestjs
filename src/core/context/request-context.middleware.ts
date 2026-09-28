import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { requestContextStorage } from './request-context.js';

const SAFE_ID = /^[a-zA-Z0-9-]{8,64}$/;

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && SAFE_ID.test(incoming) ? incoming : randomUUID();

  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  requestContextStorage.run({ requestId, startedAt: Date.now() }, () => next());
}