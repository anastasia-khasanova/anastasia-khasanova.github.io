// src/lib/custom-effects/CodeComponentId_697c539e0b0a924999ea84842d1cfd5089bec81f_acbc2759208a5cce1555d399773c48cef3383aeb.ts
function defineProperties(_component, _properties) {
}
function Effect() {
}
function setup(device2, frame) {
  var wgsl = `
diagnostic(off,derivative_uniformity);
struct Uniforms {
  frameData: vec4f,
  inputDimsData: vec4f,
  blurStrength: vec4f,
  focus: vec4f,
  hazeStrength: vec4f,
  desaturation: vec4f,
  vignetteColor: vec4f,
};
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var inputTex: texture_2d<f32>;

struct VsIn {
  @location(0) pos: vec2f,
  @location(1) uv: vec2f,
};
struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

fn sampleInput(p: vec2f) -> vec4f {
  return textureSampleLevel(inputTex, samp, clamp(p, vec2f(0.0), vec2f(1.0)), 0.0);
}

// Like sampleInput but returns transparent (premultiplied zero) outside the
// input rect instead of repeating the edge texel.
fn sampleInputOrZero(p: vec2f) -> vec4f {
  let inside = step(vec2f(0.0), p) * step(p, vec2f(1.0));
  return sampleInput(p) * (inside.x * inside.y);
}

fn hash22(p: vec2f) -> vec2f {

  var p3 = fract(vec3f(p.xyx) * vec3f(0.1031, 0.1030, 0.0973));

  p3 += dot(p3, p3.yzx + 33.33);

  return fract((p3.xx + p3.yz) * p3.zy);

}

@vertex fn vs_main(in: VsIn) -> VsOut {
  var out: VsOut;
  out.position = vec4f(in.pos, 0.0, 1.0);
  out.uv = in.uv;
  return out;
}

@fragment fn fs_main(@location(0) outputUv_in: vec2f) -> @location(0) vec4f {
  let time = u.frameData.x;
  let outputUv = outputUv_in;
  let dims = max(u.frameData.yz, vec2f(1.0));
  let inputDims = max(u.inputDimsData.xy, vec2f(1.0));
  let inputTexel = vec2f(1.0) / inputDims;
  let uv = outputUv;
  // texel and aspect are input-relative to match uv. Zoom fills rescale texel
  // alongside their uv redefinition below (see zoomLocal).
  let texel = inputTexel;
  let aspect = inputDims.x / max(inputDims.y, 1.0);
  let blurStrength = u.blurStrength.x;
  let focus = u.focus;
  let hazeStrength = u.hazeStrength.x;
  let desaturation = u.desaturation.x;
  let vignetteColor = u.vignetteColor;
  let inputColor = sampleInput(uv);
  let focusUv = focus.xy / 100.0;
  let focusR = focus.z / 100.0;
  let minDim = min(dims.x, dims.y);
  // pixel-space distance from focus center, aspect-correct
  let p = uv * dims;
  let fc = focusUv * dims;
  let dist = length(p - fc);
  let radiusPx = focusR * minDim;
  // blur factor: 0 at center, 1 at edge
  let blurFactor = smoothstep(radiusPx * 0.5, radiusPx, dist);
  // number of blur samples scaled by blur factor
  let maxSamples = 16;
  let blurPx = blurStrength * blurFactor;
  var col = inputColor;
  if (blurPx > 0.5) {
    col = vec4f(0.0);
    for (var i = 0; i < maxSamples; i++) {
      let h = hash22(uv * 1000.0 + f32(i) * 7.13);
      let angle = h.x * 6.2831853;
      let r = sqrt(h.y) * blurPx;
      let offset = vec2f(cos(angle), sin(angle)) * r * texel;
      col += sampleInputOrZero(uv + offset);
    }
    col /= f32(maxSamples);
  }
  // haze: light uniform blur (reuse a few samples) + brightness lift
  var haze = vec4f(0.0);
  for (var i = 0; i < 8; i++) {
    let h = hash22(uv * 500.0 + f32(i) * 3.77 + 100.0);
    let angle = h.x * 6.2831853;
    let r = sqrt(h.y) * 8.0;
    let offset = vec2f(cos(angle), sin(angle)) * r * texel;
    haze += sampleInputOrZero(uv + offset);
  }
  haze /= 8.0;
  haze = haze + vec4f(0.06, 0.06, 0.06, 0.0);
  col = mix(col, haze, hazeStrength);
  // desaturation
  let lum = dot(col.rgb, vec3f(0.299, 0.587, 0.114));
  let gray = vec3f(lum);
  let desatRgb = mix(col.rgb, gray * col.a, desaturation);
  col = vec4f(desatRgb, col.a);
  // vignette tint (premultiplied)
  let vigFactor = smoothstep(radiusPx * 0.3, radiusPx * 1.5, dist);
  let vc = vignetteColor;
  let tint = vec4f(vc.rgb * vc.a, vc.a) * vigFactor;
  col = col * (1.0 - tint.a) + tint;
  return col;
}
`;
  frame.state.module = device2.createShaderModule({ code: wgsl });
  frame.state.pipeline = null;
  frame.state.pipelineFormat = null;
  frame.state.quad = device2.createBuffer({
    size: 6 * 4 * 4,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true
  });
  new Float32Array(frame.state.quad.getMappedRange()).set([
    -1,
    -1,
    0,
    1,
    1,
    -1,
    1,
    1,
    -1,
    1,
    0,
    0,
    -1,
    1,
    0,
    0,
    1,
    -1,
    1,
    1,
    1,
    1,
    1,
    0
  ]);
  frame.state.quad.unmap();
  frame.state.uniformBuf = device2.createBuffer({
    size: 112,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });
  frame.state.sampler = device2.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge"
  });
  frame.state.placeholder = device2.createTexture({
    size: [1, 1, 1],
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
  });
  device2.queue.writeTexture({ texture: frame.state.placeholder }, new Uint8Array([0, 0, 0, 0]), { bytesPerRow: 4 }, { width: 1, height: 1, depthOrArrayLayers: 1 });
}
function render(device2, frame) {
  var params = frame.params || {};
  function finiteNumber(value, fallback) {
    var num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }
  function numberParam(name, fallback) {
    return finiteNumber(params[name], fallback);
  }
  function boolParam(name, fallback) {
    if (typeof params[name] === "boolean")
      return params[name] ? 1 : 0;
    return fallback ? 1 : 0;
  }
  function selectParam(name, count, fallbackIndex) {
    var index = Math.round(Number(params[name]));
    return Number.isFinite(index) && index >= 0 && index < count ? index : fallbackIndex;
  }
  function colorParam(name, fallback) {
    var value = params[name] || {};
    return [
      finiteNumber(value.r, fallback[0]),
      finiteNumber(value.g, fallback[1]),
      finiteNumber(value.b, fallback[2]),
      finiteNumber(value.a, fallback[3])
    ];
  }
  function pointParam(name, fallback) {
    var value = params[name] || {};
    return [
      finiteNumber(value.x, fallback[0]),
      finiteNumber(value.y, fallback[1])
    ];
  }
  function pointRadiusParam(name, fallback) {
    var value = params[name] || {};
    return [
      finiteNumber(value.x, fallback[0]),
      finiteNumber(value.y, fallback[1]),
      finiteNumber(value.radius, fallback[2])
    ];
  }
  function pointPointLineParam(name, fallback) {
    var value = params[name] || {};
    return [
      finiteNumber(value.x, fallback[0]),
      finiteNumber(value.y, fallback[1]),
      finiteNumber(value.x2, fallback[2]),
      finiteNumber(value.y2, fallback[3])
    ];
  }
  function pointAngleRadiusParam(name, fallback) {
    var value = params[name] || {};
    return [
      finiteNumber(value.x, fallback[0]),
      finiteNumber(value.y, fallback[1]),
      finiteNumber(value.radius, fallback[2]),
      finiteNumber(value.angle, fallback[3])
    ];
  }
  function colorPointParam(name, fallback) {
    var value = params[name] || {};
    var color = value.color || {};
    return [
      finiteNumber(value.x, fallback[0]),
      finiteNumber(value.y, fallback[1]),
      0,
      0,
      finiteNumber(color.r, fallback[2]),
      finiteNumber(color.g, fallback[3]),
      finiteNumber(color.b, fallback[4]),
      finiteNumber(color.a, fallback[5])
    ];
  }
  function gradientParam(name, fallback) {
    var value = params[name] || {};
    var stops = Array.isArray(value.stops) && value.stops.length > 0 ? value.stops : fallback;
    var out = new Array(44).fill(0);
    var count = Math.min(stops.length, 8);
    for (var i = 0; i < count; i++) {
      var stop = stops[i] || {};
      var color = stop.color || {};
      out[i * 4] = finiteNumber(color.r, 0);
      out[i * 4 + 1] = finiteNumber(color.g, 0);
      out[i * 4 + 2] = finiteNumber(color.b, 0);
      out[i * 4 + 3] = finiteNumber(color.a, 1);
      out[32 + i] = finiteNumber(stop.position, 0);
    }
    out[40] = count;
    return out;
  }
  var output = frame.output || {};
  var width = Math.max(1, finiteNumber(output.width, 1));
  var height = Math.max(1, finiteNumber(output.height, 1));
  var time = 0;
  var inputWidth = width;
  var inputHeight = height;
  device2.queue.writeBuffer(frame.state.uniformBuf, 0, new Float32Array([
    time,
    width,
    height,
    0,
    inputWidth,
    inputHeight,
    0,
    0,
    numberParam("blurStrength", 15),
    0,
    0,
    0,
    ...pointRadiusParam("focus", [50, 50, 25]),
    0,
    numberParam("hazeStrength", 0.25),
    0,
    0,
    0,
    numberParam("desaturation", 0.45),
    0,
    0,
    0,
    ...colorParam("vignetteColor", [0.231, 0.157, 0.086, 0.55])
  ]));
  var inputView = frame.input != null ? frame.input.createView() : frame.state.placeholder.createView();
  var outputFormat = frame.output.format;
  if (frame.state.pipeline == null || frame.state.pipelineFormat !== outputFormat) {
    frame.state.pipeline = device2.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: frame.state.module,
        entryPoint: "vs_main",
        buffers: [{
          arrayStride: 16,
          attributes: [
            { shaderLocation: 0, format: "float32x2", offset: 0 },
            { shaderLocation: 1, format: "float32x2", offset: 8 }
          ]
        }]
      },
      fragment: {
        module: frame.state.module,
        entryPoint: "fs_main",
        targets: [{ format: outputFormat }]
      },
      primitive: { topology: "triangle-list" }
    });
    frame.state.pipelineFormat = outputFormat;
  }
  var bindGroup = device2.createBindGroup({
    layout: frame.state.pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: frame.state.uniformBuf } },
      { binding: 1, resource: frame.state.sampler },
      { binding: 2, resource: inputView }
    ]
  });
  var encoder = device2.createCommandEncoder();
  var pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: frame.output.createView(),
      loadOp: "clear",
      clearValue: { r: 0, g: 0, b: 0, a: 0 },
      storeOp: "store"
    }]
  });
  pass.setPipeline(frame.state.pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.setVertexBuffer(0, frame.state.quad);
  pass.draw(6);
  pass.end();
  device2.queue.submit([encoder.finish()]);
}
defineProperties(Effect, {
  "blurStrength": {
    type: "number",
    label: "Blur Strength",
    defaultValue: 15,
    control: "slider",
    min: 0,
    max: 40,
    step: 0.5
  },
  "focus": {
    type: "point-radius",
    label: "Focus",
    defaultValue: { "x": 50, "y": 50, "radius": 25 },
    mode: "canvas_and_ui",
    positionUnit: "%",
    radiusUnit: "%",
    minRadius: 1,
    maxRadius: 100
  },
  "hazeStrength": {
    type: "number",
    label: "Haze Strength",
    defaultValue: 0.25,
    control: "slider",
    min: 0,
    max: 1,
    step: 0.01
  },
  "desaturation": {
    type: "number",
    label: "Desaturation",
    defaultValue: 0.45,
    control: "slider",
    min: 0,
    max: 1,
    step: 0.01
  },
  "vignetteColor": {
    type: "color",
    label: "Vignette Color",
    defaultValue: { "r": 0.231, "g": 0.157, "b": 0.086, "a": 0.55 }
  }
});

// src/instruction-memory-effect.js
var data = Object.fromEntries(await Promise.all(["route", "jump"].map(async (mode) => [mode, await fetch(`mode-${mode}-motion.json`).then((r) => r.json())])));
var adapter = await navigator.gpu?.requestAdapter().catch(() => null);
var device = await adapter?.requestDevice().catch(() => null);
function initial(v) {
  if (v?.type === 5) return initial(v.value.expressionArguments[0]);
  if (v && typeof v === "object" && "resolvedType" in v) return v.value;
  return v;
}
function bezier(t, e) {
  if (!e?.value) return t;
  const { x1, y1, x2, y2 } = e.value;
  const b = (u, a, c) => 3 * (1 - u) * (1 - u) * u * a + 3 * (1 - u) * u * u * c + u * u * u;
  let lo = 0, hi = 1;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    if (b(mid, x1, x2) < t) lo = mid;
    else hi = mid;
  }
  return b((lo + hi) / 2, y1, y2);
}
function sample(binding, time) {
  const k = binding.keyframes;
  let a = k[0], b = k[k.length - 1];
  for (let i = 1; i < k.length; i++) if (time <= k[i].timelinePosition / 1e3) {
    a = k[i - 1];
    b = k[i];
    break;
  }
  const t = bezier(Math.max(0, Math.min(1, (time - a.timelinePosition / 1e3) / ((b.timelinePosition - a.timelinePosition) / 1e3 || 1))), a.easing);
  const mix = (x, y) => typeof x === "number" ? x + (y - x) * t : Object.fromEntries(Object.keys(x).map((key) => [key, mix(x[key], y[key])]));
  return mix(a.value.value, b.value.value);
}
if (device) {
  let tick = function(now) {
    requestAnimationFrame(tick);
    if (now - last < 33) return;
    last = now;
    for (const { panel, draw } of ready) {
      if (panel.hidden || !panel.closest(".instruction-is-visible")) continue;
      const clock = panel.getAnimations({ subtree: true })[0];
      draw((Number(clock?.currentTime) || 0) % 2e4);
    }
  };
  const jobs = [];
  for (const node of document.querySelectorAll("[data-instruction-shader]")) jobs.push((async () => {
    try {
      const image = node.querySelector("img");
      if (!image) return;
      await image.decode();
      const width = Number(image.getAttribute("width")) || 128, height = Number(image.getAttribute("height")) || width, size = Math.max(128, Math.min(512, Math.ceil(Math.max(width, height) * 2)));
      const source = new OffscreenCanvas(size, size);
      source.getContext("2d").drawImage(image, 0, 0, size, size);
      const input = device.createTexture({ size: [size, size], format: "rgba8unorm", usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT });
      device.queue.copyExternalImageToTexture({ source }, { texture: input }, [size, size]);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      canvas.className = "instruction-effect-canvas";
      const context = canvas.getContext("webgpu");
      context.configure({ device, format: navigator.gpu.getPreferredCanvasFormat(), alphaMode: "premultiplied" });
      const params = Object.fromEntries(Object.entries(JSON.parse(node.dataset.instructionShader)).map(([k, v]) => [k, initial(v)]));
      const panel = node.closest("[data-instruction]"), mode = panel.dataset.instruction, track = data[mode].nodes.find((n) => n.nodeId === node.dataset.nodeId || n.fallbackNodeId === node.dataset.nodeId)?.shaderEffectParameters?.["0"];
      const frame = { state: {}, input, output: null, params };
      setup(device, frame);
      const draw = (time) => {
        if (track) for (const [key, value] of Object.entries(track)) frame.params[key] = sample(value.binding, time);
        frame.output = context.getCurrentTexture();
        render(device, frame);
      };
      draw(0);
      node.appendChild(canvas);
      node.classList.add("instruction-effect-ready");
      return { panel, draw };
    } catch (e) {
      console.warn("Instruction image effect unavailable", e);
    }
  })());
  const ready = (await Promise.all(jobs)).filter(Boolean);
  let last = 0;
  requestAnimationFrame(tick);
}
