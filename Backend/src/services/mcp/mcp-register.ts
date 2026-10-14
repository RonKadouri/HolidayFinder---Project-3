import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { mcpTools } from "./mcp-tools";
import z from "zod";

// Registers the available tools with clear descriptions and validated inputs.
class McpRegister {

    public registerGetAllVacationsTool(mcpServer: McpServer): void {
        const uniqueName = "get_all_vacations";
        const config = {
            description: "Get all database vacations (destination, description, start and end dates, price in USD), sorted by start date."
        };
        mcpServer.registerTool(uniqueName, config, mcpTools.getAllVacationsTool);
    }

    public registerGetOneVacationTool(mcpServer: McpServer): void {
        const uniqueName = "get_one_vacation";
        const config = {
            description: "Get database vacation by given id.",
            inputSchema: z.object({ id: z.number() })
        };
        mcpServer.registerTool(uniqueName, config, mcpTools.getOneVacationTool);
    }

    public registerGetActiveVacationsTool(mcpServer: McpServer): void {
        const uniqueName = "get_active_vacations";
        const config = {
            description: "Get the vacations that are active right now - already started and not ended yet."
        };
        mcpServer.registerTool(uniqueName, config, mcpTools.getActiveVacationsTool);
    }

    public registerGetFutureVacationsTool(mcpServer: McpServer): void {
        const uniqueName = "get_future_vacations";
        const config = {
            description: "Get the future vacations - the ones that haven't started yet. Each destination includes its country."
        };
        mcpServer.registerTool(uniqueName, config, mcpTools.getFutureVacationsTool);
    }

    public registerGetAveragePriceTool(mcpServer: McpServer): void {
        const uniqueName = "get_average_price";
        const config = {
            description: "Get the average price (USD) of all vacations."
        };
        mcpServer.registerTool(uniqueName, config, mcpTools.getAveragePriceTool);
    }

    public registerGetLikesPerVacationTool(mcpServer: McpServer): void {
        const uniqueName = "get_likes_per_vacation";
        const config = {
            description: "Get how many likes each vacation got from the users."
        };
        mcpServer.registerTool(uniqueName, config, mcpTools.getLikesPerVacationTool);
    }

}

export const mcpRegister = new McpRegister();
