-- Ensure all starter stacks are active and public
-- This migration ensures the seeded stacks appear on the landing page

UPDATE stacks 
SET is_active = 1, is_public = 1 
WHERE is_starter = 1;
