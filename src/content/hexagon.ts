import { Color, CylinderGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Vector2 } from 'three';
import { debugGui } from 'utils';
import { MAX_HEXAGONS } from 'utils/constants';

export type HexagonType = 'Ground' | 'Snow' | 'Grass';

export class Hexagon {
   mesh: InstancedMesh;

   private material: MeshStandardMaterial;
   private geometry: CylinderGeometry;
   private groundColor: Color;
   private grassColor: Color;
   private snowColor: Color;
   private metalness: number;
   private roughness: number;
   private count: number;

   constructor() {
      this.geometry = new CylinderGeometry(1, 1, 1, 6, 1, false);
      this.groundColor = new Color(0x061628);
      this.grassColor = new Color(0xea8462);
      this.snowColor = new Color(0xffffff);
      this.metalness = 0.3;
      this.roughness = 0.8;
      this.count = 0;

      this.material = this.createMaterial(this.metalness, this.roughness);
      this.mesh = this.createMesh(this.geometry, this.material);

      this.initDebugUI();
   }

   public getPosition(tileX: number, tileY: number) {
      return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535);
   }

   public addTile(type: HexagonType, height: number, position: Vector2, matrix: Matrix4) {
      let color;
      switch (type) {
         case 'Ground':
            color = this.groundColor;
            break;
         case 'Grass':
            color = this.grassColor;
            break;
         case 'Snow':
            color = this.snowColor;
            break;
      }

      this.count++;
      matrix.makeScale(1, height + 0.25, 1);
      matrix.setPosition(position.x, height * 0.5, position.y);
      this.mesh.setMatrixAt(this.count, matrix);
      this.mesh.setColorAt(this.count, color);
   }

   private createMesh(hexGeometry: CylinderGeometry, material: MeshStandardMaterial) {
      return new InstancedMesh(hexGeometry, material, MAX_HEXAGONS);
   }

   private createMaterial(metalness: number, roughness: number) {
      const material = new MeshStandardMaterial({
         metalness: metalness,
         roughness: roughness,
         flatShading: true,
      });

      return material;
   }

   private initDebugUI() {
      const folder = debugGui.getInstance().addFolder('Hexagon');
      folder
         .addColor(this, 'groundColor')
         .onChange((value) => this.material.color.set(new Color(value)))
         .name('Ground Color');

      folder
         .addColor(this, 'grassColor')
         .onChange((value) => this.material.color.set(new Color(value)))
         .name('Grass Color');

      folder
         .addColor(this, 'snowColor')
         .onChange((value) => this.material.color.set(new Color(value)))
         .name('Snow Color');

      folder
         .add(this, 'metalness', 0, 1, 0.01)
         .onChange((value) => (this.material.metalness = value))
         .name('Metalness');

      folder
         .add(this, 'roughness', 0, 1, 0.01)
         .onChange((value) => (this.material.roughness = value))
         .name('Roughness');
   }
}
