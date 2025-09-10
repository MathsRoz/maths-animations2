let sliderU0, sliderN;
let valU0Span, valNSpan;
let a=1;
let b=0;
let c=0;
let A,B,C;

function setup() {
  


  
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
  
  sliderN = createSlider(-5, 5, 3, 0.1);
  sliderN.class("p5slider");
  sliderN.size(200);
  let labN = createSpan("α :");
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
  
  sliderC = createSlider(-5, 5, 1, 0.1);
  sliderC.class("p5slider");
  sliderC.size(200);
  let labC = createSpan("β :");
  labC.class("slider-label");
  labC.parent(contC);
  sliderC.parent(contC);
  valCSpan = createSpan(sliderC.value());
  valCSpan.parent(contC);
  valCSpan.style("min-width", "40px");
  valCSpan.style("text-align", "left");
  valCSpan.class("slider-value");


  preambuleSetup();
}




function draw() {
  preambuleDraw();
  valU0Span.html(sliderU0.value());
  valNSpan.html(sliderN.value());
  valCSpan.html(sliderC.value());
  drawFunction();
  drawLines();
  showfunc();
}






function drawFunction() {
  a=sliderU0.value();
  b=sliderN.value();
  c=sliderC.value();
  stroke(323,72,85);
  stroke(red);
  strokeWeight(3/zoom);
  noFill();
  beginShape();
  let step = 1/zoom;
  for (let x = -(width/2+panX)/(zoom); x < (width/2-panX)/(zoom); x += step) {
    let y = a*(x-b)*(x-b)+c;
    if (isFinite(y)) vertex(x, y);
  }
  endShape();
}

function drawLines() {
  
  drawingContext.setLineDash([5/zoom, 5/zoom]);
  stroke(orange);
  line(b,0,b,c);
  line(0,c,b,c);
  drawingContext.setLineDash([]);
  textSize(30/zoom);
  stroke(black);
  strokeWeight(3/zoom);
  scale(1,-1);
  fill(orange);
  textAlign(TOP,TOP);
  text("α",b,10/zoom);
  textAlign(RIGHT,CENTER);
  text("β",-10/zoom,-c);
}





function showfunc(){
  
  b===0 ? B="" : b>0 ? B = "-"+str(b) : B="+"+str(-b);
  c===0 ? C="" : c>0 ? C = "+"+str(c) : C=str(c);
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
  let fonct;
  fonct = a===0 ? "f(x)=0":b===0 ?"f(x)="+A+"x²"+C : "f(x)="+A+"(x"+B+")²"+C;
  text(fonct,20,180);
  pop();
}


function mousePressed() {
  
  
    dragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  
  if (menuOn && abs(mouseX-width/2)<250 && abs(mouseY-height/2)<150) {
    dragging = false;
  }
  if (mouseX<280 && mouseY<200){
    dragging = false;
  }
}