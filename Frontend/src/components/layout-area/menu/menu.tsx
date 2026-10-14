import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { Role } from "../../../models/role";
import { AppState } from "../../../redux/store";
import "./menu.css";

// Links by role. Guests get no links here - Register and Login are in the header (AuthMenu), as is the user's name with Logout.
export function Menu() {

    const user = useSelector((state: AppState) => state.user);
    const isAdmin = user?.roleId === Role.Admin;

    return (
        <div className="Menu">

            {/* Regular users: */}
            {user && !isAdmin && (
                <>
                    <NavLink to="/vacations" end>Vacations</NavLink>

                    <NavLink to="/ai-recommendation">AI Recommendation</NavLink>

                    <NavLink to="/ask-question">Ask a Question</NavLink>
                </>
            )}

            {/* Admins: */}
            {isAdmin && (
                <>
                    <NavLink to="/admin" end>Manage Vacations</NavLink>

                    <NavLink to="/admin/add">Add Vacation</NavLink>

                    <NavLink to="/admin/reports">Reports</NavLink>
                </>
            )}

        </div>
    );
}
