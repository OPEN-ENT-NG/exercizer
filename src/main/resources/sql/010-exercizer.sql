ALTER TABLE exercizer.grain_scheduled ADD COLUMN grain_custom_data text;
ALTER TABLE exercizer.folder DROP CONSTRAINT folder_parent_folder_fk;
ALTER TABLE exercizer.folder ADD CONSTRAINT folder_parent_folder_fk FOREIGN KEY (parent_folder_id) REFERENCES exercizer.folder (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE;