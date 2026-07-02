# Public landing sales copy IPS note

Vision -> customers can understand that Alfares marketplace services let them sell discounted Alfares/company supplier products, their own products, and available products from other users or the shared catalog.
Goal Impact -> public Bazos landing copy states the sales model and the automation/customer responsibility split before users enter the client panel.
System -> bazos public server-rendered landing page.
Feature -> marketplace sales-source and automation copy for Bazos.
Task -> update landing copy only; avoid deploy.
Execution Plan -> inspect dirty worktree, preserve existing UI asset edits, update only landing copy, validate syntax/build surface without touching unrelated files.
Coding Prompt -> remote worker prompt dated 2026-07-02 for allegro/aukro/bazos landing sales copy.
Code -> services/aukro-service/src/ui/ui.assets.ts.
Validation -> git diff --check passed; npm --prefix services/aukro-service run build passed.
