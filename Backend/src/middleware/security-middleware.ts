import { Express, NextFunction, Request, Response } from "express";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import striptags from "striptags";
import { ClientError } from "../models/client-error";
import { StatusCode } from "../models/enums";
import { cyber } from "../utils/cyber";

class SecurityMiddleware {

    // Verify logged-in:
    public verifyLoggedIn(request: Request, response: Response, next: NextFunction): void {

        // Extract token: 
        const authorization = request.headers.authorization; // "Bearer the-token..."
        const token = authorization?.substring(7);

        // If token is legal:
        if (cyber.verifyToken(token!)) {
            next();
        }
        else {
            const err = new ClientError(StatusCode.Unauthorized, "You are not logged in.");
            next(err); // Go to catchAll middleware.
        }
    }

    // Verify admin:
    public verifyAdmin(request: Request, response: Response, next: NextFunction): void {

        // Extract token: 
        const authorization = request.headers.authorization; // "Bearer the-token..."
        const token = authorization?.substring(7);

        // If token is legal and user is admin:
        if (cyber.verifyAdmin(token!)) {
            next();
        }
        else {
            const err = new ClientError(StatusCode.Forbidden, "You are not authorized.");
            next(err); // Go to catchAll middleware.
        }
    }

    // Prevent XSS attack:
    public preventXss(request: Request, response: Response, next: NextFunction): void {

        // Run on body object:
        for (const prop in request.body) {

            // Take prop value: 
            const value = request.body[prop];

            // If string: 
            if (typeof value === "string") {

                // Remove tags:
                request.body[prop] = striptags(value);
            }
        }

        // Continue:
        next();
    }

    // Prevent DoS attack:
    public registerRateLimit(server: Express): void {

        // General rate-limit:
        server.use(expressRateLimit({
            windowMs: 1000, // Time window in milliseconds.
            limit: 5, // How many requests allowed in that window.
            skip: request => request.method === "OPTIONS" // The browser's CORS pre-check before each API call with a token.
                || request.path.startsWith("/api/vacations/images/") // A page loads many images at once.
        }));

    }

    // Use helmet to protect header attacks: 
    public headerProtection(server: Express): void {
        server.use(helmet({
            crossOriginResourcePolicy: { policy: "same-site" } // Enable CORS on images.
        }));
    }

}

export const securityMiddleware = new SecurityMiddleware();
