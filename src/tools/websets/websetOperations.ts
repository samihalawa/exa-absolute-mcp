import { z } from "zod";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { API_CONFIG } from "../config.js";
import { 
  Import, ImportInput, UpdateImportInput, PaginatedImportList,
  Monitor, MonitorRun, CreateMonitorInput, UpdateMonitorInput, PaginatedMonitorList,
  Webhook, CreateWebhookInput, UpdateWebhookInput, PaginatedWebhookList,
  WebhookAttempt, PaginatedWebhookAttemptList,
  Event, EventType, PaginatedEventList, PaginatedList
} from "../../types.js";
import { createRequestLogger } from "../../utils/logger.js";

export function registerWebsetOperationTools(server: McpServer, config?: { exaApiKey?: string }): void {
  // ===== IMPORT TOOLS =====
  
  // Create Import Tool
  server.tool(
    "create_import_exa",
    "Create a new import job to load data from external sources (CSV, JSON) into a Webset.",
    {
      sourceUrl: z.string().describe("URL of the data file to import"),
      fileType: z.enum(['csv', 'json', 'txt']).optional().describe("Type of file being imported"),
      websetId: z.string().optional().describe("Target Webset ID (if importing into existing Webset)"),
      metadata: z.record(z.string()).optional().describe("Key-value metadata")
    },
    async (args) => {
      const requestId = `create_import_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'create_import_exa');
      
      logger.start('Creating import job');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const requestBody: ImportInput = {
          sourceUrl: args.sourceUrl,
          ...(args.fileType && { fileType: args.fileType }),
          ...(args.websetId && { websetId: args.websetId }),
          ...(args.metadata && { metadata: args.metadata })
        };
        
        const response = await axiosInstance.post<Import>(
          API_CONFIG.ENDPOINTS.IMPORTS,
          requestBody
        );
        
        logger.log(`Import job created with ID: ${response.data.id}`);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        logger.error(error);
        return {
          content: [{
            type: "text" as const,
            text: `Create import error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Get Import Tool
  server.tool(
    "get_import_exa",
    "Get details of a specific import job including its status and progress.",
    {
      importId: z.string().describe("The unique identifier of the Import")
    },
    async ({ importId }) => {
      const requestId = `get_import_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'get_import_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const url = API_CONFIG.ENDPOINTS.IMPORT_BY_ID.replace(':importId', importId);
        const response = await axiosInstance.get<Import>(url);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Get import error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // List Imports Tool
  server.tool(
    "list_imports_exa",
    "List all import jobs with their status and details.",
    {
      status: z.enum(['pending', 'processing', 'completed', 'failed', 'canceled']).optional().describe("Filter by import status"),
      websetId: z.string().optional().describe("Filter by target webset ID"),
      cursor: z.string().optional(),
      limit: z.number().optional()
    },
    async (args) => {
      const requestId = `list_imports_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'list_imports_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const params = new URLSearchParams();
        if (args.status) params.append('status', args.status);
        if (args.websetId) params.append('websetId', args.websetId);
        if (args.cursor) params.append('cursor', args.cursor);
        if (args.limit) params.append('limit', args.limit.toString());
        
        const response = await axiosInstance.get<PaginatedImportList>(
          API_CONFIG.ENDPOINTS.IMPORTS,
          { params }
        );
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `List imports error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Update Import Tool (mainly for canceling)
  server.tool(
    "update_import_exa",
    "Update an import job (currently only supports canceling).",
    {
      importId: z.string().describe("The Import ID to update"),
      status: z.enum(['canceled']).describe("New status (only 'canceled' is supported)")
    },
    async ({ importId, status }) => {
      const requestId = `update_import_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'update_import_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const requestBody: UpdateImportInput = { status };
        
        const url = API_CONFIG.ENDPOINTS.IMPORT_BY_ID.replace(':importId', importId);
        const response = await axiosInstance.patch<Import>(url, requestBody);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Update import error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Delete Import Tool
  server.tool(
    "delete_import_exa",
    "Delete an import job and its associated data.",
    {
      importId: z.string().describe("The Import ID to delete")
    },
    async ({ importId }) => {
      const requestId = `delete_import_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'delete_import_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const url = API_CONFIG.ENDPOINTS.IMPORT_BY_ID.replace(':importId', importId);
        await axiosInstance.delete(url);
        
        return {
          content: [{
            type: "text" as const,
            text: "Import deleted successfully"
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Delete import error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // ===== MONITOR TOOLS =====
  
  // Create Monitor Tool
  server.tool(
    "create_webset_monitor_exa",
    "Create a monitor to automatically run searches periodically and track new items.",
    {
      websetId: z.string().describe("The Webset to monitor"),
      cadence: z.enum(['hourly', 'daily', 'weekly', 'monthly']).describe("How often to run the monitor"),
      query: z.string().optional().describe("Custom search query (uses last search if not provided)"),
      searchBehavior: z.enum(['override', 'append']).optional().describe("How to handle new items (default: append)"),
      metadata: z.record(z.string()).optional().describe("Key-value metadata")
    },
    async ({ websetId, ...monitorData }) => {
      const requestId = `create_webset_monitor_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'create_webset_monitor_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const requestBody: CreateMonitorInput = {
          websetId,
          cadence: monitorData.cadence,
          ...(monitorData.query && { query: monitorData.query }),
          ...(monitorData.searchBehavior && { searchBehavior: monitorData.searchBehavior }),
          ...(monitorData.metadata && { metadata: monitorData.metadata })
        };
        
        const url = API_CONFIG.ENDPOINTS.WEBSET_MONITORS.replace(':websetId', websetId);
        const response = await axiosInstance.post<Monitor>(url, requestBody);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Create monitor error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Update Monitor Tool
  server.tool(
    "update_webset_monitor_exa",
    "Update a monitor's settings including cadence, query, or status.",
    {
      websetId: z.string().describe("The Webset ID"),
      monitorId: z.string().describe("The Monitor ID"),
      cadence: z.enum(['hourly', 'daily', 'weekly', 'monthly']).optional(),
      query: z.string().optional(),
      status: z.enum(['active', 'paused']).optional(),
      searchBehavior: z.enum(['override', 'append']).optional(),
      metadata: z.record(z.string()).optional()
    },
    async ({ websetId, monitorId, ...updateData }) => {
      const requestId = `update_webset_monitor_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'update_webset_monitor_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const requestBody: UpdateMonitorInput = updateData;
        
        const url = API_CONFIG.ENDPOINTS.WEBSET_MONITOR_BY_ID
          .replace(':websetId', websetId)
          .replace(':monitorId', monitorId);
        const response = await axiosInstance.patch<Monitor>(url, requestBody);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Update monitor error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Get Monitor Tool
  server.tool(
    "get_webset_monitor_exa",
    "Get details of a specific monitor by its ID.",
    {
      websetId: z.string().describe("The Webset ID"),
      monitorId: z.string().describe("The Monitor ID")
    },
    async ({ websetId, monitorId }) => {
      const requestId = `get_webset_monitor_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'get_webset_monitor_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const url = API_CONFIG.ENDPOINTS.WEBSET_MONITOR_BY_ID
          .replace(':websetId', websetId)
          .replace(':monitorId', monitorId);
        const response = await axiosInstance.get<Monitor>(url);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Get monitor error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // List Monitors Tool
  server.tool(
    "list_webset_monitors_exa",
    "List all monitors for a specific webset.",
    {
      websetId: z.string().describe("The Webset ID"),
      status: z.enum(['active', 'paused', 'completed', 'error']).optional().describe("Filter by monitor status"),
      cursor: z.string().optional(),
      limit: z.number().optional()
    },
    async ({ websetId, status, cursor, limit }) => {
      const requestId = `list_webset_monitors_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'list_webset_monitors_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (cursor) params.append('cursor', cursor);
        if (limit) params.append('limit', limit.toString());
        
        const url = API_CONFIG.ENDPOINTS.WEBSET_MONITORS.replace(':websetId', websetId);
        const response = await axiosInstance.get<PaginatedMonitorList>(url, { params });
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `List monitors error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Delete Monitor Tool
  server.tool(
    "delete_webset_monitor_exa",
    "Delete a monitor from a webset.",
    {
      websetId: z.string().describe("The Webset ID"),
      monitorId: z.string().describe("The Monitor ID to delete")
    },
    async ({ websetId, monitorId }) => {
      const requestId = `delete_webset_monitor_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'delete_webset_monitor_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const url = API_CONFIG.ENDPOINTS.WEBSET_MONITOR_BY_ID
          .replace(':websetId', websetId)
          .replace(':monitorId', monitorId);
        await axiosInstance.delete(url);
        
        return {
          content: [{
            type: "text" as const,
            text: "Monitor deleted successfully"
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Delete monitor error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // List Monitor Runs Tool
  server.tool(
    "list_monitor_runs_exa",
    "List all runs for a specific monitor.",
    {
      websetId: z.string().describe("The Webset ID"),
      monitorId: z.string().describe("The Monitor ID"),
      status: z.enum(['started', 'completed', 'failed']).optional().describe("Filter by run status"),
      cursor: z.string().optional(),
      limit: z.number().optional()
    },
    async ({ websetId, monitorId, status, cursor, limit }) => {
      const requestId = `list_monitor_runs_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'list_monitor_runs_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (cursor) params.append('cursor', cursor);
        if (limit) params.append('limit', limit.toString());
        
        const url = API_CONFIG.ENDPOINTS.WEBSET_MONITOR_RUNS
          .replace(':websetId', websetId)
          .replace(':monitorId', monitorId);
        const response = await axiosInstance.get<PaginatedList<MonitorRun>>(url, { params });
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `List monitor runs error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Get Monitor Run Tool
  server.tool(
    "get_monitor_run_exa",
    "Get details of a specific monitor run.",
    {
      websetId: z.string().describe("The Webset ID"),
      monitorId: z.string().describe("The Monitor ID"),
      runId: z.string().describe("The Run ID")
    },
    async ({ websetId, monitorId, runId }) => {
      const requestId = `get_monitor_run_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'get_monitor_run_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const url = `${API_CONFIG.ENDPOINTS.WEBSET_MONITOR_RUNS}/${runId}`
          .replace(':websetId', websetId)
          .replace(':monitorId', monitorId);
        const response = await axiosInstance.get<MonitorRun>(url);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Get monitor run error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // ===== WEBHOOK TOOLS =====
  
  // Create Webhook Tool
  server.tool(
    "create_webhook_exa",
    "Create a webhook to receive notifications about Webset events.",
    {
      url: z.string().describe("URL to send webhook notifications"),
      events: z.array(z.enum([
        'webset.created', 'webset.deleted', 'webset.paused', 'webset.idle',
        'webset.search.created', 'webset.search.completed', 'webset.search.canceled',
        'webset.item.created', 'webset.item.enriched',
        'import.created', 'import.completed',
        'webset.monitor.run.started', 'webset.monitor.run.completed'
      ])).describe("Event types to subscribe to"),
      description: z.string().optional().describe("Webhook description"),
      secret: z.string().optional().describe("Secret for webhook signature verification")
    },
    async (args) => {
      const requestId = `create_webhook_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'create_webhook_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const requestBody: CreateWebhookInput = {
          url: args.url,
          events: args.events as EventType[],
          ...(args.description && { description: args.description }),
          ...(args.secret && { secret: args.secret })
        };
        
        const response = await axiosInstance.post<Webhook>(
          API_CONFIG.ENDPOINTS.WEBHOOKS,
          requestBody
        );
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Create webhook error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Get Webhook Tool
  server.tool(
    "get_webhook_exa",
    "Get details of a specific webhook by its ID.",
    {
      webhookId: z.string().describe("The Webhook ID")
    },
    async ({ webhookId }) => {
      const requestId = `get_webhook_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'get_webhook_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const url = API_CONFIG.ENDPOINTS.WEBHOOK_BY_ID.replace(':webhookId', webhookId);
        const response = await axiosInstance.get<Webhook>(url);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Get webhook error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // List Webhooks Tool
  server.tool(
    "list_webhooks_exa",
    "List all webhooks configured in the system.",
    {
      status: z.enum(['active', 'inactive', 'error']).optional().describe("Filter by webhook status"),
      cursor: z.string().optional(),
      limit: z.number().optional()
    },
    async (args) => {
      const requestId = `list_webhooks_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'list_webhooks_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const params = new URLSearchParams();
        if (args.status) params.append('status', args.status);
        if (args.cursor) params.append('cursor', args.cursor);
        if (args.limit) params.append('limit', args.limit.toString());
        
        const response = await axiosInstance.get<PaginatedWebhookList>(
          API_CONFIG.ENDPOINTS.WEBHOOKS,
          { params }
        );
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `List webhooks error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Update Webhook Tool
  server.tool(
    "update_webhook_exa",
    "Update a webhook configuration including URL, events, or status.",
    {
      webhookId: z.string().describe("The Webhook ID"),
      url: z.string().optional().describe("New URL for the webhook"),
      events: z.array(z.enum([
        'webset.created', 'webset.deleted', 'webset.paused', 'webset.idle',
        'webset.search.created', 'webset.search.completed', 'webset.search.canceled',
        'webset.item.created', 'webset.item.enriched', 'webset.item.updated', 'webset.item.deleted',
        'import.created', 'import.completed', 'import.processing', 'import.failed', 'import.canceled',
        'webset.export.created', 'webset.export.completed', 'webset.export.failed',
        'webset.monitor.run.started', 'webset.monitor.run.completed', 'webset.monitor.run.failed',
        'webhook.created', 'webhook.updated', 'webhook.deleted'
      ])).optional().describe("New event types to subscribe to"),
      description: z.string().optional().describe("New webhook description"),
      status: z.enum(['active', 'inactive']).optional().describe("Webhook status")
    },
    async ({ webhookId, ...updateData }) => {
      const requestId = `update_webhook_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'update_webhook_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const requestBody: UpdateWebhookInput = {};
        if (updateData.url) requestBody.url = updateData.url;
        if (updateData.events) requestBody.events = updateData.events as EventType[];
        if (updateData.description !== undefined) requestBody.description = updateData.description;
        if (updateData.status) requestBody.status = updateData.status;
        
        const url = API_CONFIG.ENDPOINTS.WEBHOOK_BY_ID.replace(':webhookId', webhookId);
        const response = await axiosInstance.patch<Webhook>(url, requestBody);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Update webhook error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Delete Webhook Tool
  server.tool(
    "delete_webhook_exa",
    "Delete a webhook from the system.",
    {
      webhookId: z.string().describe("The Webhook ID to delete")
    },
    async ({ webhookId }) => {
      const requestId = `delete_webhook_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'delete_webhook_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const url = API_CONFIG.ENDPOINTS.WEBHOOK_BY_ID.replace(':webhookId', webhookId);
        await axiosInstance.delete(url);
        
        return {
          content: [{
            type: "text" as const,
            text: "Webhook deleted successfully"
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Delete webhook error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // List Webhook Attempts Tool
  server.tool(
    "list_webhook_attempts_exa",
    "List delivery attempts for a specific webhook with details about success/failure.",
    {
      webhookId: z.string().describe("The Webhook ID"),
      eventType: z.string().optional().describe("Filter by event type"),
      cursor: z.string().optional(),
      limit: z.number().optional()
    },
    async ({ webhookId, eventType, cursor, limit }) => {
      const requestId = `list_webhook_attempts_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'list_webhook_attempts_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const params = new URLSearchParams();
        if (eventType) params.append('eventType', eventType);
        if (cursor) params.append('cursor', cursor);
        if (limit) params.append('limit', limit.toString());
        
        const url = API_CONFIG.ENDPOINTS.WEBHOOK_ATTEMPTS.replace(':webhookId', webhookId);
        const response = await axiosInstance.get<PaginatedWebhookAttemptList>(url, { params });
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `List webhook attempts error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // ===== EVENT TOOLS =====
  
  // List Events Tool
  server.tool(
    "list_events_exa",
    "List all events that have occurred in the Websets system with filtering options.",
    {
      eventType: z.string().optional().describe("Filter by specific event type"),
      websetId: z.string().optional().describe("Filter by Webset ID"),
      cursor: z.string().optional(),
      limit: z.number().optional()
    },
    async (args) => {
      const requestId = `list_events_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'list_events_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const params = new URLSearchParams();
        if (args.eventType) params.append('eventType', args.eventType);
        if (args.websetId) params.append('websetId', args.websetId);
        if (args.cursor) params.append('cursor', args.cursor);
        if (args.limit) params.append('limit', args.limit.toString());
        
        const response = await axiosInstance.get<PaginatedEventList>(
          API_CONFIG.ENDPOINTS.EVENTS,
          { params }
        );
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `List events error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );

  // Get Event Tool
  server.tool(
    "get_event_exa",
    "Get details of a specific event by its ID.",
    {
      eventId: z.string().describe("The Event ID")
    },
    async ({ eventId }) => {
      const requestId = `get_event_exa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const logger = createRequestLogger(requestId, 'get_event_exa');
      
      try {
        const axiosInstance = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          headers: {
            'accept': 'application/json',
            'x-api-key': config?.exaApiKey || process.env.EXA_API_KEY || ''
          },
          timeout: API_CONFIG.REQUEST_TIMEOUT
        });

        const url = API_CONFIG.ENDPOINTS.EVENT_BY_ID.replace(':eventId', eventId);
        const response = await axiosInstance.get<Event>(url);
        
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: `Get event error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true,
        };
      }
    }
  );
}