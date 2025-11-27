CREATE OR REPLACE FUNCTION max_area(build "Build")
RETURNS FLOAT AS $$
BEGIN
  RETURN GREATEST(
    COALESCE(build."NetLeasableArea", 0),
    COALESCE(build."supplyArea", 0),
    COALESCE(build."landArea", 0),
    COALESCE(build."buildingArea", 0),
    COALESCE(build."totalArea", 0),
    COALESCE(build."actualArea", 0)
  );
END;
$$ LANGUAGE plpgsql;
