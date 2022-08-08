import { BufferGeometry, Color, CylinderGeometry, Mesh, Vector2, MeshStandardMaterial, Vector3 } from 'three';

export class Hexagon {
   static createGeometry() {
      return new CylinderGeometry(1, 1, 1, 6, 1, false);
   }

   static getPosition(tileX: number, tileY: number) {
      return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
   }
}
