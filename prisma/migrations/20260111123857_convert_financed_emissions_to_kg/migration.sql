-- Convert financed emissions from tonnes to kg
-- This migration multiplies all financed emission values by 1000 to convert from tonnes CO2e to kg CO2e
-- This standardizes units across the entire application

UPDATE FinancedEmission
SET
  scope1 = scope1 * 1000,
  scope2 = scope2 * 1000,
  scope3 = scope3 * 1000,
  totalEmissions = totalEmissions * 1000;
