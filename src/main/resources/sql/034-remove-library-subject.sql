CREATE INDEX exercizer_grain_subjectid_idx ON exercizer.grain USING btree (subject_id);
CREATE INDEX exercizer_subject_library_main_information_subjectid_idx ON exercizer.subject_library_main_information USING btree (subject_id);
CREATE INDEX exercizer_subject_library_tag_subjectid_idx ON exercizer.subject_library_tag USING btree (subject_id);
CREATE INDEX exercizer_subject_islibrary_idx ON exercizer.subject USING btree (is_library_subject);
DELETE FROM exercizer.grain WHERE subject_id IN (SELECT id FROM exercizer.subject WHERE is_library_subject IS TRUE);
DELETE FROM exercizer.subject_library_main_information WHERE subject_id IN (SELECT id FROM exercizer.subject WHERE is_library_subject IS TRUE);
DELETE FROM exercizer.subject_library_tag WHERE subject_id IN (SELECT id FROM exercizer.subject WHERE is_library_subject IS TRUE);
DELETE FROM exercizer.subject  WHERE is_library_subject IS TRUE;