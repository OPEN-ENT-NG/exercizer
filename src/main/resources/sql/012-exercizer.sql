CREATE INDEX grain_copy_subject_copy_id_idx ON exercizer.grain_copy USING btree (subject_copy_id);

UPDATE exercizer.grain_copy as gc SET modified = NOW(), final_score = (select gc2.calculated_score FROM exercizer.grain_copy gc2 where gc2.id=gc.id) where gc.final_score IS NULL;

UPDATE exercizer.subject_copy as sc SET modified = NOW(), final_score = (select sum(gc.final_score) FROM exercizer.grain_copy gc where gc.subject_copy_id=sc.id);