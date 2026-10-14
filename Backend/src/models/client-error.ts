import { StatusCode } from "./enums";

// Extends Error so libraries (like the MCP server) can read its message:
export class ClientError extends Error {

    public readonly status: StatusCode;

    public constructor(status: StatusCode, message: string) {
        super(message);
        this.status = status;
    }

}