# Exa Websets Common Workflows Guide

This guide shows how to use the Websets API tools for the most common B2B sales and marketing workflows.

## 🎯 1. Lead Discovery Workflow (Daily - Most Common)
**"Find new prospects matching specific criteria"**

### Tools to use:
1. `create_webset_exa` - Start with search criteria
2. `get_webset_exa` - Check search progress
3. `list_webset_items_exa` - Review discovered leads
4. `get_webset_item_exa` - Deep dive into specific prospects

### Example:
```
// Find VPs of Sales at B2B SaaS companies
create_webset_exa with:
- search.query: "VP Sales B2B SaaS companies 50-200 employees"
- search.entity.type: "person"
- search.count: 100
```

## 📧 2. Contact Enrichment Workflow (Daily - Critical)
**"Add emails, phone numbers, and LinkedIn profiles to your leads"**

### Tools to use:
1. `create_webset_enrichment_exa` - Define what data to extract
2. `list_webset_enrichments_exa` - Monitor enrichment progress
3. `list_webset_items_exa` - Access enriched data
4. `search_webset_items_exa` - Filter by enrichment status

### Example:
```
// Get contact info for all prospects
create_webset_enrichment_exa with:
- description: "Find work email address"
- format: "email"

create_webset_enrichment_exa with:
- description: "Find LinkedIn profile URL"
- format: "text"
```

## 📥 3. Import & Enhance Workflow (Weekly)
**"Upload existing lists and enrich with additional data"**

### Tools to use:
1. `create_import_exa` - Upload CSV/JSON data
2. `get_import_exa` - Check import status
3. `create_webset_exa` - Create webset from import
4. `create_webset_enrichment_exa` - Add enrichments

### Example:
```
// Import trade show attendee list
create_import_exa with:
- sourceUrl: "https://mydata.com/attendees.csv"
- fileType: "csv"
Then enrich with company size, industry, recent news
```

## 🔄 4. Automated Monitoring Workflow (Set & Forget)
**"Get notified about new opportunities automatically"**

### Tools to use:
1. `create_webset_monitor_exa` - Set up recurring searches
2. `update_webset_monitor_exa` - Adjust frequency/criteria
3. `create_webhook_exa` - Get real-time notifications
4. `list_webhook_attempts_exa` - Debug delivery issues
5. `list_events_exa` - Review what happened

### Example:
```
// Monitor for new funded startups daily
create_webset_monitor_exa with:
- cadence: "daily"
- query: "raised funding Series A fintech last 24 hours"
- searchBehavior: "append"
```

## 📊 5. Data Management Workflow (Daily Hygiene)
**"Keep your prospect data organized and clean"**

### Tools to use:
1. `list_websets_exa` - See all your websets
2. `update_webset_exa` - Add tags/metadata
3. `search_webset_items_exa` - Find specific items
4. `delete_webset_item_exa` - Remove duplicates
5. `cancel_webset_exa` - Stop unnecessary operations

### Example:
```
// Tag websets by campaign
update_webset_exa with:
- metadata: {"campaign": "Q4_enterprise", "owner": "sales_team_west"}
```

## 🔧 Supporting Operations

### Search Management
- `create_webset_search_exa` - Add new searches to existing websets
- `get_webset_search_exa` - Check search status
- `cancel_webset_search_exa` - Stop running searches

### Enrichment Management
- `get_webset_enrichment_exa` - Check enrichment details
- `delete_webset_enrichment_exa` - Remove enrichments
- `cancel_webset_enrichment_exa` - Stop running enrichments

### System Monitoring
- `get_event_exa` - Investigate specific events
- `get_import_exa` - Check import details
- `get_webset_item_exa` - Deep dive into items

## Quick Start Examples

### 1. Find and enrich new leads:
```
1. create_webset_exa (with search for your ICP)
2. create_webset_enrichment_exa (add email enrichment)
3. create_webset_enrichment_exa (add LinkedIn enrichment)
4. list_webset_items_exa (get your enriched leads)
```

### 2. Monitor for opportunities:
```
1. create_webset_exa (define what to monitor)
2. create_webset_monitor_exa (set schedule)
3. create_webhook_exa (get notifications)
```

### 3. Import and enhance CRM data:
```
1. create_import_exa (upload your CSV)
2. create_webset_enrichment_exa (add missing data)
3. search_webset_items_exa (filter and export)
```

## Advanced Operations

### Batch Processing
```
// Update multiple items at once
batch_update_items_exa with:
- itemIds: ["item1", "item2", "item3"]
- updates: { metadata: { "status": "qualified" } }

// Bulk verify leads
batch_verify_items_exa with:
- itemIds: ["item1", "item2", "item3"]
- status: "verified"
- reasoning: "Confirmed by sales team"
```

### Advanced Filtering
```
// Find recently updated verified leads
list_webset_items_exa with:
- verificationStatus: "verified"
- updatedAfter: "2024-01-01T00:00:00Z"
- hasEnrichedData: true

// Search with complex filters
search_webset_items_exa with:
- filters: {
    type: "company",
    verificationStatus: "verified",
    metadata: { "industry": "fintech" },
    createdAfter: "2024-01-01T00:00:00Z"
  }
```

### Data Export
```
// Export enriched leads to CSV
create_export_exa with:
- format: "csv"
- filters: {
    verificationStatus: "verified",
    hasEnrichedData: true
  }

// Check export status
get_export_exa (returns download URL when ready)
```