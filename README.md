# 🧠 MindFeed

Plataforma web de noticias de Ciencia, Psicología y Bienestar Mental.  
Construida con **Angular 18 + Tailwind CSS** siguiendo **Arquitectura Hexagonal**.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 18 (standalone components, signals) |
| Estilos | Tailwind CSS v3 |
| Arquitectura | Hexagonal (Ports & Adapters) |
| Estado | Angular Signals |
| Persistencia | localStorage (favoritos) |
| CI/CD | GitHub Actions |
| Deploy | Render (static site) |

---

## Estructura del proyecto

```
mindfeed/
├── src/app/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── models/          # Article, Favorite
│   │   │   └── ports/           # ArticleRepository, FavoritesRepository (interfaces)
│   │   └── application/
│   │       └── use-cases/       # GetArticles, FilterArticles, GetArticleBySlug, ManageFavorites
│   ├── infrastructure/
│   │   ├── data/                # articles.data.ts (datos en memoria)
│   │   └── repositories/        # InMemoryArticleRepository, LocalStorageFavoritesRepository
│   ├── shared/
│   │   └── components/          # Navbar, Footer, ArticleCard
│   └── features/
│       ├── home/                # Página de inicio con hero + cards
│       ├── news-list/           # Listado con filtros por categoría/nivel
│       ├── news-detail/         # Detalle completo del artículo
│       ├── favorites/           # Mi Diario de Lectura (localStorage)
│       └── contact/             # Formulario con validación reactiva
├── .github/workflows/
│   └── deploy.yml               # GitHub Actions: build + trigger Render
├── render.yaml                  # Render static site IaC
└── public/
    └── _redirects               # SPA fallback: /* → /index.html 200
```

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:4200)
npm start

# Build de producción
npm run build -- --configuration=production
```

---

## Despliegue en Render

### 1. Crear el Static Site en Render

1. Ve a [dashboard.render.com](https://dashboard.render.com) → **New → Static Site**
2. Conecta tu repositorio de GitHub
3. Configura:
   | Campo | Valor |
   |---|---|
   | **Root Directory** | `mindfeed` |
   | **Build Command** | `npm ci && npm run build -- --configuration=production` |
   | **Publish Directory** | `dist/mindfeed/browser` |
4. Activa **"Auto-Deploy on push"**

### 2. Agregar el Deploy Hook (opcional — para CI/CD desde GitHub Actions)

1. En Render → tu servicio → **Settings → Deploy Hook** → copia la URL
2. En GitHub → tu repo → **Settings → Secrets → Actions** → crea:
   - **Name:** `RENDER_DEPLOY_HOOK`
   - **Value:** la URL del hook

Con esto, cada `git push` a `main` dispara el workflow de GitHub Actions que:
1. Instala dependencias
2. Compila en producción
3. Sube los artefactos
4. Llama al Deploy Hook de Render

### 3. Enrutamiento SPA

El archivo `public/_redirects` y la sección `routes` de `render.yaml` garantizan que
todas las rutas (`/noticias`, `/favoritos`, etc.) sirvan `index.html` para que Angular Router
maneje la navegación del lado del cliente.

---

## Arquitectura Hexagonal

```
┌─────────────────────────────────────────────────┐
│                  FEATURES (UI)                   │
│  Home · NewsList · NewsDetail · Favorites · Contact │
└────────────────────┬────────────────────────────┘
                     │ usa
┌────────────────────▼────────────────────────────┐
│            APPLICATION (Use Cases)               │
│  GetArticles · FilterArticles · GetArticleBySlug │
│  ManageFavorites                                 │
└────────────────────┬────────────────────────────┘
                     │ depende de (interfaces)
┌────────────────────▼────────────────────────────┐
│              DOMAIN (Ports + Models)             │
│  ArticleRepositoryPort · FavoritesRepositoryPort │
│  Article · Favorite                              │
└────────────────────┬────────────────────────────┘
                     │ implementado por
┌────────────────────▼────────────────────────────┐
│           INFRASTRUCTURE (Adapters)              │
│  InMemoryArticleRepository                       │
│  LocalStorageFavoritesRepository                 │
└─────────────────────────────────────────────────┘
```

El dominio no conoce Angular ni localStorage. Los adaptadores de infraestructura
son intercambiables (e.g. reemplazar InMemory por una API REST sin tocar los use-cases).

---

## Comandos útiles

```bash
npm start           # Dev server
npm run build       # Build desarrollo
npm run build -- --configuration=production   # Build producción
npm test            # Unit tests (Jest / Karma)
npm run lint        # ESLint
```

---

*MindFeed – Politécnico Grancolombiano · Desarrollo de Front-end · 2026*
