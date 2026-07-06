## FireSupport IA | Sprint 1, Sprint 2, Sprint 3 y Sprint 4

**Integrante Dev 1:** Sheila Diaz — UI/UX Designer + QA Tester
**Integrante Dev 2:** Angie Portocarrero — Backend + Base de datos + APIs + React Native
**Integrante Dev 3:** Naomi Sanchez Chavarria — Frontend Web React
**Rama:** dev1-uiux

---

## Diseño Figma

[Ver prototipo final en Figma](https://www.figma.com/make/pZA9hk7EQx6DVNvwKsXt5N/FireSupport-IA?p=f&t=p7HdXpyY4svvKfyt-0)


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

## Evidencias Sprint 3

Las capturas están en [evidencias/sprint-3](https://github.com/Tecsupsoft/2026-1-4c24-pi-1b/tree/dev1-uiux/evidencias/sprint-3)

### Diseño Figma Web

* hu-14-figma-web.png
* hu-15-figma-web.png
* hu-16-figma-web.png
* hu-17-figma-web.png
* hu-18-figma-web.png
* hu-19-figma-web.png

### Diseño Figma Móvil

* hu-19-figma-movil.png

### Prototipo Final FireSupport IA

https://www.figma.com/make/pZA9hk7EQx6DVNvwKsXt5N/FireSupport-IA?p=f&t=p7HdXpyY4svvKfyt-0

### Pruebas Funcionales

Pendiente de documentación y consolidación de evidencias finales.

---

## HU Diseñadas Sprint 4

| HU    | Descripción                    | Web | Móvil |
| ----- | ------------------------------ | --- | ----- |
| HU-20 | Generación de campañas con IA  | ✅   | —     |
| HU-21 | Campañas cercanas con IA       | ✅   | ✅     |
| HU-22 | Notificaciones Android         | —   | ✅     |
| HU-23 | Bombero IA                     | ✅   | ✅     |
| HU-24 | Dashboard de reportes globales | ✅   | —     |
| HU-25 | Exportar reportes              | ✅   | —     |
| HU-26 | Actualización de perfil        | ✅   | ✅     |

---

## Evidencias Sprint 4

Las capturas están en:

evidencias/sprint-4

### Diseño Figma Web

* HU-20_Generador_IA_Campañas.png
* HU-20_Generador_IA_Resultado.png
* HU-20_Generador_IA_VistaPrevia.png
* HU-24_Reportes_Globales_Top.png
* HU-24_Reportes_Globales_Bottom.png
* HU-25_Exportar_Reportes.png
* HU-26_Mi_Perfil_Web.png
* HU-26_Mi_Perfil_Web_Bottom.png

### Diseño Figma Móvil

* HU-21_Campanas_Cercanas_IA_Top.png
* HU-21_Campanas_Cercanas_IA_Bottom.png
* HU-22_Notificaciones_Android_Top.png
* HU-22_Notificaciones_Android_Bottom.png
* HU-23_Bombero3D_Figura.png
* HU-23_Bombero3D_Comparativa.png
* HU-26_Mi_Perfil_Android_Top.png
* HU-26_Mi_Perfil_Android_Bottom.png
* HU-26_Mi_Perfil_Android_Seguridad.png
* HU-26_Mi_Perfil_Android_Notificaciones.png

### Pruebas Funcionales

Pendiente de documentación y consolidación de evidencias finales.

---

## Evidencias Móviles Consolidadas

Las capturas finales del módulo móvil se encuentran en:

`evidencias/mobile`

Estas evidencias corresponden a la versión final refinada del módulo Android de FireSupport IA, incluyendo autenticación, campañas, donaciones, historial, comprobantes, campañas cercanas con IA, notificaciones, perfil de usuario y funcionalidades complementarias.

### Pantallas Incluidas

| Archivo | Descripción |
|----------|-------------|
| 01-mobile-login.png | Inicio de sesión |
| 02-mobile-register.png | Registro de donante |
| 03-mobile-home-top.png | Inicio - sección superior |
| 03-mobile-home-bottom.png | Inicio - sección inferior |
| 04-mobile-campaigns-top.png | Campañas - sección superior |
| 04-mobile-campaigns-bottom.png | Campañas - sección inferior |
| 05-mobile-campaign-detail-emergency.png | Detalle campaña de emergencia |
| 05-mobile-campaign-detail-ia.png | Detalle campaña recomendada por IA |
| 06-mobile-donate.png | Proceso de donación |
| 07-mobile-success.png | Donación exitosa |
| 08-mobile-history.png | Historial de donaciones |
| 09-mobile-receipt.png | Comprobante de donación |
| 10-mobile-notifications-top.png | Centro de notificaciones - superior |
| 10-mobile-notifications-bottom.png | Centro de notificaciones - inferior |
| 11-mobile-nearby-campaigns.png | Campañas cercanas con IA |
| 12-mobile-profile-top.png | Perfil - sección superior |
| 12-mobile-profile-bottom.png | Perfil - sección inferior |
| 12-mobile-profile-notifications.png | Configuración de notificaciones |
| 12-mobile-profile-seguridad.png | Configuración de seguridad |
| 14-mobile-firefighter-ia-detail.png | Evolución del Bombero IA |
| 15-mobile-forgot-password.png | Recuperar contraseña |
| 16-mobile-forgot-password-sent.png | Correo de recuperación enviado |