import { CylinderGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Vector2 } from 'three';
import grassNormalTexture from '../assets/grass/grass-normal.jpg';
import grassTexture from '../assets/grass/grass.jpg';
import { textureLoader } from 'utils/texture-loader';
import { gui } from '../utils/gui';
import { MAX_GRASS, isMobile } from 'utils/constants';

export class Grass {
   material: MeshStandardMaterial;
   mesh: InstancedMesh;
   metalness: number;
   roughness: number;
   count: number;

   constructor(hexGeometry: CylinderGeometry) {
      this.metalness = 0.4;
      this.roughness = 0.8;
      this.count = 0;

      this.material = this.createMaterial(this.metalness, this.roughness);
      this.mesh = this.createMesh(hexGeometry, this.material);
      if (isMobile) {
         this.mesh.receiveShadow = true;
         this.mesh.castShadow = true;
      }

      this.initGui();
   }

   public createTile(height: number, position: Vector2, matrix: Matrix4) {
      matrix.makeScale(1, height, 1);
      matrix.setPosition(position.x, height * 0.5, position.y);
      this.mesh.setMatrixAt(this.count++, matrix);
   }

   private createMesh(hexGeometry: CylinderGeometry, material: MeshStandardMaterial) {
      return new InstancedMesh(hexGeometry, material, MAX_GRASS);
   }

   private createMaterial(metalness: number, roughness: number) {
      const material = new MeshStandardMaterial({
         metalness: metalness,
         roughness: roughness,
         flatShading: true,
      });

      const textures = [textureLoader.loadAsync(grassTexture)];
      if (!isMobile) {
         textures.push(textureLoader.loadAsync(grassNormalTexture));
      }

      Promise.all(textures).then((values) => {
         material.map = values[0];
         if (!isMobile) {
            material.normalScale = new Vector2(0.3, 0.3);
            material.normalMap = values[1];
         }
         material.needsUpdate = true;
      });

      return material;
   }

   private initGui() {
      const folder = gui.getInstance().addFolder('Grass');
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
