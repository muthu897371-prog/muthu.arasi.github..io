const $ = (id) => document.getElementById(id);
const form = $("designForm");
const defaults = {airfoil:"2412",span:10,chord:1.2,speed:50,aoa:4,density:1.225};
let lastDesign = null;

function getInputs() {
  return {
    airfoil: $("airfoil").value,
    span: Number($("span").value),
    chord: Number($("chord").value),
    speed: Number($("speed").value),
    aoa: Number($("aoa").value),
    density: Number($("density").value)
  };
}
function valid(d) {
  return Number.isFinite(d.span) && d.span >= 2 && d.span <= 40 &&
    Number.isFinite(d.chord) && d.chord >= .3 && d.chord <= 5 &&
    Number.isFinite(d.speed) && d.speed >= 10 && d.speed <= 150 &&
    Number.isFinite(d.aoa) && d.aoa >= -4 && d.aoa <= 12;
}
// A deliberately simplified teaching model, not XFOIL/CFD data.
// It gives plausible trends for a classroom interface, not design-grade predictions.
function estimate(d, angle = d.aoa) {
  const camberLift = {"0012":0, "2412":0.20, "4412":0.40, "23012":0.25}[d.airfoil];
  const alphaRad = angle * Math.PI / 180;
  const aspectRatio = (d.span * d.span) / (d.span * d.chord);
  const cl = Math.max(-0.35, Math.min(1.45, 0.105 * (angle + camberLift * 10)));
  const induced = (cl * cl) / (Math.PI * Math.max(2, aspectRatio) * 0.8);
  const cd = 0.012 + 0.018 * cl * cl + induced + Math.max(0, Math.abs(angle) - 8) * 0.002;
  const ld = cd > 0 ? cl / cd : 0;
  const area = d.span * d.chord;
  const q = 0.5 * d.density * d.speed * d.speed;
  const lift = q * area * cl;
  return {cl, cd, ld, lift, area, aspectRatio, alphaRad};
}
function fmt(n, digits=2) { return Number.isFinite(n) ? n.toFixed(digits) : "—"; }
function drawChart(d) {
  const canvas = $("performanceChart"), ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect(), ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(300, rect.width * ratio); canvas.height = 260 * ratio;
  ctx.scale(ratio, ratio);
  const w = canvas.width / ratio, h = 260, pad = {l:45,r:18,t:18,b:35};
  const values = [];
  for(let a=-2;a<=12;a+=0.5) values.push({a,ld:estimate(d,a).ld});
  const maxY = Math.max(10, ...values.map(v=>v.ld))*1.12;
  ctx.clearRect(0,0,w,h); ctx.font="10px Manrope"; ctx.strokeStyle="#e3ecea"; ctx.fillStyle="#70858a";
  for(let i=0;i<=4;i++){const y=pad.t+(h-pad.t-pad.b)*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();ctx.fillText(fmt(maxY*(1-i/4),0),7,y+3);}
  ctx.strokeStyle="#b7c9c6";ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,h-pad.b);ctx.lineTo(w-pad.r,h-pad.b);ctx.stroke();
  const x=a=>pad.l+(a+2)/14*(w-pad.l-pad.r), y=v=>h-pad.b-(v/maxY)*(h-pad.t-pad.b);
  ctx.strokeStyle="#087f83";ctx.lineWidth=2.5;ctx.beginPath();
  values.forEach((v,i)=>i?ctx.lineTo(x(v.a),y(v.ld)):ctx.moveTo(x(v.a),y(v.ld)));ctx.stroke();
  ctx.fillStyle="#70858a";ctx.textAlign="center";[-2,0,2,4,6,8,10,12].forEach(a=>ctx.fillText(a+"°",x(a),h-12));
  const current=estimate(d);ctx.fillStyle="#087f83";ctx.beginPath();ctx.arc(x(d.aoa),y(current.ld),5,0,Math.PI*2);ctx.fill();
}
function analyze(d) {
  const r=estimate(d);
  $("clValue").textContent=fmt(r.cl,3);$("cdValue").textContent=fmt(r.cd,4);
  $("ldValue").textContent=fmt(r.ld,2);$("liftValue").textContent=fmt(r.lift,0)+" N";
  $("areaValue").textContent=fmt(r.area,2)+" m²";$("arValue").textContent=fmt(r.aspectRatio,2);
  $("spanSvg").textContent=fmt(d.span,1);$("densityValue").textContent=fmt(d.density,3)+" kg/m³";
  $("updatedLabel").textContent="Updated just now";$("formMessage").textContent="Analysis complete using the simplified educational model.";
  lastDesign=d;drawChart(d);
}
form.addEventListener("submit", e=>{e.preventDefault();const d=getInputs();if(!valid(d)){ $("formMessage").textContent="Please enter values within the displayed ranges.";return;}analyze(d);});
["span","chord","speed","aoa","airfoil","density"].forEach(id=>$(id).addEventListener("input",()=>{
  const d=getInputs();$("spanSvg").textContent=fmt(d.span,1);
  $("areaValue").textContent=fmt(d.span*d.chord,2)+" m²";
  $("arValue").textContent=fmt(d.span/d.chord,2);
  $("densityValue").textContent=fmt(d.density,3)+" kg/m³";
}));
$("optimizeBtn").addEventListener("click",()=>{
  const d=getInputs();if(!valid(d)){ $("formMessage").textContent="Please correct the input values first.";return;}
  let best={angle:d.aoa,...estimate(d,d.aoa)};
  for(let a=-2;a<=12;a+=0.25){const r=estimate(d,a);if(r.ld>best.ld)best={angle:a,...r};}
  $("resultTitle").textContent="Candidate angle of attack: "+fmt(best.angle,2)+"°";
  $("resultDescription").textContent="For the current selected airfoil and geometry, the simplified model found the highest L/D in the searched −2° to 12° range. This is a limited educational search, not a validated optimum.";
  $("bestLd").textContent=fmt(best.ld,2);
  $("aoa").value=fmt(best.angle,2);analyze(getInputs());
});
$("resetBtn").addEventListener("click",()=>{
  Object.entries(defaults).forEach(([k,v])=>$(k).value=v);
  $("resultTitle").textContent="Run “Find better setting” to compare settings";
  $("resultDescription").textContent="The tool will compare a small range of angles of attack for the selected airfoil and geometry.";
  $("bestLd").textContent="—";analyze(getInputs());
});
window.addEventListener("resize",()=>{if(lastDesign)drawChart(lastDesign);});
analyze(getInputs());
