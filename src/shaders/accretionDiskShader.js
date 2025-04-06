import * as THREE from 'three';

export const accretionDiskShader = {
    uniforms: {
        time: { value: 0 },
        cloudTexture: { value: null }
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
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            float radius = length(vPosition.xy);
            float normalizedRadius = radius / 4.0;
            
            // Create base colors
            vec3 hotOrange = vec3(1.0, 0.6, 0.0);
            vec3 brightYellow = vec3(1.0, 0.8, 0.2);
            vec3 darkOrange = vec3(0.8, 0.2, 0.0);
            
            // Create spiral UV coordinates for texture
            float angle = atan(vPosition.y, vPosition.x);
            vec2 spiralUV = vec2(
                angle / (3.14159 * 2.0) + time * 0.1 + radius * 0.1,
                radius * 2.0 + time * 0.2
            );
            
            // Sample and mix cloud textures for variation
            vec4 cloud1 = texture2D(cloudTexture, spiralUV);
            vec4 cloud2 = texture2D(cloudTexture, spiralUV * 2.0 + vec2(time * 0.05));
            float cloudMix = mix(cloud1.r, cloud2.r, 0.5) * 0.5 + 0.5;
            
            // Create color gradient from inside to outside
            vec3 innerColor = mix(brightYellow, hotOrange, smoothstep(0.0, 0.3, normalizedRadius));
            vec3 outerColor = mix(hotOrange, darkOrange, smoothstep(0.3, 0.8, normalizedRadius));
            vec3 baseColor = mix(innerColor, outerColor, smoothstep(0.4, 0.6, normalizedRadius));
            
            // Add brightness variation from cloud texture
            baseColor *= (1.0 + cloudMix * 0.5);
            
            // Add time-based glow
            float glow = sin(time * 2.0) * 0.1 + 0.9;
            baseColor *= glow;
            
            // Calculate opacity
            float alpha = (1.0 - smoothstep(0.2, 0.9, normalizedRadius)) * 0.7;
            alpha *= cloudMix;
            
            gl_FragColor = vec4(baseColor, alpha);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
}; 