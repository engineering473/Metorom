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

    float cellSize = clamp(shortSide / 116.0, 4.0, 10.0);
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
`;function s(e,t,n){return Math.min(n,Math.max(t,e))}function c(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function l(e,t,n,r,i){let a=e.getContext(`2d`);if(!a)return;e.width=n,e.height=r;let o=t===`light`;a.fillStyle=o?`#f7f4ee`:`#0a0605`,a.fillRect(0,0,n,r);let c=Math.min(n,r),l=s(c/116,6,11);a.fillStyle=o?`#8e321e`:`#e1743d`;for(let e=l/2;e<r;e+=l)for(let t=l/2;t<n;t+=l){let o=(t-n/2)/c,u=(e-r/2)/c,d=o+Math.sin(u*3.08*i)*.16+Math.sin(u*3.76*i)*.08,f=u+Math.cos(d*2.28*i)*.15+Math.cos(d*2.76*i)*.08,p=Math.sin((d*5.2+f*2.6)*i+Math.sin(f*4*i)*.5),m=Math.cos((f*4.5-d*1.8)*i),h=s((p*.68+m*.32+.56)/1.44,0,1),g=l*(.045+h*.41);a.globalAlpha=.15+h*.82,a.beginPath(),a.arc(t,e,g,0,Math.PI*2),a.fill()}a.globalAlpha=1}function u({mode:e=`dark`,hue:t=0,saturation:n=1,brightness:u=1,waveDensity:d=1,playing:f=!0,className:p,style:m}){let h=(0,r.useRef)(null),g=(0,r.useRef)(null),_=(0,r.useRef)(f),v=(0,r.useRef)(null),y=e===`light`?`light`:`dark`,b=s(t,-180,180),x=s(n,0,2),S=s(u,.35,1.65),C=s(d,.5,2.5);return(0,r.useEffect)(()=>{let e=h.current,t=g.current;if(!e||!t)return;let n=window.matchMedia(`(prefers-reduced-motion: reduce)`),r=window.matchMedia(`(pointer: coarse), (max-width: 760px)`).matches,i=document.createElement(`canvas`);i.setAttribute(`aria-hidden`,`true`),i.style.cssText=`position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none`;let s=i.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:`low-power`,preserveDrawingBuffer:!1}),u=s?c(s,s.VERTEX_SHADER,a):null,d=s?c(s,s.FRAGMENT_SHADER,o):null,f=s&&u&&d?s.createProgram():null;s&&f&&u&&d&&(s.attachShader(f,u),s.attachShader(f,d),s.linkProgram(f));let p=!!(s&&f&&s.getProgramParameter(f,s.LINK_STATUS)),m=p&&s?s.createBuffer():null,b=null,x=null,S=null,w=null,T=!1;if(p&&s&&f&&m){e.appendChild(i),t.hidden=!0,t.style.display=`none`,s.useProgram(f),s.bindBuffer(s.ARRAY_BUFFER,m),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),s.STATIC_DRAW);let n=s.getAttribLocation(f,`a_position`);s.enableVertexAttribArray(n),s.vertexAttribPointer(n,2,s.FLOAT,!1,0,0),b=s.getUniformLocation(f,`u_resolution`),x=s.getUniformLocation(f,`u_time`),S=s.getUniformLocation(f,`u_light`),w=s.getUniformLocation(f,`u_waves`)}let E=!1,D=0,O=0,k=0,A=0,j={width:1,height:1};function M(){p&&m&&s&&!T&&f&&(s.uniform2f(b,j.width,j.height),s.uniform1f(x,n.matches?0:A),s.uniform1f(S,+(y===`light`)),s.uniform1f(w,C),s.drawArrays(s.TRIANGLE_STRIP,0,4))}function N(){D&&cancelAnimationFrame(D),D=0,k=0}function P(e){D=0,!(!E||document.hidden||n.matches||T||!_.current)&&(k&&(A+=Math.min((e-k)/1e3,.1)),k=e,e-O>=1e3/(r?18:30)&&(M(),O=e),D=requestAnimationFrame(P))}function F(){!D&&p&&m&&E&&!document.hidden&&!n.matches&&!T&&_.current&&(D=requestAnimationFrame(P))}function I(){let n=e.getBoundingClientRect(),a=Math.min(window.devicePixelRatio||1,r?1:1.5,Math.sqrt(18e5/Math.max(1,n.width*n.height)));j={width:Math.max(1,Math.round(n.width*a)),height:Math.max(1,Math.round(n.height*a))},p&&m&&s&&!T?((i.width!==j.width||i.height!==j.height)&&(i.width=j.width,i.height=j.height,s.viewport(0,0,j.width,j.height)),M()):l(t,y,j.width,j.height,C)}function L(e){e?.preventDefault(),T=!0,N(),i.hidden=!0,i.style.display=`none`,t.hidden=!1,t.style.display=`block`,l(t,y,j.width,j.height,C)}let R=new ResizeObserver(I);R.observe(e);let z=new IntersectionObserver(([e])=>{E=e.isIntersecting,E?F():N()},{threshold:.01});z.observe(e);let B=()=>document.hidden?N():F(),V=()=>{n.matches?(N(),M()):F()};return document.addEventListener(`visibilitychange`,B),n.addEventListener(`change`,V),i.addEventListener(`webglcontextlost`,L),v.current={play:F,pause:N},I(),()=>{N(),v.current=null,R.disconnect(),z.disconnect(),document.removeEventListener(`visibilitychange`,B),n.removeEventListener(`change`,V),i.removeEventListener(`webglcontextlost`,L),i.remove(),t.hidden=!1,t.style.display=`block`,s&&m&&s.deleteBuffer(m),s&&f&&s.deleteProgram(f),s&&u&&s.deleteShader(u),s&&d&&s.deleteShader(d)}},[y,C]),(0,r.useEffect)(()=>{_.current=f,f?v.current?.play():v.current?.pause()},[f]),(0,i.jsx)(`div`,{ref:h,className:p,"aria-hidden":`true`,style:{position:`relative`,display:`block`,width:`100%`,height:`100%`,overflow:`hidden`,background:y===`light`?`#f7f4ee`:`#0a0605`,filter:`hue-rotate(${b}deg) saturate(${x}) brightness(${S})`,...m},children:(0,i.jsx)(`canvas`,{ref:g,style:{display:`block`,width:`100%`,height:`100%`}})})}export{u as t};