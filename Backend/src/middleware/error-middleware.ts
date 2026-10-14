import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../models/enums";
import { ClientError } from "../models/client-error";
import colors from "colors";
import { appConfig } from "../utils/app-config";

class ErrorMiddleware {

    // Route Not Found Middleware:
    public routeNotFound(request: Request, response: Response, next: NextFunction): void {
        const err = new ClientError(StatusCode.NotFound, `Route ${request.originalUrl} on method ${request.method} not found.`);
        next(err);
    }

    // Catch-All Middleware:
    public catchAll(err: any, request: Request, response: Response, next: NextFunction): void {

        // Take status:
        const status = err.status || StatusCode.InternalServerError;

        // Is server error:
        const isServerError = status >= 500 && status <= 599;

        // Take message: 
        const message = isServerError && appConfig.isProduction ? "Some error, please try again." : err.message;

        // Console message: 
        console.log(colors.red(err.message));

        // Log errors in database:
        // ...

        // Return back error:
        response.status(status).json({ message });
    }

}

export const errorMiddleware = new ErrorMiddleware();
