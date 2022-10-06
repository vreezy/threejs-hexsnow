import {
   CircleGeometry,
   Color,
   DataTexture,
   Mesh,
   MeshStandardMaterial,
   NearestMipmapLinearFilter,
   RepeatWrapping,
   Texture,
} from 'three';

import { gui, textureLoader, injectShader, InjectShaderProps } from 'utils';
import { MAX_WORLD_RADIUS } from 'utils/constants';
import iceTexture from '../assets/ice.jpg';

const fragmentDeclare = /*glsl*/ `#include <clipping_planes_pars_fragment>

      uniform sampler2D uNoiseTexture;
      uniform float uRepeat;
      uniform float uTime;
      
      vec2 rotate(vec2 uv, float rotation, vec2 mid) {
        return vec2(
            cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
            cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y);
      }
`;

const fragmentMain = /*glsl*/ `
      vec2 newUvs = vec2(mod(vUv.x, 0.1), mod(vUv.y, 0.1)) * 0.1;
      float rotation = float(texture(uNoiseTexture, vUv));
      
      vec2 rotatedUv = rotate(vUv, rotation, vec2(0.5)) + sin(newUvs.x * newUvs.y);
      vec4 sampledDiffuseColor = texture2D(map, rotatedUv + abs(sin(uTime * 0.01)));
      
      diffuseColor *= sampledDiffuseColor;
`;

export class Ice {
   material: MeshStandardMaterial;
   geometry: CircleGeometry;
   mesh: Mesh;

   private uniforms: any;

   constructor(texture: DataTexture) {
      this.material = this.createMaterial(texture);
      this.geometry = this.createGeometry();
      this.mesh = this.createMesh(this.geometry, this.material);

      this.mesh.rotation.set(-Math.PI * 0.5, 0, 0);
      this.mesh.position.set(0, -0.25, 0);

      this.initGui();
   }

   public update(time: number) {
      this.uniforms.uTime.value = time;
   }

   private createGeometry() {
      return new CircleGeometry(MAX_WORLD_RADIUS * 2.0, 16, 16);
   }

   private createMesh(geometry: CircleGeometry, material: MeshStandardMaterial) {
      return new Mesh(geometry, material);
   }

   private createMaterial(noiseTexture: DataTexture) {
      this.uniforms = {
         uNoiseTexture: { value: noiseTexture },
         uRepeat: { value: 1.0 },
         uTime: { value: 0 },
      };

      const material = new MeshStandardMaterial({
         color: new Color(0xffffff),
         emissive: new Color(0x000000),
         emissiveIntensity: 0.0,
         map: new Texture(),
         metalness: 1,
         roughness: 0.82,
      });

      const shaderInjections: InjectShaderProps[] = [
         {
            replaceLine: '#include <clipping_planes_pars_fragment>',
            shaderProgram: fragmentDeclare,
            isVertex: false,
         },
         {
            replaceLine: '#include <map_fragment>',
            shaderProgram: fragmentMain,
            isVertex: false,
         },
      ];

      material.onBeforeCompile = (material) => injectShader(material as any, this.uniforms, shaderInjections);

      textureLoader.loadAsync(iceTexture).then((value) => {
         value.minFilter = NearestMipmapLinearFilter;
         value.wrapS = RepeatWrapping;
         value.wrapT = RepeatWrapping;
         value.rotation = 0.35;
         value.repeat.set(10, 10);
         material.map = value;
      });

      return material;
   }

   private initGui() {
      const folder = gui.getInstance().addFolder('Ice');

      folder
         .add(this.mesh.position, 'x', -400, 400)
         .onChange((value) => (this.mesh.position.x = value))
         .name('Position X');

      folder
         .add(this.mesh.position, 'y', -400, 400)
         .onChange((value) => (this.mesh.position.y = value))
         .name('Position Y');

      folder
         .add(this.mesh.position, 'z', -400, 400)
         .onChange((value) => (this.mesh.position.z = value))
         .name('Position Z');

      folder
         .addColor(this.material, 'color')
         .onChange((value) => this.material.color.set(new Color(value)))
         .name('Color');

      folder
         .addColor(this.material, 'emissive')
         .onChange((value) => this.material.emissive.set(new Color(value)))
         .name('Emissive Color');

      folder
         .add(this.material, 'emissiveIntensity', 0, 1, 0.01)
         .onChange((value) => (this.material.emissiveIntensity = value))
         .name('Emissive Intensity');

      folder
         .add(this.material, 'metalness', 0, 1, 0.01)
         .onChange((value) => (this.material.metalness = value))
         .name('Metalness');

      folder
         .add(this.material, 'roughness', 0, 1, 0.01)
         .onChange((value) => (this.material.roughness = value))
         .name('Roughness');

      folder
         .add(this.material.map.repeat, 'x', 1, 100, 1)
         .onChange((value) => {
            this.material.map.repeat.set(value, value);
            this.uniforms.uRepeat.value = value * 0.1;
         })
         .name('Repeat');

      folder
         .add(this.material.map.repeat, 'y', 0, Math.PI * 0.25, 0.01)
         .onChange((value) => (this.material.map.rotation = value))
         .name('Rotation');
   }
}
