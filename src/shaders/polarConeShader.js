import * as THREE from 'three';

// Shader for the black hole polar jets/cones
export const polarConeShader = {
    uniforms: {
        time: { value: 0 },
        cloudTexture: { value: null },
        isTop: { value: 1.0 } // 1.0 for top cone, 0.0 for bottom cone
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
        uniform sampler2D cloudTexture;
        uniform float isTop;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            // Calculate distance from axis
            float dist = length(vPosition.xz) / 4.0;
            
            // Adjust UV coordinates for swirling effect
            vec2 distortedUv = vec2(
                vUv.x + sin(vUv.y * 10.0 + time) * 0.1,
                vUv.y + cos(vUv.x * 10.0 + time) * 0.1
            );
            
            // Calculate height fade (stronger at base, fading to tip)
            float heightRatio = vPosition.y / 15.0;
            float baseToTip = isTop > 0.5 ? 1.0 - abs(heightRatio) : abs(heightRatio);
            baseToTip = pow(baseToTip, 0.5); // Adjust the falloff
            
            // Sample the cloud texture twice with offset for more variation
            vec4 texColor1 = texture2D(cloudTexture, distortedUv);
            vec4 texColor2 = texture2D(cloudTexture, distortedUv * 0.8 + vec2(time * 0.01, 0.0));
            
            // Mix the two texture samples
            vec4 texColor = mix(texColor1, texColor2, 0.5);
            
            // Create rim effect - stronger at edges
            float rim = smoothstep(0.0, 1.0, dist);
            
            // Vertical energy pulses
            float pulseSpeed = isTop > 0.5 ? -2.0 : 2.0; // Direction based on top/bottom
            float pulse = sin(vUv.y * 20.0 + time * pulseSpeed) * 0.5 + 0.5;
            
            // Define colors based on top/bottom
            vec3 coneColor = isTop > 0.5 ? 
                vec3(0.0, 0.3, 0.8) :  // Blue for top
                vec3(0.8, 0.2, 0.0);   // Red/orange for bottom
            
            // Apply all effects
            float alpha = baseToTip * (1.0 - dist * 0.8) * texColor.r * (0.7 + pulse * 0.3);
            
            // Fade out at the very edge of the cone
            alpha *= smoothstep(1.0, 0.8, dist);
            
            gl_FragColor = vec4(coneColor * (0.8 + pulse * 0.2), alpha * 0.4);
        }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
}; 