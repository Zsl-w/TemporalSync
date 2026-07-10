import React, { useEffect, useRef, useState } from 'react';

export const FluidCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let glContext: WebGLRenderingContext | null = null;
    let vertexBuffer: WebGLBuffer | null = null;
    let shaderProgram: WebGLProgram | null = null;
    let vsShader: WebGLShader | null = null;
    let fsShader: WebGLShader | null = null;

    // Defer WebGL compilation and render to prevent main thread blocking during page transitions
    const timerId = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext('webgl');
      if (!gl) return;
      glContext = gl;

      // Vertex shader source
      const vsSource = `
        attribute vec2 position;
        varying vec2 v_uv;
        void main() {
          v_uv = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      // Fragment shader source: Computes a multi-directional fluid mesh wave pattern
      const fsSource = `
        precision mediump float;
        varying vec2 v_uv;
        uniform vec2 u_resolution;
        uniform float u_time;

        void main() {
          vec2 uv = v_uv;
          
          // Time constant for flow speed
          float t = u_time * 0.22;
          
          // Multi-directional sine wave displacement for fluid movement
          float x1 = sin(uv.x * 2.2 + t) * 0.5 + 0.5;
          float y1 = cos(uv.y * 1.8 - t * 1.1) * 0.5 + 0.5;
          
          float x2 = sin(uv.y * 2.8 + t * 0.75 + 1.2) * 0.5 + 0.5;
          float y2 = cos(uv.x * 2.4 - t * 0.85 + 2.4) * 0.5 + 0.5;

          float w1 = x1 * y1;
          float w2 = x2 * y2;
          
          // Diagonal waves for organic morphing
          float w3 = sin((uv.x + uv.y) * 1.6 + t * 1.0) * 0.5 + 0.5;
          float w4 = cos((uv.x - uv.y) * 2.0 - t * 0.6) * 0.5 + 0.5;

          // Custom brand fluid color palette (Teal #275E61, Deep Indigo #120D26, Coral Pink #F9B9A6, Lavender)
          vec3 c1 = vec3(0.15, 0.37, 0.38); // #275E61 (Teal)
          vec3 c2 = vec3(0.09, 0.08, 0.22); // #181438 (Deep Indigo)
          vec3 c3 = vec3(0.98, 0.73, 0.65); // #F9B9A6 (Coral Pink)
          vec3 c4 = vec3(0.68, 0.40, 0.78); // #ae66c7 (Lavender)
          vec3 c5 = vec3(0.24, 0.58, 0.60); // #3d9499 (Bright Teal)

          // Organic color blending (fluid mixing)
          vec3 color = mix(c5, c1, w1);
          color = mix(color, c2, w2 * 0.85);
          color = mix(color, c3, w3 * 0.75);
          color = mix(color, c4, w4 * 0.6);
          
          // Add a soft glow center
          float dist = distance(uv, vec2(0.5, 0.5));
          color = mix(color, c1 * 1.12, (1.0 - dist) * 0.18);

          gl_FragColor = vec4(color, 1.0);
        }
      `;

      const compileShader = (source: string, type: number) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = compileShader(vsSource, gl.VERTEX_SHADER);
      const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
      if (!vs || !fs) return;
      vsShader = vs;
      fsShader = fs;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return;
      }
      shaderProgram = program;

      gl.useProgram(program);

      // Set up full screen quad
      const vertices = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]);

      const buffer = gl.createBuffer();
      if (!buffer) return;
      vertexBuffer = buffer;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const positionLoc = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
      const timeLoc = gl.getUniformLocation(program, 'u_time');

      const startTime = Date.now();

      const resize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
      };

      const render = () => {
        resize();
        
        const elapsed = (Date.now() - startTime) / 1000.0;
        gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
        gl.uniform1f(timeLoc, elapsed);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Trigger fade-in on first successful frame render
        setIsReady(true);
        animationFrameId = requestAnimationFrame(render);
      };

      render();
    }, 100);

    return () => {
      clearTimeout(timerId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (glContext) {
        if (vertexBuffer) glContext.deleteBuffer(vertexBuffer);
        if (shaderProgram) glContext.deleteProgram(shaderProgram);
        if (vsShader) glContext.deleteShader(vsShader);
        if (fsShader) glContext.deleteShader(fsShader);
      }
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`} 
    />
  );
};
