import { CubeTexture, CubeTextureLoader } from 'three';
import posX from '../assets/skybox/pos-x.png';
import negX from '../assets/skybox/neg-x.png';
import posY from '../assets/skybox/pos-y.png';
import negY from '../assets/skybox/neg-y.png';
import posZ from '../assets/skybox/pos-z.png';
import negZ from '../assets/skybox/neg-z.png';

export class Skybox {
   cubeTexture: CubeTexture;

   constructor() {
      this.cubeTexture = new CubeTextureLoader().load([posX, negX, posY, negY, posZ, negZ]);
   }
}
