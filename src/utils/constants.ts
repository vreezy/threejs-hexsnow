import mobile from 'is-mobile';

export const urlParams = new URLSearchParams(window.location.search);
export const isDebug = urlParams.has('debug');
export const isMobile = mobile();

export const MAX_WORLD_RADIUS = isMobile ? 250 : 400;
export const MAX_PARTICLES = MAX_WORLD_RADIUS * 1.5;
export const MAX_HEXAGONS = MAX_WORLD_RADIUS * 460;
export const MAX_TREES = MAX_WORLD_RADIUS * 6;
export const MAX_HEIGHT = 70;
