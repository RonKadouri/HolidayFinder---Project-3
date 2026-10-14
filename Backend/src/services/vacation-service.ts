import { UploadedFile } from "express-fileupload";
import { QueryError, ResultSetHeader } from "mysql2";
import { saver } from "smart-saver";
import { ClientError } from "../models/client-error";
import { Role, StatusCode } from "../models/enums";
import { LikeModel } from "../models/like-model";
import { UserModel } from "../models/user-model";
import { VacationModel } from "../models/vacation-model";
import { dal } from "../utils/dal";

// Only plain image file names - blocks path traversal such as "../../.env":
const IMAGE_NAME_PATTERN = /^[\w-]+\.(jpg|jpeg|png|webp|gif)$/i;

// Allowed image types for uploads:
const IMAGE_EXTENSION_PATTERN = /\.(jpg|jpeg|png|webp|gif)$/i;

function validateImageType(image: UploadedFile): void {
    if (!IMAGE_EXTENSION_PATTERN.test(image.name)) {
        throw new ClientError(StatusCode.UnprocessableContent, "image: Only jpg, png, webp or gif images are allowed.");
    }
}

// Today's date, formatted the same way as vacation dates for comparison:
function getToday(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

function validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
        throw new ClientError(StatusCode.BadRequest, "Invalid vacation id.");
    }
}

// Logic:
class VacationService {

    // Get all vacations, sorted by start date:
    public async getAllVacations(): Promise<VacationModel[]> {
        const sql = "SELECT * FROM vacations ORDER BY startDate";
        const vacations = await dal.execute(sql) as VacationModel[];
        return vacations;
    }

    // Get all likes (of all users):
    public async getAllLikes(): Promise<LikeModel[]> {
        const sql = "SELECT * FROM likes";
        const likes = await dal.execute(sql) as LikeModel[];
        return likes;
    }

    // Get the vacations that are active right now (already started and not ended yet):
    public async getActiveVacations(): Promise<VacationModel[]> {
        const sql = "SELECT * FROM vacations WHERE startDate <= CURDATE() AND endDate >= CURDATE() ORDER BY startDate";
        const vacations = await dal.execute(sql) as VacationModel[];
        return vacations;
    }

    // Get the future vacations (not started yet):
    public async getFutureVacations(): Promise<VacationModel[]> {
        const sql = "SELECT * FROM vacations WHERE startDate > CURDATE() ORDER BY startDate";
        const vacations = await dal.execute(sql) as VacationModel[];
        return vacations;
    }

    // Get the average price of all vacations:
    public async getAveragePrice(): Promise<number> {
        const sql = "SELECT ROUND(AVG(price), 2) AS averagePrice FROM vacations";
        const result = await dal.execute(sql) as { averagePrice: number }[];
        return result[0].averagePrice;
    }

    // Get how many likes each vacation got:
    public async getLikesPerVacation(): Promise<{ destination: string; likes: number }[]> {
        const vacations = await this.getAllVacations();
        const likes = await this.getAllLikes();
        return vacations.map(vacation => ({
            destination: vacation.destination,
            likes: likes.filter(like => like.vacationId === vacation.id).length
        }));
    }

    // Get one vacation:
    public async getOneVacation(id: number): Promise<VacationModel> {
        validateId(id);
        const sql = "SELECT * FROM vacations WHERE id = ?";
        const vacations = await dal.execute(sql, [id]) as VacationModel[];
        const vacation = vacations[0];
        if (!vacation) {
            throw new ClientError(StatusCode.NotFound, `Vacation ${id} not found.`);
        }
        return vacation;
    }

    // Add a new vacation (admin only):
    public async addVacation(vacation: VacationModel): Promise<VacationModel> {

        // Validate (required fields, price 0-10,000, end date not before start date):
        vacation.validate();

        if (vacation.startDate < getToday()) {
            throw new ClientError(StatusCode.UnprocessableContent, "startDate: Can't choose a past date.");
        }

        if (!vacation.image) {
            throw new ClientError(StatusCode.UnprocessableContent, "image: Image is required.");
        }

        validateImageType(vacation.image);

        // Save the image in the images folder and store its name in the database:
        const imageName = await saver.save(vacation.image);

        const sql = "INSERT INTO vacations (destination, description, startDate, endDate, price, imageName) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [vacation.destination, vacation.description, vacation.startDate, vacation.endDate, vacation.price, imageName];
        const info = await dal.execute(sql, values) as ResultSetHeader;

        return this.getOneVacation(info.insertId);
    }

    // Update a vacation (admin only) - past dates are allowed, and the image is optional:
    public async updateVacation(vacation: VacationModel): Promise<VacationModel> {

        const oldVacation = await this.getOneVacation(vacation.id); // 404 if it doesn't exist.

        // Validate (required fields, price 0-10,000, end date not before start date):
        vacation.validate();

        if (vacation.image) {
            validateImageType(vacation.image);
        }

        // Replace the old image when a new one is uploaded; otherwise keep the existing image:
        const imageName = vacation.image ? await saver.update(vacation.image, oldVacation.imageName) : oldVacation.imageName;

        const sql = "UPDATE vacations SET destination = ?, description = ?, startDate = ?, endDate = ?, price = ?, imageName = ? WHERE id = ?";
        const values = [vacation.destination, vacation.description, vacation.startDate, vacation.endDate, vacation.price, imageName, vacation.id];
        await dal.execute(sql, values);

        return this.getOneVacation(vacation.id);
    }

    // Delete a vacation and its image (its likes are deleted by the database - ON DELETE CASCADE):
    public async deleteVacation(id: number): Promise<void> {
        const vacation = await this.getOneVacation(id); // 404 if it doesn't exist.
        const sql = "DELETE FROM vacations WHERE id = ?";
        await dal.execute(sql, [id]);
        await saver.delete(vacation.imageName);
    }

    // Like a vacation:
    public async likeVacation(user: UserModel, vacationId: number): Promise<void> {
        validateId(vacationId);

        if (user.roleId === Role.Admin) {
            throw new ClientError(StatusCode.Forbidden, "Admins can't like vacations.");
        }

        try {
            const sql = "INSERT INTO likes (userId, vacationId) VALUES (?, ?)";
            await dal.execute(sql, [user.id, vacationId]);
        }
        catch (err: unknown) {
            const code = (err as QueryError).code;
            if (code === "ER_DUP_ENTRY") { // Composite primary key (userId, vacationId).
                throw new ClientError(StatusCode.Conflict, "You already liked this vacation.");
            }
            if (code === "ER_NO_REFERENCED_ROW_2") { // Foreign key to vacations.
                throw new ClientError(StatusCode.NotFound, `Vacation ${vacationId} not found.`);
            }
            throw err;
        }
    }

    // Unlike a vacation:
    public async unlikeVacation(userId: number, vacationId: number): Promise<void> {
        validateId(vacationId);
        const sql = "DELETE FROM likes WHERE userId = ? AND vacationId = ?";
        const info = await dal.execute(sql, [userId, vacationId]) as ResultSetHeader;
        if (info.affectedRows === 0) {
            throw new ClientError(StatusCode.NotFound, "You haven't liked this vacation.");
        }
    }

    // Get the absolute path of a vacation image (a "file not found" image if it doesn't exist):
    public getImagePath(imageName: string): string {
        if (!IMAGE_NAME_PATTERN.test(imageName)) {
            throw new ClientError(StatusCode.BadRequest, "Invalid image name.");
        }
        return saver.getFilePath(imageName);
    }

}

export const vacationService = new VacationService();
