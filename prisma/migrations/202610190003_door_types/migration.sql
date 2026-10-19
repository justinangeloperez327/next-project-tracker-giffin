CREATE TABLE IF NOT EXISTS door_type_trackers (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  site_measurement_date DATE,
  drawing_issued_date DATE,
  delivery_date DATE,
  installation_date DATE,
  remarks TEXT NOT NULL DEFAULT '' CHECK (char_length(remarks) <= 4000)
);
CREATE UNIQUE INDEX IF NOT EXISTS door_type_unique_name ON door_type_trackers(project_id, lower(btrim(name)));
-- Retain the original Doors tracker as a named type, with all dates and remarks.
INSERT INTO door_type_trackers(id,project_id,name,site_measurement_date,drawing_issued_date,delivery_date,installation_date,remarks)
SELECT gen_random_uuid(),project_id,'General doors',site_measurement_date,drawing_issued_date,delivery_date,installation_date,remarks
FROM substation_trackers WHERE item='Doors'
ON CONFLICT DO NOTHING;
