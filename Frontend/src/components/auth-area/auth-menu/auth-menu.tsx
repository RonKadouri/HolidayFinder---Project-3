import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { AppState } from "../../../redux/store";
import { authService } from "../../../services/auth-service";
import { notify } from "../../../utils/notify";

export function AuthMenu() {

    const user = useSelector((state: AppState) => state.user);
    const navigate = useNavigate();

    function logout(): void {
        authService.logout();
        notify.success("You have been logged out.");
        navigate("/login");
    }

    // Nobody is logged in:
    if (!user) {
        return (
            <div className="AuthMenu">
                <NavLink to="/register">Register</NavLink> | <NavLink to="/login">Login</NavLink>
            </div>
        );
    }

    // A user is logged in:
    return (
        <div className="AuthMenu">
            <span>Hello {user.firstName} {user.lastName}</span> | <button onClick={logout}>Logout</button>
        </div>
    );
}
