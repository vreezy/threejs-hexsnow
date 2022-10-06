import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class SingletonGltfLoader {
   private gltfLoader: GLTFLoader;

   constructor() {
      this.gltfLoader = new GLTFLoader();
   }

   loadAsync(file: string) {
      return this.gltfLoader.loadAsync(file);
   }
}

export const gltfLoader = new SingletonGltfLoader();
