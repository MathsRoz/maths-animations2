
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
let xmin = -(width/2+panX)/(zoom);
let ymin = -(height/2-panY)/(zoom);
let xmax = (width/2-panX)/(zoom);
let ymax = (height/2+panY)/(zoom);
let minimum = min(xmin,ymin);
let maximum = max(xmax,ymax);
line(minimum,minimum,maximum,maximum);
}

function drawFunction() {
  if (!exprFunc) return;
  stroke(323,72,85);
  stroke(red)
  strokeWeight(linesize);
  noFill();
  beginShape();
  let step = 1/zoom;
  for (let x = -20*width/(zoom); x < 20*width/(zoom); x += step) {
    let y = exprFunc(x);
    if (isFinite(y)) vertex(x, y);
  }
  endShape();
}


function drawun(){
  let u = sliderU0.value();
  push();
  scale(1,-1);
  fill(orange);
  stroke(black);
  circle(u,0,12/zoom);
  stroke(orange)
  fill(orange);
  circle(u,0,8/zoom);
  strokeWeight(4/zoom);
  stroke(black);
  textAlign(CENTER,TOP);
  textSize(fsize);
  textFont("delius");
  text("u₀",u,10/zoom);
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
  line(x, y, x, n<1 ? y+(fx-y)*(n%1) : fx);
  for (let i = 1; i < n ; i++) {
    
    line(x, fx, i>n-.5 ? x+(fx-x)*2*(n%0.5): fx, fx);
    y = fx;
    x = fx;
    fx = exprFunc(x);
    
    
    
    if(i<=n-.5 && afficher){
      push();
    strokeWeight(linesize);
      drawingContext.setLineDash([linesize, linesize*2]);
      stroke(vert);
      line(x, y, x, 0) 
    scale(1,-1);
    
    drawingContext.setLineDash([]);
    textAlign(CENTER,TOP);
    strokeWeight(linesize);
    textSize(fsize);
    stroke(black);
    fill(vert);
    textFont("delius");
    text(("u"),x,10/zoom);
    textSize(fsize/2);
    textAlign(LEFT,LEFT);
    text((i),x+5/zoom+fsize/5,10/zoom+fsize/2);

    pop();
    }
    line(x, y, x, i>n-1 && n%1>.5? x+(fx-x)*2*((n-.5)%0.5): i>n-1 ? NaN:fx );
    
    
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
  dragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  if (mouseX<300 && mouseY<200){
    dragging =false;
  }

  overOption();

  
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