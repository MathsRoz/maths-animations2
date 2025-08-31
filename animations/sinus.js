let button;
let facteur = 1;
let angle = 0;
let fra = 0;
let ani = false;
let Angle, zoom;
let maxAngle = 1500;

// ✅ thème
let themeBtn;
let darkMode = true;
let white, black, orange, red;

// ✅ gestion pinch
let pinchStartDist = null;

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  

  // ✅ définir les couleurs
  white = color("#fffefdff");
  black = color("#313130ff");
  orange = color("#ffab51ff");
  red = color("#e43d3dff");

  // ✅ bouton clair/sombre
  themeBtn = createButton("Mode sombre");
  themeBtn.position(windowWidth - 200, 20);
  themeBtn.class("p5btn");
  themeBtn.mousePressed(toggleTheme);

  // Panneau global (empile sliders et bouton)
  let panel = createDiv();
  panel.style("display", "flex");
  panel.style("flex-direction", "column");
  panel.style("gap", "12px");
  panel.position(30, 30);

  // Fonction utilitaire pour ajouter un slider + label
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

  // Sliders
  zoom = addSlider("Zoom", 0.5, 3, 1.75, 0.1);
  Angle = addSlider("Angle", 0, maxAngle, 0, 5);

  // Bouton Play/Pause
  button = createButton("▶ Play");
  button.class("p5btn");
  button.parent(panel);
  button.mousePressed(play);
}

function toggleTheme() {
  darkMode = !darkMode;
  if (darkMode) {
    themeBtn.html("Mode sombre");
    document.body.style.color = "white";
  } else {
    themeBtn.html("Mode clair");
    document.body.style.color = "black";
  }
}

function draw() {
  createCanvas(windowWidth, windowHeight);
  if (darkMode) background(black);
  else background(white);

  themeBtn.position(windowWidth - 200, 20);

  facteur = zoom.value();
  angle = Angle.value();

  // Titre
  push();
  textAlign(LEFT, CENTER);
  textSize(50);
  fill(darkMode ? white : black);
  stroke(darkMode ? black : white);
  textFont("delius");
  text("sin(x) ", 350, 65);
  pop();

  strokeWeight(3);
  noFill();
  translate(150 * facteur, height / 2);
  scale(1, -1);

  // Graduation
  for (let x = 0; x < 40; x++) {
    stroke(darkMode ? white : black);
    line((100 + x * PI * 50) * facteur, 10 * facteur, (100 + x * PI * 50) * facteur, -10 * facteur);
    push();
    noStroke();
    fill(darkMode ? white : black);
    scale(1, -1);
    textSize(20);
    if (x == 0) {
      text("0", (104 + x * 100 * PI) * facteur, -15 * facteur);
    } else {
      text(str(2 * x) + "π", (104 + x * 100 * PI) * facteur, -15 * facteur);
    }
    pop();
  }

  // Axes principaux
  stroke(darkMode ? white : black);
  circle(0, 0, 200 * facteur);
  line(100 * facteur, -100 * facteur, 100 * facteur, 100 * facteur);
  line(-100 * facteur, 0, windowWidth, 0);
  line(0, -100 * facteur, 0, 100 * facteur);
  line(95 * facteur, 100 * facteur, 105 * facteur, 100 * facteur);
  line(95 * facteur, -100 * facteur, 105 * facteur, -100 * facteur);

  // Labels -1 et 1
  push();
  noStroke();
  fill(darkMode ? white : black);
  scale(1, -1);
  textSize(20);
  textAlign(LEFT, CENTER);
  text("-1", 110 * facteur, 100 * facteur);
  text("1", 110 * facteur, -100 * facteur);
  pop();

  // Vecteur rouge
  stroke(red);
  let x = 100 * cos(angle / 50);
  let y = 100 * sin(angle / 50);
  line(0, 0, x * facteur, y * facteur);

  // Sinusoïde
  stroke(red);
  for (let i = 0; i < angle - 2; i++) {
    line(
      (100 + i) * facteur,
      sin(i / 50) * facteur * 100,
      (100 + i + 3) * facteur,
      sin((i + 3) / 50) * facteur * 100
    );
  }

  // Projection verte en pointillés
  push();
  strokeWeight(3);
  stroke(orange);
  drawingContext.setLineDash([6]);
  line(x * facteur, y * facteur, (100 + angle) * facteur, sin(angle / 50) * facteur * 100);
  drawingContext.setLineDash([]);
  pop();

  // Animation
  if (ani && fra <= maxAngle) {
    Angle.value(fra);
    fra += 3;
  } else {
    if (ani) Angle.value(maxAngle);
    ani = false;
    fra = 0;
  }

  // Mise à jour texte du bouton
  if (Angle.value() >= maxAngle) {
    button.html("🔄 Reset");
  } else if (ani) {
    button.html("⏸ Pause");
  } else {
    button.html("▶ Play");
  }
}

function play() {
  if (!ani) {
    fra = Angle.value();
    ani = true;
  } else {
    ani = false;
  }
  if (Angle.value() >= maxAngle) {
    Angle.value(0);
    fra = 0;
    ani = false;
  }
}

// 🎯 Ajout du zoom à la molette
function mouseWheel(event) {
  let current = zoom.value();
  let newZoom = current - event.delta * 0.001;
  newZoom = constrain(newZoom, 0.5, 3);
  zoom.value(newZoom);
  return false;
}

// 🎯 Ajout du pinch zoom sur smartphone
function touchStarted() {
  if (touches.length === 2) {
    pinchStartDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
  }
}

function touchMoved() {
  if (touches.length === 2 && pinchStartDist !== null) {
    let newDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    let scaleFactor = newDist / pinchStartDist;

    let current = zoom.value();
    let newZoom = constrain(current * scaleFactor, 0.5, 3);
    zoom.value(newZoom);

    pinchStartDist = newDist; // mise à jour de la référence
    return false; // bloque le scroll de la page
  }
}

function touchEnded() {
  if (touches.length < 2) {
    pinchStartDist = null;
  }
}
