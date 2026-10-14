export type VacationModel = {
    id: number;
    destination: string;
    description: string;
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
    price: number;
    imageName: string;
}

// The fields an admin fills in when adding or editing a vacation (the image file is sent separately):
export type VacationFormModel = Omit<VacationModel, "id" | "imageName">;
