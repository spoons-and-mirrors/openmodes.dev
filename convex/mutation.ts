// Barrel export file for all mutations
// Access as api.mutation.functionName

// Mode mutations
export { updateModeStatus, createMode } from "./modes";

// User mutations
export { updateUserRole } from "./users";

// Stats mutations (voting and downloads)
export { vote, recordDownload } from "./stats";

// Revision mutations
export { createRevision, reviewRevision } from "./revisions";

// Cleanup mutations
export { cleanupRejectedModes, getRejectedModeStats } from "./cleanup";
