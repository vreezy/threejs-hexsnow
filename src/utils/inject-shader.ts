import { ShaderMaterial } from 'three';

export interface InjectShaderProps {
   shaderProgram: string;
   replaceLine: string;
   isVertex: boolean;
}

export const injectShader = (material: ShaderMaterial, uniforms: any, shaders: InjectShaderProps[]) => {
   material.uniforms = { ...material.uniforms, ...uniforms };
   for (let i = 0; i < shaders.length; i++) {
      const shader = shaders[i];
      const shaderType = shader.isVertex ? 'vertexShader' : 'fragmentShader';
      material[shaderType] = material[shaderType].replace(shader.replaceLine, shader.shaderProgram);
   }
};
