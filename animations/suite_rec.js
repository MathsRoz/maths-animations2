
let inputFunc;
let exprFunc;
let sliderU0, sliderN;
let valU0Span, valNSpan;

let boutton;
let afficher = false;
let fr = 0;


function setup() {


 

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
  contU0.style("margin-top","30px")
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
  
  sliderN = createSlider(0, 10, 0, 0.01);
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

  boutton = createButton("Afficher Un");
  boutton.parent(panel);
  boutton.class("p5btn");
  boutton.mousePressed(affun);

  preambuleSetup();
  
  updateFunction();

  panX=-200;
  panY=200;

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
  valU0Span.html(sliderU0.value());
  valNSpan.html(int(sliderN.value()-.5));
  
  preambuleDraw();
  drawIden();
  drawFunction();
  drawCobweb();
  drawun();
  
}

function drawIden(){
let xmin = -(width/2+panX);
let ymin = -(height/2+panY);
let xmax = (width/2-panX);
let ymax = (height/2+panY);
let minimum = min(xmin,ymin);
let maximum = max(xmax,ymax);
line(minimum*zoomX,minimum*zoomY,maximum*zoomX,maximum*zoomY);
}

function drawFunction() {
  let wmax = (width/2-panX)/zoomX;
  let wmin = -(width/2+panX)/zoomX;
  if (!exprFunc) return;
  stroke(323,72,85);
  stroke(red)
  strokeWeight(linesize);
  noFill();
  beginShape();

  for (let x =wmin; x<wmax;x+=.5/zoomX ) {
    let y = exprFunc(x);
    pos=worldtoScreen(x,y);
    if (isFinite(y)) vertex(pos[0],pos[1]);
  }
  endShape();
}


function drawun(){
  let u = sliderU0.value();
  push();
  scale(1,-1);
  fill(orange);
  stroke(black);
  circle(u*zoomX,0,2*linesize+10);
  stroke(orange)
  fill(orange);
  circle(u*zoomX,0,2*linesize);

  stroke(black);
  textAlign(CENTER,TOP);
  textSize(fsize);
  textFont("delius");
  text("u₀",u*zoomX,10);
  pop();
}


function drawCobweb() {
  let u = sliderU0.value();
  let n = sliderN.value();

  stroke(orange);
  strokeWeight(linesize);

  let x = u;
  let y = 0;
  
  
  let fx = exprFunc(x);
  line(x*zoomX, y*zoomY, x*zoomX, n<1 ? (y+(fx-y)*(n%1))*zoomY : fx*zoomY);
  for (let i = 1; i < n ; i++) {
    
    line(x*zoomX, fx*zoomY, i>n-.5 ? (x+(fx-x)*2*(n%0.5))*zoomX: fx*zoomX, fx*zoomY);
    y = fx;
    x = fx;
    fx = exprFunc(x);
    
    
    
    if(i<=n-.5 && afficher){
      push();
    strokeWeight(linesize);
      drawingContext.setLineDash([linesize, linesize*2]);
      stroke(vert);
      line(x*zoomX, y*zoomY, x*zoomX, 0) 
    scale(1,-1);
    
    drawingContext.setLineDash([]);
    textAlign(CENTER,TOP);
    strokeWeight(linesize);
    textSize(fsize*2);
    stroke(black);
    fill(vert);
    textFont("delius");
    text(("u"),x*zoomX,10);
    textSize(fsize);
    textAlign(LEFT,LEFT);
    text((i),x*zoomX+fsize/2,10+fsize);

    pop();
    }
    line(x*zoomX, y*zoomY, x*zoomX, i>n-1 && n%1>.5? (x+(fx-x)*2*((n-.5)%0.5))*zoomY: i>n-1 ? NaN:fx*zoomY );
    
    
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


  lastMouseX = mouseX;
  lastMouseY = mouseY;


  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    dragging = true;
  }
  if (mouseX<300 && mouseY<200){
    dragging =false;
    return;
  }
  
  overOption();

  if (menuOn && abs(mouseX-width/2)<250 && abs(mouseY-height/2)<150) {
    dragging = false;
    return;
  }


  let posmx = mouseX-width/2-panX;
  let posmy = mouseY-height/2-panY;
  if (abs(posmx)<linesize && abs(posmy)>40){
    resizeY=true;
    dragging = false;
    lastMouseX = mouseX;
    return;}
  else if (abs(posmy)<linesize && abs(posmx)>40){
    resizeX=true;
    dragging = false;
    lastMouseY = mouseY;
    return;}

  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    dragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }

  

}







function affun() {
  if (!afficher){
  afficher = true
  boutton.html("Cacher Un");}
  else{
    afficher = false;
    boutton.html("Afficher Un");
  }
}