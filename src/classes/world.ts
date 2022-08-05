import {
   AmbientLight,
   BufferGeometry,
   Color,
   ConeGeometry,
   CylinderGeometry,
   Mesh,
   MeshStandardMaterial,
   PointLight,
   Scene,
   SphereGeometry,
   Vector2,
} from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { HexUtils } from './hex-utils';
import { MAX_HEIGHT, MAX_PILLARS, MAX_WORLD_RADIUS } from './constants';
import { Tile } from './tile';

export class World {
   private groundNoise: NoiseFunction2D;
   private ambientLight: AmbientLight;
   private pointLight: PointLight;
   private scene: Scene;
   private pillars: Tile;
   private ground: Tile;

   constructor(_scene: Scene) {
      this.groundNoise = createNoise2D();
      this.scene = _scene;
      this.pillars = {
         geometry: new CylinderGeometry(0, 0, 0),
         count: 0,
      };
      this.ground = {
         geometry: new CylinderGeometry(0, 0, 0),
      };
   }

   public generate() {
      for (let x = -25; x <= 25; x++) {
         for (let y = -25; y <= 25; y++) {
            let position = HexUtils.tileToPosition(x, y);
            if (position.length() > MAX_WORLD_RADIUS) {
               continue;
            }

            let height = (this.groundNoise(x * 0.1, y * 0.1) + 0.75) * 0.5;
            if (height < 0) {
               continue;
            }

            height = Math.pow(height, 3.2) * MAX_HEIGHT;
            this.createTile(height, position);
         }
      }

      this.pillars.mesh = HexUtils.createMesh(this.pillars.geometry, new Color(0x9042f5));
      this.ground.mesh = HexUtils.createMesh(this.ground.geometry, new Color(0xdec4ff));
      this.scene.add(this.pillars.mesh);
      this.scene.add(this.ground.mesh);

      this.createClouds();

      this.pointLight = new PointLight(new Color(0xffffff), 0.7);
      this.pointLight.position.set(10, 20, 10);
      this.scene.add(this.pointLight);

      this.ambientLight = new AmbientLight(new Color(0xffffff), 0.3);
      this.scene.add(this.ambientLight);
   }

   private createTile(height: number, position: Vector2) {
      if (height > MAX_HEIGHT * 0.45 && this.pillars.count < MAX_PILLARS) {
         this.pillars.count++;
         this.pillars.geometry = mergeBufferGeometries([
            HexUtils.createGeometry(height * 2, position),
            this.pillars.geometry,
         ]);
      } else {
         this.ground.geometry = mergeBufferGeometries([
            HexUtils.createGeometry(height, position),
            this.ground.geometry,
         ]);
      }
   }

   private createClouds() {
      let geo = new ConeGeometry(0, 0, 0);
      let count = Math.floor(Math.pow(Math.random(), 0.45) * 10);

      for (let i = 0; i < count; i++) {
         const puff1 = new ConeGeometry(1, 1, 3);
         // const puff2 = new ConeGeometry(1.5, 7, 7);
         // const puff3 = new ConeGeometry(0.9, 7, 7);

         puff1.translate(-1.85, Math.random() * 0.3, 0);
         // puff2.translate(0, Math.random() * 0.3, 0);
         // puff3.translate(1.85, Math.random() * 0.3, 0);

         // const cloudGeo = mergeBufferGeometries([puff1, puff2, puff3]);
         const cloudGeo = puff1;
         cloudGeo.translate(Math.random() * 20 - 10, Math.random() * 7 + 7, Math.random() * 20 - 10);
         cloudGeo.rotateY(Math.random() * Math.PI * 2);

         geo = mergeBufferGeometries([geo, cloudGeo]) as ConeGeometry;
      }

      const mesh = new Mesh(geo, new MeshStandardMaterial());

      this.scene.add(mesh);
   }

   public update() {}
}
