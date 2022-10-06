import * as THREE from 'three';
import './styles/styles.scss';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Clock, LinearMipMapLinearFilter, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { createControls } from 'utils/controls';
import { isMobile } from 'utils/constants';
import { debugGui } from 'utils';
import { World } from 'content';
// import UI from './content/ui.html';
import { initAudio } from 'content/audio';

export class App {
   private camera: PerspectiveCamera;
   private renderer: WebGLRenderer;
   private controls: OrbitControls;
   private scene: Scene;
   private clock: Clock;
   private world: World;

   constructor() {
      const canvas = document.querySelector('.webgl-canvas');
      this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
      this.scene = new THREE.Scene();

      const farPlane = isMobile ? 400 : 1000;
      this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, farPlane);
      this.camera.position.set(-50, 61, 40);

      this.controls = createControls(this.camera, this.renderer.domElement);

      this.world = new World(this.scene, this.camera);
      this.world.generate();

      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
      window.addEventListener('resize', this.onWindowResize.bind(this), false);
      this.initUI();
      this.initDebugUI();
      initAudio(this.renderer.domElement);
      this.clock = new THREE.Clock();
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
      this.world.update(this.clock.getElapsedTime());
      this.renderer.render(this.scene, this.camera);
   }

   private initUI() {
      // const uiElement = document.createElement('div');
      // uiElement.innerHTML = UI;
      // document.body.appendChild(uiElement);
   }

   private initDebugUI() {
      const folder = debugGui.getInstance();
      folder.close();
   }
}

new App();
