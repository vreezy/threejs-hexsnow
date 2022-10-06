import {
   BufferGeometry,
   Color,
   CylinderGeometry,
   Group,
   InstancedMesh,
   MathUtils,
   Matrix4,
   Mesh,
   MeshBasicMaterial,
   MeshNormalMaterial,
   MeshStandardMaterial,
   Object3D,
   Scene,
   Texture,
   Vector2,
} from 'three';
import { gltfLoader, gui } from 'utils';
import { MAX_TREES } from 'utils/constants';
import treeFile from '../assets/models/tree.glb';

export type TreeType = 'Ground' | 'Snow';

export class Trees {
   private leafMaterial: MeshStandardMaterial;
   private leafGeometry: BufferGeometry;
   private leafMesh: InstancedMesh;

   private edgeMaterial: MeshStandardMaterial;
   private edgeGeometry: BufferGeometry;
   private edgeMesh: InstancedMesh;

   private trunkMaterial: MeshStandardMaterial;
   private trunkGeometry: BufferGeometry;
   private trunkMesh: InstancedMesh;

   private groundColor: Color;
   private snowColor: Color;

   treeGroup: Group;
   count: number;

   constructor() {
      this.groundColor = new Color(0xffffff);
      this.snowColor = new Color(0xd1623d);
      this.treeGroup = new Group();

      this.count = 0;

      this.initGui();
   }

   public addTree(type: TreeType, height: number, position: Vector2, matrix: Matrix4) {
      let color;
      switch (type) {
         case 'Ground':
            color = this.groundColor;
            break;
         case 'Snow':
            color = this.snowColor;
            break;
      }

      this.count++;
      const scale = MathUtils.randFloat(0.65, 1.0) * 0.3;
      matrix.makeScale(scale, scale, scale);
      matrix.setPosition(position.x, height, position.y);
      this.trunkMesh.setMatrixAt(this.count, matrix);
      this.edgeMesh.setMatrixAt(this.count, matrix);
      this.leafMesh.setMatrixAt(this.count, matrix);
      this.leafMesh.setColorAt(this.count, color);
   }

   public async loadMesh() {
      const { scene } = await gltfLoader.loadAsync(treeFile);
      const treeTrunk = scene.getObjectByName('TreePortions') as Mesh;
      const treeEdge = scene.getObjectByName('TreePortions_1') as Mesh;
      const treeLeaf = scene.getObjectByName('TreePortions_2') as Mesh;

      this.leafGeometry = treeLeaf.geometry.clone();
      this.leafMaterial = treeLeaf.material as MeshStandardMaterial;
      this.leafMesh = new InstancedMesh(this.leafGeometry, this.leafMaterial, MAX_TREES);
      this.treeGroup.add(this.leafMesh);

      this.edgeGeometry = treeEdge.geometry.clone();
      this.edgeMaterial = treeEdge.material as MeshStandardMaterial;
      this.edgeMesh = new InstancedMesh(this.edgeGeometry, this.edgeMaterial, MAX_TREES);
      this.treeGroup.add(this.edgeMesh);

      this.trunkGeometry = treeTrunk.geometry.clone();
      this.trunkMaterial = treeTrunk.material as MeshStandardMaterial;
      this.trunkMesh = new InstancedMesh(this.trunkGeometry, this.trunkMaterial, MAX_TREES);
      this.treeGroup.add(this.trunkMesh);
   }

   private initGui() {
      // const folder = gui.getInstance().addFolder('Trees');
   }
}
