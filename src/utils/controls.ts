import * as THREE from 'three';
import { createLimitPan } from '@ocio/three-camera-utils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PerspectiveCamera } from 'three';

export const createControls = (camera: PerspectiveCamera, canvas: HTMLCanvasElement) => {
   const controls = new OrbitControls(camera, canvas);

   controls.enableDamping = true;
   controls.dampingFactor = 0.03;
   controls.rotateSpeed = 0.35;
   controls.maxDistance = 220;
   controls.zoomSpeed = 0.7;

   controls.minPolarAngle = Math.PI / 28;
   controls.maxPolarAngle = Math.PI / 1.95;

   controls.target = new THREE.Vector3(0, 0.16, -2.6);
   const limitPan = createLimitPan({ camera, controls });
   controls.addEventListener('change', (e) => {
      limitPan({ minX: -165, maxX: 165, minY: 8, maxY: 35, minZ: -165, maxZ: 165 });
   });

   return controls;
};
