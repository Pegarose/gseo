import { createSeoSettingsRouteHandlers } from '@seosuite/next/admin';
import '../../../seosuite.config';
import '../../../lib/seo-settings';

export const { GET, PUT } = createSeoSettingsRouteHandlers();
