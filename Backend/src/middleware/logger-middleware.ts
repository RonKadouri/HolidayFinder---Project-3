import { NextFunction, Request, Response } from "express";
import colors from "colors";

class LoggerMiddleware {

    // Pass-Through Middleware:
    public logToConsole(request: Request, response: Response, next: NextFunction): void {
        const method = request.method;
        const route = request.originalUrl;
        const safeBody = request.body?.password ? { ...request.body, password: "***" } : request.body; // Never log passwords.
        const body = safeBody ? JSON.stringify(safeBody) : null;
        console.log(colors.green(`${method} ${route} | body: ${body}`));
        next(); // Continue to next middleware / controller
    }

}

export const loggerMiddleware = new LoggerMiddleware();
