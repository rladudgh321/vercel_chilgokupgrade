CREATE OR REPLACE FUNCTION increment_build_views(build_id integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE "Build"
  SET views = views + 1
  WHERE id = build_id;
$$;
