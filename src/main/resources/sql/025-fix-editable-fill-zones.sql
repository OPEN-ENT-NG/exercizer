UPDATE
  exercizer.grain
SET
  grain_data = regexp_replace(og.grain_data, '>\s*<\s*fill-zone', ' contenteditable=\"false\"><fill-zone', 'g')
FROM
  exercizer.grain og
LEFT JOIN
  exercizer.grain_type gt ON (gt.id = og.grain_type_id)
WHERE
  grain.id = og.id
  AND
  gt."name" = 'text_to_fill'
;

UPDATE
  exercizer.grain_copy
SET
  grain_copy_data = regexp_replace(og.grain_copy_data, '>\s*<\s*fill-zone', ' contenteditable=\"false\"><fill-zone', 'g')
FROM
  exercizer.grain_copy og
LEFT JOIN
  exercizer.grain_type gt ON (gt.id = og.grain_type_id)
WHERE
  grain_copy.id = og.id
  AND
  gt."name" = 'text_to_fill'
;

UPDATE
  exercizer.grain_scheduled
SET
  grain_data = regexp_replace(og.grain_data, '>\s*<\s*fill-zone', ' contenteditable=\"false\"><fill-zone', 'g'),
  grain_custom_data = regexp_replace(og.grain_custom_data, '>\s*<\s*fill-zone', ' contenteditable=\"false\"><fill-zone', 'g')
FROM
  exercizer.grain_scheduled og
LEFT JOIN
  exercizer.grain_type gt ON (gt.id = og.grain_type_id)
WHERE
  grain_scheduled.id = og.id
  AND
  gt."name" = 'text_to_fill'
;