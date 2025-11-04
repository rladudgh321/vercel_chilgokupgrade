CREATE OR REPLACE FUNCTION max_price(build "Build")
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(
    COALESCE(build."salePrice", 0),
    COALESCE(build."actualEntryCost", 0),
    COALESCE(build."rentalPrice", 0),
    COALESCE(build."managementFee", 0)
  );
END;
$$ LANGUAGE plpgsql;