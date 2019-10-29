CREATE OR REPLACE FUNCTION exercizer._trigger_set_modified_date()
RETURNS TRIGGER AS $$
BEGIN
  /* Don't set modified date when changing the id (duplication) */
  IF TG_OP = 'INSERT' OR NEW.id = OLD.id THEN
    NEW.modified = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER folder_set_modified_date
  BEFORE INSERT OR UPDATE ON exercizer.folder
  FOR EACH ROW
  EXECUTE PROCEDURE exercizer._trigger_set_modified_date();

CREATE TRIGGER subject_set_modified_date
  BEFORE INSERT OR UPDATE ON exercizer.subject
  FOR EACH ROW
  EXECUTE PROCEDURE exercizer._trigger_set_modified_date();

CREATE TRIGGER grain_set_modified_date
  BEFORE INSERT OR UPDATE ON exercizer.grain
  FOR EACH ROW
  EXECUTE PROCEDURE exercizer._trigger_set_modified_date();

CREATE TRIGGER subject_scheduled_set_modified_date
  BEFORE INSERT OR UPDATE ON exercizer.subject_scheduled
  FOR EACH ROW
  EXECUTE PROCEDURE exercizer._trigger_set_modified_date();

CREATE TRIGGER subject_copy_set_modified_date
  BEFORE INSERT OR UPDATE ON exercizer.subject_copy
  FOR EACH ROW
  EXECUTE PROCEDURE exercizer._trigger_set_modified_date();

CREATE TRIGGER grain_copy_set_modified_date
  BEFORE INSERT OR UPDATE ON exercizer.grain_copy
  FOR EACH ROW
  EXECUTE PROCEDURE exercizer._trigger_set_modified_date();