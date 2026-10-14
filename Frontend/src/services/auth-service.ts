import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { CredentialsModel } from "../models/credentials-model";
import { UserModel } from "../models/user-model";
import { store } from "../redux/store";
import { initUser, logoutUser } from "../redux/user-slice";
import { appConfig } from "../utils/app-config";

// What the backend puts inside the token:
type TokenPayload = {
    user: UserModel;
    exp: number; // Expiration time, in seconds.
};

class AuthService {

    // Stay logged in after a page refresh - as long as the saved token hasn't expired:
    public constructor() {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            this.saveToken(token);
        }
        catch {
            this.logout(); // Expired or not a valid token.
        }
    }

    // Register a new user:
    public async register(user: UserModel): Promise<void> {
        const response = await axios.post<string>(appConfig.registerUrl, user);
        this.saveToken(response.data);
    }

    // Login an existing user (returns the user, so the caller can redirect by role):
    public async login(credentials: CredentialsModel): Promise<UserModel> {
        const response = await axios.post<string>(appConfig.loginUrl, credentials);
        return this.saveToken(response.data);
    }

    // Logout:
    public logout(): void {
        localStorage.removeItem("token");
        store.dispatch(logoutUser());
    }

    // Save the token (the interceptor sends it with every request) and put its user in the global state:
    private saveToken(token: string): UserModel {
        const { user, exp } = jwtDecode<TokenPayload>(token);

        if (exp * 1000 < Date.now()) {
            throw new Error("Token expired."); // The constructor catches it and logs out.
        }

        localStorage.setItem("token", token);
        store.dispatch(initUser(user));
        return user;
    }

}

export const authService = new AuthService();
