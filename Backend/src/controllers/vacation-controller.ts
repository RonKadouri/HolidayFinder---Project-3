import express, { Request, Response, Router } from "express";
import { UploadedFile } from "express-fileupload";
import { VacationModel } from "../models/vacation-model";
import { StatusCode } from "../models/enums";
import { securityMiddleware } from "../middleware/security-middleware";
import { vacationService } from "../services/vacation-service";
import { cyber } from "../utils/cyber";

// Form fields arrive as text. An empty price is treated as invalid instead of being saved as zero.
function toPrice(value: unknown): number {
    return typeof value === "string" && value.trim() === "" ? NaN : Number(value);
}

// Contains routes, without logic.
class VacationController {

    // Create a router object which can listen on routes:
    public router: Router = express.Router();

    // Constructor - register routes:
    public constructor() {
        this.router.get("/api/vacations", securityMiddleware.verifyLoggedIn, this.getAllVacations);
        this.router.get("/api/vacations/:id", securityMiddleware.verifyLoggedIn, this.getOneVacation);
        this.router.post("/api/vacations", securityMiddleware.verifyAdmin, this.addVacation);
        this.router.put("/api/vacations/:id", securityMiddleware.verifyAdmin, this.updateVacation);
        this.router.delete("/api/vacations/:id", securityMiddleware.verifyAdmin, this.deleteVacation);
        this.router.post("/api/vacations/:id/likes", securityMiddleware.verifyLoggedIn, this.likeVacation);
        this.router.delete("/api/vacations/:id/likes", securityMiddleware.verifyLoggedIn, this.unlikeVacation);
        this.router.get("/api/vacations/images/:imageName", this.getImage); // Public - <img> tags can't send a token.
        this.router.get("/api/likes", securityMiddleware.verifyLoggedIn, this.getAllLikes);
    }

    // Get all vacations:
    private async getAllVacations(request: Request, response: Response): Promise<void> {
        const vacations = await vacationService.getAllVacations();
        response.json(vacations);
    }

    // Get one vacation:
    private async getOneVacation(request: Request, response: Response): Promise<void> {
        const id = Number(request.params.id);
        const vacation = await vacationService.getOneVacation(id);
        response.json(vacation);
    }

    // Add a vacation (admin only) - sent as form data, because it includes the image file:
    private async addVacation(request: Request, response: Response): Promise<void> {
        const vacation = new VacationModel({
            ...request.body,
            price: toPrice(request.body?.price),
            image: request.files?.image as UploadedFile
        });
        const addedVacation = await vacationService.addVacation(vacation);
        response.status(StatusCode.Created).json(addedVacation);
    }

    // Update a vacation (admin only) - sent as form data; the image is optional:
    private async updateVacation(request: Request, response: Response): Promise<void> {
        const vacation = new VacationModel({
            ...request.body,
            id: Number(request.params.id),
            price: toPrice(request.body?.price),
            image: request.files?.image as UploadedFile
        });
        const updatedVacation = await vacationService.updateVacation(vacation);
        response.json(updatedVacation);
    }

    // Delete a vacation (admin only):
    private async deleteVacation(request: Request, response: Response): Promise<void> {
        const id = Number(request.params.id);
        await vacationService.deleteVacation(id);
        response.sendStatus(StatusCode.NoContent);
    }

    // Like a vacation:
    private async likeVacation(request: Request, response: Response): Promise<void> {
        const user = cyber.getUserFromHeader(request.headers.authorization);
        const vacationId = Number(request.params.id);
        await vacationService.likeVacation(user, vacationId);
        response.sendStatus(StatusCode.Created);
    }

    // Unlike a vacation:
    private async unlikeVacation(request: Request, response: Response): Promise<void> {
        const user = cyber.getUserFromHeader(request.headers.authorization);
        const vacationId = Number(request.params.id);
        await vacationService.unlikeVacation(user.id, vacationId);
        response.sendStatus(StatusCode.NoContent);
    }

    // Get all likes:
    private async getAllLikes(request: Request, response: Response): Promise<void> {
        const likes = await vacationService.getAllLikes();
        response.json(likes);
    }

    // Get a vacation image:
    private async getImage(request: Request, response: Response): Promise<void> {
        const imageName = String(request.params.imageName);
        const imagePath = vacationService.getImagePath(imageName);
        response.sendFile(imagePath);
    }

}

export const vacationController = new VacationController();
