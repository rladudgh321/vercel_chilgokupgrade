CREATE OR REPLACE FUNCTION increment_build_views(build_id integer)
RETURNS void AS $$
  UPDATE "Build"
  SET views = views + 1
  WHERE id = build_id;
$$ LANGUAGE sql;
