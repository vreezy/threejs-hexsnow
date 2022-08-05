import { BufferGeometry, Mesh } from 'three';

export interface Tile {
   geometry: BufferGeometry;
   count?: number;
   mesh?: Mesh;
}
