class AppConfig {
    public readonly registerUrl = "http://localhost:4000/api/register";
    public readonly loginUrl = "http://localhost:4000/api/login";
    public readonly vacationsUrl = "http://localhost:4000/api/vacations";
    public readonly vacationImagesUrl = "http://localhost:4000/api/vacations/images/";
    public readonly likesUrl = "http://localhost:4000/api/likes";
    public readonly aiRecommendationUrl = "http://localhost:4000/api/ai/recommendation";
    public readonly mcpQuestionUrl = "http://localhost:4000/api/ai/mcp-question";

}

export const appConfig = new AppConfig();
