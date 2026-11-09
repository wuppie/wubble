/* Wubble Prism: React Bits <Prism /> (JS+CSS variant) as plain JS, no React.
   Webflow: an empty div with [data-wb-prism] (sized/positioned by its parent). Props as data attributes:
   data-time-scale="0.5" data-glow="1" data-scale="3.6" data-height="3.5" data-base-width="5.5" data-saturation="1.5"
   data-color-frequency="1" data-hover-strength="2" data-inertia="0.05" data-resolution="0.5" data-animation="rotate|3drotate|hover|static".
   Custom palette, hue shift, noise and light mode from the original are left out (not used here). */
(() => {
  if (window.__wbPrism) return; window.__wbPrism = 1;
  const VERTEX = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0.0,1.0);}`;
  const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uResolution;uniform mat3 uRay;uniform float uGlow,uColorFreq,uCenterShift,uInvBaseHalf,uInvHeight,uMinAxis,uPxScale,uSaturation;
out vec4 outColor;
const vec4 PHASE_COS=vec4(1.0,0.5403023058681398,-0.4161468365471424,-0.9899924966004454);
const vec4 PHASE_SIN=vec4(0.0,0.8414709848078965,0.9092974268256817,0.1411200080598672);
float pyramid(vec3 p){vec3 q=vec3(abs(p.x)*uInvBaseHalf,abs(p.y)*uInvHeight,abs(p.z)*uInvBaseHalf);return max((q.x+q.y+q.z-1.0)*uMinAxis*0.5773502691896258,-p.y);}
void main(){
  vec2 f=(gl_FragCoord.xy-0.5*uResolution)*uPxScale;vec3 origin=uRay*vec3(f,0.0);vec3 axis=uRay[2];float z=5.0;vec4 o=vec4(0.0);
  for(int i=0;i<100;i++){vec3 p=origin+axis*z;float d=0.1+0.2*abs(pyramid(p+vec3(0.0,uCenterShift,0.0)));z-=d;float phase=(p.y+z)*uColorFreq;
    vec4 band=sin(phase)*PHASE_COS+cos(phase)*PHASE_SIN+1.0;o+=band/d;}
  vec4 raw=o*o*uGlow/1e5;vec4 e=exp(2.0*raw);vec4 m=(e-1.0)/(e+1.0);
  vec3 col=clamp(m.rgb,0.0,1.0);float L=dot(col,vec3(0.2126,0.7152,0.0722));col=clamp(mix(vec3(L),col,uSaturation),0.0,1.0);
  outColor=vec4(col*m.a,m.a);
}`;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rotation = (yaw, pitch, roll) => { const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch), cz = Math.cos(roll), sz = Math.sin(roll);
    return [cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz, -cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz, sy * cx, -sx, cy * cx]; };
  const multiply = (a, b) => { const out = new Array(9); for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) out[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2]; return out; };

  const mount = (el) => {
    if (el.__prism) return; el.__prism = 1;
    const num = (k, d) => { const v = parseFloat(el.getAttribute('data-' + k)); return isNaN(v) ? d : v; };
    const s = { height: num('height', 3.5), baseWidth: num('base-width', 5.5), glow: num('glow', 1), scale: num('scale', 3.6), colorFrequency: num('color-frequency', 1),
      saturation: num('saturation', 1.5), timeScale: num('time-scale', 0.5), hoverStrength: num('hover-strength', 2), inertia: clamp(num('inertia', 0.05), 0.001, 1),
      resolution: clamp(num('resolution', 0.5), 0.25, 1), anim: el.getAttribute('data-animation') || 'rotate' };
    const coarse = matchMedia('(pointer: coarse)').matches; /* phones: DPR 1 (GPU memory budget) */
    const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true'); canvas.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;';
    el.appendChild(canvas);
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }); if (!gl) return;
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
    const vs = sh(gl.VERTEX_SHADER, VERTEX), fs = sh(gl.FRAGMENT_SHADER, FRAGMENT); if (!vs || !fs) return;
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    const U = {}; ['uResolution', 'uRay', 'uGlow', 'uColorFreq', 'uCenterShift', 'uInvBaseHalf', 'uInvHeight', 'uMinAxis', 'uPxScale', 'uSaturation'].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
    const vao = gl.createVertexArray(), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pose = { yaw: 0, pitch: 0, roll: 0 }, pointer = { x: 0, y: 0, inside: false };
    let time = 0, intro = reduce ? 1 : 0, last = 0, W = 0;
    const orient = () => { const tilt = rotation(pose.yaw, pose.pitch, pose.roll), t = time * s.timeScale;
      if (s.anim === 'rotate') { const c0 = Math.cos(t), c1 = Math.cos(t + 33), c2 = Math.cos(t + 11); return multiply(tilt, [c0, 0, c2, 0, 1, 0, c1, 0, c0]); }
      if (s.anim === '3drotate') return multiply(tilt, rotation(t * 0.55, Math.sin(t * 0.6 + 0.6) * 0.6, Math.sin(t * 0.35 + 1.9) * 0.5));
      return tilt; };
    const size = () => { const k = Math.min(coarse ? 1 : (window.devicePixelRatio || 1), 2) * s.resolution; W = Math.max(1, el.clientWidth);
      canvas.width = Math.max(1, Math.round(W * k)); canvas.height = Math.max(1, Math.round(Math.max(1, el.clientHeight) * k)); };
    const draw = () => { const half = s.baseWidth * 0.5, ig = intro * intro * (3 - 2 * intro);
      gl.bindVertexArray(vao); gl.viewport(0, 0, canvas.width, canvas.height); gl.useProgram(pr);
      gl.uniform2f(U.uResolution, canvas.width, canvas.height); gl.uniformMatrix3fv(U.uRay, false, orient()); gl.uniform1f(U.uGlow, s.glow * ig * ig);
      gl.uniform1f(U.uColorFreq, s.colorFrequency); gl.uniform1f(U.uCenterShift, s.height * 0.25); gl.uniform1f(U.uInvBaseHalf, 1 / half); gl.uniform1f(U.uInvHeight, 1 / s.height);
      gl.uniform1f(U.uMinAxis, Math.min(half, s.height)); gl.uniform1f(U.uPxScale, 1 / (canvas.height * 0.1 * s.scale)); gl.uniform1f(U.uSaturation, s.saturation);
      gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const frame = (now) => { requestAnimationFrame(frame);
      if (document.hidden) { last = 0; return; }
      if (el.clientWidth !== W) size();
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60; last = now;
      if (!reduce) time += dt; if (intro < 1) intro = Math.min(1, intro + dt / 2.4); /* slower intro than the original 1.4s: fades in softly */
      const hover = s.anim === 'hover', aim = pointer.inside && !reduce, reach = (hover ? 0.6 : 0.09) * s.hoverStrength, follow = 1 - Math.pow(1 - s.inertia, dt * 60);
      pose.yaw += ((aim ? -pointer.x * reach : 0) - pose.yaw) * follow; pose.pitch += ((aim ? pointer.y * reach : 0) - pose.pitch) * follow; pose.roll *= Math.pow(0.9, dt * 60);
      if (window.WB_GL_OK && !window.WB_GL_OK(gl)) return; draw(); };
    addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(), x = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1, y = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;
      pointer.inside = Math.abs(x) <= 1 && Math.abs(y) <= 1; pointer.x = clamp(x, -1, 1); pointer.y = clamp(y, -1, 1); }, { passive: true });
    addEventListener('blur', () => { pointer.inside = false; });
    size(); requestAnimationFrame(frame);
  };
  const go = () => document.querySelectorAll('[data-wb-prism]').forEach(mount);
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', go, { once: true }) : go();
})();
