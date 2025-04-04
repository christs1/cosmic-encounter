# Alien Images for Cosmic Encounter HUD

This directory contains images for the alien species in the Cosmic Encounter game.

## Image Guidelines

- **File Format**: PNG or JPEG files with transparent backgrounds preferred for PNG
- **Naming Convention**: Use snake_case that matches the `imagePath` in the aliens.json file (e.g., `cosmic_entity.png`)
- **Size**: Recommended size is 512x512 pixels
- **Style**: Keep a consistent art style across alien images

## Adding New Alien Images

1. Add your image file to this directory
2. Update the `imagePath` property in the corresponding alien entry in `/public/data/aliens.json`
3. The AlienInfo component will automatically display the image if available

## Default Aliens

The default aliens and their image paths are:

- Cosmic Entity: `/images/aliens/cosmic_entity.png`
- Quantum Shifter: `/images/aliens/quantum_shifter.png`
- Void Walker: `/images/aliens/void_walker.png`
- Solar Flare: `/images/aliens/solar_flare.png`
- Nebula Mind: `/images/aliens/nebula_mind.png`

If an image fails to load, the component will fall back to displaying the emoji avatar defined in the aliens.json file.
