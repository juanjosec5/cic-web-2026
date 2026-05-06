import { createClient } from '@sanity/client';

const projectId: string = import.meta.env.SANITY_PROJECT_ID;
if (!projectId) {
  throw new Error('SANITY_PROJECT_ID is not set. Add it to your .env file (see .env.example).');
}

export const client = createClient({
  projectId,
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  perspective: 'published',
});
