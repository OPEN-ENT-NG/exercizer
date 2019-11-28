ALTER TABLE exercizer.subject_scheduled
ADD COLUMN random_display BOOLEAN DEFAULT FALSE;

ALTER TABLE exercizer.grain_copy
ADD COLUMN display_order INTEGER;