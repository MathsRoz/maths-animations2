let zoom = 80; // pixels par unité
let panX = 0, panY = 0;
let dragging = false;
let lastMouseX, lastMouseY;
let pinchStartDist = null;
let sliderU0, sliderN;
let valU0Span, valNSpan;
let themeBtn;
let darkMode = true; // ✅ thème par défaut
let white, black, orange, red,lightgray, darkgray;
let a=1;
let b=0;
let A,B;
let mx=0; 
let my=b;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);

  // bouton clair/sombre en haut à droite
  themeBtn = createButton("Mode sombre");
  themeBtn.position(windowWidth - 200, 20);
  themeBtn.class("p5btn");
  themeBtn.mousePressed(toggleTheme);

  
  // conteneur sliders
  let panel = createDiv();
  panel.style("display", "flex");
  panel.style("flex-direction", "column");
  panel.style("gap", "10px");
  panel.position(20, 20);

  // slider u0
  let contU0 = createDiv();
  contU0.style("display", "flex");
  contU0.style("align-items", "center");
  contU0.style("gap", "10px");
  contU0.parent(panel);
  let labU0 = createSpan("a :");
  labU0.parent(contU0);
  labU0.class("slider-label");
  sliderU0 = createSlider(-5, 5, 2, 0.1);
  sliderU0.parent(contU0);
  sliderU0.class("p5slider");
  sliderU0.size(windowWidth/5);
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
  
  sliderN = createSlider(-5, 5, 3, 0.1);
  sliderN.class("p5slider");
  sliderN.size(windowWidth/5);
  let labN = createSpan("b :");
  labN.class("slider-label");
  labN.parent(contN);
  sliderN.parent(contN);
  valNSpan = createSpan(sliderN.value());
  valNSpan.parent(contN);
  valNSpan.style("min-width", "40px");
  valNSpan.style("text-align", "left");
  valNSpan.class("slider-value");


   // slider n
  let contC = createDiv();
  contC.style("display", "flex");
  contC.style("align-items", "center");
  contC.style("gap", "10px");
  contC.parent(panel);


  panX=-200;
  panY=200;

  couleur();
}
function toggleTheme() {
  darkMode = !darkMode;
  if (darkMode) {
    themeBtn.html("Mode sombre");
    document.body.style.color = white; 
  } else {
    themeBtn.html(" Mode clair");
    document.body.style.color = black;
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
  drawLines();
  showfunc();
  
}




function drawAxes() {
  stroke(darkMode ? white  : black );
  strokeWeight(3/zoom);
  line(-width, 0, width, 0);
  line(0, -height, 0, height);

  fill(darkMode ? black: white);
  textSize(14/zoom);
  textAlign(CENTER,CENTER);

  let step = getStep();

  for (let i = -int(width/(0.5*zoom)); i <= int(width/(0.5*zoom)); i++) {
    if (i % step === 0 && i !== 0) {
      
      
      
      push();
      strokeWeight(2/zoom);
      stroke(darkMode ? darkgray : lightgray );
      line(i,-width/0.2*zoom, i, width/0.2*zoom);
      pop();

      line(i, -5/zoom, i, 5/zoom);

      push();
      scale(1,-1);
      noStroke();
      textSize(20/zoom);
      fill(darkMode ? white : black);
      text(i, i, 20/zoom);
      pop();
    }
  }

  for (let j = -int(height/(0.2*zoom)); j <= int(height/(0.2*zoom)); j++) {
    if (j % step === 0 && j !== 0) {

      push();
      strokeWeight(2/zoom);
      stroke(darkMode ? darkgray : lightgray );
      line(-width/0.2*zoom,j, width/0.2*zoom,j);
      pop();

      line(-5/zoom, j, 5/zoom, j);
      

      push();
      scale(1,-1);
      stroke(darkMode ?   black: white);
      fill(!darkMode ?   black: white);
      textAlign(RIGHT,CENTER);
      textSize(20/zoom);
      text(j, -8/zoom, -j);
      pop();
    }
  }

  push();
      scale(1,-1);
      noStroke();
      fill(darkMode ? (255,241,243) : (32,36,39));
      textAlign(RIGHT,CENTER);
      textSize(20/zoom);
      text(0,-8/zoom,20/zoom);
      pop();
  

  stroke(darkMode ? white: black);
  strokeWeight(3/zoom);
}

function drawFunction() {
  a=sliderU0.value();
  b=sliderN.value();
  stroke(323,72,85);
  stroke(red);
  strokeWeight(3/zoom);
  noFill();
  beginShape();
  let step = 1/zoom;
  for (let x = -(width/2+panX)/(zoom); x < (width/2-panX)/(zoom); x += step) {
    let y = a*x+b;
    if (isFinite(y)) vertex(x, y);
  }
  endShape();
  
}

function drawLines() {
  drawingContext.setLineDash([5/zoom, 5/zoom]);
  stroke(orange);
  line(0,b,1,b);
  a!==0 ? line(1,b,1,a*1+b): a ;
  
  drawingContext.setLineDash([]);
  textSize(24/zoom);
  stroke(black);
  strokeWeight(3/zoom);
  scale(1,-1);


  fill(orange);
  textAlign(CENTER,TOP);
  text(1,0.5,-b+6/zoom);
  textAlign(LEFT,CENTER);
  text(a,1+6/zoom,-b-a/2);
  stroke(red);
  fill(red);
  circle(mx,-b,7/zoom);
  
}

function isOverElement(elt) {
  let r = elt.getBoundingClientRect();
  return (mouseX >= r.left && mouseX <= r.right &&
          mouseY >= r.top && mouseY <= r.bottom);
}

function mousePressed() {
  if (isOverElement(sliderU0.elt) || 
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
    if (isOverElement(sliderU0.elt) || 
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

function showfunc(){
  
  b===0 ? B="" : b>0 ? B="+"+b : B = str(b);
  a===1 ? A="" : A=str(a);
  stroke(darkMode ? white : black);
  fill(darkMode ? white : black);
  strokeWeight(6);
  stroke(darkMode ? black: white);
  textSize(width/20);
  scale(1/zoom, 1/zoom);
  translate(-width/2 - panX, -height/2 - panY);
  textAlign(LEFT,TOP);
  push();
  textFont("Delius Swash Caps");
  a===0 ? b===0 ? text("f(x)=0",20,100) : text("f(x)="+B,20,100) : text("f(x)="+A+"x"+B,20,100);
  pop();
}