import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import dotenv from 'dotenv';

dotenv.config();

// MOCK data for when we don't have a real Swiggy token
const MOCK_PRODUCTS = {
    "chicken": { id: "p1", name: "Fresh Chicken Breast", price: 250, unit: "500g" },
    "ginger garlic paste": { id: "p2", name: "Dabur Ginger Garlic Paste", price: 40, unit: "200g" },
    "biryani masala": { id: "p3", name: "Everest Shahi Biryani Masala", price: 65, unit: "50g" },
    "shah jeera": { id: "p4", name: "Catch Shah Jeera", price: 80, unit: "50g" },
    "mint leaves": { id: "p5", name: "Fresh Pudina/Mint Leaves", price: 15, unit: "1 bunch" },
    "coriander leaves": { id: "p6", name: "Fresh Coriander", price: 20, unit: "1 bunch" },
    "yogurt": { id: "p7", name: "Amul Masti Dahi", price: 35, unit: "400g" },
    "ghee": { id: "p8", name: "Aashirvaad Svasti Pure Cow Ghee", price: 290, unit: "500ml" },
    "saffron": { id: "p9", name: "Baby Brand Saffron", price: 150, unit: "1g" },
};

export class SwiggyMcpClient {
    constructor() {
        this.client = null;
        this.transport = null;
        this.isMock = !process.env.SWIGGY_BUILDERS_TOKEN;
        this.mockCart = [];
    }

    async connect() {
        if (this.isMock) {
            console.log("Using Mock Swiggy MCP Client");
            return;
        }

        try {
            const url = new URL("https://mcp.swiggy.com/im");
            // Append auth token if required as query or header depending on protocol spec
            this.transport = new SSEClientTransport(url, {
                headers: {
                    Authorization: `Bearer ${process.env.SWIGGY_BUILDERS_TOKEN}`
                }
            });
            this.client = new Client({ name: "instachef-agent", version: "1.0.0" }, { capabilities: {} });
            await this.client.connect(this.transport);
            console.log("Connected to Swiggy MCP");
        } catch (error) {
            console.error("Failed to connect to Swiggy MCP, falling back to mock", error);
            this.isMock = true;
        }
    }

    async searchProducts(query, location = "default") {
        if (this.isMock) {
            // Find a product that vaguely matches
            const matchKey = Object.keys(MOCK_PRODUCTS).find(k => query.toLowerCase().includes(k));
            if (matchKey) {
                return [MOCK_PRODUCTS[matchKey]];
            }
            // Generic fallback mock product
            return [{ id: `mock-${Date.now()}`, name: `${query} (Generic)`, price: 100, unit: "1 pack" }];
        }

        const result = await this.client.callTool({
            name: "search_products",
            arguments: { query, location }
        });
        return result.content[0].text; // Parse JSON in real app
    }

    async updateCart(items) {
        if (this.isMock) {
            this.mockCart = items;
            const total = items.reduce((acc, item) => acc + item.price, 0);
            return { status: "success", cartId: "mock-cart-123", total, items };
        }

        const result = await this.client.callTool({
            name: "update_cart",
            arguments: { items }
        });
        return result.content[0].text;
    }
}
