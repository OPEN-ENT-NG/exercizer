ALTER TABLE exercizer.subject  ADD COLUMN version bigint;
ALTER TABLE exercizer.subject  ADD COLUMN ingest_job_state VARCHAR(20);
