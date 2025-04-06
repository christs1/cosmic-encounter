import * as THREE from 'three';

// Shader for the event horizon effect
export const eventHorizonShader = {
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
            // Create a rim light effect
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float rim = 1.0 - max(dot(viewDirection, vNormal), 0.0);
            rim = pow(rim, 3.0);
            
            // Create swirling time-based distortion
            float swirl = sin(vUv.x * 20.0 + time) * cos(vUv.y * 20.0 - time * 0.5) * 0.15;
            
            // Add some noise for a more chaotic look
            float noise = random(vUv + vec2(time * 0.01)) * 0.1;
            
            // Create a deep blue/purple color with swirling effect
            vec3 horizonColor = mix(
                vec3(0.05, 0.1, 0.3),  // Deep blue
                vec3(0.3, 0.0, 0.5),   // Purple
                swirl + noise
            );
            
            // Apply the rim effect
            float glowStrength = rim + swirl * 0.5 + noise;
            
            // Make it stronger at the edges
            glowStrength = smoothstep(0.2, 1.0, glowStrength);
            
            gl_FragColor = vec4(horizonColor * glowStrength, glowStrength * 0.8);
        }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending
}; 