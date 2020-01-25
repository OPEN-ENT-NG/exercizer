ALTER TABLE exercizer.subject_scheduled
ADD COLUMN is_training_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN is_training_permitted BOOLEAN DEFAULT FALSE;

ALTER TABLE exercizer.subject_copy
ADD COLUMN is_training_copy BOOLEAN DEFAULT FALSE;