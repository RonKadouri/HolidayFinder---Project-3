export enum StatusCode {

    // Success: 
    OK = 200,
    Created = 201,
    NoContent = 204,

    // Client Errors:
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    Conflict = 409,
    UnprocessableContent = 422,
    // TooManyRequests = 429,

    // Server Errors:
    InternalServerError = 500,
    ServiceUnavailable = 503

}

// Must match the roles table in the database:
export enum Role {
    User = 1,
    Admin = 2
}

