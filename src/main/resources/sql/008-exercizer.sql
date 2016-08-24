INSERT INTO exercizer.grain_type VALUES 
    (12, 'area_select_image', 'Zone à remplir (images)', 'zoneselect', true);
UPDATE exercizer.grain_type SET 
    illustration='zoneselecttext', 
    public_name='Zone à remplir (texte)' 
WHERE id=11;
