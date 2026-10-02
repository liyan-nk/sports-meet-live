import type { PosterTemplateConfig } from '../types/poster';

/**
 * CENTRALIZED DUMMY BRANDING CONFIGURATION
 * 
 * When official Sports Meet branding is finalized, update the values below
 * without rewriting the poster generator logic.
 */
export const DUMMY_BRANDING = {
  mainTitle: 'SPORTS MEET 2026',
  subTitle: 'COLLEGE ANNUAL ATHLETICS CHAMPIONSHIP',
  footerText: 'OFFICIAL CHAMPIONSHIP RESULT • 2026',
  tagline: 'VICTORY & HONOR',
};

export const POSTER_TEMPLATES: PosterTemplateConfig[] = [
  {
    id: 'template-champion',
    name: 'Champion',
    description: 'Classic high-impact editorial sports layout with gold/silver accents and geometric framing.',
    width: 1080,
    height: 1350,
    theme: {
      backgroundColor: '#0B0F17',
      cardBgColor: '#141B2D',
      accentGold: '#F59E0B',
      accentSilver: '#CBD5E1',
      accentBronze: '#D97706',
      textColor: '#FFFFFF',
      mutedTextColor: '#94A3B8',
      borderStyle: 'classic',
    },
  },
  {
    id: 'template-victory',
    name: 'Victory',
    description: 'Dynamic athletic design featuring bold typography, diagonal accent cuts, and hero position badges.',
    width: 1080,
    height: 1350,
    theme: {
      backgroundColor: '#070A10',
      cardBgColor: '#0F172A',
      accentGold: '#EAB308',
      accentSilver: '#E2E8F0',
      accentBronze: '#B45309',
      textColor: '#F8FAFC',
      mutedTextColor: '#64748B',
      borderStyle: 'modern',
    },
  },
];
