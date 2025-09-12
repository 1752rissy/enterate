# MVP Sistema de Registro de Eventos - Posadas

## Archivos a crear/modificar:

### 1. **src/types/index.ts** - Tipos TypeScript
- Event, User, Comment interfaces
- UserRole enum (USER, ORGANIZER)

### 2. **src/lib/mockData.ts** - Datos de prueba
- Eventos de ejemplo para Posadas
- Usuarios mock con diferentes roles

### 3. **src/components/EventCard.tsx** - Tarjeta de evento
- Muestra título, fecha, ubicación, imagen
- Contador de "Me gusta" y botón de acción
- Responsive design

### 4. **src/components/EventList.tsx** - Lista de eventos
- Grid responsivo de EventCards
- Filtros básicos

### 5. **src/components/CreateEventForm.tsx** - Formulario crear evento
- Solo para organizadores
- Campos: título, descripción, fecha, ubicación, imagen

### 6. **src/components/EventDetail.tsx** - Detalle del evento
- Vista completa del evento
- Sección de comentarios
- Galería de fotos

### 7. **src/components/UserAuth.tsx** - Sistema de autenticación simple
- Login/logout mock
- Selector de rol (para demo)

### 8. **src/pages/Index.tsx** - Página principal (REESCRIBIR)
- Header con auth
- EventList como componente principal
- Botón "Crear Evento" condicional

## Funcionalidades MVP:
- ✅ Ver lista de eventos
- ✅ Crear eventos (solo organizadores)
- ✅ Sistema de "Me gusta"
- ✅ Comentarios básicos
- ✅ Autenticación mock
- ✅ Responsive design
- ✅ Datos locales (localStorage)

## Limitaciones MVP:
- Sin backend real (datos en localStorage)
- Autenticación simulada
- Subida de imágenes limitada a URLs