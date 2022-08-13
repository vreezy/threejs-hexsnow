import { AmbientLight, Color, Matrix4, PointLight, Scene, Vector2 } from 'three';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';

import { MAX_HEIGHT, MAX_PILLARS, MAX_SPIKES, MAX_WORLD_RADIUS } from '../utils/constants';
import { Hexagon, Pillar, Ground, Spikes, Rocks, Grass, Sand } from 'content';

export class World {
   private heightMap: NoiseFunction2D;
   private ambientLight: AmbientLight;
   private pointLight: PointLight;
   private scene: Scene;

   private pillars: Pillar;
   private ground: Ground;
   private spikes: Spikes;
   private grass: Grass;
   private rocks: Rocks;
   private sand: Sand;

   constructor(_scene: Scene) {
      this.scene = _scene;

      const hexGeometry = Hexagon.createGeometry();
      this.pillars = new Pillar(hexGeometry);
      this.ground = new Ground(hexGeometry);
      this.grass = new Grass(hexGeometry);
      this.sand = new Sand(hexGeometry);
      this.spikes = new Spikes();
      this.rocks = new Rocks();

      this.heightMap = createNoise2D();
   }

   public generate() {
      this.scene.add(this.pillars.mesh);
      this.scene.add(this.ground.mesh);
      this.scene.add(this.spikes.mesh);
      this.scene.add(this.grass.mesh);
      this.scene.add(this.rocks.mesh);
      this.scene.add(this.sand.mesh);

      this.createTiles();
      this.createLights();

      this.pillars.mesh.instanceMatrix.needsUpdate = true;
      this.ground.mesh.instanceMatrix.needsUpdate = true;
      this.spikes.mesh.instanceMatrix.needsUpdate = true;
      this.rocks.mesh.instanceMatrix.needsUpdate = true;
      this.grass.mesh.instanceMatrix.needsUpdate = true;
      this.sand.mesh.instanceMatrix.needsUpdate = true;
      this.pointLight.shadow.needsUpdate = true;
   }

   private createTiles() {
      const matrix = new Matrix4();

      let xPositive = 0;
      let xNegative = 1;
      do {
         const x = (xPositive + xNegative) % 2 === 0 ? xPositive++ : -xNegative++;
         let yPositive = 0;
         let yNegative = 1;

         do {
            const y = (yPositive + yNegative) % 2 === 0 ? yPositive++ : -yNegative++;
            const position = Hexagon.getPosition(x, y);
            if (position.length() < MAX_WORLD_RADIUS) {
               let height = (this.heightMap(x * 0.075, y * 0.075) + 0.75) * 0.6;
               height = Math.pow(height, 2.5) * MAX_HEIGHT + 0.25;
               this.createTile(height, position, matrix);
            }
         } while (yPositive < 100 || yNegative < 100);
      } while (xPositive < 100 || xNegative < 100);
   }

   private createTile(height: number, position: Vector2, matrix: Matrix4) {
      if (height > MAX_HEIGHT * 0.9) {
         return;
      } else if (height > MAX_HEIGHT * 0.895 && MAX_PILLARS > this.pillars.count) {
         this.pillars.createTile(height, position, matrix);
      } else if (height > MAX_HEIGHT * 0.5) {
         this.ground.createTile(height, position, matrix);
         if (Math.random() > 0.92 && MAX_SPIKES > this.spikes.count) {
            this.spikes.createSpike(height, position, matrix);
         }
      } else if (height > MAX_HEIGHT * 0.3) {
         this.grass.createTile(height, position, matrix);
         if (Math.random() > 0.985) {
            this.rocks.createRock(height, position, matrix);
         }
      } else {
         this.sand.createTile(height, position, matrix);
      }
   }

   private createLights() {
      this.ambientLight = new AmbientLight(new Color(0xeca9f5), 0.1);
      this.scene.add(this.ambientLight);

      this.pointLight = new PointLight(new Color(0xffffff).convertSRGBToLinear(), 1.5, 120);
      this.pointLight.position.set(25, 65, 0);
      this.pointLight.castShadow = true;
      this.pointLight.shadow.mapSize.height = 512;
      this.pointLight.shadow.mapSize.width = 512;
      this.pointLight.shadow.autoUpdate = false;
      this.pointLight.shadow.camera.near = 0.5;
      this.pointLight.shadow.camera.far = 50;

      this.scene.add(this.pointLight);
   }

   public update() {}

   private initGui() {}
}
