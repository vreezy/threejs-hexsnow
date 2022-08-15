import { CylinderGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Texture, Vector2 } from 'three';
import sandNormalTexture from '../assets/sand/sand-normal.jpg';
import sandTexture from '../assets/sand/sand.jpg';
import { textureLoader } from 'utils/texture-loader';
import { gui } from '../utils/gui';
import { isMobile, MAX_SAND } from 'utils/constants';

export class Sand {
   material: MeshStandardMaterial;
   mesh: InstancedMesh;
   metalness: number;
   roughness: number;
   count: number;

   constructor(hexGeometry: CylinderGeometry) {
      this.metalness = 0.0;
      this.roughness = 1.0;
      this.count = 0;

      this.material = this.createMaterial(this.metalness, this.roughness);
      this.mesh = this.createMesh(hexGeometry, this.material);
      if (!isMobile) {
         this.mesh.receiveShadow = true;
      }

      this.initGui();
   }

   public createTile(height: number, position: Vector2, matrix: Matrix4) {
      matrix.makeScale(1, height, 1);
      matrix.setPosition(position.x, height * 0.5, position.y);
      this.mesh.setMatrixAt(this.count++, matrix);
   }

   private createMesh(hexGeometry: CylinderGeometry, material: MeshStandardMaterial) {
      return new InstancedMesh(hexGeometry, material, MAX_SAND);
   }

   private createMaterial(metalness: number, roughness: number) {
      const material = new MeshStandardMaterial({
         metalness: metalness,
         roughness: roughness,
         flatShading: true,
      });

      const textures = [textureLoader.loadAsync(sandTexture)];
      if (!isMobile) {
         textures.push(textureLoader.loadAsync(sandNormalTexture));
      }

      Promise.all(textures).then((values) => {
         material.map = values[0];
         if (!isMobile) {
            material.normalMap = values[1];
         }
         material.needsUpdate = true;
      });

      return material;
   }

   private initGui() {
      const folder = gui.getInstance().addFolder('Sand');
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
