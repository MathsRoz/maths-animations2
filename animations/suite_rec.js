let zoom = 80; // pixels par unité
let panX = 0, panY = 0;
let dragging = false;
let lastMouseX, lastMouseY;
let pinchStartDist = null;
let inputFunc;
let exprFunc;
let sliderU0, sliderN;
let valU0Span, valNSpan;
let themeBtn;
let darkMode = true; // ✅ thème par défaut
let white, black, orange, red;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);

  // bouton clair/sombre en haut à droite
  themeBtn = createButton("Mode sombre");
  themeBtn.position(windowWidth - 200, 20);
  themeBtn.class("p5btn");
  themeBtn.mousePressed(toggleTheme);

  // conteneur horizontal pour fonction
  let container = createDiv();
  container.style("display", "flex");
  container.style("align-items", "center");
  container.style("gap", "10px");
  container.position(20, 20);

  // label f(x) =
  let label = createSpan("f(x) =");
  label.parent(container);
  label.class("slider-label");

  // input fonction
  inputFunc = createInput("0.5*x+3");
  inputFunc.parent(container);
  inputFunc.size(200);
  inputFunc.class("func-input");
  inputFunc.input(updateFunction);

  // conteneur sliders
  let panel = createDiv();
  panel.style("display", "flex");
  panel.style("flex-direction", "column");
  panel.style("gap", "10px");
  panel.position(20, 60);

  // slider u0
  let contU0 = createDiv();
  contU0.style("display", "flex");
  contU0.style("align-items", "center");
  contU0.style("gap", "10px");
  contU0.parent(panel);
  let labU0 = createSpan("u₀ :");
  labU0.parent(contU0);
  labU0.class("slider-label");
  sliderU0 = createSlider(-5, 5, 1, 0.1);
  sliderU0.parent(contU0);
  sliderU0.class("p5slider");
  sliderU0.size(200);
  valU0Span = createSpan(sliderU0.value());
  valU0Span.parent(contU0);
  valU0Span.style("min-width", "40px");
  valU0Span.style("text-align", "left");
  valU0Span.class("slider-value");

  // slider n
  let contN = createDiv();
  contN.style("display", "flex");
  contN.style("align-items", "center");
  contN.style("gap", "10px");
  contN.parent(panel);
  
  sliderN = createSlider(0, 10, 0, 1);
  sliderN.class("p5slider");
  sliderN.size(200);
  let labN = createSpan("n :");
  labN.class("slider-label");
  labN.parent(contN);
  sliderN.parent(contN);
  valNSpan = createSpan(sliderN.value());
  valNSpan.parent(contN);
  valNSpan.style("min-width", "40px");
  valNSpan.style("text-align", "left");
  valNSpan.class("slider-value");


  white = color("#fffefdff");
  black = color("#313130ff");
  orange = color("#ffab51ff");
  red = color("#e43d3dff");
  updateFunction();



  panX=-200;
  panY=200;
}

function toggleTheme() {
  darkMode = !darkMode;
  if (darkMode) {
    themeBtn.html("Mode sombre");
    document.body.style.color = "white"; 
  } else {
    themeBtn.html(" Mode clair");
    document.body.style.color = "black";
  }
}

function updateFunction() {
  try {
    let expr = inputFunc.value();
    exprFunc = new Function("x", "with(Math){ return " + expr + "; }");
  } catch {
    exprFunc = (x) => NaN;
  }
}

function draw() {
  createCanvas(windowWidth, windowHeight);
  if (darkMode) background(black);
  else background(white);
  themeBtn.position(windowWidth - 200, 20);
  valU0Span.html(sliderU0.value());
  valNSpan.html(sliderN.value());
  
  translate(width/2 + panX, height/2 + panY);
  scale(zoom, -zoom);

  drawAxes();
  drawFunction();
  drawCobweb();
}

function drawAxes() {
  stroke(darkMode ? white  : black );
  strokeWeight(3/zoom);
  line(-width, 0, width, 0);
  line(0, -height, 0, height);

  fill(darkMode ? (32,36,39) : (255,241,243));
  textSize(14/zoom);
  textAlign(CENTER,CENTER);

  let step = getStep();

  for (let i = -int(width/(0.5*zoom)); i <= int(width/(0.5*zoom)); i++) {
    if (i % step === 0 && i !== 0) {
      line(i, -5/zoom, i, 5/zoom);
      push();
      scale(1,-1);
      noStroke();
      textSize(20/zoom);
      fill(darkMode ? (255,241,243) : (32,36,39))
      text(i, i, 20/zoom);
      pop();
    }
  }

  for (let j = -int(height/(zoom)); j <= int(height/(zoom)); j++) {
    if (j % step === 0 && j !== 0) {
      line(-5/zoom, j, 5/zoom, j);
      push();
      scale(1,-1);
      noStroke();
      fill(darkMode ? (255,241,243) : (32,36,39))
      textAlign(RIGHT,CENTER);
      textSize(20/zoom);
      text(j, -8/zoom, -j);
      pop();
    }
  }

  push();
      scale(1,-1);
      noStroke();
      fill(darkMode ? (255,241,243) : (32,36,39))
      textAlign(RIGHT,CENTER);
      textSize(20/zoom);
      text(0,-8/zoom,20/zoom);
      pop();
  

  stroke(darkMode ? white: black);
  strokeWeight(3/zoom);
  line(-width/zoom, -width/zoom, width/zoom, width/zoom);
}

function drawFunction() {
  if (!exprFunc) return;
  stroke(323,72,85);
  stroke(red)
  strokeWeight(3/zoom);
  noFill();
  beginShape();
  let step = 1/zoom;
  for (let x = -width/(zoom); x < width/(zoom); x += step) {
    let y = exprFunc(x);
    if (isFinite(y)) vertex(x, y);
  }
  endShape();
}

function drawCobweb() {
  let u = sliderU0.value();
  let n = sliderN.value();

  stroke(orange);
  strokeWeight(3/zoom);

  let x = u;
  let y = 0;
  
  push();
  scale(1,-1);
  fill(orange);
  stroke(black);
  circle(x,y,14/zoom);
  stroke(orange)
  fill(orange);
  circle(x,y,8/zoom);
  
  strokeWeight(6/zoom);
  stroke(black);
  textAlign(CENTER,TOP);
  textSize(28/zoom);
  text("u₀",x,y+10/zoom);
  pop();
  for (let i = 0; i < n ; i++) {
    let fx = exprFunc(x);
    line(x, y, x, fx);
    line(x, fx, fx, fx);
    x = fx;
    y = fx;
  }
}

function isOverElement(elt) {
  let r = elt.getBoundingClientRect();
  return (mouseX >= r.left && mouseX <= r.right &&
          mouseY >= r.top && mouseY <= r.bottom);
}

function mousePressed() {
  if (isOverElement(inputFunc.elt) || 
      isOverElement(sliderU0.elt) || 
      isOverElement(sliderN.elt)) {
    return;
  }
  if ((mouseX >= 300 && mouseX <= width && mouseY >= 0 && mouseY <= height )||
      (mouseX >= 0 && mouseX <= width && mouseY >= 140 && mouseY <= height ) ) {
    dragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseDragged() {
  if (dragging) {
    panX += mouseX - lastMouseX;
    panY += mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseReleased() {
  dragging = false;
}

function mouseWheel(event) {
  let worldX = (mouseX - width/2 - panX) / zoom;
  let worldY = -(mouseY - height/2 - panY) / zoom;

  let factor = 1 - event.delta * 0.001;
  zoom = constrain(zoom * factor, 10, 500);

  let newScreenX = worldX * zoom;
  let newScreenY = worldY * zoom;
  let oldScreenX = worldX * (zoom / factor);
  let oldScreenY = worldY * (zoom / factor);

  panX += oldScreenX - newScreenX;
  panY += -(oldScreenY - newScreenY);

  return false;
}

function touchStarted() {
  if (touches.length === 1) {
    if (isOverElement(inputFunc.elt) || 
        isOverElement(sliderU0.elt) || 
        isOverElement(sliderN.elt)) {
      return;
    }
  }
}

function touchMoved() {
  if (touches.length === 2 && pinchStartDist !== null) {
    let newDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    let factor = newDist / pinchStartDist;
    zoom = constrain(zoom * factor, 10, 500);
    pinchStartDist = newDist;
    return false;
  } else if (touches.length === 1 && dragging) {
    panX += touches[0].x - lastMouseX;
    panY += touches[0].y - lastMouseY;
    lastMouseX = touches[0].x;
    lastMouseY = touches[0].y;
  }
}

function touchEnded() {
  if (touches.length < 2) pinchStartDist = null;
  if (touches.length === 0) dragging = false;
}

function getStep() {
  if (zoom > 40) return 1;
  else if (zoom > 20) return 5;
  else return 10;
}
