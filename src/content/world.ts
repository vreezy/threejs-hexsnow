import {
   AmbientLight,
   Color,
   DoubleSide,
   Matrix4,
   Mesh,
   MeshBasicMaterial,
   MeshNormalMaterial,
   PlaneGeometry,
   PointLight,
   Scene,
   ShaderMaterial,
   Vector2,
} from 'three';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';

import fragmentShader from '../shaders/fragment.glsl';
import vertexShader from '../shaders/vertex.glsl';

import { isMobile, MAX_HEIGHT, MAX_PILLARS, MAX_SPIKES, MAX_WORLD_RADIUS } from '../utils/constants';
import { Hexagon, Pillar, Metal, Spikes, Pebbles, Rock, Ground } from 'content';
import { textureLoader } from 'utils';

export class World {
   private heightMap: NoiseFunction2D;
   private ambientLight: AmbientLight;
   private pointLight: PointLight;
   private scene: Scene;

   private shaderMaterial: ShaderMaterial;

   private pillars: Pillar;
   private ground: Ground;
   private pebbles: Pebbles;
   private spikes: Spikes;
   private metal: Metal;
   private rock: Rock;

   constructor(_scene: Scene) {
      this.scene = _scene;

      const hexGeometry = Hexagon.createGeometry();
      this.pillars = new Pillar(hexGeometry);
      this.ground = new Ground(hexGeometry);
      this.metal = new Metal(hexGeometry);
      this.rock = new Rock(hexGeometry);
      this.pebbles = new Pebbles();
      this.spikes = new Spikes();

      this.heightMap = createNoise2D();
   }

   public generate() {
      // this.shaderMaterial = new ShaderMaterial({
      //    vertexShader: vertexShader,
      //    fragmentShader: fragmentShader,
      //    uniforms: {
      //       uColor: { value: new Color(0xff0000) },
      //       uTime: { value: 0 },
      //    },
      // });

      // const planeGeometry = new PlaneGeometry(10, 10);
      // const plane = new Mesh(planeGeometry, this.shaderMaterial);
      // plane.rotation.set(-Math.PI * 0.5, 0, 0);
      // plane.position.set(-5, 0, 0);
      // this.scene.add(plane);

      // const hexGeometry = Hexagon.createGeometry();
      // const hexagon = new Mesh(hexGeometry, this.shaderMaterial);
      // hexagon.rotation.set(0, Math.PI * 0.5, 0);
      // hexagon.position.set(5, 0, 0);
      // hexagon.scale.set(5, 0.5, 5);
      // this.scene.add(hexagon);
      // return;

      this.scene.add(this.pillars.mesh);
      this.scene.add(this.ground.mesh);
      this.scene.add(this.metal.mesh);
      this.scene.add(this.rock.mesh);
      this.scene.add(this.spikes.mesh);
      this.scene.add(this.pebbles.mesh);

      this.createTiles();
      this.createLights();

      this.pillars.mesh.instanceMatrix.needsUpdate = true;
      this.ground.mesh.instanceMatrix.needsUpdate = true;
      this.metal.mesh.instanceMatrix.needsUpdate = true;
      this.rock.mesh.instanceMatrix.needsUpdate = true;
      this.pebbles.mesh.instanceMatrix.needsUpdate = true;
      this.spikes.mesh.instanceMatrix.needsUpdate = true;
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
         this.metal.createTile(height, position, matrix);
         if (Math.random() > 0.92 && MAX_SPIKES > this.spikes.count) {
            this.spikes.createSpike(height, position, matrix);
         }
      } else if (height > MAX_HEIGHT * 0.3) {
         this.rock.createTile(height, position, matrix);
         if (Math.random() > 0.985) {
            this.pebbles.createRock(height, position, matrix);
         }
      } else {
         this.ground.createTile(height, position, matrix);
      }
   }

   private createLights() {
      this.ambientLight = new AmbientLight(new Color(0xeca9f5), 0.1);
      this.scene.add(this.ambientLight);

      this.pointLight = new PointLight(new Color(0xffffff).convertSRGBToLinear(), 1.5, 120);
      this.pointLight.position.set(25, 65, 0);
      if (!isMobile) {
         this.pointLight.castShadow = true;
         this.pointLight.shadow.mapSize.height = 512;
         this.pointLight.shadow.mapSize.width = 512;
         this.pointLight.shadow.autoUpdate = false;
         this.pointLight.shadow.camera.near = 0.5;
         this.pointLight.shadow.camera.far = 50;
      }

      this.scene.add(this.pointLight);
   }

   public update(time: number) {
      // this.shaderMaterial.uniforms.uTime.value = time;
   }

   private initGui() {}
}
