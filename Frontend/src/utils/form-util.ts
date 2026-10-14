import { VacationFormModel } from "../models/vacation-model";

class FormUtil {

    // Convert a vacation into FormData, so we could send also the image (optional when editing):
    public toFormData(vacation: VacationFormModel, image?: File): FormData {
        const vacationFormData = new FormData();
        vacationFormData.append("destination", vacation.destination);
        vacationFormData.append("description", vacation.description);
        vacationFormData.append("startDate", vacation.startDate);
        vacationFormData.append("endDate", vacation.endDate);
        vacationFormData.append("price", vacation.price.toString());
        if (image) {
            vacationFormData.append("image", image);
        }
        return vacationFormData;
    }

}

export const formUtil = new FormUtil();
