import { BufferGeometry, Color, CylinderGeometry, Mesh, Vector2, MeshStandardMaterial } from 'three';

export class HexUtils {
   static tileToPosition(tileX: number, tileY: number) {
      return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
   }

   static createGeometry(height: number, position: Vector2) {
      const geometry = new CylinderGeometry(1, 1, height, 6, 1, false);
      geometry.translate(position.x, height * 0.5, position.y);
      return geometry;
   }

   static createMesh(geometry: BufferGeometry, color: Color) {
      const material = new MeshStandardMaterial({ color });
      material.flatShading = true;
      return new Mesh(geometry, material);
   }
}
