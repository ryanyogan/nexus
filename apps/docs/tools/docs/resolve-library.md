# resolve-library

Find library IDs for documentation queries by searching the library name.

## Usage

```
Tool: resolve-library
Parameters:
  - libraryName (required): The name of the library to search for
  - query (optional): The task you need help with, used to rank results
```

## Example

**Input:**
```json
{
  "libraryName": "react",
  "query": "hooks and state management"
}
```

**Output:**
```json
{
  "libraries": [
    {
      "id": "react",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "snippets": 2341
    }
  ]
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `libraryName` | string | Yes | The name of the library to search for |
| `query` | string | No | Your task or question, used to rank results by relevance |

## Returns

An array of matching libraries with:

- `id` - The library ID to use with `query-docs`
- `name` - Display name of the library
- `description` - Short description
- `snippets` - Number of indexed code snippets

## Tips

- Search by common name: "react", "nextjs", "prisma"
- Include version if needed: "react-18", "next-14"
- Use the query parameter for better ranking
