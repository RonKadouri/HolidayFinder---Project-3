import { UserModel } from "../models/user-model";
import jwt, { SignOptions } from "jsonwebtoken";
import { appConfig } from "./app-config";
import { Role, StatusCode } from "../models/enums";
import { ClientError } from "../models/client-error";
import crypto from "crypto";

class Cyber {

    // Hash password:
    public hash(plainText: string): string {

        // Create hash with salt (HMAC: Hash-based Message Authentication Code):
        const hashText = crypto.createHmac("sha512", appConfig.hashSalt).update(plainText).digest("hex");

        // Return the hashed password:
        return hashText;
    }

    // Generate new token:
    public generateToken(user: UserModel): string {

        // Remove password:
        user.password = undefined!;

        // Create payload: 
        const payload = { user };

        // Create options: 
        const options: SignOptions = { expiresIn: "3h" };

        // Generate token: 
        const token = jwt.sign(payload, appConfig.jwtSecret!, options);

        // Return token:
        return token;
    }

    // Get the logged-in user from the authorization header:
    public getUserFromHeader(authorization: string | undefined): UserModel {
        try {
            const token = authorization?.substring(7);
            const payload = jwt.verify(token!, appConfig.jwtSecret!) as { user: UserModel };
            return payload.user;
        }
        catch {
            throw new ClientError(StatusCode.Unauthorized, "You are not logged in.");
        }
    }

    // Verify token:
    public verifyToken(token: string): boolean {

        try {

            // If no token:
            if (!token) {
                return false;
            }

            // Verify token:
            jwt.verify(token, appConfig.jwtSecret!);

            // All is good - token is legal:
            return true;
        }
        catch (err: any) {
            return false; // Token not legal.
        }
    }

    // Verify admin:
    public verifyAdmin(token: string): boolean {

        try {

            // If no token:
            if (!token) {
                return false;
            }

            // Verify token:
            jwt.verify(token, appConfig.jwtSecret!);

            // Extract payload:
            const payload = jwt.decode(token) as { user: UserModel };

            // Extract user: 
            const user = payload.user;

            // If user is not admin:
            if(user.roleId !== Role.Admin) {
                return false;
            }

            // All is good - token is legal, and user is admin:
            return true;
        }
        catch (err: any) {
            return false; // Token not legal.
        }
    }

}

export const cyber = new Cyber();
