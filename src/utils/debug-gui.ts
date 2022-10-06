import GUI from 'lil-gui';
import { isDebug } from './constants';

class SingletonGui {
   private instance: GUI;

   constructor() {
      this.instance = new GUI();
      if (isDebug) {
         this.instance.domElement.classList.add('debug');
      }
   }

   getInstance() {
      return this.instance;
   }
}

export const debugGui = new SingletonGui();
