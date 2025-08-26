let inputFunc;
let exprFunc;

let p1, p2; 
let dragging1 = false, dragging2 = false;
let hover1 = false, hover2 = false;

let panX = 0, panY = 0;
let draggingGraph = false;
let lastMouseX, lastMouseY;

let zoom = 100;

function setup() {
  pixelDensity(1);
  // 📱 Canvas plus petit sur mobile
  if (windowWidth < 600) {
    createCanvas(windowWidth, windowHeight * 0.7);
  } else {
    createCanvas(windowWidth, windowHeight);
  }

  frameRate(30); // ✅ limiter à 30 FPS

  // Input fonction
  inputFunc = createInput("x*x");
  inputFunc.position(20, 20);
  inputFunc.size(200);
  inputFunc.input(updateFunction);
  inputFunc.class("func-input");

  updateFunction();

  // Points initiaux
  p1 = createVector(-1, safeEval(-1)); 
  p2 = createVector(2, safeEval(2));   
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
  background(0);

  translate(width/2 + panX, height/2 + panY);
  scale(1, -1);

  // Axes
  stroke(255);
  strokeWeight(1);
  line(-width, 0, width, 0);
  line(0, -height, 0, height);

  // ✅ Courbe optimisée : moins de points sur mobile
  let step = (windowWidth < 600) ? 0.05 : 0.01;
  stroke(255);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let x = -width/zoom; x < width/zoom; x += step) {
    let y = safeEval(x);
    vertex(x * zoom, y * zoom);
  }
  endShape();

  // Points A et B
  p1.y = safeEval(p1.x);
  p2.y = safeEval(p2.x);

  let x1 = -width/zoom, x2 = width/zoom;

  // Tangente en A
  stroke('orange');
  strokeWeight(2);
  drawingContext.setLineDash([6]);
  let h = 0.0001;
  let slopeT = (safeEval(p1.x+h) - safeEval(p1.x-h)) / (2*h);
  let y1t = p1.y + slopeT * (x1 - p1.x);
  let y2t = p1.y + slopeT * (x2 - p1.x);
  line(x1*zoom, y1t*zoom, x2*zoom, y2t*zoom);
  drawingContext.setLineDash([]);

  // Sécante
  stroke("red");
  strokeWeight(2);
  let slopeSec = (p2.y - p1.y) / (p2.x - p1.x + 1e-9);
  let y1 = p1.y + slopeSec * (x1 - p1.x);
  let y2 = p1.y + slopeSec * (x2 - p1.x);
  line(x1*zoom, y1*zoom, x2*zoom, y2*zoom);

  // Survol
  let mx = (mouseX - width/2 - panX) / zoom;
  let my = -(mouseY - height/2 - panY) / zoom;
  hover1 = dist(mx, my, p1.x, p1.y) < 0.2;
  hover2 = dist(mx, my, p2.x, p2.y) < 0.2;

  // Glow points
  stroke('red');
  strokeWeight(hover1 ? 22 : 15);
  point(p1.x * zoom, p1.y * zoom);

  strokeWeight(hover2 ? 22 : 15);
  point(p2.x * zoom, p2.y * zoom);

  // Étiquettes
  scale(1, -1);
  fill(255);
  noStroke();
  textSize(20);
  text("A", p1.x*zoom + 10, -p1.y*zoom - 10);
  text("B", p2.x*zoom + 10, -p2.y*zoom - 10);
  scale(1, -1);

  // Curseur adapté
  if (hover1 || hover2) {
    cursor("pointer");
  } else if (draggingGraph) {
    cursor("grabbing");
  } else {
    cursor("default");
  }
}

function mousePressed() {
  if (document.activeElement.tagName === "INPUT") return;

  let mx = (mouseX - width/2 - panX) / zoom;
  let my = -(mouseY - height/2 - panY) / zoom;

  let dA = dist(mx, my, p1.x, p1.y);
  let dB = dist(mx, my, p2.x, p2.y);

  if (dA < 0.2 && dA <= dB) {
    dragging1 = true;
  } else if (dB < 0.2 && dB < dA) {
    dragging2 = true;
  } else {
    draggingGraph = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    cursor("grabbing");
  }
}

function mouseDragged() {
  if (document.activeElement.tagName === "INPUT") return;

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
  cursor("default");
}

function mouseWheel(event) {
  let worldX = (mouseX - width/2 - panX) / zoom;
  let worldY = -(mouseY - height/2 - panY) / zoom;

  let zoomFactor = 1 - event.delta * 0.001;
  zoom = constrain(zoom * zoomFactor, 20, 500);

  let newScreenX = worldX * zoom;
  let newScreenY = worldY * zoom;
  let oldScreenX = worldX * (zoom / zoomFactor);
  let oldScreenY = worldY * (zoom / zoomFactor);

  panX += oldScreenX - newScreenX;
  panY += -(oldScreenY - newScreenY);

  return false;
}

// Touch events pour smartphone
function touchStarted() {
  if (document.activeElement.tagName === "INPUT") return false;

  let mx = (mouseX - width/2 - panX) / zoom;
  let my = -(mouseY - height/2 - panY) / zoom;

  let dA = dist(mx, my, p1.x, p1.y);
  let dB = dist(mx, my, p2.x, p2.y);

  if (dA < 0.2 && dA <= dB) {
    dragging1 = true;
  } else if (dB < 0.2 && dB < dA) {
    dragging2 = true;
  } else {
    draggingGraph = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    cursor("grabbing");
  }
  return false; // évite scroll de la page
}

function touchMoved() {
  if (document.activeElement.tagName === "INPUT") return false;

  let mx = (mouseX - width/2 - panX) / zoom;

  if (dragging1) p1.x = mx;
  if (dragging2) p2.x = mx;

  if (draggingGraph) {
    panX += mouseX - lastMouseX;
    panY += mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
  return false; // bloque scroll
}

function touchEnded() {
  dragging1 = false;
  dragging2 = false;
  draggingGraph = false;
  cursor("default");
  return false;
}


function safeEval(x) {
  try {
    return exprFunc(x);
  } catch {
    return 0;
  }
}


let pinchStartDist = null; // distance initiale entre 2 doigts
let pinchCenter = null;    // centre du pinch

function touchStarted() {
  if (document.activeElement.tagName === "INPUT") return false;

  if (touches.length === 1) {
    // --- Un seul doigt : drag des points / graphe ---
    let mx = (mouseX - width/2 - panX) / zoom;
    let my = -(mouseY - height/2 - panY) / zoom;

    let dA = dist(mx, my, p1.x, p1.y);
    let dB = dist(mx, my, p2.x, p2.y);

    if (dA < 0.2 && dA <= dB) {
      dragging1 = true;
    } else if (dB < 0.2 && dB < dA) {
      dragging2 = true;
    } else {
      draggingGraph = true;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      cursor("grabbing");
    }
  } else if (touches.length === 2) {
    // --- Deux doigts : pinch zoom ---
    pinchStartDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    pinchCenter = {
      x: (touches[0].x + touches[1].x) / 2,
      y: (touches[0].y + touches[1].y) / 2
    };
  }
  return false;
}

function touchMoved() {
  if (document.activeElement.tagName === "INPUT") return false;

  if (touches.length === 1) {
    // --- Drag classique ---
    let mx = (mouseX - width/2 - panX) / zoom;
    if (dragging1) p1.x = mx;
    if (dragging2) p2.x = mx;

    if (draggingGraph) {
      panX += mouseX - lastMouseX;
      panY += mouseY - lastMouseY;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  } else if (touches.length === 2 && pinchStartDist !== null) {
    // --- Pinch zoom ---
    let newDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    let scaleFactor = newDist / pinchStartDist;

    // Coordonnées monde du centre de pinch
    let worldX = (pinchCenter.x - width/2 - panX) / zoom;
    let worldY = -(pinchCenter.y - height/2 - panY) / zoom;

    // Nouveau zoom
    let newZoom = constrain(zoom * scaleFactor, 20, 500);

    // Ajustement pan pour garder le centre fixe
    let newScreenX = worldX * newZoom;
    let newScreenY = worldY * newZoom;
    let oldScreenX = worldX * zoom;
    let oldScreenY = worldY * zoom;

    panX += oldScreenX - newScreenX;
    panY += -(oldScreenY - newScreenY);

    zoom = newZoom;
    pinchStartDist = newDist; // reset distance de référence
  }

  return false;
}

function touchEnded() {
  dragging1 = false;
  dragging2 = false;
  draggingGraph = false;
  pinchStartDist = null;
  pinchCenter = null;
  cursor("default");
  return false;
}

