-- Fixed test device UUID so the agent has something to reference
-- before real device registration (FR-11a) exists.
INSERT INTO devices (id, label, api_key_hash)
VALUES ('11111111-1111-1111-1111-111111111111', 'Dev Test Machine', 'not-a-real-hash-yet')
ON CONFLICT (id) DO NOTHING;