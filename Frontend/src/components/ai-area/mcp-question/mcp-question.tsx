import { useState } from "react";
import { useForm } from "react-hook-form";
import Markdown from "react-markdown";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { AppState } from "../../../redux/store";
import { aiService } from "../../../services/ai-service";
import { notify } from "../../../utils/notify";
import { Spinner } from "../../shared-area/spinner/spinner";
import "./mcp-question.css";

type QuestionForm = {
    question: string;
};

export function McpQuestion() {

    const user = useSelector((state: AppState) => state.user);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<QuestionForm>();
    const [answer, setAnswer] = useState("");

    // Only logged-in users can see this page:
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    async function send(form: QuestionForm): Promise<void> {
        try {
            setAnswer("");
            const text = await aiService.askQuestion(form.question);
            setAnswer(text);
        }
        catch (err: unknown) {
            notify.error(err);
        }
    }

    return (
        <div className="McpQuestion">

            <h2>Ask me anything about our vacations</h2>

            {/* noValidate - react-hook-form shows our messages instead of the browser's popups */}
            <form onSubmit={handleSubmit(send)} noValidate>

                <label>
                    Question
                    {/* dir="auto" - Hebrew questions show right-to-left, English left-to-right: */}
                    <textarea dir="auto" rows={5} maxLength={500} placeholder="e.g. What is the average vacation price?" {...register("question", {
                        required: "Question is required."
                    })} />
                </label>
                <span>{errors.question?.message}</span>

                <button disabled={isSubmitting}>Ask</button>

            </form>

            {isSubmitting && <Spinner />}

            {/* react-markdown shows the AI's lists properly. skipHtml drops any raw HTML in the answer: */}
            {answer && (
                <div className="answer" dir="auto">
                    <Markdown skipHtml>{answer}</Markdown>
                </div>
            )}

        </div>
    );
}
