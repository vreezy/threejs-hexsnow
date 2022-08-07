import { CylinderGeometry, InstancedMesh, Material, MeshStandardMaterial, Vector2 } from 'three';
import groundNormalTexture from '../assets/ground-normal.jpg';
import groundTexture from '../assets/ground.jpg';
import { textureLoader } from 'components/loader';

export class Ground {
   public static create(metalness: number, roughness: number) {
      const geometry = Ground.createGeometry();
      const material = Ground.createMaterial(metalness, roughness);

      return new InstancedMesh(geometry, material, 9000);
   }

   private static createMaterial(metalness: number, roughness: number) {
      const material = new MeshStandardMaterial({
         metalness: metalness,
         roughness: roughness,
         flatShading: true,
      });

      Promise.all([
         textureLoader.loadAsync(groundNormalTexture),
         textureLoader.loadAsync(groundTexture),
      ]).then((values) => {
         material.normalScale = new Vector2(0.3, 0.3);
         material.normalMap = values[0];
         material.map = values[1];
         material.needsUpdate = true;
      });

      return material;
   }

   private static createGeometry() {
      return new CylinderGeometry(1, 1, 1, 6, 1, false);
   }
}
