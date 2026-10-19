CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS auth_attempts (email TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_start TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS projects (id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, so_no TEXT NOT NULL, jo_no TEXT NOT NULL, project_name TEXT NOT NULL, client TEXT NOT NULL, contract_price NUMERIC(16,2) NOT NULL CHECK(contract_price >= 0), category TEXT NOT NULL CHECK(category IN ('Substation','Guardrail','Handrail','Bus Shelters')), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, so_no, jo_no));
CREATE INDEX IF NOT EXISTS projects_owner ON projects(user_id);
