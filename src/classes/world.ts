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
import { HexUtils } from './hex-utils';
import { MAX_HEIGHT, MAX_PILLARS, MAX_ROCKS, MAX_WORLD_RADIUS } from './constants';
import groundNormalTexture from '../assets/ground-normal-medium.jpg';
import groundTexture from '../assets/ground-medium.jpg';
import GUI from 'lil-gui';

export class World {
   private pillarMaterial: MeshStandardMaterial;
   private tileMaterial: MeshStandardMaterial;

   private heightMap: NoiseFunction2D;
   private ambientLight: AmbientLight;
   private pointLight: PointLight;
   private pillars: InstancedMesh;
   private tiles: InstancedMesh;
   private rocks: InstancedMesh;
   private scene: Scene;
   private gui: GUI;

   private textureLoader: TextureLoader;

   private roughness: number;
   private metalness: number;

   private pillarCount: number;
   private tileCount: number;
   private rockCount: number;

   constructor(_scene: Scene, _gui: GUI, _textureLoader: TextureLoader) {
      this.textureLoader = _textureLoader;
      this.scene = _scene;
      this.gui = _gui;

      const tileGeometry = new CylinderGeometry(1, 1, 1, 6, 1, false);
      const rockGeometry = new SphereGeometry(0.15, 10, 10, 0, 6.28, 0, 1.56);

      this.metalness = 0.6;
      this.roughness = 0.5;

      this.pillarMaterial = new MeshStandardMaterial({ color: new Color(0x9042f5), flatShading: true });
      this.tileMaterial = new MeshStandardMaterial({
         metalness: this.metalness,
         roughness: this.roughness,
         flatShading: true,
      });
      const rockMaterial = new MeshStandardMaterial();

      this.pillars = new InstancedMesh(tileGeometry, this.pillarMaterial, MAX_PILLARS);
      this.tiles = new InstancedMesh(tileGeometry, this.tileMaterial, 9000);
      this.rocks = new InstancedMesh(rockGeometry, rockMaterial, MAX_ROCKS);

      this.rocks.receiveShadow = true;
      this.tiles.receiveShadow = true;
      this.pillars.castShadow = true;
      this.tiles.castShadow = true;

      this.heightMap = createNoise2D();

      this.pillarCount = 0;
      this.rockCount = 0;
      this.tileCount = 0;

      this.load();
      this.initGui();
   }

   private async load() {
      const normalPromise = this.textureLoader.loadAsync(groundNormalTexture);
      const groundPromise = this.textureLoader.loadAsync(groundTexture);

      Promise.all([normalPromise, groundPromise]).then((values) => {
         this.tileMaterial.normalMap = values[0];
         this.tileMaterial.normalScale = new Vector2(0.3, 0.3);
         this.tileMaterial.map = values[1];
         this.tileMaterial.needsUpdate = true;
      });
   }

   public generate() {
      this.scene.add(this.pillars);
      this.scene.add(this.tiles);
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
      this.rocks.instanceMatrix.needsUpdate = true;
      this.tiles.instanceMatrix.needsUpdate = true;
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
         this.tiles.setMatrixAt(count, matrix);
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

   private initGui() {
      this.gui
         .add(this, 'metalness', 0, 1, 0.01)
         .name('Metalness')
         .onChange((value) => {
            this.tileMaterial.metalness = value;
         });

      this.gui
         .add(this, 'roughness', 0, 1, 0.01)
         .name('Roughness')
         .onChange((value) => {
            this.tileMaterial.roughness = value;
         });
   }
}
