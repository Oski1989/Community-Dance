# 🕺 DanceXP - Progressive Web App (PWA) SaaS Multi-Sede & Gamificación Nocturna

Plataforma PWA SaaS de nivel mundial para escuelas de baile (Salsa & Bachata) e integración con locales nocturnos como **Victorys Palma en Palma de Mallorca**.

---

## 🚀 Arquitectura Tecnológica & Configuración Dual (Vercel + VPS Ready)

- **Framework**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend & Auth**: Supabase PostgreSQL + Auth + Storage Buckets con RLS.
- **Engine PWA**: `@ducanh2912/next-pwa` (Instalación nativa *Add to Home Screen*, Offline Service Worker, Cámara nativa).
- **Dockerization (VPS)**: `output: "standalone"` activado en `next.config.js`.

---

## ⚡ Módulos Clave del Sistema

### 1. Multi-Sede SaaS & Feature Flag (`has_social_engine`)
- **Victorys Palma (`has_social_engine = true`)**: Módulo social completo, Check-In QR con GPS, misiones de pista, racha *"Fuego en Victorys"* 🔥 y billetera de canje de consumiciones en barra.
- **Barcelona BCN (`has_social_engine = false`)**: Oculta automáticamente todas las pestañas sociales y restringe la interfaz al seguimiento técnico (Vídeos, XP, Evaluaciones y Niveles).

### 2. Feedback Asíncrono de Vídeo con Lienzo de Dibujo
- **Envío Alumno**: Grabación/carga de clips de 15s desde cámara PWA.
- **Inbox Zero Profesor**: Reproductor en bucle con:
  - Control cuadro a cuadro y selector de velocidad (0.5x, 1x).
  - Lienzo interactivo HTML5 Canvas (línea de eje, marco, tensión).
  - Grabador integrado de notas de voz de 10s.
  - Selector de tasa de conversión de Puntos de Ritmo a XP Técnico (25%, 50%, 75%, 100%).

### 3. Reconocimiento Exprés en Pista (Flash Props)
- Elogios rápidos 1-Tap desde pantalla de profesor (*"Eje Impecable"*, *"Conexión Orgánica"*, *"Musicalidad Brutal"*) con asignación de XP editable y campo de texto libre.

### 4. Victorys Social Engine (Fidelización Presencial)
- Check-In QR Geolocalizado con validación GPS.
- Rachas de fiesta (*Streaks*) con multiplicador de puntos +50%.
- Social Quests (Desafíos cruzados en pista).
- Billetera de Canje con QR dinámico y cuenta atrás circular de 60 segundos para camareros.

### 5. Perfil del Alumno & Doble Sistema de Puntuación
- Ficha Multi-Estilo (Salsa en Línea, Bachata Sensual).
- Doble Puntuación: **XP Técnico (Dorado ⭐)** vs **Puntos de Ritmo (Verde ⚡)**.
- Leaderboards filtrables.

---

## 🛠️ Guía de Lanzamiento Gratuito en 4 Pasos (Supabase + Vercel)

### Paso 1: Configurar Proyecto Gratuito en Supabase
1. Entra en [Supabase Cloud](https://supabase.com) y crea un nuevo proyecto.
2. Abre el **SQL Editor** en Supabase y ejecuta el script completo ubicado en `supabase/schema.sql`.

### Paso 2: Crear Buckets de Almacenamiento en Supabase Storage
1. Ve a la pestaña **Storage** en tu panel de Supabase.
2. Crea dos buckets públicos:
   - `dance-videos` (Public Bucket: ON)
   - `feedback-audios` (Public Bucket: ON)

### Paso 3: Vincular a Vercel con Variables de Entorno
1. Sube este repositorio a tu GitHub/GitLab.
2. En la consola de [Vercel](https://vercel.com), crea un nuevo proyecto e importa el repositorio.
3. Agrega las siguientes variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=https://dancexp.vercel.app
```

### Paso 4: Instalación PWA Nativa en Dispositivos
1. Accede al dominio desplegado `https://dancexp.vercel.app`.
2. En **iOS (Safari)**: Pulsa *"Compartir"* -> *"Añadir a la pantalla de inicio"*.
3. En **Android (Chrome)**: Pulsa *"Añadir a la pantalla principal"*.

---

## 🧪 Ejecución en Entorno Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo Next.js
npm run dev
```

Navega a `http://localhost:3000` para probar la aplicación completa con datos de demostración interactivos.
