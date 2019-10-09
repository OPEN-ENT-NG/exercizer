ALTER TABLE exercizer.folder DROP CONSTRAINT folder_parent_folder_fk;
ALTER TABLE exercizer.folder ADD CONSTRAINT folder_parent_folder_fk FOREIGN KEY (parent_folder_id) REFERENCES exercizer.folder(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE exercizer.subject DROP CONSTRAINT subject_folder_fk;
ALTER TABLE exercizer.subject ADD CONSTRAINT subject_folder_fk FOREIGN KEY (folder_id) REFERENCES exercizer.folder(id) ON UPDATE CASCADE;

ALTER TABLE exercizer.grain DROP CONSTRAINT grain_subject_fk;
ALTER TABLE exercizer.grain ADD CONSTRAINT grain_subject_fk FOREIGN KEY (subject_id) REFERENCES exercizer.subject(id) ON UPDATE CASCADE;

ALTER TABLE exercizer.subject_library_main_information DROP CONSTRAINT subject_library_main_information_subject_fk;
ALTER TABLE exercizer.subject_library_main_information ADD CONSTRAINT subject_library_main_information_subject_fk FOREIGN KEY (subject_id) REFERENCES exercizer.subject(id) ON UPDATE CASCADE;

ALTER TABLE exercizer.subject_library_tag DROP CONSTRAINT subject_library_tag_subject_fk;
ALTER TABLE exercizer.subject_library_tag ADD CONSTRAINT subject_library_tag_subject_fk FOREIGN KEY (subject_id) REFERENCES exercizer.subject(id) ON UPDATE CASCADE;

ALTER TABLE exercizer.subject DROP CONSTRAINT subject_original_subject_fk;
ALTER TABLE exercizer.subject ADD CONSTRAINT subject_original_subject_fk FOREIGN KEY (original_subject_id) REFERENCES exercizer.subject(id) ON UPDATE CASCADE;

ALTER TABLE exercizer.subject_scheduled DROP CONSTRAINT subject_scheduled_subject_fk;
ALTER TABLE exercizer.subject_scheduled ADD CONSTRAINT subject_scheduled_subject_fk FOREIGN KEY (subject_id) REFERENCES exercizer.subject(id) ON UPDATE CASCADE;