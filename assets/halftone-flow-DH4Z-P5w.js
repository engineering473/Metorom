import{i as e,r as t,t as n}from"./jsx-runtime-CNxEmuZI.js";var r=e(t(),1),i=n(),a=`
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`,o=`
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_light;
  uniform float u_waves;
  uniform float u_dots;

  mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  void main() {
    float shortSide = min(u_resolution.x, u_resolution.y);
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / shortSide;
    vec2 flow = p;
    float time = u_time * 0.34;

    for (int i = 1; i < 4; i++) {
      float layer = float(i);
      flow *= rotate(0.065 * sin(time * 0.38 + layer));
      flow.x += sin(flow.y * (2.4 + layer * 0.68) * u_waves + time) * 0.16 / layer;
      flow.y += cos(flow.x * (1.8 + layer * 0.48) * u_waves - time * 0.82) * 0.15 / layer;
    }

    float wave = sin((flow.x * 5.2 + flow.y * 2.6) * u_waves + sin(flow.y * 4.0 * u_waves - time) * 0.5);
    float current = cos((flow.y * 4.5 - flow.x * 1.8) * u_waves + time * 0.74);
    float intensity = smoothstep(-0.56, 0.88, wave * 0.68 + current * 0.32);

    float cellSize = max(2.0, clamp(shortSide / 116.0, 4.0, 10.0) / u_dots);
    vec2 grid = gl_FragCoord.xy / cellSize;
    float distanceToCenter = length(fract(grid) - 0.5);
    float radius = 0.045 + intensity * 0.41;
    float dotMask = 1.0 - smoothstep(radius - 0.055, radius + 0.055, distanceToCenter);

    vec3 darkGround = vec3(0.040, 0.024, 0.020);
    vec3 darkDot = mix(vec3(0.53, 0.13, 0.075), vec3(1.0, 0.58, 0.28), intensity);
    vec3 lightGround = vec3(0.970, 0.957, 0.933);
    vec3 lightDot = mix(vec3(0.62, 0.20, 0.13), vec3(0.39, 0.11, 0.075), intensity);
    vec3 ground = mix(darkGround, lightGround, u_light);
    vec3 ink = mix(darkDot, lightDot, u_light);
    float coverage = dotMask * (0.15 + intensity * 0.82);
    vec3 color = mix(ground, ink, coverage);
    gl_FragColor = vec4(color, 1.0);
  }
`;function s(e,t,n){return Math.min(n,Math.max(t,e))}function c(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function l(e,t,n,r,i,a){let o=e.getContext(`2d`);if(!o)return;e.width=n,e.height=r;let c=t===`light`;o.fillStyle=c?`#f7f4ee`:`#0a0605`,o.fillRect(0,0,n,r);let l=Math.min(n,r),u=Math.max(2,s(l/116,6,11)/a);o.fillStyle=c?`#8e321e`:`#e1743d`;for(let e=u/2;e<r;e+=u)for(let t=u/2;t<n;t+=u){let a=(t-n/2)/l,c=(e-r/2)/l,d=a+Math.sin(c*3.08*i)*.16+Math.sin(c*3.76*i)*.08,f=c+Math.cos(d*2.28*i)*.15+Math.cos(d*2.76*i)*.08,p=Math.sin((d*5.2+f*2.6)*i+Math.sin(f*4*i)*.5),m=Math.cos((f*4.5-d*1.8)*i),h=s((p*.68+m*.32+.56)/1.44,0,1),g=u*(.045+h*.41);o.globalAlpha=.15+h*.82,o.beginPath(),o.arc(t,e,g,0,Math.PI*2),o.fill()}o.globalAlpha=1}function u({mode:e=`dark`,hue:t=0,saturation:n=1,brightness:u=1,waveDensity:d=1,dotDensity:f=1,playing:p=!0,className:m,style:h}){let g=(0,r.useRef)(null),_=(0,r.useRef)(null),v=(0,r.useRef)(p),y=(0,r.useRef)(null),b=e===`light`?`light`:`dark`,x=s(t,-180,180),S=s(n,0,2),C=s(u,.35,1.65),w=s(d,.5,2.5),T=s(Number.isFinite(f)?f:1,.5,4);return(0,r.useEffect)(()=>{let e=g.current,t=_.current;if(!e||!t)return;let n=window.matchMedia(`(prefers-reduced-motion: reduce)`),r=window.matchMedia(`(pointer: coarse), (max-width: 760px)`).matches,i=document.createElement(`canvas`);i.setAttribute(`aria-hidden`,`true`),i.style.cssText=`position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none`;let s=i.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:`low-power`,preserveDrawingBuffer:!1}),u=s?c(s,s.VERTEX_SHADER,a):null,d=s?c(s,s.FRAGMENT_SHADER,o):null,f=s&&u&&d?s.createProgram():null;s&&f&&u&&d&&(s.attachShader(f,u),s.attachShader(f,d),s.linkProgram(f));let p=!!(s&&f&&s.getProgramParameter(f,s.LINK_STATUS)),m=p&&s?s.createBuffer():null,h=null,x=null,S=null,C=null,E=null,D=!1;if(p&&s&&f&&m){e.appendChild(i),t.hidden=!0,t.style.display=`none`,s.useProgram(f),s.bindBuffer(s.ARRAY_BUFFER,m),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),s.STATIC_DRAW);let n=s.getAttribLocation(f,`a_position`);s.enableVertexAttribArray(n),s.vertexAttribPointer(n,2,s.FLOAT,!1,0,0),h=s.getUniformLocation(f,`u_resolution`),x=s.getUniformLocation(f,`u_time`),S=s.getUniformLocation(f,`u_light`),C=s.getUniformLocation(f,`u_waves`),E=s.getUniformLocation(f,`u_dots`)}let O=!1,k=0,A=0,j=0,M=0,N={width:1,height:1};function P(){p&&m&&s&&!D&&f&&(s.uniform2f(h,N.width,N.height),s.uniform1f(x,n.matches?0:M),s.uniform1f(S,+(b===`light`)),s.uniform1f(C,w),s.uniform1f(E,T),s.drawArrays(s.TRIANGLE_STRIP,0,4))}function F(){k&&cancelAnimationFrame(k),k=0,j=0}function I(e){k=0,!(!O||document.hidden||n.matches||D||!v.current)&&(j&&(M+=Math.min((e-j)/1e3,.1)),j=e,e-A>=1e3/(r?18:30)&&(P(),A=e),k=requestAnimationFrame(I))}function L(){!k&&p&&m&&O&&!document.hidden&&!n.matches&&!D&&v.current&&(k=requestAnimationFrame(I))}function R(){let n=e.getBoundingClientRect(),a=Math.min(window.devicePixelRatio||1,r?1:1.5,Math.sqrt(18e5/Math.max(1,n.width*n.height)));N={width:Math.max(1,Math.round(n.width*a)),height:Math.max(1,Math.round(n.height*a))},p&&m&&s&&!D?((i.width!==N.width||i.height!==N.height)&&(i.width=N.width,i.height=N.height,s.viewport(0,0,N.width,N.height)),P()):l(t,b,N.width,N.height,w,T)}function z(e){e?.preventDefault(),D=!0,F(),i.hidden=!0,i.style.display=`none`,t.hidden=!1,t.style.display=`block`,l(t,b,N.width,N.height,w,T)}let B=new ResizeObserver(R);B.observe(e);let V=new IntersectionObserver(([e])=>{O=e.isIntersecting,O?L():F()},{threshold:.01});V.observe(e);let H=()=>document.hidden?F():L(),U=()=>{n.matches?(F(),P()):L()};return document.addEventListener(`visibilitychange`,H),n.addEventListener(`change`,U),i.addEventListener(`webglcontextlost`,z),y.current={play:L,pause:F},R(),()=>{F(),y.current=null,B.disconnect(),V.disconnect(),document.removeEventListener(`visibilitychange`,H),n.removeEventListener(`change`,U),i.removeEventListener(`webglcontextlost`,z),i.remove(),t.hidden=!1,t.style.display=`block`,s&&m&&s.deleteBuffer(m),s&&f&&s.deleteProgram(f),s&&u&&s.deleteShader(u),s&&d&&s.deleteShader(d)}},[b,w,T]),(0,r.useEffect)(()=>{v.current=p,p?y.current?.play():y.current?.pause()},[p]),(0,i.jsx)(`div`,{ref:g,className:m,"aria-hidden":`true`,style:{position:`relative`,display:`block`,width:`100%`,height:`100%`,overflow:`hidden`,background:b===`light`?`#f7f4ee`:`#0a0605`,filter:`hue-rotate(${x}deg) saturate(${S}) brightness(${C})`,...h},children:(0,i.jsx)(`canvas`,{ref:_,style:{display:`block`,width:`100%`,height:`100%`}})})}export{u as t};