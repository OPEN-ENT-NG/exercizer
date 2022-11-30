DELETE FROM exercizer.grain WHERE subject_id IN (SELECT id FROM exercizer.subject WHERE is_library_subject IS TRUE);
DELETE FROM exercizer.subject_library_main_information WHERE subject_id IN (SELECT id FROM exercizer.subject WHERE is_library_subject IS TRUE);
DELETE FROM exercizer.subject_library_tag WHERE subject_id IN (SELECT id FROM exercizer.subject WHERE is_library_subject IS TRUE);
DELETE FROM exercizer.subject  WHERE is_library_subject IS TRUE;