# MeiliSearch Integration

This project uses MeiliSearch for fast, typo-tolerant product search.

## Setup

### 1. Start MeiliSearch

Using Docker (recommended):
```bash
# From the project root
docker-compose -f docker-compose.meilisearch.yml up -d
```

Or install directly: https://docs.meilisearch.com/learn/getting_started/installation

### 2. Configure Environment Variables

Add to `backend/.env`:
```
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterkey  # Use a secure key in production
```

### 3. Index Products

Run the indexing script to populate MeiliSearch with your products:
```bash
cd backend
npm run index-products
```

Or use the admin API endpoint:
```bash
curl -X POST http://localhost:9000/admin/search \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Features

### Backend APIs

- `GET /store/search?q=query` - Search products
  - Query params: `q`, `limit`, `offset`, `filter`, `sort`
  
- `GET /admin/search` - Get search index stats
- `POST /admin/search` - Re-index all products

### Frontend Components

- **SearchModal** (`components/search/search-modal.tsx`)
  - Press `Cmd/Ctrl + K` to open
  - Instant search as you type
  - Keyboard navigation (↑↓ to select, Enter to open)
  - Recent searches stored locally
  - Popular search suggestions

- **SearchResults** (`app/search/search-results.tsx`)
  - Full search results page
  - Sorting options
  - Filter panel (extensible)

### Auto-Sync

Products are automatically synced to MeiliSearch when:
- A product is created
- A product is updated
- A product is deleted

This is handled by the subscriber in `backend/src/subscribers/product-search-sync.ts`.

## Search Configuration

MeiliSearch is configured with:

**Searchable Attributes** (in order of priority):
1. `title`
2. `description`
3. `handle`
4. `collection_title`
5. `category_names`
6. `tags`
7. `variants.title`
8. `variants.sku`

**Filterable Attributes**:
- `collection_id`
- `category_ids`
- `min_price`
- `max_price`
- `tags`

**Sortable Attributes**:
- `title`
- `min_price`
- `max_price`
- `created_at`
- `updated_at`

## Example Search Queries

```bash
# Basic search
curl "http://localhost:9000/store/search?q=iPhone"

# With pagination
curl "http://localhost:9000/store/search?q=Apple&limit=10&offset=0"

# With sorting
curl "http://localhost:9000/store/search?q=phone&sort=min_price:asc"

# With filters
curl "http://localhost:9000/store/search?q=MacBook&filter=min_price%20%3E%201000000"
```

## Development

### Testing Search

1. Start MeiliSearch: `docker-compose -f docker-compose.meilisearch.yml up -d`
2. Start the backend: `cd backend && npm run dev`
3. Index products: `npm run index-products`
4. Test search: `curl "http://localhost:9000/store/search?q=iPhone"`

### Debugging

Check MeiliSearch dashboard: http://localhost:7700

Check index stats:
```bash
curl http://localhost:7700/indexes/products/stats
```
