import { Color, CylinderGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Vector2 } from 'three';

import { MAX_PILLARS } from '../utils/constants';

export class Pillar {
   material: MeshStandardMaterial;
   mesh: InstancedMesh;
   count: number;

   constructor(hexGeometry: CylinderGeometry) {
      this.count = 0;

      this.material = this.createMaterial();
      this.mesh = this.createMesh(hexGeometry, this.material);
      this.mesh.castShadow = true;

      this.initGui();
   }

   public createTile(height: number, position: Vector2, matrix: Matrix4) {
      height *= 2.5;
      matrix.makeScale(1, height, 1);
      matrix.setPosition(position.x, height * 0.5, position.y);
      this.mesh.setMatrixAt(this.count++, matrix);
   }

   private createMesh(hexGeometry: CylinderGeometry, material: MeshStandardMaterial) {
      return new InstancedMesh(hexGeometry, material, MAX_PILLARS);
   }

   private createMaterial() {
      const material = new MeshStandardMaterial({
         color: new Color(0x9042f5),
         flatShading: true,
      });

      return material;
   }

   private initGui() {}
}
