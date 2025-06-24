import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios, { isAxiosError } from "axios";
import { API_CONFIG } from "../config.js";
import { 
  WebsetItem,
  BatchUpdateItemsInput,
  BatchDeleteItemsInput,
  UpdateItemInput
} from "../../types.js";

// Schema definitions
const batchUpdateItemsSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  itemIds: z.array(z.string()).describe("Array of item IDs to update"),
  updates: z.object({
    metadata: z.record(z.string()).optional().describe("Metadata to add/update"),
    addTags: z.array(z.string()).optional().describe("Tags to add"),
    removeTags: z.array(z.string()).optional().describe("Tags to remove"),
    customFields: z.record(z.any()).optional().describe("Custom fields to update")
  }).describe("Updates to apply to all items")
});

const batchDeleteItemsSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  itemIds: z.array(z.string()).describe("Array of item IDs to delete")
});

const updateItemSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  itemId: z.string().describe("The ID of the item to update"),
  metadata: z.record(z.string()).optional().describe("Metadata to update"),
  verification: z.object({
    status: z.enum(['verified', 'pending', 'failed']).describe("Verification status"),
    reasoning: z.string().optional().describe("Reasoning for verification status")
  }).optional().describe("Verification status update"),
  customFields: z.record(z.any()).optional().describe("Custom fields to update")
});

const batchVerifyItemsSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  itemIds: z.array(z.string()).describe("Array of item IDs to verify"),
  status: z.enum(['verified', 'pending', 'failed']).describe("Verification status to set"),
  reasoning: z.string().optional().describe("Reasoning for bulk verification")
});

export function registerWebsetBatchTools(server: McpServer, config: any) {
  // Update Single Item
  server.addTool({
    name: "update_webset_item_exa",
    description: "Update a single webset item's metadata, verification status, or custom fields",
    inputSchema: updateItemSchema,
    handler: async (args) => {
      try {
        const { websetId, itemId, ...updateData } = args;
        const endpoint = API_CONFIG.ENDPOINTS.WEBSET_ITEM_BY_ID
          .replace(':websetId', websetId)
          .replace(':itemId', itemId);
        
        const body: UpdateItemInput = {
          ...(updateData.metadata && { metadata: updateData.metadata }),
          ...(updateData.verification && { verification: updateData.verification }),
          ...(updateData.customFields && { customFields: updateData.customFields })
        };
        
        const response = await axios.patch<WebsetItem>(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          body,
          {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          success: true,
          data: response.data,
          message: 'Item updated successfully'
        };
      } catch (error) {
        if (isAxiosError(error)) {
          return {
            success: false,
            error: error.response?.data?.error || error.message,
            details: error.response?.data
          };
        }
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  });

  // Batch Update Items
  server.addTool({
    name: "batch_update_items_exa",
    description: "Update multiple webset items at once with the same changes",
    inputSchema: batchUpdateItemsSchema,
    handler: async (args) => {
      try {
        const { websetId, itemIds, updates } = args;
        const endpoint = `${API_CONFIG.ENDPOINTS.WEBSET_ITEMS}/batch-update`
          .replace(':websetId', websetId);
        
        const body: BatchUpdateItemsInput = {
          itemIds,
          updates
        };
        
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          body,
          {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          success: true,
          data: response.data,
          message: `Successfully updated ${itemIds.length} items`
        };
      } catch (error) {
        if (isAxiosError(error)) {
          return {
            success: false,
            error: error.response?.data?.error || error.message,
            details: error.response?.data
          };
        }
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  });

  // Batch Delete Items
  server.addTool({
    name: "batch_delete_items_exa",
    description: "Delete multiple webset items at once",
    inputSchema: batchDeleteItemsSchema,
    handler: async (args) => {
      try {
        const { websetId, itemIds } = args;
        const endpoint = `${API_CONFIG.ENDPOINTS.WEBSET_ITEMS}/batch-delete`
          .replace(':websetId', websetId);
        
        const body: BatchDeleteItemsInput = {
          itemIds
        };
        
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          body,
          {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          success: true,
          data: response.data,
          message: `Successfully deleted ${itemIds.length} items`
        };
      } catch (error) {
        if (isAxiosError(error)) {
          return {
            success: false,
            error: error.response?.data?.error || error.message,
            details: error.response?.data
          };
        }
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  });

  // Batch Verify Items
  server.addTool({
    name: "batch_verify_items_exa",
    description: "Verify or update verification status for multiple items at once",
    inputSchema: batchVerifyItemsSchema,
    handler: async (args) => {
      try {
        const { websetId, itemIds, status, reasoning } = args;
        const endpoint = `${API_CONFIG.ENDPOINTS.WEBSET_ITEMS}/batch-verify`
          .replace(':websetId', websetId);
        
        const body = {
          itemIds,
          verification: {
            status,
            ...(reasoning && { reasoning })
          }
        };
        
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          body,
          {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          success: true,
          data: response.data,
          message: `Successfully updated verification status for ${itemIds.length} items`
        };
      } catch (error) {
        if (isAxiosError(error)) {
          return {
            success: false,
            error: error.response?.data?.error || error.message,
            details: error.response?.data
          };
        }
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  });
}