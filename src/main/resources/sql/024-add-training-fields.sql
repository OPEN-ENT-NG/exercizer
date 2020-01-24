ALTER TABLE exercizer.subject_scheduled
ADD COLUMN is_training_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN is_training_permitted BOOLEAN DEFAULT FALSE,
ADD COLUMN subject_training_id BIGINT,
ADD CONSTRAINT subject_training_subject_scheduled_fk
FOREIGN KEY(subject_training_id)
REFERENCES exercizer.subject_scheduled(id)
ON UPDATE CASCADE ON DELETE NO ACTION;