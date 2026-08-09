# 🍔 Domicilios Riohacha - Delivery Platform

Plataforma SaaS de delivery tipo Uber Eats/Rappi construida con React 19, Supabase y TailwindCSS.

## 📋 Contenido del Proyecto

```
loop-maestro-mvp/
├── src/
│   ├── config/              # Configuración (env, constants)
│   ├── shared/              # Componentes y hooks compartidos
│   ├── features/            # Features modulares (auth, client, restaurant, delivery, admin)
│   ├── router/              # Configuración de rutas
│   ├── App.tsx              # Componente raíz
│   ├── main.tsx             # Punto de entrada
│   └── styles.css           # Estilos globales
├── public/                  # Assets estáticos
├── vite.config.ts           # Configuración de Vite
├── tailwind.config.ts       # Configuración de Tailwind
├── tsconfig.json            # Configuración de TypeScript
├── package.json             # Dependencias
└── index.html               # HTML principal
```

## 🚀 Quick Start

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y agrega tus credenciales de Supabase:

```bash
cp .env.example .env
```

Edita `.env` con:
```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Crear tablas en Supabase

En el dashboard de Supabase, ejecuta este SQL:

```sql
-- ===== USERS =====
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  role VARCHAR NOT NULL,
  avatar_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== RESTAURANTS =====
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  description TEXT,
  image_url VARCHAR,
  address VARCHAR,
  phone VARCHAR,
  status VARCHAR DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== PRODUCTS =====
CREATE TABLE products (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===== ORDERS =====
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  delivery_person_id UUID REFERENCES users(id),
  delivery_address VARCHAR,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== ORDER ITEMS =====
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX idx_products_restaurant_id ON products(restaurant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### 4. Ejecutar desarrollo

```bash
npm run dev
```

La app se abrirá en `http://localhost:3000`

## 📝 Rutas Disponibles

### Públicas
- `GET /login` - Login
- `GET /register` - Registro

### Cliente
- `GET /app/home` - Inicio
- `GET /app/restaurants` - Lista de restaurantes
- `GET /app/cart` - Carrito
- `GET /app/orders` - Mis pedidos

### Restaurante
- `GET /restaurant/dashboard` - Dashboard
- `GET /restaurant/orders` - Órdenes

### Domiciliario
- `GET /delivery/dashboard` - Dashboard

### Admin
- `GET /admin/dashboard` - Dashboard

## 🏗️ Estructura de Features

Cada feature sigue esta estructura:

```
features/[feature]/
├── pages/           # Páginas/Screens
├── components/      # Componentes React
├── hooks/          # Custom hooks
└── AuthContext.tsx # Context (si aplica)
```

## 🛠️ Tecnologías

- **React 19** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Routing
- **TanStack Query** - State management
- **Supabase** - Backend & Database
- **Zustand** - Global state (si necesario)

## 📚 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview de build
npm run preview

# Type check
npm run type-check
```

## 🔐 Roles de Usuario

- **client** - Cliente que hace pedidos
- **restaurant** - Dueño de restaurante
- **delivery** - Domiciliario
- **admin** - Administrador del sistema

## 🎯 Próximas Fases

- [ ] Fase 3: Autenticación completa
- [ ] Fase 4: Dashboard por rol
- [ ] Fase 5: Gestión de restaurantes y productos
- [ ] Fase 6: Carrito y checkout
- [ ] Fase 7: Sistema de órdenes en tiempo real
- [ ] Fase 8: GPS y tracking
- [ ] Fase 9: Pagos
- [ ] Fase 10: Deploy en producción

## 🚀 DEPLOYMENT

### GitHub Pages + GitHub Actions

Este proyecto está configurado para despliegue automático en GitHub Pages.

**Ver guía completa:** [DEPLOYMENT.md](./DEPLOYMENT.md)

#### Quick Deploy

1. **Crear repositorio en GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/repo.git
   git push -u origin main
   ```

2. **Configurar secretos** (Settings → Secrets → Actions)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Habilitar GitHub Pages** (Settings → Pages)
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)

4. **URL de la app**
   ```
   https://tu-usuario.github.io/loop-maestro-mvp
   ```

#### Workflows Incluidos

- **deploy.yml** - Deploy automático en push a main
- **pr-checks.yml** - Validación de PRs

---

## 📞 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

## 📄 Licencia

© 2024 Loop Maestro. Todos los derechos reservados.
