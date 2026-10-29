import{C as e,_ as t,b as n,m as r,p as i,t as a,u as o,w as s,x as c,y as l}from"./blue-theme-BJl2gP5y.js";import{i as u,n as d,r as f,t as p}from"./page-editor-DmXuPR7v.js";var m={name:`arrow-down`,size:24,node:[[`path`,{d:`M12 5v14`,key:`s699le`}],[`path`,{d:`m19 12-7 7-7-7`,key:`1idqje`}]]};m.node;var h=n(m),g={name:`download`,size:24,node:[[`path`,{d:`M12 15V3`,key:`m9g1x1`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`path`,{d:`m7 10 5 5 5-5`,key:`brsn70`}]]};g.node;var _=n(g),v=c(),y=s(e(),1),b=t(),x={aurora:{style:`streak`,colors:[`#f4efe9`,`#e9c2b8`,`#c2433f`,`#2a1e2a`,`#22395e`,`#6f97c2`,`#e5edf4`],scale:.7,warp:1.4,angle:-.62,gloss:.18,veins:0},ember:{style:`marble`,colors:[`#07090c`,`#16252c`,`#3d5f68`,`#1a1416`,`#a3201a`,`#ef4a2b`,`#ff8a5c`],scale:.62,warp:3.2,angle:-.5,gloss:.55,veins:.6},dusk:{style:`marble`,colors:[`#120c18`,`#3e2850`,`#8f6c9c`,`#2b1a24`,`#b3502f`,`#eab08a`,`#fbe7d2`],scale:.75,warp:3.6,angle:.8,gloss:.5,veins:.5},glacier:{style:`streak`,colors:[`#f7f8fa`,`#d9e2ea`,`#9fb4c7`,`#e8edf2`,`#bccbd8`,`#ffffff`],scale:.7,warp:1.6,angle:.35,gloss:.25,veins:0},verdant:{style:`marble`,colors:[`#070b08`,`#173024`,`#4f7a5a`,`#141812`,`#a7843a`,`#e9cf87`,`#fbf3d6`],scale:.7,warp:3.4,angle:2.1,gloss:.5,veins:.5}};function S(e){let t=e.trim().replace(/^#/,``);t.length===3&&(t=t[0]+t[0]+t[1]+t[1]+t[2]+t[2]);let n=/^[0-9a-f]{6}$/i.test(t)?parseInt(t,16):8421504;return[n>>16&255,n>>8&255,n&255]}function C(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function w(e){let t=2166136261;for(let n=0;n<e.length;n++)t=Math.imul(t^e.charCodeAt(n),16777619);return t>>>0}function T(e){let t=C(e),n=new Uint8Array(512),r=new Float32Array(512),i=[];for(let e=0;e<256;e++)i.push(e);for(let e=255;e>0;e--){let n=Math.floor(t()*(e+1)),r=i[e];i[e]=i[n],i[n]=r}for(let e=0;e<512;e++)n[e]=i[e&255];for(let e=0;e<256;e++){let n=t()*Math.PI*2;r[e*2]=Math.cos(n),r[e*2+1]=Math.sin(n)}let a=(e,t)=>{let i=Math.floor(e),a=Math.floor(t),o=e-i,s=t-a,c=i&255,l=a&255,u=n[c+n[l]]*2,d=n[c+1+n[l]]*2,f=n[c+n[l+1]]*2,p=n[c+1+n[l+1]]*2,m=r[u]*o+r[u+1]*s,h=r[d]*(o-1)+r[d+1]*s,g=r[f]*o+r[f+1]*(s-1),_=r[p]*(o-1)+r[p+1]*(s-1),v=o*o*o*(o*(o*6-15)+10),y=s*s*s*(s*(s*6-15)+10);return m+v*(h-m)+y*(g-m+v*(_-g-h+m))};return(e,t,n)=>{let r=0,i=.5;for(let o=0;o<n;o++){r+=i*a(e,t);let n=1.6*e+1.2*t+7.1;t=-1.2*e+1.6*t+3.3,e=n,i*=.5}return r}}function E(e,t,n,r){let i=Math.max(1,Math.round(e)),a=Math.max(1,Math.round(t)),o=n.colors.length>=2?n.colors:[`#111111`,`#eeeeee`],s=o.map((e,t)=>({t:t/(o.length-1),c:S(e)})),c=n.scale??.7,l=n.warp??3,u=n.gloss??.4,d=n.veins??0,f=n.style===`streak`,p=T(r*977+13),m=C(r+1),h=m()*50,g=m()*50,_=(n.angle??0)+(m()-.5)*.5,v=Math.cos(_),y=Math.sin(_),b=Math.min(i,a),x=Math.ceil(i/2)+3,w=Math.ceil(a/2)+3,E=new Float32Array(x*w),D=new Float32Array(x*w),O=new Float32Array(i*a),k=new Float32Array(i*a),A=new Uint8ClampedArray(i*a*4),j=0,M=e=>{for(let t=0;t<x;t++){let n=((t-1)*2-i/2)/b,r=((e-1)*2-a/2)/b,o=(n*v-r*y)*c,s=(n*y+r*v)*c;f&&(o*=.14,s*=2.2),o+=h,s+=g;let u=p(o,s,3),d=p(o+5.2,s+1.3,3),m=p(o+l*u+1.7,s+l*d+9.2,3),_=p(o+l*u+8.3,s+l*d+2.8,3);E[e*x+t]=p(o+l*m,s+l*_,4),D[e*x+t]=Math.sqrt(u*u+d*d)}},N=()=>{let e=(e,t,n,r)=>(-e+9*t+9*n-r)/16,t=new Float32Array(i*w);for(let n=0;n<w;n++){let r=n*x;for(let a=0;a<i;a++){let o=(a>>1)+1;t[n*i+a]=a&1?e(E[r+o-1],E[r+o],E[r+o+1],E[r+o+2]):E[r+o]}}for(let n=0;n<a;n++){let r=(n>>1)+1;for(let a=0;a<i;a++){O[n*i+a]=n&1?e(t[(r-1)*i+a],t[r*i+a],t[(r+1)*i+a],t[(r+2)*i+a]):t[r*i+a];let o=(a>>1)+1,s=D[r*x+o],c=a&1?(s+D[r*x+o+1])/2:s,l=n&1?a&1?(D[(r+1)*x+o]+D[(r+1)*x+o+1])/2:D[(r+1)*x+o]:c;k[n*i+a]=(c+l)/2}}},P=()=>{let e=[],t=Math.max(1,Math.floor(O.length/4096));for(let n=0;n<O.length;n+=t)e.push(O[n]);e.sort((e,t)=>e-t);let n=e[Math.floor(e.length*.02)],r=1/(e[Math.floor(e.length*.98)]-n||1),o=r*b*.012;for(let e=0;e<a;e++)for(let t=0;t<i;t++){let c=e*i+t,l=(O[c]-n)*r;l=l<0?0:l>1?1:l;let f=1;for(;f<s.length-1&&s[f].t<l;)f++;let p=s[f-1],m=s[f],h=(l-p.t)/(m.t-p.t||1);h=h<0?0:h>1?1:h,h=h*h*(3-2*h);let g=(O[t<i-1?c+1:c]-O[t>0?c-1:c])*o,_=(O[e<a-1?c+i:c]-O[e>0?c-i:c])*o,v=(-g*-.55-_*-.65+.52)/Math.sqrt(g*g+_*_+1),y=(v>0?v:0)**24*u*255,b=1+.035*Math.sin(l*150+k[c]*24),x=d*Math.max(0,1-Math.abs(k[c]-.42)*14)*.6,S=(.82+.28*v)*b*(1-x);A[c*4]=(p.c[0]+(m.c[0]-p.c[0])*h)*S+y,A[c*4+1]=(p.c[1]+(m.c[1]-p.c[1])*h)*S+y,A[c*4+2]=(p.c[2]+(m.c[2]-p.c[2])*h)*S+y,A[c*4+3]=255}};return{width:i,height:a,pixels:A,step:e=>{if(j>=w)return!0;let t=Math.min(w,j+Math.max(1,e));for(;j<t;)M(j++);return j<w?!1:(N(),P(),!0)}}}function D(e,t){return t<=1?0:e/(t-1)*2-1}var O=e=>typeof e==`string`?x[e]:e,k=new Map,A=[],j=!1;function M(){if(j)return;j=!0;let e=()=>{let t=performance.now()+7;for(;A.length&&performance.now()<t;){let e=A[0];if(e.job.step(4)){A.shift();let t=document.createElement(`canvas`);t.width=e.job.width,t.height=e.job.height,t.getContext(`2d`)?.putImageData(new ImageData(e.job.pixels,t.width,t.height),0,0),e.done(t)}}A.length?requestAnimationFrame(e):j=!1};requestAnimationFrame(e)}function N(e,t,n,r,i){let a=JSON.stringify([e,t,n,r]),o=k.get(a);return o||(o=new Promise(a=>{let o=A.length;for(;o>1&&A[o-1].priority>i;)o--;A.splice(o,0,{job:E(n,r,e,t),priority:i,done:a}),M()}),k.set(a,o)),o}function P({art:e,seed:t,w:n,h:r,density:i,priority:a,className:o}){let s=y.useRef(null),[c,l]=y.useState(!1),u=O(e),d=JSON.stringify(u),f=Math.round(n*i),p=Math.round(r*i);return y.useEffect(()=>{let e=!0;return l(!1),N(JSON.parse(d),t,f,p,a).then(t=>{let n=s.current;e&&n&&(n.width=t.width,n.height=t.height,n.getContext(`2d`)?.drawImage(t,0,0),l(!0))}),()=>{e=!1}},[d,t,f,p,a]),(0,b.jsx)(`canvas`,{ref:s,"aria-hidden":`true`,className:o,"data-ready":c||void 0,style:{width:n,height:r,maxWidth:`none`}})}var ee=340,te=54,F=272,ne=184,re=`M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z`,ie=`M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 176A22 22 0 0 1 318 198L22 198A22 22 0 0 1 0 176Z`,ae=4,oe=[{name:`Cover — final`,meta:`PNG · 4.8 MB`,art:`ember`},{name:`Moodboard`,meta:`24 images`,art:`dusk`},{name:`Brief.pdf`,meta:`PDF · 1.2 MB`}];function I({label:e=`My Files`,meta:t,tone:n=`light`,art:r=`aurora`,seed:i=3,image:a,files:o=oe,action:s=`add`,onAdd:c,onFilesChange:l,menu:u=[],labelPlacement:d=`bottom-left`,open:f,defaultOpen:p=!1,onOpenChange:m,onFileSelect:h,openLabel:g,closeLabel:_,contentsLabel:v,openHeadroom:x=0,width:S=340,appear:T=!0,appearDelay:E=0,className:O,style:k}){let A=y.useId().replace(/:/g,``),j=y.useRef(null),M=y.useRef(null),N=y.useRef(null),I=y.useRef(null),L=y.useRef(null),[R,z]=y.useState(o),B=y.useRef(o.map((e,t)=>t)),V=y.useRef(o.length),[ce,H]=y.useState(null),[U,le]=y.useState(0),[ue,de]=y.useState(p),W=f??ue,G=y.useCallback(e=>{f===void 0&&de(e),m?.(e)},[f,m]),[K,q]=y.useState(!1),[fe,J]=y.useState(!T),Y=S/ee,X=Math.min(1.5,Math.max(1,typeof window>`u`?1:window.devicePixelRatio||1))*Y;y.useEffect(()=>{if(!T)return;let e=j.current;if(!e||typeof IntersectionObserver>`u`){J(!0);return}let t=0,n=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)&&(n.disconnect(),t=window.setTimeout(()=>J(!0),E))},{threshold:.25});return n.observe(e),()=>{n.disconnect(),window.clearTimeout(t)}},[T,E]),y.useEffect(()=>{let e=j.current;if(!e)return;let t=0,n=0,r=0,i=()=>{t=0,e.style.setProperty(`--gf-px`,n.toFixed(3)),e.style.setProperty(`--gf-py`,r.toFixed(3))},a=a=>{if(a.pointerType===`touch`)return;let o=e.getBoundingClientRect();n=(a.clientX-o.left)/o.width*2-1,r=(a.clientY-o.top)/o.height*2-1,t||=requestAnimationFrame(i)},o=()=>{n=0,r=0,t||=requestAnimationFrame(i)};return e.addEventListener(`pointermove`,a),e.addEventListener(`pointerleave`,o),()=>{e.removeEventListener(`pointermove`,a),e.removeEventListener(`pointerleave`,o),cancelAnimationFrame(t)}},[]),y.useEffect(()=>{M.current?.toggleAttribute(`inert`,!W)},[W]),y.useEffect(()=>{if(!W&&!K)return;let e=e=>{e.key===`Escape`&&(K?(q(!1),I.current?.focus()):(G(!1),N.current?.focus()))},t=e=>{let t=e.target;K&&!L.current?.contains(t)&&!I.current?.contains(t)&&q(!1),W&&!K&&!j.current?.contains(t)&&G(!1)};return document.addEventListener(`keydown`,e),document.addEventListener(`pointerdown`,t),()=>{document.removeEventListener(`keydown`,e),document.removeEventListener(`pointerdown`,t)}},[W,K,G]),y.useEffect(()=>{K&&L.current?.querySelector(`[role=menuitem]`)?.focus()},[K]);let pe=()=>{let e=c?.(R)||{name:`Untitled `+(R.length+1),meta:`Just now`},t=[...R,e],n=V.current++;B.current=[...B.current,n],z(t),H(n),le(e=>e+1),l?.(t)},me=[{label:W?`Close folder`:`Open folder`,onSelect:()=>G(!W)},...u],he=e=>{let t=Array.from(L.current?.querySelectorAll(`[role=menuitem]`)??[]),n=t.indexOf(document.activeElement),r=n=>{e.preventDefault(),t[(n+t.length)%t.length]?.focus()};e.key===`ArrowDown`?r(n+1):e.key===`ArrowUp`?r(n-1):e.key===`Home`?r(0):e.key===`End`?r(t.length-1):e.key===`Tab`&&q(!1)},Z=Math.max(0,R.length-ae),Q=R.slice(Z),$=R.length,ge=t??$+($===1?` item`:` items`);return(0,b.jsxs)(`div`,{ref:j,className:`gf-root`+(O?` `+O:``),"data-tone":n,"data-open":W||void 0,"data-entered":fe||void 0,"data-place":d,style:{width:S,height:(326+(W?x:0))*Y,...k},children:[(0,b.jsx)(`style`,{children:se}),(0,b.jsx)(`div`,{className:`gf-stage`,style:{transform:`translateY(`+(te+(W?x:0))*Y+`px) scale(`+Y+`)`},children:(0,b.jsxs)(`div`,{className:`gf-tilt`,children:[(0,b.jsx)(`div`,{className:`gf-shadow`,"aria-hidden":`true`}),(0,b.jsxs)(`div`,{className:`gf-back`,style:{clipPath:`path('`+re+`')`},"aria-hidden":`true`,children:[a?(0,b.jsx)(`img`,{className:`gf-art`,src:a,alt:``,width:364,height:296,draggable:!1}):r===`none`?null:(0,b.jsx)(P,{className:`gf-art`,art:r,seed:i,w:364,h:296,density:X,priority:0}),(0,b.jsx)(`div`,{className:`gf-back-sheen`})]}),(0,b.jsx)(`svg`,{className:`gf-rim gf-back-rim`,viewBox:`0 0 340 272`,"aria-hidden":`true`,children:(0,b.jsx)(`path`,{d:re})}),(0,b.jsxs)(`div`,{className:`gf-front`+(U?` gf-front--bump`:``),style:{clipPath:`path('`+ie+`')`},children:[(0,b.jsx)(`div`,{className:`gf-tint`,"aria-hidden":`true`}),(0,b.jsx)(`div`,{className:`gf-spec`,"aria-hidden":`true`}),(0,b.jsxs)(`svg`,{className:`gf-rim gf-front-rim`,viewBox:`0 0 340 198`,"aria-hidden":`true`,children:[(0,b.jsx)(`defs`,{children:(0,b.jsxs)(`linearGradient`,{id:`gf-rim-`+A,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#fff`,stopOpacity:`0.95`}),(0,b.jsx)(`stop`,{offset:`0.35`,stopColor:`#fff`,stopOpacity:`0.35`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#fff`,stopOpacity:`0.12`})]})}),(0,b.jsx)(`path`,{d:ie,stroke:`url(#gf-rim-`+A+`)`})]}),(0,b.jsx)(`button`,{ref:N,type:`button`,className:`gf-hit`,"aria-expanded":W,"aria-label":(W?_:g)??(W?`Close `:`Open `)+e+`, `+$+($===1?` item`:` items`),"aria-controls":`gf-contents-`+A,onClick:()=>{q(!1),G(!W)}}),(0,b.jsxs)(`div`,{className:`gf-label`,children:[(0,b.jsx)(`span`,{className:`gf-title`,children:e}),(0,b.jsx)(`span`,{className:`gf-meta`,children:ge},ge)]})]},U),(0,b.jsx)(`div`,{ref:M,id:`gf-contents-`+A,className:`gf-files`,role:`list`,"aria-label":v??e+` contents`,children:Q.map((e,t)=>{let n=B.current[Z+t],r=D(t,Q.length),i=C(w(e.name)+n),a=!!(e.art||e.image),o=(0,b.jsxs)(b.Fragment,{children:[a?e.image?(0,b.jsx)(`img`,{className:`gf-sheet-art`,src:e.image,alt:``,width:F,height:ne,draggable:!1}):(0,b.jsx)(P,{className:`gf-sheet-art`,art:e.art,seed:w(e.name)%997,w:F,h:ne,density:Math.min(X,1.25),priority:1}):(0,b.jsxs)(`span`,{className:`gf-lines`,"aria-hidden":`true`,children:[(0,b.jsx)(`i`,{style:{width:`86%`}}),(0,b.jsx)(`i`,{style:{width:`92%`}}),(0,b.jsx)(`i`,{style:{width:`64%`}}),(0,b.jsx)(`i`,{style:{width:`88%`}}),(0,b.jsx)(`i`,{style:{width:`42%`}})]}),(0,b.jsxs)(`span`,{className:`gf-sheet-head`,children:[(0,b.jsx)(`span`,{className:`gf-sheet-name`,children:e.name}),e.meta?(0,b.jsx)(`span`,{className:`gf-sheet-meta`,children:e.meta}):null]})]}),s={className:`gf-sheet`+(a?` gf-sheet--art`:``)+(n===ce?` gf-sheet--drop`:``),style:{"--gf-slot":r,"--gf-depth":Q.length-1-t,"--gf-jx":((i()-.5)*10).toFixed(2)+`px`,"--gf-jr":((i()-.5)*3.2).toFixed(2)+`deg`,zIndex:t+1},onAnimationEnd:n===ce?()=>H(null):void 0};return(0,b.jsx)(`div`,{role:`listitem`,className:`gf-sheet-slot`,children:e.href?(0,b.jsx)(`a`,{...s,href:e.href,onClick:()=>h?.(e,Z+t),children:o}):(0,b.jsx)(`button`,{...s,type:`button`,onClick:()=>h?.(e,Z+t),children:o})},n)})}),s===`none`?null:(0,b.jsx)(`button`,{ref:I,type:`button`,className:`gf-key gf-key--`+s,"aria-label":s===`add`?`Add a file to `+e:`More options for `+e,"aria-haspopup":s===`more`?`menu`:void 0,"aria-expanded":s===`more`?K:void 0,"aria-controls":s===`more`?`gf-menu-`+A:void 0,onClick:()=>s===`add`?pe():q(e=>!e),children:s===`add`?(0,b.jsx)(`svg`,{className:`gf-glyph gf-glyph--plus`,viewBox:`0 0 24 24`,"aria-hidden":`true`,children:(0,b.jsx)(`path`,{d:`M12 4.5v15M4.5 12h15`})},U):(0,b.jsxs)(`svg`,{className:`gf-glyph gf-glyph--more`,viewBox:`0 0 30 12`,"aria-hidden":`true`,children:[(0,b.jsx)(`rect`,{x:`1`,y:`1.5`,width:`8`,height:`9`,rx:`3.4`}),(0,b.jsx)(`rect`,{x:`11`,y:`1.5`,width:`8`,height:`9`,rx:`3.4`}),(0,b.jsx)(`rect`,{x:`21`,y:`1.5`,width:`8`,height:`9`,rx:`3.4`})]})}),s===`more`?(0,b.jsx)(`div`,{ref:L,id:`gf-menu-`+A,role:`menu`,"aria-label":e+` options`,className:`gf-menu`,"data-open":K||void 0,onKeyDown:he,children:me.map((e,t)=>(0,b.jsx)(`button`,{type:`button`,role:`menuitem`,tabIndex:K?-1:void 0,disabled:!K,className:`gf-menu-item`+(e.danger?` gf-menu-item--danger`:``),onClick:()=>{q(!1),I.current?.focus(),e.onSelect?.()},children:e.label},e.label+t))}):null]})})]})}var se=`
.gf-root {
  --gf-px: 0;
  --gf-py: 0;
  --gf-ease: cubic-bezier(.2, .8, .2, 1);
  --gf-spring: cubic-bezier(.34, 1.36, .5, 1);
  --gf-hinge: 0deg;
  --gf-lift: 42px;
  --gf-spread: 0px;
  --gf-fan: 0deg;
  --gf-stack: 15px;
  --gf-ink: #141416;
  --gf-ink-soft: rgba(20, 20, 22, .55);
  position: relative;
  display: inline-block;
  flex: none;
  vertical-align: top;
  font-family: ui-sans-serif, system-ui, -apple-system, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
}
.gf-root[data-tone="dark"] { --gf-ink: #f5f5f7; --gf-ink-soft: rgba(245, 245, 247, .58); }
.gf-root:hover, .gf-root:focus-within { --gf-hinge: -11deg; --gf-lift: -34px; --gf-spread: 8px; --gf-fan: 1.4deg; --gf-stack: 10px; }
.gf-root[data-open] { --gf-hinge: -24deg; --gf-lift: -96px; --gf-spread: 40px; --gf-fan: 5deg; --gf-stack: 30px; }

.gf-stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 340px;
  height: 272px;
  transform-origin: 0 0;
}
.gf-tilt {
  position: absolute;
  inset: 0;
  transform: perspective(1400px) rotateX(calc(var(--gf-py) * -3deg)) rotateY(calc(var(--gf-px) * 4deg));
  transition: transform .9s var(--gf-ease);
}

.gf-shadow {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: -6px;
  height: 60px;
  border-radius: 40px;
  background: rgba(16, 18, 24, .34);
  filter: blur(22px);
  transform: translateX(calc(var(--gf-px) * -8px));
  transition: transform .9s var(--gf-ease), opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-shadow { background: rgba(0, 0, 0, .62); }

.gf-back {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #f3f3f4 0%, #e3e3e6 100%);
}
.gf-root[data-tone="dark"] .gf-back { background: linear-gradient(180deg, #2a2a2e 0%, #121214 100%); }
.gf-art {
  position: absolute;
  left: -12px;
  top: -12px;
  max-width: none;
  object-fit: cover;
  transform: translate(calc(var(--gf-px) * -7px), calc(var(--gf-py) * -6px)) scale(1.02);
  transition: transform 1.1s var(--gf-ease), opacity 1.2s var(--gf-ease), filter 1.2s var(--gf-ease);
}
canvas.gf-art { opacity: 0; filter: blur(14px) saturate(.6); }
canvas.gf-art[data-ready] { opacity: 1; filter: none; }
.gf-back-sheen {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .22) 0%, rgba(255, 255, 255, 0) 22%),
    radial-gradient(120% 80% at 80% 0%, rgba(255, 255, 255, .16), rgba(255, 255, 255, 0) 60%);
  pointer-events: none;
}

.gf-rim {
  position: absolute;
  left: 0;
  top: 0;
  max-width: none;
  overflow: visible;
  pointer-events: none;
  fill: none;
}
.gf-back-rim { width: 340px; height: 272px; }
.gf-back-rim path { stroke: rgba(255, 255, 255, .45); stroke-width: 1; }
.gf-root[data-tone="dark"] .gf-back-rim path { stroke: rgba(255, 255, 255, .16); }

/* ---- files ---------------------------------------------------------------- */
.gf-files {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  /* nothing hangs out of the bottom of the pocket, however tall the stack */
  clip-path: inset(-400px -400px 10px -400px);
}
.gf-sheet-slot { display: contents; }
.gf-sheet {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  left: 34px;
  top: 96px;
  width: 272px;
  height: 184px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f2f2f0 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .9),
    0 0 0 .5px rgba(0, 0, 0, .1),
    0 10px 26px -8px rgba(10, 12, 20, .28);
  transform-origin: 50% 100%;
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1))
    rotate(calc(var(--gf-jr) + var(--gf-slot) * var(--gf-fan)));
  transition:
    transform .75s var(--gf-spring) calc(var(--gf-depth) * 40ms),
    box-shadow .4s var(--gf-ease),
    translate .9s var(--gf-ease),
    opacity .9s var(--gf-ease);
}
.gf-root[data-tone="dark"] .gf-sheet { background: linear-gradient(180deg, #2c2c30 0%, #1c1c1f 100%); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .14), 0 0 0 .5px rgba(255, 255, 255, .08), 0 12px 28px -8px rgba(0, 0, 0, .7); }
.gf-sheet--art { background: #1a1a1d; }
.gf-root[data-open] .gf-sheet:hover,
.gf-root[data-open] .gf-sheet:focus-visible {
  transform:
    translate(calc(var(--gf-jx) + var(--gf-slot) * var(--gf-spread)), calc(var(--gf-lift) + var(--gf-depth) * var(--gf-stack) * -1 - 18px))
    rotate(calc(var(--gf-slot) * var(--gf-fan) * .6));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .1), 0 22px 40px -12px rgba(10, 12, 20, .42);
  transition-delay: 0s;
}
.gf-sheet:focus-visible { outline: 2px solid #4c8dff; outline-offset: 2px; }
.gf-sheet-art {
  position: absolute;
  left: 0;
  top: 0;
  width: 272px;
  height: 184px;
  max-width: none;
  object-fit: cover;
  transition: opacity .9s var(--gf-ease), filter .9s var(--gf-ease);
}
canvas.gf-sheet-art { opacity: 0; filter: blur(10px); }
canvas.gf-sheet-art[data-ready] { opacity: 1; filter: none; }
.gf-sheet--art::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(0, 0, 0, .42) 0%, rgba(0, 0, 0, 0) 34%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
  pointer-events: none;
}
.gf-sheet-head {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 11px;
  z-index: 1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  white-space: nowrap;
}
.gf-sheet-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
  font-weight: 560;
  letter-spacing: -.005em;
  color: #18181b;
}
.gf-sheet-meta {
  flex: none;
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: .02em;
  color: rgba(24, 24, 27, .5);
}
.gf-root[data-tone="dark"] .gf-sheet-name, .gf-sheet--art .gf-sheet-name { color: #fafafa; }
.gf-root[data-tone="dark"] .gf-sheet-meta, .gf-sheet--art .gf-sheet-meta { color: rgba(250, 250, 250, .66); }
.gf-lines {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 40px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.gf-lines i {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: rgba(24, 24, 27, .08);
}
.gf-lines i:first-child { height: 9px; margin-bottom: 4px; background: rgba(24, 24, 27, .14); }
.gf-root[data-tone="dark"] .gf-lines i { background: rgba(255, 255, 255, .08); }
.gf-root[data-tone="dark"] .gf-lines i:first-child { background: rgba(255, 255, 255, .16); }

.gf-sheet--drop { animation: gf-drop .85s var(--gf-ease) both; }
@keyframes gf-drop {
  0% { translate: 0 -190px; rotate: -9deg; opacity: 0; }
  35% { opacity: 1; }
  72% { translate: 0 10px; rotate: 1deg; }
  100% { translate: 0 0; rotate: 0deg; opacity: 1; }
}

/* ---- front glass ----------------------------------------------------------- */
.gf-front {
  position: absolute;
  left: 0;
  top: 74px;
  width: 340px;
  height: 198px;
  z-index: 10;
  -webkit-backdrop-filter: blur(22px) saturate(1.5);
  backdrop-filter: blur(22px) saturate(1.5);
  transform-origin: 50% 100%;
  transform: perspective(760px) rotateX(var(--gf-hinge));
  transition: transform .8s var(--gf-spring), translate 1s var(--gf-ease), opacity 1s var(--gf-ease);
}
.gf-front--bump { animation: gf-bump .7s var(--gf-ease) .38s both; }
@keyframes gf-bump {
  0% { scale: 1; }
  35% { scale: 1.018 .975; }
  70% { scale: .996 1.006; }
  100% { scale: 1; }
}
.gf-tint {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .5) 42%, rgba(252, 252, 252, .93) 100%);
}
.gf-root[data-tone="dark"] .gf-tint {
  background: linear-gradient(180deg, rgba(18, 18, 20, .18) 0%, rgba(14, 14, 16, .62) 46%, rgba(8, 8, 10, .94) 100%);
}
.gf-spec {
  position: absolute;
  inset: 0;
  background: radial-gradient(260px 200px at calc(50% + var(--gf-px) * 46%) calc(30% + var(--gf-py) * 40%), rgba(255, 255, 255, .5), rgba(255, 255, 255, 0) 70%);
  mix-blend-mode: soft-light;
  opacity: .9;
  transition: background-position .6s var(--gf-ease);
  pointer-events: none;
}
.gf-root[data-tone="dark"] .gf-spec { mix-blend-mode: screen; opacity: .16; }
.gf-front-rim { width: 340px; height: 198px; }
.gf-front-rim path { stroke-width: 2.4; transition: stroke-width .3s var(--gf-ease); }
.gf-root[data-tone="dark"] .gf-front-rim { opacity: .55; }

.gf-hit {
  all: unset;
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: pointer;
}
.gf-hit:focus-visible ~ .gf-label .gf-title { text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }
.gf-front:has(.gf-hit:focus-visible) .gf-front-rim path { stroke-width: 5; }

.gf-label {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 200px;
  pointer-events: none;
  color: var(--gf-ink);
}
.gf-root[data-place="bottom-left"] .gf-label { left: 28px; bottom: 32px; }
.gf-root[data-place="top-left"] .gf-label { left: 28px; top: 34px; }
.gf-root[data-place="top-right"] .gf-label { right: 32px; top: 52px; align-items: flex-start; }
.gf-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -.012em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gf-meta {
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  letter-spacing: .03em;
  color: var(--gf-ink-soft);
  white-space: nowrap;
  animation: gf-roll .5s var(--gf-ease) both;
}
@keyframes gf-roll {
  from { opacity: 0; translate: 0 7px; filter: blur(3px); }
  to { opacity: 1; translate: 0 0; filter: blur(0); }
}

/* ---- the key: + or ··· ------------------------------------------------------ */
.gf-key {
  all: unset;
  box-sizing: border-box;
  position: absolute;
  right: 22px;
  bottom: 22px;
  z-index: 12;
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), background .35s var(--gf-ease);
}
.gf-key:hover { transform: translateY(-2px); }
.gf-key:active { transform: translateY(0) scale(.93); transition-duration: .12s; }
.gf-key:focus-visible { outline: 2px solid #4c8dff; outline-offset: 3px; }
.gf-key--add {
  color: #fff;
  background: radial-gradient(120% 90% at 50% 0%, #3a3a3f 0%, #121214 55%, #050506 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .22),
    inset 0 -3px 8px rgba(0, 0, 0, .7),
    0 0 0 1px rgba(0, 0, 0, .75),
    0 14px 22px -8px rgba(0, 0, 0, .55),
    0 3px 6px -2px rgba(0, 0, 0, .35);
}
.gf-root[data-tone="dark"] .gf-key--add {
  color: #111113;
  background: radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #ececee 55%, #d2d2d6 100%);
  box-shadow: inset 0 1px 0 #fff, inset 0 -3px 8px rgba(0, 0, 0, .14), 0 0 0 1px rgba(0, 0, 0, .4), 0 14px 22px -8px rgba(0, 0, 0, .7);
}
.gf-key--more {
  color: #111113;
  background: linear-gradient(180deg, rgba(255, 255, 255, .92) 0%, rgba(226, 226, 230, .82) 100%);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow:
    inset 0 1px 0 #fff,
    inset 0 -2px 4px rgba(0, 0, 0, .06),
    0 0 0 1px rgba(0, 0, 0, .16),
    0 10px 18px -8px rgba(0, 0, 0, .3);
}
.gf-root[data-tone="dark"] .gf-key--more {
  color: #f5f5f7;
  background: linear-gradient(180deg, rgba(255, 255, 255, .16) 0%, rgba(255, 255, 255, .06) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .22), 0 0 0 1px rgba(255, 255, 255, .1), 0 10px 18px -8px rgba(0, 0, 0, .6);
}
.gf-key--more[aria-expanded="true"] { transform: scale(.96); }
.gf-glyph { display: block; max-width: none; fill: none; stroke: currentColor; stroke-linecap: round; }
.gf-glyph--plus { width: 26px; height: 26px; stroke-width: 1.6; animation: gf-turn .6s var(--gf-spring); }
.gf-glyph--more { width: 30px; height: 12px; stroke-width: 1.7; }
@keyframes gf-turn { from { rotate: -90deg; } to { rotate: 0deg; } }

/* ---- menu ------------------------------------------------------------------- */
.gf-menu {
  position: absolute;
  right: 22px;
  bottom: 90px;
  z-index: 20;
  min-width: 176px;
  padding: 6px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  background: rgba(252, 252, 253, .72);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  backdrop-filter: blur(24px) saturate(1.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 0 0 .5px rgba(0, 0, 0, .14), 0 24px 48px -16px rgba(10, 12, 20, .4);
  transform-origin: 100% 100%;
  opacity: 0;
  visibility: hidden;
  transform: translateY(6px) scale(.94);
  transition: opacity .2s var(--gf-ease), transform .32s var(--gf-spring), visibility 0s .32s;
}
.gf-menu[data-open] { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
.gf-root[data-tone="dark"] .gf-menu { background: rgba(30, 30, 34, .72); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 0 0 .5px rgba(255, 255, 255, .1), 0 24px 48px -16px rgba(0, 0, 0, .8); }
.gf-menu-item {
  all: unset;
  box-sizing: border-box;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 450;
  color: #18181b;
  cursor: pointer;
}
.gf-root[data-tone="dark"] .gf-menu-item { color: #f4f4f5; }
.gf-menu-item:hover, .gf-menu-item:focus-visible { background: rgba(24, 24, 27, .07); }
.gf-root[data-tone="dark"] .gf-menu-item:hover, .gf-root[data-tone="dark"] .gf-menu-item:focus-visible { background: rgba(255, 255, 255, .09); }
.gf-menu-item--danger { color: #d92d20; }
.gf-root[data-tone="dark"] .gf-menu-item--danger { color: #ff6b5e; }

/* ---- entrance: the folder assembles itself ---------------------------------- */
.gf-root:not([data-entered]) .gf-back,
.gf-root:not([data-entered]) .gf-back-rim { translate: 0 22px; opacity: 0; }
.gf-root:not([data-entered]) .gf-sheet { translate: 0 -120px; opacity: 0; }
.gf-root:not([data-entered]) .gf-front { translate: 0 46px; opacity: 0; }
.gf-root:not([data-entered]) .gf-key { opacity: 0; scale: .6; }
.gf-root:not([data-entered]) .gf-shadow { opacity: 0; }
.gf-back, .gf-back-rim { transition: translate 1s var(--gf-ease), opacity .9s var(--gf-ease); }
.gf-root[data-entered] .gf-sheet { transition-delay: calc(var(--gf-depth) * 40ms), 0s, calc(.18s + var(--gf-depth) * 90ms), calc(.18s + var(--gf-depth) * 90ms); }
.gf-root[data-entered] .gf-front { transition-delay: 0s, .42s, .42s; }
.gf-key { transition: transform .35s var(--gf-spring), box-shadow .35s var(--gf-ease), opacity .6s var(--gf-ease) .7s, scale .7s var(--gf-spring) .7s; }

@media (prefers-reduced-motion: reduce) {
  .gf-root *, .gf-root *::before, .gf-root *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
  .gf-tilt { transform: none; }
}
`,L={...f,pageTitle:`Design details — Metorom`,pageDescription:`A closer look at Metorom’s horn, paired midrange drivers, and bass cabinet through renders and assembly studies.`,heroTitle:`Details of design`,openingBody:`A form shaped around each driver. Explore the parts, their purpose, and the assembly behind them.`,contentsLabel:`Explore the design`,folderMeta:`Function · Design · Materials`,openFolder:`Open design folder:`,closeFolder:`Close design folder:`,folderContents:`Design notes for`,functionLabel:`Function`,detailLabel:`Design details`,materialsLabel:`Materials & finish`,materialLabel:`Material`,materialsBody:`The main and midrange structures use MDF. The horn is made from locally sourced Japanese wood. Each is sealed, primed, painted, and clear-coated.`,renderLabel:`Front render`,drawingLabel:`Exploded assembly study`,renderAlt:`Front render of the Metorom loudspeaker with two circular midrange enclosures, a central horn, and the bass cabinet below.`,drawingAlt:`Supplied exploded mechanical study of the Metorom loudspeaker assembly.`,drawingNote:`Assembly studies show the design intent; they are not final fabrication drawings.`,hornTitle:`The horn`,hornPart:`BMS 4540ND + horn`,hornFunction:`The compression driver and horn handle the high frequencies, guiding their sound into the listening space.`,hornDetail:`The horn sits between the two midrange enclosures. Its flared opening gives the high-frequency section its own distinct form within the system.`,hornMaterial:`Locally sourced Japanese wood, sealed, primed, painted, and clear-coated.`,hornDrawing:`Horn assembly study`,hornDrawingAlt:`Line drawing from the supplied horn design proposal, showing the horn, support, bolts, and inserts in an exploded assembly.`,hornDownload:`View horn design proposal`,midTitle:`The midrange pair`,midPart:`2 × Alpha 6A · parallel`,midFunction:`Two Alpha 6A drivers carry the midrange, where voices and many instruments sit. The pair is wired in parallel.`,midDetail:`Each driver has its own enclosure. The separate forms make their role visible and are intended to limit the mechanical interaction associated with a shared cabinet.`,midMaterial:`MDF structure, sealed, primed, painted, and clear-coated.`,bassTitle:`The bass cabinet`,bassPart:`1 × LAB 12`,bassFunction:`The LAB 12 handles the low frequencies from its dedicated cabinet beneath the horn and midrange pair.`,bassDetail:`The lower cabinet anchors the assembly. Keeping the bass section separate allows its enclosure to be considered independently of the midrange and horn.`,bassMaterial:`MDF main structure, sealed, primed, painted, and clear-coated.`,tuningTitle:`A system you can tune`,tuningBody:`Integrated amplification and DSP bring the parts together. Crossover, equalization, and delay can be adjusted to suit the setup, the room, and how you listen.`,specificationLink:`Specifications & measurements`,philosophyLink:`Read our philosophy`,footerTag:`INDEPENDENT AUDIO DESIGN / KYOTO`,footerBack:`BACK TO THE STUDY`,footerBackAria:`Back to the Metorom study`},R={...u,pageTitle:`デザインの詳細 — Metorom`,pageDescription:`レンダリングと組立検討図から、Metoromのホーン、2基の中域ドライバー、低域キャビネットを詳しく見ていきます。`,heroTitle:`デザインの詳細`,openingBody:`一つひとつのドライバーから考えたかたち。各部の役割と、その構成を見ていきます。`,contentsLabel:`デザインを見る`,folderMeta:`機能・デザイン・素材`,openFolder:`設計フォルダーを開く：`,closeFolder:`設計フォルダーを閉じる：`,folderContents:`設計ノート：`,functionLabel:`機能`,detailLabel:`デザインの詳細`,materialsLabel:`素材と仕上げ`,materialLabel:`素材`,materialsBody:`本体と中域の構造にはMDFを使用し、ホーンには日本で地元調達した木材を使用しています。いずれもシーラー処理、下塗り、塗装、クリアコートで仕上げます。`,renderLabel:`正面レンダリング`,drawingLabel:`分解組立検討図`,renderAlt:`2基の円形中域エンクロージャー、中央のホーン、下部の低域キャビネットからなるMetoromスピーカーの正面レンダリング。`,drawingAlt:`Metoromスピーカーの構成を示す、提供された分解組立検討図。`,drawingNote:`組立検討図は設計の考え方を示すもので、最終的な製作用図面ではありません。`,hornTitle:`ホーン`,hornPart:`BMS 4540ND ＋ ホーン`,hornFunction:`コンプレッションドライバーとホーンが高域を担い、その音をリスニング空間へ導きます。`,hornDetail:`ホーンは2基の中域エンクロージャーの間に配置されています。広がりを持つ開口部が、高域セクション独自のかたちをつくります。`,hornMaterial:`日本で地元調達した木材。シーラー処理、下塗り、塗装、クリアコートで仕上げます。`,hornDrawing:`ホーンの組立検討図`,hornDrawingAlt:`提供されたホーン設計提案の線画。ホーン、支持部、ボルト、インサートを分解した構成を示しています。`,hornDownload:`ホーン設計提案を見る`,midTitle:`2基の中域ドライバー`,midPart:`Alpha 6A × 2・並列接続`,midFunction:`2基のAlpha 6Aが、声や多くの楽器が含まれる中域を担います。2基は並列に接続されています。`,midDetail:`各ドライバーは独立したエンクロージャーに収められています。役割をかたちに表すとともに、共通キャビネットを介した機械的な相互作用を抑えることを意図しています。`,midMaterial:`MDFの構造。シーラー処理、下塗り、塗装、クリアコートで仕上げます。`,bassTitle:`低域キャビネット`,bassPart:`LAB 12 × 1`,bassFunction:`LAB 12が、ホーンと中域ドライバーの下にある専用キャビネットから低域を担います。`,bassDetail:`下部キャビネットが全体の構成を支えます。低域を分けることで、中域やホーンとは独立してエンクロージャーを検討できます。`,bassMaterial:`本体の構造にはMDFを使用。シーラー処理、下塗り、塗装、クリアコートで仕上げます。`,tuningTitle:`音を調整できるシステム`,tuningBody:`一体型アンプとDSPが各部を一つのシステムにまとめます。クロスオーバー、イコライザー、ディレイを調整し、設置環境や部屋、聴き方に合わせて音を整えられます。`,specificationLink:`仕様と測定`,philosophyLink:`私たちの設計思想`,footerTag:`独立系オーディオデザイン / 京都`,footerBack:`サイトに戻る`,footerBackAria:`Metoromのサイトに戻る`},z={render:`/Metorom/images/concepts/speaker-interactive-front-v3.webp`,assembly:`/Metorom/images/concepts/speaker-exploded-study-v3.webp`,horn:`/Metorom/images/concepts/horn-assembly-study-v3.webp`,proposal:`/Metorom/drawings/horn-design-proposal.pdf`};function B(){let[e,t,n]=d(`design`,L,R),[s]=r();(0,y.useEffect)(()=>{document.title=e.pageTitle,document.querySelector(`meta[name="description"]`)?.setAttribute(`content`,e.pageDescription)},[e.pageTitle,e.pageDescription]);let c=[{id:`horn`,title:e.hornTitle,part:e.hornPart,body:e.hornFunction,detail:e.hornDetail,material:e.hornMaterial,drawing:z.horn,drawingAlt:e.hornDrawingAlt,caption:e.hornDrawing},{id:`midrange`,title:e.midTitle,part:e.midPart,body:e.midFunction,detail:e.midDetail,material:e.midMaterial,drawing:z.assembly,drawingAlt:e.drawingAlt,caption:e.drawingLabel},{id:`bass`,title:e.bassTitle,part:e.bassPart,body:e.bassFunction,detail:e.bassDetail,material:e.bassMaterial,drawing:z.assembly,drawingAlt:e.drawingAlt,caption:e.drawingLabel}];return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(o,{contact:!0,copy:e}),(0,b.jsxs)(`main`,{id:`main`,className:`sc-design`,children:[(0,b.jsxs)(`section`,{id:`top`,className:`sc-design-opening`,"aria-labelledby":`sc-design-title`,children:[(0,b.jsx)(`h1`,{id:`sc-design-title`,children:e.heroTitle}),(0,b.jsx)(`p`,{children:e.openingBody}),(0,b.jsxs)(`nav`,{className:`sc-design-contents`,"aria-label":e.contentsLabel,children:[c.map(e=>(0,b.jsxs)(`a`,{href:`#${e.id}`,children:[e.title,(0,b.jsx)(h,{size:15,"aria-hidden":`true`})]},e.id)),(0,b.jsxs)(`a`,{href:`#materials`,children:[e.materialsLabel,(0,b.jsx)(h,{size:15,"aria-hidden":`true`})]})]}),(0,b.jsx)(`div`,{className:`sc-design-folders`,children:c.map(t=>(0,b.jsx)(`div`,{className:`sc-design-folder`,children:(0,b.jsx)(I,{label:t.title,meta:e.folderMeta,width:280,tone:`dark`,art:`none`,image:z.render,action:`none`,appear:!1,openHeadroom:130,openLabel:`${e.openFolder} ${t.title}`,closeLabel:`${e.closeFolder} ${t.title}`,contentsLabel:`${e.folderContents} ${t.title}`,files:[{name:e.functionLabel,image:z.render,href:`#${t.id}-function`},{name:e.detailLabel,image:t.drawing,href:`#${t.id}-design`},{name:e.materialLabel,image:z.assembly,href:`#${t.id}-materials`}]})},`${s}-${t.id}`))})]}),c.map(t=>(0,b.jsxs)(`section`,{className:`sc-design-part sc-design-part--${t.id}`,id:t.id,"aria-labelledby":`${t.id}-title`,children:[(0,b.jsxs)(`div`,{className:`sc-design-part__copy`,children:[(0,b.jsx)(`h2`,{id:`${t.id}-title`,children:t.title}),(0,b.jsx)(`p`,{className:`sc-design-part__model`,children:t.part}),(0,b.jsxs)(`div`,{id:`${t.id}-function`,className:`sc-design-note`,children:[(0,b.jsx)(`h3`,{children:e.functionLabel}),(0,b.jsx)(`p`,{children:t.body})]}),(0,b.jsxs)(`div`,{id:`${t.id}-design`,className:`sc-design-note`,children:[(0,b.jsx)(`h3`,{children:e.detailLabel}),(0,b.jsx)(`p`,{children:t.detail})]}),(0,b.jsxs)(`div`,{id:`${t.id}-materials`,className:`sc-design-note`,children:[(0,b.jsx)(`h3`,{children:e.materialLabel}),(0,b.jsx)(`p`,{children:t.material})]}),t.id===`horn`&&(0,b.jsxs)(`a`,{className:`sc-design-download`,href:z.proposal,target:`_blank`,rel:`noreferrer`,children:[e.hornDownload,(0,b.jsx)(_,{size:17,"aria-hidden":`true`}),(0,b.jsx)(`span`,{children:`PDF`})]})]}),(0,b.jsxs)(`div`,{className:`sc-design-part__views`,children:[(0,b.jsxs)(`figure`,{className:`sc-design-render sc-design-render--${t.id}`,children:[(0,b.jsx)(`div`,{children:(0,b.jsx)(`img`,{src:z.render,alt:e.renderAlt,loading:`lazy`,width:`1600`,height:`1600`})}),(0,b.jsx)(`figcaption`,{children:e.renderLabel})]}),(0,b.jsxs)(`figure`,{className:`sc-design-drawing`,children:[(0,b.jsx)(`img`,{src:t.drawing,alt:t.drawingAlt,loading:`lazy`,width:`710`,height:`1000`}),(0,b.jsx)(`figcaption`,{children:t.caption})]})]})]},t.id)),(0,b.jsxs)(`section`,{className:`sc-design-closing`,"aria-labelledby":`sc-design-tuning`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{id:`sc-design-tuning`,children:e.tuningTitle}),(0,b.jsx)(`p`,{children:e.tuningBody})]}),(0,b.jsxs)(`div`,{id:`materials`,children:[(0,b.jsx)(`h2`,{children:e.materialsLabel}),(0,b.jsx)(`p`,{children:e.materialsBody}),(0,b.jsx)(`p`,{className:`sc-design-study-note`,children:e.drawingNote})]}),(0,b.jsxs)(`nav`,{"aria-label":e.contentsLabel,className:`sc-design-next`,children:[(0,b.jsxs)(`a`,{className:`sc-outline-link`,href:i(`./specifications.html`),children:[e.specificationLink,(0,b.jsx)(l,{size:17,"aria-hidden":`true`})]}),(0,b.jsxs)(`a`,{className:`sc-design-text-link`,href:i(`./philosophy.html`),children:[e.philosophyLink,(0,b.jsx)(l,{size:17,"aria-hidden":`true`})]})]})]})]}),(0,b.jsx)(a,{copy:e,backToStudy:!0}),(0,b.jsx)(p,{page:`design`,settings:t,onChange:n,english:L,japanese:R})]})}var V=document.getElementById(`root`);if(!V)throw Error(`Metorom design root element is missing`);(0,v.createRoot)(V).render((0,b.jsx)(B,{}));