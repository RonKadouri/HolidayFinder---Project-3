import { UploadedFile } from "express-fileupload";
import z from "zod";
import { ClientError } from "./client-error";
import { StatusCode } from "./enums";

const PRICE_MAX = 10000;

// Vacation Schema:
const VacationSchema = z.object({
    id: z.number().int().positive().optional(),
    destination: z.string().min(2).max(100),
    description: z.string().min(2).max(1000),
    startDate: z.iso.date(), // "YYYY-MM-DD"
    endDate: z.iso.date(), // "YYYY-MM-DD"
    price: z.number({ error: "Price is required." }).min(0, "Price can't be negative.").max(PRICE_MAX, `Price can't be over ${PRICE_MAX}.`)
}).refine(vacation => vacation.endDate >= vacation.startDate, { error: "End date can't be before the start date.", path: ["endDate"] });

// Vacation Interface (I = Interface):
type IVacationModel = z.infer<typeof VacationSchema>;

// Vacation Model:
export class VacationModel implements IVacationModel {

    public id: number;
    public destination: string;
    public description: string;
    public startDate: string;
    public endDate: string;
    public price: number;
    public imageName: string; // Only the image file name is saved in the database.
    public image?: UploadedFile; // The uploaded image file (when adding or editing a vacation).

    public constructor(vacation: VacationModel) { // Copy Constructor
        this.id = vacation.id;
        this.destination = vacation.destination;
        this.description = vacation.description;
        this.startDate = vacation.startDate;
        this.endDate = vacation.endDate;
        this.price = vacation.price;
        this.imageName = vacation.imageName;
        this.image = vacation.image;
    }

    public validate(): void {
        const result = VacationSchema.safeParse(this);
        if (!result.success) {
            const message = result.error.issues[0].path + ": " + result.error.issues[0].message;
            throw new ClientError(StatusCode.UnprocessableContent, message);
        }
    }

}
