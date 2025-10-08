CREATE INDEX IF NOT EXISTS subject_copy_subject_scheduled_id_idx ON exercizer.subject_copy USING btree (subject_scheduled_id);
CREATE INDEX IF NOT EXISTS grain_scheduled_subject_scheduled_id_idx  ON exercizer.grain_scheduled USING btree (subject_scheduled_id);
  