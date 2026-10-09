/**
 * Inclusive Size Guide & Measurement-Based Recommendation Engine
 */

export const SIZE_CHART = [
  {
    size: 'XS',
    chestInches: '32 - 34',
    chestCm: '81 - 86',
    waistInches: '26 - 28',
    waistCm: '66 - 71',
    hipInches: '34 - 36',
    hipCm: '86 - 91',
    shoulderInches: '14.0 - 14.5',
    exampleDescription: 'Petite / Slim tailored frame with snug chest and waist line.',
    exampleImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'
  },
  {
    size: 'S',
    chestInches: '35 - 37',
    chestCm: '89 - 94',
    waistInches: '29 - 31',
    waistCm: '74 - 79',
    hipInches: '37 - 39',
    hipCm: '94 - 99',
    shoulderInches: '15.0 - 15.5',
    exampleDescription: 'Trim athletic silhouette with comfortable shoulder armhole.',
    exampleImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'
  },
  {
    size: 'M',
    chestInches: '38 - 40',
    chestCm: '96 - 102',
    waistInches: '32 - 34',
    waistCm: '81 - 86',
    hipInches: '40 - 42',
    hipCm: '102 - 107',
    shoulderInches: '16.0 - 16.5',
    exampleDescription: 'Medium classic contour; balanced chest drape and waist taper.',
    exampleImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500'
  },
  {
    size: 'L',
    chestInches: '41 - 43',
    chestCm: '104 - 109',
    waistInches: '35 - 37',
    waistCm: '89 - 94',
    hipInches: '43 - 45',
    hipCm: '109 - 114',
    shoulderInches: '17.0 - 17.5',
    exampleDescription: 'Generous proportional fit with relaxed posture mobility.',
    exampleImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500'
  },
  {
    size: 'XL',
    chestInches: '44 - 46',
    chestCm: '112 - 117',
    waistInches: '38 - 40',
    waistCm: '96 - 102',
    hipInches: '46 - 48',
    hipCm: '117 - 122',
    shoulderInches: '18.0 - 18.5',
    exampleDescription: 'Broad chest and shoulder structure with clean straight drape.',
    exampleImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500'
  },
  {
    size: 'XXL',
    chestInches: '47 - 49',
    chestCm: '119 - 124',
    waistInches: '41 - 43',
    waistCm: '104 - 109',
    hipInches: '49 - 51',
    hipCm: '124 - 130',
    shoulderInches: '19.0 - 19.5',
    exampleDescription: 'Plus comfort silhouette with expanded chest and waist breadth.',
    exampleImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500'
  },
  {
    size: '3XL',
    chestInches: '50 - 54',
    chestCm: '127 - 137',
    waistInches: '44 - 48',
    waistCm: '112 - 122',
    hipInches: '52 - 56',
    hipCm: '132 - 142',
    shoulderInches: '20.0 - 21.0',
    exampleDescription: 'Extended plus size with reinforced tailoring ease and generous room.',
    exampleImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500'
  }
];

/**
 * Intelligent Size Recommender based strictly on body measurements and fit preference
 * @param {Object} params - { chest, waist, hip, unit: 'inches'|'cm', fitPreference: 'slim'|'regular'|'relaxed' }
 */
export const recommendSize = ({ chest, waist, hip, unit = 'inches', fitPreference = 'regular' }) => {
  if (!chest && !waist) return null;

  // Convert to inches for unified baseline comparison
  let cInches = parseFloat(chest) || 0;
  let wInches = parseFloat(waist) || 0;

  if (unit === 'cm') {
    cInches = cInches / 2.54;
    wInches = wInches / 2.54;
  }

  // Apply ease allowance according to customer fit preference:
  // Slim fit: close to body (-0.5 to 0 inch ease)
  // Regular fit: standard ease (+1.5 to +2 inches)
  // Relaxed fit: breezy loose ease (+3 to +4 inches)
  let effectiveChest = cInches;
  let fitNote = '';

  if (fitPreference === 'slim') {
    effectiveChest = cInches + 0.5;
    fitNote = 'Calculated with 0.5" minimal ease for a tailored, snug silhouette.';
  } else if (fitPreference === 'relaxed') {
    effectiveChest = cInches + 3.0;
    fitNote = 'Calculated with 3.0" extra comfort ease for an airy, relaxed drape.';
  } else {
    effectiveChest = cInches + 1.5;
    fitNote = 'Calculated with 1.5" standard bespoke ease for balanced movement.';
  }

  let recommended = 'M';
  if (effectiveChest <= 34.5) recommended = 'XS';
  else if (effectiveChest <= 37.5) recommended = 'S';
  else if (effectiveChest <= 40.5) recommended = 'M';
  else if (effectiveChest <= 43.5) recommended = 'L';
  else if (effectiveChest <= 46.5) recommended = 'XL';
  else if (effectiveChest <= 49.5) recommended = 'XXL';
  else recommended = '3XL';

  const chartEntry = SIZE_CHART.find(s => s.size === recommended);

  return {
    recommendedSize: recommended,
    effectiveChest: effectiveChest.toFixed(1),
    fitPreference,
    fitNote,
    chartDetails: chartEntry,
    advice: `Based on your body chest of ${cInches.toFixed(1)}" with ${fitPreference} fit, Size ${recommended} will give you the best comfort and proportion.`
  };
};
