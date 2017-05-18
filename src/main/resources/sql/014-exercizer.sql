ALTER TABLE exercizer.users
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

ALTER TABLE  exercizer.subject_scheduled
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

ALTER TABLE  exercizer.subject_copy
ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
