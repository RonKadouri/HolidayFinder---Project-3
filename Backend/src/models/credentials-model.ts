import z from "zod";
import { ClientError } from "./client-error";
import { StatusCode } from "./enums";

// Credentials Schema:
const CredentialsSchema = z.object({
    email: z.email().max(100),
    password: z.string().min(4).max(100)
});

// Credentials Interface (I = Interface):
type ICredentialsModel = z.infer<typeof CredentialsSchema>;

// Credentials Model:
export class CredentialsModel implements ICredentialsModel {

    public email: string;
    public password: string;

    public constructor(credentials: CredentialsModel) { // Copy Constructor
        this.email = credentials.email;
        this.password = credentials.password;
    }

    public validate(): void {
        const result = CredentialsSchema.safeParse(this);
        if (!result.success) {
            const message = result.error.issues[0].path + ": " + result.error.issues[0].message;
            throw new ClientError(StatusCode.UnprocessableContent, message);
        }
    }

}
