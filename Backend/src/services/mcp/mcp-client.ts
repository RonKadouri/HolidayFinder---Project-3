import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { holidayMcpServer } from "./mcp-server";

// An MCP tool in the format OpenAI expects ("function calling") - the same name, description and input schema,
// just arranged the way OpenAI's API wants them:
export type OpenAiTool = {
    type: "function";
    function: { name: string; description?: string; parameters: object };
};

// The MCP client - the part that talks to our MCP server. MCP always works in pairs: a server that has tools,
// and a client that asks it "which tools do you have?" (listTools) and "run this tool" (callTool).
// A "transport" is how their messages travel - over the network (HTTP), or, like here, in memory:
// both live inside this backend, so they're connected directly - no network, no extra port, no extra requests.
// ai-service uses this client to give OpenAI the tool list and to run the tools OpenAI asks for.
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

    // Ask the MCP server which tools it has, and convert them to OpenAI's format.
    // tool.inputSchema is already a JSON schema (the MCP server converts our zod schemas), so OpenAI can use it as is:
    public async getOpenAiTools(): Promise<OpenAiTool[]> {
        const client = await this.getClient();
        const { tools } = await client.listTools();
        return tools.map(tool => ({
            type: "function",
            function: { name: tool.name, description: tool.description, parameters: tool.inputSchema }
        }));
    }

    // Run one tool on the MCP server and return its text result (the JSON text that mcp-tools.ts created).
    // name and args come from OpenAI, e.g. name "get_one_vacation", args { id: 5 }:
    public async callTool(name: string, args: Record<string, unknown>): Promise<string> {
        const client = await this.getClient();
        const result = await client.callTool({ name, arguments: args });
        const content = result.content as { type: string; text?: string }[];
        return content.map(part => part.text ?? "").join("\n");
    }

}

export const mcpClient = new McpClient();
