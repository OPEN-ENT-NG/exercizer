ALTER TABLE exercizer.subject_scheduled
ADD COLUMN is_training_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN is_training_permitted BOOLEAN DEFAULT FALSE;

ALTER TABLE exercizer.subject_copy
ADD COLUMN is_training_copy BOOLEAN DEFAULT FALSE,
ADD COLUMN current_grain_id BIGINT,
ADD CONSTRAINT subject_copy_current_grain_fk FOREIGN KEY(current_grain_id) REFERENCES exercizer.grain_copy(id) ON UPDATE CASCADE ON DELETE NO ACTION;