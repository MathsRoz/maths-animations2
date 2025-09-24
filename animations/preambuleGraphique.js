function couleur(){
  white = color("#f0fbffff");
  black = color("#272929ff");
  orange = color("#ffab51ff");
  red = color("#e22121ff");
  lightgray = color("#cbe2e9ff");
  darkgray = color("#504d4dff");
  vert = color("#1dac35ff");
}



let zoom = 80; // pixels par unité
let panX = 0, panY = 0;
let dragging = false;
let lastMouseX, lastMouseY;
let pinchStartDist = null;
let valTailleSpan;


let gridbox;
let unitebox;
let optionMenu;
let menuOn=false;
let fsize;
let linesize;

let themeBtn, menuButton;
let darkMode = true; // ✅ thème par défaut
let white, black, orange, red,lightgray, darkgray;



function preambuleSetup(){
  
 pixelDensity(1);
  createCanvas(windowWidth-10, windowHeight-10);

  menuButton = createButton("Options");
  menuButton.class("p5btn");
  menuButton.style("position", "absolute");
  menuButton.style("right", "10px");
  menuButton.style("top", "10px");
  menuButton.mousePressed(showMenu);




  
  // conteneur menu
  optionMenu = createDiv();
  optionMenu.style("position", "absolute");
  optionMenu.style("left", "50%");
  optionMenu.style("top", "50%");
  optionMenu.style("transform", "translate(-50%, -50%)");

  optionMenu.style("display", "flex");
  optionMenu.style("flex-direction", "column");
  optionMenu.style("align-items", "center");  // centre horizontalement
  optionMenu.style("gap", "30px");
  optionMenu.style("padding", "20px");
  optionMenu.style("background", "#272929ff");
  optionMenu.style("border-radius", "12px");

  optionMenu.style("box-shadow", "0 0px 24px rgba(240, 251, 255, .5)");


  


// bouton clair/sombre en haut à droite
  let contBtn = createDiv();
  contBtn.parent(optionMenu);
  contBtn.style("display", "flex");
  contBtn.style("justify-content", "center"); // ✅ centre horizontalement

  themeBtn = createButton("Mode sombre");
  themeBtn.parent(contBtn);
  themeBtn.class("p5btn");
  themeBtn.mousePressed(toggleTheme);

  // slider taille
  let contTaille = createDiv();
  contTaille.style("display", "flex");
  contTaille.style("align-items", "center");
  contTaille.style("gap", "10px");
  contTaille.parent(optionMenu);
  let labTaille = createSpan("Taille :");
  labTaille.parent(contTaille);
  labTaille.style("flex-shrink", "0");
  labTaille.class("slider-label");
  sliderTaille = createSlider(1, 10, 3, 0.1);
  sliderTaille.parent(contTaille);
  sliderTaille.class("p5slider");
  sliderTaille.size(300);
  valTailleSpan = createSpan(sliderTaille.value());
  valTailleSpan.parent(contTaille);
  valTailleSpan.style("text-align", "left");
  valTailleSpan.class("slider-value");

  let contGrid = createDiv();
  contGrid.style("display", "flex");
  contGrid.style("align-items", "center");  // ✅ aligne le texte et la case
  contGrid.style("gap", "10px");
  contGrid.parent(optionMenu);
  let labGrid = createSpan("Quadrillage ");
  labGrid.parent(contGrid);
  labGrid.style("flex-shrink", "0");
  labGrid.class("slider-label");
  gridbox = createCheckbox(" ", true);
  gridbox.parent(contGrid);
  gridbox.class("checkbox-wrapper-2");
  gridbox.elt.querySelector("input").classList.add("ikxBAC");

  let contUnite = createDiv();
  contUnite.style("display", "flex");
  contUnite.style("align-items", "center");  // ✅ aligne le texte et la case
  contUnite.style("gap", "10px");
  contUnite.parent(optionMenu);
  let labUnite = createSpan("Graduation ");
  labUnite.parent(contUnite);
  labUnite.style("flex-shrink", "0");
  labUnite.class("slider-label");
  unitebox = createCheckbox(" ", true);
  unitebox.parent(contUnite);
  unitebox.class("checkbox-wrapper-2");
  unitebox.elt.querySelector("input").classList.add("ikxBAC");

  let contEtiquette = createDiv();
  contEtiquette.style("display", "flex");
  contEtiquette.style("align-items", "center");  // ✅ aligne le texte et la case
  contEtiquette.style("gap", "10px");
  contEtiquette.parent(optionMenu);
  let labEti = createSpan("Etiquettes (x,y) : ");
  labEti.parent(contEtiquette);
  labEti.style("flex-shrink", "0");
  labEti.class("slider-label");
  inputX = createInput("x");
  inputX.parent(contEtiquette);
  inputX.size(.5);
  inputX.class("func-input");
  inputY = createInput("y");
  inputY.parent(contEtiquette);
  inputY.size(1);
  inputY.class("func-input");

  panX=0;
  panY=0;

  couleur();


  
  optionMenu.hide();
  
  

}


function preambuleDraw(){
  createCanvas(windowWidth-5, windowHeight-5);

  if (darkMode) background(black);
  else background(white);

  valTailleSpan.html(sliderTaille.value());

  fsize=(sliderTaille.value()+3)*4/zoom;
  linesize=sliderTaille.value()/zoom;
  
  translate(width/2 + panX, height/2 + panY);
  scale(zoom, -zoom);



  drawAxes();
}

function toggleTheme() {
  darkMode = !darkMode;
  if (darkMode) {
    themeBtn.html("Mode sombre");
    document.body.style.color = white; 
    optionMenu.style("background", black);
    optionMenu.style("box-shadow", "0 0px 24px rgba(255, 255, 255, 0.5)");
  } else {
    themeBtn.html(" Mode clair");
    document.body.style.color = black;
    optionMenu.style("background", white);
    optionMenu.style("box-shadow", "0 0px 24px rgba(0, 0, 0, 0.5)");
  }
}


function drawAxes() {
  stroke(darkMode ? white  : black );
  fill(darkMode ? white  : black );
  strokeWeight(linesize);
  
  textAlign(CENTER,CENTER);

  let step = getStep();

  let wmax = (width/2-panX)/zoom;
  let wmin = -(width/2+panX)/zoom;
  let hmax= (height/2+panY)/(zoom);
  let hmin = -(height/2-panY)/(zoom);

  for (let i = -Math.floor((width/2+panX)/(zoom)/step)*step; i <= Math.floor((width/2-panX)/(zoom)/step)*step; i+=step) {
    if ( i !== 0) {
      if (gridbox.checked()){
      push();
      strokeWeight(linesize*0.6);
      stroke(darkMode ? darkgray : lightgray );
      line(i,hmin, i, hmax);
      pop();}
      strokeWeight(linesize);
      if (unitebox.checked()){
      line(i, -linesize*1.5, i, linesize*1.5);}
    }
  }

  
  for (let j = -Math.floor((height/2-panY)/(zoom)/step)*step; j <= Math.floor((height/2+panY)/(zoom)/step)*step; j+= step) {
    if ( j !== 0) {
      if (gridbox.checked()){
      push();
      strokeWeight(linesize/1.5);
      stroke(darkMode ? darkgray : lightgray );
      line(wmin,j, wmax,j);
      pop();}

      if (unitebox.checked()){
      line(-linesize*1.5, j, linesize*1.5, j);}
    }
  }

  if (unitebox.checked()){
  push();
      scale(1,-1);
      noStroke();
      fill(darkMode ? (255,241,243) : (32,36,39));
      textAlign(RIGHT,TOP);
      textSize(fsize);
      text(0,-linesize*3,linesize*3);
      pop();}
  

  stroke(darkMode ? white: black);
  strokeWeight(linesize);


  //afficher les nombres au niveau des axes et sur les cotés si les axes ne sont plus visibles
// abscisses
if (unitebox.checked()){
  for (let i = -Math.floor((width/2+panX)/(zoom)/step)*step; i <= Math.floor((width/2-panX)/(zoom)/step)*step; i+=step) {
    if ( i !== 0) {
      push();
      scale(1,-1);
      noStroke();
      textSize(fsize);
      
      if ((height/2+panY)<0){
        fill(darkMode ? lightgray : darkgray);
        text(i, i, -(height/2+panY-20)/zoom);}
      else if ((-height/2+panY)>0){
        fill(darkMode ? lightgray : darkgray);
        text(i, i, -(-height/2+panY+20)/zoom);
      }
      else{
        push();
        textAlign(CENTER,TOP);
        fill(darkMode ? white : black);
        text(i, i, linesize*3);
        pop();
      }   
      pop();
    }
  }

  //ordonnées
  for (let j = -Math.floor((height/2-panY)/(zoom)/step)*step; j <= Math.floor((height/2+panY)/(zoom)/step)*step; j+= step) {
    if ( j !== 0) {

      push();
      scale(1,-1);
      noStroke();
      textSize(fsize);
      
      if ((width/2+panX)<0){
        fill(darkMode ? lightgray : darkgray);
        text(j, -(width/2+panX-20)/zoom,-j);}
      else if ((-width/2+panX)>0){
        fill(darkMode ? lightgray : darkgray);
        text(j,  -(-width/2+panX+20)/zoom,-j);
      }
      else{
        push();
        textAlign(RIGHT,CENTER);
        fill(darkMode ? white : black);
        text(j,  -linesize*3,-j);
        pop();
      }   
      pop();
    }
  }
}


line(wmin, 0, wmax, 0);
line(0, hmin, 0, hmax);

push();
  scale(1,-1);
  strokeWeight(0);
  textSize(linesize*10);
  textAlign(RIGHT);
  textFont("Delius");
  text(inputX.value(), (width/2-panX)/zoom-linesize*2,-linesize*5);
  textAlign(LEFT)
  text(inputY.value(), linesize*2,-(height/2+panY)/(zoom)+linesize*8);

  pop();

}


function overOption(){
  if (menuOn && abs(mouseX-width/2)<250 && abs(mouseY-height/2)<150) {
    dragging = false;
  }
}

function isOverHTMLElement() {
  const active = document.activeElement.tagName;
  return (
    active === "INPUT" ||
    active === "BUTTON" ||
    active === "SELECT" ||
    active === "TEXTAREA"
  );
}


// =======================
// 🖱️ GESTION SOURIS
// =======================
function mousePressed() {
  if (isOverHTMLElement()) return; // on ne bloque pas sliders/boutons
  if (menuOn && abs(mouseX-width/2)<250 && abs(mouseY-height/2)<150) {
    dragging = false;
    return;
  }
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
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
    cursor('grab');
  }
}

function mouseReleased() {
  dragging = false;
  cursor(ARROW);
}

function mouseWheel(event) {
  // coordonnées monde de la souris
  let worldX = (mouseX - width / 2 - panX) / zoom;
  let worldY = -(mouseY - height / 2 - panY) / zoom;

  let factor = 1 - event.delta * 0.001;
  zoom = constrain(zoom * factor, 0.1, 3000);

  // correction pour garder la souris fixe
  let newScreenX = worldX * zoom;
  let newScreenY = worldY * zoom;
  let oldScreenX = worldX * (zoom / factor);
  let oldScreenY = worldY * (zoom / factor);

  panX += oldScreenX - newScreenX;
  panY += -(oldScreenY - newScreenY);

  return false;
}


function touchStarted(e) {
  // si on touche un bouton / slider / input -> on laisse le navigateur gérer
  if (isOverHTMLElement()) return;

  if (touches.length === 1) {
    lastMouseX = touches[0].x;
    lastMouseY = touches[0].y;
    dragging = true;
  } else if (touches.length === 2) {
    pinchStartDist = dist(
      touches[0].x, touches[0].y,
      touches[1].x, touches[1].y
    );
  }
  // ⚠️ ne pas return false ici → sinon les boutons ne cliquent pas
}

function touchMoved(e) {
  if (isOverHTMLElement()) return;

  if (touches.length === 1 && dragging) {
    panX += touches[0].x - lastMouseX;
    panY += touches[0].y - lastMouseY;
    lastMouseX = touches[0].x;
    lastMouseY = touches[0].y;
  } else if (touches.length === 2 && pinchStartDist !== null) {
    let newDist = dist(
      touches[0].x, touches[0].y,
      touches[1].x, touches[1].y
    );
    let factor = newDist / pinchStartDist;
    zoom = constrain(zoom * factor, 10, 500);
    pinchStartDist = newDist;
  }
  return false; // ici on bloque le scroll de la page seulement pendant le drag/zoom
}

function touchEnded(e) {
  if (document.activeElement) document.activeElement.blur(); // retire le focus
  if (touches.length < 2) pinchStartDist = null;
  if (touches.length === 0) dragging = false;
}


// =======================
// 📏 GRADUATIONS DYNAMIQUES
// =======================
function getStep() {
  if (zoom>600) return 0.125;
  else if (zoom>300) return 0.25;
  else if (zoom>150) return 0.5;
  else if (zoom > 40) return 1;
  else if (zoom > 20) return 5;
  else if (zoom > 10) return 10;
  else if (zoom > 5) return 20;
  else if (zoom > 2) return 50;
  else if (zoom > 1) return 100;
  else if (zoom > .5) return 200;
  else if (zoom > .2) return 500;
  else return 1000;
}


function showMenu() {
  if (!menuOn) {
      menuOn=true;
      optionMenu.show();
    } else {
      optionMenu.hide();
      menuOn=false;
    }
  }
