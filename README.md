# gltf terrain model to png heightmap file

Nothing fancy. Turn your gltf terrain file to a png grayscale heightmap.

## tutorial
- Use gltf embedded, don't use bin or glb.
- Export only the terrain; the file must contain only the terrain.
- Terrain has to be a rectangle

## API Refference
There is no API reference lmao. just use following function: 
```
gltfToPng(gltfPath, pngPath)
```
