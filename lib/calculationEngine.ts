/**
 * Calculation Engine for Carbon Emissions
 * Handles all CO2e calculations based on GHG Protocol methodology
 */

import { getFactorById, EmissionFactor } from './emissionFactors';

export interface CalculationInput {
  quantity: number;
  emissionFactorId: string;
}

export interface CalculationResult {
  co2e: number; // Total CO2 equivalent in kg
  emissionFactor: EmissionFactor;
  quantity: number;
  unit: string;
  breakdown?: {
    co2?: number;
    ch4?: number;
    n2o?: number;
  };
}

export interface AggregatedEmissions {
  totalCO2e: number;
  scope1: number;
  scope2: number;
  scope3: number;
  byCategory: Record<string, number>;
  bySource: Record<string, number>;
  count: number;
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate CO2e emissions for a single activity
 */
export function calculateEmissions(input: CalculationInput): CalculationResult {
  const { quantity, emissionFactorId } = input;

  // Get the emission factor from the database
  const emissionFactor = getFactorById(emissionFactorId);

  if (!emissionFactor) {
    throw new Error(`Emission factor not found: ${emissionFactorId}`);
  }

  // Validate quantity
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  if (!isFinite(quantity)) {
    throw new Error('Quantity must be a finite number');
  }

  // Calculate CO2e
  const co2e = quantity * emissionFactor.factor;

  // Round to 3 decimal places for precision
  const roundedCO2e = Math.round(co2e * 1000) / 1000;

  return {
    co2e: roundedCO2e,
    emissionFactor,
    quantity,
    unit: emissionFactor.unit,
  };
}

/**
 * Calculate emissions with detailed breakdown (for future use)
 */
export function calculateEmissionsDetailed(input: CalculationInput): CalculationResult {
  const result = calculateEmissions(input);

  // For now, we assume the emission factor is already in CO2e
  // In the future, we can add detailed breakdown of CO2, CH4, N2O
  result.breakdown = {
    co2: result.co2e * 0.95, // Approximate - CO2 is typically 95% of total
    ch4: result.co2e * 0.04, // CH4 converted to CO2e
    n2o: result.co2e * 0.01, // N2O converted to CO2e
  };

  return result;
}

/**
 * Batch calculate emissions for multiple activities
 */
export function batchCalculateEmissions(inputs: CalculationInput[]): CalculationResult[] {
  return inputs.map((input) => calculateEmissions(input));
}

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Aggregate emissions data for reporting
 */
export function aggregateEmissions(
  emissions: Array<{
    co2e: number;
    scope: string;
    category: string;
    source: string;
  }>
): AggregatedEmissions {
  const result: AggregatedEmissions = {
    totalCO2e: 0,
    scope1: 0,
    scope2: 0,
    scope3: 0,
    byCategory: {},
    bySource: {},
    count: emissions.length,
  };

  emissions.forEach((emission) => {
    // Total emissions
    result.totalCO2e += emission.co2e;

    // By scope
    if (emission.scope === 'Scope 1') {
      result.scope1 += emission.co2e;
    } else if (emission.scope === 'Scope 2') {
      result.scope2 += emission.co2e;
    } else if (emission.scope === 'Scope 3') {
      result.scope3 += emission.co2e;
    }

    // By category
    if (!result.byCategory[emission.category]) {
      result.byCategory[emission.category] = 0;
    }
    result.byCategory[emission.category] += emission.co2e;

    // By source
    if (!result.bySource[emission.source]) {
      result.bySource[emission.source] = 0;
    }
    result.bySource[emission.source] += emission.co2e;
  });

  // Round all values to 2 decimal places
  result.totalCO2e = Math.round(result.totalCO2e * 100) / 100;
  result.scope1 = Math.round(result.scope1 * 100) / 100;
  result.scope2 = Math.round(result.scope2 * 100) / 100;
  result.scope3 = Math.round(result.scope3 * 100) / 100;

  Object.keys(result.byCategory).forEach((key) => {
    result.byCategory[key] = Math.round(result.byCategory[key] * 100) / 100;
  });

  Object.keys(result.bySource).forEach((key) => {
    result.bySource[key] = Math.round(result.bySource[key] * 100) / 100;
  });

  return result;
}

/**
 * Calculate emissions by time period (monthly aggregation)
 */
export function aggregateByMonth(
  emissions: Array<{
    co2e: number;
    date: Date;
  }>
): Array<{ month: string; co2e: number }> {
  const monthlyData: Record<string, number> = {};

  emissions.forEach((emission) => {
    const date = new Date(emission.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    monthlyData[monthKey] += emission.co2e;
  });

  return Object.entries(monthlyData)
    .map(([month, co2e]) => ({
      month,
      co2e: Math.round(co2e * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Calculate emissions by time period (yearly aggregation)
 */
export function aggregateByYear(
  emissions: Array<{
    co2e: number;
    date: Date;
  }>
): Array<{ year: number; co2e: number }> {
  const yearlyData: Record<number, number> = {};

  emissions.forEach((emission) => {
    const year = new Date(emission.date).getFullYear();

    if (!yearlyData[year]) {
      yearlyData[year] = 0;
    }
    yearlyData[year] += emission.co2e;
  });

  return Object.entries(yearlyData)
    .map(([year, co2e]) => ({
      year: parseInt(year),
      co2e: Math.round(co2e * 100) / 100,
    }))
    .sort((a, b) => a.year - b.year);
}

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert CO2e from kg to tonnes
 * NOTE: Deprecated - All units standardized to kg CO₂e
 */
// export function kgToTonnes(kg: number): number {
//   return Math.round((kg / 1000) * 100) / 100;
// }

/**
 * Convert CO2e from tonnes to kg
 * NOTE: Deprecated - All units standardized to kg CO₂e
 */
// export function tonnesToKg(tonnes: number): number {
//   return Math.round(tonnes * 1000 * 100) / 100;
// }

/**
 * Format CO2e for display - always shows in kg CO₂e
 * All emission values standardized to kg for consistency across the application
 */
export function formatCO2e(kg: number): string {
  return `${Math.round(kg * 100) / 100} kg CO₂e`;
}

// ============================================================================
// BENCHMARKING & COMPARISON
// ============================================================================

/**
 * Calculate carbon intensity (emissions per unit of activity)
 * Useful for benchmarking
 */
export function calculateCarbonIntensity(
  totalCO2e: number,
  activityMetric: number,
  unit: string
): { intensity: number; unit: string } {
  if (activityMetric <= 0) {
    throw new Error('Activity metric must be greater than 0');
  }

  const intensity = totalCO2e / activityMetric;

  return {
    intensity: Math.round(intensity * 100) / 100,
    unit: `kg CO₂e per ${unit}`,
  };
}

/**
 * Compare emissions against target/baseline
 */
export function compareToTarget(
  actual: number,
  target: number
): {
  difference: number;
  percentageChange: number;
  status: 'above' | 'below' | 'on-target';
} {
  const difference = actual - target;
  const percentageChange = target > 0 ? (difference / target) * 100 : 0;

  let status: 'above' | 'below' | 'on-target' = 'on-target';
  if (difference > 0) {
    status = 'above';
  } else if (difference < 0) {
    status = 'below';
  }

  return {
    difference: Math.round(difference * 100) / 100,
    percentageChange: Math.round(percentageChange * 10) / 10,
    status,
  };
}

/**
 * Calculate year-over-year change
 */
export function calculateYoYChange(
  currentYear: number,
  previousYear: number
): {
  change: number;
  percentageChange: number;
  trend: 'increasing' | 'decreasing' | 'stable';
} {
  const change = currentYear - previousYear;
  const percentageChange = previousYear > 0 ? (change / previousYear) * 100 : 0;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(percentageChange) < 1) {
    trend = 'stable';
  } else if (percentageChange > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }

  return {
    change: Math.round(change * 100) / 100,
    percentageChange: Math.round(percentageChange * 10) / 10,
    trend,
  };
}

// ============================================================================
// EQUIVALENCY CALCULATIONS
// ============================================================================

/**
 * Convert CO2e to common equivalencies for communication
 */
export function calculateEquivalencies(kgCO2e: number): {
  treesNeeded: number; // Trees needed to offset for 1 year
  carMiles: number; // Equivalent car miles driven
  homeElectricity: number; // Homes' electricity use for 1 year
  smartphones: number; // Smartphones charged
} {
  // Based on EPA equivalencies calculator
  return {
    treesNeeded: Math.round((kgCO2e / 21.77) * 10) / 10, // 1 tree absorbs ~21.77 kg CO2/year
    carMiles: Math.round((kgCO2e / 0.404) * 10) / 10, // Average car emits 404g CO2/mile
    homeElectricity: Math.round((kgCO2e / 10649) * 1000) / 1000, // Average home uses 10,649 kWh/year
    smartphones: Math.round(kgCO2e / 0.008), // Charging a smartphone uses ~8g CO2
  };
}

// ============================================================================
// REDUCTION CALCULATION
// ============================================================================

/**
 * Calculate potential emission reductions from switching sources
 */
export function calculateReductionPotential(
  currentEmissionFactorId: string,
  alternativeEmissionFactorId: string,
  quantity: number
): {
  currentCO2e: number;
  alternativeCO2e: number;
  reduction: number;
  percentageReduction: number;
} {
  const current = calculateEmissions({ quantity, emissionFactorId: currentEmissionFactorId });
  const alternative = calculateEmissions({ quantity, emissionFactorId: alternativeEmissionFactorId });

  const reduction = current.co2e - alternative.co2e;
  const percentageReduction = current.co2e > 0 ? (reduction / current.co2e) * 100 : 0;

  return {
    currentCO2e: current.co2e,
    alternativeCO2e: alternative.co2e,
    reduction: Math.round(reduction * 100) / 100,
    percentageReduction: Math.round(percentageReduction * 10) / 10,
  };
}
