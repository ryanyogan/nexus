-- Fix stack icons that used wrong IDs in migration 0025
-- The seed migration (0023) used different IDs than the icon migration (0025)

-- Backend: stk_axum (not stk_rust_axum)
UPDATE stacks SET icon = 'cog', color = '#DEA584' WHERE id = 'stk_axum';

-- Fullstack: stk_tanstack (not stk_tanstack_start)
UPDATE stacks SET icon = 'layers', color = '#EF4444' WHERE id = 'stk_tanstack';

-- Frontend: stk_svelte (not stk_svelte5)
UPDATE stacks SET icon = 'flame', color = '#FF3E00' WHERE id = 'stk_svelte';

-- Frontend: stk_vue_nuxt (not stk_vue3_nuxt)
UPDATE stacks SET icon = 'box', color = '#42B883' WHERE id = 'stk_vue_nuxt';

-- Styling: stk_tailwind (not stk_tailwind4)
UPDATE stacks SET icon = 'palette', color = '#38BDF8' WHERE id = 'stk_tailwind';
