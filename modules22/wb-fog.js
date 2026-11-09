/* Wubble footer fog: soft drifting fog that rolls in just before the footer (shader after the "Lumen Roof" fog, fog only).
   Resting fog (bottom band, side wisps, mid-air wisps) fades in over the last screens before the footer, then the fog front
   rises (the "surge") while the footer slides in over it. Scroll position drives everything; the shader itself drifts forever.
   Footer: [data-footer-spacer] (homepage reveal) or the first [data-footer] / footer element. Light (morning) colours by default;
   data-wb-fog-night on <html> switches to the night palette. One WebGL2 context, created only once the footer is near, at most
   960px wide (phones much less); paused while out of range. */
(() => {
  if (window.__wbFog || matchMedia('(prefers-reduced-motion: reduce)').matches) return; window.__wbFog = 1;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), smooth = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
  const coarse = matchMedia('(pointer: coarse)').matches, K = document.documentElement.hasAttribute('data-wb-fog-night') ? 1 : 0;
  const FS = `#version 300 es
  precision highp float;
  uniform vec2 R;uniform float T,S,K;out vec4 O;
  float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float a=.5,s=0.;mat2 m=mat2(1.6,1.2,-1.2,1.6);p=mat2(.8,.6,-.6,.8)*p+5.3;for(int i=0;i<5;i++){s+=a*n(p);p=m*p;a*=.5;}return s;}
  void main(){
    vec2 uv=gl_FragCoord.xy/R;uv.y=1.-uv.y;
    float asp=R.x/R.y;vec2 p=vec2(uv.x*asp,uv.y);
    float t=T*.05;
    vec2 w=vec2(fbm(p*1.3+vec2(t,-t*.6)),fbm(p*1.3+vec2(-t*.8,t)+7.));
    float d=fbm(p*1.9+w*1.7+vec2(t*1.6,-t*1.1+S*.5));
    float e=fbm(p*.9-w+vec2(-t,t*.5)+3.);
    float low=smoothstep(.70,1.04,uv.y+(d-.5)*.34);
    float side=smoothstep(.2,.0,uv.x+(e-.5)*.28)+smoothstep(.8,1.,uv.x+(e-.5)*.28);
    side*=smoothstep(.25,.6,uv.y)*.2;
    float wisps=smoothstep(.5,.78,d)*smoothstep(.22,.5,uv.y)*smoothstep(.86,.6,uv.y)*.18;
    float rest=clamp(low+side+wisps,0.,1.);
    float front=1.02-S*.68;
    float rise=smoothstep(front-.02,front+.26,uv.y+(d-.5)*.5);
    float haze=S*(.3+.46*d);
    float a=clamp(max(rest,max(rise*.97,haze)),0.,1.);
    vec3 dayA=vec3(.97,.93,.84),dayB=vec3(.79,.78,.71);
    vec3 nitA=vec3(.40,.45,.57),nitB=vec3(.15,.19,.29);
    vec3 c=mix(mix(dayB,dayA,d*1.15),mix(nitB,nitA,d*1.1),K);
    O=vec4(c*a,a);
  }`;
  let cv = null, gl = null, U = {};
  const init = () => {
    cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;z-index:50;pointer-events:none;opacity:0;visibility:hidden;';
    document.body.appendChild(cv);
    gl = cv.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
    if (!gl) return;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, '#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.-1.,0,1);}'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    for (const u of ['R', 'T', 'S', 'K']) U[u] = gl.getUniformLocation(pr, u);
    size(); addEventListener('resize', size);
    /* the footer slides in over the fog (in-flow footers get a stacking order above it) */
    const ft = document.querySelector('[data-footer]') || document.querySelector('footer');
    if (ft) { const cs = getComputedStyle(ft); if (cs.position === 'static') ft.style.position = 'relative'; if ((parseInt(cs.zIndex) || 0) < 52) ft.style.zIndex = '52'; }
  };
  const size = () => { if (!gl) return; const cap = coarse ? 480 : 960, w = Math.round(Math.min(innerWidth, cap)), h = Math.round(w * innerHeight / innerWidth);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); } };
  const mark = () => document.querySelector('[data-footer-spacer]') || document.querySelector('[data-footer]') || document.querySelector('footer');
  let shown = -1;
  const frame = (now) => { requestAnimationFrame(frame);
    const m = mark(); if (!m) return;
    const V = innerHeight, top = m.getBoundingClientRect().top, q = clamp((1.6 * V - top) / (1.6 * V)); /* 0 far away .. 1 when the footer starts */
    const vis = smooth(0, 0.25, q), S = smooth(0.35, 1, q);
    const key = vis.toFixed(3); if (key !== shown) { shown = key; if (vis > 0 && !cv) init(); if (cv) { cv.style.opacity = key; cv.style.visibility = vis > 0.002 ? '' : 'hidden'; } }
    if (!gl || vis <= 0.002 || (window.WB_GL_OK && !window.WB_GL_OK(gl))) return;
    gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.T, now / 1000); gl.uniform1f(U.S, S); gl.uniform1f(U.K, K); gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
})();
