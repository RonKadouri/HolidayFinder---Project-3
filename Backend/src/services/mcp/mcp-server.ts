import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { mcpRegister } from "./mcp-register";

// Provides the AI with tools for reading vacation data.
// The backend runs each requested operation and returns its result; the AI does not access the database directly.
class HolidayMcpServer {

    public create(): McpServer {

        // Create mcp server:
        const mcpServer = new McpServer({
            name: "holiday-finder-mcp-server",
            version: "1.0.0"
        });

        // Register tools:
        mcpRegister.registerGetAllVacationsTool(mcpServer);
        mcpRegister.registerGetOneVacationTool(mcpServer);
        mcpRegister.registerGetActiveVacationsTool(mcpServer);
        mcpRegister.registerGetFutureVacationsTool(mcpServer);
        mcpRegister.registerGetAveragePriceTool(mcpServer);
        mcpRegister.registerGetLikesPerVacationTool(mcpServer);

        // Return the mcp server object:
        return mcpServer;
    }

}

export const holidayMcpServer = new HolidayMcpServer();
