# query-docs

Search indexed documentation using semantic search. Returns relevant code examples and explanations.

## Usage

```
Tool: query-docs
Parameters:
  - libraryId (required): The library ID from resolve-library
  - query (required): Your question or what you're looking for
  - limit (optional): Max results (1-10, default 5)
  - tokens (optional): Response format for token efficiency
```

## Example

**Input:**

```json
{
  "libraryId": "react",
  "query": "useEffect cleanup function best practices",
  "limit": 3
}
```

**Output:**

```json
{
  "results": [
    {
      "title": "Cleaning up Effects",
      "content": "Return a cleanup function from your Effect to handle...",
      "source": "react.dev/reference/react/useEffect",
      "relevance": 0.95
    }
  ]
}
```

## Parameters

| Parameter   | Type   | Required | Description                                                |
| ----------- | ------ | -------- | ---------------------------------------------------------- |
| `libraryId` | string | Yes      | Library ID from `resolve-library`                          |
| `query`     | string | Yes      | What you're looking for                                    |
| `limit`     | number | No       | Max results 1-10, default 5                                |
| `tokens`    | string | No       | Response format: `full`, `compact`, `code-only`, `summary` |

### Token Formats

| Format      | Description                               |
| ----------- | ----------------------------------------- |
| `full`      | Complete response with metadata (default) |
| `compact`   | Essential data only                       |
| `code-only` | Only code blocks                          |
| `summary`   | Brief overview                            |

## Returns

An array of search results with:

- `title` - Section or page title
- `content` - Relevant documentation text
- `code` - Code examples if available
- `source` - Original documentation URL
- `relevance` - Relevance score 0-1

## Tips

- Be specific: "useEffect cleanup" > "useEffect"
- Include context: "authentication with JWT in Express"
- Use `code-only` format when you just need examples
