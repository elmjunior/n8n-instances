import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email?: string;
  };
  isAuthenticated?: boolean;
}

// Simple authentication middleware
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.isAuthenticated = false;
    req.user = undefined;
    return next();
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Simple token validation - in production, use JWT or similar
  if (token === "dummy-token") {
    req.isAuthenticated = true;
    req.user = {
      id: "1",
      username: "admin",
      email: "admin@n8n-manager.com",
    };
  } else {
    req.isAuthenticated = false;
    req.user = undefined;
  }

  next();
}

// Middleware to require authentication
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }

  next();
}

// Optional authentication - doesn't fail if not authenticated
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  authMiddleware(req, res, next);
}
