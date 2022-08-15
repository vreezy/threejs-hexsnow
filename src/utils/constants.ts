import mobile from 'is-mobile';

export const isMobile = mobile();
export const MAX_WORLD_RADIUS = isMobile ? 45 : 90;
export const MAX_ROCKS = Math.floor(Math.pow(MAX_WORLD_RADIUS, 1.25));
export const MAX_PILLARS = MAX_WORLD_RADIUS * 0.25;
export const MAX_GROUND = MAX_WORLD_RADIUS * 25;
export const MAX_SPIKES = MAX_WORLD_RADIUS * 4;
export const MAX_GRASS = MAX_WORLD_RADIUS * 25;
export const MAX_SAND = MAX_WORLD_RADIUS * 80;
export const MAX_HEIGHT = 10;
