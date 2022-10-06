import {
   BufferGeometry,
   Color,
   Float32BufferAttribute,
   PerspectiveCamera,
   Points,
   ShaderMaterial,
   Texture,
   Vector3,
} from 'three';

import iceTexture from '../assets/snowflake.png';

import { gui, textureLoader } from 'utils';
import { Spline } from 'utils/spline';
import { isMobile, MAX_WORLD_RADIUS } from 'utils/constants';

const vertexShader = /*glsl*/ `
   attribute vec4 colour;
   attribute float angle;
   attribute float size;

   uniform float uPointMultiplier;
   uniform float uEmissiveIntensity;
   uniform vec3 uEmissiveColour;
   uniform vec3 uColour;
   
   varying vec4 vColour;
   varying vec2 vAngle;
   
   void main() {
       vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
       gl_Position = projectionMatrix * mvPosition;
       gl_PointSize = size * uPointMultiplier / gl_Position.w;
       vAngle = vec2(cos(angle), sin(angle));
       vColour = vec4(colour.rgb * uColour + (uEmissiveColour * uEmissiveIntensity), colour.a);
   }
`;

const fragmentShader = /*glsl*/ `
   uniform sampler2D uTexture;

   varying vec4 vColour;
   varying vec2 vAngle;

   void main() {
      vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
      gl_FragColor = texture2D(uTexture, coords) * vColour;
   }
`;

export class Particles {
   points: Points;

   private camera: PerspectiveCamera;
   private material: ShaderMaterial;
   private geometry: BufferGeometry;
   private alphaSpline: Spline;
   private previousTime: number;
   private totalTime: number;
   private particles: any[];
   private uniforms: any;

   constructor(_camera: PerspectiveCamera) {
      this.camera = _camera;
      this.material = this.createMaterial();
      this.geometry = this.createGeometry();
      this.points = this.createPoints(this.geometry, this.material);
      this.points.frustumCulled = false;

      this.alphaSpline = new Spline((t, a, b) => a + t * (b - a));
      this.alphaSpline.AddPoint(0.0, 0.0);
      this.alphaSpline.AddPoint(0.35, 1.0);
      this.alphaSpline.AddPoint(0.65, 1.0);
      this.alphaSpline.AddPoint(1.0, 0.0);

      this.previousTime = 0;
      this.totalTime = 0;
      this.particles = [];

      this.updateGeometry();

      this.initGui();
   }

   public update(time: number) {
      const elapsedTime = time - this.previousTime;
      this.addParticles(elapsedTime);
      this.updateParticles(elapsedTime);
      this.updateGeometry();
      this.previousTime = time;
   }

   private addParticles(time: number) {
      this.totalTime += time;
      const n = Math.floor(this.totalTime * MAX_WORLD_RADIUS);
      this.totalTime -= n / MAX_WORLD_RADIUS;

      for (let i = 0; i < n; i++) {
         const life = (Math.random() * 0.75 + 0.4) * 10.0;
         this.particles.push({
            position: new Vector3(
               (Math.random() - 0.5) * MAX_WORLD_RADIUS,
               (Math.random() + 0.15) * 100,
               (Math.random() - 0.5) * MAX_WORLD_RADIUS
            ),
            velocity: new Vector3(0, (Math.random() + 0.25) * -4, 0),
            rotation: Math.random() * 2.0 * Math.PI,
            colour: new Color(0xffffff),
            size: Math.random() + 0.25,
            alpha: 1.0,
            life: life,
            maxLife: life,
         });
      }
   }

   private updateParticles(time: number) {
      for (let particle of this.particles) {
         particle.life -= time;
      }

      this.particles = this.particles.filter((particle) => particle.life > 0);

      for (let p of this.particles) {
         const t = 1.0 - p.life / p.maxLife;

         p.rotation += time * 0.5;
         p.alpha = this.alphaSpline.Get(t);

         p.position.add(p.velocity.clone().multiplyScalar(time));

         const drag = p.velocity.clone();
         drag.multiplyScalar(time * 0.1);
         drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
         drag.x += Math.sin(p.position.y) * 0.1;
         drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
         drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));

         p.velocity.sub(drag);
      }

      this.particles.sort((a, b) => {
         const d1 = this.camera.position.distanceTo(a.position);
         const d2 = this.camera.position.distanceTo(b.position);

         if (d1 > d2) {
            return -1;
         } else if (d1 < d2) {
            return 1;
         } else {
            return 0;
         }
      });
   }

   private updateGeometry() {
      const positions = [];
      const colours = [];
      const angles = [];
      const sizes = [];

      for (let p of this.particles) {
         positions.push(p.position.x, p.position.y, p.position.z);
         colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
         angles.push(p.rotation);
         sizes.push(p.size);
      }

      this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      this.geometry.setAttribute('colour', new Float32BufferAttribute(colours, 4));
      this.geometry.setAttribute('angle', new Float32BufferAttribute(angles, 1));
      this.geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));

      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.colour.needsUpdate = true;
      this.geometry.attributes.angle.needsUpdate = true;
      this.geometry.attributes.size.needsUpdate = true;
   }

   private createGeometry() {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute([], 3));
      geometry.setAttribute('colour', new Float32BufferAttribute([], 4));
      geometry.setAttribute('angle', new Float32BufferAttribute([], 1));
      geometry.setAttribute('size', new Float32BufferAttribute([], 1));
      return geometry;
   }

   private createPoints(geometry: BufferGeometry, material: ShaderMaterial) {
      return new Points(geometry, material);
   }

   private createMaterial() {
      const pointSize = isMobile ? 60 : 100.0;
      this.uniforms = {
         uEmissiveColour: { value: new Color(0x1a9cff) },
         uColour: { value: new Color(0xffffff) },
         uEmissiveIntensity: { value: 0.2 },
         uTexture: { value: new Texture() },
         uTime: { value: 0 },
         uPointMultiplier: {
            value: window.innerHeight / (2.0 * Math.tan((0.5 * pointSize * Math.PI) / 180.0)),
         },
      };

      const material = new ShaderMaterial({
         fragmentShader: fragmentShader,
         vertexShader: vertexShader,
         uniforms: this.uniforms,
         transparent: true,
         depthWrite: false,
         depthTest: true,
      });

      textureLoader.loadAsync(iceTexture).then((value) => (material.uniforms.uTexture.value = value));

      return material;
   }

   private initGui() {
      const folder = gui.getInstance().addFolder('Particles');

      folder
         .addColor(this.uniforms.uColour, 'value')
         .onChange((value) => {
            this.uniforms.uColour.value.set(new Color(value));
         })
         .name('Color');

      folder
         .addColor(this.uniforms.uEmissiveColour, 'value')
         .onChange((value) => this.uniforms.uEmissiveColour.value.set(new Color(value)))
         .name('Emissive Color');

      folder
         .add(this.uniforms.uEmissiveIntensity, 'value', 0, 5, 0.01)
         .onChange((value) => (this.uniforms.uEmissiveIntensity.value = value))
         .name('Emissive Intensity');
   }
}
