-- Credentials format fields get a Masked flag. Masked values are stored
-- encrypted; db/migrate.ts encrypts existing values after this runs (the key
-- lives in the app's environment, not the database).
-- Existing fields are masked when their name looks like a secret, which is
-- what the UI used to infer from the name.
UPDATE credential_devices d
SET credential_fields = (
  SELECT coalesce(jsonb_agg(
           f || jsonb_build_object('masked', coalesce((f->>'masked')::boolean, (f->>'name') ~* '(pass|pwd|pin|secret|token|key)'))
           ORDER BY ord), '[]'::jsonb)
  FROM jsonb_array_elements(d.credential_fields) WITH ORDINALITY AS e(f, ord)
);
