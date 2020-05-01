ALTER TABLE exercizer.subject_scheduled ADD COLUMN correction_notify BOOLEAN DEFAULT FALSE;


/* We must consider pre-existing subjects as already notified */

UPDATE exercizer.subject_scheduled SET correction_notify = TRUE;