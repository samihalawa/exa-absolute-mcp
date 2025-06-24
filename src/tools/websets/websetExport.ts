import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios, { isAxiosError } from "axios";
import { API_CONFIG } from "../config.js";
import { 
  Export, 
  CreateExportInput,
  PaginatedList
} from "../../types.js";

// Schema definitions
const createExportSchema = z.object({
  websetId: z.string().describe("The ID of the webset to export"),
  format: z.enum(['csv', 'json', 'xlsx']).describe("Export format"),
  filters: z.object({
    itemIds: z.array(z.string()).optional().describe("Specific item IDs to export"),
    verificationStatus: z.enum(['verified', 'pending', 'failed']).optional().describe("Filter by verification status"),
    hasEnrichedData: z.boolean().optional().describe("Filter by enrichment status"),
    itemType: z.string().optional().describe("Filter by item type")
  }).optional().describe("Filters to apply to the export"),
  fields: z.array(z.string()).optional().describe("Specific fields to include in the export")
});

const getExportSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  exportId: z.string().describe("The ID of the export job")
});

const listExportsSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  limit: z.number().optional().default(20).describe("Number of exports to return"),
  cursor: z.string().optional().describe("Pagination cursor")
});

const deleteExportSchema = z.object({
  websetId: z.string().describe("The ID of the webset"),
  exportId: z.string().describe("The ID of the export to delete")
});

export function registerWebsetExportTools(server: McpServer, config: any) {
  // Create Export
  server.addTool({
    name: "create_export_exa",
    description: "Create an export job to download webset items in various formats",
    inputSchema: createExportSchema,
    handler: async (args) => {
      try {
        const { websetId, ...exportData } = args;
        const endpoint = API_CONFIG.ENDPOINTS.WEBSET_EXPORTS.replace(':websetId', websetId);
        
        const body: CreateExportInput = {
          format: exportData.format,
          ...(exportData.filters && { filters: exportData.filters }),
          ...(exportData.fields && { fields: exportData.fields })
        };
        
        const response = await axios.post<Export>(
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
          message: `Export created successfully. Status: ${response.data.status}`
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

  // Get Export
  server.addTool({
    name: "get_export_exa",
    description: "Get details of a specific export job including download URL when ready",
    inputSchema: getExportSchema,
    handler: async (args) => {
      try {
        const endpoint = API_CONFIG.ENDPOINTS.WEBSET_EXPORT_BY_ID
          .replace(':websetId', args.websetId)
          .replace(':exportId', args.exportId);
        
        const response = await axios.get<Export>(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          {
            headers: {
              'accept': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          success: true,
          data: response.data,
          downloadReady: response.data.status === 'completed' && !!response.data.downloadUrl
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

  // List Exports
  server.addTool({
    name: "list_exports_exa",
    description: "List all export jobs for a webset",
    inputSchema: listExportsSchema,
    handler: async (args) => {
      try {
        const { websetId, limit, cursor } = args;
        const endpoint = API_CONFIG.ENDPOINTS.WEBSET_EXPORTS.replace(':websetId', websetId);
        
        const params: Record<string, any> = { limit };
        if (cursor) params.cursor = cursor;
        
        const response = await axios.get<PaginatedList<Export>>(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          {
            headers: {
              'accept': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            },
            params
          }
        );
        
        return {
          success: true,
          data: response.data.data,
          hasMore: response.data.hasMore,
          nextCursor: response.data.nextCursor,
          summary: {
            total: response.data.data.length,
            completed: response.data.data.filter(e => e.status === 'completed').length,
            pending: response.data.data.filter(e => e.status === 'pending').length,
            processing: response.data.data.filter(e => e.status === 'processing').length,
            failed: response.data.data.filter(e => e.status === 'failed').length
          }
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

  // Delete Export
  server.addTool({
    name: "delete_export_exa",
    description: "Delete an export job and its associated files",
    inputSchema: deleteExportSchema,
    handler: async (args) => {
      try {
        const endpoint = API_CONFIG.ENDPOINTS.WEBSET_EXPORT_BY_ID
          .replace(':websetId', args.websetId)
          .replace(':exportId', args.exportId);
        
        await axios.delete(
          `${API_CONFIG.BASE_URL}${endpoint}`,
          {
            headers: {
              'accept': 'application/json',
              'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
            }
          }
        );
        
        return {
          success: true,
          message: 'Export deleted successfully'
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