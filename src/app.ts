import './styles/styles.sass';
import { ACESFilmicToneMapping, PerspectiveCamera, Scene, sRGBEncoding, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { World } from 'content/world';
import Stats from 'stats.js';

export class App {
   private camera: PerspectiveCamera;
   private renderer: WebGLRenderer;
   private controls: OrbitControls;
   private scene: Scene;
   private stats: Stats;

   private world: World;

   constructor() {
      this.scene = new Scene();

      this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
      this.camera.position.set(-17, 31, 33);

      this.renderer = new WebGLRenderer({ antialias: true });

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.toneMapping = ACESFilmicToneMapping;
      this.renderer.outputEncoding = sRGBEncoding;
      this.renderer.shadowMap.enabled = true;
      document.body.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.set(0, 0, 0);
      this.controls.dampingFactor = 0.05;
      this.controls.enableDamping = true;

      this.world = new World(this.scene);
      this.world.generate();

      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);

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
      this.stats.begin();
      this.world.update();
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.stats.end();
   }
}

new App();
