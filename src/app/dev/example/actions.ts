'use server';

import { createClient } from '../../../../packages/gseo-client/src/index';

export async function scoreUrlAction(url: string) {
  // Key must be injected server-side to prevent exposing to the client bundle
  const apiKey = process.env.GSEO_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'GSEO_API_KEY is not configured on the server.' };
  }

  try {
    const client = createClient({
      apiKey,
      baseUrl: process.env.GSEO_API_URL || 'http://localhost:3000/api/v1',
    });

    const result = await client.scoreUrl({
      url,
      options: {
        includeNeuronWriter: true,
        storeSnapshot: true
      }
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error from SDK:', error);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}
