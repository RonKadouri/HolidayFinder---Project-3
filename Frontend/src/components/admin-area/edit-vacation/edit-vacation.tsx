import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Role } from "../../../models/role";
import { VacationFormModel } from "../../../models/vacation-model";
import { AppState } from "../../../redux/store";
import { vacationService } from "../../../services/vacation-service";
import { appConfig } from "../../../utils/app-config";
import { notify } from "../../../utils/notify";
import { validationRules } from "../../../utils/validation-rules";
import "./edit-vacation.css";

type EditVacationForm = VacationFormModel & { image: FileList };

export function EditVacation() {

    const user = useSelector((state: AppState) => state.user);
    const navigate = useNavigate();
    const id = Number(useParams().id);
    const { register, handleSubmit, reset, watch, getValues, formState: { errors, isSubmitting } } = useForm<EditVacationForm>();
    const [imageUrl, setImageUrl] = useState(""); // The current image - or a preview of the new one.

    const startDate = watch("startDate");
    const imageFiles = watch("image");

    // Load the vacation and fill the form with it:
    useEffect(() => {
        if (user?.roleId !== Role.Admin) return;
        vacationService.getOneVacation(id)
            .then(vacation => {
                reset(vacation);
                setImageUrl(appConfig.vacationImagesUrl + vacation.imageName);
            })
            .catch(err => {
                notify.error(err);
                navigate("/admin");
            });
    }, [id, user, reset, navigate]);

    // Show a preview of a newly selected image:
    useEffect(() => {
        const file = imageFiles?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url); // Free the memory when another image is selected.
    }, [imageFiles]);

    // Only admins can see this page:
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.roleId !== Role.Admin) {
        return <Navigate to="/vacations" replace />;
    }

    async function send(form: EditVacationForm): Promise<void> {
        try {
            await vacationService.updateVacation(id, form, form.image?.[0]); // No new image = keep the old one.
            notify.success(`The vacation to ${form.destination} has been updated.`);
            navigate("/admin");
        }
        catch (err: unknown) {
            notify.error(err);
        }
    }

    return (
        <div className="EditVacation">

            <h2>Edit Vacation</h2>

            {/* noValidate - react-hook-form shows our messages instead of the browser's popups */}
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

                {/* Past dates are allowed here - you can edit a vacation that already ended: */}
                <label>
                    Start on
                    <input type="date" {...register("startDate", { required: "Start date is required." })} />
                </label>
                <span>{errors.startDate?.message}</span>

                {/* The end date can't be before the start date: */}
                <label>
                    End on
                    <input type="date" min={startDate} {...register("endDate", {
                        required: "End date is required.",
                        validate: value => value >= getValues("startDate") || "End date can't be before the start date."
                    })} />
                </label>
                <span>{errors.endDate?.message}</span>

                <label>
                    Price ($)
                    <input type="number" min={0} max={10000} step="0.01" {...register("price", validationRules.price)} />
                </label>
                <span>{errors.price?.message}</span>

                {/* The image is optional - without a new one, the current image stays: */}
                {imageUrl && <img className="preview" src={imageUrl} alt="Cover" />}
                <label>
                    Change image
                    <input type="file" accept="image/*" {...register("image")} />
                </label>

                <button disabled={isSubmitting}>Update</button>

                <button type="button" onClick={() => navigate("/admin")}>Cancel</button>

            </form>

        </div>
    );
}
