import { vertices,indices } from "./Square";
import vertCode from "./color.vert.wgsl?raw";
import fragCode from "./color.frag.wgsl?raw";
async function main(){
  //-----------------Init-----------------//
  if(!navigator.gpu) throw new Error('WebGPU not supported');
  //canvas element to display the render on
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  if(!canvas) throw new Error('Canvas not found');
  //gpu adapter to get the gpu device
  const gpuAdapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance' //or try 'low-power'
  });
  if(!gpuAdapter) throw new Error('GPU Adapter not found');
  //get the gpu device
  const gpuDevice = await gpuAdapter.requestDevice();
  if(!gpuDevice) throw new Error('GPU Device not found');
  //get the context for the canvas. There are multiple contexts for different purposes
  const gpuContext = canvas.getContext('webgpu');
  if(!gpuContext) throw new Error('GPU Context not found');
  gpuContext.configure({
    device: gpuDevice,
    format: 'bgra8unorm',
  });
  //---------------Pipeline---------------//
  const gpuPipeline = gpuDevice.createRenderPipeline({
    layout:"auto",
    vertex:{
      module: gpuDevice.createShaderModule({
        code: vertCode
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: (3+3) * 4, //3 floats for position and 3 floats for color per vertex. 4 bytes per float32, that makes up for 24 bytes per vertex
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x3'
            },
            {
              shaderLocation: 1,
              offset: 3 * 4, //3 floats * 4 bytes per float32, basically the offset for the color attribute
              format: 'float32x3'
            }
          ]
        }
      ]
    },
    fragment:{
      module: gpuDevice.createShaderModule({
        code: fragCode
      }),
      entryPoint: 'main',
      targets:[
        {
          format: 'bgra8unorm'
        }
      ],
    },
    primitive:{
      topology: 'triangle-list',
    }
  });
  //---------------Buffers----------------//
  const gpuVertexBuffer = gpuDevice.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });
  gpuDevice.queue.writeBuffer(gpuVertexBuffer, 0, vertices);
  const gpuIndexBuffer = gpuDevice.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
  });
  gpuDevice.queue.writeBuffer(gpuIndexBuffer, 0, indices);
  //-------------Render Pass--------------//
  const gpuCommandEncoder = gpuDevice.createCommandEncoder();
  const gpuRenderPass = gpuCommandEncoder.beginRenderPass({
    colorAttachments:[
      {
        view: gpuContext.getCurrentTexture().createView(),
        clearValue: {r: 0.03, g: 0.07, b: 0.15, a: 1.0},
        loadOp: 'clear',
        storeOp: 'store'
      }
    ]
  });
  gpuRenderPass.setPipeline(gpuPipeline);
  gpuRenderPass.setVertexBuffer(0, gpuVertexBuffer);
  gpuRenderPass.setIndexBuffer(gpuIndexBuffer, 'uint32');
  gpuRenderPass.drawIndexed(indices.length, 1, 0, 0, 0);
  gpuRenderPass.end();
  gpuDevice.queue.submit([gpuCommandEncoder.finish()]);
}
main();