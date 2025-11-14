/**
 * Emission Factors Database
 * Based on GHG Protocol, IPCC, and EPA standards
 * All factors convert to kg CO2e per unit
 */

export interface EmissionFactor {
  id: string;
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  category: string;
  source: string;
  unit: string;
  factor: number; // kg CO2e per unit
  description: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
}

// ============================================================================
// EMISSION CATEGORIES
// ============================================================================

export const emissionCategories: CategoryInfo[] = [
  // SCOPE 1 - Direct Emissions
  {
    id: 'stationary-combustion',
    name: 'Stationary Combustion',
    description: 'Emissions from fuel combustion in stationary equipment (boilers, furnaces, etc.)',
    scope: 'Scope 1',
  },
  {
    id: 'mobile-combustion',
    name: 'Mobile Combustion',
    description: 'Emissions from company-owned or controlled vehicles',
    scope: 'Scope 1',
  },
  {
    id: 'fugitive-emissions',
    name: 'Fugitive Emissions',
    description: 'Intentional or unintentional releases (refrigerants, natural gas leaks, etc.)',
    scope: 'Scope 1',
  },
  {
    id: 'process-emissions',
    name: 'Process Emissions',
    description: 'Emissions from industrial processes (chemical reactions, manufacturing)',
    scope: 'Scope 1',
  },

  // SCOPE 2 - Indirect Energy Emissions
  {
    id: 'purchased-electricity',
    name: 'Purchased Electricity',
    description: 'Emissions from purchased electricity consumption',
    scope: 'Scope 2',
  },
  {
    id: 'purchased-heating',
    name: 'Purchased Heating',
    description: 'Emissions from purchased steam, heat, or cooling',
    scope: 'Scope 2',
  },

  // SCOPE 3 - Other Indirect Emissions
  {
    id: 'business-travel',
    name: 'Business Travel',
    description: 'Employee travel in non-company vehicles (flights, rental cars, taxis)',
    scope: 'Scope 3',
  },
  {
    id: 'employee-commuting',
    name: 'Employee Commuting',
    description: 'Emissions from employee commuting to/from work',
    scope: 'Scope 3',
  },
  {
    id: 'purchased-goods',
    name: 'Purchased Goods & Services',
    description: 'Upstream emissions from purchased products and services',
    scope: 'Scope 3',
  },
  {
    id: 'waste-disposal',
    name: 'Waste Disposal',
    description: 'Emissions from waste treatment and disposal',
    scope: 'Scope 3',
  },
  {
    id: 'water-supply',
    name: 'Water Supply & Treatment',
    description: 'Emissions from water supply and wastewater treatment',
    scope: 'Scope 3',
  },
  {
    id: 'freight-transport',
    name: 'Upstream & Downstream Transportation',
    description: 'Emissions from transportation of goods in third-party vehicles',
    scope: 'Scope 3',
  },
];

// ============================================================================
// EMISSION FACTORS DATABASE
// ============================================================================

export const emissionFactors: EmissionFactor[] = [
  // ========================================
  // SCOPE 1 - STATIONARY COMBUSTION
  // ========================================
  {
    id: 'natural-gas',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    source: 'Natural Gas',
    unit: 'm³',
    factor: 2.0, // kg CO2e per m³
    description: 'Natural gas combustion in boilers, heaters, and furnaces',
  },
  {
    id: 'diesel-stationary',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    source: 'Diesel',
    unit: 'liters',
    factor: 2.68, // kg CO2e per liter
    description: 'Diesel fuel for stationary generators and equipment',
  },
  {
    id: 'fuel-oil',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    source: 'Fuel Oil',
    unit: 'liters',
    factor: 3.18, // kg CO2e per liter
    description: 'Heavy fuel oil for heating and power generation',
  },
  {
    id: 'lpg-stationary',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    source: 'LPG/Propane',
    unit: 'kg',
    factor: 3.0, // kg CO2e per kg
    description: 'Liquefied petroleum gas for heating and cooking',
  },
  {
    id: 'coal',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    source: 'Coal',
    unit: 'kg',
    factor: 2.42, // kg CO2e per kg
    description: 'Coal combustion for heating or industrial processes',
  },
  {
    id: 'biomass',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    source: 'Biomass',
    unit: 'kg',
    factor: 0.0, // Considered carbon neutral under GHG Protocol
    description: 'Biomass fuel (wood, pellets) - carbon neutral',
  },

  // ========================================
  // SCOPE 1 - MOBILE COMBUSTION
  // ========================================
  {
    id: 'gasoline-vehicle',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    source: 'Gasoline/Petrol',
    unit: 'liters',
    factor: 2.31, // kg CO2e per liter
    description: 'Gasoline for passenger cars and light trucks',
  },
  {
    id: 'diesel-vehicle',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    source: 'Diesel',
    unit: 'liters',
    factor: 2.68, // kg CO2e per liter
    description: 'Diesel for trucks, buses, and heavy-duty vehicles',
  },
  {
    id: 'cng-vehicle',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    source: 'CNG (Compressed Natural Gas)',
    unit: 'kg',
    factor: 2.75, // kg CO2e per kg
    description: 'Compressed natural gas for fleet vehicles',
  },
  {
    id: 'aviation-fuel',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    source: 'Aviation Fuel (Jet-A)',
    unit: 'liters',
    factor: 2.52, // kg CO2e per liter
    description: 'Jet fuel for company-owned aircraft',
  },
  {
    id: 'marine-fuel',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    source: 'Marine Diesel',
    unit: 'liters',
    factor: 3.11, // kg CO2e per liter
    description: 'Marine diesel for company-owned vessels',
  },

  // ========================================
  // SCOPE 1 - FUGITIVE EMISSIONS
  // ========================================
  {
    id: 'r134a-refrigerant',
    scope: 'Scope 1',
    category: 'Fugitive Emissions',
    source: 'R-134a Refrigerant',
    unit: 'kg',
    factor: 1430, // kg CO2e per kg (GWP)
    description: 'Common refrigerant in AC and cooling systems',
  },
  {
    id: 'r404a-refrigerant',
    scope: 'Scope 1',
    category: 'Fugitive Emissions',
    source: 'R-404A Refrigerant',
    unit: 'kg',
    factor: 3922, // kg CO2e per kg (GWP)
    description: 'Commercial refrigeration refrigerant',
  },
  {
    id: 'r410a-refrigerant',
    scope: 'Scope 1',
    category: 'Fugitive Emissions',
    source: 'R-410A Refrigerant',
    unit: 'kg',
    factor: 2088, // kg CO2e per kg (GWP)
    description: 'HVAC system refrigerant',
  },
  {
    id: 'methane-leak',
    scope: 'Scope 1',
    category: 'Fugitive Emissions',
    source: 'Methane (CH4)',
    unit: 'kg',
    factor: 25, // kg CO2e per kg (GWP 100-year)
    description: 'Methane leaks from equipment or processes',
  },

  // ========================================
  // SCOPE 2 - PURCHASED ELECTRICITY
  // ========================================
  {
    id: 'grid-electricity-us',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    source: 'Grid Electricity (US Average)',
    unit: 'kWh',
    factor: 0.42, // kg CO2e per kWh (EPA eGRID 2023)
    description: 'US national average grid electricity',
  },
  {
    id: 'grid-electricity-uk',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    source: 'Grid Electricity (UK)',
    unit: 'kWh',
    factor: 0.233, // kg CO2e per kWh
    description: 'United Kingdom grid electricity',
  },
  {
    id: 'grid-electricity-eu',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    source: 'Grid Electricity (EU Average)',
    unit: 'kWh',
    factor: 0.295, // kg CO2e per kWh
    description: 'European Union average grid electricity',
  },
  {
    id: 'grid-electricity-china',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    source: 'Grid Electricity (China)',
    unit: 'kWh',
    factor: 0.581, // kg CO2e per kWh
    description: 'China national grid electricity',
  },
  {
    id: 'grid-electricity-india',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    source: 'Grid Electricity (India)',
    unit: 'kWh',
    factor: 0.708, // kg CO2e per kWh
    description: 'India national grid electricity',
  },
  {
    id: 'renewable-electricity',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    source: 'Renewable Electricity (Certified)',
    unit: 'kWh',
    factor: 0.0, // kg CO2e per kWh
    description: 'Certified renewable energy (solar, wind, hydro)',
  },

  // ========================================
  // SCOPE 2 - PURCHASED HEATING/COOLING
  // ========================================
  {
    id: 'district-heating',
    scope: 'Scope 2',
    category: 'Purchased Heating',
    source: 'District Heating',
    unit: 'kWh',
    factor: 0.185, // kg CO2e per kWh
    description: 'Purchased steam or hot water from district heating',
  },
  {
    id: 'district-cooling',
    scope: 'Scope 2',
    category: 'Purchased Heating',
    source: 'District Cooling',
    unit: 'kWh',
    factor: 0.095, // kg CO2e per kWh
    description: 'Purchased chilled water from district cooling',
  },

  // ========================================
  // SCOPE 3 - BUSINESS TRAVEL
  // ========================================
  {
    id: 'flight-short-haul',
    scope: 'Scope 3',
    category: 'Business Travel',
    source: 'Flight - Short Haul (<500 km)',
    unit: 'passenger-km',
    factor: 0.158, // kg CO2e per passenger-km
    description: 'Domestic or short international flights',
  },
  {
    id: 'flight-medium-haul',
    scope: 'Scope 3',
    category: 'Business Travel',
    source: 'Flight - Medium Haul (500-3700 km)',
    unit: 'passenger-km',
    factor: 0.109, // kg CO2e per passenger-km
    description: 'Medium distance international flights',
  },
  {
    id: 'flight-long-haul',
    scope: 'Scope 3',
    category: 'Business Travel',
    source: 'Flight - Long Haul (>3700 km)',
    unit: 'passenger-km',
    factor: 0.114, // kg CO2e per passenger-km
    description: 'Long distance international flights',
  },
  {
    id: 'train-diesel',
    scope: 'Scope 3',
    category: 'Business Travel',
    source: 'Train - Diesel',
    unit: 'passenger-km',
    factor: 0.041, // kg CO2e per passenger-km
    description: 'Diesel-powered trains',
  },
  {
    id: 'train-electric',
    scope: 'Scope 3',
    category: 'Business Travel',
    source: 'Train - Electric',
    unit: 'passenger-km',
    factor: 0.006, // kg CO2e per passenger-km
    description: 'Electric-powered trains',
  },
  {
    id: 'taxi-car',
    scope: 'Scope 3',
    category: 'Business Travel',
    source: 'Taxi/Ride Share',
    unit: 'km',
    factor: 0.195, // kg CO2e per km
    description: 'Taxi or ride-sharing services',
  },
  {
    id: 'rental-car',
    scope: 'Scope 3',
    category: 'Business Travel',
    source: 'Rental Car',
    unit: 'km',
    factor: 0.171, // kg CO2e per km
    description: 'Rental car for business travel',
  },
  {
    id: 'hotel-night',
    scope: 'Scope 3',
    category: 'Business Travel',
    source: 'Hotel Stay',
    unit: 'room-night',
    factor: 10.8, // kg CO2e per room-night
    description: 'Hotel accommodation during business travel',
  },

  // ========================================
  // SCOPE 3 - EMPLOYEE COMMUTING
  // ========================================
  {
    id: 'commute-car',
    scope: 'Scope 3',
    category: 'Employee Commuting',
    source: 'Personal Car',
    unit: 'km',
    factor: 0.171, // kg CO2e per km
    description: 'Employee commuting by personal car',
  },
  {
    id: 'commute-bus',
    scope: 'Scope 3',
    category: 'Employee Commuting',
    source: 'Bus',
    unit: 'passenger-km',
    factor: 0.089, // kg CO2e per passenger-km
    description: 'Employee commuting by bus',
  },
  {
    id: 'commute-metro',
    scope: 'Scope 3',
    category: 'Employee Commuting',
    source: 'Metro/Subway',
    unit: 'passenger-km',
    factor: 0.041, // kg CO2e per passenger-km
    description: 'Employee commuting by metro/subway',
  },
  {
    id: 'commute-bicycle',
    scope: 'Scope 3',
    category: 'Employee Commuting',
    source: 'Bicycle',
    unit: 'km',
    factor: 0.0, // kg CO2e per km
    description: 'Employee commuting by bicycle - zero emissions',
  },

  // ========================================
  // SCOPE 3 - WASTE DISPOSAL
  // ========================================
  {
    id: 'waste-landfill',
    scope: 'Scope 3',
    category: 'Waste Disposal',
    source: 'Landfill',
    unit: 'kg',
    factor: 0.569, // kg CO2e per kg
    description: 'Waste sent to landfill',
  },
  {
    id: 'waste-incineration',
    scope: 'Scope 3',
    category: 'Waste Disposal',
    source: 'Incineration',
    unit: 'kg',
    factor: 0.021, // kg CO2e per kg
    description: 'Waste incinerated with energy recovery',
  },
  {
    id: 'waste-recycling',
    scope: 'Scope 3',
    category: 'Waste Disposal',
    source: 'Recycling',
    unit: 'kg',
    factor: -0.021, // kg CO2e per kg (negative = avoided emissions)
    description: 'Recycled waste - avoided emissions',
  },
  {
    id: 'waste-composting',
    scope: 'Scope 3',
    category: 'Waste Disposal',
    source: 'Composting',
    unit: 'kg',
    factor: 0.045, // kg CO2e per kg
    description: 'Organic waste composting',
  },

  // ========================================
  // SCOPE 3 - WATER
  // ========================================
  {
    id: 'water-supply',
    scope: 'Scope 3',
    category: 'Water Supply & Treatment',
    source: 'Water Supply',
    unit: 'm³',
    factor: 0.344, // kg CO2e per m³
    description: 'Municipal water supply',
  },
  {
    id: 'wastewater-treatment',
    scope: 'Scope 3',
    category: 'Water Supply & Treatment',
    source: 'Wastewater Treatment',
    unit: 'm³',
    factor: 0.708, // kg CO2e per m³
    description: 'Wastewater treatment and discharge',
  },

  // ========================================
  // SCOPE 3 - FREIGHT TRANSPORT
  // ========================================
  {
    id: 'freight-truck',
    scope: 'Scope 3',
    category: 'Upstream & Downstream Transportation',
    source: 'Truck Freight',
    unit: 'tonne-km',
    factor: 0.118, // kg CO2e per tonne-km
    description: 'Goods transported by truck',
  },
  {
    id: 'freight-rail',
    scope: 'Scope 3',
    category: 'Upstream & Downstream Transportation',
    source: 'Rail Freight',
    unit: 'tonne-km',
    factor: 0.022, // kg CO2e per tonne-km
    description: 'Goods transported by rail',
  },
  {
    id: 'freight-ship',
    scope: 'Scope 3',
    category: 'Upstream & Downstream Transportation',
    source: 'Sea Freight',
    unit: 'tonne-km',
    factor: 0.011, // kg CO2e per tonne-km
    description: 'Goods transported by cargo ship',
  },
  {
    id: 'freight-air',
    scope: 'Scope 3',
    category: 'Upstream & Downstream Transportation',
    source: 'Air Freight',
    unit: 'tonne-km',
    factor: 1.12, // kg CO2e per tonne-km
    description: 'Goods transported by air cargo',
  },

  // ========================================
  // SCOPE 3 - PURCHASED GOODS (COMMON ITEMS)
  // ========================================
  {
    id: 'paper-virgin',
    scope: 'Scope 3',
    category: 'Purchased Goods & Services',
    source: 'Virgin Paper',
    unit: 'kg',
    factor: 1.32, // kg CO2e per kg
    description: 'New paper products',
  },
  {
    id: 'paper-recycled',
    scope: 'Scope 3',
    category: 'Purchased Goods & Services',
    source: 'Recycled Paper',
    unit: 'kg',
    factor: 0.83, // kg CO2e per kg
    description: 'Recycled paper products',
  },
  {
    id: 'plastic-generic',
    scope: 'Scope 3',
    category: 'Purchased Goods & Services',
    source: 'Plastic Products',
    unit: 'kg',
    factor: 3.5, // kg CO2e per kg
    description: 'Generic plastic products',
  },
  {
    id: 'steel',
    scope: 'Scope 3',
    category: 'Purchased Goods & Services',
    source: 'Steel',
    unit: 'kg',
    factor: 2.0, // kg CO2e per kg
    description: 'Steel products',
  },
  {
    id: 'aluminum',
    scope: 'Scope 3',
    category: 'Purchased Goods & Services',
    source: 'Aluminum',
    unit: 'kg',
    factor: 8.5, // kg CO2e per kg
    description: 'Aluminum products',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all emission factors for a specific scope
 */
export function getFactorsByScope(scope: 'Scope 1' | 'Scope 2' | 'Scope 3'): EmissionFactor[] {
  return emissionFactors.filter((f) => f.scope === scope);
}

/**
 * Get all emission factors for a specific category
 */
export function getFactorsByCategory(category: string): EmissionFactor[] {
  return emissionFactors.filter((f) => f.category === category);
}

/**
 * Find a specific emission factor by ID
 */
export function getFactorById(id: string): EmissionFactor | undefined {
  return emissionFactors.find((f) => f.id === id);
}

/**
 * Find a specific emission factor by source name
 */
export function getFactorBySource(source: string): EmissionFactor | undefined {
  return emissionFactors.find((f) => f.source === source);
}

/**
 * Get all categories for a specific scope
 */
export function getCategoriesByScope(scope: 'Scope 1' | 'Scope 2' | 'Scope 3'): CategoryInfo[] {
  return emissionCategories.filter((c) => c.scope === scope);
}

/**
 * Get category info by ID
 */
export function getCategoryById(id: string): CategoryInfo | undefined {
  return emissionCategories.find((c) => c.id === id);
}

/**
 * Get all unique units used in emission factors
 */
export function getAllUnits(): string[] {
  return Array.from(new Set(emissionFactors.map((f) => f.unit)));
}

/**
 * Calculate CO2e emissions
 */
export function calculateCO2e(quantity: number, emissionFactorId: string): number {
  const factor = getFactorById(emissionFactorId);
  if (!factor) {
    throw new Error(`Emission factor not found: ${emissionFactorId}`);
  }
  return quantity * factor.factor;
}

/**
 * Get all sources grouped by category
 */
export function getSourcesByCategory(category: string): string[] {
  return emissionFactors
    .filter((f) => f.category === category)
    .map((f) => f.source);
}
