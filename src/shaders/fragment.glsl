

varying vec2 vUv;

void main() {
  gl_FragColor = vec4(0.8 * vUv.xy, 1.0, 0.75);
}