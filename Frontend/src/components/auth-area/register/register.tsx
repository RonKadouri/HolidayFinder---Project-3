import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { UserModel } from "../../../models/user-model";
import { authService } from "../../../services/auth-service";
import { notify } from "../../../utils/notify";
import { validationRules } from "../../../utils/validation-rules";

export function Register() {

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserModel>();
    const navigate = useNavigate();

    async function send(user: UserModel): Promise<void> {
        try {
            await authService.register(user);
            notify.success(`Welcome ${user.firstName}!`);
            navigate("/vacations");
        }
        catch (err: unknown) {
            notify.error(err); // e.g. "Email ... is already registered."
        }
    }

    return (
        <div className="Register">

            <h2>Register</h2>

            {/* Form validation messages appear on the page. */}
            <form onSubmit={handleSubmit(send)} noValidate>

                <div>
                    <label>First name: <input type="text" autoComplete="given-name" maxLength={50} {...register("firstName", validationRules.firstName)} /></label>
                    <span> {errors.firstName?.message}</span>
                </div>

                <div>
                    <label>Last name: <input type="text" autoComplete="family-name" maxLength={50} {...register("lastName", validationRules.lastName)} /></label>
                    <span> {errors.lastName?.message}</span>
                </div>

                <div>
                    <label>Email: <input type="email" autoComplete="email" maxLength={100} {...register("email", validationRules.email)} /></label>
                    <span> {errors.email?.message}</span>
                </div>

                <div>
                    <label>Password: <input type="password" autoComplete="new-password" maxLength={100} {...register("password", validationRules.password)} /></label>
                    <span> {errors.password?.message}</span>
                </div>

                <button disabled={isSubmitting}>Register</button>

            </form>

            <p>Already have an account? <NavLink to="/login">Login</NavLink></p>

        </div>
    );
}
