import * as THREE from 'three';
import './styles/styles.sass';
import { World } from './classes/world';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class App {
   private camera: THREE.PerspectiveCamera;
   private renderer: THREE.WebGLRenderer;
   private controls: OrbitControls;
   private scene: THREE.Scene;

   private world: World;

   constructor() {
      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 350);
      this.camera.position.set(-17, 31, 33);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.set(0, 0, 0);
      this.controls.dampingFactor = 0.05;
      this.controls.enableDamping = true;

      this.world = new World(this.scene);
      this.world.generate();

      window.addEventListener('resize', this.onWindowResize.bind(this), false);
      this.render();
   }

   private onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
   }

   private render() {
      requestAnimationFrame(this.render.bind(this));
      this.controls.update();
      this.world.update();
      this.renderer.render(this.scene, this.camera);
   }
}

new App();
