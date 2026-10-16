/* Wubble V22 module: sections — methods mixed into the page component */
(window.WBM = window.WBM || {});
Object.assign(window.WBM, {
  initCta(THREE) {
    const box = this.ctaGlRef.current, sec = this.heroRef.current; if (!box || !sec) return;
    if (!this._ctaArmed) { this._ctaArmed = 1; const go = () => { removeEventListener('pointermove', go); if (!this.dead) this.initCta(THREE); }; addEventListener('pointermove', go, { passive: true }); return; } // lazy: no context until the pointer moves
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const U = { uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uP: { value: 0 }, uM: { value: new THREE.Vector2() }, uIn: { value: 0 }, uTilt: { value: 0 }, uZoom: { value: 0 }, uDith: { value: 0 }, uWarp: { value: 0 }, uAstro: { value: null }, uAstroOn: { value: 0 }, uFlare: { value: new THREE.Vector3(0, 0, 0) }, uADis: { value: 0 } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false,
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: (this.props.ctaScene || 'Summit') === 'Summit' ? `
        precision highp float;
        ${this.ditherGLSL(1.0)}
        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uIn; uniform float uWarp;
        float hs(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hs(i), hs(i+vec2(1,0)), f.x), mix(hs(i+vec2(0,1)), hs(i+vec2(1,1)), f.x), f.y); }
        float fbm4(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 4; i++){ s += a * vn(p); p = m * p; a *= 0.5; } return s; }
        float terr(vec2 p){
          float r = length(p * vec2(1.0, 0.6));
          float base = 3.4 * exp(-r * r * 0.085);
          float tr = smoothstep(0.12, 1.5, abs(p.x));
          float rid = 1.0 - abs(vn(p * 1.1) * 2.0 - 1.0);
          return base + (fbm4(p * 0.55) - 0.5) * 1.1 * (0.25 + 0.75 * tr) + rid * rid * 0.5 * tr - 0.3 * tr * tr;
        }
        float sdCap(vec3 p, vec3 a, vec3 b, float r){ vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
        float sdBox(vec3 p, vec3 b){ vec3 q = abs(p) - b; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); }
        vec3 CP; float PH; float WIN;
        float hiker(vec3 q){
          float sw = sin(PH) * 0.5 * (1.0 - WIN);
          q.y -= abs(cos(PH)) * 0.03 * (1.0 - WIN);
          float lean = 0.14 * (1.0 - WIN); float cl = cos(lean), sl = sin(lean);
          q.yz = mat2(cl, sl, -sl, cl) * q.yz;
          float d = length(q - vec3(0.0, 0.9, 0.02)) - 0.085;
          d = min(d, sdCap(q, vec3(0.0, 0.48, 0.0), vec3(0.0, 0.78, 0.03), 0.11));
          d = min(d, sdBox(q - vec3(0.0, 0.66, -0.14), vec3(0.1, 0.16, 0.07)) - 0.025);
          vec3 hL = vec3(0.06, 0.48, 0.0), hR = vec3(-0.06, 0.48, 0.0);
          d = min(d, sdCap(q, hL, hL + vec3(0.0, -0.46 * cos(sw), 0.46 * sin(sw)), 0.05));
          d = min(d, sdCap(q, hR, hR + vec3(0.0, -0.46 * cos(sw), -0.46 * sin(sw)), 0.05));
          vec3 sL = vec3(0.14, 0.76, 0.02), sR = vec3(-0.14, 0.76, 0.02);
          vec3 aL = mix(sL + vec3(0.03, -0.36 * cos(sw * 0.8), -0.36 * sin(sw * 0.8)), sL + vec3(0.14, 0.36, 0.05), WIN);
          vec3 aR = mix(sR + vec3(-0.03, -0.36 * cos(sw * 0.8), 0.36 * sin(sw * 0.8)), sR + vec3(-0.14, 0.36, 0.05), WIN);
          d = min(d, sdCap(q, sL, aL, 0.04));
          d = min(d, sdCap(q, sR, aR, 0.04));
          return d;
        }
        float mapT(vec3 p){ return (p.y - terr(p.xz)) * 0.45; }
        float mapC(vec3 p){ vec3 q = p - CP; float b = length(q - vec3(0.0, 0.08, 0.0)); if (b > 0.45) return b - 0.3; return hiker(q / 0.17) * 0.17; }
        float map(vec3 p){ return min(mapT(p), mapC(p)); }
        vec3 nrm(vec3 p, float e){ vec2 k = vec2(e, 0.0); return normalize(vec3(map(p + k.xyy) - map(p - k.xyy), map(p + k.yxy) - map(p - k.yxy), map(p + k.yyx) - map(p - k.yyx))); }
        float shadow(vec3 ro, vec3 rd){ float res = 1.0, t = 0.04; for (int i = 0; i < 20; i++){ float h = map(ro + rd * t); res = min(res, 9.0 * h / t); t += clamp(h, 0.04, 0.45); if (res < 0.01 || t > 8.0) break; } return clamp(res, 0.0, 1.0); }
        float cden(vec3 p){ float b = smoothstep(1.45, 1.72, p.y) * smoothstep(2.35, 1.98, p.y); float n = fbm4(p.xz * 0.42 + vec2(uT * 0.025, uT * 0.012) + p.y * 0.35); return max(0.0, (n - 0.4) * 2.4) * b; }
        void main(){
          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
          vec2 p = (fc - 0.5 * uRes) / uRes.y;
          float e = uP * uP * (3.0 - 2.0 * uP);
          float walk = clamp(e / 0.86, 0.0, 1.0);
          float zc = mix(-7.2, -0.2, walk);
          CP = vec3(0.0, terr(vec2(0.0, zc)), zc);
          WIN = smoothstep(0.88, 0.98, e);
          PH = walk * 46.0;
          float orb = smoothstep(0.82, 1.0, e);
          float ang = orb * 1.45 + uM.x * 0.07;
          float dist = mix(0.95, 2.7, orb);
          vec3 ro = CP + vec3(sin(ang) * dist + 0.22 * (1.0 - orb), mix(0.34, 0.62, orb) + uM.y * 0.03, -cos(ang) * dist);
          ro.y = max(ro.y, terr(ro.xz) + 0.14);
          vec3 ta = CP + vec3(0.0, 0.17, mix(0.7, 0.0, orb));
          vec3 ww = normalize(ta - ro), uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0))), vv = cross(uu, ww);
          vec3 rd = normalize(p.x * uu + p.y * vv + (1.6 - uWarp * 0.18) * ww);
          vec3 L = normalize(vec3(-0.45, 0.2 + 0.08 * e, 1.0));
          float dawn = 0.3 + 0.7 * e;
          float sd = max(dot(rd, L), 0.0);
          vec3 sky = mix(vec3(0.016, 0.018, 0.024), vec3(0.006, 0.007, 0.011), smoothstep(-0.05, 0.6, rd.y));
          sky += vec3(0.55, 0.3, 0.16) * pow(sd, 6.0) * 0.22 * dawn + vec3(1.0, 0.72, 0.45) * pow(sd, 90.0) * 0.5 * dawn + vec3(1.0, 0.9, 0.75) * smoothstep(0.9985, 0.9995, sd) * dawn;
          sky += vec3(0.12, 0.08, 0.06) * exp(-abs(rd.y) * 9.0) * dawn * 0.5;
          float t = 0.02, hitC = 0.0; bool hit = false;
          for (int i = 0; i < 120; i++){
            vec3 q = ro + rd * t; float dT = mapT(q), dC = mapC(q), d = min(dT, dC);
            if (d < 0.0012 * t) { hit = true; hitC = dC < dT ? 1.0 : 0.0; break; }
            t += d; if (t > 34.0) break;
          }
          vec3 col = sky;
          if (hit) {
            vec3 q = ro + rd * t, n = nrm(q, 0.0015 * t + 0.0008);
            float dif = max(dot(n, L), 0.0) * shadow(q + n * 0.01, L);
            vec3 amb = vec3(0.05, 0.06, 0.08) * (0.55 + 0.45 * n.y);
            vec3 sunC = vec3(1.0, 0.68, 0.42) * (1.3 + 1.2 * e);
            if (hitC > 0.5) {
              vec3 base = vec3(0.03, 0.03, 0.032);
              float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0) * (0.3 + max(dot(n, L) + 0.4, 0.0));
              col = base * (amb * 4.0 + sunC * dif) + vec3(1.0, 0.7, 0.45) * rim * 0.55 * dawn;
            } else {
              float snow = smoothstep(0.55, 0.8, n.y) * smoothstep(1.0, 2.2, q.y);
              vec3 rock = mix(vec3(0.035, 0.034, 0.036), vec3(0.06, 0.055, 0.05), fbm4(q.xz * 6.0));
              vec3 alb = mix(rock, vec3(0.42, 0.44, 0.48), snow);
              col = alb * (amb + sunC * dif * 0.55);
              col += vec3(0.6, 0.4, 0.28) * pow(1.0 - max(dot(n, -rd), 0.0), 4.0) * max(dot(n, L), 0.0) * 0.08;
            }
            float fg = 1.0 - exp(-t * 0.075);
            col = mix(col, sky * 0.8 + vec3(0.02, 0.022, 0.028), fg);
          }
          {
            float tA, tB, lim = hit ? t : 40.0;
            if (abs(rd.y) < 0.0005) { tA = 0.0; tB = (ro.y > 1.45 && ro.y < 2.35) ? lim : -1.0; }
            else { float t0 = (1.45 - ro.y) / rd.y, t1 = (2.35 - ro.y) / rd.y; tA = max(min(t0, t1), 0.0); tB = min(max(t0, t1), lim); }
            tB = min(tB, tA + 18.0);
            if (tB > tA) {
              float dt = (tB - tA) / 22.0, tt = tA + dt * hs(fc + fract(uT) * 31.0), T = 1.0; vec3 acc = vec3(0.0);
              for (int i = 0; i < 22; i++){
                vec3 q = ro + rd * tt; float dn = cden(q);
                if (dn > 0.001) {
                  float a = 1.0 - exp(-dn * dt * 2.2);
                  float top = smoothstep(1.7, 2.35, q.y);
                  vec3 cc = mix(vec3(0.07, 0.075, 0.085), vec3(0.42, 0.3, 0.22) * dawn, top * 0.6) + vec3(0.6, 0.4, 0.25) * pow(sd, 4.0) * 0.25 * dawn;
                  cc = mix(cc, sky, 1.0 - exp(-tt * 0.05));
                  acc += T * a * cc; T *= 1.0 - a; if (T < 0.02) break;
                }
                tt += dt;
              }
              col = col * T + acc;
            }
          }
          col = col * 1.15 / (1.0 + col * 0.85);
          float lg = dot(col, vec3(0.299, 0.587, 0.114));
          col = mix(vec3(lg), col, 0.82);
          col += (hs(fc + 0.0) - 0.5) * 0.018 * (0.3 + lg * 4.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.1 * dot(vu, vu);
          col *= uIn;
          gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
        }` : (this.props.ctaScene || 'Ascent') === 'Mountains' ? `
        precision highp float;
        ${this.ditherGLSL(1.0)}
        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uIn; uniform float uTilt; uniform float uZoom; uniform float uDith;
        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++){ s += a * n(p); p = m * p; a *= 0.5; } return s; }
        float ridge(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++){ float v = 1.0 - abs(n(p) * 2.0 - 1.0); s += a * v * v; p = m * p; a *= 0.5; } return s; }
        void main(){
          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
          vec2 p = (fc - 0.5 * uRes) / uRes.y;
          float tca = cos(uTilt * 0.1), tsa = sin(uTilt * 0.1);
          p = mat2(tca, tsa, -tsa, tca) * p;
          p *= 1.0 + uZoom * 0.35;
          p.y += uTilt * 0.45;
          float e = uP * uP * (3.0 - 2.0 * uP);
          vec2 lp = vec2(0.42 + uM.x * 0.03, 0.30 - e * 0.08 + uM.y * 0.02);
          vec3 col = mix(vec3(0.003), vec3(0.022), smoothstep(-0.5, 0.6, p.y));
          float ld = length((p - lp) * vec2(1.0, 1.3));
          col += vec3(1.0, 0.97, 0.92) * (0.14 * exp(-ld * 4.5) + 0.025 * exp(-ld * 1.4));
          for (int i = 3; i >= 0; i--) {
            float d = float(i) / 3.0;
            float par = mix(1.0, 0.25, d);
            float rise = mix(-0.75, 0.0, e) * par;
            float x = p.x * mix(1.1, 2.4, d) + d * 4.3 + uM.x * 0.03 * (1.0 - d) + uT * 0.002 * d;
            float hh = -0.32 + d * 0.22 + ridge(vec2(x * 1.1, d * 3.7)) * mix(0.75, 0.35, d) + rise;
            float dy = p.y - hh;
            float m = smoothstep(0.0025, -0.0025, dy);
            float slope = ridge(vec2(x * 1.1 + 0.01, d * 3.7)) - ridge(vec2(x * 1.1 - 0.01, d * 3.7));
            float lit = clamp(0.5 - slope * 12.0 * sign(lp.x - p.x), 0.0, 1.0);
            float snow = exp(-max(-dy, 0.0) * mix(28.0, 60.0, d)) * lit;
            vec3 mc = vec3(mix(0.006, 0.03, d)) + vec3(0.95, 0.94, 0.9) * snow * mix(0.32, 0.08, d);
            mc += fbm(vec2(x * 9.0, p.y * 9.0)) * 0.025 * (1.0 - d);
            col = mix(col, mc, m);
            float haze = exp(-max(dy, 0.0) * 9.0) * (1.0 - m) * mix(0.008, 0.035, d);
            col += vec3(haze);
            vec2 cp = vec2(p.x * mix(1.2, 2.2, d) + uT * mix(0.012, 0.03, d) + d * 9.0, p.y * mix(3.2, 4.5, d) - e * mix(3.2, 1.2, d));
            float c = fbm(cp + fbm(cp * 0.7 + uT * 0.02) * 1.2);
            float band = smoothstep(0.35, -0.1, abs(p.y - (hh + 0.06 + 0.12 * (1.0 - d))) - 0.05);
            float dens = smoothstep(0.48, 0.82, c) * band;
            vec3 cc = vec3(mix(0.26, 0.09, d)) * (0.45 + 0.55 * exp(-length(p - lp) * 2.0));
            col = mix(col, cc, dens * mix(0.75, 0.45, d));
          }
          vec2 cp = vec2(p.x * 1.0 + uT * 0.04, p.y * 1.6 + 1.5 - e * 3.6);
          float fg = smoothstep(0.5, 0.9, fbm(cp + fbm(cp * 0.6 - uT * 0.03)));
          col = mix(col, vec3(0.2), fg * 0.45 * smoothstep(0.0, 0.25, e) * (1.0 - smoothstep(0.75, 1.0, e)));
          float l = dot(col, vec3(0.299, 0.587, 0.114));
          col = vec3(l) * vec3(1.0, 0.985, 0.96);
          col = col * 1.1 / (1.0 + col * 0.8);
          col += (h(fc + 0.0) - 0.5) * 0.06 * (0.35 + l * 3.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.1 * dot(vu, vu);
          col *= uIn;
          {
            vec2 q = mod(floor(fc / 2.0), 4.0); int ix = int(q.x) + int(q.y) * 4;
            float bm[16]; bm[0]=0.;bm[1]=8.;bm[2]=2.;bm[3]=10.;bm[4]=12.;bm[5]=4.;bm[6]=14.;bm[7]=6.;bm[8]=3.;bm[9]=11.;bm[10]=1.;bm[11]=9.;bm[12]=15.;bm[13]=7.;bm[14]=13.;bm[15]=5.;
            float thr = 0.0; for (int k = 0; k < 16; k++) if (k == ix) thr = bm[k];
            thr = (thr + 0.5) / 16.0;
            float Ld = clamp(pow(dot(col, vec3(0.2126, 0.7152, 0.0722)) * 2.2, 0.85), 0.0, 1.0);
            col = mix(col, vec3(step(thr, Ld)) * 0.82, uDith);
          }
          gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
        }` : `
        precision highp float;
        ${this.ditherGLSL(1.0)}
        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uIn; uniform float uTilt; uniform float uZoom; uniform float uDith; uniform float uWarp; uniform sampler2D uAstro; uniform float uAstroOn; uniform vec3 uFlare; uniform float uADis;
        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 6; i++){ s += a * n(p); p = m * p; a *= 0.5; } return s; }
        float stars(vec2 fc, float sz, float th){ vec2 g = fc / sz; vec2 id = floor(g); float r = h(id); vec2 o = vec2(h(id + 3.1), h(id + 7.7)) - 0.5; float d = length(fract(g) - 0.5 - o * 0.6); return step(th, r) * smoothstep(0.18, 0.0, d) * (0.4 + 0.6 * h(id + 1.7)); }
        void main(){
          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
          vec2 p = (fc - 0.5 * uRes) / uRes.y;
          float tc = cos(uTilt * 0.1), ts = sin(uTilt * 0.1);
          p = mat2(tc, ts, -ts, tc) * p; p *= 1.0 + uZoom * 0.3; p.y += uTilt * 0.4;
          p += uM * vec2(0.012, 0.008);
          float alt = uP * uP * (3.0 - 2.0 * uP);
          vec3 L = normalize(vec3(0.75, 0.42, 0.35));
          // deep space
          vec3 col = vec3(0.0035, 0.004, 0.006);
          float band = exp(-pow((p.y * 0.9 - p.x * 0.45 + 0.05) * 3.2, 2.0));
          float mw = fbm(p * 3.5 + 11.0) * fbm(p * 9.0 - 3.0);
          col += vec3(0.05, 0.05, 0.065) * band * smoothstep(0.15, 0.55, mw) * smoothstep(0.3, 0.8, alt);
          vec2 cen = 0.5 * uRes, dv = fc - cen;
          float fly = 1.0 / (1.0 + alt * 0.55 + uZoom * 0.0);
          float sf = 0.0;
          for (int i = 0; i < 7; i++) {
            float k = float(i) / 6.0;
            vec2 f2 = cen + dv * fly * (1.0 - k * uWarp * 0.6);
            float w = 1.0 - k * 0.55;
            sf += (stars(f2, 3.0, 0.992) * 0.55 + stars(f2, 7.0, 0.985) * 0.8 + stars(f2, 17.0, 0.975) * 1.0) * w;
          }
          sf /= 1.0 + 3.2 * (1.0 - min(uWarp, 1.0) * 0.7);
          sf *= 1.0 + uWarp * 0.8;
          sf *= 0.75 + 0.25 * sin(uT * 0.25 + h(floor(fc / 7.0)) * 40.0);
          col += vec3(0.82, 0.86, 1.0) * sf * 0.55 * max(min(uWarp * 1.5, 1.0), smoothstep(0.25, 0.75, alt));
          // sun, small and hot, soft bloom
          vec2 sp = vec2(0.78, 0.36);
          float sd = length(p - sp);
          col += vec3(1.0, 0.94, 0.86) * (0.9 * exp(-sd * 90.0) + 0.06 * exp(-sd * 9.0) + 0.012 * exp(-sd * 2.0)) * smoothstep(0.2, 0.7, alt);
          if (uAstroOn > 0.5) {
            vec4 asx = texture2D(uAstro, uv);
            vec3 ac = asx.rgb * 1.15; ac = clamp((ac * (2.51 * ac + 0.03)) / (ac * (2.43 * ac + 0.59) + 0.14), 0.0, 1.0); ac = pow(ac, vec3(1.0 / 2.2));
            float adn = fbm(uv * vec2(uRes.x / uRes.y, 1.0) * 3.2 + vec2(0.0, uT * 0.04));
            float adk = uADis * 1.15 - 0.05;
            float akeep = smoothstep(adk - 0.04, adk + 0.04, adn);
            float arim = smoothstep(0.07, 0.0, abs(adn - adk)) * step(0.001, uADis) * (1.0 - smoothstep(0.9, 1.0, uADis));
            float aa = clamp(asx.a, 0.0, 1.0);
            col += ac * aa * akeep * ${Math.max(0.08, this.props.galaxyBright ?? 0.14).toFixed(3)};
          }
          if (uFlare.z > 0.0) {
            vec2 fd = (fc - uFlare.xy * uRes) / uRes.y;
            float fl = exp(-length(fd) * 120.0) * 1.4 + exp(-length(fd) * 22.0) * 0.12;
            fl += (exp(-abs(fd.y) * 900.0) * exp(-abs(fd.x) * 28.0) + exp(-abs(fd.x) * 900.0) * exp(-abs(fd.y) * 28.0)) * 0.7;
            col += vec3(1.0, 0.97, 0.92) * fl * uFlare.z * (1.0 - uADis);
          }
          // planet as a real sphere
          float R0 = 2.4;
          vec2 pc = vec2(0.0, -80.0); // globe removed
          vec2 dq = (p - pc) / R0;
          float r2 = dot(dq, dq);
          float pd = (sqrt(r2) - 1.0) * R0;
          if (r2 < 1.0) {
            vec3 nn = vec3(dq, sqrt(1.0 - r2));
            float lon = atan(nn.x, nn.z) * 2.2 + uT * 0.004 + uP * 3.2, lat = asin(nn.y) * 2.2;
            vec2 gp = vec2(lon, lat) * 2.2;
            float landN = fbm(gp + 5.0);
            float land = smoothstep(0.5, 0.56, landN);
            vec3 ocean = mix(vec3(0.004, 0.014, 0.034), vec3(0.008, 0.03, 0.06), fbm(gp * 2.0));
            vec3 ground = mix(vec3(0.032, 0.04, 0.022), vec3(0.075, 0.06, 0.04), fbm(gp * 4.0));
            ground = mix(ground, vec3(0.11, 0.1, 0.09), smoothstep(0.62, 0.8, landN) * 0.5);
            vec3 sc = mix(ocean, ground, land);
            float cl = smoothstep(0.48, 0.78, fbm(gp * 1.6 - vec2(uT * 0.006, 0.0) + fbm(gp * 3.0) * 0.6));
            float dif = dot(nn, L);
            float day = smoothstep(-0.08, 0.25, dif);
            vec3 lit = sc * max(dif, 0.0) * 0.9 + vec3(0.34, 0.35, 0.37) * cl * max(dif, 0.0) * 0.6;
            float spec = pow(max(dot(reflect(-L, nn), vec3(0.0, 0.0, 1.0)), 0.0), 40.0) * (1.0 - land) * (1.0 - cl);
            lit += vec3(0.6, 0.55, 0.45) * spec * 0.22;
            float cityN = step(0.93, h(floor(gp * 60.0))) * land * (1.0 - cl);
            vec3 night = vec3(1.0, 0.62, 0.3) * cityN * 0.4 * (1.0 - day);
            vec3 pcol = mix(night + sc * 0.03, lit, day);
            float limb = pow(1.0 - nn.z, 3.0);
            pcol += vec3(0.12, 0.26, 0.6) * limb * smoothstep(-0.25, 0.4, dif) * 0.75;
            col = mix(col, pcol, smoothstep(0.0, 0.004, -pd));
          }
          vec2 ndir = normalize(dq);
          float dayRim = smoothstep(-0.35, 0.5, dot(vec3(ndir, 0.0), L));
          float atm = exp(-max(pd, 0.0) * 55.0) * step(0.0, pd) + exp(-abs(pd) * 160.0);
          col += vec3(0.16, 0.34, 0.8) * atm * dayRim * 0.6;
          col += vec3(0.08, 0.16, 0.38) * exp(-max(pd, 0.0) * 12.0) * step(0.0, pd) * dayRim * 0.12;
          col += vec3(0.5, 0.35, 0.25) * exp(-abs(pd) * 260.0) * smoothstep(-0.2, 0.15, dot(vec3(ndir, 0.0), L)) * smoothstep(0.25, -0.05, dot(vec3(ndir, 0.0), L)) * 0.25;
          // night cloud deck you climb out of
          for (int i = 0; i < 3; i++) {
            float d = float(i) / 2.0;
            vec2 cp = vec2(p.x * mix(0.9, 1.7, d) + uT * mix(0.012, 0.03, d) + d * 7.0, p.y * mix(1.4, 2.4, d) + alt * mix(4.0, 2.0, d) + d * 3.0);
            float c = fbm(cp + fbm(cp * 0.6 + uT * 0.01) * 1.3);
            float dens = smoothstep(0.44, 0.8, c);
            float top = smoothstep(0.35, 0.9, fbm(cp * 1.8 + 2.0));
            vec3 cc = vec3(0.05, 0.058, 0.07) * (0.6 + 0.8 * top) + vec3(0.12, 0.11, 0.1) * top * exp(-length(p - sp) * 1.4) * 0.4;
            float fadeOut = 1.0 - smoothstep(0.28 - d * 0.08, 0.55 - d * 0.08, alt);
            /* cloud deck removed for galaxy */
          }
          col = col * 1.1 / (1.0 + col * 0.9);
          float lg = dot(col, vec3(0.299, 0.587, 0.114));
          col += (h(fc + 0.0) - 0.5) * 0.02 * (0.3 + lg * 4.0);
          vec2 vu = uv - 0.5; col *= 1.0 - 1.0 * dot(vu, vu);
          col *= uIn;
          gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
        }` });
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    let lastW = 0;
    const size = () => { const w = box.clientWidth, hh = box.clientHeight; if (!w || !hh) return; if (this.coarse && w === lastW) return; lastW = w; const pr = this.lowPower ? 0.4 : Math.min(1, 1300 / w); r.setPixelRatio(pr); r.setSize(w, hh, false); U.uRes.value.set(w * pr, hh * pr); };
    const ro = new ResizeObserver(size); ro.observe(box); size();
    const mm = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e) => { mm.x = e.clientX / innerWidth * 2 - 1; mm.y = -(e.clientY / innerHeight * 2 - 1); };
    window.addEventListener('pointermove', onMove);
    let sp = 0, inS = 0, warp = 0, lastTop = null, astroLoading = false, astroOn = false; const t0 = performance.now();
    const expo = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const AS = { scene: null, cam: null, model: null, rt: null };
    const loadAstro = async () => {
      astroLoading = true;
      try {
        const [T3, GL, MO] = await Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')]);
        if (this.dead) return;
        const loader = new GL.GLTFLoader(); loader.setMeshoptDecoder(MO.MeshoptDecoder);
        const url = (this.props.galaxyModel || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/galaxy.glb';
        const g = await loader.loadAsync(url); if (this.dead) return;
        const m = g.scene;
        m.traverse((o) => { if (o.isMesh || o.isPoints) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((mt) => { mt.transparent = true; mt.depthWrite = false; mt.blending = T3.AdditiveBlending; mt.toneMapped = false; if (mt.emissive && mt.map && !mt.emissiveMap) { mt.emissiveMap = mt.map; mt.emissive.set(0xffffff); } }); } });
        const bb = new T3.Box3().setFromObject(m), sz = bb.getSize(new T3.Vector3()), cn = bb.getCenter(new T3.Vector3());
        const k = 1 / Math.max(sz.x, sz.y, sz.z); m.position.sub(cn.multiplyScalar(k)); m.scale.setScalar(k);
        const pivot = new T3.Group(); pivot.add(m);
        const sc = new T3.Scene(); sc.add(pivot);
        const key = new T3.DirectionalLight(0xfff6ee, 2.6); key.position.set(-1.6, 2.4, 2.4); sc.add(key);
        const rim = new T3.DirectionalLight(0xdfe8ff, 2.0); rim.position.set(2.4, 1.4, -2.2); sc.add(rim);
        const fillL = new T3.DirectionalLight(0x8fa6c8, 0.35); fillL.position.set(0, -2, 1.5); sc.add(fillL);
        sc.add(new T3.HemisphereLight(0xcfd8e8, 0x050506, 0.25));
        try { const RE = await import('https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js'); const pm = new T3.PMREMGenerator(r); sc.environment = pm.fromScene(new RE.RoomEnvironment(), 0.04).texture; } catch (e) {}
        const bb2 = new T3.Box3().setFromObject(pivot), s2 = bb2.getSize(new T3.Vector3()); AS.visor = new T3.Vector3(-s2.x * 0.08, bb2.max.y - s2.y * 0.12, bb2.max.z * 0.9); AS.T3 = T3;
        const cam = new T3.PerspectiveCamera(24, 1, 0.1, 50); cam.position.set(0, 0, 4.2);
        AS.scene = sc; AS.cam = cam; AS.model = pivot;
        AS.rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true });
        U.uAstro.value = AS.rt.texture;
      } catch (e) { console.warn('astronaut failed', e); }
    };
    const loop = () => {
      if (this.dead) return;
      this.ctaRaf = requestAnimationFrame(loop);
      {
        const r0 = sec.getBoundingClientRect(), vh0 = (window.__svh || innerHeight);
        if (false && !astroLoading && (this.props.galaxyBg ?? true)) loadAstro(); // galaxy parked
        const v0 = r0.top < vh0 && r0.bottom > 0;
        const dy = lastTop == null ? 0 : Math.abs(r0.top - lastTop); lastTop = r0.top;
        const tw = v0 ? Math.min(1, dy / (vh0 * 0.035)) : 0;
        warp += (tw - warp) * (tw > warp ? 0.12 : 0.045);
      }
      const rc = sec.getBoundingClientRect(), vh = (window.__svh || innerHeight);
      const vis = !this.state.page;
      const now = performance.now();
      {
        const into = 3;
        sec.querySelectorAll('[data-cg]').forEach((g, gi) => {
          g.querySelectorAll('[data-cw]').forEach((w, j) => {
            const t = Math.max(0, Math.min(1, (into - 1.25 - gi * 0.3 - j * 0.07) / 0.55)), e = 1 - Math.pow(1 - t, 3);
            w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((window.__wbAscend ? -1 : 1) * (1 - e) * 110).toFixed(2) + '%,0) rotate(' + ((1 - e) * 4).toFixed(2) + 'deg)';
            w.style.filter = t >= 1 || t <= 0 ? '' : 'blur(' + ((1 - e) * 14).toFixed(2) + 'px)'; w.style.opacity = (0.15 + 0.85 * e).toFixed(3);
          });
        });
      }
      if ((this.rp || 0) > 0.995) { if (box.style.opacity !== '0') box.style.opacity = '0'; if (box.style.visibility !== 'hidden') box.style.visibility = 'hidden'; return; }
      if (!vis) return;
      const tp = Math.max(0, Math.min(1, this.rp || 0));
      sp += (tp - sp) * 0.06;
      inS += (1 - inS) * 0.05;
      mm.sx += (mm.x - mm.sx) * 0.04; mm.sy += (mm.y - mm.sy) * 0.04;
      U.uP.value = sp; U.uIn.value = inS;
      { // warp = scroll speed + the fall itself; eased so streaks stretch and relax smoothly
        const rpN = this.rp || 0, nw = performance.now(), dtw = Math.max(0.001, Math.min(0.05, (nw - (this._wT || nw)) / 1000)); this._wT = nw;
        const vel = Math.abs(rpN - (this._wRp ?? rpN)) / dtw; this._wRp = rpN;
        const fall = Math.sin(Math.PI * Math.min(1, rpN));
        const tgt = Math.min(1, fall * 0.55 + vel * 1.4) * (this.props.warpAmount ?? 1);
        this._warp = (this._warp || 0) + (tgt - (this._warp || 0)) * (1 - Math.exp(-dtw * (tgt > (this._warp || 0) ? 5 : 1.6)));
        U.uWarp.value = this._warp;
      }
      { const rpv = this.rp || 0, k = Math.max(0, Math.min(1, (rpv - 0.82) / 0.16)), out = k * k * (3 - 2 * k); const go = ((this.props.galaxyOpacity ?? 1) * (1 - out)).toFixed(3); if (box.style.opacity !== go) box.style.opacity = go; const vv = out > 0.999 ? 'hidden' : ''; if (box.style.visibility !== vv) box.style.visibility = vv; }
      if (AS.model) {
        // galaxy backdrop: slow spin, tilted disc; scrolling flies the camera into it
        const tt = (now - t0) / 1000, ee = sp * sp * (3 - 2 * sp);
        const W1 = U.uRes.value.x, H1 = U.uRes.value.y, asp = W1 / Math.max(1, H1);
        if (AS.rt.width !== W1 || AS.rt.height !== H1) AS.rt.setSize(W1, H1);
        AS.cam.aspect = asp; AS.cam.fov = 50; AS.cam.position.set(mm.sx * 0.05, mm.sy * 0.03, 1.05); AS.cam.lookAt(0, 0, 0); AS.cam.updateProjectionMatrix();
        AS.model.position.set(0, 0, 0);
        AS.model.rotation.set(0.55, 0, 0.3);
        AS.model.rotateY(tt * 0.02);
        AS.model.scale.setScalar(2.6 * Math.max(1, asp / 1.6) * (this.props.galaxySize ?? 1));
        r.setRenderTarget(AS.rt); r.setClearColor(0x000000, 0); r.clear(true, true, true); r.render(AS.scene, AS.cam); r.setRenderTarget(null);
        U.uAstroOn.value = 1; U.uADis.value = 0; U.uFlare.value.set(0, 0, 0);
      } U.uTilt.value = this.ctaTilt || 0; U.uZoom.value = this.ctaZoom || 0; U.uM.value.set(mm.sx, mm.sy); U.uT.value = (now - t0) / 1000;
      r.render(scene, cam);
    };
    loop();
    this.cleanupCta = () => { cancelAnimationFrame(this.ctaRaf); ro.disconnect(); window.removeEventListener('pointermove', onMove); mat.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); };
  },
  initReach(THREE) {
    const box = this.rayRef.current, sec = this.reachRef.current; if (!box || !sec) return;
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const U = { uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uP: { value: 0 }, uM: { value: new THREE.Vector2() }, uTilt: { value: 0 }, uZoom: { value: 0 }, uLight: { value: 0 }, uBg: { value: new THREE.Color(1, 1, 1) }, uRay: { value: new THREE.Color(0x202ded) } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false,
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `
        precision highp float;
        vec3 DQ(vec3 c){ return c; }
        uniform vec2 uRes; uniform float uT; uniform float uP; uniform vec2 uM; uniform float uTilt; uniform float uZoom; uniform float uLight; uniform vec3 uBg; uniform vec3 uRay;
        float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
        void main(){
          vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
          vec2 p = (fc - 0.5 * uRes) / uRes.y;
          float tc = cos(uTilt * 0.1), ts = sin(uTilt * 0.1);
          p = mat2(tc, ts, -ts, tc) * p; p *= 1.0 + uZoom * 0.3; p.y += uTilt * 0.4;
          float e = uP * uP * (3.0 - 2.0 * uP);
          float asp = uRes.x / uRes.y;
          vec2 S = vec2(0.18 + uM.x * 0.03, 0.62 + uM.y * 0.01);
          vec2 dir = normalize(vec2(-0.22 - (1.0 - e) * 0.08 + sin(uT * 0.23) * 0.05 + sin(uT * 0.11) * 0.03, -1.0));
          vec2 rel = p - S;
          float along = dot(rel, dir), perp = dot(rel, vec2(-dir.y, dir.x));
          float reach = mix(0.1, 1.6, e);
          float width = mix(0.05, 0.32, e) * (0.35 + max(along, 0.0) * 0.8) * (1.0 + 0.1 * sin(uT * 0.4) + 0.05 * sin(uT * 1.1));
          float core = exp(-perp * perp / (width * width));
          float soft = exp(-perp * perp / (width * width * 9.0));
          float len = smoothstep(reach, reach - 0.5, along) * smoothstep(-0.08, 0.12, along);
          float streak = fbm(vec2(along * 1.4 - uT * 0.09, perp * 10.0 + sin(uT * 0.2) * 0.6)) * 0.8 + 0.4;
          float beam = (core * 0.85 + soft * 0.35) * len * streak;
          vec3 warm = vec3(0.78, 0.7, 0.6), hot = vec3(0.92, 0.88, 0.82);
          vec3 col = vec3(0.004, 0.0038, 0.0036);
          col += mix(warm, hot, core * core * core) * beam * mix(0.03, 0.3, e) * (0.55 + 0.45 * core);
          col += warm * 0.045 * exp(-length(rel) * 7.0) * smoothstep(0.0, 0.4, e);
          col += warm * 0.012 * fbm(p * 1.6 + uT * 0.015) * soft * e;
          float lg = dot(col, vec3(0.299, 0.587, 0.114));
          col = mix(vec3(lg), col, 0.4);
          col += mix(vec3(-0.002, 0.0, 0.004), vec3(0.008, 0.003, -0.004), smoothstep(0.02, 0.2, lg));
          col = max(col - 0.0025, 0.0);
          col = col * 1.05 / (1.0 + col * 1.1);
          float l = dot(col, vec3(0.333));
          col += (h(fc + 0.0) - 0.5) * 0.05 * (0.3 + l * 3.0);
          vec2 vu = uv - 0.5;
          if (uLight > 0.5) { float wn = width * 0.4, cn = exp(-perp * perp / (wn * wn)); float dk = 1.0 - dot(uBg, vec3(0.299, 0.587, 0.114)); float b = clamp(cn * len * streak * mix(0.08, 0.5, e) * (1.0 + dk * 1.8) + soft * len * streak * 0.18 * e * dk + exp(-length(rel) * 6.0) * 0.25 * e * dk, 0.0, 0.55 + 0.4 * dk); col = mix(uBg, uRay, b); col += (h(fc) - 0.5) * 0.035 * b; }
          else col *= 1.0 - 1.35 * dot(vu, vu);
          gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
        }` });
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    let lastW = 0;
    const size = () => { const w = box.clientWidth, hh = box.clientHeight; if (!w || !hh) return; if (this.coarse && w === lastW) return; lastW = w; const pr = this.lowPower ? 0.4 : Math.min(1, 1300 / w); r.setPixelRatio(pr); r.setSize(w, hh, false); U.uRes.value.set(w * pr, hh * pr); };
    const ro = new ResizeObserver(size); ro.observe(box); size();
    const mm = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e) => { mm.x = e.clientX / innerWidth * 2 - 1; mm.y = -(e.clientY / innerHeight * 2 - 1); };
    window.addEventListener('pointermove', onMove);
    let sp = 0, handLoading = false, handOn = false; const t0 = performance.now();
    const expo = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const loadHand = async () => {
      handLoading = true;
      try {
        const mod = (window.DitherViewer || await new Promise((res) => { const t = setInterval(() => { if (window.DitherViewer) { clearInterval(t); res(window.DitherViewer); } }, 50); }));
        if (this.dead) return;
        const url = (this.props.handModel || '').trim() || 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/right.glb';
        const LB = !!this.props.reachBg, hc = parseInt(String(this.props.reachHand || '#202ded').replace('#', ''), 16) || 0x202ded; this._handLB = LB;
        if (!(this.props.reachSection ?? false)) return; // Reach is off: don't spend a WebGL context on the hand
        const CH = (this.props.handStyle || 'Chrome') === 'Chrome';
        if (CH) { const hb = this.handRef.current; hb.style.mixBlendMode = 'normal'; hb.style.left = '0'; hb.style.width = '100%'; hb.style.webkitMaskImage = hb.style.maskImage = 'none'; const rays = this.rayRef && this.rayRef.current; if (rays) rays.style.display = 'none'; if (!this.createChromeHand) return; this.hand = await this.createChromeHand(this.handRef.current, url, { maxPR: this.lowPower ? 1 : 1.75, glass: this.props.handGlass ?? true, bloom: this.props.handBloom ?? 0.55, trail: this.props.handTrail ?? 0.9, exposure: this.props.handExposure ?? 0.75 }); this._handChrome = 1; }
        else {
        this.hand = await mod.createPortrait(this.handRef.current, LB ? { model: url, eyes: null, cutout: true, neck: -10, rotation: [-1.15, 0.5, -0.55], light: 'top', keyAngle: 0.2, maxPR: this.lowPower ? 0.9 : 2, shadowSize: this.lowPower ? 512 : 2048, textureAmount: 0, clay: { color: hc, roughness: 0.6, sheen: 0.4, sheenColor: 0xffffff }, post: { dither: 1, grid: 2, grain: 0.02, saturation: 1, contrast: 0.25, bloom: 0, vignette: 0, stipple: 0, tint: 0, exposure: 0.9 } } : { model: url, eyes: null, neck: -10, rotation: [-1.15, 0.5, -0.55], light: 'top', keyAngle: 0.2, maxPR: this.lowPower ? 0.9 : 2, shadowSize: this.lowPower ? 512 : 2048, textureAmount: 0, clay: { color: 0x5e5650, roughness: 0.82, sheen: 0.6, sheenColor: 0xc2b19e }, post: { dither: 0, grain: 0.03, saturation: 0.28, contrast: 0.32, bloom: 0.05, vignette: 1.25, stipple: 0, tint: 0.6 , exposure: 0.1 } });
        }
        this.hand.scene.traverse((o) => { if (o.isLight) { o.color.set(LB ? 0xffffff : 0xd8ccbc); o.userData.i0 = o.intensity; } }); this._handLights = []; this.hand.scene.traverse((o) => { if (o.isLight && !o.isAmbientLight && !o.isHemisphereLight) this._handLights.push(o); });
        const c = this.hand.renderer.domElement; c.style.position = 'absolute'; c.style.inset = '0'; c.style.width = '100%'; c.style.height = '100%';
        handOn = true;
      } catch (e) { console.warn('hand failed', e); }
    };
    const loop = () => {
      if (this.dead) return;
      this.reachRaf = requestAnimationFrame(loop);
      const rc = this.logRect(sec, 100, 300, 300), vh = (window.__svh || innerHeight), now = performance.now();
      if (!handLoading && rc.top < vh * 2.5) loadHand();
      const vis = rc.top < vh && rc.bottom > 0, lightBg = !!this.props.reachBg;
      { const hb = this.handRef.current; if (hb && hb.__lb !== lightBg) { hb.__lb = lightBg; hb.style.mixBlendMode = lightBg ? 'normal' : 'screen'; hb.style.filter = ''; } }
      U.uLight.value = lightBg ? 1 : 0; if (lightBg) { try { U.uBg.value.set(this.props.reachBg); U.uRay.value.set(this.props.reachRay || '#202ded'); } catch (e) {} }
      if (this.hand) {
        const want = vis && !this.state.page;
        if (want !== handOn) { handOn = want; this.hand.renderer.setAnimationLoop(want ? this.hand.frame : null); }
      }
      const intoR = (vh * 0.15 - rc.top) / vh;
      sec.querySelectorAll('[data-rw]').forEach((w, j) => {
        const t = Math.max(0, Math.min(1, (intoR - j * 0.1) / 0.5)), e = 1 - Math.pow(1 - t, 3);
        w.style.transform = t >= 1 ? 'none' : 'translate3d(0,' + ((window.__wbAscend ? -1 : 1) * (1 - e) * 110) + '%,0) rotate(' + ((1 - e) * 4) + 'deg)';
        w.style.filter = t >= 1 || t <= 0 ? '' : 'blur(' + ((1 - e) * 14).toFixed(2) + 'px)'; w.style.opacity = (0.15 + 0.85 * e).toFixed(3);
      });
      if (!vis) return;
      const tp = Math.max(0, Math.min(1, (vh - rc.top) / (rc.height)));
      if (this.hand) { const hmd = this.hand.model; if (!hmd && this.hand.scene) this.hand.model = this.hand.scene.children.find(c => c.isGroup || c.isObject3D && c.children.length && !c.isLight && !c.isCamera) || null; }
      sp += (tp - sp) * 0.05;
      { const hb = this.handRef.current; if (hb) { const k = Math.max(0, Math.min(1, sp / 0.55)), e = 1 - Math.pow(1 - k, 3), ty = ((1 - e) * 70).toFixed(2); if (hb.__ty !== ty) { hb.__ty = ty; hb.style.transform = 'translate3d(0,' + ty + 'vh,0)'; hb.style.opacity = (0.15 + 0.85 * e).toFixed(3); } } }
      mm.sx += (mm.x - mm.sx) * 0.04; mm.sy += (mm.y - mm.sy) * 0.04;
      U.uP.value = sp; U.uM.value.set(mm.sx, mm.sy); U.uT.value = (now - t0) / 1000;
      U.uTilt.value = this.rayTilt || 0; U.uZoom.value = this.rayZoom || 0;
      if (this.hand) {
        const e = sp * sp * (3 - 2 * sp), t = (now - t0) / 1000;
        if (this._handChrome) this.hand.opts = { glass: this.props.handGlass ?? true, bloom: this.props.handBloom ?? 0.55, trail: this.props.handTrail ?? 0.9, exposure: this.props.handExposure ?? 0.75 };
        if (!this._handChrome) this.hand.post.uExposure.value = (this._handLB ? 0.32 + e * 0.22 : 0.06 + e * 0.5) * (1 + 0.06 * Math.sin(t * 0.4));
        // ray lands on the hand: key light swings into the beam direction and brightens, plus a screen-blend glow streak over it
        const sh = this._handShine || (this._handShine = sec.querySelector('[data-hand-shine]')), rc0 = this.props.reachRay || '#b8b4ae';
        (this._handLights || []).forEach((L, li) => { if (L.userData.i0 == null) return; L.intensity = L.userData.i0 * (1 + e * (li === 0 ? 3.2 : 1.2)); if (li === 0 && L.position) L.position.set(-1.2 - e * 0.6, 3.2, 1.6); });
        if (sh) { if (sh.__c !== rc0) { sh.__c = rc0; sh.style.background = 'radial-gradient(ellipse 18% 46% at 46% 52%, ' + rc0 + 'cc 0%, ' + rc0 + '55 40%, transparent 72%), radial-gradient(ellipse 34% 30% at 50% 58%, ' + rc0 + '44 0%, transparent 70%)'; sh.style.transform = 'rotate(-12deg)'; }
          const so = (e * (0.55 + 0.1 * Math.sin(t * 0.7))).toFixed(3); if (sh.__o !== so) { sh.__o = so; sh.style.opacity = so; } }
        const md = this.hand.model; if (md) { const sr = sp - 0.5; md.rotation.set(-1.15 + (1 - e) * 0.8 + Math.sin(t * 0.55) * 0.07, 0.5 + sr * 2.8 + Math.sin(t * 0.37) * 0.12, -0.55 + (this.props.handFlip ?? Math.PI) - sr * 1.0 + Math.sin(t * 0.29 + 1.2) * 0.06); }
      }
      r.render(scene, cam);
    };
    loop();
    this.cleanupReach = () => {
      cancelAnimationFrame(this.reachRaf); ro.disconnect(); window.removeEventListener('pointermove', onMove);
      if (this.hand) { this.hand.renderer.setAnimationLoop(null); this.hand.renderer.dispose(); try { this.hand.renderer.forceContextLoss(); } catch (e) {} try { r.forceContextLoss(); } catch (e) {} this.hand.renderer.domElement.remove(); this.hand = null; }
      mat.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove();
    };
  },
  initBg(THREE) {
    const box = this.bgRef.current; if (!box || !(this.props.webglBg ?? false)) return; // covered by the galaxy everywhere: off by default (saves a WebGL context)
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: false, preserveDrawingBuffer: false });
    r.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, { once: true });
    r.setPixelRatio(this.lowPower ? 0.35 : Math.min(1, 1400 / Math.max(window.innerWidth, 1)));
    r.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(r.domElement);
    const gc = document.createElement('canvas'); const GN = 16, GS = 48;
    gc.width = GN * GS; gc.height = GS;
    const gx = gc.getContext('2d');
    gx.fillStyle = '#000'; gx.fillRect(0, 0, gc.width, gc.height);
    gx.fillStyle = '#fff'; gx.font = '400 ' + Math.round(GS * 0.78) + 'px "JetBrains Mono", monospace';
    gx.textAlign = 'center'; gx.textBaseline = 'middle';
    ' .\'-:;~=+*o%#&@$'.split('').slice(0, GN).forEach((ch, k) => gx.fillText(ch, k * GS + GS / 2, GS / 2 + 2));
    const gtex = new THREE.CanvasTexture(gc);
    const U = { uRes: { value: new THREE.Vector2(1, 1) }, uT: { value: 0 }, uM: { value: new THREE.Vector2(-999, -999) }, uMI: { value: 0 }, uScroll: { value: 0 }, uSilk: { value: 1 }, uAscii: { value: 1 }, uGrain: { value: 1 }, uGlyph: { value: gtex }, uCell: { value: 11 }, uDark: { value: 0 }, uRelief: { value: 0.35 }, uLight: { value: 0 }, uM2: { value: new THREE.Vector2(-999, -999) } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false, depthWrite: false,
      vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `
      precision highp float;
        ${this.ditherGLSL(1.0)}
      uniform vec2 uRes; uniform float uT; uniform vec2 uM; uniform float uMI; uniform float uScroll;
      uniform float uSilk; uniform float uAscii; uniform float uRelief; uniform float uLight; uniform vec2 uM2; uniform float uGrain; uniform sampler2D uGlyph; uniform float uCell; uniform float uDark;
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 4; i++){ s += a * vn(p); p = m * p; a *= 0.5; } return s; }
      float field(vec2 p){
        float t = uT;
        vec2 q = vec2(fbm(p + vec2(0.0, t * 0.035)), fbm(p + vec2(5.2, 1.3) - t * 0.028));
        vec2 r = vec2(fbm(p + 2.8 * q + vec2(1.7, 9.2) + t * 0.04), fbm(p + 2.8 * q + vec2(8.3, 2.8) - t * 0.03));
        return fbm(p + 2.2 * r);
      }
      void main(){
        vec2 fc = gl_FragCoord.xy;
        float sc = 1.25 / uRes.y;
        vec2 p = fc * sc; p.y += uScroll;
        vec2 mp = uM * sc; mp.y += uScroll;
        vec2 d = p - mp; float md = length(d);
        p -= d * 0.35 * exp(-md * md * 9.0) * uMI;
        float e = 0.0035;
        float f = field(p);
        float fx = field(p + vec2(e, 0.0));
        float fy = field(p + vec2(0.0, e));
        vec3 n = normalize(vec3(-(fx - f) / e * uRelief, -(fy - f) / e * uRelief, 1.0));
        vec3 P3 = vec3(p, f * 0.08);
        vec3 V = vec3(0.0, 0.0, 1.0);
        float band = smoothstep(0.2, 0.9, f);
        vec3 albedo = mix(vec3(0.010, 0.011, 0.014), vec3(0.12, 0.115, 0.108), band);
        vec3 col = albedo * 0.16;
        vec3 Lk = normalize(vec3(-0.6, 0.7, 0.45));
        col += albedo * max(dot(n, Lk), 0.0) * 0.22;
        vec3 Lp = vec3(mp, 0.16 + 0.06 * (1.0 - uMI));
        vec3 Ld = Lp - P3; float dist2 = dot(Ld.xy, Ld.xy); Ld = normalize(Ld);
        float att = 1.0 / (1.0 + dist2 * 26.0);
        float dif = clamp((dot(n, Ld) + 0.45) / 1.45, 0.0, 1.0); dif *= dif;
        vec3 H = normalize(Ld + V);
        float spe = pow(max(dot(n, H), 0.0), 12.0);
        vec3 warm = vec3(1.0, 0.93, 0.84);
        col += warm * (albedo * dif * 2.4 + spe * 0.035 * band) * att * uLight;
        col += vec3(1.0, 0.86, 0.7) * 0.07 * exp(-dist2 * 5.0) * uLight;
        col += vec3(1.0, 0.9, 0.78) * 0.018 * exp(-abs(P3.y - Lp.y) * 22.0) * exp(-abs(P3.x - Lp.x) * 1.6) * uLight;
        vec2 lp2 = uM2 * sc; lp2.y += uScroll;
        vec3 Lq = vec3(lp2, 0.22) - P3; float dq2 = dot(Lq.xy, Lq.xy); Lq = normalize(Lq);
        float attq = 1.0 / (1.0 + dq2 * 12.0);
        vec3 cool = vec3(0.62, 0.72, 1.0);
        col += cool * albedo * clamp((dot(n, Lq) + 0.3) / 1.3, 0.0, 1.0) * attq * uLight * 0.35;
        float rim = pow(1.0 - max(n.z, 0.0), 2.0);
        col += warm * rim * att * 0.03 * uLight;
        col = mix(vec3(0.02), col, uSilk);
        vec2 cid = floor(fc / uCell); vec2 cc = (cid + 0.5) * uCell;
        float cd = length((cc - uM) / uRes.y);
        float edge = vn(cid * 0.22 + uT * 0.6);
        float mask = smoothstep(0.26 + 0.08 * uMI, 0.02, cd + (edge - 0.5) * 0.12) * uMI * uAscii;
        if (mask > 0.01) {
          vec2 cp = cc * sc; cp.y += uScroll;
          vec2 cdv = cp - mp; cp -= cdv * 0.35 * exp(-dot(cdv, cdv) * 9.0) * uMI;
          float fa = field(cp);
          float lum = clamp((fa - 0.25) * 1.6 + mask * 0.25, 0.0, 0.999);
          float gi = floor(lum * 16.0);
          vec2 guv = fract(fc / uCell);
          float gl = texture2D(uGlyph, vec2((gi + guv.x) / 16.0, guv.y)).r;
          col *= 1.0 - mask * 0.55;
          col += vec3(0.80, 0.79, 0.75) * gl * mask * (0.25 + 0.75 * lum);
        }
        {
          vec2 cuv = fc / uRes;
          vec2 cq = (fc - 0.5 * uRes) / uRes.y;
          vec2 Ls = vec2(-0.45 + 0.1 * sin(uT * 0.045), 0.95);
          vec2 dv = cq - Ls;
          float ang = atan(dv.x, -dv.y), rl = length(dv);
          float shafts = vn(vec2(ang * 9.0, uT * 0.05)) * vn(vec2(ang * 23.0 + 3.0, -uT * 0.035));
          shafts = smoothstep(0.06, 0.55, shafts);
          float smoke = fbm(cq * 1.3 + vec2(uT * 0.015, -uT * 0.022) + fbm(cq * 0.8 - uT * 0.01));
          smoke = smoothstep(0.32, 0.88, smoke);
          float vol = shafts * exp(-rl * 1.05) * (0.35 + smoke);
          col *= 0.5;
          col += vec3(0.86, 0.8, 0.7) * vol * 0.2;
          col += vec3(0.55, 0.58, 0.64) * smoke * 0.03 * (1.1 - cuv.y * 0.6);
          col += vec3(0.9, 0.82, 0.7) * 0.05 * exp(-rl * 2.6);
          vec2 mq = uM / uRes.y - 0.5 * vec2(uRes.x / uRes.y, 1.0);
          float fl = exp(-abs(cq.y - mq.y) * 70.0) * exp(-abs(cq.x - mq.x) * 1.4);
          col += vec3(0.62, 0.72, 0.92) * fl * 0.06 * uLight;
          col += vec3(1.0, 0.9, 0.78) * exp(-length(cq - mq) * 12.0) * 0.035 * uLight * (0.4 + smoke);
          col *= smoothstep(0.0, 0.07, cuv.y) * 0.25 + 0.75;
        }
        float lg = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(lg), 0.35);
        col += mix(vec3(-0.004, 0.002, 0.008), vec3(0.012, 0.004, -0.008), smoothstep(0.02, 0.16, lg));
        col = col * 1.15 / (1.0 + col * 0.6);
        float gA = hash(fc + 0.0) - 0.5;
        float gB = hash(floor(fc * 0.5) + 0.0) - 0.5;
        float lumG = dot(col, vec3(0.333));
        col += (gA * 0.075 + gB * 0.04) * uGrain * (0.7 + lumG * 3.0);
        vec2 vu = fc / uRes - 0.5;
        col *= 1.0 - 0.55 * dot(vu, vu);
        col *= 1.0 - uDark;
        gl_FragColor = vec4(DQ(max(col, 0.0)), 1.0);
      }` });
    const scene = new THREE.Scene(); const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    let lastBgW = 0;
    const size = () => { const w = window.innerWidth, h = (window.__svh || window.innerHeight); if (this.coarse && w === lastBgW) return; lastBgW = w; r.setPixelRatio(this.lowPower ? 0.35 : Math.min(1, 1400 / Math.max(w, 1))); r.setSize(w, h, false); const pr = r.getPixelRatio(); U.uRes.value.set(w * pr, h * pr); U.uPR = pr; };
    size(); window.addEventListener('resize', size);
    const m = { x: -999, y: -999, sx: -999, sy: -999, s2x: -999, s2y: -999, lx: 0, ly: 0, act: 0, on: false, lit: 0 };
    const onMove = (e) => { m.x = e.clientX; m.y = window.innerHeight - e.clientY; if (!m.on) { m.sx = m.s2x = m.x; m.sy = m.s2y = m.y; m.on = true; } };
    const onOut = (e) => { if (!e.relatedTarget) m.on = false; };
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerout', onOut);
    const t0 = performance.now();
    const loop = () => {
      if (this.dead) return;
      this.bgRaf = requestAnimationFrame(loop);
      const P = this.props, mode = 'Off';
      r.domElement.style.visibility = mode === 'Off' ? 'hidden' : 'visible';
      if (mode === 'Off') return;
      if (this.state.page && (this.visK || 0) > 0.99) return;
      if (this.lowPower) { this.bgSkip = !this.bgSkip; if (this.bgSkip) return; }
      m.sx += (m.x - m.sx) * 0.085; m.sy += (m.y - m.sy) * 0.085;
      const sp = Math.hypot(m.sx - m.lx, m.sy - m.ly); m.lx = m.sx; m.ly = m.sy;
      m.act += ((m.on ? Math.min(1, 0.45 + sp / 14) : 0) - m.act) * 0.05;
      m.s2x += (m.x - m.s2x) * 0.025; m.s2y += (m.y - m.s2y) * 0.025;
      m.lit += ((m.on ? 0.75 + Math.min(0.5, sp / 20) : 0.18) - m.lit) * 0.04;
      const pr = U.uPR || 1; U.uM.value.set(m.sx * pr, m.sy * pr); U.uM2.value.set(m.s2x * pr, m.s2y * pr); U.uMI.value = m.act * 0.4;
      U.uLight.value = m.lit * (P.lightIntensity ?? 1);
      U.uRelief.value = 0.2 * (P.relief ?? 1);
      U.uT.value = (performance.now() - t0) / 1000 * (P.bgSpeed ?? 1);
      U.uScroll.value = (window.__scrollY ? window.__scrollY() : window.scrollY) / window.innerHeight * 0.18;
      U.uSilk.value += ((mode === 'ASCII' ? 0 : 1) - U.uSilk.value) * 0.08;
      U.uAscii.value += ((mode === 'Silk' ? 0 : 1) - U.uAscii.value) * 0.08;
      U.uGrain.value = P.grain ?? 1.4;
      U.uDark.value = Math.max(0, Math.min(1, this.openT || 0)) * 0.6;
      r.render(scene, cam);
      const wr = this.workRef.current;
      const cp = this.silkCopy || (this.silkCopy = wr && wr.querySelector('[data-silk-copy]'));
      if (cp && wr) {
        const rc = wr.getBoundingClientRect(), vh = window.innerHeight;
        if (rc.top < vh && rc.bottom > 0) {
          const src = r.domElement;
          if (cp.width !== src.width || cp.height !== src.height) { cp.width = src.width; cp.height = src.height; }
          const cx = this.silkCtx || (this.silkCtx = cp.getContext('2d'));
          cx.drawImage(src, 0, 0);
          cp.style.transform = (this.props.sectionRotate ?? true) ? 'none' : 'translate3d(0,' + (-Math.max(0, rc.top)) + 'px,0)';
        }
      }
    };
    loop();
    this.cleanupBg = () => {
      cancelAnimationFrame(this.bgRaf);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      gtex.dispose(); mat.dispose(); r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove();
    };
  },
  initBleed(THREE) {
    const box = this.bleedRef.current; if (!box) return;
    let r = null, lastOn = 0;
    const mk = () => { r = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false }); r.setClearColor(0, 0); r.domElement.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(r.domElement); size(); };
    const drop = () => { if (!r) return; r.dispose(); try { r.forceContextLoss(); } catch (e) {} r.domElement.remove(); r = null; };
    const U = { uP: { value: 0 }, uB: { value: 0 }, uT: { value: 0 }, uA: { value: 1 }, uS: { value: 0 }, uTint: { value: 0 }, uFill: { value: 1 }, uGal: { value: 1 }, uBlue: { value: 0 }, uBlueC: { value: new THREE.Vector3(0.125, 0.176, 0.929) } };
    const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: `
        uniform float uP; uniform float uB; uniform float uT; uniform float uA; uniform float uS; uniform float uTint; uniform float uFill; uniform float uGal; uniform float uBlue; uniform vec3 uBlueC; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
        float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.02 + 7.3; a *= 0.5; } return s; }
        void main(){
          vec2 p = vUv * vec2(uA, 1.0) * 2.4 + uS;
          vec2 w = vec2(fbm(p + uT * 0.06), fbm(p + 5.1 - uT * 0.05));
          float f = fbm(p + w * 2.2 + vec2(0.0, -uP * 2.0));
          float v = f * 0.75 + (1.0 - vUv.y) * 0.55;
          float k = uP * 1.7 - 0.35;
          float d = v - k;
          float ink = smoothstep(0.38, 0.0, abs(d));
          float core = smoothstep(0.16, 0.0, abs(d));
          // full-section dissolve: noise threshold eats the whole screen as uB rises, front glows at the edge
          float fd = f + (1.0 - vUv.y) * 0.18 + uP * 0.1;
          float th = 1.05 - uB * 1.25 * uFill + (1.0 - uFill) * 2.0;
          float dis = smoothstep(th - 0.1, th + 0.1, fd);
          float edge = smoothstep(0.09, 0.0, abs(fd - th)) * (1.0 - smoothstep(0.92, 1.0, uB));
          float a = clamp((ink * 0.5 + core * 0.15) * uB * 0.55 + dis * 0.0, 0.0, 1.0);
          ink = max(ink, dis); core = max(core, edge);
          vec3 col = mix(vec3(0.028, 0.028, 0.029), vec3(0.06, 0.06, 0.062), core * 0.6);
          col += vec3(0.11, 0.11, 0.115) * smoothstep(0.05, 0.0, abs(d - 0.02)) * 0.25 * uB;
          // galaxy inside the smoke: nebula tint, stars streaking outward (warp), brighter on the front
          vec2 q = (vUv - 0.5) * vec2(uA, 1.0); float rq = length(q) + 1e-4; vec2 dq = q / rq;
          float wp = 0.35 + 0.65 * uB;
          float neb = fbm(p * 0.7 + w * 1.5 - uT * 0.02);
          col += mix(vec3(0.05, 0.035, 0.08), vec3(0.03, 0.06, 0.09), neb) * smoothstep(0.35, 0.8, neb) * 0.9 * ink * uGal;
          float sf = 0.0;
          for (int i = 0; i < 3; i++) {
            float L = float(i), sz = 70.0 + L * 55.0;
            float ang = atan(dq.y, dq.x), rad = log(rq) * 2.0 - uT * (0.35 + L * 0.15) - uP * (3.0 + L);
            vec2 g = vec2(ang * sz / 6.2831, rad * sz * 0.05);
            vec2 id = floor(g), fr = fract(g) - 0.5; float rnd = h(id + L * 13.0);
            float streak = smoothstep(0.08, 0.0, abs(fr.x)) * smoothstep(0.5, 0.5 - 0.45 * wp, abs(fr.y));
            sf += step(0.93 - L * 0.02, rnd) * streak * (0.5 + 0.5 * h(id + 3.1)) * smoothstep(0.02, 0.35, rq);
          }
          col += vec3(0.82, 0.85, 0.95) * sf * 0.55 * ink * uGal;
          col += vec3(0.75, 0.78, 0.9) * core * exp(-rq * 3.0) * 0.06 * uGal;
          col += (h(gl_FragCoord.xy + fract(uT) * 77.0) - 0.5) * 0.03;
          col = mix(col, uBlueC * (0.8 + core * 0.35) + col * 0.5, uBlue);
          gl_FragColor = vec4(col, a);
        }` });
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    const size = () => { U.uA.value = innerWidth / innerHeight; if (!r) return; r.setPixelRatio(this.lowPower ? 0.25 : 0.6); r.setSize(innerWidth, innerHeight, false); };
    size(); addEventListener('resize', size);
    const t0 = performance.now();
    const loop = () => {
      if (this.dead) return;
      this.bleedRaf = requestAnimationFrame(loop);
      {
        const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
        if (!this.mainTickRunning) { const vh1 = window.__svh || innerHeight, c = this.ctaRef.current, rr = this.reachRef.current;
          if (c) { const q = Math.max(0, Math.min(1, (vh1 - c.getBoundingClientRect().top) / (vh1 * 1.6))); this.rq = this.sceneTween('rq', q); if (q === 0 && this.rq < 0.02) { this.rq = 0; if (this._tw && this._tw.rq) this._tw.rq.v = 0; } }
          if (rr) { const q = Math.max(0, Math.min(1, (vh1 - rr.getBoundingClientRect().top) / (vh1 * 2.4))); this.r3 = this.sceneTween('r3', q); if (q === 0 && this.r3 < 0.02) { this.r3 = 0; if (this._tw && this._tw.r3) this._tw.r3.v = 0; } } }
        const rp = this.rp || 0, rq = this.rq || 0, r3 = this.r3 || 0;
        { const on = (this.props.ditherStyle ?? true) ? 1 : 0; { const pu = this.portrait && this.portrait.post; if (pu && pu.uDither) { pu.uDither.value = on; if (pu.uGrid) pu.uGrid.value = this.props.ditherSize ?? 1; } } [this.hand].forEach((v) => { const u = v && v.post; if (!u) return; if (u.uDither) u.uDither.value = 0; if (u.uGrid) u.uGrid.value = this.props.ditherSize ?? 1; if (u.uDitherGray) u.uDitherGray.value = 0; if (u.uDitherInvert) u.uDitherInvert.value = 0; if (u.uStipple) u.uStipple.value = 0; }); }
        const heroD = Math.max(1 - ss(0.3, 0.9, rq), ss(0.1, 0.7, r3), ss(0.15, 0.55, this.ra || 0)), handD = 1 - ss(0.3, 0.9, r3), astroD = ss(0.1, 0.7, r3);
        this.astroD = astroD;
        if (this.portrait && this.portrait.post && this.portrait.post.uDissolve) this.portrait.post.uDissolve.value = heroD;
        if (this.hand && this.hand.post && this.hand.post.uDissolve) this.hand.post.uDissolve.value = handD;
      }
      const on = (this.props.sectionBleed ?? true) && (this.props.sectionRotate ?? true) && (this.props.transitionStyle || 'Stack') === 'Bleed';
      const ts = [[this.rp, 1.3], [this.rq, 4.7], [this.ra, 6.2], [this.r3, 8.1]];
      let best = null, bb = 0;
      for (const [q, sd] of ts) { if (q == null) continue; const b = Math.sin(Math.PI * Math.max(0, Math.min(1, q))); if (b > bb) { bb = b; best = [q, sd]; } }
      if (!on || bb < 0.01 || this.state.page) { if (box.style.display !== 'none') box.style.display = 'none'; if (r && performance.now() - lastOn > 2500) drop(); return; }
      box.style.display = 'block'; lastOn = performance.now(); if (!r) mk();
      U.uP.value = best[0]; U.uS.value = best[1]; U.uFill.value = best[1] === 1.3 ? 0 : 1; U.uGal.value = best[1] === 1.3 ? 1 : 0; U.uBlue.value = best[1] === 1.3 ? 0.5 : 0; { const m = /^#?([0-9a-f]{6})$/i.exec((this.props.heroBg || '#202ded').trim()); if (m) { const n = parseInt(m[1], 16); U.uBlueC.value.set((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); } } { const tgt = best[1] > 2 ? 1 : 0; U.uTint.value += (tgt - U.uTint.value) * 0.15; } U.uB.value = Math.min(1, bb * 1.4); U.uT.value = (performance.now() - t0) / 1000;
      r.render(scene, cam);
    };
    loop();
    this.cleanupBleed = () => { cancelAnimationFrame(this.bleedRaf); removeEventListener('resize', size); mat.dispose(); drop(); };
  },
  smokeMask(el, p) {
    if (!el) return;
    const TS = this.props.transitionStyle || 'Stack';
    if (TS !== 'Bleed') {
      if (el.__smI != null) { el.__smI = null; el.style.webkitMaskImage = ''; el.style.maskImage = ''; }
      if (p <= 0.0005 || p >= 0.9995) { if (el.__tr) { el.__tr = false; el.style.clipPath = ''; el.style.borderRadius = ''; if (TS === 'Stack') el.style.transform = 'none'; } return; }
      el.__tr = true; const r = (1 - p) * 36;
      if (TS === 'Stack') { el.style.transform = 'translate3d(0,' + ((window.__wbAscend ? -1 : 1) * (1 - p) * 100).toFixed(3) + '%,0)'; el.style.borderRadius = ''; el.style.clipPath = ''; }
      else { el.style.clipPath = window.__wbAscend ? 'inset(0 0 ' + ((1 - p) * 100).toFixed(3) + '% 0)' : 'inset(' + ((1 - p) * 100).toFixed(3) + '% 0 0 0)'; el.style.borderRadius = ''; }
      return;
    }
    if (p <= 0.0005 || p >= 0.9995) { if (el.__smI != null) { el.__smI = null; el.style.webkitMaskImage = ''; el.style.maskImage = ''; } return; }
    const M = this.smokeMaskFrames();
    const i = Math.max(1, Math.min(M.length - 2, Math.round(p * (M.length - 1))));
    if (el.__smI === i) return; el.__smI = i;
    const url = M[i]; el.style.webkitMaskImage = url; el.style.maskImage = url;
    el.style.webkitMaskSize = '100% 100%'; el.style.maskSize = '100% 100%'; el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat';
  },
  smokeMaskFrames() {
    if (this._smF) return this._smF;
    const vw0 = innerWidth || 1, vh0 = innerHeight || vw0, W = 96, H = Math.min(512, Math.max(40, Math.round(96 * vh0 / vw0)) || 54), c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'), id = g.createImageData(W, H), d = id.data;
    const hs = (x, y) => { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); };
    const vn = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); const a = hs(ix, iy), b = hs(ix + 1, iy), c2 = hs(ix, iy + 1), dd = hs(ix + 1, iy + 1); return a + (b - a) * ux + (c2 - a) * uy + (a - b - c2 + dd) * ux * uy; };
    const f = new Float32Array(W * H); let mn = 9, mx = -9;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let X = x / W * 4 * (W / H), Y = y / H * 4, sm = 0, am = 0.5; for (let o = 0; o < 5; o++) { sm += am * vn(X, Y); X = X * 2.03 + 7.1; Y = Y * 2.03 + 3.3; am *= 0.5; } const v = sm * 0.72 + (y / H) * 0.38; f[y * W + x] = v; if (v < mn) mn = v; if (v > mx) mx = v; }
    { const ord = Array.from(f.keys()).sort((a, b) => f[a] - f[b]), eq = new Float32Array(f.length); ord.forEach((ix, r) => { eq[ix] = r / (f.length - 1); }); f.set(eq); }
    const N = 32, out = [];
    for (let k = 0; k < N; k++) {
      const p = k / (N - 1), lo = 1 - p * 1.14 - 0.07;
      for (let i = 0; i < f.length; i++) { let t = (f[i] - lo) / 0.14; t = t < 0 ? 0 : t > 1 ? 1 : t; t = t * t * (3 - 2 * t); const j = i * 4; d[j] = d[j + 1] = d[j + 2] = 255; d[j + 3] = (t * 255) | 0; }
      g.putImageData(id, 0, 0); out.push('url(' + c.toDataURL() + ')');
    }
    return (this._smF = out);
  },
  transitionPass() {
    this.layoutCta();
    this.liftServicesBg();
    this.scrubAbout();
    this.scrubSvc();
    const P = this.props, TS = P.transitionStyle || 'Stack';
    const io = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const y = window.scrollY, vy = y - (this._ly ?? y); this._ly = y;
    const vt = (P.velocityFx ?? false) && !this.state.page ? Math.max(-2.2, Math.min(2.2, -vy * 0.045)) : 0;
    this._sk = (this._sk || 0) + (vt - (this._sk || 0)) * 0.14; const sk = Math.abs(this._sk) < 0.01 ? 0 : this._sk;
    const hr = this.heroRef.current, hin = hr && hr.firstElementChild;
    const wp = this._wp || (this._wp = this.workRef.current && this.workRef.current.querySelector('[data-panel]'));
    const cpn = this._cpn || (this._cpn = this.ctaRef.current && this.ctaRef.current.querySelector('[data-cta-panel]')), cin = cpn && cpn.firstElementChild;
    const rpn = this._rpn || (this._rpn = this.reachRef.current && this.reachRef.current.querySelector('[data-reach-panel]')), rin = rpn && rpn.firstElementChild;
    const rp = this.rp || 0, rq = this.rq || 0, r3 = this.r3 || 0, act = (q) => q > 0.0004 && q < 0.9996;
    const set = (el, rec, vis) => {
      if (!el) return;
      if (!vis) { if (el.__tp) { el.__tp = false; el.style.transform = ''; el.style.filter = ''; el.style.borderRadius = ''; if (el.__dk) el.__dk.style.opacity = '0'; } return; }
      const e = TS === 'Bleed' ? 0 : rec, st = TS === 'Stack';
      const tr = 'translate3d(0,' + (-(st ? 18 : 8) * e).toFixed(3) + 'vh,0)' + (sk ? ' skewY(' + sk.toFixed(3) + 'deg)' : '');
      if (!e && !sk) { if (el.__tp) { el.__tp = false; el.style.transform = ''; el.style.filter = ''; el.style.borderRadius = ''; if (el.__dk) el.__dk.style.opacity = '0'; } return; }
      el.__tp = true; el.style.transform = tr; el.style.transformOrigin = '50% 50%';
      el.style.filter = '';
      let dk = el.__dk; if (!dk) { dk = el.__dk = document.createElement('div'); dk.setAttribute('aria-hidden', 'true'); dk.style.cssText = 'position:absolute;inset:0;background:#0e0e0d;opacity:0;pointer-events:none;z-index:20;'; if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; el.appendChild(dk); }
      dk.style.opacity = (e * (st ? 0.6 : 0.45)).toFixed(3);
      el.style.borderRadius = '';
    };
    if (TS !== 'Bleed' && !this.state.page) {
      if (hr && act(rp)) { hr.style.opacity = String(1 - Math.max(0, Math.min(1, (rp - 0.72) / 0.28))); hr.style.filter = ''; const fr = this._hf; if (fr) { fr.style.opacity = hr.style.opacity; fr.style.filter = ''; } }
      if (act(rq)) { const h = this.hostRef && this.hostRef.current; if (h) { h.style.opacity = '1'; h.style.filter = ''; h.style.visibility = ''; } }
      if (cpn && act(r3)) cpn.style.opacity = '1';
    }
    set(hin, io(rp), rp < 0.9996);
    set(wp, io(rq), rp > 0.0004 && rq < 0.9996);
    set(cin, io(r3), rq > 0.0004 && r3 < 0.9996);
    set(rin, 0, r3 > 0.0004);
  },
  scrubAbout() {
    const p = this._abP || (this._abP = document.querySelector('[data-scrub-text]')); if (!p) return;
    if (!p.__split) { p.__split = true;
      p.querySelectorAll('[data-gw]').forEach((w) => { w.removeAttribute('data-gw'); w.style.transform = 'none'; w.style.opacity = '1'; });
      const tw = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), nodes = []; let n; while ((n = tw.nextNode())) nodes.push(n);
      this._abC = [];
      nodes.forEach((t) => { const f = document.createDocumentFragment();
        t.nodeValue.split(/(\s+)/).forEach((tok) => { if (!tok) return; if (/^\s+$/.test(tok)) { f.appendChild(document.createTextNode(tok)); return; }
          const w = document.createElement('span'); w.style.display = 'inline-block'; w.style.whiteSpace = 'nowrap';
          Array.from(tok).forEach((ch) => { const c = document.createElement('span'); c.textContent = ch; c.style.opacity = '0'; c.style.transition = 'none'; w.appendChild(c); this._abC.push(c); });
          f.appendChild(w); });
        t.parentNode.replaceChild(f, t); });
    }
    const C = this._abC; if (!C || !C.length) return;
    const ct = this.ctaRef.current; if (!ct) return;
    const vh = window.__svh || innerHeight, into = -(this._ctT ?? ct.getBoundingClientRect().top) / vh;
    const prog = Math.max(0, Math.min(1, (into - (this.props.scrubStart ?? 0.1)) / 2.0)), head = prog * (C.length + 1), base = this.props.scrubDim ?? 0;
    const ON3D = (this.props.termOn3D ?? true), show3D = ON3D && !!this._robot && this._robot.visible && !!this._scrRect && !this.state.page && (this.r3 || 0) < 0.6;
    if (!show3D && (this._monZoom || 0) <= 0.3 && Math.abs(head - (this._abH ?? -1)) < 0.05) { const T0 = this._term; if (T0 && (T0.style.opacity !== '0' || T0.__on3d)) { T0.style.opacity = '0'; T0.__on3d = 0; } if (p.style.visibility) p.style.visibility = ''; return; } this._abH = head;
    const term = (this._monZoom || 0) > 0.55 && (this.rq || 0) > 0.5 && (this.r3 || 0) < 0.35 && !this.state.page;
    let T = this._term;
    if (!T) { T = this._term = document.createElement('div'); T.setAttribute('aria-hidden', 'true');
      T.style.cssText = "position:fixed;left:50%;top:50%;z-index:62;pointer-events:none;opacity:0;transform:translate(-50%,-50%);box-sizing:border-box;overflow:hidden;font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-weight:400;line-height:1.35;letter-spacing:0;color:#f2f2f0;text-shadow:0 0 0.4em rgba(255,255,255,0.30);white-space:pre-wrap;word-break:break-word;border-radius:6% / 8%;" +
        "background:linear-gradient(162deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.05) 26%,rgba(255,255,255,0) 40%),repeating-linear-gradient(0deg,rgba(0,0,0,0.16) 0px,rgba(0,0,0,0.16) 1px,rgba(0,0,0,0) 1px,rgba(0,0,0,0) 3px),radial-gradient(ellipse 85% 75% at 52% 42%,#3a3b3d 0%,#1f2022 45%,#0d0e0f 80%,#030303 100%);" +
        "box-shadow:inset 0 0 6vmin rgba(0,0,0,0.75),inset 0 0 1.2vmin rgba(0,0,0,0.6);";
      T.innerHTML = '<div data-t-head style="opacity:0.55;margin-bottom:1.1em;">wubble@studio:~$ cat about.txt</div><span data-t-txt></span><span data-t-car style="display:inline-block;width:0.6em;height:1.1em;vertical-align:-0.15em;background:#ffffff;margin-left:2px;"></span>';
      { const AB = document.querySelector('[data-about]'), go = () => { if (this.dead) return; if (AB && (+getComputedStyle(AB).opacity < 0.05 || AB.getBoundingClientRect().bottom < 0 || AB.getBoundingClientRect().top > innerHeight || !(window.__wbRQ > 0.3))) { setTimeout(go, 400); return; } if ((this.props.aboutMonitor || 'Model') === 'Model') return; this.crtInit(T); }; go(); }
      const SH = document.createElement('div'); SH.setAttribute('aria-hidden', 'true');
      SH.style.cssText = 'position:fixed;left:50%;top:50%;z-index:61;pointer-events:none;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:multiply;background:radial-gradient(ellipse 70% 70% at 50% 45%, #3c3c3c 0%, #1c1c1c 70%, #111 100%);border-radius:3vmin;-webkit-mask-image:radial-gradient(ellipse 52% 54% at 50% 50%, #000 82%, transparent 100%);mask-image:radial-gradient(ellipse 52% 54% at 50% 50%, #000 82%, transparent 100%);';
      document.body.appendChild(SH); T.__sh = SH;
      document.body.appendChild(T); T.__txt = T.querySelector('[data-t-txt]'); T.__car = T.querySelector('[data-t-car]'); T.__full = p.textContent.replace(/\s+/g, ' ').trim(); }
    p.style.visibility = term || (this._monZoom || 0) > 0.3 ? 'hidden' : '';
    T.__on3d = show3D ? 1 : 0;
    if (!term && !show3D) { if (T.style.opacity !== '0') { T.style.opacity = '0'; T.__sh.style.opacity = '0'; } }
    else {
      let CL = null; { const Q0 = this._scrQuad, vw0 = innerWidth, vh0 = window.__svh || innerHeight;
        if (Q0 && Q0.q && !(this.props.termManual ?? false)) { const xs = Q0.q.map((p) => p[0]), ys = Q0.q.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
          if (x0 < -1 || y0 < -1 || x1 > vw0 + 1 || y1 > vh0 + 1) { const ins = this.props.termClampInset ?? 0.07, l = Math.max(0, x0) + vw0 * ins, t = Math.max(0, y0) + vh0 * ins, r = Math.min(vw0, x1) - vw0 * ins, b = Math.min(vh0, y1) - vh0 * ins;
            if (r - l > 120 && b - t > 80) CL = { l, t, w: r - l, h: b - t }; } } }
      if (show3D) CL = null; this._termCL = !!CL;
      const Q = this._scrQuad, SP = this._scrPx, vhT = window.__svh || innerHeight, PT = innerWidth / vhT < 0.8, tSX = this.props.termScaleX ?? (PT ? 0.86 : 0.78), tSY = this.props.termScaleY ?? (PT ? 0.6 : 0.62), tOY = this.props.termOffsetY ?? (PT ? -0.15 : -0.04), fbW = Math.min(innerWidth * tSX, 1100), fbH = vhT * tSY, SRp = this._tp && this._scrRect, gw = CL ? CL.w : SRp ? 1000 : Q ? 1000 : fbW, gh = CL ? CL.h : SRp ? Math.round(1000 * this._scrRect.h / Math.max(0.001, this._scrRect.w)) : Q ? Math.round(1000 / Math.max(0.3, Q.ar)) : fbH;
      const key = Math.round(gw) + 'x' + Math.round(gh);
      if (T.__key !== key) { T.__key = key; T.__sh.style.width = (gw * 1.02).toFixed(0) + 'px'; T.__sh.style.height = (gh * 1.02).toFixed(0) + 'px'; T.style.width = (gw * 1.0).toFixed(0) + 'px'; T.style.height = (gh * 1.0).toFixed(0) + 'px'; T.style.padding = (gh * (this.props.termPadY ?? 0.15)).toFixed(0) + 'px ' + (gw * (this.props.termPadX ?? 0.12)).toFixed(0) + 'px';
        T.__txt.textContent = T.__full; let fs = Math.min(gh * 0.075, gw * 0.045); T.style.fontSize = fs + 'px';
        const cs0 = getComputedStyle(T), padY = parseFloat(cs0.paddingTop), lhK = 1.45, availH = gh - padY * 2, availW = gw - parseFloat(cs0.paddingLeft) * 2;
        const mc = document.createElement('canvas').getContext('2d');
        const fits = (f) => { mc.font = cs0.fontWeight + ' ' + f + 'px ' + cs0.fontFamily; let x = 0, lines = 1; T.__full.split(/(\s+)/).forEach((w) => { if (!w) return; const ww = mc.measureText(w).width; if (/^\s+$/.test(w)) { x += ww; return; } if (x + ww > availW && x > 0) { lines++; x = 0; } x += ww; }); return f * lhK * (lines + 1.8) + f * 1.1 <= availH; };
        for (let it = 0; it < 30 && !fits(fs); it++) fs *= 0.94; T.style.fontSize = fs.toFixed(1) + 'px'; }
      const tp0 = this.props.termTypeStart ?? 0.5, tp1 = this.props.termTypeEnd ?? 0.92, tpr = Math.max(0, Math.min(1, ((this._raM || 0) - tp0) / Math.max(0.01, tp1 - tp0)));
      const n = Math.max(0, Math.min(T.__full.length, Math.floor(tpr * (T.__full.length + 1))));
      if (T.__n !== n) { T.__n = n; T.__txt.textContent = T.__full.slice(0, n); }
      T.__car.style.opacity = (Math.floor(performance.now() / 500) % 2) ? '1' : '0';
      if (T.__mode !== (Q && !(this.props.termManual ?? false) ? 'quad' : 'manual')) { T.__mode = Q && !(this.props.termManual ?? false) ? 'quad' : 'manual'; console.log('[term] placement', T.__mode, this._scrRect ? JSON.stringify(this._scrRect) : 'no glass detected'); }
      if (CL) { T.style.scale = ''; T.style.left = CL.l.toFixed(0) + 'px'; T.style.top = CL.t.toFixed(0) + 'px'; T.style.transformOrigin = '0 0'; T.style.transform = 'none'; }
      else if (!Q || (this.props.termManual ?? false)) { const gP = this.props; T.style.left = (50 + (gP.glassX ?? 0) * 100).toFixed(2) + '%'; T.style.top = (50 + (tOY - (gP.glassY ?? 0)) * 100).toFixed(2) + '%'; T.style.scale = (gP.glassW ?? 1).toFixed(3) + ' ' + (gP.glassH ?? 1).toFixed(3); T.style.transformOrigin = '50% 50%'; T.style.transform = 'translate(-50%,-50%)'; }
      else { const [p0, p1, p2, p3] = Q.q, W = gw, Hh = gh;
        const dx1 = p1[0] - p2[0], dx2 = p3[0] - p2[0], dy1 = p1[1] - p2[1], dy2 = p3[1] - p2[1], sx = p0[0] - p1[0] + p2[0] - p3[0], sy = p0[1] - p1[1] + p2[1] - p3[1];
        const den = dx1 * dy2 - dx2 * dy1, g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den;
        const a = p1[0] - p0[0] + g * p1[0], b = p3[0] - p0[0] + h * p3[0], d = p1[1] - p0[1] + g * p1[1], e = p3[1] - p0[1] + h * p3[1];
        const m = [a / W, d / W, 0, g / W, b / Hh, e / Hh, 0, h / Hh, 0, 0, 1, 0, p0[0], p0[1], 0, 1];
        T.style.scale = ''; if (m.every(Number.isFinite)) { T.style.left = '0'; T.style.top = '0'; T.style.transformOrigin = '0 0'; T.style.transform = 'matrix3d(' + m.map((v) => +v.toFixed(6)).join(',') + ')'; } }
      T.style.opacity = show3D ? '0' : String(Math.min(1, ((this._monZoom || 0) - 0.55) / 0.2)); T.__sh.style.opacity = '0'; if (T.__cv) T.__cv.style.visibility = this._tp && !CL ? 'hidden' : '';
    }
    // typewriter: characters snap on one by one, block caret rides the head and blinks when idle
    const nh = Math.min(C.length, Math.floor(head));
    for (let i = 0; i < C.length; i++) { const v = i < nh ? '1' : String(base); if (C[i].__o !== v) { C[i].__o = v; C[i].style.opacity = v; } }
    { let K = this._abK; if (!K) { K = this._abK = document.createElement('span'); K.setAttribute('aria-hidden', 'true'); K.style.cssText = 'display:inline-block;width:0.6em;height:1.05em;vertical-align:-0.17em;margin-left:0.04em;background:currentColor;box-shadow:0 0 0.4em rgba(255,255,255,0.33);'; K.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], { duration: 1060, iterations: Infinity }); }
      const at = C[Math.max(0, nh - 1)]; if (at && (K.__at !== at || !K.isConnected)) { K.__at = at; at.after(K); } }
    if (term) this._abH = -2;
  },
  scrubSvc() {
    const L = this._svL || (this._svL = document.querySelector('[data-svc-list]')); if (!L) return;
    const sel = L.querySelectorAll('li > span:first-child, [data-gw] > span');
    if (!this._svC || this._svC.length !== sel.length) { this._svC = Array.from(sel); this._svH = -1; this._svC.forEach((c) => { c.style.transition = 'none'; }); }
    const C = this._svC; if (!C.length) return; const ct = this.ctaRef.current; if (!ct) return;
    const vh = window.__svh || innerHeight, into = -(this._ctT ?? ct.getBoundingClientRect().top) / vh;
    const prog = Math.max(0, Math.min(1, (into - (this.props.svcScrubStart ?? 2.9)) / (this.props.svcScrubLen ?? 0.8))), head = prog * (C.length + 6), base = this.props.scrubDim ?? 0.14;
    if (Math.abs(head - this._svH) < 0.05) return; this._svH = head;
    for (let i = 0; i < C.length; i++) { const k = Math.max(0, Math.min(1, (head - i) / 6)), v = (base + (1 - base) * k).toFixed(3); if (C[i].__o !== v) { C[i].__o = v; C[i].style.opacity = v; } }
  },
  liftServicesBg() {
    const cpn = this._cpn || (this._cpn = this.ctaRef.current && this.ctaRef.current.querySelector('[data-cta-panel]')), bg = this.bgRef && this.bgRef.current; if (!cpn || !bg) return;
    const els = [cpn, cpn.firstElementChild].filter(Boolean);
    if (!cpn.__bgs) cpn.__bgs = els.map((e) => [e, getComputedStyle(e).backgroundColor, e.style.backgroundColor]);
    // fixed backdrop: Work colour → Services colour (panel lifted onto it) → page colour from Reach on
    const st = this.state.page ? 'page' : (this.rq || 0) <= 0.5 ? 'work' : (this.r3 || 0) < 0.6 ? 'svc' : 'page';
    if (st === cpn.__lift) return; cpn.__lift = st;
    const col = cpn.__bgs.map((x) => x[1]).find((c) => c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) || '#ffffff';
    bg.style.background = st === 'svc' ? col : st === 'work' ? 'var(--bg-work,#0e0e0d)' : 'var(--bg-page,#0e0e0d)';
    cpn.__bgs.forEach(([e, , inl]) => { e.style.backgroundColor = st === 'svc' ? 'transparent' : inl; });
  },
  initHeroGrain() {
    const hr = this.heroRef.current, box = hr && hr.querySelector('[data-hero-grain]'); if (!box) return;
    // lazy: no WebGL context until the first pointer move (saves a context on load / touch devices)
    if (!this._grainArmed) { this._grainArmed = 1; const go = () => { removeEventListener('pointermove', go); if (!this.dead) this.initHeroGrain(); }; addEventListener('pointermove', go, { passive: true }); return; }
    const cv = document.createElement('canvas'); cv.style.cssText = 'display:block;width:100%;height:100%;'; box.appendChild(cv);
    const gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true }); if (!gl) return;
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision highp float; uniform vec2 uR, uM; uniform float uT, uH, uA, uRad;\n' +
      'float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n' +
      'float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }\n' +
      'float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p *= 2.03; a *= 0.5; } return s; }\n' +
      'void main(){ vec2 uv = gl_FragCoord.xy / uR; vec2 q = (gl_FragCoord.xy - uM) / uR.y;\n' +
      ' float d = length(q), w = fbm(uv * vec2(uR.x / uR.y, 1.0) * 3.0 + uT * 0.05);\n' +
      ' float r = uH * uRad, m = smoothstep(r, r * 0.25, d + (w - 0.5) * r * 0.6);\n' +
      ' float g = h(gl_FragCoord.xy + fract(uT * 7.13) * 91.0);\n' +
      ' vec3 c = vec3(0.02) + (g - 0.5) * 0.09;\n' +
      ' gl_FragColor = vec4(c, m * uA); }'));
    gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, 'uR'), uM = gl.getUniformLocation(pr, 'uM'), uT = gl.getUniformLocation(pr, 'uT'), uH = gl.getUniformLocation(pr, 'uH'), uA = gl.getUniformLocation(pr, 'uA'), uRad = gl.getUniformLocation(pr, 'uRad');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let over = false, H = 0, mx = 0, my = 0, sx = 0, sy = 0; const dpr = Math.min(1, devicePixelRatio || 1);
    const pin = hr.firstElementChild || hr;
    addEventListener('pointermove', (e) => { if (!over && H < 0.01) { sx = e.clientX; sy = e.clientY; } over = true; mx = e.clientX; my = e.clientY; }, { passive: true });
    
    document.documentElement.addEventListener('pointerleave', () => { over = false; }); addEventListener('blur', () => { over = false; });
    const t0 = performance.now(); let last = t0;
    const loop = (now) => {
      if (this.dead) return; requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const on = over && (this.rp || 0) < 0.05 && !this.state.page;
      H += ((on ? 1 : 0) - H) * (1 - Math.exp(-dt * (on ? (this.props.heroGrainIn ?? 1.4) : 1.1)));
      if (H < 0.002 && !on) { if (cv.style.visibility !== 'hidden') { cv.style.visibility = 'hidden'; gl.clear(gl.COLOR_BUFFER_BIT); } return; }
      cv.style.visibility = '';
      const W = Math.round(cv.clientWidth * dpr), Ht = Math.round(cv.clientHeight * dpr); if (cv.width !== W || cv.height !== Ht) { cv.width = W; cv.height = Ht; gl.viewport(0, 0, W, Ht); }
      sx += (mx - sx) * (1 - Math.exp(-dt * 6)); sy += (my - sy) * (1 - Math.exp(-dt * 6));
      const rc = cv.getBoundingClientRect();
      gl.uniform2f(uR, W, Ht); gl.uniform2f(uM, (sx - rc.left) * dpr, (rc.bottom - sy) * dpr); gl.uniform1f(uT, (now - t0) / 1000);
      gl.uniform1f(uH, H * H * (3 - 2 * H)); gl.uniform1f(uA, this.props.heroGrainAmount ?? 0.92); gl.uniform1f(uRad, this.props.heroGrainSize ?? 0.22);
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    requestAnimationFrame(loop);
  },
  async initPortrait() {
    if (!(this.props.servicesModel ?? false)) return;
    const pw = this.portraitRef.current;
    if (pw && innerWidth < 820) {
      Object.assign(pw.style, { left: '0', right: '0', top: '0', bottom: 'auto', width: '100%', maxWidth: 'none', height: '100vh' });
      pw.style.height = '100svh';
      pw.style.webkitMaskImage = pw.style.maskImage = 'linear-gradient(180deg,#000 0%,#000 78%,transparent 100%)';
    }
    if (!(this.props.hero3D ?? true)) return;
    const el = this.hero3dRef.current; if (!el || this.portrait || this.portraitLoading) return;
    this.portraitLoading = true;
    while (el.firstChild) el.removeChild(el.firstChild);
    try {
      const mod = (window.DitherViewer || await new Promise((res) => { const t = setInterval(() => { if (window.DitherViewer) { clearInterval(t); res(window.DitherViewer); } }, 50); }));
      if (this.dead) return;
      this.portrait = await mod.createPortrait(el, { model: (this.props.hero3Model || '').trim() || 'https://raw.githubusercontent.com/wuppie/wubble/main/anime_style_80s_computer.glb', eyes: null, neck: -0.9, fit: (innerWidth < 820 ? 0.92 : 0.78) / Math.max(0.2, this.props.hero3Size ?? 1.2), maxPR: this.lowPower ? 0.9 : 2, shadowSize: this.lowPower ? 512 : 2048, textureAmount: 0.35, light: 'top', clay: { color: 0x5e5650, roughness: 0.82, sheen: 0.6, sheenColor: 0xc2b19e }, post: { dither: 1, grid: 2, grain: 0.03, saturation: 0.3, contrast: 0.3, bloom: 0.05, vignette: 0.9, stipple: 0, tint: 0.6, exposure: 0.2 } });
      if (this.dead) { this.portrait.renderer.setAnimationLoop(null); return; }
      this.addScreenVideo();
      const c = this.portrait.renderer.domElement; c.style.position = 'absolute'; c.style.inset = '0'; c.style.width = '100%'; c.style.height = '100%'; c.style.opacity = '0'; c.style.transition = 'opacity 1.4s ease';
      requestAnimationFrame(() => { c.style.opacity = '1'; });
      this.portraitOn = true;
    } catch (e) { console.warn('portrait failed', e); this.portraitFailed = true; }
  }
});
(window.WBL = window.WBL || {}).sections = 1;
