import * as THREE from 'three';
import './styles/styles.sass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createControls } from 'utils/controls';
import { World } from 'content';
import { gui } from 'utils';
import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export class App {
   private camera: PerspectiveCamera;
   private renderer: WebGLRenderer;
   private controls: OrbitControls;
   private scene: Scene;
   private clock: Clock;
   private world: World;

   constructor() {
      this.renderer = new THREE.WebGLRenderer({
         antialias: true,
      });
      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 4000);
      // this.camera.position.z = 35;
      // this.camera.position.y = 200;
      this.camera.position.set(-50, 61, 40);

      this.controls = createControls(this.camera, this.renderer.domElement);

      this.world = new World(this.scene, this.camera);
      this.world.generate();

      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
      window.addEventListener('resize', this.onWindowResize.bind(this), false);

      this.clock = new THREE.Clock();
      this.initGui();
      this.render();
   }

   private onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
   }

   private render() {
      requestAnimationFrame(this.render.bind(this));
      const time = this.clock.getElapsedTime();
      this.controls.update();
      this.world.update(time);

      this.renderer.render(this.scene, this.camera);
   }

   private initGui() {
      const folder = gui.getInstance();
      folder.close();
   }
}

new App();
