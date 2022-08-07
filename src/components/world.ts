import {
   AmbientLight,
   Color,
   CylinderGeometry,
   InstancedMesh,
   Matrix4,
   Mesh,
   MeshStandardMaterial,
   PointLight,
   Scene,
   SphereGeometry,
   TextureLoader,
   Vector2,
} from 'three';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { HexUtils } from './hexagon';
import { MAX_HEIGHT, MAX_PILLARS, MAX_ROCKS, MAX_WORLD_RADIUS } from './constants';

import GUI from 'lil-gui';
import { Ground } from './ground';
import { textureLoader } from './loader';

export class World {
   private pillarMaterial: MeshStandardMaterial;
   private groundMaterial: MeshStandardMaterial;

   private heightMap: NoiseFunction2D;
   private ambientLight: AmbientLight;
   private pointLight: PointLight;
   private pillars: InstancedMesh;
   private ground: InstancedMesh;
   private rocks: InstancedMesh;
   private scene: Scene;

   private roughness: number;
   private metalness: number;

   private pillarCount: number;
   private tileCount: number;
   private rockCount: number;

   constructor(_scene: Scene, _gui: GUI) {
      this.scene = _scene;

      const rockGeometry = new SphereGeometry(0.15, 10, 10, 0, 6.28, 0, 1.56);

      this.metalness = 0.6;
      this.roughness = 0.5;

      this.pillarMaterial = new MeshStandardMaterial({
         color: new Color(0x9042f5),
         flatShading: true,
      });
      const rockMaterial = new MeshStandardMaterial();

      this.pillars = new InstancedMesh(groundGeometry, this.pillarMaterial, MAX_PILLARS);
      this.ground = Ground.create(this.metalness, this.roughness);
      this.rocks = new InstancedMesh(rockGeometry, rockMaterial, MAX_ROCKS);

      this.ground.receiveShadow = true;
      this.ground.castShadow = true;
      this.rocks.receiveShadow = true;
      this.pillars.castShadow = true;

      this.heightMap = createNoise2D();

      this.pillarCount = 0;
      this.rockCount = 0;
      this.tileCount = 0;

      this.initGui(_gui);
   }

   public generate() {
      this.scene.add(this.pillars);
      this.scene.add(this.ground);
      this.scene.add(this.rocks);

      const matrix = new Matrix4();
      for (let x = -100; x <= 100; x++) {
         for (let y = -100; y <= 100; y++) {
            this.createTile(x, y, matrix);
         }
      }

      this.ambientLight = new AmbientLight(new Color(0xeca9f5), 0.1);
      this.scene.add(this.ambientLight);

      // this.pointLight = new PointLight(new Color(0xeca9f5).convertSRGBToLinear(), 200, 135);
      // this.pointLight = new PointLight(new Color(0xeca9f5).convertSRGBToLinear(), 2, 120);
      this.pointLight = new PointLight(new Color(0xffffff).convertSRGBToLinear(), 1.5, 120);
      this.pointLight.position.set(25, 65, 0);
      // this.pointLight.position.set(25, 50, 0);
      this.pointLight.castShadow = true;
      this.pointLight.shadow.mapSize.height = 512;
      this.pointLight.shadow.mapSize.width = 512;
      this.pointLight.shadow.autoUpdate = false;
      this.pointLight.shadow.camera.near = 0.5;
      this.pointLight.shadow.camera.far = 50;

      this.scene.add(this.pointLight);

      this.pillars.instanceMatrix.needsUpdate = true;
      this.ground.instanceMatrix.needsUpdate = true;
      this.rocks.instanceMatrix.needsUpdate = true;
      this.pointLight.shadow.needsUpdate = true;
   }

   private createTile(x: number, y: number, matrix: Matrix4) {
      const position = HexUtils.tileToPosition(x, y);
      if (position.length() > MAX_WORLD_RADIUS) {
         return;
      }

      let height = (this.heightMap(x * 0.075, y * 0.075) + 0.75) * 0.6;
      if (height < 0) {
         return;
      }

      height = Math.pow(height, 2.5) * MAX_HEIGHT + 0.25;
      this.createTileGeometry(height, position, ++this.tileCount, matrix);
   }

   private createTileGeometry(height: number, position: Vector2, count: number, matrix: Matrix4) {
      if (height > MAX_HEIGHT * 0.9) {
         return;
      } else if (height > MAX_HEIGHT * 0.895 && MAX_PILLARS > this.pillarCount) {
         height *= 2.5;
         matrix.makeScale(1, height, 1);
         matrix.setPosition(position.x, height * 0.5, position.y);
         this.pillars.setMatrixAt(this.pillarCount, matrix);
         this.pillarCount++;
      } else {
         if (Math.random() > 0.95) {
            this.createRock(height, position, matrix);
         }

         matrix.makeScale(1, height, 1);
         matrix.setPosition(position.x, height * 0.5, position.y);
         this.ground.setMatrixAt(count, matrix);
      }
   }

   private createRock(height: number, position: Vector2, matrix: Matrix4) {
      const xPos = Math.random() * 0.4;
      const yPos = Math.random() * 0.4;

      matrix.makeScale(1, 1, 1);
      matrix.setPosition(position.x + xPos, height, position.y + yPos);
      this.rocks.setMatrixAt(this.rockCount++, matrix);
   }

   public update() {}

   private initGui(gui: GUI) {
      gui.add(this, 'metalness', 0, 1, 0.01)
         .name('Metalness')
         .onChange((value) => {
            this.groundMaterial.metalness = value;
         });

      gui.add(this, 'roughness', 0, 1, 0.01)
         .name('Roughness')
         .onChange((value) => {
            this.groundMaterial.roughness = value;
         });
   }
}
