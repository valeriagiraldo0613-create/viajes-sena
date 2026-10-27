-- ============================================================
-- ESQUEMA DE BASE DE DATOS RELACIONAL: WANDERSQUAD (PROYECTO 3)
-- Compatible con PostgreSQL, Supabase, MySQL y SQLite
-- ============================================================

-- 1. TABLA DE USUARIOS Y AUTENTICACIÓN
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Viajero', -- Organizador, Finanzas, Logística, Diseñador, Aventurero
    initial VARCHAR(5) NOT NULL,
    color VARCHAR(30) DEFAULT 'bg-indigo-600',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE VIAJES
CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget NUMERIC(12, 2) DEFAULT 0.00,
    created_by VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE DÍAS DEL ITINERARIO
CREATE TABLE IF NOT EXISTS trip_days (
    id SERIAL PRIMARY KEY,
    trip_id VARCHAR(36) REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    date_label VARCHAR(50) NOT NULL
);

-- 4. TABLA DE ACTIVIDADES DEL ITINERARIO (CRUD)
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) REFERENCES trips(id) ON DELETE CASCADE,
    day_id INT NOT NULL,
    time VARCHAR(10) NOT NULL,
    title VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    category VARCHAR(50) NOT NULL, -- Comida, Aventura, Cultural, Transporte, Hospedaje, etc.
    cost NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Confirmado', -- Confirmado, Por confirmar
    notes TEXT,
    created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE PROPUESTAS Y VOTACIONES DEMOCRÁTICAS
CREATE TABLE IF NOT EXISTS proposals (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) REFERENCES trips(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
    target_day INT DEFAULT 1,
    status VARCHAR(30) DEFAULT 'pending', -- pending, approved, rejected
    proposed_by VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA DE VOTOS POR PROPUESTA (Relación N:M)
CREATE TABLE IF NOT EXISTS proposal_votes (
    proposal_id VARCHAR(36) REFERENCES proposals(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (proposal_id, user_id)
);

-- 7. TABLA DE GASTOS COMPARTIDOS (SPLITWISE)
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) REFERENCES trips(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Transporte, Hospedaje, Comida, Actividades, Compras
    payer_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA DE DIVISIÓN DE GASTOS ENTRE INTEGRANTES (Quién participa en el gasto)
CREATE TABLE IF NOT EXISTS expense_splits (
    expense_id VARCHAR(36) REFERENCES expenses(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    share_amount NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (expense_id, user_id)
);

-- 9. TABLA DE CHECKLIST COLABORATIVO
CREATE TABLE IF NOT EXISTS checklist_items (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) REFERENCES trips(id) ON DELETE CASCADE,
    item_text VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    assigned_to VARCHAR(100) DEFAULT 'Todos',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA RENDIMIENTO EN CONSULTAS FRECUENTES
CREATE INDEX IF NOT EXISTS idx_activities_trip_day ON activities(trip_id, day_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_proposals_trip ON proposals(trip_id);
