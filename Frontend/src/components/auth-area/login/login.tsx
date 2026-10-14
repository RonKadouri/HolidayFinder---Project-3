import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { CredentialsModel } from "../../../models/credentials-model";
import { Role } from "../../../models/role";
import { authService } from "../../../services/auth-service";
import { notify } from "../../../utils/notify";
import { validationRules } from "../../../utils/validation-rules";

export function Login() {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CredentialsModel>();
    const navigate = useNavigate();

    async function send(credentials: CredentialsModel): Promise<void> {
        try {
            const user = await authService.login(credentials);
            notify.success("Welcome back!");
            navigate(user.roleId === Role.Admin ? "/admin" : "/vacations");
        }
        catch (err: unknown) {
            notify.error(err); // e.g. "Incorrect email or password."
        }
    }

    return (
        <div className="Login">

            <h2>Login</h2>

            {/* noValidate - react-hook-form shows our messages instead of the browser's popups */}
            <form onSubmit={handleSubmit(send)} noValidate>

                <div>
                    <label>Email: <input type="email" autoComplete="email" maxLength={100} {...register("email", validationRules.email)} /></label>
                    <span> {errors.email?.message}</span>
                </div>

                <div>
                    <label>Password: <input type="password" autoComplete="current-password" maxLength={100} {...register("password", validationRules.password)} /></label>
                    <span> {errors.password?.message}</span>
                </div>

                <button disabled={isSubmitting}>Login</button>

            </form>

            <p>Don't have an account? <NavLink to="/register">Register</NavLink></p>

        </div>
    );
}
