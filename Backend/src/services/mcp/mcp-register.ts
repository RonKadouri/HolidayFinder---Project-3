import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { mcpTools } from "./mcp-tools";
import z from "zod";

// Registers each tool on the MCP server. mcpServer.registerTool() takes 3 things:
//   1. uniqueName - the name the AI uses to ask for the tool, e.g. "get_average_price".
//   2. config     - description: what the AI reads to decide which tool answers the user's question,
//                   so it must be clear. inputSchema (optional): a zod schema of the input the tool needs -
//                   the AI is told to send it, and the MCP server checks it before running the tool
//                   (e.g. get_one_vacation with id "abc" is rejected).
//   3. the function that runs the tool (from mcp-tools.ts).
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
