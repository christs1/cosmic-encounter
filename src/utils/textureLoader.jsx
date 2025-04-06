import * as THREE from 'three'

const textureLoader = new THREE.TextureLoader()

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        console.log(`Loaded texture: ${url}`)
        resolve(texture)
      },
      undefined,
      (error) => {
        console.error(`Error loading texture ${url}:`, error)
        reject(error)
      }
    )
  })
}

export async function loadTextures() {
  try {
    const [earthTexture, cloudTexture, nebulaTexture] = await Promise.all([
      loadTexture('/textures/earth.jpg'),
      loadTexture('/textures/clouds.png'),
      loadTexture('/textures/nebula.jpg'),
    ])

    // Configure earth texture
    earthTexture.colorSpace = THREE.SRGBColorSpace
    earthTexture.wrapS = earthTexture.wrapT = THREE.RepeatWrapping

    // Configure cloud texture
    cloudTexture.colorSpace = THREE.SRGBColorSpace
    cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping

    // Configure nebula texture
    nebulaTexture.colorSpace = THREE.SRGBColorSpace
    nebulaTexture.wrapS = nebulaTexture.wrapT = THREE.ClampToEdgeWrapping

    return {
      earthTexture,
      cloudTexture,
      nebulaTexture,
    }
  } catch (error) {
    console.error('Error loading textures:', error)
    throw error
  }
} 