import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);
  const status = (err as Error & { status?: number }).status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
};
