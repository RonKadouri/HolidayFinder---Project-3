import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { mcpRegister } from "./mcp-register";

// MCP (Model Context Protocol) is a standard way to give an AI "tools" it can use - here, tools that read our database.
// The AI never touches the database itself: it only asks for a tool by name, our server runs it and returns the result.
//
// Our MCP code is split into 4 files:
//   mcp-server.ts   - creates the MCP server and registers the tools (this file).
//   mcp-register.ts - describes each tool to the AI: its name, what it does, and what input it needs.
//   mcp-tools.ts    - what each tool actually does (calls vacationService, which runs the SQL).
//   mcp-client.ts   - connects to this server, so ai-service can list the tools and run the ones the AI asks for.
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
