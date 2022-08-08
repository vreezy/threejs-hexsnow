import GUI from 'lil-gui';

class SingletonGui {
   private instance: GUI;

   constructor() {
      this.instance = new GUI();
   }

   getInstance() {
      return this.instance;
   }
}

export const gui = new SingletonGui();
