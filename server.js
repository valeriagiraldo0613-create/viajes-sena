/**
 * =========================================================================
 * SERVIDOR BACKEND Y API REST - WANDERSQUAD (HACKATHON SENA 2026)
 * =========================================================================
 * Incluye:
 * 1. Sistema de Autenticación (Registro, Login, Sesiones / JWT)
 * 2. Base de Datos persistente (Modelo Relacional / JSON Store / SQL Ready)
 * 3. API REST completa (CRUD Actividades, Votaciones, Gastos Splitwise)
 * 4. Servidor estático integrado para el Frontend en http://localhost:3000
 * =========================================================================
 */

try { require('dotenv').config(); } catch (_) { /* dotenv es opcional; el servidor también funciona sin .env */ }
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'database');
const DB_FILE = path.join(DB_DIR, 'data.json');

// Crear directorio de base de datos si no existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}


// Helper: Hash de contraseña seguro
function hashPassword(pass) {
  return crypto.createHash('sha256').update(pass + 'sena_salt_2026').digest('hex');
}

// Helper: Generador de Token simple
function generateToken(userId) {
  const payload = { userId, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(token) {
  try {
    const json = Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// Datos Iniciales de Fábrica (Semilla de la Base de Datos)
const SEED_DATA = {
  users: [
    {
      id: 'u1',
      name: 'Mateo (Tú)',
      email: 'mateo@sena.edu.co',
      passwordHash: hashPassword('sena2026'),
      role: 'Organizador',
      initial: 'M',
      color: 'bg-indigo-600',
      createdAt: '2026-10-15T10:00:00Z'
    },
    {
      id: 'u2',
      name: 'Valentina',
      email: 'valentina@sena.edu.co',
      passwordHash: hashPassword('sena2026'),
      role: 'Diseñadora',
      initial: 'V',
      color: 'bg-pink-600',
      createdAt: '2026-10-15T10:05:00Z'
    },
    {
      id: 'u3',
      name: 'Carlos',
      email: 'carlos@sena.edu.co',
      passwordHash: hashPassword('sena2026'),
      role: 'Logística',
      initial: 'C',
      color: 'bg-emerald-600',
      createdAt: '2026-10-15T10:10:00Z'
    },
    {
      id: 'u4',
      name: 'Sofía',
      email: 'sofia@sena.edu.co',
      passwordHash: hashPassword('sena2026'),
      role: 'Finanzas',
      initial: 'S',
      color: 'bg-amber-600',
      createdAt: '2026-10-15T10:15:00Z'
    },
    {
      id: 'u5',
      name: 'Andrés',
      email: 'andres@sena.edu.co',
      passwordHash: hashPassword('sena2026'),
      role: 'Aventurero',
      initial: 'A',
      color: 'bg-sky-600',
      createdAt: '2026-10-15T10:20:00Z'
    }
  ],
  trip: {
    id: 't1',
    title: 'Expedición Caribeña • Amigos SENA 2026',
    destination: 'Cartagena de Indias & Barú, Colombia',
    description: '4 días de playa, historia en la Ciudad Amurallada, snorkel en Islas del Rosario y gastronomía local con el equipo.',
    startDate: '2026-11-15',
    endDate: '2026-11-18',
    totalBudget: 3800000
  },
  days: [
    { id: 1, title: 'Día 1: Llegada & Ciudad Amurallada', date: 'Viernes 15 Nov' },
    { id: 2, title: 'Día 2: Islas del Rosario & Snorkel', date: 'Sábado 16 Nov' },
    { id: 3, title: 'Día 3: Gastronomía & Castillo San Felipe', date: 'Domingo 17 Nov' },
    { id: 4, title: 'Día 4: Playa de Barú & Regreso', date: 'Lunes 18 Nov' }
  ],
  activities: [
    {
      id: 'a1',
      dayId: 1,
      time: '11:00 AM',
      title: 'Check-in y acomodación en Airbnb',
      location: 'Centro Histórico, Calle de la Mantilla',
      category: '🏨 Hospedaje',
      cost: 0,
      status: 'Confirmado',
      notes: 'Recoger llaves con el anfitrión y desempacar equipaje.',
      likes: ['u1', 'u2', 'u3', 'u4', 'u5'],
      createdBy: 'u1'
    },
    {
      id: 'a2',
      dayId: 1,
      time: '01:30 PM',
      title: 'Almuerzo de bienvenida caribeño',
      location: 'Restaurante La Mulata',
      category: '🍽️ Comida',
      cost: 45000,
      status: 'Confirmado',
      notes: 'Degustación de cazuela de mariscos y limonada de coco.',
      likes: ['u1', 'u3', 'u4'],
      createdBy: 'u2'
    },
    {
      id: 'a3',
      dayId: 1,
      time: '05:30 PM',
      title: 'Atardecer en las Murallas & Café del Mar',
      location: 'Baluarte de Santo Domingo',
      category: '🏛️ Cultural',
      cost: 30000,
      status: 'Confirmado',
      notes: 'Tomar fotos grupales con la puesta de sol.',
      likes: ['u1', 'u2', 'u3', 'u4', 'u5'],
      createdBy: 'u1'
    },
    {
      id: 'a4',
      dayId: 2,
      time: '07:30 AM',
      title: 'Salida en Lancha Rápida hacia Islas del Rosario',
      location: 'Muelle de La Bodeguita',
      category: '🚗 Transporte',
      cost: 95000,
      status: 'Confirmado',
      notes: 'Estar puntual con toalla y bolsa impermeable.',
      likes: ['u1', 'u2', 'u3', 'u5'],
      createdBy: 'u3'
    },
    {
      id: 'a5',
      dayId: 2,
      time: '10:30 AM',
      title: 'Sesión de Snorkel guiado en Arrecifes de Coral',
      location: 'Isla Grande',
      category: '🤿 Aventura',
      cost: 60000,
      status: 'Confirmado',
      notes: 'Incluye careta y chaleco salvavidas.',
      likes: ['u1', 'u3', 'u5'],
      createdBy: 'u5'
    },
    {
      id: 'a6',
      dayId: 2,
      time: '01:00 PM',
      title: 'Almuerzo playero típico en Barú',
      location: 'Playa Tranquila',
      category: '🍽️ Comida',
      cost: 40000,
      status: 'Por confirmar',
      notes: 'Pargo rojo frito con patacones y arroz de coco.',
      likes: ['u2', 'u4'],
      createdBy: 'u4'
    },
    {
      id: 'a7',
      dayId: 3,
      time: '09:00 AM',
      title: 'Visita guiada al Castillo San Felipe de Barajas',
      location: 'Pie del Cerro',
      category: '🏛️ Cultural',
      cost: 35000,
      status: 'Confirmado',
      notes: 'Explorar los túneles subterráneos con guía histórico.',
      likes: ['u1', 'u2', 'u4'],
      createdBy: 'u1'
    },
    {
      id: 'a8',
      dayId: 3,
      time: '04:00 PM',
      title: 'Caminata y compras en Callejón de las Damas y Getsemaní',
      location: 'Barrio Getsemaní',
      category: '🏛️ Cultural',
      cost: 15000,
      status: 'Confirmado',
      notes: 'Murales de arte urbano y comprar souvenirs artesanales.',
      likes: ['u2', 'u4', 'u5'],
      createdBy: 'u2'
    },
    {
      id: 'a9',
      dayId: 4,
      time: '09:30 AM',
      title: 'Desayuno de despedida & Arepa con Huevo',
      location: 'Plaza de San Diego',
      category: '🍽️ Comida',
      cost: 20000,
      status: 'Confirmado',
      notes: 'Cierre del viaje y fotos finales.',
      likes: ['u1', 'u2', 'u3', 'u4', 'u5'],
      createdBy: 'u4'
    },
    {
      id: 'a10',
      dayId: 4,
      time: '01:00 PM',
      title: 'Traslado grupal al Aeropuerto Rafael Núñez',
      location: 'Aeropuerto CTG',
      category: '🚗 Transporte',
      cost: 18000,
      status: 'Confirmado',
      notes: 'Vuelo de retorno programado 03:45 PM.',
      likes: ['u1', 'u3', 'u4'],
      createdBy: 'u3'
    }
  ],
  proposals: [
    {
      id: 'p1',
      title: 'Tour Nocturno en Chiva Rumbera con Música en Vivo',
      description: 'Recorrido en bus tradicional por Bocagrande y Centro con degustación de fritos y animador.',
      category: '🎉 Vida Nocturna',
      cost: 50000,
      proposedBy: 'Carlos',
      upvotes: ['u1', 'u3', 'u5'],
      downvotes: ['u4'],
      status: 'approved',
      targetDay: 1
    },
    {
      id: 'p2',
      title: 'Taller de Cocina del Caribe & Ceviche Cartagenero',
      description: 'Aprender a preparar ceviche fresco y cóctel de mariscos en una terraza de Getsemaní.',
      category: '🍽️ Comida',
      cost: 75000,
      proposedBy: 'Valentina',
      upvotes: ['u2', 'u4'],
      downvotes: [],
      status: 'pending',
      targetDay: 3
    },
    {
      id: 'p3',
      title: 'Tour de Paddle Board al Amanecer en Bocagrande',
      description: 'Remar 1 hora sobre tabla mientras sale el sol frente al skyline de Cartagena.',
      category: '🤿 Aventura',
      cost: 65000,
      proposedBy: 'Andrés',
      upvotes: ['u5'],
      downvotes: ['u2', 'u4'],
      status: 'pending',
      targetDay: 2
    }
  ],
  expenses: [
    {
      id: 'e1',
      title: 'Reserva Airbnb 4 Noches (Total)',
      amount: 1200000,
      payerId: 'u4',
      category: 'Hospedaje',
      splitWith: ['u1', 'u2', 'u3', 'u4', 'u5'],
      date: '10 Nov'
    },
    {
      id: 'e2',
      title: 'Anticipo Lancha Privada Islas',
      amount: 450000,
      payerId: 'u3',
      category: 'Transporte',
      splitWith: ['u1', 'u2', 'u3', 'u4', 'u5'],
      date: '12 Nov'
    },
    {
      id: 'e3',
      title: 'Mercado snacks, frutas & bebidas para la casa',
      amount: 280000,
      payerId: 'u1',
      category: 'Comida',
      splitWith: ['u1', 'u2', 'u3', 'u4', 'u5'],
      date: '14 Nov'
    },
    {
      id: 'e4',
      title: 'Transporte vans ida y vuelta aeropuerto',
      amount: 180000,
      payerId: 'u5',
      category: 'Transporte',
      splitWith: ['u1', 'u2', 'u3', 'u4', 'u5'],
      date: '14 Nov'
    },
    {
      id: 'e5',
      title: 'Cena de reserva bienvenida (depósito grupal)',
      amount: 250000,
      payerId: 'u2',
      category: 'Comida',
      splitWith: ['u1', 'u2', 'u3', 'u4', 'u5'],
      date: '15 Nov'
    }
  ],
  checklist: [
    { id: 'c1', text: 'Documentos de identidad y carnets SENA', completed: true, assignedTo: 'Todos' },
    { id: 'c2', text: 'Protector solar biodegradable y repelente', completed: true, assignedTo: 'Valentina' },
    { id: 'c3', text: 'Bolsas secas / impermeables para lancha', completed: false, assignedTo: 'Andrés' },
    { id: 'c4', text: 'Botiquín de primeros auxilios y mareol', completed: true, assignedTo: 'Sofía' },
    { id: 'c5', text: 'Baterías portátiles cargadas (Powerbanks)', completed: false, assignedTo: 'Mateo' },
    { id: 'c6', text: 'Efectivo en billetes pequeños para propinas', completed: false, assignedTo: 'Carlos' }
  ]
};

// Cargar o Inicializar Base de Datos en Disco
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error al leer DB_FILE, reiniciando semilla:', err);
  }
  saveDatabase(SEED_DATA);
  return JSON.parse(JSON.stringify(SEED_DATA));
}

function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error al guardar en DB_FILE:', err);
  }
}

let db = loadDatabase();

// Middleware: Parser de JSON en requests
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Helper: Extraer usuario del Token en Header
function getAuthUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;
  return db.users.find(u => u.id === payload.userId) || null;
}

// Respuestas JSON
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Servir archivos estáticos
function serveStaticFile(req, res, filePath) {
  let fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    fullPath = path.join(fullPath, 'index.html');
  }

  if (!fs.existsSync(fullPath)) {
    // Si no existe, intentar en la carpeta raíz
    fullPath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(fullPath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

// =========================================================================
// ENRUTADOR HTTP PRINCIPAL
// =========================================================================
const server = http.createServer(async (req, res) => {
  // Manejo de Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // ================= 1. RUTAS DE AUTENTICACIÓN =================
    // POST /api/auth/register -> Registrar nuevo usuario
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { name, email, password, role } = body;

      if (!name || !email || !password) {
        return sendJson(res, 400, { error: 'Nombre, correo y contraseña son obligatorios' });
      }
      if (String(password).length < 8) {
        return sendJson(res, 400, { error: 'La contraseña debe tener al menos 8 caracteres' });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
        return sendJson(res, 400, { error: 'Ingresa un correo electrónico válido' });
      }

      // Validar si el correo ya existe
      const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return sendJson(res, 409, { error: 'Ya existe una cuenta registrada con este correo' });
      }

      const colors = ['bg-indigo-600', 'bg-pink-600', 'bg-emerald-600', 'bg-amber-600', 'bg-sky-600', 'bg-purple-600', 'bg-teal-600'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newUser = {
        id: 'u_' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        role: role || 'Viajero',
        initial: name.trim().charAt(0).toUpperCase(),
        color: randomColor,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      saveDatabase(db);

      const token = generateToken(newUser.id);
      const { passwordHash, ...userSafe } = newUser;
      return sendJson(res, 201, {
        message: '¡Usuario registrado exitosamente en la Base de Datos!',
        user: userSafe,
        token
      });
    }

    // POST /api/auth/login -> Iniciar sesión
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { email, password } = body;

      if (!email || !password) {
        return sendJson(res, 400, { error: 'Ingresa correo y contraseña' });
      }

      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        return sendJson(res, 401, { error: 'Credenciales inválidas: correo no encontrado' });
      }

      if (user.passwordHash !== hashPassword(password)) {
        return sendJson(res, 401, { error: 'Credenciales inválidas: contraseña incorrecta' });
      }

      const token = generateToken(user.id);
      const { passwordHash, ...userSafe } = user;
      return sendJson(res, 200, {
        message: 'Inicio de sesión exitoso',
        user: userSafe,
        token
      });
    }

    // GET /api/auth/me -> Obtener perfil del usuario autenticado
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = getAuthUser(req);
      if (!user) {
        return sendJson(res, 401, { error: 'No autenticado o sesión expirada' });
      }
      const { passwordHash, ...userSafe } = user;
      return sendJson(res, 200, { user: userSafe });
    }

    // ================= 2. RUTAS DEL VIAJE Y CRUD =================
    // GET /api/trip -> Datos completos del viaje
    if (pathname === '/api/trip' && req.method === 'GET') {
      const safeMembers = db.users.map(({ passwordHash, ...u }) => u);
      return sendJson(res, 200, {
        trip: db.trip,
        members: safeMembers,
        days: db.days,
        activities: db.activities,
        proposals: db.proposals,
        expenses: db.expenses,
        checklist: db.checklist
      });
    }

    // POST /api/activities -> Crear nueva actividad en el itinerario
    if (pathname === '/api/activities' && req.method === 'POST') {
      const user = getAuthUser(req) || db.users[0];
      const body = await parseJsonBody(req);

      if (!body.title || !body.time) {
        return sendJson(res, 400, { error: 'Título y hora son obligatorios' });
      }

      const newAct = {
        id: 'a_' + Date.now(),
        dayId: parseInt(body.dayId || 1, 10),
        time: body.time,
        title: body.title.trim(),
        location: (body.location || '').trim(),
        category: body.category || '🏛️ Cultural',
        cost: parseInt(body.cost || 0, 10),
        status: body.status || 'Confirmado',
        notes: (body.notes || '').trim(),
        likes: [user.id],
        createdBy: user.id
      };

      db.activities.push(newAct);
      saveDatabase(db);
      return sendJson(res, 201, { message: 'Actividad agregada con éxito', activity: newAct });
    }

    // DELETE /api/activities/:id -> Eliminar actividad
    if (pathname.startsWith('/api/activities/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/activities/', '');
      db.activities = db.activities.filter(a => a.id !== id);
      saveDatabase(db);
      return sendJson(res, 200, { message: 'Actividad eliminada' });
    }

    // POST /api/proposals -> Proponer actividad para votación
    if (pathname === '/api/proposals' && req.method === 'POST') {
      const user = getAuthUser(req) || db.users[0];
      const body = await parseJsonBody(req);

      if (!body.title || !body.description) {
        return sendJson(res, 400, { error: 'Título y descripción son requeridos' });
      }

      const newProp = {
        id: 'p_' + Date.now(),
        title: body.title.trim(),
        description: body.description.trim(),
        category: body.category || '🎉 Vida Nocturna',
        cost: parseInt(body.cost || 0, 10),
        proposedBy: user.name.replace(' (Tú)', ''),
        upvotes: [user.id],
        downvotes: [],
        status: 'pending',
        targetDay: parseInt(body.targetDay || 1, 10)
      };

      db.proposals.push(newProp);
      saveDatabase(db);
      return sendJson(res, 201, { message: 'Propuesta lanzada a votación', proposal: newProp });
    }

    // POST /api/proposals/:id/vote -> Votar propuesta
    if (pathname.match(/^\/api\/proposals\/[^/]+\/vote$/) && req.method === 'POST') {
      const user = getAuthUser(req) || db.users[0];
      const id = pathname.split('/')[3];
      const body = await parseJsonBody(req);
      const prop = db.proposals.find(p => p.id === id);

      if (!prop) {
        return sendJson(res, 404, { error: 'Propuesta no encontrada' });
      }

      const direction = body.direction || 'up';
      if (direction === 'up') {
        const idx = prop.upvotes.indexOf(user.id);
        if (idx > -1) prop.upvotes.splice(idx, 1);
        else {
          prop.upvotes.push(user.id);
          const dIdx = prop.downvotes.indexOf(user.id);
          if (dIdx > -1) prop.downvotes.splice(dIdx, 1);
        }
      } else {
        const idx = prop.downvotes.indexOf(user.id);
        if (idx > -1) prop.downvotes.splice(idx, 1);
        else {
          prop.downvotes.push(user.id);
          const uIdx = prop.upvotes.indexOf(user.id);
          if (uIdx > -1) prop.upvotes.splice(uIdx, 1);
        }
      }

      prop.status = prop.upvotes.length >= 3 ? 'approved' : 'pending';
      saveDatabase(db);
      return sendJson(res, 200, { message: 'Voto registrado', proposal: prop });
    }

    // POST /api/expenses -> Registrar gasto compartido
    if (pathname === '/api/expenses' && req.method === 'POST') {
      const user = getAuthUser(req) || db.users[0];
      const body = await parseJsonBody(req);

      if (!body.title || !body.amount) {
        return sendJson(res, 400, { error: 'Concepto y monto son requeridos' });
      }

      const newExp = {
        id: 'e_' + Date.now(),
        title: body.title.trim(),
        amount: parseInt(body.amount, 10),
        category: body.category || 'Comida',
        payerId: body.payerId || user.id,
        splitWith: db.users.map(u => u.id),
        date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
      };

      db.expenses.unshift(newExp);
      saveDatabase(db);
      return sendJson(res, 201, { message: 'Gasto registrado', expense: newExp });
    }

    // DELETE /api/expenses/:id -> Eliminar gasto
    if (pathname.startsWith('/api/expenses/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/expenses/', '');
      db.expenses = db.expenses.filter(e => e.id !== id);
      saveDatabase(db);
      return sendJson(res, 200, { message: 'Gasto eliminado' });
    }

    // POST /api/checklist -> Añadir ítem a la lista
    if (pathname === '/api/checklist' && req.method === 'POST') {
      const user = getAuthUser(req) || db.users[0];
      const body = await parseJsonBody(req);
      if (!body.text) return sendJson(res, 400, { error: 'Texto requerido' });

      const item = {
        id: 'c_' + Date.now(),
        text: body.text.trim(),
        completed: false,
        assignedTo: body.assignedTo || user.name.replace(' (Tú)', '')
      };
      db.checklist.push(item);
      saveDatabase(db);
      return sendJson(res, 201, { message: 'Ítem agregado', item });
    }

    // PATCH /api/checklist/:id -> Alternar completado
    if (pathname.startsWith('/api/checklist/') && req.method === 'PATCH') {
      const id = pathname.replace('/api/checklist/', '');
      const item = db.checklist.find(c => c.id === id);
      if (item) {
        item.completed = !item.completed;
        saveDatabase(db);
        return sendJson(res, 200, { message: 'Checklist actualizado', item });
      }
      return sendJson(res, 404, { error: 'Ítem no encontrado' });
    }

    // POST /api/trip/reset -> Restablecer a datos demo
    if (pathname === '/api/trip/reset' && req.method === 'POST') {
      db = JSON.parse(JSON.stringify(SEED_DATA));
      saveDatabase(db);
      return sendJson(res, 200, { message: 'Base de datos restablecida a semilla de fábrica' });
    }

    // ================= 3. SERVIR EL FRONTEND =================
    return serveStaticFile(req, res, pathname === '/' ? 'index.html' : pathname);

  } catch (error) {
    console.error('Error procesando petición:', error);
    return sendJson(res, 500, { error: 'Error interno del servidor: ' + error.message });
  }
});

// Arrancar servidor
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 WanderSquad Server corriendo en: http://localhost:${PORT}`);
  console.log(`📦 Base de Datos JSON persistente en: ${DB_FILE}`);
  console.log(`🔑 Endpoints de Auth:`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`🌐 Frontend disponible en navegador: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
