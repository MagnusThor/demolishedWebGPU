# demolishedWebGPU


demolishedWebGPU is a shader rendering engine based on WebGPU. WebGPU is a new web API that exposes modern computer graphics capabilities, specifically Direct3D 12, Metal, and Vulkan, for performing rendering and computation operations on a GPU.

This project; demolishedWebGPU is an WebGPU implementation of the existing demolishedRenderer engine (https://github.com/MagnusThor/demolishedRenderer).

This an early version, but the following features is available now 

1. Multi-pass/1-n shader programs/buffers 
2. 1-n textures & samplers
3. Custom uniforms
4. Custom geometrys
5. Multipass rendering using WebGPU compute shaders 

## Using WebGPU Fragment shader only

```
const canvas = document.querySelector('canvas') as HTMLCanvasElement;

 
  const renderer = new Renderer(canvas);
  const device = await renderer.getDevice();

  const scene = new Scene("myScene", device, canvas);
  
  const material = new Material(device, raymarchShader);    

  const geometry = new Geometry(device, rectGeometry);
 
  const textures: Array<ITexture> = [
    {
      key: "iChannel0",
      source: "assets/channel0.jpg", 
      type: TextureType.IMAGE,
    },

    {
      key: "iChannel1",
      source: "assets/channel1.jpg",
      type: TextureType.IMAGE
    },
  ];

  const mesh = new Mesh(device, geometry, material,[textures[0],textures[1]]); 
  
  await scene.addAssets(textures);

  scene.addMesh("myMesh", mesh);

  await renderer.addScene(scene)

  renderer.start(0,200,(frameNo) => {
    // noop
  });

```

## Using WebGPU ComputeShaders + Fragmentshaders

```

  const renderer = new ComputeRenderer(document.querySelector("canvas"));
    
  await renderer.init();
  renderer.addComputeRenderPass("iChannel0", computeRaymarchShader);

  const material = new Material(renderer.device, mainShader);

  renderer.addRenderPass(material);
        renderer.start(0, 200, (frame) => {
            fps.frame();
  });


```