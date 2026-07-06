# Dev 1 — UI/UX y Pruebas Funcionales
## FireSupport IA | Sprint 1, Sprint 2 y Sprint 3

**Integrante Dev 1:** Sheila Diaz — UI/UX Designer + QA Tester  
**Integrante Dev 2:** Angie Portocarrero — Backend + Base de datos + APIs + React Native  
**Integrante Dev 3:** Naomi Sanchez Chavarria — Frontend Web React  
**Rama:** dev1-uiux

---

## Diseño Figma

[Ver diseños en Figma](https://www.figma.com/make/wTU0Nxhb82nJo5Bw8pb9Xh/Create-it?t=lwyITGaxiUgaztxc-1&preview-route=%2Fadmin)

---

## HU Diseñadas Sprint 1

| HU | Descripción | Web | Móvil |
|----|-------------|-----|-------|
| HU-01 | Solicitud registro compañía | ✅ | ✅ |
| HU-02 | Panel Super Admin | ✅ | — |
| HU-03 | Generar código único | ✅ | — |
| HU-04 | Registro donante | ✅ | ✅ |
| HU-05 | Login donante | ✅ | ✅ |
| HU-06 | Ver campañas activas | ✅ | ✅ |

---

## Pruebas Funcionales Sprint 1

### HU-01 — Solicitud de registro compañía
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Formulario visible | ✅ Pasa | hu-01-00-solicitud-registro-compañia.png |
| RUC duplicado | ✅ Pasa | hu-01-01prueba-error-ruc.png |
| Envío exitoso | ✅ Pasa | hu-01-02-prueba-exito.png |
| Campos vacíos | ✅ Pasa | hu-01-03-prueba-error-campos.png |

### HU-02 — Panel Super Admin
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Panel carga con solicitudes | ✅ Pasa | hu-02-00-prueba-panel.png |
| Aprobar solicitud | ❌ Bug Dev 2/Dev 3 | hu-02-prueba-error-aprobacion.png |

### HU-03 — Generar código único
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Envío de correo al aprobar | ❌ Bug Dev 2 | hu-03-prueba-error-email.png |

### HU-04 — Registro donante
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Formulario visible | ✅ Pasa | hu-04-00-prueba-form.png |
| Campos vacíos | ✅ Pasa | hu-04-01-prueba-error-campos.png |
| Registro exitoso | ✅ Pasa | hu-04-02-prueba-exito.png |
| Email duplicado | ✅ Pasa | hu-04-03-prueba-error-email.png |

### HU-05 — Login donante
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Formulario login | ✅ Pasa | hu-05-00-prueba-login-form.png |
| Login exitoso | ⚠️ Pasa pero redirige a /campanas en vez de /admin | hu-05-01-prueba-login-exito.png |
| Credenciales incorrectas | ✅ Pasa | hu-05-02-prueba-login-error.png |
| Cuenta bloqueada backend | ✅ Pasa | hu-05-03-prueba-bloqueado-backend.png |
| Cuenta bloqueada frontend | ❌ Bug Dev 3 | hu-05-04-prueba-bloqueado-frontend.png |

### HU-06 — Ver campañas activas
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Listado campañas | ✅ Pasa | hu-06-00-prueba-listado.png |
| Búsqueda en tiempo real | ✅ Pasa | hu-06-01-prueba-busqueda.png |
| Filtro por categoría | ✅ Pasa | hu-06-03-prueba-filtro.png |

---

## Bugs encontrados Sprint 1

| # | HU | Bug | Responsable |
|---|----|-----|-------------|
| 1 | HU-02/03 | Al aprobar solicitud falla envío de correo — credenciales Gmail incorrectas | Dev 2 — Angie |
| 2 | HU-05 | Login con super_admin redirige a /campanas en vez de /admin/solicitudes | Dev 3 — Naomi |
| 3 | HU-05 | Cuenta bloqueada no se muestra en el frontend | Dev 3 — Naomi |
| 4 | HU-02 | Botón Rechazar no es clickeable | Dev 3 — Naomi |
| 5 | General | Credenciales demo muestran .pe pero BD tiene .com | Dev 3 — Naomi |
| 6 | HU-03 | Frontend muestra mensaje genérico al fallar aprobación en vez de especificar el error real | Dev 3 — Naomi |
| 7 | HU-01 | Al enviar RUC duplicado el frontend muestra mensaje genérico en vez de indicar claramente "El RUC ya está registrado" | Dev 3 — Naomi |
| 8 | General | Navbar mostraba "Iniciar Sesión" y "Registrarme" aunque el usuario ya estuviera logueado — ✅ Corregido en Sprint 2 | Dev 3 — Naomi |

---

## HU Diseñadas Sprint 2

| HU | Descripción | Web | Móvil |
|----|-------------|-----|-------|
| HU-07 | Crear y gestionar campañas | ✅ | — |
| HU-08 | Realizar donación | ✅ | — |
| HU-09 | Comprobante de donación | ✅ | — |
| HU-10 | Ver donaciones virtuales lectura | ✅ | — |
| HU-11 | Registrar ingresos en efectivo | ✅ | — |
| HU-12 | Gestionar cuentas bomberos internos | ✅ | — |
| HU-13 | Acceso bombero interno | ✅ | — |

---

## Evidencias Sprint 2

Las capturas están en [evidencias/sprint-2](https://github.com/Tecsupsoft/2026-1-4c24-pi-1b/tree/dev1-uiux/evidencias/sprint-2)

### Diseño Figma Web
- hu-07-figma-web.png
- hu-07-figma-tabla.png
- hu-08-01-figma-web.png
- hu-08-figma-web-tarjeta.png
- hu-09-figma-web.png
- hu-10-figma-web.png
- hu-11-figma-web.png
- hu-12-figma-web.png
- hu-13-figma-web.png

---

## Pruebas Funcionales Sprint 2

### HU-07 — Crear y gestionar campañas
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Listado de campañas | ✅ Pasa | hu-07-prueba-listado.png |
| Crear campaña | ✅ Pasa | hu-07-prueba-crear.png |
| Editar campaña | ✅ Pasa | hu-07-prueba-editar.png |
| Eliminar campaña | ✅ Pasa | hu-07-prueba-eliminar.png |

### HU-08 — Realizar donación
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Flujo de donación | ✅ Pasa | hu-08-prueba-donacion.png |
| Donación exitosa | ✅ Pasa | hu-08-prueba-exito.png |

### HU-09 — Comprobante de donación
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Comprobante generado | ✅ Pasa | hu-09-prueba-comprobante.png |

### HU-10 — Ver donaciones virtuales lectura
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Panel donaciones modo lectura | ✅ Pasa | hu-10-prueba-donaciones.png |

### HU-11 — Registrar ingresos en efectivo
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Listado ingresos | ✅ Pasa | hu-11-prueba-ingresos.png |
| Registrar ingreso | ✅ Pasa | hu-11-prueba-registrar.png |
| Ingreso registrado exitoso | ✅ Pasa | hu-11-prueba-exito.png |

### HU-12 — Gestionar cuentas bomberos internos
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Listado usuarios | ✅ Pasa | hu-12-prueba-usuarios.png |
| Crear usuario interno | ✅ Pasa | hu-12-prueba-crear.png |
| Usuario creado exitoso | ✅ Pasa | hu-12-prueba-exito.png |

### HU-13 — Acceso bombero interno
| Caso | Resultado | Archivo |
|------|-----------|---------|
| Acceso panel bombero interno | ❌ Bug Dev 3 | hu-13-prueba-sin-acceso.png |

---

## Bugs encontrados Sprint 2

| # | HU | Bug | Responsable |
|---|----|-----|-------------|
| 9 | HU-07 | Modal Nueva Campaña no permite ver botones de acción al hacer scroll | Dev 3 — Naomi |
| 10 | HU-13 | Ruta /admin/firefighter no es accesible para super_admin — redirige al panel de solicitudes | Dev 3 — Naomi |
| 11 | HU-07 | Imágenes de campañas no coinciden con el título — datos mock incorrectos | Dev 3 — Naomi |

---

## HU Diseñadas Sprint 3

| HU | Descripción | Web | Móvil |
|----|-------------|-----|-------|
| HU-14 | Vincular o desvincular asociación | ✅ | — |
| HU-15 | Acceso admin asociación | ✅ | — |
| HU-16 | Gestionar campañas compañías vinculadas | ✅ | — |
| HU-17 | Gestionar roles y permisos | ✅ | — |
| HU-18 | Rechazar solicitudes con motivo | ✅ | — |
| HU-19 | Historial de donaciones | ✅ | ✅ |

---

## Evidencias Sprint 3

Las capturas están en [evidencias/sprint-3](https://github.com/Tecsupsoft/2026-1-4c24-pi-1b/tree/dev1-uiux/evidencias/sprint-3)

### Diseño Figma Web
- hu-14-figma-web.png
- hu-15-figma-web.png
- hu-16-figma-web.png
- hu-17-figma-web.png
- hu-18-figma-web.png
- hu-19-figma-web.png

### Diseño Figma Móvil
- hu-19-figma-movil.png

### Pruebas Funcionales
Pendiente — esperando frontend de Dev 3