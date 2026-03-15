-- Add icons and colors to starter stacks for better visual display

-- Infrastructure (Layer 0)
UPDATE stacks SET icon = 'cloud', color = '#F38020' WHERE id = 'stk_cloudflare_wkrs';
UPDATE stacks SET icon = 'triangle', color = '#000000' WHERE id = 'stk_vercel_edge';

-- Database (Layer 0)
UPDATE stacks SET icon = 'database', color = '#3ECF8E' WHERE id = 'stk_supabase';
UPDATE stacks SET icon = 'database', color = '#00C9A7' WHERE id = 'stk_turso';
UPDATE stacks SET icon = 'database', color = '#C5F74F' WHERE id = 'stk_drizzle';

-- Backend (Layer 1)
UPDATE stacks SET icon = 'flame', color = '#FF5B00' WHERE id = 'stk_hono';
UPDATE stacks SET icon = 'zap', color = '#2596BE' WHERE id = 'stk_trpc';
UPDATE stacks SET icon = 'cog', color = '#DEA584' WHERE id = 'stk_rust_axum';

-- Fullstack (Layer 1)
UPDATE stacks SET icon = 'layers', color = '#EF4444' WHERE id = 'stk_tanstack_start';
UPDATE stacks SET icon = 'box', color = '#000000' WHERE id = 'stk_nextjs';
UPDATE stacks SET icon = 'gem', color = '#CC0000' WHERE id = 'stk_rails8';
UPDATE stacks SET icon = 'bird', color = '#FD4F00' WHERE id = 'stk_phoenix';
UPDATE stacks SET icon = 'cog', color = '#EF3939' WHERE id = 'stk_leptos';

-- Frontend (Layer 2)
UPDATE stacks SET icon = 'zap', color = '#646CFF' WHERE id = 'stk_vite_react';
UPDATE stacks SET icon = 'flame', color = '#FF3E00' WHERE id = 'stk_svelte5';
UPDATE stacks SET icon = 'box', color = '#42B883' WHERE id = 'stk_vue3_nuxt';
UPDATE stacks SET icon = 'cog', color = '#7C3AED' WHERE id = 'stk_rust_wasm';

-- Desktop (Layer 2)
UPDATE stacks SET icon = 'monitor', color = '#24C8DB' WHERE id = 'stk_tauri';
UPDATE stacks SET icon = 'monitor', color = '#6366F1' WHERE id = 'stk_omarchy';

-- Styling (Layer 2)
UPDATE stacks SET icon = 'palette', color = '#38BDF8' WHERE id = 'stk_tailwind4';
UPDATE stacks SET icon = 'component', color = '#000000' WHERE id = 'stk_shadcn';

-- TUI (Layer 3)
UPDATE stacks SET icon = 'terminal', color = '#89B4FA' WHERE id = 'stk_ratatui';
UPDATE stacks SET icon = 'terminal', color = '#00ADD8' WHERE id = 'stk_bubbletea';
UPDATE stacks SET icon = 'terminal', color = '#61DAFB' WHERE id = 'stk_ink';

-- Tooling (Layer 3)
UPDATE stacks SET icon = 'test-tube', color = '#6E9F18' WHERE id = 'stk_vitest';
