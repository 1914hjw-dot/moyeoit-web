/**
 * Moyeoit Central Ad Network Helper & Configuration
 * Provides type-safe AdFit & AdSense slot definitions
 */

export interface AdFitSlotConfig {
  unitId: string;
  width: number;
  height: number;
}

const DEFAULT_ADFIT_UNIT_ID = 'DAN-49gp8AsuMSP6lN5n';
const ADFIT_UNIT_ID_PATTERN = /^DAN-[A-Za-z0-9_-]+$/;

export function resolveAdFitUnitId(unitId?: string): string {
  const trimmed = unitId?.trim();
  if (trimmed && ADFIT_UNIT_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }
  return DEFAULT_ADFIT_UNIT_ID;
}

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const ADFIT_HOME_UNIT_ID = resolveAdFitUnitId(
  process.env.NEXT_PUBLIC_ADFIT_HOME
);

export const ADFIT_ROOM_UNIT_ID = resolveAdFitUnitId(
  process.env.NEXT_PUBLIC_ADFIT_ROOM || ADFIT_HOME_UNIT_ID
);

export const ADFIT_SLOTS: Record<string, AdFitSlotConfig> = {
  home_banner: {
    unitId: ADFIT_HOME_UNIT_ID,
    width: 320,
    height: 100,
  },
  room_banner: {
    unitId: ADFIT_ROOM_UNIT_ID,
    width: 320,
    height: 100,
  },
};
