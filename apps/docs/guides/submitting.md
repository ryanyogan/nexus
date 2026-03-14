# Submitting Libraries

How to request new libraries to be indexed by Nexus.

## Requirements

For a library to be indexed, it should:

- Have public documentation
- Be actively maintained
- Have a reasonable user base

## How to Submit

### Option 1: GitHub Issue

Open an issue at [github.com/ryanyogan/nexus](https://github.com/ryanyogan/nexus/issues) with:

- Library name and URL
- Documentation URL
- Category (frontend, backend, etc.)
- Brief description

### Option 2: Pull Request

Add to the library list in `packages/api/src/data/top-libraries.ts`:

```typescript
{
  name: 'your-library',
  category: 'frontend',
  description: 'Brief description',
  docsUrl: 'https://docs.example.com'
}
```

## What Gets Indexed

We index:

- API reference documentation
- Guides and tutorials
- Code examples
- Configuration options

We don't index:

- Blog posts
- Marketing pages
- User forums

## Processing Time

New library requests are typically processed within 1-2 weeks during our weekly sync.

## Questions?

Open a discussion on GitHub or reach out on Twitter.
