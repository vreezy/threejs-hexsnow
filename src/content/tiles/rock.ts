import { Color, CylinderGeometry, InstancedMesh, Matrix4, MeshStandardMaterial, Vector2 } from 'three';
import normalTexture from '../../assets/rock/rock-normal.jpg';
import texture from '../../assets/rock/rock.jpg';
import { textureLoader } from 'utils/texture-loader';
import { gui } from '../../utils/gui';
import { MAX_ROCK, isMobile } from 'utils/constants';

export class Rock {
   material: MeshStandardMaterial;
   mesh: InstancedMesh;
   color: Color;
   metalness: number;
   roughness: number;
   count: number;

   constructor(hexGeometry: CylinderGeometry) {
      this.color = new Color(0x908297);
      this.metalness = 0.5;
      this.roughness = 0.7;
      this.count = 0;

      this.material = this.createMaterial(this.metalness, this.roughness, this.color);
      this.mesh = this.createMesh(hexGeometry, this.material);
      if (!isMobile) {
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
      return new InstancedMesh(hexGeometry, material, MAX_ROCK);
   }

   private createMaterial(metalness: number, roughness: number, color: Color) {
      const material = new MeshStandardMaterial({
         metalness: metalness,
         roughness: roughness,
         flatShading: true,
         color: color,
      });

      const textures = [textureLoader.loadAsync(texture)];
      if (!isMobile) {
         textures.push(textureLoader.loadAsync(normalTexture));
      }

      Promise.all(textures).then((values) => {
         material.map = values[0];
         if (!isMobile) {
            // material.normalScale = new Vector2(1.5, 1.5);
            material.normalMap = values[1];
         }
         material.needsUpdate = true;
      });

      return material;
   }

   private initGui() {
      const folder = gui.getInstance().addFolder('Rock');
      folder
         .addColor(this, 'color')
         .onChange((value) => this.material.color.set(new Color(value)))
         .name('Color');

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
