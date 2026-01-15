/**
 * Activity Categorization Helpers
 * Assists users in selecting appropriate categories and sources
 */

import {
  emissionCategories,
  emissionFactors,
  getFactorsByScope,
  getFactorsByCategory,
  getCategoriesByScope,
  type EmissionFactor,
  type CategoryInfo,
} from './emissionFactors';

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

/**
 * Get recommended categories based on user activity description
 */
export function suggestCategories(activityDescription: string): CategoryInfo[] {
  const keywords = activityDescription.toLowerCase();
  const suggestions: CategoryInfo[] = [];

  // Scope 1 keywords
  if (
    keywords.includes('gas') ||
    keywords.includes('boiler') ||
    keywords.includes('heater') ||
    keywords.includes('furnace')
  ) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'stationary-combustion'));
  }

  if (
    keywords.includes('vehicle') ||
    keywords.includes('car') ||
    keywords.includes('truck') ||
    keywords.includes('fleet')
  ) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'mobile-combustion'));
  }

  if (keywords.includes('refrigerant') || keywords.includes('ac') || keywords.includes('cooling')) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'fugitive-emissions'));
  }

  // Scope 2 keywords
  if (keywords.includes('electricity') || keywords.includes('power') || keywords.includes('kwh')) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'purchased-electricity'));
  }

  if (keywords.includes('steam') || keywords.includes('heating')) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'purchased-heating'));
  }

  // Scope 3 keywords
  if (keywords.includes('flight') || keywords.includes('travel') || keywords.includes('hotel')) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'business-travel'));
  }

  if (keywords.includes('commute') || keywords.includes('employee')) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'employee-commuting'));
  }

  if (keywords.includes('waste') || keywords.includes('disposal') || keywords.includes('trash')) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'waste-disposal'));
  }

  if (keywords.includes('water') || keywords.includes('wastewater')) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'water-supply'));
  }

  if (keywords.includes('freight') || keywords.includes('shipping') || keywords.includes('delivery')) {
    suggestions.push(...emissionCategories.filter((c) => c.id === 'freight-transport'));
  }

  // Remove duplicates
  return Array.from(new Set(suggestions));
}

/**
 * Get all categories organized by scope
 */
export function getCategoriesGroupedByScope(): Record<
  'Scope 1' | 'Scope 2' | 'Scope 3',
  CategoryInfo[]
> {
  return {
    'Scope 1': getCategoriesByScope('Scope 1'),
    'Scope 2': getCategoriesByScope('Scope 2'),
    'Scope 3': getCategoriesByScope('Scope 3'),
  };
}

// ============================================================================
// SOURCE HELPERS
// ============================================================================

/**
 * Get available sources for a given scope and category
 */
export function getSourcesForCategory(scope: string, category: string): EmissionFactor[] {
  return emissionFactors.filter((f) => f.scope === scope && f.category === category);
}

/**
 * Get recommended sources based on keywords
 */
export function suggestSources(
  category: string,
  keywords: string
): EmissionFactor[] {
  const categoryFactors = getFactorsByCategory(category);
  const lowerKeywords = keywords.toLowerCase();

  const suggestions = categoryFactors.filter((factor) => {
    const lowerSource = factor.source.toLowerCase();
    const lowerDesc = factor.description.toLowerCase();

    return lowerSource.includes(lowerKeywords) || lowerDesc.includes(lowerKeywords);
  });

  return suggestions.length > 0 ? suggestions : categoryFactors;
}

/**
 * Find the most appropriate emission factor based on multiple criteria
 */
export function findBestMatch(
  scope: string,
  category: string,
  sourceKeywords: string
): EmissionFactor | null {
  const sources = getSourcesForCategory(scope, category);

  if (sources.length === 0) {
    return null;
  }

  // Try exact match first
  const exactMatch = sources.find(
    (s) => s.source.toLowerCase() === sourceKeywords.toLowerCase()
  );

  if (exactMatch) {
    return exactMatch;
  }

  // Try partial match
  const partialMatch = sources.find((s) =>
    s.source.toLowerCase().includes(sourceKeywords.toLowerCase())
  );

  if (partialMatch) {
    return partialMatch;
  }

  // Return first source as default
  return sources[0];
}

// ============================================================================
// UNIT HELPERS
// ============================================================================

/**
 * Get compatible units for a given source
 */
export function getUnitsForSource(emissionFactorId: string): string[] {
  const factor = emissionFactors.find((f) => f.id === emissionFactorId);
  return factor ? [factor.unit] : [];
}

/**
 * Validate if a unit is compatible with an emission factor
 */
export function isUnitCompatible(emissionFactorId: string, unit: string): boolean {
  const factor = emissionFactors.find((f) => f.id === emissionFactorId);
  return factor ? factor.unit === unit : false;
}

// ============================================================================
// GUIDED WORKFLOW HELPERS
// ============================================================================

export interface GuidedWorkflowState {
  step: 1 | 2 | 3 | 4 | 5;
  scope?: 'Scope 1' | 'Scope 2' | 'Scope 3';
  category?: string;
  source?: string;
  emissionFactorId?: string;
  quantity?: number;
  unit?: string;
  date?: Date;
  activity?: string;
  notes?: string;
}

/**
 * Get next step options based on current state
 */
export function getNextStepOptions(state: GuidedWorkflowState): {
  step: number;
  prompt: string;
  options: Array<{ value: string; label: string; description?: string }>;
} {
  if (state.step === 1) {
    // Choose scope
    return {
      step: 1,
      prompt: 'Select the emission scope:',
      options: [
        {
          value: 'Scope 1',
          label: 'Scope 1: Direct Emissions',
          description: 'Emissions from sources you own or control',
        },
        {
          value: 'Scope 2',
          label: 'Scope 2: Indirect Energy',
          description: 'Emissions from purchased electricity, heat, or steam',
        },
        {
          value: 'Scope 3',
          label: 'Scope 3: Other Indirect',
          description: 'All other indirect emissions in your value chain',
        },
      ],
    };
  } else if (state.step === 2 && state.scope) {
    // Choose category
    const categories = getCategoriesByScope(state.scope);
    return {
      step: 2,
      prompt: `Select a category for ${state.scope}:`,
      options: categories.map((c) => ({
        value: c.id,
        label: c.name,
        description: c.description,
      })),
    };
  } else if (state.step === 3 && state.scope && state.category) {
    // Choose source
    const sources = getSourcesForCategory(state.scope, state.category);
    return {
      step: 3,
      prompt: 'Select the emission source:',
      options: sources.map((s) => ({
        value: s.id,
        label: s.source,
        description: `${s.description} (${s.unit})`,
      })),
    };
  } else {
    return {
      step: state.step,
      prompt: 'Complete the remaining fields',
      options: [],
    };
  }
}

/**
 * Validate workflow state completeness
 */
export function isWorkflowComplete(state: GuidedWorkflowState): boolean {
  return !!(
    state.scope &&
    state.category &&
    state.emissionFactorId &&
    state.quantity &&
    state.unit &&
    state.date &&
    state.activity
  );
}

// ============================================================================
// COMMON ACTIVITIES TEMPLATES
// ============================================================================

export interface ActivityTemplate {
  id: string;
  name: string;
  description: string;
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  category: string;
  commonSources: string[];
  exampleActivity: string;
  tipText: string;
}

export const activityTemplates: ActivityTemplate[] = [
  {
    id: 'office-electricity',
    name: 'Office Electricity Usage',
    description: 'Monthly electricity consumption for office facilities',
    scope: 'Scope 2',
    category: 'Purchased Electricity',
    commonSources: ['Grid Electricity (US Average)', 'Grid Electricity (UK)', 'Renewable Electricity (Certified)'],
    exampleActivity: 'Office building electricity consumption for January 2024',
    tipText: 'Check your utility bill for kWh consumed',
  },
  {
    id: 'company-vehicles',
    name: 'Company Vehicle Fuel',
    description: 'Fuel consumption for company-owned vehicles',
    scope: 'Scope 1',
    category: 'Mobile Combustion',
    commonSources: ['Gasoline/Petrol', 'Diesel'],
    exampleActivity: 'Fuel for sales team vehicles - January 2024',
    tipText: 'Track fuel receipts or use fleet management data',
  },
  {
    id: 'business-flights',
    name: 'Business Flight Travel',
    description: 'Employee air travel for business purposes',
    scope: 'Scope 3',
    category: 'Business Travel',
    commonSources: ['Flight - Short Haul (<500 km)', 'Flight - Medium Haul (500-3700 km)', 'Flight - Long Haul (>3700 km)'],
    exampleActivity: 'Round-trip flight London to New York for conference',
    tipText: 'Use distance calculators or booking confirmations',
  },
  {
    id: 'natural-gas',
    name: 'Natural Gas Heating',
    description: 'Natural gas for building heating',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    commonSources: ['Natural Gas'],
    exampleActivity: 'Natural gas heating for warehouse - Winter 2024',
    tipText: 'Check gas meter readings or utility bills',
  },
  {
    id: 'employee-commute',
    name: 'Employee Commuting',
    description: 'Daily employee travel to/from work',
    scope: 'Scope 3',
    category: 'Employee Commuting',
    commonSources: ['Personal Car', 'Bus', 'Metro/Subway'],
    exampleActivity: 'Employee commuting survey results - Q1 2024',
    tipText: 'Conduct employee surveys for commute data',
  },
  {
    id: 'waste-disposal',
    name: 'Waste Disposal',
    description: 'Waste sent to landfill or recycling',
    scope: 'Scope 3',
    category: 'Waste Disposal',
    commonSources: ['Landfill', 'Recycling', 'Composting'],
    exampleActivity: 'Monthly waste collection - 500 kg to landfill',
    tipText: 'Get waste data from hauler invoices',
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): ActivityTemplate | undefined {
  return activityTemplates.find((t) => t.id === id);
}

/**
 * Get templates by scope
 */
export function getTemplatesByScope(scope: 'Scope 1' | 'Scope 2' | 'Scope 3'): ActivityTemplate[] {
  return activityTemplates.filter((t) => t.scope === scope);
}

// ============================================================================
// DATA QUALITY HELPERS
// ============================================================================

export interface DataQualityScore {
  score: number; // 0-100
  level: 'High' | 'Medium' | 'Low';
  issues: string[];
  recommendations: string[];
}

/**
 * Assess data quality of an emission entry
 */
export function assessDataQuality(data: {
  quantity: number;
  emissionFactorId: string;
  date: Date;
  activity: string;
  notes?: string;
}): DataQualityScore {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if date is recent
  const daysSinceActivity = (new Date().getTime() - data.date.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceActivity > 365) {
    score -= 20;
    issues.push('Data is over 1 year old');
    recommendations.push('Update with more recent data');
  }

  // Check activity description quality
  if (data.activity.length < 10) {
    score -= 15;
    issues.push('Activity description is too brief');
    recommendations.push('Provide more detailed activity description');
  }

  // Check if notes are provided
  if (!data.notes || data.notes.length === 0) {
    score -= 10;
    issues.push('No additional notes provided');
    recommendations.push('Add notes with data sources or assumptions');
  }

  // Check quantity reasonableness (very basic check)
  if (data.quantity > 1000000) {
    score -= 15;
    issues.push('Quantity seems unusually high');
    recommendations.push('Verify quantity and unit are correct');
  }

  // Determine quality level
  let level: 'High' | 'Medium' | 'Low';
  if (score >= 80) {
    level = 'High';
  } else if (score >= 60) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return {
    score,
    level,
    issues,
    recommendations,
  };
}
