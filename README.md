# Exa MCP Server 🔍
[![npm version](https://badge.fury.io/js/exa-mcp-server.svg)](https://www.npmjs.com/package/exa-mcp-server)
[![smithery badge](https://smithery.ai/badge/exa)](https://smithery.ai/server/exa)

A Model Context Protocol (MCP) server lets AI assistants like Claude use the Exa AI Search API for web searches. This setup allows AI models to get real-time web information in a safe and controlled way.

## Remote Exa MCP 🌐

Connect directly to Exa's hosted MCP server (instead of running it locally).

### Remote Exa MCP URL

```
https://mcp.exa.ai/mcp?exaApiKey=your-exa-api-key
```

Replace `your-api-key-here` with your actual Exa API key from [dashboard.exa.ai/api-keys](https://dashboard.exa.ai/api-keys).

### Claude Desktop Configuration for Remote MCP

Add this to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.exa.ai/mcp?exaApiKey=your-exa-api-key"
      ]
    }
  }
}
```

### NPM Installation

```bash
npm install -g exa-mcp-server
```

### Using Smithery

To install the Exa MCP server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/exa):

```bash
npx -y @smithery/cli install exa --client claude
```

## Configuration ⚙️

### 1. Configure Claude Desktop to recognize the Exa MCP server

You can find claude_desktop_config.json inside the settings of Claude Desktop app:

Open the Claude Desktop app and enable Developer Mode from the top-left menu bar. 

Once enabled, open Settings (also from the top-left menu bar) and navigate to the Developer Option, where you'll find the Edit Config button. Clicking it will open the claude_desktop_config.json file, allowing you to make the necessary edits. 

OR (if you want to open claude_desktop_config.json from terminal)

#### For macOS:

1. Open your Claude Desktop configuration:

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### For Windows:

1. Open your Claude Desktop configuration:

```powershell
code %APPDATA%\Claude\claude_desktop_config.json
```

### 2. Add the Exa server configuration:

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "exa-mcp-server"],
      "env": {
        "EXA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Replace `your-api-key-here` with your actual Exa API key from [dashboard.exa.ai/api-keys](https://dashboard.exa.ai/api-keys).

### 3. Available Tools & Tool Selection

The Exa MCP server includes the following tools, which can be enabled by adding the `--tools`:

#### Core Search & Content Tools
- **web_search_exa**: Advanced web search with semantic understanding. Supports filtering by date, domain, content type, and includes full text extraction, highlights, and AI summaries.
- **get_contents_exa**: Retrieve full content from specific URLs with advanced extraction options. Supports batch processing, live crawling, subpage extraction, and various content formats.
- **find_similar_exa**: Find pages semantically similar to a given URL. Perfect for competitor analysis, finding related research papers, or building recommendation systems.
- **answer_with_citations_exa**: Generate direct answers to questions with citations from web sources. Uses AI to search, analyze, and provide accurate answers backed by reliable sources.
- **deep_research_exa**: Conduct comprehensive research on any topic with structured output. Performs deep web analysis, synthesizes information from multiple sources, and generates detailed reports.
- **check_research_status_exa**: Check the status of previously initiated deep research tasks.

#### Specialized Search Tools
- **research_paper_search**: Specialized search focused on academic papers and research content.
- **company_research**: Comprehensive company research tool that crawls company websites to gather detailed information about businesses.
- **crawling**: Legacy tool for extracting content from specific URLs (consider using get_contents_exa for more features).
- **competitor_finder**: Identifies competitors of a company by searching for businesses offering similar products or services.
- **linkedin_search**: Search LinkedIn for companies and people using Exa AI. Simply include company names, person names, or specific LinkedIn URLs in your query.
- **wikipedia_search_exa**: Search and retrieve information from Wikipedia articles on specific topics, giving you accurate, structured knowledge from the world's largest encyclopedia.
- **github_search**: Search GitHub repositories using Exa AI - performs real-time searches on GitHub.com to find relevant repositories, issues, and GitHub accounts.

#### Websets API Tools
The Exa MCP server now includes comprehensive support for the Websets API, enabling advanced targeted search, data enrichment, and monitoring capabilities. Tools are organized by common B2B sales and marketing workflows:

##### 🎯 Core Discovery Tools (Used Daily)
These are the most frequently used tools for finding and managing leads:
- **create_webset_exa**: Start lead discovery with search criteria (e.g., "Find CTOs at B2B SaaS companies")
- **list_webset_items_exa**: View all discovered leads with their data
- **get_webset_item_exa**: Deep dive into specific prospects
- **list_websets_exa**: Manage all your websets
- **get_webset_exa**: Check webset status and progress
- **search_webset_items_exa**: Filter items by type, verification status, or custom criteria

##### 📧 Enrichment Tools (Critical for Outreach)
Add contact information and additional data to your leads:
- **create_webset_enrichment_exa**: Add enrichments (emails, phones, LinkedIn profiles, company data)
- **list_webset_enrichments_exa**: Monitor enrichment progress
- **get_webset_enrichment_exa**: Check enrichment details
- **delete_webset_enrichment_exa**: Remove unnecessary enrichments
- **cancel_webset_enrichment_exa**: Stop running enrichments

##### 📥 Import & Automation Tools (High-Value Workflows)
Import existing data and set up automated monitoring:
- **create_import_exa**: Import CSV/JSON data (e.g., conference attendee lists)
- **get_import_exa**: Check import status
- **create_webset_monitor_exa**: Set up daily/weekly automated searches
- **update_webset_monitor_exa**: Adjust monitor settings
- **create_webhook_exa**: Get real-time notifications
- **list_webhook_attempts_exa**: Debug webhook delivery

##### 🔧 Search & Data Management Tools
Fine-tune searches and manage your data:
- **create_webset_search_exa**: Add new searches to existing websets
- **get_webset_search_exa**: Check search progress
- **list_webset_searches_exa**: View all searches
- **cancel_webset_search_exa**: Stop unnecessary searches
- **update_webset_exa**: Add tags and metadata for organization
- **delete_webset_exa**: Remove old websets
- **delete_webset_item_exa**: Remove duplicate or irrelevant items
- **cancel_webset_exa**: Cancel all operations for a webset

##### 📊 System Monitoring Tools
Track what's happening in your system:
- **list_events_exa**: Monitor all system events
- **get_event_exa**: Get detailed event information

##### 📤 Export Tools
Export your data in various formats:
- **create_export_exa**: Export webset items to CSV/JSON/XLSX
- **get_export_exa**: Check export status and get download URL
- **list_exports_exa**: List all export jobs
- **delete_export_exa**: Delete export files

##### 🔧 Advanced Features

**Batch Operations:**
- **update_webset_item_exa**: Update single item metadata and verification
- **batch_update_items_exa**: Update multiple items at once
- **batch_delete_items_exa**: Delete multiple items efficiently
- **batch_verify_items_exa**: Bulk verify items

**Enhanced Webhook Management:**
- **get_webhook_exa**: Get webhook details
- **list_webhooks_exa**: List all webhooks
- **update_webhook_exa**: Update webhook configuration
- **delete_webhook_exa**: Remove webhooks

**Complete Monitor Management:**
- **get_webset_monitor_exa**: Get monitor details
- **list_webset_monitors_exa**: List all monitors for a webset
- **delete_webset_monitor_exa**: Delete monitors
- **list_monitor_runs_exa**: View monitor run history
- **get_monitor_run_exa**: Get specific run details

**Import Management:**
- **list_imports_exa**: List all import jobs
- **update_import_exa**: Cancel running imports
- **delete_import_exa**: Delete import data

**Advanced Filtering:**
All list operations now support advanced filtering:
- Filter by type, verification status, enrichment status
- Date range filters (createdAfter, createdBefore, updatedAfter, updatedBefore)
- Metadata filters
- Pattern matching for URLs and titles

#### Common Workflow Examples

**Lead Discovery Flow:**
1. `create_webset_exa` with your ideal customer profile
2. `create_webset_enrichment_exa` to add emails
3. `list_webset_items_exa` to get your enriched leads

**Monitoring Flow:**
1. `create_webset_exa` for your monitoring criteria
2. `create_webset_monitor_exa` with daily cadence
3. `create_webhook_exa` to get notified of new leads

See [Websets Workflows Guide](docs/WEBSETS_WORKFLOWS.md) for detailed workflow examples.

You can choose which tools to enable by adding the `--tools` parameter to your Claude Desktop configuration:

#### Specify which tools to enable:

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": [
        "-y",
        "exa-mcp-server",
        "--tools=web_search_exa,get_contents_exa,find_similar_exa,answer_with_citations_exa,deep_research_exa,check_research_status_exa,research_paper_search,company_research,crawling,competitor_finder,linkedin_search,wikipedia_search_exa,github_search"
      ],
      "env": {
        "EXA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

For enabling multiple tools, use a comma-separated list:

```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": [
        "-y",
        "exa-mcp-server",
        "--tools=web_search_exa,get_contents_exa,find_similar_exa,answer_with_citations_exa,deep_research_exa,check_research_status_exa,research_paper_search,company_research,crawling,competitor_finder,linkedin_search,wikipedia_search_exa,github_search"
      ],
      "env": {
        "EXA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### Example: Enabling Websets API Tools by Workflow

**For Lead Discovery & Enrichment (Most Common):**
```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": [
        "-y",
        "exa-mcp-server",
        "--tools=create_webset_exa,list_webset_items_exa,get_webset_item_exa,create_webset_enrichment_exa,list_websets_exa,search_webset_items_exa"
      ],
      "env": {
        "EXA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**For Import & Monitoring Workflows:**
```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": [
        "-y",
        "exa-mcp-server",
        "--tools=create_import_exa,create_webset_monitor_exa,create_webhook_exa,list_events_exa"
      ],
      "env": {
        "EXA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

If you don't specify any tools, all tools enabled by default will be used.

### 4. Restart Claude Desktop

For the changes to take effect:

1. Completely quit Claude Desktop (not just close the window)
2. Start Claude Desktop again
3. Look for the icon to verify the Exa server is connected

## Using via NPX

If you prefer to run the server directly, you can use npx:

```bash
# Run with all tools enabled by default
npx exa-mcp-server

# Enable specific tools only
npx exa-mcp-server --tools=web_search_exa

# Enable multiple tools
npx exa-mcp-server --tools=web_search_exa,research_paper_search

# List all available tools
npx exa-mcp-server --list-tools
```

## Troubleshooting 🔧

### Common Issues

1. **Server Not Found**
   * Verify the npm link is correctly set up
   * Check Claude Desktop configuration syntax (json file)

2. **API Key Issues**
   * Confirm your EXA_API_KEY is valid
   * Check the EXA_API_KEY is correctly set in the Claude Desktop config
   * Verify no spaces or quotes around the API key

3. **Connection Issues**
   * Restart Claude Desktop completely
   * Check Claude Desktop logs:

<br>

---

Built with ❤️ by team Exa