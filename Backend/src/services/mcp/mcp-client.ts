import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { holidayMcpServer } from "./mcp-server";

// Describes a tool in the format expected by OpenAI.
export type OpenAiTool = {
    type: "function";
    function: { name: string; description?: string; parameters: object };
};

// Connects to the MCP server and lets the AI service discover and run tools.
// The client and server communicate in memory inside the backend.
class McpClient {

    private clientPromise?: Promise<Client>;

    // Connect once, on first use - every question after that reuses the same connection:
    private getClient(): Promise<Client> {
        if (!this.clientPromise) {
            this.clientPromise = this.connect().catch(err => {
                this.clientPromise = undefined; // Let the next question try again.
                throw err;
            });
        }
        return this.clientPromise;
    }

    // Create the server, create a linked pair of transports (whatever one side sends, the other receives),
    // and connect the server to one end and the client to the other:
    private async connect(): Promise<Client> {
        const mcpServer = holidayMcpServer.create();
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        await mcpServer.connect(serverTransport);
        const client = new Client({ name: "holiday-finder-backend", version: "1.0.0" });
        await client.connect(clientTransport);
        return client;
    }

    // Get the available tools and convert their descriptions for OpenAI:
    public async getOpenAiTools(): Promise<OpenAiTool[]> {
        const client = await this.getClient();
        const { tools } = await client.listTools();
        return tools.map(tool => ({
            type: "function",
            function: { name: tool.name, description: tool.description, parameters: tool.inputSchema }
        }));
    }

    // Run a requested tool and return its text result:
    public async callTool(name: string, args: Record<string, unknown>): Promise<string> {
        const client = await this.getClient();
        const result = await client.callTool({ name, arguments: args });
        const content = result.content as { type: string; text?: string }[];
        return content.map(part => part.text ?? "").join("\n");
    }

}

export const mcpClient = new McpClient();
