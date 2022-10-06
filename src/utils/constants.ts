import mobile from 'is-mobile';

export const isMobile = mobile();
export const MAX_WORLD_RADIUS = isMobile ? 150 : 300;
export const MAX_HEXAGONS = MAX_WORLD_RADIUS * 460;
export const MAX_TREES = MAX_WORLD_RADIUS * 6;
export const MAX_HEIGHT = 70;
