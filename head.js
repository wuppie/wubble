/* Wubble site head (loaded blocking from the Webflow site head, right after window.WB_PIN is set):
   the Webflow head only holds the pin + this file + head.css, so a new pin is a tiny edit. Everything below used to live inline there. */

/* no graphics chip (software WebGL: speed-test servers, some cheap laptops): WebGL effects draw for 1.5s, then hold their last frame, and once the page has loaded every animation loop pauses while nobody interacts; scrolling, the mouse, a tap or a key wakes everything. ?nogpu forces this for testing. WB_GL_OK(gl) tells a module whether its context may draw this frame. */
(function(){try{var c=document.createElement('canvas'),g=c.getContext('webgl',{failIfMajorPerformanceCaveat:true}),sw=!g;if(g){var d=g.getExtension('WEBGL_debug_renderer_info');sw=d?/swiftshader|llvmpipe|softpipe|software|basic render/i.test(g.getParameter(d.UNMASKED_RENDERER_WEBGL)):false;var x=g.getExtension('WEBGL_lose_context');x&&x.loseContext();}
if(!sw&&!/[?&]nogpu\b/.test(location.search))return;window.WB_NOGPU=1;
var R=window.requestAnimationFrame.bind(window),C=window.cancelAnimationFrame.bind(window),f=0,wake=0,HOLD=1500,bootT=0,Q=new Map(),qid=-1;(function L(){f++;R(L);})();
var ok=function(gl){var n=performance.now();if(gl.__wbF===f&&n-gl.__wbN<250)return gl.__wbOk;if(!gl.__wbT)gl.__wbT=n;gl.__wbF=f;gl.__wbN=n;return(gl.__wbOk=n-gl.__wbT<HOLD||n<wake);};window.WB_GL_OK=ok;
var idle=function(){var n=performance.now();if(n<wake||!document.documentElement.classList.contains('wb-boot-done'))return false;if(!bootT)bootT=n;return n-bootT>HOLD;};
window.requestAnimationFrame=function(cb){if(!idle())return R(cb);var id=qid--;Q.set(id,cb);return id;};
window.cancelAnimationFrame=function(id){if(id<0)Q.delete(id);else C(id);};
['scroll','wheel','touchmove','pointerdown','pointermove','keydown','resize'].forEach(function(e){addEventListener(e,function(){wake=performance.now()+1200;if(Q.size){var a=Array.from(Q.values());Q.clear();a.forEach(function(cb){R(cb);});}},{passive:true,capture:true});});
[window.WebGLRenderingContext,window.WebGL2RenderingContext].forEach(function(K){if(!K)return;var P=K.prototype;['clear','drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced','drawRangeElements','blitFramebuffer'].forEach(function(k){var o=P[k];if(o)P[k]=function(){if(ok(this))return o.apply(this,arguments);};});});}catch(e){}})();

/* three.js scenes: new materials compile in the background (KHR_parallel_shader_compile) instead of freezing the page mid-scroll; until then the last frame stays on screen. Modules call WB_READY(renderer, scene, camera) before render. Browsers without background compiling (iPhone Safari) skip it: there it only cost frames. The fingerprint covers all objects, visible or not (three compiles hidden ones too), so cards fading in/out don't trigger it. */
window.WB_READY=function(r,sc,cam){if(!r.compileAsync||!r.extensions||!r.extensions.has('KHR_parallel_shader_compile'))return true;var m=r.__wbR||(r.__wbR=new WeakMap()),s=m.get(sc),t=performance.now();if(!s)m.set(sc,s={k:NaN,b:0,t:0});if(s.b&&t-s.t<3000)return false;s.b=0;
var k=(sc.environment?sc.environment.id:0)*7+(r.getRenderTarget()?3:1),n=0;sc.traverse(function(o){if(o.isLight){n++;return;}var x=o.material;if(!x)return;if(x.length)for(var i=0;i<x.length;i++)k=(k*31+x[i].id)|0;else k=(k*31+x.id)|0;});k=(k*31+n)|0;
if(k===s.k)return true;s.k=k;s.b=1;s.t=t;r.compileAsync(sc,cam).then(function(){s.b=0;},function(){s.b=0;});return false;};

/* effects below the fold start when they come within one screen of view, or in quiet time (staggered) after load, whichever is first, so their shader compile doesn't land mid-scroll. Phones: the quiet-time start waits for the first touch/scroll, so the page itself loads light. */
window.WB_NEAR=function(el,fn){if(el.__wbNear)return;el.__wbNear=1;var done=0,io=null,go=function(){if(done)return;done=1;if(io)io.disconnect();(window.requestIdleCallback||setTimeout)(function(){fn();},{timeout:300});};
if(!window.IntersectionObserver)return go();io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++)if(es[i].isIntersecting)return go();},{rootMargin:'100% 0px'});io.observe(el);
if(window.WB_NOGPU)return;var q=window.__wbNearN=(window.__wbNearN||0)+1,later=function(){setTimeout(go,1500+q*700);};
if(matchMedia('(pointer: coarse)').matches){var EV=['touchstart','scroll','pointerdown'],t=function(){EV.forEach(function(e){removeEventListener(e,t,true);});later();};EV.forEach(function(e){addEventListener(e,t,{capture:true,passive:true});});return;}
document.readyState==='complete'?later():addEventListener('load',later,{once:true});};

/* arriving through an ink page transition: keep the page hidden in the ink colour from the very first paint until wb-ink takes over (no flash of the page before the loader) */
(function(){try{var s=JSON.parse(sessionStorage.getItem('wbInk')||'null');if(s&&Date.now()-s.t<8000&&/^[#\w(),.\s%]+$/.test(s.c||'')){var st=document.createElement('style');st.textContent='html:not(.wb-boot-done){background:'+s.c+'!important}html:not(.wb-boot-done) body{opacity:0!important}';document.head.appendChild(st);setTimeout(function(){document.documentElement.classList.add('wb-boot-done');},6000);}}catch(e){}})();

/* Wubble effects: WB_PIN (set in the Webflow head) = the commit of the 'cdn' branch every page loads from */
window.WB_ASSETS='https://cdn.jsdelivr.net/gh/wuppie/wubble@'+window.WB_PIN+'/';
/* bundles (tools/bundle.mjs): each run of local scripts in a WB_LOAD list loads as ONE file when a bundle exists for it; otherwise file by file.
   Plain .js on purpose: jsDelivr minifies .min.js on the first request after a new pin and that request can fail (page stuck on the loader). */
window.WB_BUNDLED='116s2k3,e9ea17,cwj92d,1pe5keh,17mri9s,nnpoq2,1t76fed,12em29a,u7hq00,647k86';
window.WB_BUNDLE_EXT='.js';
window.WB_CSS=function(p){var l=document.createElement('link');l.rel='stylesheet';l.href=window.WB_ASSETS+p;document.head.appendChild(l);};
window.WB_LOAD=function(list){var B=','+window.WB_BUNDLED+',',H=function(s){var h=5381;for(var i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return h.toString(36);},add=function(u,a){var s=document.createElement('script');s.src=u;s.async=false;for(var k in a)s.setAttribute(k,a[k]);document.body.appendChild(s);},url=function(u){return window.WB_ASSETS+(u.indexOf('/')<0&&!/\.js$/.test(u)?'modules22/wb-'+u+'.js':u);},at=function(o,a){if(o.base)a['data-base']=window.WB_ASSETS;if(o.attrs)for(var k in o.attrs)a[k]=o.attrs[k];return a;},run=[],flush=function(){if(!run.length)return;var h=H(run.map(function(o){return o.src;}).join(','));if(run.length>1&&B.indexOf(','+h+',')>=0){var a={};run.forEach(function(o){at(o,a);});add(window.WB_ASSETS+'bundles/'+h+window.WB_BUNDLE_EXT,a);}else run.forEach(function(o){add(url(o.src),at(o,{}));});run=[];};list.forEach(function(m){var o=typeof m==='string'?{src:m}:m;if(/^https?:/.test(o.src)){flush();add(o.src,{});}else run.push(o);});flush();};
/* pixel text reveal site-wide (wb-pixeltext, loaded in the site footer): line reveals [data-wb-lines] + service list titles [data-wb-row-title] */
window.WB_PIXEL_LINES=true;
window.WB_PIXEL_ROWS=true;
/* AI chat backend (wubble/chat-worker, Cloudflare): the Let's chat widget posts here */
window.WB_CHAT_URL='https://wubble-chat.wubble.workers.dev';
/* menu: simple language switcher (EN / NL) left of the close button; the target is worked out on click, so it stays right after a page swap */
(function(){var path=function(){return location.pathname.replace(/^\/nl(?=\/|$)/,'')||'/';},nl=function(){return /^nl/i.test(document.documentElement.lang||'');};
var add=function(){document.querySelectorAll('[data-wb-menu-close]').forEach(function(b){if(b.previousElementSibling&&b.previousElementSibling.classList.contains('wb-lang'))return;var n=document.createElement('nav');n.className='wb-lang';n.setAttribute('aria-label','Language');
n.innerHTML='<a href="#" data-lang="en" hreflang="en" lang="en">EN</a><span aria-hidden="true">/</span><a href="#" data-lang="nl" hreflang="nl" lang="nl">NL</a>';b.parentNode.insertBefore(n,b);});
document.querySelectorAll('.wb-lang a').forEach(function(a){var on=(a.getAttribute('data-lang')==='nl')===nl();a.classList.toggle('is-on',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');a.href=a.getAttribute('data-lang')==='nl'?'/nl'+(path()==='/'?'':path()):path();});};
document.readyState==='loading'?addEventListener('DOMContentLoaded',add):add();
addEventListener('click',function(e){var o=e.target.closest&&e.target.closest('[data-wb-menu-open]');if(o)add();var a=e.target.closest&&e.target.closest('.wb-lang a');if(!a)return;e.preventDefault();e.stopPropagation();if(a.classList.contains('is-on'))return;var p=path();location.href=a.getAttribute('data-lang')==='nl'?'/nl'+(p==='/'?'':p)+location.search:p+location.search;},true);})();
/* phones, homepage: the astronaut canvas is lifted 90px (head.css); over the last two screens (footer arriving) it glides back down, so the moon-landing astronaut is not cut off at the bottom of the screen */
(function(){var on=0,f=function(){on=0;var de=document.documentElement,V=innerHeight,end=de.scrollHeight-V,k=Math.min(1,Math.max(0,(end-scrollY-V*0.2)/(V*1.5)));de.style.setProperty('--wb-astro-up',k.toFixed(3));};
var go=function(){if(!document.querySelector('.home_astronaut-layer'))return;f();addEventListener('scroll',function(){if(!on){on=1;requestAnimationFrame(f);}},{passive:true});addEventListener('resize',f);};
document.readyState==='loading'?addEventListener('DOMContentLoaded',go):go();})();
