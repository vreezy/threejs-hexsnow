import { TextureLoader } from 'three';

class SingletonTextureLoader {
   private textureLoader: TextureLoader;

   constructor() {
      this.textureLoader = new TextureLoader();
   }

   loadAsync(file: string) {
      return this.textureLoader.loadAsync(file);
   }
}

export const textureLoader = new SingletonTextureLoader();
