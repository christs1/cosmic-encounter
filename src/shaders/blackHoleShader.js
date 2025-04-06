import * as THREE from 'three';

// Shader for the black hole core
export const blackHoleShader = {
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            // Calculate distance from center
            float dist = length(vPosition.xyz);
            
            // Create dark center that gets darker as it approaches center
            float darkness = smoothstep(0.0, 2.0, dist);
            
            // Add subtle pulsing
            float pulse = 0.05 * sin(time * 0.5);
            
            // Create a deep black color with subtle dark blue hints
            vec3 blackHoleColor = vec3(0.0, 0.01 + pulse, 0.02 + pulse) * darkness;
            
            gl_FragColor = vec4(blackHoleColor, 1.0);
        }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending
}; 