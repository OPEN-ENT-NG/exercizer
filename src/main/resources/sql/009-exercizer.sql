ALTER TABLE exercizer.grain_scheduled DROP CONSTRAINT grain_scheduled_subject_fk;
ALTER TABLE exercizer.grain_scheduled ADD CONSTRAINT grain_scheduled_subject_fk FOREIGN KEY(subject_scheduled_id) REFERENCES exercizer.subject_scheduled(id) ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE exercizer.subject_copy DROP CONSTRAINT subject_copy_subject_scheduled_fk;
ALTER TABLE exercizer.subject_copy ADD CONSTRAINT subject_copy_subject_scheduled_fk FOREIGN KEY(subject_scheduled_id) REFERENCES exercizer.subject_scheduled(id) ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE exercizer.grain_copy DROP CONSTRAINT grain_copy_subject_copy_fk;
ALTER TABLE exercizer.grain_copy DROP CONSTRAINT grain_copy_grain_scheduled_fk;
ALTER TABLE exercizer.grain_copy ADD CONSTRAINT grain_copy_subject_copy_fk FOREIGN KEY(subject_copy_id) REFERENCES exercizer.subject_copy(id) ON UPDATE NO ACTION ON DELETE CASCADE;
ALTER TABLE exercizer.grain_copy ADD CONSTRAINT grain_copy_grain_scheduled_fk FOREIGN KEY(grain_scheduled_id) REFERENCES exercizer.grain_scheduled(id) ON UPDATE NO ACTION ON DELETE CASCADE;