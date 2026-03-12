import { useEffect, useState } from "react";
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileJson, 
  FileText, 
  File,
  ChevronRight,
  ChevronDown,
  Search,
  Loader2
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { Input } from "@nexus/ui/components/input";
import type { FileNode } from "@/lib/code/opencode-types";

interface FileExplorerProps {
  onFileSelect?: () => void;
}

export function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    fileTree,
    expandedFolders,
    loadFileTree,
    toggleFolder,
    openFile,
    client,
  } = useEditorStore();

  // Load file tree on mount
  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  // Search files with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (!client) return;
      
      setIsSearching(true);
      try {
        const results = await client.find.files(searchQuery, { limit: 20 });
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, client]);

  const handleFileClick = async (path: string) => {
    await openFile(path);
    onFileSelect?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-9"
          />
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : searchResults ? (
          // Search Results
          <div className="space-y-1">
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No files found
              </p>
            ) : (
              searchResults.map((path) => (
                <button
                  key={path}
                  onClick={() => handleFileClick(path)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <FileIcon path={path} />
                  <span className="text-sm truncate font-mono">{path}</span>
                </button>
              ))
            )}
          </div>
        ) : fileTree ? (
          // File Tree
          <FileTree
            nodes={fileTree}
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            onFileClick={handleFileClick}
            level={0}
          />
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

interface FileTreeProps {
  nodes: FileNode[];
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onFileClick: (path: string) => void;
  level: number;
}

function FileTree({ nodes, expandedFolders, onToggleFolder, onFileClick, level }: FileTreeProps) {
  // Sort: folders first, then files, both alphabetically
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === "directory" ? -1 : 1;
  });

  return (
    <div className="space-y-0.5">
      {sortedNodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          onFileClick={onFileClick}
          level={level}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onFileClick: (path: string) => void;
  level: number;
}

function FileTreeNode({ node, expandedFolders, onToggleFolder, onFileClick, level }: FileTreeNodeProps) {
  const [children, setChildren] = useState<FileNode[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isExpanded = expandedFolders.has(node.path);
  const { client } = useEditorStore();

  // Load children when folder is expanded
  useEffect(() => {
    if (node.type !== "directory" || !isExpanded || children) return;

    const loadChildren = async () => {
      if (!client) return;
      
      setIsLoading(true);
      try {
        const files = await client.file.list(node.path);
        setChildren(files);
      } catch (error) {
        console.error("Failed to load folder:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChildren();
  }, [node.type, node.path, isExpanded, children, client]);

  const paddingLeft = `${level * 12 + 8}px`;

  if (node.type === "directory") {
    return (
      <div>
        <button
          onClick={() => onToggleFolder(node.path)}
          className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5"
          style={{ paddingLeft }}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-primary shrink-0" />
          )}
          <span className="text-sm truncate">{node.name}</span>
        </button>
        
        {isExpanded && (
          <div>
            {isLoading ? (
              <div className="flex items-center gap-2 px-2 py-1.5" style={{ paddingLeft: `${level * 12 + 32}px` }}>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
            ) : children ? (
              <FileTree
                nodes={children}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onFileClick={onFileClick}
                level={level + 1}
              />
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileClick(node.path)}
      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5"
      style={{ paddingLeft: `${level * 12 + 28}px` }}
    >
      <FileIcon path={node.path} />
      <span className="text-sm truncate">{node.name}</span>
    </button>
  );
}

function FileIcon({ path }: { path: string }) {
  const ext = path.split(".").pop()?.toLowerCase();
  
  const iconMap: Record<string, typeof FileCode> = {
    ts: FileCode,
    tsx: FileCode,
    js: FileCode,
    jsx: FileCode,
    json: FileJson,
    md: FileText,
    txt: FileText,
  };
  
  const Icon = iconMap[ext || ""] || File;
  
  return <Icon className="h-4 w-4 text-muted-foreground shrink-0" />;
}
