import dotenv from "dotenv"; // npm install dotenv

// Loads .env values into: process.env object:
dotenv.config({ quiet: true });

class AppConfig {

    public readonly environment = process.env.ENVIRONMENT!;
    public readonly isDevelopment = this.environment === "development";
    public readonly isProduction = this.environment === "production";

    public readonly port = 4000;
    public readonly mysqlHost = process.env.MYSQL_HOST!;
    public readonly mysqlUser = process.env.MYSQL_USER!;
    public readonly mysqlPassword = process.env.MYSQL_PASSWORD!;
    public readonly mysqlDatabase = process.env.MYSQL_DATABASE!;
    public readonly jwtSecret = process.env.JWT_SECRET!;
    public readonly hashSalt = process.env.HASH_SALT!;
    public readonly openAiUrl = "https://api.openai.com/v1/chat/completions";
    public readonly openAiApiKey = process.env.OPENAI_API_KEY; // Empty = AI recommendations are turned off.
    public readonly openAiModel = process.env.OPENAI_MODEL || "gpt-5-mini";

}

export const appConfig = new AppConfig();
