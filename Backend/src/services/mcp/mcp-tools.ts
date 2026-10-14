// Tools to be used by the MCP server
// Tools - what the MCP server do?

import { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { vacationService } from "../vacation-service";

// Each tool is a small wrapper around vacationService:
//   1. get the data from the database (through vacationService - the same SQL the rest of the app uses),
//   2. return it as a CallToolResult - the MCP format: a list of "content" parts. We send one "text" part
//      with the data as JSON text, which the AI then reads and turns into a sentence for the user.
// If a tool throws (e.g. "Vacation 999999 not found."), the MCP server sends that message to the AI instead.
// The tools only READ data, and never the users table - so no question can reach emails or passwords.
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
