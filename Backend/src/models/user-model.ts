import z from "zod";
import { ClientError } from "./client-error";
import { Role, StatusCode } from "./enums";

// User Schema:
const UserSchema = z.object({
    id: z.number().int().positive().optional(),
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.email().max(100),
    password: z.string().min(4).max(100),
    roleId: z.enum(Role).optional()
});

// User Interface (I = Interface):
type IUserModel = z.infer<typeof UserSchema>;

// User Model:
export class UserModel implements IUserModel {

    public id: number;
    public firstName: string;
    public lastName: string;
    public email: string;
    public password: string;
    public roleId: Role;

    public constructor(user: UserModel) { // Copy Constructor
        this.id = user.id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.password = user.password;
        this.roleId = user.roleId;
    }

    public validate(): void {
        const result = UserSchema.safeParse(this);
        if (!result.success) {
            const message = result.error.issues[0].path + ": " + result.error.issues[0].message;
            throw new ClientError(StatusCode.UnprocessableContent, message);
        }
    }

}
