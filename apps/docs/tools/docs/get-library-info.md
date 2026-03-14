# get-library-info

Get detailed information about a specific library including description, version, and documentation coverage.

## Usage

```
Tool: get-library-info
Parameters:
  - libraryId (required): The library ID
```

## Example

**Input:**
```json
{
  "libraryId": "nextjs"
}
```

**Output:**
```json
{
  "id": "nextjs",
  "name": "Next.js",
  "description": "The React Framework for the Web",
  "version": "14.2.0",
  "category": "fullstack",
  "snippets": 3456,
  "lastUpdated": "2024-03-15",
  "sourceUrl": "https://nextjs.org/docs"
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `libraryId` | string | Yes | The library ID |

## Returns

Library metadata including:

- `id` - Library identifier
- `name` - Display name
- `description` - Library description
- `version` - Indexed version
- `category` - Library category
- `snippets` - Number of indexed code snippets
- `lastUpdated` - When documentation was last synced
- `sourceUrl` - Original documentation URL
