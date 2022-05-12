/* Types of subject <-> document/file relations : */
/* - workspace: relates to a document from the workspace app, */
/* - storage: relates to a physical file in storage. Used by migration scripts. */
CREATE TYPE exercizer.subject_document_type as ENUM ('workspace', 'storage');

/* subject <-> document/file relations */
CREATE TABLE exercizer.subject_document(
  id BIGSERIAL NOT NULL PRIMARY KEY,
  subject_id BIGINT NOT NULL,
  created TIMESTAMP DEFAULT NOW(),
  modified TIMESTAMP DEFAULT NOW(),
  doc_type exercizer.subject_document_type NOT NULL DEFAULT 'workspace',
  doc_id character varying(36) NOT NULL,
  metadata jsonb NOT NULL,

  UNIQUE (subject_id, doc_id, doc_type),
  CONSTRAINT subject_document_subject_fk FOREIGN KEY (subject_id) REFERENCES exercizer.subject(id) ON UPDATE CASCADE ON DELETE NO ACTION
);

/* Types of subject_copy <-> file relations : */
/* - homework: a file answering a subject (in other words, a copy from a student), */
/* - corrected: a file correcting an answer to a subject. */
CREATE TYPE exercizer.subject_copy_file_type as ENUM ('corrected', 'homework');

/* subject_copy <-> file relations */
CREATE TABLE exercizer.subject_copy_file(
  id BIGSERIAL NOT NULL PRIMARY KEY,
  subject_copy_id BIGINT NOT NULL,
  created TIMESTAMP DEFAULT NOW(),
  modified TIMESTAMP DEFAULT NOW(),
  file_type exercizer.subject_copy_file_type NOT NULL,
  file_id character varying(36) NOT NULL,
  metadata jsonb NOT NULL,

  UNIQUE (subject_copy_id, file_id, file_type),
  CONSTRAINT subject_copy_file_subject_copy_fk FOREIGN KEY (subject_copy_id) REFERENCES exercizer.subject_copy(id) ON UPDATE CASCADE ON DELETE NO ACTION
);

/* --------------------------------------------------------------------------------- */
CREATE OR REPLACE FUNCTION exercizer._trigger_subject_document_before_insert() RETURNS TRIGGER AS
/* --------------------------------------------------------------------------------- */
$$
DECLARE
docs int;
BEGIN
  /* No more than 5 files can be associated to a subject. */
  SELECT COUNT(*) INTO STRICT docs FROM exercizer.subject_document as sd WHERE sd.subject_id=NEW.subject_id;
  IF (docs >= 5) THEN
    RAISE EXCEPTION 'No more than 5 documents may be attached to a subject.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subject_document_before_insert BEFORE INSERT ON exercizer.subject_document
FOR EACH ROW EXECUTE PROCEDURE exercizer._trigger_subject_document_before_insert();

/* --------------------------------------------------------------------------------- */
CREATE OR REPLACE FUNCTION exercizer._trigger_subject_copy_file_before_insert() RETURNS TRIGGER AS
/* --------------------------------------------------------------------------------- */
$$
DECLARE
found_files int;
BEGIN
  IF NEW.file_type = 'homework' THEN 
    /* No more than 5 "homework" files can be associated to a subject_copy. */
    SELECT COUNT(*) INTO STRICT found_files FROM exercizer.subject_copy_file as scf WHERE scf.subject_copy_id=NEW.subject_copy_id AND scf.file_type='homework';
    IF (found_files >= 5) THEN
      RAISE EXCEPTION 'No more than 5 homeworks may be attached to a subject_copy.';
    END IF;
  ELSE
    /* No more than 1 "corrected" file can be associated to a subject_copy. */
    SELECT COUNT(*) INTO STRICT found_files FROM exercizer.subject_copy_file as scf WHERE scf.subject_copy_id=NEW.subject_copy_id AND scf.file_type='corrected';
    IF (found_files >= 1) THEN
      RAISE EXCEPTION 'No more than 1 corrected may be attached to a subject_copy.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subject_copy_file_before_insert BEFORE INSERT ON exercizer.subject_copy_file
FOR EACH ROW EXECUTE PROCEDURE exercizer._trigger_subject_copy_file_before_insert();
