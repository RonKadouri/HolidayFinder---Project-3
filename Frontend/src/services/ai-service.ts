import axios from "axios";
import { appConfig } from "../utils/app-config";

class AiService {

    // Get an AI vacation recommendation (Markdown text) for a destination:
    public async getRecommendation(destination: string): Promise<string> {
        const response = await axios.post<string>(appConfig.aiRecommendationUrl, { destination });
        return response.data;
    }

    // Ask a question about the vacations - the backend answers it using its MCP server:
    public async askQuestion(question: string): Promise<string> {
        const response = await axios.post<string>(appConfig.mcpQuestionUrl, { question });
        return response.data;
    }

}

export const aiService = new AiService();
