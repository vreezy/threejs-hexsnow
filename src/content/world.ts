import {
   AmbientLight,
   Color,
   Fog,
   InstancedMesh,
   Matrix4,
   PerspectiveCamera,
   PointLight,
   Scene,
   Vector2,
} from 'three';

import { generateNoise, gui } from 'utils';
import { isMobile, MAX_HEIGHT, MAX_WORLD_RADIUS } from 'utils/constants';
import { getNoise } from 'utils/noise-generator';
import { Particles } from './particles';
import { Hexagon, HexagonType } from './hexagon';
import { Skybox } from './skybox';
import { Ice } from './ice';
import { Trees } from './trees';

export class World {
   private camera: PerspectiveCamera;
   private ambientLight: AmbientLight;
   private pointLight: PointLight;
   private particles: Particles;
   private hexagon: Hexagon;
   private skybox: Skybox;
   private scene: Scene;
   private trees: Trees;
   private ice: Ice;
   private fog: Fog;

   constructor(_scene: Scene, _camera: PerspectiveCamera) {
      this.camera = _camera;
      this.scene = _scene;
   }

   public async generate() {
      const heightMap = generateNoise(1000);

      this.particles = new Particles(this.camera);
      this.hexagon = new Hexagon();
      this.skybox = new Skybox();
      this.ice = new Ice(heightMap);
      this.trees = new Trees();
      await this.trees.loadMesh();

      this.scene.background = this.skybox.cubeTexture;
      this.scene.add(this.particles.points);
      this.scene.add(this.trees.treeGroup);
      this.scene.add(this.hexagon.mesh);
      this.scene.add(this.ice.mesh);

      this.createLights();
      this.createTiles();
      this.createFog();

      this.trees.treeGroup.children.forEach((mesh: InstancedMesh) => {
         mesh.instanceMatrix.needsUpdate = true;
         if (mesh.instanceColor) {
            mesh.instanceColor.needsUpdate = true;
         }
      });

      this.initGui();
   }

   public update(time: number) {
      this.particles.update(time);
      this.ice.update(time);
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
            const position = this.hexagon.getPosition(x, y);
            let height = getNoise(position.x / 170, position.y / 170);
            if (position.length() < MAX_WORLD_RADIUS && height > 0.22) {
               height = Math.pow(height, 4.5) * MAX_HEIGHT;
               this.addTile(height, position, matrix);
            }
         } while (yPositive < MAX_WORLD_RADIUS || yNegative < MAX_WORLD_RADIUS);
      } while (xPositive < MAX_WORLD_RADIUS || xNegative < MAX_WORLD_RADIUS);
   }

   private addTile(height: number, position: Vector2, matrix: Matrix4) {
      let hexType: HexagonType;

      if (MAX_HEIGHT * 0.52 < height || height < MAX_HEIGHT * 0.008) {
         hexType = 'Snow';
         if (height < MAX_HEIGHT * 0.005 && Math.random() > 0.99) {
            this.trees.addTree('Snow', height, position, matrix);
         }
      } else if (MAX_HEIGHT * 0.48 < height || height < MAX_HEIGHT * 0.01) {
         hexType = 'Grass';
      } else {
         hexType = 'Ground';
         if (Math.random() > 0.996) {
            this.trees.addTree('Ground', height, position, matrix);
         }
      }
      this.hexagon.addTile(hexType, height, position, matrix);
   }

   private createLights() {
      this.ambientLight = new AmbientLight(new Color(0xffffff), 0.3);
      this.scene.add(this.ambientLight);

      this.pointLight = new PointLight(new Color(0xc2f8ff), 3, 500, 0.6);
      this.pointLight.position.set(25, 100, 0);
      this.scene.add(this.pointLight);
   }

   private createFog() {
      this.fog = new Fog(new Color(0xffffff));
      this.fog.near = isMobile ? 80 : 100;
      this.fog.far = isMobile ? 320 : 400;
      this.scene.fog = this.fog;
   }

   private initGui() {
      const fogFolder = gui.getInstance().addFolder('Fog');

      fogFolder
         .addColor(this.fog, 'color')
         .onChange((value) => this.fog.color.set(new Color(value)))
         .name('Color');

      fogFolder
         .add(this.fog, 'near', 0, 500, 0.1)
         .onChange((value) => (this.fog.near = value))
         .name('Near');

      fogFolder
         .add(this.fog, 'far', 0, 500, 0.1)
         .onChange((value) => (this.fog.far = value))
         .name('Far');

      const lightFolder = gui.getInstance().addFolder('Lights');

      lightFolder
         .addColor(this.ambientLight, 'color')
         .onChange((value) => this.ambientLight.color.set(new Color(value)))
         .name('Ambient Light');

      lightFolder
         .add(this.ambientLight, 'intensity', 0, 1, 0.01)
         .onChange((value) => (this.ambientLight.intensity = value))
         .name('Ambient Intensity');

      lightFolder
         .addColor(this.pointLight, 'color')
         .onChange((value) => this.pointLight.color.set(new Color(value)))
         .name('Point Light');

      lightFolder
         .add(this.pointLight, 'distance', 0, 1000, 1.0)
         .onChange((value) => (this.pointLight.distance = value))
         .name('Point Distance');

      lightFolder
         .add(this.pointLight, 'intensity', 0, 10, 0.01)
         .onChange((value) => (this.pointLight.intensity = value))
         .name('Point Intensity');

      lightFolder
         .add(this.pointLight, 'decay', 0, 1, 0.01)
         .onChange((value) => (this.pointLight.decay = value))
         .name('Point Decay');
   }
}
