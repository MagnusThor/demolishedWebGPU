# demolishedWebGPU


demolishedWebGPU is a shader rendering engine based on WebGPU. WebGPU is a new web API that exposes modern computer graphics capabilities, specifically Direct3D 12, Metal, and Vulkan, for performing rendering and computation operations on a GPU.

This project; demolishedWebGPU is an WebGPU implementation of the existing demolishedRenderer engine (https://github.com/MagnusThor/demolishedRenderer).

This an early version, but the following features will be available shortly;

1. Multi-pass (1-n shader programs/buffers) 
2. 1-n textures
3. Custom uniforms

As in demolishedRenderer the goal is to keep the *engine* tiny, and its written mainly for a demo-scene purpose, but as demolishedRenderer 
 you can use in graphics/rendering itense webapplications. 


# Example



    const renderer = new Renderer(document.querySelector('canvas'));

    renderer.getDevice().then(async device => {
    
    const vertices = new Float32Array([
      -1, 1, 0, 1, 0, 1, 1, 1,
      -1, -1, 0, 1, 0, 1, 1, 1,
      1, -1, 0, 1, 0, 1, 1, 1,

      -1, 1, 0, 1, 0, 1, 1, 1,
      1, -1, 0, 1, 0, 1, 1, 1,
      1, 1, 0, 1, 0, 1, 1, 1,
    ]);

    // width,height,devicePixelRatio,time 
    const uniforms = new Float32Array([renderer.canvas.width, renderer.canvas.height, devicePixelRatio, 0]);

    const geometry = new Geometry(device, vertices); // quad ( two triangles)
    const material = new Material(device, cloudWglsl)

    renderer.initialize(geometry, material, uniforms).then(() => {
      renderer.render();
    })


## Vertex & Fragment shader modules

Below you find an example of a plasma written in wglsl, as you see there are enough similarities between for instance Metal and WebGPU that we can directly compare their respective APIs and shading languages.

    
      let MAX_ITER: i32 = 20;
      let TAU: f32 = 7.28318530718;
            
      fn main(fragCoord: vec2<f32>) -> vec4<f32> {

        var uv: vec2<f32>= (fragCoord + vec2<f32>(1.0, 1.0)) / vec2<f32>(2.0, 2.0);
        var time: f32 = uniforms.time;
    
        var p: vec2<f32> = (uv * vec2<f32>(TAU, TAU) % vec2<f32>(TAU, TAU)) - vec2<f32>(250.0, 250.0);
        var i: vec2<f32> = vec2<f32>(p);
        var c: f32 = 0.5;
        var inten: f32 = 0.005;
    
        for (var n: i32 = 0; n < MAX_ITER; n = n + 1) {
            var t: f32 = 0.16 * (time + 23.0) * (1.0 - (3.5 / (f32(n) + 1.0)));
            i = p + vec2<f32>(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
            c = c + 1.0 / length(vec2<f32>(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
        }
    
        c = c / f32(MAX_ITER);
        c = 1.0 - pow(c, 2.0);
        var cc: f32 = pow(abs(c), 12.0);
        var color: vec3<f32> = vec3<f32>(cc, cc, cc);
        color = clamp(color, vec3<f32>(0.0, 0.0, 0.0), vec3<f32>(1.0, 1.0, 1.0));
    
        var tint: vec3<f32>= vec3<f32>(uv.x, uv.y, (1.0 - uv.x) * (1.0 - uv.y));
        return vec4<f32>(color* tint,1.0);

      }
      
    


# How to use WebGPU 

WebGPU is at the moment an experimental API so in order to try demolishedWebGPU follow this insytructions 

Enabling via about://flags #
To experiment with WebGPU locally, without an origin trial token, enable the #enable-unsafe-webgpu flag in about://flags.







