// Tools to be used by the MCP server
// Tools - what the MCP server do?

import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { vacationService } from "../vacation-service";

// Each tool reads vacation data through the existing service layer and returns it to the AI as text.
// Errors are passed back to the AI. These tools do not read user account data.
class McpTools {

    public async getAllVacationsTool(): Promise<CallToolResult> {
        console.log("Using tool: getAllVacationsTool");
        const vacations = await vacationService.getAllVacations();
        const result: CallToolResult = {
            content: [{
                type: "text",
                text: JSON.stringify(vacations)
            }]
        };
        return result;
    }

    public async getOneVacationTool(args: { id: number }): Promise<CallToolResult> {
        console.log("Using tool: getOneVacationTool");
        const vacation = await vacationService.getOneVacation(args.id);
        const result: CallToolResult = {
            content: [{
                type: "text",
                text: JSON.stringify(vacation)
            }]
        };
        return result;
    }

    public async getActiveVacationsTool(): Promise<CallToolResult> {
        console.log("Using tool: getActiveVacationsTool");
        const vacations = await vacationService.getActiveVacations();
        const result: CallToolResult = {
            content: [{
                type: "text",
                text: JSON.stringify(vacations)
            }]
        };
        return result;
    }

    public async getFutureVacationsTool(): Promise<CallToolResult> {
        console.log("Using tool: getFutureVacationsTool");
        const vacations = await vacationService.getFutureVacations();
        const result: CallToolResult = {
            content: [{
                type: "text",
                text: JSON.stringify(vacations)
            }]
        };
        return result;
    }

    public async getAveragePriceTool(): Promise<CallToolResult> {
        console.log("Using tool: getAveragePriceTool");
        const averagePrice = await vacationService.getAveragePrice();
        const result: CallToolResult = {
            content: [{
                type: "text",
                text: JSON.stringify({ averagePrice })
            }]
        };
        return result;
    }

    public async getLikesPerVacationTool(): Promise<CallToolResult> {
        console.log("Using tool: getLikesPerVacationTool");
        const likesPerVacation = await vacationService.getLikesPerVacation();
        const result: CallToolResult = {
            content: [{
                type: "text",
                text: JSON.stringify(likesPerVacation)
            }]
        };
        return result;
    }

}

export const mcpTools = new McpTools();
