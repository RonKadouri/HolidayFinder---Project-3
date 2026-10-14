import colors from "colors";
import cors from "cors";
import express, { Router } from "express";
import expressFileUpload from "express-fileupload";
import path from "path";
import { saver } from "smart-saver";
import { aiController } from "./controllers/ai-controller";
import { authController } from "./controllers/auth-controller";
import { vacationController } from "./controllers/vacation-controller";
import { errorMiddleware } from "./middleware/error-middleware";
import { securityMiddleware } from "./middleware/security-middleware";
import { appConfig } from "./utils/app-config";
import { loggerMiddleware } from "./middleware/logger-middleware";

class App {

    public start(): void {

        // Configure smart-saver - images path:
        saver.config(path.join(__dirname, "assets", "images"));

        // Create our server object:
        const server = express();

        // System middleware:
        securityMiddleware.registerRateLimit(server); // Prevent DoS attacks.
        securityMiddleware.headerProtection(server); // Prevent header attacks.
        server.use(cors()); // Enable CORS.
        server.use(express.json()); // Configure express to create request.body from a given JSON.
        server.use(expressFileUpload()); // Configure express to create request.files from the request.

        // Register "before" middleware: 
        server.use(loggerMiddleware.logToConsole);
        server.use(securityMiddleware.preventXss);

        // Register controllers:
        const controllers = [authController, vacationController, aiController];
        for (const controller of controllers) {
            server.use(controller.router);
        }

        // Register "after" middleware:
        server.use(errorMiddleware.routeNotFound);
        server.use(errorMiddleware.catchAll);

        // Run server, and print every available route:
        server.listen(appConfig.port, () => this.printRoutes(controllers));
    }

    // Print the server address and every route our controllers registered.
    // The list is read from Express itself, so a new route shows up here automatically:
    private printRoutes(controllers: { router: Router }[]): void {
        console.log(colors.green(`Holiday Finder server is running on http://localhost:${appConfig.port}`));
        console.log("Available routes:");
        for (const controller of controllers) {
            for (const layer of controller.router.stack) {
                if (!layer.route) continue; // Only routes have .route (middleware doesn't).
                const method = layer.route.stack[0].method.toUpperCase(); // e.g. "POST"
                console.log(`  ${colors.cyan(method.padEnd(7))} ${layer.route.path}`);
            }
        }
    }

}

const app = new App();
app.start();

