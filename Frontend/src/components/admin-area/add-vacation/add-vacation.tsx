import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { Role } from "../../../models/role";
import { VacationFormModel } from "../../../models/vacation-model";
import { AppState } from "../../../redux/store";
import { vacationService } from "../../../services/vacation-service";
import { getToday } from "../../../utils/date-util";
import { notify } from "../../../utils/notify";
import { validationRules } from "../../../utils/validation-rules";
import "./add-vacation.css";

type AddVacationForm = VacationFormModel & { image: FileList };

export function AddVacation() {

    const user = useSelector((state: AppState) => state.user);
    const navigate = useNavigate();
    const { register, handleSubmit, watch, getValues, formState: { errors, isSubmitting } } = useForm<AddVacationForm>();
    const [previewUrl, setPreviewUrl] = useState("");

    const today = getToday();
    const startDate = watch("startDate");
    const imageFiles = watch("image");

    // Show a preview of the selected image:
    useEffect(() => {
        const file = imageFiles?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url); // Free the memory when another image is selected.
    }, [imageFiles]);

    // Only admins can see this page:
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.roleId !== Role.Admin) {
        return <Navigate to="/vacations" replace />;
    }

    async function send(form: AddVacationForm): Promise<void> {
        try {
            await vacationService.addVacation(form, form.image[0]);
            notify.success(`The vacation to ${form.destination} has been added.`);
            navigate("/admin");
        }
        catch (err: unknown) {
            notify.error(err);
        }
    }

    return (
        <div className="AddVacation">

            <h2>Add Vacation</h2>

            {/* Form validation messages appear on the page. */}
            <form onSubmit={handleSubmit(send)} noValidate>

                <label>
                    Destination
                    <input type="text" maxLength={100} {...register("destination", validationRules.destination)} />
                </label>
                <span>{errors.destination?.message}</span>

                <label>
                    Description
                    <textarea rows={5} maxLength={1000} {...register("description", validationRules.description)} />
                </label>
                <span>{errors.description?.message}</span>

                {/* The date picker doesn't allow past dates. */}
                <label>
                    Start on
                    <input type="date" min={today} {...register("startDate", {
                        required: "Start date is required.",
                        validate: value => value >= today || "Can't choose a past date."
                    })} />
                </label>
                <span>{errors.startDate?.message}</span>

                {/* The end date can't be before the start date: */}
                <label>
                    End on
                    <input type="date" min={startDate || today} {...register("endDate", {
                        required: "End date is required.",
                        validate: value => value >= (getValues("startDate") || today) || "End date can't be before the start date."
                    })} />
                </label>
                <span>{errors.endDate?.message}</span>

                <label>
                    Price ($)
                    <input type="number" min={0} max={10000} step="0.01" {...register("price", validationRules.price)} />
                </label>
                <span>{errors.price?.message}</span>

                <label>
                    Cover image
                    <input type="file" accept="image/*" {...register("image", validationRules.image)} />
                </label>
                {previewUrl && <img className="preview" src={previewUrl} alt="Selected cover" />}
                <span>{errors.image?.message}</span>

                <button disabled={isSubmitting}>Add Vacation</button>

                <button type="button" onClick={() => navigate("/admin")}>Cancel</button>

            </form>

        </div>
    );
}
