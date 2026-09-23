/* =====================================================================
   ¡A DIVIDIR! - Lógica de la aplicación
   ===================================================================== */

/* ---------------------------------------------------------------------
   0) NAVEGACIÓN ENTRE SECCIONES
   --------------------------------------------------------------------- */
function goToView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.nav === name);
  });
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('[data-nav]').forEach(el=>{
  el.addEventListener('click', ()=> goToView(el.dataset.nav));
});

/* ---------------------------------------------------------------------
   1) UTILIDADES
   --------------------------------------------------------------------- */
function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Simula el algoritmo clásico de la división "de la galera", cifra a
   cifra, devolviendo cada paso con: el número que se "baja", la cifra
   del cociente, el producto (cifra x divisor) y el resultado de la
   resta. */
function simulateDivision(dividend, divisor){
  const digits = String(dividend).split('').map(Number);
  const steps = [];
  let remainder = 0;
  let started = false;
  let quotientStr = '';
  let idx = 0;

  while (idx < digits.length){
    remainder = remainder * 10 + digits[idx];
    idx++;
    if (!started && remainder < divisor && idx < digits.length){
      continue; // seguimos "bajando" cifras hasta juntar un número >= divisor
    }
    started = true;
    const qDigit = Math.floor(remainder / divisor);
    const producto = qDigit * divisor;
    const bajada = remainder;
    const resta = remainder - producto;
    steps.push({ bajada, cociente: qDigit, producto, resta, digitsConsumidos: idx });
    quotientStr += String(qDigit);
    remainder = resta;
  }

  return {
    steps,
    cociente: parseInt(quotientStr, 10) || 0,
    resto: remainder
  };
}

/* Genera un ejercicio de división EXACTA (resto 0) con la cantidad de
   cifras pedida para el divisor y el dividendo. */
function generarEjercicio(divisorCifras, dividendoCifras){
  let divisor, low, high, Q, dividend;
  let intentos = 0;

  do {
    divisor = (divisorCifras === 1) ? randInt(2, 9) : randInt(11, 97);
    low = Math.ceil(Math.pow(10, dividendoCifras - 1) / divisor);
    high = Math.floor((Math.pow(10, dividendoCifras) - 1) / divisor);
    intentos++;
  } while (low > high && intentos < 200);

  if (low > high){ low = 1; high = 1; }

  Q = randInt(low, high);
  dividend = Q * divisor;

  const sim = simulateDivision(dividend, divisor);
  return { dividendo: dividend, divisor, ...sim };
}

/* ---------------------------------------------------------------------
   2) RENDERIZADO Y CORRECCIÓN DE EJERCICIOS (Nivel 1 y Nivel 2)
   --------------------------------------------------------------------- */
const nivelesConfig = [
  { key:'nivel1', divisorCifras:1, dificultades:[2,3,4,5] },
  { key:'nivel2', divisorCifras:2, dificultades:[2,3,4,5] }
];

const nivelesState = {}; // guarda dificultad actual y ejercicio actual por nivel

function statsKey(nivelKey, cifras){
  return `adividir_stats_${nivelKey}_${cifras}`;
}
function getStars(nivelKey, cifras){
  const raw = localStorage.getItem(statsKey(nivelKey, cifras));
  return raw ? JSON.parse(raw).stars || 0 : 0;
}
function saveStars(nivelKey, cifras, pct){
  let stars = 0;
  if (pct === 100) stars = 3;
  else if (pct >= 70) stars = 2;
  else if (pct >= 40) stars = 1;
  const prev = getStars(nivelKey, cifras);
  if (stars > prev){
    localStorage.setItem(statsKey(nivelKey, cifras), JSON.stringify({stars}));
  }
}

function buildDificultadSelector(nivel){
  const wrap = document.getElementById(nivel.key + '-dif');
  wrap.innerHTML = '';
  nivel.dificultades.forEach(cifras=>{
    const btn = document.createElement('button');
    btn.className = 'dif-btn';
    btn.dataset.cifras = cifras;
    const stars = getStars(nivel.key, cifras);
    btn.innerHTML = `${cifras} cifras <span class="dif-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span>`;
    btn.addEventListener('click', ()=>{
      nivelesState[nivel.key].cifras = cifras;
      wrap.querySelectorAll('.dif-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      nuevoEjercicio(nivel);
    });
    wrap.appendChild(btn);
  });
  wrap.querySelector('.dif-btn').classList.add('active');
}

function nuevoEjercicio(nivel){
  const cifras = nivelesState[nivel.key].cifras;
  const ex = generarEjercicio(nivel.divisorCifras, cifras);
  nivelesState[nivel.key].ejercicio = ex;
  renderEjercicio(nivel, ex);
}

const STEP_COLOR_CLASSES = ['step-c0','step-c1','step-c2','step-c3','step-c4'];
function stepColorClass(i){ return STEP_COLOR_CLASSES[i % STEP_COLOR_CLASSES.length]; }

/* Determina la clase de color a aplicar según el índice del paso. */

function renderEjercicio(nivel, ex){
  const container = document.getElementById(nivel.key + '-exercise');
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'ex-card';

  const body = document.createElement('div');
  body.className = 'division-body';

  // ---- Fila superior: columna del dividendo (con los pasos abajo) + divisor/cociente ----
  const galeraRow = document.createElement('div');
  galeraRow.className = 'galera-row';

  const dividendoCol = document.createElement('div');
  dividendoCol.className = 'dividendo-column';

  const dividendoNum = document.createElement('div');
  dividendoNum.className = 'dividendo-num mono-digits';
  dividendoNum.innerHTML = String(ex.dividendo).split('').map(d => `<span class="dig">${d}</span>`).join('');
  dividendoCol.appendChild(dividendoNum);

  ex.steps.forEach((step, i)=>{
    const isLast = (i === ex.steps.length - 1);
    const color = stepColorClass(i);
    // Ancho en cifras (celdas de --digit-w) = cantidad de cifras del
    // dividendo ya bajadas hasta este paso. Al usar la MISMA celda que el
    // dividendo de arriba (misma fuente, mismo ancho) y alinear el texto a
    // la derecha, la última cifra de cada casillero cae exactamente debajo
    // de la cifra del dividendo que le corresponde.
    const c = step.digitsConsumidos;
    const anchoCifras = `calc(${c} * var(--digit-w))`;
    // El casillero del RESULTADO de la resta muestra, en los pasos que no
    // son el último, el número que ya incluye la próxima cifra bajada
    // (una cifra más que "c") — por eso necesita su propio ancho, si no
    // esa cifra queda tapada/recortada.
    const cResultado = isLast ? c : ex.steps[i+1].digitsConsumidos;
    const anchoResultado = `calc(${cResultado} * var(--digit-w))`;

    const restaRow = document.createElement('div');
    restaRow.className = 'vp-resta-row';
    restaRow.innerHTML = `
      <span class="vp-minus ${color}">−</span>
      <input type="text" inputmode="numeric" class="vp-producto-input mono-digits ${color}" data-step="${i}" style="width:${anchoCifras};">
    `;
    dividendoCol.appendChild(restaRow);

    const underline = document.createElement('div');
    underline.className = 'vp-underline ' + color;
    underline.style.width = anchoCifras;
    dividendoCol.appendChild(underline);

    const resultRow = document.createElement('div');
    resultRow.className = 'vp-resultado-row';
    resultRow.innerHTML = `<input type="text" inputmode="numeric" class="vp-resultado-input mono-digits" data-step="${i}" style="width:${anchoResultado};">` +
      (isLast ? `<span class="vp-resto-tag">Resto</span>` : '');
    dividendoCol.appendChild(resultRow);
  });

  galeraRow.appendChild(dividendoCol);

  const galeraL = document.createElement('div');
  galeraL.className = 'galera-l';
  galeraL.innerHTML = `
    <div class="divisor-bracket"><span class="divisor-num mono-digits">${ex.divisor}</span></div>
    <div class="cociente-boxes" id="${nivel.key}-cociente-boxes"></div>
  `;
  galeraRow.appendChild(galeraL);

  body.appendChild(galeraRow);

  const cocBoxes = galeraL.querySelector('.cociente-boxes');
  ex.steps.forEach((s, i)=>{
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.inputMode = 'numeric';
    inp.maxLength = 1;
    inp.className = 'cociente-input ' + stepColorClass(i);
    inp.dataset.step = i;
    cocBoxes.appendChild(inp);
  });

  // ---- Cálculos auxiliares ----
  const auxWrap = document.createElement('div');
  auxWrap.className = 'aux-calc-panel';
  auxWrap.innerHTML = `
    <div class="aux-title">🧮 CÁLCULOS AUX.<br><span style="font-weight:500;">(borrador libre, no se corrige)</span></div>
    <textarea placeholder="Usá este espacio para hacer las multiplicaciones que necesites, por ejemplo:&#10;${ex.divisor} x 2 = ..."></textarea>
  `;
  body.appendChild(auxWrap);

  card.appendChild(body);

  // ---- Acciones ----
  const actions = document.createElement('div');
  actions.className = 'ex-actions';
  actions.innerHTML = `
    <button class="btn btn-primary" id="${nivel.key}-comprobar">✅ Comprobar</button>
    <button class="btn btn-secondary" id="${nivel.key}-solucion">👀 Ver solución</button>
    <button class="btn btn-secondary" id="${nivel.key}-otro">🔄 Otro ejercicio</button>
  `;
  card.appendChild(actions);

  const feedback = document.createElement('div');
  feedback.className = 'feedback-box';
  feedback.id = nivel.key + '-feedback';
  card.appendChild(feedback);

  container.appendChild(card);

  // ---- Eventos ----
  document.getElementById(nivel.key + '-comprobar').addEventListener('click', ()=>{
    corregirEjercicio(nivel, ex);
  });
  document.getElementById(nivel.key + '-solucion').addEventListener('click', ()=>{
    mostrarSolucion(nivel, ex);
  });
  document.getElementById(nivel.key + '-otro').addEventListener('click', ()=>{
    nuevoEjercicio(nivel);
  });
}

function corregirEjercicio(nivel, ex){
  const container = document.getElementById(nivel.key + '-exercise');
  let total = 0;
  let correctos = 0;

  ex.steps.forEach((step, i)=>{
    total += 1;
    correctos += chequearCampo(container, `.cociente-input[data-step="${i}"]`, step.cociente);

    total += 1;
    correctos += chequearCampo(container, `.vp-producto-input[data-step="${i}"]`, step.producto);

    total += 1;
    const isLast = (i === ex.steps.length - 1);
    const esperado = isLast ? ex.resto : ex.steps[i+1].bajada;
    correctos += chequearCampo(container, `.vp-resultado-input[data-step="${i}"]`, esperado);
  });

  const pct = Math.round((correctos / total) * 100);
  const cifras = nivelesState[nivel.key].cifras;
  saveStars(nivel.key, cifras, pct);
  buildDificultadSelector(nivelesConfig.find(n=>n.key===nivel.key));
  // re-marcar la dificultad activa
  document.querySelectorAll(`#${nivel.key}-dif .dif-btn`).forEach(b=>{
    if (parseInt(b.dataset.cifras,10) === cifras) b.classList.add('active');
  });

  const fb = document.getElementById(nivel.key + '-feedback');
  fb.classList.remove('ok','bad');
  fb.classList.add('show', pct === 100 ? 'ok' : 'bad');
  if (pct === 100){
    fb.textContent = `🎉 ¡Perfecto! Cociente: ${ex.cociente} — Resto: ${ex.resto}. ¡Toda la división está bien!`;
  } else {
    fb.textContent = `Tenés ${correctos} de ${total} casilleros correctos (${pct}%). Revisá los casilleros en rojo y volvé a intentar, o mirá la solución.`;
  }
}

function chequearCampo(scope, selector, valorCorrecto){
  const el = scope.querySelector(selector);
  el.classList.remove('correcto','incorrecto');
  const val = parseInt((el.value || '').trim(), 10);
  const ok = (val === valorCorrecto);
  el.classList.add(ok ? 'correcto' : 'incorrecto');
  return ok ? 1 : 0;
}

function mostrarSolucion(nivel, ex){
  const container = document.getElementById(nivel.key + '-exercise');
  ex.steps.forEach((step, i)=>{
    container.querySelector(`.cociente-input[data-step="${i}"]`).value = step.cociente;
    container.querySelector(`.vp-producto-input[data-step="${i}"]`).value = step.producto;
    const isLast = (i === ex.steps.length - 1);
    const esperado = isLast ? ex.resto : ex.steps[i+1].bajada;
    container.querySelector(`.vp-resultado-input[data-step="${i}"]`).value = esperado;
  });
  container.querySelectorAll('input').forEach(i=>i.classList.remove('correcto','incorrecto'));
  const fb = document.getElementById(nivel.key + '-feedback');
  fb.classList.remove('bad'); fb.classList.add('show','ok');
  fb.textContent = `Solución: ${ex.dividendo} ÷ ${ex.divisor} = ${ex.cociente} (resto ${ex.resto}). Probá ahora con "Otro ejercicio".`;
}

/* Inicializar Nivel 1 y Nivel 2 */
nivelesConfig.forEach(nivel=>{
  nivelesState[nivel.key] = { cifras: nivel.dificultades[0], ejercicio:null };
  buildDificultadSelector(nivel);
  nuevoEjercicio(nivel);
  document.getElementById(nivel.key + '-nuevo').addEventListener('click', ()=> nuevoEjercicio(nivel));
});

/* ---------------------------------------------------------------------
   3) TUTORIAL PASO A PASO
   --------------------------------------------------------------------- */
const TUT_EJEMPLO = simulateDivision(156, 6); // 156 ÷ 6 = 26, ejemplo fijo y amigable

function tutMiniGalera(dividendo, divisor, hastaPaso){
  // arma una mini "galera" mostrando el cociente parcial construido
  // hasta el paso indicado (hastaPaso = -1 significa ninguno todavía)
  let cocienteParcial = '';
  for (let i=0;i<=hastaPaso;i++){
    cocienteParcial += TUT_EJEMPLO.steps[i].cociente;
  }
  return `
    <div class="mini-galera">
      <span>${dividendo}</span>
      <div class="galera-l" style="min-width:56px;">
        <div class="divisor-bracket"><span class="divisor-num mono-digits" style="font-size:1.6rem;">${divisor}</span></div>
        <div style="min-height:1.6rem;margin-top:.35rem;color:var(--primary-dark);">${cocienteParcial}</div>
      </div>
    </div>
  `;
}

const tutorialSlides = [
  {
    html: `
      <h3>Las partes de la división</h3>
      <p>Antes de empezar, recordemos cómo se llama cada elemento de una división:</p>
      <div class="partes-diagram">
        <div class="parte-item"><div class="parte-num">156</div><div class="parte-label lbl-dividendo">Dividendo</div></div>
        <div class="parte-item"><div class="parte-num">6</div><div class="parte-label lbl-divisor">Divisor</div></div>
        <div class="parte-item"><div class="parte-num">26</div><div class="parte-label lbl-cociente">Cociente</div></div>
        <div class="parte-item"><div class="parte-num">0</div><div class="parte-label lbl-resto">Resto</div></div>
      </div>
      <p>El <strong>dividendo</strong> es el número que se reparte. El <strong>divisor</strong> es en cuántas partes se reparte. El <strong>cociente</strong> es el resultado, y el <strong>resto</strong> es lo que sobra (si sobra algo).</p>
    `
  },
  {
    html: `
      <h3>Paso 1: elegir las primeras cifras</h3>
      <p>Vamos a resolver <strong>156 ÷ 6</strong> juntos. Primero tomamos, de izquierda a derecha, la cantidad mínima de cifras del dividendo que forman un número <span class="tut-highlight">mayor o igual al divisor</span>.</p>
      ${tutMiniGalera('1 5 6', 6, -1)}
      <p>Como el 6 tiene una sola cifra, empezamos tomando solo el primer <strong>1</strong>... pero 1 es menor que 6, así que tomamos una cifra más: <span class="tut-highlight">15</span>.</p>
    `
  },
  {
    html: `
      <h3>Paso 2: buscar el cociente y multiplicar</h3>
      <p>Nos preguntamos: <strong>¿cuántas veces entra el 6 en el 15?</strong> Buscamos el número más grande que, multiplicado por 6, no se pase de 15.</p>
      <p>2 × 6 = 12 (no se pasa) — 3 × 6 = 18 (se pasa). ¡Entonces el cociente parcial es <span class="tut-highlight">2</span>!</p>
      ${tutMiniGalera('15', 6, 0)}
      <p>Anotamos el <strong>2</strong> en el cociente, y calculamos el producto: 2 × 6 = <span class="tut-highlight">12</span>.</p>
    `
  },
  {
    html: `
      <h3>Paso 3: restar</h3>
      <p>Restamos ese producto al número que teníamos: 15 − 12 = <span class="tut-highlight">3</span>.</p>
      <p>Ese 3 es lo que "sobra" hasta este momento (todavía no es el resto final, porque quedan más cifras por bajar).</p>
    `
  },
  {
    html: `
      <h3>Paso 4: bajar la próxima cifra</h3>
      <p>Bajamos la siguiente cifra del dividendo (el <strong>6</strong> de 15<u>6</u>) y la ponemos al lado del 3, formando el número <span class="tut-highlight">36</span>.</p>
      <p>Repetimos el paso 2: ¿cuántas veces entra el 6 en 36? Exacto, <span class="tut-highlight">6</span> veces (6 × 6 = 36).</p>
      ${tutMiniGalera('156', 6, 1)}
    `
  },
  {
    html: `
      <h3>Paso 5: repetir hasta terminar</h3>
      <p>Restamos: 36 − 36 = 0. Como ya no quedan más cifras para bajar, ¡terminamos!</p>
      ${tutMiniGalera('156', 6, 1)}
      <p><strong>Cociente final: 26 — Resto: 0.</strong> Como el resto es 0, decimos que la división es <span class="tut-highlight">exacta</span>.</p>
      <p>En los niveles de esta app vas a practicar exactamente este mecanismo: en cada paso vas a escribir el número que bajás, la cifra del cociente, el producto y la resta.</p>
    `
  },
  {
    html: `
      <h3>¿Y con divisor de 2 cifras?</h3>
      <p>El mecanismo es <strong>el mismo</strong>. La única diferencia es que hay que "tantear" un poco más para encontrar la cifra del cociente, porque hay más posibilidades.</p>
      <p>Por ejemplo, en 3478 ÷ 26: tomamos primero <strong>34</strong> (dos cifras, como el divisor). Como 34 ≥ 26, ya podemos dividir: 1 × 26 = 26, resta 8. Bajamos el 7 → 87. Buscamos cuántas veces entra 26 en 87 (3 veces, 3×26=78, resta 9). Bajamos el 8 → 98. Y así seguimos hasta terminar.</p>
      <p>💡 Tip: usá el espacio de <strong>cálculos auxiliares</strong> para probar multiplicaciones (2×26, 3×26, 4×26...) antes de decidir qué cifra poner en el cociente.</p>
    `
  }
];

let tutIndex = 0;
function renderTutorial(){
  document.getElementById('tutorial-slide').innerHTML = tutorialSlides[tutIndex].html;
  document.getElementById('tut-progress').textContent = `${tutIndex+1} / ${tutorialSlides.length}`;
  document.getElementById('tut-prev').disabled = (tutIndex === 0);
  document.getElementById('tut-next').textContent = (tutIndex === tutorialSlides.length-1) ? '🔁 Volver al inicio' : 'Siguiente ➡';
}
document.getElementById('tut-prev').addEventListener('click', ()=>{
  if (tutIndex > 0){ tutIndex--; renderTutorial(); }
});
document.getElementById('tut-next').addEventListener('click', ()=>{
  if (tutIndex < tutorialSlides.length - 1){ tutIndex++; }
  else { tutIndex = 0; }
  renderTutorial();
});
renderTutorial();

/* ---------------------------------------------------------------------
   4) TABLAS DE MULTIPLICAR
   --------------------------------------------------------------------- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tablas-panel').forEach(p=>p.classList.remove('active'));
    document.getElementById('tablas-' + btn.dataset.tab).classList.add('active');
  });
});

// --- Consulta de tabla ---
const tablaSelector = document.getElementById('tabla-selector');
for (let n=1; n<=10; n++){
  const chip = document.createElement('button');
  chip.className = 'tabla-chip';
  chip.textContent = n;
  chip.addEventListener('click', ()=>{
    tablaSelector.querySelectorAll('.tabla-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    mostrarTabla(n);
  });
  tablaSelector.appendChild(chip);
}
function mostrarTabla(n){
  const res = document.getElementById('tabla-resultado');
  let html = '';
  for (let i=1;i<=10;i++){
    html += `<div class="tabla-fila"><span>${n} × ${i}</span><span>${n*i}</span></div>`;
  }
  res.innerHTML = html;
}
tablaSelector.querySelector('.tabla-chip').classList.add('active');
mostrarTabla(1);

// --- Practicar tablas ---
let practicaActual = { a:0, b:0 };
let practicaAciertos = 0;
let practicaTotal = 0;

function nuevaPreguntaPractica(){
  practicaActual.a = randInt(1,10);
  practicaActual.b = randInt(1,10);
  document.getElementById('practica-pregunta').textContent = `¿Cuánto es ${practicaActual.a} × ${practicaActual.b}?`;
  const input = document.getElementById('practica-input');
  input.value = '';
  input.classList.remove('correcto','incorrecto');
  input.focus();
  const fb = document.getElementById('practica-feedback');
  fb.textContent = '';
  fb.className = 'practica-feedback';
}
function corregirPractica(){
  const input = document.getElementById('practica-input');
  const val = parseInt(input.value, 10);
  const correcto = practicaActual.a * practicaActual.b;
  practicaTotal++;
  const fb = document.getElementById('practica-feedback');
  if (val === correcto){
    practicaAciertos++;
    input.classList.remove('incorrecto'); input.classList.add('correcto');
    fb.textContent = '¡Correcto! 🎉';
    fb.className = 'practica-feedback ok';
  } else {
    input.classList.remove('correcto'); input.classList.add('incorrecto');
    fb.textContent = `Era ${correcto}. ¡Seguí practicando!`;
    fb.className = 'practica-feedback bad';
  }
  document.getElementById('practica-aciertos').textContent = practicaAciertos;
  document.getElementById('practica-total').textContent = practicaTotal;
}
document.getElementById('practica-comprobar').addEventListener('click', corregirPractica);
document.getElementById('practica-siguiente').addEventListener('click', nuevaPreguntaPractica);
document.getElementById('practica-input').addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') corregirPractica();
});
nuevaPreguntaPractica();
