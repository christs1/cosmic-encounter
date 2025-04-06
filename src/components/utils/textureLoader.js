import * as THREE from 'three';

// Utility function to load multiple textures and return when all are ready
export const loadTextures = async () => {
  const textureLoader = new THREE.TextureLoader();
  
  const loadTexture = (path) => {
    return new Promise((resolve) => {
      textureLoader.load(
        path,
        // onLoad callback
        (texture) => {
          resolve(texture);
        },
        // onProgress callback - not needed
        undefined,
        // onError callback
        (err) => {
          console.error(`Error loading texture ${path}:`, err);
          // Resolve with null to allow other textures to load
          resolve(null);
        }
      );
    });
  };

  try {
    // Load all required textures in parallel
    const [
      earthTexture,
      cloudTexture,
      accretionTexture,
      nebulaTexture,
      saucerTexture
    ] = await Promise.all([
      loadTexture('/textures/earth.jpg'),
      loadTexture('/textures/clouds.png'),
      loadTexture('/textures/accretiontexture.png'),
      loadTexture('/textures/nebula.jpg'),
      loadTexture('/textures/saucertexture.png')
    ]);

    // Configure texture properties
    if (cloudTexture) {
      cloudTexture.wrapS = THREE.RepeatWrapping;
      cloudTexture.wrapT = THREE.RepeatWrapping;
    }

    if (accretionTexture) {
      accretionTexture.wrapS = THREE.RepeatWrapping;
      accretionTexture.wrapT = THREE.RepeatWrapping;
    }

    console.log("All textures loaded successfully");
    
    return {
      earthTexture,
      cloudTexture,
      accretionTexture,
      nebulaTexture,
      saucerTexture
    };
  } catch (error) {
    console.error("Error loading textures:", error);
    return null;
  }
};

// Function to create a point texture for stars
export const createStarPointTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Create a radial gradient for a softer star
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}; 