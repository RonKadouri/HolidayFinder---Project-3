import express, { Request, Response, Router } from "express";
import { securityMiddleware } from "../middleware/security-middleware";
import { aiService } from "../services/ai-service";

// Contains routes, without logic.
class AiController {

    // Create a router object which can listen on routes:
    public router: Router = express.Router();

    // Constructor - register routes:
    public constructor() {
        this.router.post("/api/ai/recommendation", securityMiddleware.verifyLoggedIn, this.getRecommendation);
        this.router.post("/api/ai/mcp-question", securityMiddleware.verifyLoggedIn, this.askQuestion);
    }

    // Get an AI vacation recommendation for a destination:
    private async getRecommendation(request: Request, response: Response): Promise<void> {
        const recommendation = await aiService.getRecommendation(request.body?.destination);
        response.json(recommendation);
    }

    // Answer a question about the vacations using the MCP server:
    private async askQuestion(request: Request, response: Response): Promise<void> {
        const answer = await aiService.askQuestion(request.body?.question);
        response.json(answer);
    }

}

export const aiController = new AiController();
