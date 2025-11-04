
CREATE OR REPLACE FUNCTION increment_post_views(post_id integer)
RETURNS void AS $$
  UPDATE "BoardPost"
  SET views = views + 1
  WHERE id = post_id;
$$ LANGUAGE sql;
