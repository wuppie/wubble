/* Unicorn Studio background: loads the embed for any [data-us-project], plus a light that drifts on a slow path and follows the cursor. */
(function(){function go(){if(!document.querySelector('[data-us-project]')){return setTimeout(go,100);}var u=window.UnicornStudio;if(u&&u.init){u.init();return;}window.UnicornStudio={isInitialized:false};var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.4.3/dist/unicornStudio.umd.js';s.onload=function(){UnicornStudio.init();};document.head.appendChild(s);}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',go);}else{go();}})();

(function(){var mx=innerWidth*0.5,my=innerHeight*0.5,ox=mx,oy=my,t0=performance.now(),last=t0,has=false;
addEventListener('mousemove',function(e){if(e.__wbSyn)return;mx=e.clientX;my=e.clientY;has=true;e.stopImmediatePropagation();},true);
function f(now){requestAnimationFrame(f);if(document.hidden)return;var dt=Math.min(0.05,(now-last)/1000);last=now;var t=(now-t0)/1000,W=innerWidth,H=innerHeight;
var dx=Math.sin(t*0.11)*0.22*W+Math.sin(t*0.047+1.3)*0.12*W,dy=Math.cos(t*0.083+0.6)*0.2*H+Math.sin(t*0.061)*0.1*H;
var bx=has?mx:W*0.5,by=has?my:H*0.5,tx=bx+dx*(has?0.55:1),ty=by+dy*(has?0.55:1),k=1-Math.exp(-dt*1.2);ox+=(tx-ox)*k;oy+=(ty-oy)*k;
var ev=new MouseEvent('mousemove',{clientX:ox,clientY:oy,bubbles:true});ev.__wbSyn=1;(document.querySelector('[data-us-project] canvas')||document).dispatchEvent(ev);}
requestAnimationFrame(f);})();
