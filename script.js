/*******************************************************************
 * Configuración principal
 *******************************************************************/
let charges = [];       // Arreglo de cargas que representan la barra
let testCharge;         // Carga de prueba (punto P)
const numBarCharges = 9; // Número de cargas en la barra
const barLength = 180;   // Longitud de la barra en píxeles
const chargeValue = 1;   // Valor de cada carga de la barra
const testChargeValue = 1; // Valor de la carga de prueba
const fieldLineSeeds = []; // Puntos semilla para trazar las líneas de campo
const numSeedsPerCharge = 10; // Semillas alrededor de cada carga
const stepSize = 2;      // Paso al avanzar en las líneas
const maxSteps = 800;    // Máximo número de pasos al trazar una línea

/*******************************************************************
 * Setup de p5.js
 *******************************************************************/
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Crear las cargas de la "barra" centradas en la pantalla
  const startX = width / 2 - barLength / 2;
  const spacing = barLength / (numBarCharges - 1);
  const yPos = height / 2; // Barra horizontal centrada en pantalla

  for (let i = 0; i < numBarCharges; i++) {
    const xPos = startX + i * spacing;
    charges.push({
      x: xPos,
      y: yPos,
      q: chargeValue
    });
  }

  // Carga de prueba inicialmente arriba de la barra
  testCharge = {
    x: width / 2,
    y: height / 2 - 150,
    q: testChargeValue,
    r: 12,
    beingDragged: false
  };

  // Generar semillas para líneas de campo
  generateFieldLineSeeds();
}

/*******************************************************************
 * Función draw de p5.js
 *******************************************************************/
function draw() {
  background(0);

  // Dibujar la barra de forma estética
  drawBar();

  // Dibujar la carga de prueba
  fill(100, 200, 255);
  noStroke();
  ellipse(testCharge.x, testCharge.y, testCharge.r * 2);

  // Dibujar líneas de campo
  for (let seed of fieldLineSeeds) {
    const linePoints = traceFieldLine(seed.x, seed.y);
    drawFieldLine(linePoints);
  }

  // Dibujar el vector de campo en la posición de la carga de prueba
  drawFieldVectorAtTestCharge();

  // Si se está arrastrando la carga de prueba, actualizar posición
  if (testCharge.beingDragged) {
    testCharge.x = mouseX;
    testCharge.y = mouseY;
  }
}

/*******************************************************************
 * Dibujar la barra como un rectángulo con signos de "+"
 *******************************************************************/
function drawBar() {
  // Calculamos extremos de la barra
  const barY = height / 2;
  const barX1 = charges[0].x;
  const barX2 = charges[charges.length - 1].x;

  // Dibujar un rectángulo como "barra"
  push();
  noStroke();
  fill(255, 100, 100);
  rectMode(CORNERS);
  rect(barX1 - 5, barY - 6, barX2 + 5, barY + 6);
  pop();

  // Encima de la barra, dibujar pequeños "+" en cada carga
  push();
  stroke(255);
  strokeWeight(2);
  for (let c of charges) {
    // Línea horizontal
    line(c.x - 3, c.y, c.x + 3, c.y);
    // Línea vertical
    line(c.x, c.y - 3, c.x, c.y + 3);
  }
  pop();
}

/*******************************************************************
 * Generar semillas para líneas de campo
 *******************************************************************/
function generateFieldLineSeeds() {
  fieldLineSeeds.length = 0; // Limpiar array

  // Para cada carga de la barra, ponemos semillas alrededor
  for (let c of charges) {
    for (let i = 0; i < numSeedsPerCharge; i++) {
      const angle = (TWO_PI / numSeedsPerCharge) * i;
      const radius = 20; // Distancia inicial de la semilla
      const sx = c.x + radius * cos(angle);
      const sy = c.y + radius * sin(angle);
      fieldLineSeeds.push({ x: sx, y: sy });
    }
  }

  // También podemos poner semillas alrededor de la carga de prueba
  // para ver cómo interactúa, aunque sea un test charge
  
  for (let i = 0; i < numSeedsPerCharge; i++) {
    const angle = (TWO_PI / numSeedsPerCharge) * i;
    const radius = 20;
    const sx = testCharge.x + radius * cos(angle);
    const sy = testCharge.y + radius * sin(angle);
    fieldLineSeeds.push({ x: sx, y: sy });
  }
  
}

/*******************************************************************
 * Trazar una línea de campo desde un punto semilla
 *******************************************************************/
function traceFieldLine(startX, startY) {
  const points = [];
  let x = startX;
  let y = startY;

  for (let i = 0; i < maxSteps; i++) {
    points.push({ x, y });

    // Calcular el campo eléctrico en (x, y)
    const E = electricField(x, y);
    const mag = sqrt(E.x * E.x + E.y * E.y);

    if (mag < 0.0001) {
      // Campo muy débil, detenemos
      break;
    }

    // Moverse un pequeño paso en dirección del campo
    x += (E.x / mag) * stepSize;
    y += (E.y / mag) * stepSize;

    // Detener si sale de la pantalla
    if (x < 0 || x > width || y < 0 || y > height) {
      break;
    }

    // Detener si está muy cerca de alguna carga
    if (tooCloseToACharge(x, y)) {
      break;
    }
  }

  return points;
}

/*******************************************************************
 * Dibujar la línea de campo con curva suave y algo de transparencia
 *******************************************************************/
function drawFieldLine(linePoints) {
  if (linePoints.length < 2) return;

  stroke(255, 150);   // Blanco semitransparente
  strokeWeight(1.5);
  noFill();
  beginShape();
  // Truco para curveVertex: duplicar primeros y últimos puntos
  curveVertex(linePoints[0].x, linePoints[0].y);
  for (let p of linePoints) {
    curveVertex(p.x, p.y);
  }
  const lastP = linePoints[linePoints.length - 1];
  curveVertex(lastP.x, lastP.y);
  endShape();
}

/*******************************************************************
 * Calcular el campo eléctrico total en (x, y) debido a la barra
 * + (opcional) la carga de prueba.
 * Nota: Físicamente, la "carga de prueba" no suele agregarse
 *       al campo que se mide, pero si deseas ver el efecto
 *       total, lo dejamos aquí.
 *******************************************************************/
function electricField(x, y) {
  let Ex = 0;
  let Ey = 0;

  // Contribución de las cargas de la barra
  for (let c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy;
    if (r2 === 0) continue; // Evitar división por cero
    const r = sqrt(r2);
    const factor = c.q / r2; // k=1 para simplificar
    Ex += factor * (dx / r);
    Ey += factor * (dy / r);
  }

  // Contribución de la carga de prueba (opcional)
  {
    const dx = x - testCharge.x;
    const dy = y - testCharge.y;
    const r2 = dx * dx + dy * dy;
    if (r2 !== 0) {
      const r = sqrt(r2);
      const factor = testCharge.q / r2;
      Ex += factor * (dx / r);
      Ey += factor * (dy / r);
    }
  }

  return { x: Ex, y: Ey };
}

/*******************************************************************
 * Verificar si (x, y) está muy cerca de alguna carga
 *******************************************************************/
function tooCloseToACharge(x, y) {
  const threshold = 8; // distancia mínima
  for (let c of charges) {
    if (dist(x, y, c.x, c.y) < threshold) {
      return true;
    }
  }
  if (dist(x, y, testCharge.x, testCharge.y) < threshold) {
    return true;
  }
  return false;
}

/*******************************************************************
 * Dibujar un vector de campo en la posición de la carga de prueba,
 * con longitud que depende de la magnitud real del campo.
 *******************************************************************/
function drawFieldVectorAtTestCharge() {
    const E = electricField(testCharge.x, testCharge.y);
    const mag = sqrt(E.x * E.x + E.y * E.y);
    if (mag > 0.0001) {
      push();
      stroke(0, 255, 0);
      strokeWeight(2);
      fill(0, 255, 0);
  
      const scale = 30; // Escalar para que la flecha sea visible
      const ex = E.x / mag * scale; 
      const ey = E.y / mag * scale;
  
      translate(testCharge.x, testCharge.y);
      line(0, 0, ex, ey);
  
      // Pequeña punta de flecha
      push();
      translate(ex, ey);
      rotate(atan2(ey, ex));
      const arrowSize = 5;
      line(0, 0, -arrowSize, arrowSize / 2);
      line(0, 0, -arrowSize, -arrowSize / 2);
      pop();
  
      pop();
    }
  }

/*******************************************************************
 * Eventos de ratón para arrastrar la carga de prueba
 *******************************************************************/
function mousePressed() {
  const d = dist(mouseX, mouseY, testCharge.x, testCharge.y);
  if (d < testCharge.r) {
    testCharge.beingDragged = true;
  }
}

function mouseReleased() {
  testCharge.beingDragged = false;
  // Al soltar la carga, regeneramos semillas
  generateFieldLineSeeds();
}
