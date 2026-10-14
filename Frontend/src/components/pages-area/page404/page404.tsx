import { NavLink } from "react-router-dom";
import "./page404.css";

// Shown for any URL that doesn't exist:
export function Page404() {
    return (
        <div className="Page404">

            <h2>Page not found</h2>

            <p>The page you're looking for doesn't exist.</p>

            {/* "/" sends each user to the right place - guests to Login, users to Vacations, admins to Manage Vacations: */}
            <NavLink to="/">Back to the home page</NavLink>

        </div>
    );
}
