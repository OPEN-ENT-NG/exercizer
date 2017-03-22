ALTER TABLE exercizer.subject ADD COLUMN type character varying(20) NOT NULL DEFAULT 'interactive'::character varying;
ALTER TABLE exercizer.subject_scheduled ADD COLUMN corrected_date timestamp without time zone;
ALTER TABLE exercizer.subject_scheduled ADD COLUMN type character varying(20) NOT NULL DEFAULT 'interactive'::character varying;
ALTER TABLE exercizer.subject_scheduled ADD COLUMN corrected_file_id character varying(36);
ALTER TABLE exercizer.subject_scheduled ADD COLUMN corrected_metadata jsonb;
ALTER TABLE exercizer.subject_scheduled ADD COLUMN is_notify boolean DEFAULT false;
ALTER TABLE exercizer.subject_copy ADD COLUMN corrected_file_id character varying(36);
ALTER TABLE exercizer.subject_copy ADD COLUMN corrected_metadata jsonb;
ALTER TABLE exercizer.subject_copy ADD COLUMN homework_file_id character varying(36);
ALTER TABLE exercizer.subject_copy ADD COLUMN homework_metadata jsonb;
ALTER TABLE exercizer.subject ADD COLUMN corrected_file_id character varying(36);
ALTER TABLE exercizer.subject ADD COLUMN corrected_metadata jsonb;

UPDATE exercizer.subject_scheduled SET is_notify=true;