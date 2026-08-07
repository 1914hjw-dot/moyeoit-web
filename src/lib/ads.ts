/**
 * Moyeoit Central Ad Network Helper & Configuration
 * Provides type-safe AdFit & AdSense slot definitions
 */

export interface AdFitSlotConfig {
  unitId: string;
  width: number;
  height: number;
}

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const ADFIT_HOME_UNIT_ID =
  process.env.NEXT_PUBLIC_ADFIT_HOME || 'DAN-49gp8AsuMSP6lN5n';

export const ADFIT_SLOTS: Record<string, AdFitSlotConfig> = {
  home_banner: {
    unitId: ADFIT_HOME_UNIT_ID,
    width: 320,
    height: 100,
  },
};
