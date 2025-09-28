let inputFunc;

let p1, p2;
let dragging1 = false, dragging2 = false;
let hover1 = false, hover2 = false;
let hoversize = linesize*100;

function setup() {
  // ⚡ Initialise zoom, pan, thème, options, etc.
  preambuleSetup();

  // Conteneur input
  let container = createDiv();
  container.style("display", "flex");
  container.style("align-items", "center");
  container.style("gap", "10px");
  container.position(20, 20);

  // Label f(x)=
  let label = createSpan("f(x) =");
  label.parent(container);
  label.class("slider-label");

  // Zone de saisie
  inputFunc = createInput("x*x");
  inputFunc.parent(container);
  inputFunc.size(200);
  inputFunc.class("func-input");

  // Points initiaux
  let expr = inputFunc.value();
  p1 = createVector(-1, evalFunction(expr, -1));
  p2 = createVector(2, evalFunction(expr, 2));

  gridbox.checked(false);
  unitebox.checked(false);
  panX=0;
  panY=0;

}

function draw() {
  preambuleDraw();

  let expr = inputFunc.value(); // ✅ Calcul une seule fois

  drawFunction(expr);
  updatePoints(expr);
  secante(expr);
  drawPoints();
}

function updatePoints(expr) {
  p1.y = evalFunction(expr, p1.x);
  p2.y = evalFunction(expr, p2.x);
}

function drawPoints() {
  stroke(orange);
  hover();

  hover1 && !hover2 ? strokeWeight(linesize * 5) : strokeWeight(linesize * 3);
  point(p1.x, p1.y);

  hover2  ? strokeWeight(linesize * 5) : strokeWeight(linesize * 3);
  point(p2.x, p2.y);
}

function hover() {
  let mx = (mouseX - width / 2 - panX) / zoom;
  let my = -(mouseY - height / 2 - panY) / zoom;
  hoversize = linesize*5;
  hover1 = dist(mx, my, p1.x, p1.y) < hoversize;
  hover2 = dist(mx, my, p2.x, p2.y) < hoversize;
  hover1 || hover2 ? cursor(MOVE): cursor(ARROW) ;
}

function secante(expr) {
  strokeWeight(linesize);
  stroke(orange);

  let x1 = -(width / 2 + panX) / zoom;
  let x2 = (width / 2 - panX) / zoom;

  let dx = p2.x - p1.x;
  if (abs(dx) < 1e-6) return; // ✅ éviter les pentes infinies

  let slopeSec = (p2.y - p1.y) / dx;
  let y1 = p1.y + slopeSec * (x1 - p1.x);
  let y2 = p1.y + slopeSec * (x2 - p1.x);
  line(x1, y1, x2, y2);
}

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

  const functions = [
    "sin", "cos", "tan", "log", "log10", "sqrt", "abs", "exp",
    "asin", "acos", "atan", "sinh", "cosh", "tanh"
  ];
  for (let fn of functions) {
    expr = expr.replace(new RegExp(fn + "\\*\\(", "g"), fn + "(");
  }

  let open = (expr.match(/\(/g) || []).length;
  let close = (expr.match(/\)/g) || []).length;
  if (open > close) expr += ")".repeat(open - close);

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

function drawFunction(expr) {
  strokeWeight(linesize);
  stroke(red);
  noFill();
  beginShape();

  let step = 1 / zoom;
  for (let x = -(width / 2 + panX) / zoom; x < (width / 2 - panX) / zoom; x += step) {
    let y = evalFunction(expr, x);
    if (isFinite(y)) vertex(x, y);
  }

  endShape();
}

// =======================
// 🖱️ INTERACTIONS
// =======================
function mousePressed() {
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  let mx = (mouseX - width / 2 - panX) / zoom;
  let my = -(mouseY - height / 2 - panY) / zoom;
  hoversize = linesize*5;
  if (dist(mx, my, p2.x, p2.y) < hoversize) {
    dragging = false;
    dragging2 = true;
    return;
  }
  if (dist(mx, my, p1.x, p1.y) < hoversize) {
    dragging = false;
    dragging1 = true;
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
    cursor('grab');
  }

  if (dragging1) {
    p1.x += (mouseX - lastMouseX) / zoom;
  }

  if (dragging2) {
    p2.x += (mouseX - lastMouseX) / zoom;
  }

  // ✅ Mise à jour une seule fois à la fin
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  
}

function mouseReleased() {
  dragging = false;
  dragging1 = false;
  dragging2 = false;
  cursor(ARROW);
}
