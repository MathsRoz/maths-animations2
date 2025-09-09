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
funcMenu.style("left", "10px");

  funcMenu.style("gap", "12px");
  funcMenu.style("padding", "12px");
  funcMenu.style("border-radius", "10px");
  funcMenu.style("max-height", "85vh");
  funcMenu.style("overflow-y", "auto");

  // bouton ajouter
  let addFuncBtn = createButton("+ Ajouter une fonction");
addFuncBtn.parent(funcMenu);
addFuncBtn.class("p5btn");
addFuncBtn.mousePressed(() => addFunction("f(x)=")); // ⚠️ pas de couleur fixe

// première fonction par défaut
addFunction("f(x)=");

  preambuleSetup();
}

function draw() {
  preambuleDraw();
  drawFunctions();

}

function addFunction(expr = "f(x)=", color = null) {
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

  // ❌ bouton supprimer
  let delBtn = createButton("×");
  delBtn.parent(cont);
  delBtn.class("p5btn");
  delBtn.style("font-size", "14px");
  delBtn.style("font-align", "center");
  delBtn.style("padding", "2px 6px");
  delBtn.mousePressed(() => {
    cont.remove();
    functions = functions.filter(f => f.div !== cont);
  });

  functions.push({ input, color: colorPicker, checkbox, div: cont });
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
function evalFunction(expr, x) {
  try {
    expr = preprocessExpr(expr);
    return Function("x", "with(Math){ return " + expr + "; }")(x);
  } catch (e) {
    console.error("Erreur d'évaluation :", e);
    return NaN;
  }
}




// === Dessiner fonctions ===
function drawFunctions() {
  for (let f of functions) {
    if (!f.checkbox.elt.checked) continue; // ❌ ignorer si décoché

    let expr = f.input.value();
    let col = f.color.value();

    stroke(col);
    strokeWeight(linesize);
    noFill();
    beginShape();

    let step = 1 / zoom;
    for (let x = -(width/2+panX)/zoom; x < (width/2-panX)/zoom; x += step) {
      let y = evalFunction(expr, x);
      if (isFinite(y)) vertex(x, y);
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
