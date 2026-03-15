# Visual Canvas

The Visual Canvas provides a drag-and-drop interface for building Stacks using React Flow.

## Overview

The canvas lets you visually compose your stack by connecting different node types:

- **Stack Node** - The main stack configuration
- **Instruction Node** - Text-based rules and preferences
- **Repository Node** - GitHub repos for AI learning
- **Package Node** - npm/crate packages to research

## Getting Started

1. Navigate to **Dashboard > Stacks > New** or edit an existing stack
2. Click the **Canvas** tab in the toolbar
3. Drag nodes from the sidebar onto the canvas

## Node Types

### Stack Node (Center)

The central node representing your stack. All other nodes connect to this.

- **Name** - Stack identifier
- **Category** - infrastructure, database, backend, fullstack, frontend, styling, tui, tooling
- **Layer** - 0 (infra) to 3 (tooling)
- **Token Budget** - minimal, standard, comprehensive

### Instruction Node

Add custom instructions and rules:

```markdown
## Code Style
- Use TypeScript strict mode
- Prefer const over let
- Use explicit return types

## Architecture
- Feature-based folder structure
- Colocation of related files
```

### Repository Node

Add GitHub repositories for the AI to learn from:

- **URL** - Full GitHub URL (public or private)
- **Branch** - Target branch (default: main)
- **Status** - Pending, Analyzing, Complete, Failed

When you add a repository, a background job:
1. Clones the repository structure
2. Identifies key patterns
3. Extracts conventions
4. Updates the compiled prompt

### Package Node

Research npm or Cargo packages:

- **Name** - Package name (e.g., `@tanstack/react-query`)
- **Registry** - npm, crates.io
- **Version** - Optional specific version

## Canvas Controls

### Navigation

- **Pan** - Click and drag on empty canvas
- **Zoom** - Scroll wheel or pinch gesture
- **Fit View** - Double-click empty canvas

### Node Operations

- **Select** - Click a node
- **Move** - Drag a node
- **Delete** - Select + Backspace/Delete
- **Connect** - Drag from handle to handle

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` | Remove selected node |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + A` | Select all |
| `Escape` | Deselect all |

## Connecting Nodes

Nodes have connection handles:

- **Source handles** (right side) - Outgoing connections
- **Target handles** (left side) - Incoming connections

To connect:
1. Click and drag from a source handle
2. Drop on a target handle
3. The connection is established

## Canvas vs Text Mode

Toggle between Canvas and Text modes using the toolbar:

| Feature | Canvas | Text |
|---------|--------|------|
| Visual composition | ✓ | - |
| Node arrangement | ✓ | - |
| Quick editing | - | ✓ |
| Markdown support | ✓ | ✓ |
| Repository nodes | ✓ | ✓ |
| Copy/paste code | - | ✓ |

Both modes share the same underlying data - changes in one are reflected in the other.

## Tips

### Organization

- Keep the Stack node in the center
- Group related instruction nodes
- Use consistent spacing

### Performance

- Limit repository nodes to 3-5 per stack
- Use specific branches when possible
- Remove unused nodes

### Best Practices

1. Start with instructions, add repos later
2. Test your stack after each major change
3. Use the "Compile" button to preview the final prompt
4. Check token count stays within budget

## Troubleshooting

### Nodes not connecting

- Ensure you're dragging from source to target
- Check that the connection type is valid
- Try zooming in for better precision

### Repository learning stuck

- Check the repository URL is valid
- Ensure the repo is accessible (public or authenticated)
- Check the repository status in the node details

### Canvas not loading

- Refresh the page
- Clear browser cache
- Check browser console for errors
