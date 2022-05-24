ALTER TABLE exercizer.subject DROP COLUMN corrected_file_id;
ALTER TABLE exercizer.subject DROP COLUMN corrected_metadata;

ALTER TABLE exercizer.subject_scheduled DROP COLUMN corrected_file_id;
ALTER TABLE exercizer.subject_scheduled DROP COLUMN corrected_metadata;

ALTER TABLE exercizer.subject_copy DROP COLUMN corrected_file_id;
ALTER TABLE exercizer.subject_copy DROP COLUMN corrected_metadata;
ALTER TABLE exercizer.subject_copy DROP COLUMN homework_file_id;
ALTER TABLE exercizer.subject_copy DROP COLUMN homework_metadata;


DROP FUNCTION exercizer.migrate_subject_files(int);
DROP FUNCTION exercizer.migrate_subject_scheduled_files(int);
DROP FUNCTION exercizer.migrate_subject_copy_corrected_files(int);
DROP FUNCTION exercizer.migrate_subject_copy_homework_files(int);
