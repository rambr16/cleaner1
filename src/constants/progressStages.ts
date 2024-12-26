export const STAGE_WEIGHTS = {
  parsing: 0.1,
  processing: 0.3,
  'mx-lookup': 0.6,
  complete: 1
} as const;

export const STAGE_LABELS = {
  parsing: 'Parsing CSV',
  processing: 'Processing Records',
  'mx-lookup': 'Checking Email Providers',
  complete: 'Complete'
} as const;