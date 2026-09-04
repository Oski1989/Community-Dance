# 🕺 APP MASTER (DanceXP / Community Dance)

Plataforma pedagógica y de gestión para escuelas de baile, profesores y alumnos. Incluye gamificación (XP, Puntuación de Ritmo, Rachas), motor de eventos sociales, temario interactivo por niveles e integración completa con **Supabase** y **Vercel**.

---

## 🌟 Características Principales

### 👨‍🏫 Módulo de Profesores & Creadores
- **Gestión Descentralizada de Programas:** Creación y modificación de disciplinas de baile (Salsa, Bachata, etc.).
- **Diseñador de Temario & Niveles:** Definición de árbol de niveles, apartados e ítems técnicos con vídeos de referencia y puntos XP.
- **Control de Alumnado & Matrículas:** Revisión de comprobantes de pago (Bizum/Transferencia), altas, bajas y cambios de estado.
- **Inbox Zero Evaluativo:** Calificación de vídeos de alumnos con feedback de voz y anotaciones.
- **Contabilidad & Finanzas:** Resumen de ingresos mensuales, proyecciones anuales y desglose por grupo.

### 🎓 Módulo de Alumnos
- **Ficha Personal & Social Matching:** Configuración de rol de pareja (Lead/Follower), redes sociales y estado de pareja.
- **Seguimiento Pedagógico:** Progreso en tiempo real dentro del temario oficial.
- **Subida de Vídeos & Tareas:** Envío de enlaces de vídeo para revisión técnica del profesor.
- **Gamificación & Desafíos:** Puntos de ritmo, rachas de asistencia y podio público/privado con configuraciones de privacidad granulares.

### 🏫 Módulo de Administración & Escuela
- **Gestión de Sedes & Salas:** Configuración de cuotas mensuales, límites de eventos e imágenes del recinto.
- **Tablón de Eventos Sociales:** Publicación de sociales semanales con horarios y ubicaciones.
- **Directorio de Usuarios & Roles:** Asignación de permisos de SuperAdmin, Profesor, Escuela o Alumno.

---

## 🚀 Despliegue en Vercel & Supabase

### 1. Supabase (Base de Datos)
1. Ejecuta el archivo `supabase_schema.sql` en el **SQL Editor** de tu proyecto Supabase.
2. Obtén la `URL` del proyecto y la `anon key`.

### 2. Vercel (Producción)
1. Importa el repositorio `Oski1989/Community-Dance` en Vercel.
2. Añade las siguientes variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Haz clic en **Deploy**.

---

## 💻 Desarrollo Local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` en tu navegador.
