import { InstancedMesh, Matrix4, MeshStandardMaterial, SphereGeometry, Vector2 } from 'three';

import { isMobile, MAX_ROCKS } from '../utils/constants';

export class Rocks {
   material: MeshStandardMaterial;
   geometry: SphereGeometry;
   mesh: InstancedMesh;
   count: number;

   constructor() {
      this.count = 0;

      this.material = this.createMaterial();
      this.geometry = this.createGeometry();
      this.mesh = this.createMesh(this.geometry, this.material);
      if (isMobile) {
         this.mesh.receiveShadow = true;
      }

      this.initGui();
   }

   public createRock(height: number, position: Vector2, matrix: Matrix4) {
      const scale = Math.random() * 1.5;
      const xPos = Math.random() * 0.4;
      const yPos = Math.random() * 0.4;

      matrix.makeScale(scale, scale, scale);
      matrix.setPosition(position.x + xPos, height, position.y + yPos);
      this.mesh.setMatrixAt(this.count++, matrix);
   }

   private createGeometry() {
      return new SphereGeometry(0.15, 10, 10, 0, 6.28, 0, 1.56);
   }

   private createMesh(geometry: SphereGeometry, material: MeshStandardMaterial) {
      return new InstancedMesh(geometry, material, MAX_ROCKS);
   }

   private createMaterial() {
      const material = new MeshStandardMaterial();

      return material;
   }

   private initGui() {}
}
