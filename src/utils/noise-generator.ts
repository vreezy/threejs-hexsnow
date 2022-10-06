import { DataTexture, MirroredRepeatWrapping } from 'three';
import Alea from 'alea';
import { createNoise2D } from 'simplex-noise';

const noise2D = createNoise2D(Alea());

export const generateNoise = (size: number) => {
   const data = new Uint8Array(size * size * 4);
   const noiseTexture = new DataTexture(data, size, size);

   for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
         const position = (x + y * size) * 4;
         const color = getNoise(x / size, y / size) * 256;
         data[position + 0] = data[position + 1] = data[position + 2] = color;
         data[position + 3] = 255;
      }
   }

   noiseTexture.wrapS = MirroredRepeatWrapping;
   noiseTexture.wrapT = MirroredRepeatWrapping;
   noiseTexture.repeat.set(5, 5);
   noiseTexture.needsUpdate = true;
   noiseTexture.flipY = false;
   return noiseTexture;
};

export const getNoise = (x: number, y: number) => {
   return noise2D(x, y) * 0.5 + 0.5;
};
