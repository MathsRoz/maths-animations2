let functions = [];
let funcMenu;
let toggleMenuBtn;
let menuVisible = true;

const colorPalette = [
  "#e22121", // rouge
  "#1d9bf0", // bleu
  "#1dac35", // vert
  "#ffab51", // orange
  "#9b59b6", // violet
  "#e67e22", // marron/orangé
  "#16a085", // turquoise
  "#f1c40f"  // jaune
];


function setup() {
  

  // === Bouton toggle menu gauche ===
  toggleMenuBtn = createButton("☰");
  toggleMenuBtn.position(10, 10);
  toggleMenuBtn.class("p5btn");
  toggleMenuBtn.mousePressed(toggleMenu);

  // === Menu fonctions ===
  funcMenu = createDiv();
  funcMenu.style("position", "absolute");
  funcMenu.style("top", "50px");
  funcMenu.style("left", "0px");

  funcMenu.style("gap", "12px");
  funcMenu.style("padding", "12px");
  funcMenu.style("border-radius", "10px");
  funcMenu.style("max-height", "85vh");
  funcMenu.style("overflow-y", "auto");

  // bouton ajouter
  let addFuncBtn = createButton("+ Ajouter une expression");
addFuncBtn.parent(funcMenu);
addFuncBtn.class("p5btn");
addFuncBtn.mousePressed(() => addFunction("")); // ⚠️ pas de couleur fixe

// première fonction par défaut
addFunction("");

  preambuleSetup();
  preambuleSetup();
setupVariableSliders(); // 🔹 Ajout du panneau de variables
}

function draw() {
  preambuleDraw();
  drawFunctions();

}

function addFunction(expr = " ", color = null) {
  if (!color) {
    let index = functions.length % colorPalette.length;
    color = colorPalette[index];
  }

  let cont = createDiv();
  cont.parent(funcMenu);
  cont.class("func-card");

  // ✅ case à cocher
  let checkbox = createInput("", "checkbox");
  checkbox.parent(cont);
  checkbox.class("custom-checkbox");
  checkbox.elt.checked = true;

  // 🎨 couleur
  let colorPicker = createColorPicker(color);
  colorPicker.parent(cont);
  colorPicker.class("func-color");

  // ✏️ input complet (f(x)=...)
  let input = createInput(expr);
  input.parent(cont);
  input.class("func-input");
  input.style("font-size", "1.5rem");
  input.style("width", "200px");

  // ❌ bouton supprimer
  let delBtn = createButton("×");
  delBtn.parent(cont);
  delBtn.class("p5btn");
  delBtn.style("font-size", "1rempx");
  delBtn.style("font-align", "center");
  delBtn.style("padding", "2px 6px");
  delBtn.mousePressed(() => {
    cont.remove();
    functions = functions.filter(f => f.div !== cont);
  });

  functions.push({
    input,
    color: colorPicker,
    checkbox,
    div: cont,
    cachedExpr: null,
    compiledFn: null
  });
}



function preprocessExpr(expr) {
  // Nettoyer espaces
  expr = expr.replace(/\s+/g, "");

  // Enlever partie avant "=" (ex: f(x)=)
  if (expr.includes("=")) {
    expr = expr.split("=")[1];
  }

  // Puissances
  expr = expr.replace(/\^/g, "**");

  // Multiplications implicites
  expr = expr.replace(/(\d)([a-zA-Z])/g, "$1*$2");
  expr = expr.replace(/(\d)\(/g, "$1*(");
  expr = expr.replace(/\)(\d)/g, ")*$1");
  expr = expr.replace(/\)([a-zA-Z])/g, ")*$1");
  expr = expr.replace(/\)\(/g, ")*(");

  // Alias math
  expr = expr.replace(/\bln\(/g, "log(");
  expr = expr.replace(/\blog10\(/g, "log10(");
  expr = expr.replace(/\blog\(/g, "log10(");

  // Trigo
  expr = expr.replace(/\btg\(/g, "tan(");
  expr = expr.replace(/\bctg\(/g, "1/tan(");
  expr = expr.replace(/\bcot\(/g, "1/tan(");

  // Constantes
  expr = expr.replace(/\bpi\b/gi, "PI");
  expr = expr.replace(/\be\b/g, "E");

  // Corriger sin*(x)
  const functions = [
    "sin","cos","tan","log","log10","sqrt","abs","exp",
    "asin","acos","atan","sinh","cosh","tanh"
  ];
  for (let fn of functions) {
    expr = expr.replace(new RegExp(fn + "\\*\\(", "g"), fn + "(");
  }

  // Auto-fermer parenthèses
  let open = (expr.match(/\(/g) || []).length;
  let close = (expr.match(/\)/g) || []).length;
  if (open > close) expr += ")".repeat(open - close);

  return expr;
}









// === Évaluer fonction ===

function parseLocaleNumber(value) {
  if (typeof value !== "string") {
    value = String(value ?? "");
  }
  const cleaned = value.replace(/\s+/g, "").replace(/,/g, ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function parsePointExpression(rawExpr) {
  if (!rawExpr) return null;
  const expr = rawExpr.trim();
  const match = expr.match(/^([A-Za-z][A-Za-z0-9_]*)?\s*\(\s*([^)]+)\s*\)$/);
  if (!match) return null;

  const label = match[1] || null;
  const coords = match[2];
  let parts;

  if (coords.includes(";")) {
    parts = coords.split(";");
  } else if (coords.includes(",")) {
    parts = coords.split(",");
  } else {
    return null;
  }

  if (parts.length != 2) return null;

  const evaluatorX = createEvaluator(parts[0]);
const evaluatorY = createEvaluator(parts[1]);
const x = evaluatorX ? evaluatorX(0, varValues) : NaN;
const y = evaluatorY ? evaluatorY(0, varValues) : NaN;

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return { label, x, y };
}

function drawPointEntry(pointData, color) {
  const pos = worldtoScreen(pointData.x, pointData.y);

  push();
  stroke(color);
  fill(color);
  const size = Math.max(linesize * 3, 6);
  strokeWeight(linesize);
  ellipse(pos[0], pos[1], size, size);
  pop();

  if (!pointData.label) {
    return;
  }

  const screenX = pos[0];
  const screenY = -pos[1];
  const offset = Math.max(linesize * 4, 18);

  push();
  scale(1, -1);
  noStroke();
  fill(color);
  textSize(fsize);
  textAlign(LEFT, BOTTOM);
  text(pointData.label, screenX + offset, screenY - offset * 0.5);
  pop();
}

function createEvaluator(expr) {
  if (typeof expr !== "string") {
    return null;
  }
  const cleaned = expr.trim();
  if (!cleaned) {
    return null;
  }

  let processed;
  try {
    processed = preprocessExpr(expr);
  } catch (err) {
    return null;
  }

  if (!processed || !processed.trim()) {
    return null;
  }

  try {
    const compiled = Function("x", "vars", "with(Math){ with(vars){ return " + processed + "; } }");
    return function(x, vars = {}) {
  try {
    const value = compiled(x, vars);
        return Number.isFinite(value) ? value : NaN;
      } catch (runtimeError) {
        return NaN;
      }
    };
  } catch (compileError) {
    return null;
  }
}

function getEvaluator(entry, expr) {
  if (entry.cachedExpr === expr) {
    return entry.compiledFn;
  }

  const evaluator = createEvaluator(expr);
  entry.cachedExpr = expr;
  entry.compiledFn = evaluator;
  return evaluator;
}





// === Dessiner fonctions ===
function drawFunctions() {
  let wmax = (width/2-panX)/zoomX;
  let wmin = -(width/2+panX)/zoomX;
  let hmax = (height/2+panY)/zoomY;
  let hmin = -(height/2-panY)/zoomY;
  for (let f of functions) {
    if (!f.checkbox.elt.checked) continue;

    const expr = f.input.value();
    const col = f.color.value();

    const pointData = parsePointExpression(expr);
    if (pointData) {
      drawPointEntry(pointData, col);
      f.cachedExpr = expr;
      f.compiledFn = null;
      continue;
    }

    const evaluator = getEvaluator(f, expr);
    if (!evaluator) {
      continue;
    }

    stroke(col);
    strokeWeight(linesize);
    noFill();
    beginShape();

    for (let x = wmin; x < wmax; x += 0.5 / zoomX) {
      const y = evaluator(x, varValues);
      if (!isFinite(y) || Math.abs(y) > 1e7) {
        continue;
      }
      const pos = worldtoScreen(x, y);
      vertex(pos[0], pos[1]);
    }

    endShape();
  }
}

// === Toggle menu ===
function toggleMenu() {
  if (menuVisible) {
    funcMenu.hide();
    menuVisible = false;
  } else {
    funcMenu.show();
    menuVisible = true;
  }
}


function setupVariableSliders() {
  varsMenu = createDiv();
  varsMenu.style("position", "absolute");
  varsMenu.style("right", "10px");
  varsMenu.style("top", "60px");
  varsMenu.style("background", "#272929cc");
  varsMenu.style("padding", "10px");
  varsMenu.style("border-radius", "10px");
  varsMenu.style("color", "#fff");
  varsMenu.style("z-index", "5");

  // 🔸 exemple de variables de base
  addVariableSlider("a", 1, -10, 10, 0.1);
  addVariableSlider("b", 1, -10, 10, 0.1);
  addVariableSlider("c", 0, -10, 10, 0.1);
}

function addVariableSlider(name, start, min, max, step) {
  const cont = createDiv();
  cont.parent(varsMenu);
  cont.style("display", "flex");
  cont.style("align-items", "center");
  cont.style("gap", "8px");

  const label = createSpan(name + " =");
  label.parent(cont);
  label.style("width", "25px");

  const slider = createSlider(min, max, start, step);
  slider.parent(cont);
  slider.input(() => (varValues[name] = slider.value()));

  varSliders[name] = slider;
  varValues[name] = start;
}
