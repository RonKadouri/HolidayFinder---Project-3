import { QueryError, ResultSetHeader } from "mysql2";
import { ClientError } from "../models/client-error";
import { CredentialsModel } from "../models/credentials-model";
import { Role, StatusCode } from "../models/enums";
import { UserModel } from "../models/user-model";
import { cyber } from "../utils/cyber";
import { dal } from "../utils/dal";

// Logic:
class AuthService {

    // Register a new user and return a token:
    public async register(user: UserModel): Promise<string> {

        // Validate:
        user.validate();

        // New users are always regular users - never trust a role sent by the client:
        const sql = "INSERT INTO users (firstName, lastName, email, password, roleId) VALUES (?, ?, ?, ?, ?)";
        const values = [user.firstName, user.lastName, user.email, cyber.hash(user.password), Role.User];

        try {

            // Execute:
            const info = await dal.execute(sql, values) as ResultSetHeader;

            // Create the user to put in the token (without the password):
            const addedUser = {
                id: info.insertId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                roleId: Role.User
            } as UserModel;

            // Return token:
            return cyber.generateToken(addedUser);
        }
        catch (err: unknown) {

            // A database uniqueness rule rejects an email that is already registered:
            if ((err as QueryError).code === "ER_DUP_ENTRY") {
                throw new ClientError(StatusCode.Conflict, `Email ${user.email} is already registered.`);
            }

            throw err;
        }
    }

    // Login an existing user and return a token:
    public async login(credentials: CredentialsModel): Promise<string> {

        // Validate:
        credentials.validate();

        // Find the user - the password column is never selected:
        const sql = "SELECT id, firstName, lastName, email, roleId FROM users WHERE email = ? AND password = ?";
        const values = [credentials.email, cyber.hash(credentials.password)];
        const users = await dal.execute(sql, values) as UserModel[];
        const user = users[0];

        // Same message for a wrong email or a wrong password, so we don't reveal which emails exist:
        if (!user) {
            throw new ClientError(StatusCode.Unauthorized, "Incorrect email or password.");
        }

        // Return token:
        return cyber.generateToken(user);
    }

}

export const authService = new AuthService();
