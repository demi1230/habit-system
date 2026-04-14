-- Phase 6: Rename MANUAL_ENTRY → UNKNOWN in completion_trigger_source enum
-- MANUAL_ENTRY was semantically wrong: 'manual entry' describes an action,
-- not the source unknowability. UNKNOWN correctly means the trigger source
-- was not determined (no reminder linked, no explicit self-initiation recorded).
-- AlterEnum
ALTER TYPE "completion_trigger_source" RENAME VALUE 'MANUAL_ENTRY' TO 'UNKNOWN';
