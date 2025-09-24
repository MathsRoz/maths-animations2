let dragging1 = false, dragging2 = false;
let hover1 = false, hover2 = false;
let hoversize = 15 / zoom;

let img;
let t = 0;
let playing = false;
let maxT = 200;
let pathPoints = [];
let playBtn, resetBtn, secBtn; // ✅ bouton sécante
let inputFunc = "3.42*x*x/1000";
let showSecante = false;
let setupab = false;
let labelVitesse;

let a, b, fa, fb, vitesse; // ✅ valeurs de la sécante

function preload() {
  img = loadImage('/images/fusee_logo.png');
}

function setup() {
  preambuleSetup();

  let cont = createDiv();
  cont.style("display", "flex");
  cont.style("gap", "10px");
  cont.style("justify-content", "center");



  // ✅ Conteneur boutons centré en haut
  let container = createDiv();
  container.style("display", "flex");
  container.style("flex-direction", "row");
  container.style("flex-wrap", "wrap");
  container.style("gap", "10px");
  container.style("justify-content", "center");
  container.style("position", "fixed");   // reste fixé même si tu scroll
  container.style("top", "20px");         // marge du haut
  container.style("left", "50%");         // centre horizontal
  container.style("transform", "translateX(-50%)"); // correction pour bien centrer
  container.parent(cont);

  // ✅ Bouton Play/Pause
  playBtn = createButton("▶ Play");
  playBtn.class("p5btn");
  playBtn.mousePressed(togglePlay);
  playBtn.parent(container);

  // ✅ Bouton Reset
  resetBtn = createButton("🔄 Reset");
  resetBtn.class("p5btn");
  resetBtn.mousePressed(resetAnimation);
  resetBtn.parent(container);

  // ✅ Bouton Sécante
  secBtn = createButton("📐 Sécante OFF");
  secBtn.class("p5btn");
  secBtn.mousePressed(toggleSecante);
  secBtn.parent(container);

  // Points initiaux
  let expr = inputFunc;
  p1 = createVector(-1, evalFunction(expr, -1));
  p2 = createVector(2, evalFunction(expr, 2));

  panX = -windowWidth / 2 + 100;
  panY = windowHeight / 2 - 100;
  inputX.value("s");
  inputY.value("km");
  zoom = 5;
  
  labelVitesse = createSpan("");
  labelVitesse.style("flex-shrink", "0");
  labelVitesse.class("slider-label");
  labelVitesse.style("display", "flex");
  labelVitesse.style("flex-direction", "row");
  labelVitesse.style("flex-wrap", "wrap");
  labelVitesse.style("gap", "10px");
  labelVitesse.style("justify-content", "center");
  labelVitesse.style("position", "fixed");   // reste fixé même si tu scroll
  labelVitesse.style("top", "80px");         // marge du haut
  labelVitesse.style("left", "50%");         // centre horizontal
  labelVitesse.style("transform", "translateX(-50%)");
  labelVitesse.parent(cont);
}



function draw() {
  preambuleDraw();

  let expr = inputFunc;

  if (playing) {
    t += 0.4;
    if (t > maxT) {
      playing = false;
      playBtn.html("▶ Play");
    } else {
      let y = evalFunction(expr, t);
      pathPoints.push(createVector(t, y));
    }
  }

  // Tracer la trajectoire
  stroke(red);
  strokeWeight(linesize);
  noFill();
  beginShape();
  for (let v of pathPoints) vertex(v.x, v.y);
  endShape();

  // Dessiner la fusée
  if (pathPoints.length > 0) {
    let pos = pathPoints[pathPoints.length - 1];
    drawingContext.setLineDash([linesize, linesize * 2]);
    stroke(orange);
    line(pos.x, pos.y, windowWidth / (2 * zoom) - panX / zoom - linesize * 30, pos.y);
    drawingContext.setLineDash([]);
    push();
    scale(1, -1);
    imageMode(CENTER);
    image(img, windowWidth / (2 * zoom) - panX / zoom - linesize * 30, -pos.y - linesize * 12, linesize * 40, linesize * 40);
    pop();
  } else {
    // Position de départ
    push();
    scale(1, -1);
    imageMode(CENTER);
    image(img, windowWidth / (2 * zoom) - panX / zoom - linesize * 30, -linesize * 12, linesize * 40, linesize * 40);
    pop();
  }

  // ✅ Tracer la sécante si activée
  drawSec(expr);

  hover();
  deplaceab();
}

// =======================
// 🚀 Contrôles
// =======================
function togglePlay() {
  playing = !playing;
  playBtn.html(playing ? "⏸ Pause" : "▶ Play");
}

function resetAnimation() {
  playing = false;
  t = 0;
  pathPoints = [];
  playBtn.html("▶ Play");
  setupab=false;
  showSecante=false;
  secBtn.html("📐 Sécante OFF");
}

function toggleSecante() {
  showSecante = !showSecante;
  secBtn.html(showSecante ? "📐 Sécante ON" : "📐 Sécante OFF");
  !showSecante ? setupab=false : 4;
}

// =======================
// 📐 Math utils
// =======================
function preprocessExpr(expr) {
  expr = expr.replace(/\s+/g, "");
  if (expr.includes("=")) expr = expr.split("=")[1];
  expr = expr.replace(/\^/g, "**");
  expr = expr.replace(/(\d)([a-zA-Z])/g, "$1*$2");
  expr = expr.replace(/(\d)\(/g, "$1*(");
  expr = expr.replace(/\)(\d)/g, ")*$1");
  expr = expr.replace(/\)([a-zA-Z])/g, ")*$1");
  expr = expr.replace(/\)\(/g, ")*(");
  expr = expr.replace(/\bln\(/g, "log(");
  expr = expr.replace(/\blog10\(/g, "log10(");
  expr = expr.replace(/\blog\(/g, "log10(");
  expr = expr.replace(/\btg\(/g, "tan(");
  expr = expr.replace(/\bctg\(/g, "1/tan(");
  expr = expr.replace(/\bcot\(/g, "1/tan(");
  expr = expr.replace(/\bpi\b/gi, "PI");
  expr = expr.replace(/\be\b/g, "E");
  return expr;
}

function evalFunction(expr, x) {
  try {
    expr = preprocessExpr(expr);
    return Function("x", "with(Math){ return " + expr + "; }")(x);
  } catch (e) {
    console.error("Erreur d'évaluation :", e);
    return NaN;
  }
}

function drawSec(expr) {
  if (!showSecante || pathPoints.length < 2) return;
  if(pathPoints.length > 2 && !setupab ){
  let pos = pathPoints[pathPoints.length - 1];
  a = pos.x / 3;
  b = pos.x * 2 / 3;
  setupab=true;}
  fa = evalFunction(expr, a);
  fb = evalFunction(expr, b);
  vitesse = (fb - fa) / (b - a);

  
  strokeWeight(linesize);
  
  stroke(orange);
  drawingContext.setLineDash([linesize, linesize * 2]);
  line(a, fa, 0, fa);
  line(b,fb,0,fb);
  line(a, fa, a, 0);
  line(b,fb,b,0);
  stroke(vert);
  let min = -(width/2-panX)/(zoom);
  line(min,vitesse*(min-a)+fa,a,fa);
  let max = (width/2-panX)/(zoom);
  line(max,vitesse*(max-b)+fb,b,fb);
  drawingContext.setLineDash([]);
  
  line(a,fa,b,fb);
  showSecante ? labelVitesse.html("vitesse = " +  (fb-fa).toPrecision(4)+"/"+(b-a).toPrecision(4) + " = " + round(vitesse*3600) + " km/h") : labelVitesse.html("") 
}

function hover(){
  let mx = (mouseX - width / 2 - panX) / zoom;
  let my = -(mouseY - height / 2 - panY) / zoom;
  if (abs(mx - a)<linesize*2 && my>-1 && my<fa && showSecante){
    hover1 = true;
  }
  else{
    hover1 = false;
  }
  if (abs(mx - b)<linesize*2 && my>-linesize && my<fb && showSecante){
    hover2 = true;
  }
  else{
    hover2 = false;
  }
}

function deplaceab(){
  
  hover2 || hover1 ? cursor(MOVE) : cursor(ARROW);

}

function mousePressed() {
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  let mx = (mouseX - width / 2 - panX) / zoom;
  let my = -(mouseY - height / 2 - panY) / zoom;

  if (hover1) {
    dragging = false;
    dragging1 = true;
    return;
  }
  if (hover2) {
    dragging = false;
    dragging2 = true;
    return;
  }

  if (menuOn && abs(mouseX - width / 2) < 250 && abs(mouseY - height / 2) < 150) {
    dragging = false;
    return;
  }
  if (mouseX < 280 && mouseY < 100) {
    dragging = false;
    return;
  }

  dragging = true;
}


function mouseDragged() {
  if (dragging) {
    panX += mouseX - lastMouseX;
    panY += mouseY - lastMouseY;
  }

  if (dragging1) {
    a += (mouseX - lastMouseX) / zoom;
  }

  if (dragging2) {
    b += (mouseX - lastMouseX) / zoom;
  }

  // ✅ Mise à jour une seule fois à la fin
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  a<0 ? a=0 : a=a;
  b<0 ? b=0 : b=b;
}

function mouseReleased() {
  dragging = false;
  dragging1 = false;
  dragging2 = false;
}