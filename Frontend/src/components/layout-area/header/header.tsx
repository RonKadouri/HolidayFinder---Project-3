import { AuthMenu } from "../../auth-area/auth-menu/auth-menu";
import "./header.css";

export function Header() {
    return (
        <div className="Header">

			<h1>Holiday Finder</h1>

            <AuthMenu />

        </div>
    );
}
