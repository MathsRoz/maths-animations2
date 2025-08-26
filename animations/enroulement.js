let slider1, enroullement, zoom;
let ani = false;
let fra = 0;
let facteur = 2;
let playBtn;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);

  // Panneau global pour empiler sliders et bouton
  let panel = createDiv();
  panel.style("display", "flex");
  panel.style("flex-direction", "column");
  panel.style("gap", "12px");
  panel.position(20, 40);

  // Fonction utilitaire : ajoute label + slider
  function addSlider(labelText, min, max, val, step) {
    let container = createDiv();
    container.style("display", "flex");
    container.style("align-items", "center");
    container.style("gap", "10px");
    container.parent(panel);

    let label = createSpan(labelText + " : ");
    label.class("slider-label");
    label.parent(container);

    let slider = createSlider(min, max, val, step);
    slider.size(200);
    slider.class("p5slider");
    slider.parent(container);

    return slider;
  }

  // Création des sliders
  zoom = addSlider("Zoom", 0.5, 3, 1, 0.1);
  slider1 = addSlider("Angle", -10000, 10000, 1800, 1);
  enroullement = addSlider("Prog", 0, 1000, 0, 1);

  playBtn = createButton("▶ Play");
  playBtn.class("p5btn");
  playBtn.parent(panel);
  playBtn.mousePressed(play);
}

function draw() {
  facteur = zoom.value();
  background(0);

  let s = slider1.value();
  let p = enroullement.value() / 1000;
  let angle = (s / 1000) * p;

  translate(width / 2, height / 2);
  scale(1, -1);

  noFill();
  stroke(255);
  strokeWeight(3);

  circle(0, 0, 200 * facteur);
  line(-100 * facteur, 0, 100 * facteur, 0);
  line(0, -100 * facteur, 0, 100 * facteur);
  line(100 * facteur, -windowHeight * facteur, 100 * facteur, windowHeight * facteur);

  let maxVal = windowHeight / 100;
  for (let x = 0; x <= maxVal; x++) {
    noFill();
    stroke(255);
    strokeWeight(3);
    line(100 * facteur, 100 * x * facteur, 105 * facteur, 100 * x * facteur);
    line(100 * facteur, -100 * x * facteur, 105 * facteur, -100 * x * facteur);

    scale(1, -1);
    noStroke();
    fill(255);
    textSize(20);
    text(-x, 110 * facteur, 100 * x * facteur);
    text(x, 110 * facteur, -100 * x * facteur);
    scale(1, -1);
  }

  let x = cos(angle);
  let y = sin(angle);

  if (p == 1) {
    push();
    strokeWeight(3);
    stroke("green");
    drawingContext.setLineDash([6]);
    line(0, 0, x * 100 * facteur, y * 100 * facteur);
    drawingContext.setLineDash([]);
    pop();
  }
  push();
  stroke("red");
  strokeWeight(5);
  noFill();
  if (abs(s / 1000) * p > TWO_PI) circle(0, 0, 200 * facteur);
  if (s >= 0) arc(0, 0, 200 * facteur, 200 * facteur, 0, (s / 1000) * p);
  else arc(0, 0, 200 * facteur, 200 * facteur, (s / 1000) * p, 0);

  line(x * 100 * facteur, y * 100 * facteur,
       (x * 100 - y * s / 10 * (1 - p)) * facteur,
       (y * 100 + x * s / 10 * (1 - p)) * facteur);

  line(100*facteur,s*facteur/10,100*facteur+10,s*facteur/10);
  pop();
  push();
  scale(1, -1);
  stroke("red");
  strokeWeight(1);
  fill("red");
  textAlign(LEFT,CENTER)
  text(str(s/1000),100*facteur+15,-s*facteur/10);
  pop();

 // Gestion auto de l'animation
  if (ani && fra <= 1000) {
    enroullement.value(fra);
    fra += 10;
  } else {
    if (ani) enroullement.value(1000);
    ani = false;
    fra = 0;
  }

  if (enroullement.value() >= 1000) {
    playBtn.html("⟲ Reset");
  } else if (ani) {
    playBtn.html("⏸ Pause");
  } else {
    playBtn.html("▶ Play");
  }
}

function play() {
  if (!ani) {
    fra = enroullement.value();
    ani = true;
    this.html("⏸ Pause");
  } else {
    ani = false;
    this.html("▶ Play");
  }
  if (enroullement.value() >= 1000) {
    ani=false;
    enroullement.value(0);
    fra = 0;
  }
}

// 🎯 Ajout du zoom à la molette
function mouseWheel(event) {
  let current = zoom.value();
  let newZoom = current - event.delta * 0.001; // ajustement plus fin
  newZoom = constrain(newZoom, 0.5, 3);
  zoom.value(newZoom);
  return false; // empêche le scroll de la page
}
