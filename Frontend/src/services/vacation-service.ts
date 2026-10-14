import axios from "axios";
import { LikeModel } from "../models/like-model";
import { VacationFormModel, VacationModel } from "../models/vacation-model";
import { appConfig } from "../utils/app-config";
import { formUtil } from "../utils/form-util";

// The interceptor adds the token to every request.
class VacationService {

    // Get all vacations (sorted by start date):
    public async getAllVacations(): Promise<VacationModel[]> {
        const response = await axios.get<VacationModel[]>(appConfig.vacationsUrl);
        return response.data;
    }

    // Get one vacation:
    public async getOneVacation(vacationId: number): Promise<VacationModel> {
        const response = await axios.get<VacationModel>(`${appConfig.vacationsUrl}/${vacationId}`);
        return response.data;
    }

    // Get all likes of all users:
    public async getAllLikes(): Promise<LikeModel[]> {
        const response = await axios.get<LikeModel[]>(appConfig.likesUrl);
        return response.data;
    }

    // Add a vacation (admin only) - sent as FormData because it includes the image file:
    public async addVacation(vacation: VacationFormModel, image: File): Promise<VacationModel> {
        const formData = formUtil.toFormData(vacation, image);
        const response = await axios.post<VacationModel>(appConfig.vacationsUrl, formData);
        return response.data;
    }

    // Update a vacation (admin only) - the image is optional (the server keeps the old one if none is sent):
    public async updateVacation(vacationId: number, vacation: VacationFormModel, image?: File): Promise<VacationModel> {
        const formData = formUtil.toFormData(vacation, image);
        const response = await axios.put<VacationModel>(`${appConfig.vacationsUrl}/${vacationId}`, formData);
        return response.data;
    }

    // Delete a vacation (admin only):
    public async deleteVacation(vacationId: number): Promise<void> {
        await axios.delete(`${appConfig.vacationsUrl}/${vacationId}`);
    }

    // Like a vacation:
    public async likeVacation(vacationId: number): Promise<void> {
        await axios.post(`${appConfig.vacationsUrl}/${vacationId}/likes`);
    }

    // Unlike a vacation:
    public async unlikeVacation(vacationId: number): Promise<void> {
        await axios.delete(`${appConfig.vacationsUrl}/${vacationId}/likes`);
    }

}

export const vacationService = new VacationService();
