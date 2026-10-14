import { NavLink } from "react-router-dom";
import "./page404.css";

// Shown when a page cannot be found:
export function Page404() {
    return (
        <div className="Page404">

            <h2>Page not found</h2>

            <p>The page you're looking for doesn't exist.</p>

            {/* Send each user to the page that matches their role. */}
            <NavLink to="/">Back to the home page</NavLink>

        </div>
    );
}
