CREATE TABLE IF NOT EXISTS substation_trackers (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item TEXT NOT NULL CHECK (item IN ('Doors', 'Grating beam support', 'Grating panel')),
  site_measurement_date DATE,
  drawing_issued_date DATE,
  delivery_date DATE,
  installation_date DATE,
  remarks TEXT NOT NULL DEFAULT '' CHECK (char_length(remarks) <= 4000),
  PRIMARY KEY (project_id, item)
);
CREATE TABLE IF NOT EXISTS bus_shelter_trackers (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  total INTEGER NOT NULL CHECK (total >= 0 AND total <= 1000000),
  installed INTEGER NOT NULL CHECK (installed >= 0 AND installed <= total)
);
