import { useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { AppState } from "../../../redux/store";
import { aiService } from "../../../services/ai-service";
import { notify } from "../../../utils/notify";
import { Spinner } from "../../shared-area/spinner/spinner";
import "./ai-recommendation.css";

type RecommendationForm = {
    destination: string;
};

export function AiRecommendation() {

    const user = useSelector((state: AppState) => state.user);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RecommendationForm>();
    const [recommendation, setRecommendation] = useState("");

    // Only logged-in users can see this page:
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    async function send(form: RecommendationForm): Promise<void> {
        try {
            setRecommendation("");
            const text = await aiService.getRecommendation(form.destination);
            setRecommendation(text);
        }
        catch (err: unknown) {
            notify.error(err);
        }
    }

    return (
        <div className="AiRecommendation">

            <h2>AI Recommendation</h2>

            {/* Form validation messages appear on the page. */}
            <form onSubmit={handleSubmit(send)} noValidate>

                <label>
                    Destination
                    <input type="text" maxLength={100} placeholder="e.g. Rhodes" {...register("destination", {
                        required: "Destination is required.",
                        minLength: { value: 2, message: "Destination must be at least 2 characters." }
                    })} />
                </label>
                <span>{errors.destination?.message}</span>

                <button disabled={isSubmitting}>Get Recommendation</button>

            </form>

            {isSubmitting && <Spinner />}

            {/* Render the AI's formatted answer while ignoring raw HTML. */}
            {recommendation && (
                <div className="recommendation">
                    <Markdown skipHtml>{recommendation}</Markdown>
                </div>
            )}

        </div>
    );
}
