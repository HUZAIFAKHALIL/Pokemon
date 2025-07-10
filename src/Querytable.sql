DROP TABLE IF EXISTS team_pokemon CASCADE;
DROP TABLE IF EXISTS pokemon CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pokemon (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image TEXT,
  types TEXT[] NOT NULL,
  base_experience INTEGER DEFAULT 0
);

CREATE TABLE team_pokemon (
  id TEXT DEFAULT gen_random_uuid()::text PRIMARY KEY,
  team_id TEXT NOT NULL,
  pokemon_id INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_team_pokemon_team_id FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_team_pokemon_pokemon_id FOREIGN KEY (pokemon_id) REFERENCES pokemon(id) ON DELETE CASCADE,
  UNIQUE(team_id, pokemon_id)
);

CREATE INDEX idx_teams_user_id ON teams(user_id);
CREATE INDEX idx_team_pokemon_team_id ON team_pokemon(team_id);
CREATE INDEX idx_team_pokemon_pokemon_id ON team_pokemon(pokemon_id);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_pokemon ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true);
CREATE POLICY "Allow all operations on pokemon" ON pokemon FOR ALL USING (true);
CREATE POLICY "Allow all operations on team_pokemon" ON team_pokemon FOR ALL USING (true);

INSERT INTO teams (id, name, user_id) VALUES ('1', 'My First Team', 'default_user');
