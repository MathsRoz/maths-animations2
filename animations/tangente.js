let inputFunc;
let exprFunc;

let p1, p2; // deux points sur la courbe
let dragging1 = false, dragging2 = false;
let hover1 = false, hover2 = false;

let panX = 0, panY = 0; // décalage global
let draggingGraph = false;
let lastMouseX, lastMouseY;

let zoom = 80; // valeur initiale du zoom

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Input fonction
  inputFunc = createInput("x*x");
  inputFunc.position(20, 20);
  inputFunc.size(200);
  inputFunc.input(updateFunction);

  updateFunction();

  // Points initiaux
  p1 = createVector(-1, safeEval(-1)); // A
  p2 = createVector(2, safeEval(2));   // B
}

function updateFunction() {
  try {
    let expr = inputFunc.value();
    exprFunc = new Function("x", "with(Math){ return " + expr + "; }");
  } catch (e) {
    exprFunc = (x) => 0;
  }
}

function draw() {
  background(0); // fond noir

  // Système de coordonnées : centre écran + pan + zoom
  translate(width/2 + panX, height/2 + panY);
  scale(1, -1);

  // Axes
  stroke(255);
  strokeWeight(1);
  line(-width, 0, width, 0); // axe x
  line(0, -height, 0, height); // axe y

  // Tracer la courbe
  stroke(255);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let x = -width/zoom; x < width/zoom; x += 0.01) {
    let y = safeEval(x);
    vertex(x * zoom, y * zoom);
  }
  endShape();

  // Mise à jour des points
  p1.y = safeEval(p1.x);
  p2.y = safeEval(p2.x);

  let x1 = -width/zoom, x2 = width/zoom;

// Tangente en A (p1)
stroke('orange');
strokeWeight(3);
drawingContext.setLineDash([6]); // -----> active les pointillés
let h = 0.0001;
let slopeT = (safeEval(p1.x+h) - safeEval(p1.x-h)) / (2*h);
let y1t = p1.y + slopeT * (x1 - p1.x);
let y2t = p1.y + slopeT * (x2 - p1.x);
line(x1*zoom, y1t*zoom, x2*zoom, y2t*zoom);
drawingContext.setLineDash([]); // -----> reset (évite que tout le reste soit en pointillé)

  // Sécante (droite infinie entre A et B)
  stroke("red");
  strokeWeight(3);
  let slopeSec = (p2.y - p1.y) / (p2.x - p1.x + 1e-9);
  let y1 = p1.y + slopeSec * (x1 - p1.x);
  let y2 = p1.y + slopeSec * (x2 - p1.x);
  line(x1*zoom, y1*zoom, x2*zoom, y2*zoom);

  // Détection hover souris (dans repère graphique)
  let mx = (mouseX - width/2 - panX) / zoom;
  let my = -(mouseY - height/2 - panY) / zoom;
  hover1 = dist(mx, my, p1.x, p1.y) < 0.2;
  hover2 = dist(mx, my, p2.x, p2.y) < 0.2;

  // Points rouges (A et B)
  stroke('red');
  strokeWeight(hover1 ? 18 : 12);
  point(p1.x * zoom, p1.y * zoom);

  strokeWeight(hover2 ? 18 : 12);
  point(p2.x * zoom, p2.y * zoom);

  // Étiquettes en blanc
  scale(1, -1);
  fill(255);
  stroke(0);
  strokeWeight(5);
  textSize(20);
  text("A", p1.x*zoom + 10, -p1.y*zoom - 10);
  text("B", p2.x*zoom + 10, -p2.y*zoom - 10);
  scale(1, -1);
}

function mousePressed() {
  let mx = (mouseX - width/2 - panX) / zoom;
  let my = -(mouseY - height/2 - panY) / zoom;

  // Priorité au point le plus proche
  let dA = dist(mx, my, p1.x, p1.y);
  let dB = dist(mx, my, p2.x, p2.y);

  if (dA < 0.2 && dA <= dB) {
    dragging1 = true;
    dragging2 = false;
  } else if (dB < 0.2 && dB < dA) {
    dragging2 = true;
    dragging1 = false;
  } else {
    // sinon → on déplace le graphe entier
    draggingGraph = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseDragged() {
  let mx = (mouseX - width/2 - panX) / zoom;

  if (dragging1) p1.x = mx;
  if (dragging2) p2.x = mx;

  if (draggingGraph) {
    panX += mouseX - lastMouseX;
    panY += mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseReleased() {
  dragging1 = false;
  dragging2 = false;
  draggingGraph = false;
}

function mouseWheel(event) {
  // Coordonnées souris dans le repère actuel
  let worldX = (mouseX - width/2 - panX) / zoom;
  let worldY = -(mouseY - height/2 - panY) / zoom;

  // Nouveau facteur de zoom
  let zoomFactor = 1 - event.delta * 0.001;
  zoom = constrain(zoom * zoomFactor, 20, 500);

  // Ajustement pan pour garder le point sous la souris fixe
  let newScreenX = worldX * zoom;
  let newScreenY = worldY * zoom;

  let oldScreenX = worldX * (zoom / zoomFactor);
  let oldScreenY = worldY * (zoom / zoomFactor);

  panX += oldScreenX - newScreenX;
  panY += -(oldScreenY - newScreenY);

  return false; // empêche le scroll de la page
}

function safeEval(x) {
  try {
    return exprFunc(x);
  } catch {
    return 0;
  }
}
