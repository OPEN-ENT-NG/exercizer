/*
 Migrate corrected files to the new model with an external table (idempotent).
 
 Before migration
 ----------------
 - table "subject" has columns: "corrected_file_id" and "corrected_metadata" (never used).
 - table "subject_scheduled" has columns: "corrected_file_id" and "corrected_metadata".
 - table "subject_copy" has columns: "corrected_file_id", "corrected_metadata", "homework_file_id", "homework_metadata".

 After migration
 ---------------
 - table "subject" does not have the columns "corrected_file_id" and "corrected_metadata" anymore.
 - table "subject_scheduled" does not have the columns "corrected_file_id" and "corrected_metadata" anymore.
 - table "subject_document" may have 1 new row with data copied from "corrected_*" columns.
   In that case, "subject_document.doc_type" will be set to 'storage' because the document is available from storage directly.
 => Only migrated documents have a 'storage' doc_type.
    All post-migration documents will be created with a 'workspace' doc_type.

 - table "subject_copy" does not have the columns "corrected_file_id", "corrected_metadata", "homework_file_id" and "homework_metadata" anymore.
 - table "subject_copy_file" may have 2 new rows with data copied from "corrected_*" and "homework_*" columns.
   with "file_type" set to 'corrected' or 'homework' accordingly.
 => Files indexed in table "subject_copy_file" are always available from Storage (not Workspace)
*/

/* --------------------------------------------------------------------------------- */
CREATE OR REPLACE FUNCTION exercizer.migrate_subject_files(int) RETURNS SETOF bigint AS
/* --------------------------------------------------------------------------------- */
$$
DECLARE
  batch_size ALIAS FOR $1;
  apply_offset int := 0;
  last_insert_count int;
BEGIN
  LOOP
    INSERT INTO exercizer.subject_document (subject_id, doc_type, doc_id, metadata)
      SELECT s.id, 'storage', s.corrected_file_id, s.corrected_metadata::jsonb
      FROM exercizer.subject s
      LEFT JOIN exercizer.subject_document sd ON sd.subject_id = s.id AND sd.doc_id = s.corrected_file_id AND sd.doc_type = 'storage'
      WHERE s.corrected_file_id IS NOT NULL AND s.corrected_metadata IS NOT NULL
        AND sd.subject_id IS NULL AND sd.doc_id IS NULL  -- avoid duplicating already migrated files
      ORDER BY s.id
      LIMIT batch_size OFFSET apply_offset;
    GET DIAGNOSTICS last_insert_count := ROW_COUNT;
    apply_offset := apply_offset + last_insert_count;
    EXIT WHEN (last_insert_count < batch_size);
  END LOOP;

  /* Check that all files are migrated. */
  RETURN QUERY SELECT s.id
    FROM exercizer.subject s 
    LEFT JOIN exercizer.subject_document sd ON sd.subject_id = s.id AND sd.doc_id = s.corrected_file_id AND sd.doc_type = 'storage'
    WHERE s.corrected_file_id IS NOT NULL AND s.corrected_metadata IS NOT NULL
      AND sd.subject_id IS NULL AND sd.doc_id IS NULL; -- search missing files
  -- Since execution of QUERY SELECT is not finished, 
  -- we can check whether rows were returned and raise exception if necessary.
  IF FOUND THEN
    RAISE EXCEPTION 'Script 29 failed: some subject files not migrated'; -- stop script if an file is missing
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

/* --------------------------------------------------------------------------------- */
CREATE OR REPLACE FUNCTION exercizer.migrate_subject_scheduled_files(int) RETURNS SETOF bigint AS
/* --------------------------------------------------------------------------------- */
$$
DECLARE
  batch_size ALIAS FOR $1;
  apply_offset int := 0;
  last_insert_count int;
BEGIN
  LOOP
    INSERT INTO exercizer.subject_document (subject_id, doc_type, doc_id, metadata)
      SELECT ss.subject_id, 'storage', ss.corrected_file_id, ss.corrected_metadata::jsonb 
      FROM exercizer.subject_scheduled ss
      LEFT JOIN exercizer.subject_document sd ON sd.subject_id = ss.subject_id AND sd.doc_id = ss.corrected_file_id AND sd.doc_type = 'storage'
      WHERE ss.corrected_file_id IS NOT NULL AND ss.corrected_metadata IS NOT NULL
        AND sd.subject_id IS NULL AND sd.doc_id IS NULL  -- avoid duplicating already migrated files
      ORDER BY ss.subject_id
      LIMIT batch_size OFFSET apply_offset;
    GET DIAGNOSTICS last_insert_count := ROW_COUNT;
    apply_offset := apply_offset + last_insert_count;
    EXIT WHEN (last_insert_count < batch_size);
  END LOOP;

  /* Check that all files are migrated. */
  RETURN QUERY SELECT ss.id
    FROM exercizer.subject_scheduled ss
    LEFT JOIN exercizer.subject_document sd ON sd.subject_id = ss.subject_id AND sd.doc_id = ss.corrected_file_id AND sd.doc_type = 'storage'
    WHERE ss.corrected_file_id IS NOT NULL AND ss.corrected_metadata IS NOT NULL
      AND sd.subject_id IS NULL AND sd.doc_id IS NULL;  -- search missing files
  -- Since execution of QUERY SELECT is not finished, 
  -- we can check whether rows were returned and raise exception if necessary.
  IF FOUND THEN
    RAISE EXCEPTION 'Script 29 failed: some subject_scheduled files not migrated'; -- stop script if an file is missing
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

/* --------------------------------------------------------------------------------- */
CREATE OR REPLACE FUNCTION exercizer.migrate_subject_copy_corrected_files(int) RETURNS SETOF bigint AS
/* --------------------------------------------------------------------------------- */
$$
DECLARE
  batch_size ALIAS FOR $1;
  apply_offset int := 0;
  last_insert_count int;
BEGIN
  LOOP
    INSERT INTO exercizer.subject_copy_file (subject_copy_id, file_type, file_id, metadata)
      SELECT sc.id, 'corrected', sc.corrected_file_id, sc.corrected_metadata::jsonb 
      FROM exercizer.subject_copy sc
      LEFT JOIN exercizer.subject_copy_file scf ON scf.subject_copy_id = sc.id AND scf.file_id = sc.corrected_file_id AND scf.file_type = 'corrected'
      WHERE sc.corrected_file_id IS NOT NULL AND sc.corrected_metadata IS NOT NULL
        AND scf.subject_copy_id IS NULL AND scf.file_id IS NULL  -- avoid duplicating already migrated files
      ORDER BY sc.id
      LIMIT batch_size OFFSET apply_offset;
    GET DIAGNOSTICS last_insert_count := ROW_COUNT;
    apply_offset := apply_offset + last_insert_count;
    EXIT WHEN (last_insert_count < batch_size);
  END LOOP;

  /* Check that all files are migrated. */
  RETURN QUERY SELECT sc.id
    FROM exercizer.subject_copy sc
    LEFT JOIN exercizer.subject_copy_file scf ON scf.subject_copy_id = sc.id AND scf.file_id = sc.corrected_file_id AND scf.file_type = 'corrected'
    WHERE sc.corrected_file_id IS NOT NULL AND sc.corrected_metadata IS NOT NULL
      AND scf.subject_copy_id IS NULL AND scf.file_id IS NULL;  -- search missing files
  -- Since execution of QUERY SELECT is not finished, 
  -- we can check whether rows were returned and raise exception if necessary.
  IF FOUND THEN
    RAISE EXCEPTION 'Script 29 failed: som subject_copy corrected files not migrated'; -- stop script if an file is missing
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

/* --------------------------------------------------------------------------------- */
CREATE OR REPLACE FUNCTION exercizer.migrate_subject_copy_homework_files(int) RETURNS SETOF bigint AS
/* --------------------------------------------------------------------------------- */
$$
DECLARE
  batch_size ALIAS FOR $1;
  apply_offset int := 0;
  last_insert_count int;
BEGIN
  LOOP
    INSERT INTO exercizer.subject_copy_file (subject_copy_id, file_type, file_id, metadata)
      SELECT sc.id, 'homework', sc.homework_file_id, sc.homework_metadata::jsonb 
      FROM exercizer.subject_copy sc
      LEFT JOIN exercizer.subject_copy_file scf ON scf.subject_copy_id = sc.id AND scf.file_id = sc.homework_file_id AND scf.file_type = 'homework'
      WHERE sc.homework_file_id IS NOT NULL AND sc.homework_metadata IS NOT NULL
        AND scf.subject_copy_id IS NULL AND scf.file_id IS NULL  -- avoid duplicating already migrated files
      ORDER BY sc.id
      LIMIT batch_size OFFSET apply_offset;
    GET DIAGNOSTICS last_insert_count := ROW_COUNT;
    apply_offset := apply_offset + last_insert_count;
    EXIT WHEN (last_insert_count < batch_size);
  END LOOP;

  /* Check that all files are migrated. */
  RETURN QUERY SELECT sc.id
    FROM exercizer.subject_copy sc
    LEFT JOIN exercizer.subject_copy_file scf ON scf.subject_copy_id = sc.id AND scf.file_id = sc.homework_file_id AND scf.file_type = 'homework'
    WHERE sc.homework_file_id IS NOT NULL AND sc.homework_metadata IS NOT NULL
      AND scf.subject_copy_id IS NULL AND scf.file_id IS NULL;  -- search missing files
  -- Since execution of QUERY SELECT is not finished, 
  -- we can check whether rows were returned and raise exception if necessary.
  IF FOUND THEN
    RAISE EXCEPTION 'Script 29 failed: some subject_copy homework files not migrated'; -- stop script if an file is missing
  END IF;

  RETURN;
END;
$$ LANGUAGE plpgsql;

/* Do migrate files */
SELECT * FROM exercizer.migrate_subject_files(300);
SELECT * FROM exercizer.migrate_subject_scheduled_files(300);
SELECT * FROM exercizer.migrate_subject_copy_corrected_files(300);
SELECT * FROM exercizer.migrate_subject_copy_homework_files(300);
