/* ===== Kartu: flip, QR, sparkle, cincin progres, gyro, ledakan sakura ===== */
(()=>{
const inner=$("#inner"),scene=$("#scene"),fbg=document.querySelector(".front .fbg");
for(let i=0;i<3;i++){const k=document.createElement("i");k.className="spk";k.style.cssText=`left:${6+Math.random()*88}%;top:${6+Math.random()*88}%;animation-delay:${Math.random()*2.6}s;animation-duration:${2+Math.random()*2}s`;fbg.appendChild(k)}
/* balik kartu */
let down=null;scene.addEventListener("pointerdown",e=>down=[e.clientX,e.clientY]);
scene.addEventListener("pointerup",e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<8){inner.classList.toggle("flip");say(inner.classList.contains("flip")?"Ini sisi belakang. QR-nya unik buatmu!":"Kartunya kembali ke depan.");jump()}down=null});
scene.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();inner.classList.toggle("flip")}});
/* QR valid versi 1-L, berisi nomor kartu agar dapat dipindai tanpa layanan eksternal. */
function qr(){
  const payload=( $("#cNo").textContent.trim() || "EH-26-0000" ).slice(0,17), n=21;
  const bits=[];const put=(v,len)=>{for(let i=len-1;i>=0;i--)bits.push((v>>>i)&1)};
  put(4,4);put(payload.length,8);for(const ch of payload)put(ch.charCodeAt(0),8);put(0,Math.min(4,152-bits.length));while(bits.length%8)bits.push(0);
  const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|(bits[i+j]||0);data.push(b)}
  for(let pad=0;data.length<19;pad++)data.push(pad%2?0x11:0xec);
  const gf=(a,b)=>{let r=0;while(b){if(b&1)r^=a;a<<=1;if(a&256)a^=0x11d;b>>=1}return r};
  let gen=[1],root=1;for(let i=0;i<7;i++){const next=Array(gen.length+1).fill(0);gen.forEach((v,j)=>{next[j]^=v;next[j+1]^=gf(v,root)});gen=next;root=gf(root,2)}
  const rem=Array(7).fill(0);for(const b of data){const factor=b^rem.shift();rem.push(0);for(let i=0;i<7;i++)rem[i]^=gf(gen[i+1],factor)}
  const code=[...data,...rem],m=Array.from({length:n},()=>Array(n).fill(null));
  const finder=(x,y)=>{for(let dy=-1;dy<=7;dy++)for(let dx=-1;dx<=7;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=n||yy<0||yy>=n)continue;m[yy][xx]=dx>=0&&dx<=6&&dy>=0&&dy<=6&&(dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4))}};
  finder(0,0);finder(n-7,0);finder(0,n-7);
  for(let i=8;i<n-8;i++){m[6][i]=i%2===0;m[i][6]=i%2===0}
  // Format information for error correction L and mask 0.
  let fmt=8, remFmt=fmt<<10;for(let i=14;i>=10;i--)if((remFmt>>>i)&1)remFmt^=0x537<<(i-10);fmt=((fmt<<10)|remFmt)^0x5412;
  for(let i=0;i<15;i++){const bit=((fmt>>>i)&1)!==0;
    if(i<6)m[i][8]=bit;else if(i<8)m[i+1][8]=bit;else m[n-15+i][8]=bit;
    if(i<8)m[8][n-i-1]=bit;else if(i<9)m[8][15-i]=bit;else m[8][14-i]=bit;
  }
  m[n-8][8]=true;
  let bitIndex=0,up=true;for(let right=n-1;right>=1;right-=2){if(right===6)right--;for(let vert=0;vert<n;vert++){const y=up?n-1-vert:vert;for(let j=0;j<2;j++){const x=right-j;if(m[y][x]!==null)continue;const v=bitIndex<code.length*8?((code[bitIndex>>>3]>>>(7-(bitIndex&7)))&1)!==0:false;bitIndex++;m[y][x]=v^((x+y)%2===0)}}up=!up}
  let o="";for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(m[y][x])o+=`<rect x="${x}" y="${y}" width="1" height="1"/>`;
  $("#qr").innerHTML=`<svg viewBox="-2 -2 25 25" role="img" aria-label="QR code untuk nomor kartu ${payload}" fill="#2a0f25" shape-rendering="crispEdges">${o}</svg>`;
  $("#bNm").textContent=$("#cNm").textContent;$("#bNo").textContent=$("#cNo").textContent}
const _b=barcode;barcode=function(){_b();qr()};barcode();
new MutationObserver(qr).observe($("#cNo"),{childList:true,characterData:true,subtree:true});
/* cincin progres di foto */

const _p=progress;progress=function(){const n=_p();idc.style.setProperty("--p",n*100/TOTAL+"%");return n};progress();
/* watermark emoji ekskul */
f.k.addEventListener("change",()=>{const w=$("#cWm");w.textContent=EK[f.k.value][0];w.style.transform="scale(1.3) rotate(-10deg)";setTimeout(()=>w.style.transform="",400)});
panel.addEventListener("reset",()=>setTimeout(()=>{$("#cWm").textContent="🌸";inner.classList.remove("flip")},0));
/* spotlight panel & animasi masuk berurutan */
panel.addEventListener("pointermove",e=>{const r=panel.getBoundingClientRect();panel.style.setProperty("--px",e.clientX-r.left+"px");panel.style.setProperty("--py",e.clientY-r.top+"px")});
[...panel.children].forEach((c,i)=>c.style.setProperty("--i",i));
/* gyro di HP: kartu ikut miring */
function gyro(e){if(e.gamma==null)return;const x=Math.max(-1,Math.min(1,e.gamma/30)),y=Math.max(-1,Math.min(1,(e.beta-45)/30));window.__g={x,y};window.__gt=performance.now()}
if(matchMedia("(hover:none)").matches&&window.DeviceOrientationEvent){
  if(DeviceOrientationEvent.requestPermission)scene.addEventListener("click",()=>{DeviceOrientationEvent.requestPermission().then(r=>{if(r==="granted")addEventListener("deviceorientation",gyro)}).catch(()=>{})},{once:true});
  else addEventListener("deviceorientation",gyro)}
/* ledakan kelopak saat TERDAFTAR */
new MutationObserver(()=>{if(scene.classList.contains("done"))window.sakuraBurst&&window.sakuraBurst()}).observe(scene,{attributes:true,attributeFilter:["class"]});
})();
