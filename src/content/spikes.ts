import { Color, ConeGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Vector2 } from 'three';

import { isMobile, MAX_SPIKES } from '../utils/constants';

export class Spikes {
   material: MeshStandardMaterial;
   geometry: ConeGeometry;
   mesh: InstancedMesh;
   count: number;

   constructor() {
      this.count = 0;

      this.material = this.createMaterial();
      this.geometry = this.createGeometry();
      this.mesh = this.createMesh(this.geometry, this.material);
      if (!isMobile) {
         this.mesh.receiveShadow = true;
      }

      this.initGui();
   }

   public createSpike(height: number, position: Vector2, matrix: Matrix4) {
      const xPos = Math.random() * 0.5;
      const yPos = Math.random() * 0.5;
      const rotation = Math.random() - 0.5;

      matrix.makeRotationX(rotation).makeRotationZ(rotation);
      matrix.setPosition(position.x + xPos, height, position.y + yPos);
      this.mesh.setMatrixAt(this.count++, matrix);
   }

   private createGeometry() {
      return new ConeGeometry(0.15, 1.5, 4, 1);
   }

   private createMesh(geometry: ConeGeometry, material: MeshStandardMaterial) {
      return new InstancedMesh(geometry, material, MAX_SPIKES);
   }

   private createMaterial() {
      const material = new MeshStandardMaterial({
         emissive: new Color(0x9042f5),
         color: new Color(0x9042f5),
         flatShading: true,
      });

      return material;
   }

   private initGui() {}
}
