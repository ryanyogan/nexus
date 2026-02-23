import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { CodeBlock } from "../../components/docs/CodeBlock";
import { Callout } from "../../components/docs/Callout";

export const Route = createFileRoute("/docs/mobile-terminal")({
  component: MobileTerminalDocs,
});

function MobileTerminalDocs() {
  const toc = [
    { id: "overview", title: "Overview", level: 2 },
    { id: "how-it-works", title: "How It Works", level: 2 },
    { id: "getting-started", title: "Getting Started", level: 2 },
    { id: "start-server", title: "Start OpenCode Server", level: 3 },
    { id: "expose-server", title: "Expose Your Server", level: 3 },
    { id: "connect-mobile", title: "Connect from Mobile", level: 3 },
    { id: "features", title: "Features", level: 2 },
    { id: "session-management", title: "Session Management", level: 3 },
    { id: "real-time-events", title: "Real-Time Events", level: 3 },
    { id: "settings", title: "Settings", level: 2 },
    { id: "security", title: "Security", level: 2 },
    { id: "troubleshooting", title: "Troubleshooting", level: 2 },
  ];

  return (
    <DocsLayout
      title="Mobile Terminal"
      description="Control your OpenCode session remotely from your phone"
      toc={toc}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 id="overview" className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>
        <p className="mb-4 text-muted-foreground">
          The Nexus Mobile Terminal lets you remotely connect to your OpenCode session running
          on your computer. Send messages, view responses, and monitor your AI coding assistant
          from anywhere - your phone, tablet, or another computer.
        </p>
        <Callout type="info" title="What is OpenCode?">
          <p className="text-sm">
            <a href="https://opencode.ai" className="text-primary hover:underline">OpenCode</a> is 
            an open-source AI coding agent that runs in your terminal. It provides Claude-powered
            coding assistance with full access to your codebase.
          </p>
        </Callout>
        <div className="mt-6">
          <Link
            to="/terminal"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Launch Terminal
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <h2 id="how-it-works" className="mb-4 text-xl font-semibold text-foreground">
          How It Works
        </h2>
        <div className="mb-4 rounded-lg border border-border bg-card p-4">
          <ol className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
              <span><strong>Start OpenCode Server</strong> - Run <code>opencode serve</code> on your computer</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
              <span><strong>Expose the Server</strong> - Use a tunnel or port forwarding to make it accessible</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
              <span><strong>Connect from Mobile</strong> - Enter the server URL in the Mobile Terminal</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">4</span>
              <span><strong>Code Anywhere</strong> - Send prompts and receive AI responses from your phone</span>
            </li>
          </ol>
        </div>
        <p className="text-muted-foreground">
          The Mobile Terminal communicates with OpenCode's HTTP API, supporting session management,
          message sending, and real-time event streaming via Server-Sent Events (SSE).
        </p>
      </section>

      {/* Getting Started */}
      <section className="mb-12">
        <h2 id="getting-started" className="mb-4 text-xl font-semibold text-foreground">
          Getting Started
        </h2>

        <h3 id="start-server" className="mb-3 mt-6 text-lg font-medium text-foreground">
          1. Start OpenCode Server
        </h3>
        <p className="mb-4 text-muted-foreground">
          First, navigate to your project directory and start the OpenCode server:
        </p>
        <CodeBlock language="bash">
{`# Navigate to your project
cd ~/my-project

# Start OpenCode with the server enabled
opencode serve --cors https://nexus.yogan.dev`}
        </CodeBlock>
        <p className="mt-4 text-sm text-muted-foreground">
          The <code>--cors</code> flag allows the Nexus web app to connect to your server.
          By default, the server runs on port 4096.
        </p>

        <Callout type="tip" title="Enable Authentication">
          <p className="text-sm">
            For security, set a password for your server:
          </p>
          <CodeBlock language="bash">
{`OPENCODE_SERVER_PASSWORD=your-secure-password opencode serve --cors https://nexus.yogan.dev`}
          </CodeBlock>
        </Callout>

        <h3 id="expose-server" className="mb-3 mt-8 text-lg font-medium text-foreground">
          2. Expose Your Server
        </h3>
        <p className="mb-4 text-muted-foreground">
          Your server needs to be accessible from the internet. Here are some options:
        </p>

        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 font-medium text-foreground">Option A: Cloudflare Tunnel (Recommended)</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Secure, free, and easy to set up. No port forwarding required.
            </p>
            <CodeBlock language="bash">
{`# Install cloudflared
brew install cloudflared  # macOS
# or: sudo apt install cloudflared  # Ubuntu/Debian

# Create a quick tunnel
cloudflared tunnel --url http://localhost:4096`}
            </CodeBlock>
            <p className="mt-2 text-sm text-muted-foreground">
              This gives you a URL like <code>https://random-name.trycloudflare.com</code>
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 font-medium text-foreground">Option B: ngrok</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              Popular tunneling service with a free tier.
            </p>
            <CodeBlock language="bash">
{`# Install ngrok and authenticate
ngrok authtoken YOUR_AUTH_TOKEN

# Expose your server
ngrok http 4096`}
            </CodeBlock>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 font-medium text-foreground">Option C: Tailscale</h4>
            <p className="mb-3 text-sm text-muted-foreground">
              If your phone and computer are both on Tailscale, use the Tailscale IP directly.
            </p>
            <CodeBlock language="bash">
{`# Start server binding to all interfaces
opencode serve --hostname 0.0.0.0 --cors https://nexus.yogan.dev

# Connect using your Tailscale IP
# Example: http://100.x.x.x:4096`}
            </CodeBlock>
          </div>
        </div>

        <h3 id="connect-mobile" className="mb-3 mt-8 text-lg font-medium text-foreground">
          3. Connect from Mobile
        </h3>
        <ol className="mb-4 list-decimal pl-6 text-muted-foreground space-y-2">
          <li>Open <Link to="/terminal" className="text-primary hover:underline">/terminal</Link> on your phone</li>
          <li>Enter your server URL (e.g., <code>https://your-tunnel.trycloudflare.com</code>)</li>
          <li>If you set a password, expand "Authentication" and enter credentials</li>
          <li>Click "Connect"</li>
        </ol>
        <p className="text-muted-foreground">
          Once connected, you'll see your project info and can select or create sessions.
        </p>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 id="features" className="mb-4 text-xl font-semibold text-foreground">
          Features
        </h2>

        <h3 id="session-management" className="mb-3 mt-6 text-lg font-medium text-foreground">
          Session Management
        </h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground space-y-1">
          <li>View all existing OpenCode sessions</li>
          <li>Create new sessions from your phone</li>
          <li>Switch between sessions with one tap</li>
          <li>See full message history for each session</li>
          <li>Abort running operations with the stop button or Esc key</li>
        </ul>

        <h3 id="real-time-events" className="mb-3 mt-6 text-lg font-medium text-foreground">
          Real-Time Events
        </h3>
        <p className="mb-4 text-muted-foreground">
          The terminal shows live events from your OpenCode session:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li><strong>File edits</strong> - See when files are created or modified</li>
          <li><strong>Message updates</strong> - Watch responses stream in real-time</li>
          <li><strong>Permission requests</strong> - Know when OpenCode needs approval</li>
          <li><strong>Todo updates</strong> - Track task progress</li>
        </ul>
      </section>

      {/* Settings */}
      <section className="mb-12">
        <h2 id="settings" className="mb-4 text-xl font-semibold text-foreground">
          Settings
        </h2>
        <p className="mb-4 text-muted-foreground">
          Customize the terminal using the gear icon:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>
            <strong>Font Size:</strong> Small, Base, or Large text
          </li>
          <li>
            <strong>Theme:</strong> Dark, Dracula (default), or Light mode
          </li>
          <li>
            <strong>Auto-reconnect:</strong> Automatically reconnect if the connection drops
          </li>
        </ul>
        <p className="mt-4 text-muted-foreground">
          Settings and connection info are saved locally and persist across sessions.
        </p>
      </section>

      {/* Security */}
      <section className="mb-12">
        <h2 id="security" className="mb-4 text-xl font-semibold text-foreground">
          Security
        </h2>
        <Callout type="warning" title="Important Security Notes">
          <ul className="mt-2 list-disc pl-4 text-sm space-y-1">
            <li>Always use HTTPS when exposing your server to the internet</li>
            <li>Set a strong password with <code>OPENCODE_SERVER_PASSWORD</code></li>
            <li>Consider using Cloudflare Tunnel or Tailscale for additional security</li>
            <li>Never share your tunnel URL publicly</li>
          </ul>
        </Callout>
        <p className="mt-4 text-muted-foreground">
          The Mobile Terminal uses HTTP Basic Authentication when credentials are provided.
          Your credentials are sent with each request but are never stored on Nexus servers.
        </p>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 id="troubleshooting" className="mb-4 text-xl font-semibold text-foreground">
          Troubleshooting
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium text-foreground">
              "Connection failed" error
            </h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Verify OpenCode server is running (<code>opencode serve</code>)</li>
              <li>Check that the tunnel/port forwarding is active</li>
              <li>Ensure you're using the correct URL (including https://)</li>
              <li>Try accessing the URL directly in your browser first</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              "Authentication required" error
            </h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>The server has a password set - expand "Authentication" and enter credentials</li>
              <li>Default username is <code>opencode</code> if not specified</li>
              <li>Check that <code>OPENCODE_SERVER_PASSWORD</code> matches what you're entering</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Real-time events not working
            </h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>SSE (Server-Sent Events) requires a persistent connection</li>
              <li>Some proxies/tunnels may buffer SSE streams - check their settings</li>
              <li>The connection will auto-reconnect if it drops (when enabled)</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-foreground">
              CORS errors in browser console
            </h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Make sure you started the server with the <code>--cors</code> flag</li>
              <li>The origin should match exactly: <code>--cors https://nexus.yogan.dev</code></li>
            </ul>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
