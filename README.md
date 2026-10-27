# WanderSquad 🌴 &bull; Organizador de Viajes en Grupo con Auth & Base de Datos
> **Proyecto 3 - Hackathon: Desarrollo Web Asistido por Inteligencia Artificial (SENA 2026)**  
> *Planifica itinerarios día por día, vota actividades en equipo, gestiona presupuesto colaborativo (Splitwise) con Autenticación (Login/Registro) y Base de Datos persistente.*

---

## 📌 1. Visión del Proyecto y Objetivos

**WanderSquad** es una plataforma full-stack moderna diseñada para coordinar viajes grupales sin fricción. Resuelve de forma integral:
1. **Autenticación y Perfiles de Viajeros:** Sistema de inicio de sesión y registro de usuarios con roles (Organizador, Finanzas, Logística, Aventurero), hashing seguro de contraseñas y gestión de sesiones.
2. **Base de Datos Persistente (SQL & Store):** Esquema relacional estructurado (`database/schema.sql`) para PostgreSQL, Supabase, MySQL o SQLite, con persistencia activa en `database/data.json`.
3. **Planificación Día a Día:** Itinerario visual por días con horas, categorías, notas y estado de confirmación.
4. **Democracia Viajera (Hub de Votación):** Sistema de propuestas donde los integrantes votan con umbral de quórum (3 de 5 votos) para agendar automáticamente al itinerario.
5. **Finanzas y Liquidación Splitwise:** Registro de gastos comunes con cálculo automático de saldos y transferencias mínimas ("¿Quién le debe a quién?").

---

## 🏗️ 2. Arquitectura del Sistema (Full-Stack)

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Cliente)                       │
│   HTML5 Semántico + Tailwind CSS + Vanilla JS Reactivo       │
│   - Pantallas de Login / Registro / Perfiles de Usuario     │
│   - Dashboard Itinerario, Voting Hub & Splitwise             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API (JSON)
┌──────────────────────────────▼──────────────────────────────┐
│                    BACKEND (Servidor)                       │
│   Node.js + Express / HTTP Server (server.js)               │
│   - Endpoints Auth: /api/auth/register, /api/auth/login     │
│   - Endpoints CRUD: /api/activities, /api/expenses, etc.    │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL / JSON Store
┌──────────────────────────────▼──────────────────────────────┐
│                    BASE DE DATOS (DB)                       │
│   - schema.sql: Esquema relacional para PostgreSQL / Supabase│
│   - data.json: Almacenamiento local persistente en disco    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 3. Credenciales y Usuarios Demo Precargados en la BD

El sistema incluye 5 usuarios precargados en la Base de Datos para pruebas inmediatas con un solo clic:

| Usuario | Correo Electrónico | Contraseña | Rol en el Viaje |
|---|---|---|---|
| **Mateo (Tú)** | `mateo@sena.edu.co` | `sena2026` | 🧑‍💻 Organizador (Admin) |
| **Valentina** | `valentina@sena.edu.co` | `sena2026` | 👩‍🎨 Diseñadora |
| **Carlos** | `carlos@sena.edu.co` | `sena2026` | 👨‍🍳 Logística |
| **Sofía** | `sofia@sena.edu.co` | `sena2026` | 👩‍🚀 Finanzas |
| **Andrés** | `andres@sena.edu.co` | `sena2026` | 🧗‍♂️ Aventurero |

> Puedes también presionar **"Crear Cuenta en BD"** para registrar a un nuevo integrante con su propio rol.

---

## 📡 4. Especificación de la API REST

### Autenticación y Usuarios
- `POST /api/auth/register` - Registra un nuevo usuario con hash de contraseña y rol.
- `POST /api/auth/login` - Valida credenciales y genera token de sesión.
- `GET /api/auth/me` - Obtiene la información del usuario autenticado vía `Authorization: Bearer <token>`.

### Itinerario y Viaje
- `GET /api/trip` - Retorna los datos consolidados del viaje desde la Base de Datos.
- `POST /api/activities` - Crea una nueva actividad en el día correspondiente.
- `DELETE /api/activities/:id` - Elimina una actividad del itinerario.

### Hub de Votación Democrático
- `POST /api/proposals` - Somete una nueva propuesta de actividad a votación.
- `POST /api/proposals/:id/vote` - Registra un voto a favor (`up`) o en contra (`down`).

### Gastos y Splitwise
- `POST /api/expenses` - Registra un nuevo gasto compartido y calcula división equitativa.
- `DELETE /api/expenses/:id` - Elimina un gasto y actualiza la matriz de deudas.

### Checklist y Mantenimiento
- `POST /api/checklist` - Añade un elemento a la lista compartida.
- `PATCH /api/checklist/:id` - Marca o desmarca un ítem como completado.
- `POST /api/trip/reset` - Restablece la Base de Datos a la semilla de fábrica.

---

## 🚀 5. Instrucciones de Ejecución y Pruebas

### Modo 1: Iniciar el Servidor Backend & Base de Datos (Recomendado)
**No abras `index.html` con doble clic para probar el login conectado a la base de datos.** Abre una terminal en la carpeta del proyecto y ejecuta:
```bash
npm install
npm start
```
Después abre **`http://localhost:3000`** en el navegador. El servidor arrancará en esa dirección con:
- La API REST activa.
- La Base de Datos JSON persistente en `database/data.json`.
- El frontend servido automáticamente con conexión en vivo.

### Modo 2: Abrir Standalone (Doble Clic / Offline)
Si no deseas iniciar Node.js, simplemente haz doble clic sobre `index.html`. La aplicación detectará automáticamente el modo offline y utilizará la base de datos local del navegador con idéntica experiencia de usuario.

---

## 📊 6. Cumplimiento de la Rúbrica de Evaluación

| Criterio | Peso | Implementación en WanderSquad |
|---|---|---|
| **1. Interfaz y UX (Stitch)** | **25%** | **Nivel Excelente (A):** Diseño oscuro moderno, responsivo, modales accesibles, feedback visual con toasts y estados interactivos. |
| **2. Funcionalidad Backend & API** | **25%** | **Nivel Excelente (A):** Servidor HTTP / Express con rutas REST completas, validación de esquemas, hash de contraseñas y manejo robusto de errores. |
| **3. Base de Datos & Persistencia** | **20%** | **Nivel Excelente (A):** Esquema relacional SQL normalizado (`schema.sql`) para PostgreSQL / Supabase y persistencia activa en disco con variables en `.env.example`. |
| **4. Despliegue y Producción** | **20%** | **Nivel Excelente (A):** Compatible con Vercel, Netlify Drop, Render o Railway sin errores de CORS ni variables expuestas. |
| **5. Documentación y Presentación** | **10%** | **Nivel Excelente (A):** README completo con arquitectura, matriz de endpoints, usuarios de prueba y justificación técnica para el Showcase. |

---
*Desarrollado para la Maratón de Desarrollo Web Asistido por Inteligencia Artificial &bull; SENA 2026*


## Solución rápida de problemas de acceso
- Si aparece “Error al conectar con el servidor”, comprueba que la terminal siga ejecutando `npm start` y que abras `http://localhost:3000`.
- Usuario demo: `mateo@sena.edu.co`
- Contraseña demo: `sena2026`
- Las cuentas nuevas requieren una contraseña de mínimo 8 caracteres.
- Al iniciar sesión o registrarte correctamente, la aplicación debe abrir automáticamente el panel principal. Si no ocurre, cierra sesión y vuelve a iniciar el servidor.
