# Pantallas Moviles - FireSupport IA

Este documento describe las pantallas moviles implementadas en el proyecto Android nativo ubicado en `android/`.

## 1. Splash Screen

Pantalla inicial de carga de la aplicacion.

- Muestra el logo de FireSupport IA al centro.
- Usa una animacion suave de pulso en el logo.
- Incluye un loader circular animado.
- Presenta el texto institucional: "Impulsado por IA para los Bomberos del Peru".
- Luego de unos segundos redirige automaticamente al login.

Objetivo de la pantalla:
dar una primera impresion institucional y profesional antes de iniciar sesion.

## 2. Login

Pantalla para que el usuario donante acceda a la aplicacion.

- Fondo claro con degradado suave.
- Titulo principal: "Bienvenido de nuevo".
- Texto secundario enfocado en continuar apoyando a los bomberos.
- Card central con formulario.
- Campo de correo electronico.
- Campo de contrasena con opcion para mostrar u ocultar.
- Enlace para recuperar contrasena.
- Boton principal: "Acceder al sistema".
- Opcion visual para continuar con Google.
- Enlace para crear una cuenta nueva.

Objetivo de la pantalla:
permitir el ingreso del usuario y ofrecer accesos rapidos a registro o recuperacion de contrasena.

## 3. Registro

Pantalla para crear una cuenta de donante.

- Fondo con degradado claro.
- Titulo principal: "Unete a la Mision".
- Texto descriptivo orientado al impacto social.
- Formulario dentro de una card blanca.
- Campo de nombre completo.
- Campo de correo electronico.
- Campo de contrasena.
- Indicador visual de fortaleza de contrasena: debil, regular o fuerte.
- Campo para confirmar contrasena.
- Checkbox de terminos y condiciones.
- Boton principal: "Crear cuenta de Heroe".
- Enlace para volver al login.
- Footer de seguridad institucional.

Objetivo de la pantalla:
registrar nuevos usuarios donantes con una experiencia guiada y visualmente clara.

## 4. Verificacion OTP

Pantalla para validar el correo del usuario mediante codigo.

- Fondo claro con degradado.
- Boton superior para volver.
- Card central con icono de correo.
- Titulo: "Verifica tu correo".
- Mensaje indicando que se envio un codigo de 4 digitos.
- Cuatro campos individuales para ingresar el codigo.
- Enlace para reenviar el codigo.
- Boton "Verificar", habilitado cuando los 4 digitos estan completos.
- Mensaje de ayuda indicando revisar spam o correo no deseado.

Objetivo de la pantalla:
confirmar la identidad del usuario antes de completar el registro.

## 5. Registro Exitoso

Pantalla de confirmacion despues de crear la cuenta.

- Fondo claro con degradado.
- Icono central de check con anillos visuales.
- Titulo: "Bienvenido a la Brigada Digital".
- Mensaje confirmando que la cuenta fue creada con exito.
- Bloque informativo llamado "Proximo impacto".
- Acceso visual a "Emergencias Activas".
- Boton principal: "Ir al Dashboard".
- Boton secundario: "Completar perfil".

Objetivo de la pantalla:
cerrar el flujo de registro con una confirmacion positiva y dirigir al usuario a la siguiente accion.

## 6. Recuperar Contrasena

Pantalla para iniciar el proceso de recuperacion de cuenta.

- Fondo claro con degradado.
- Boton para volver.
- Card central con icono de llama.
- Titulo: "Olvidaste tu contrasena?".
- Texto explicativo sobre el envio de instrucciones.
- Campo de correo electronico.
- Boton principal: "Enviar instrucciones".
- Enlace de soporte institucional.

Objetivo de la pantalla:
permitir que el usuario solicite instrucciones para restablecer su contrasena.

## 7. Home

Pantalla base posterior al login.

- Actualmente muestra un estado temporal: "Home - Proximamente".
- Sirve como destino luego del login o registro exitoso.

Objetivo pendiente:
convertir esta pantalla en el dashboard movil del donante, mostrando campanas activas, historial de donaciones o accesos principales.

## Flujo Principal de Navegacion

```text
Splash
  -> Login
      -> Registro
          -> Verificacion OTP
              -> Registro Exitoso
                  -> Home
      -> Recuperar Contrasena
          -> Login
      -> Home
```

## Observaciones de Estado Actual

- Las pantallas tienen una linea visual consistente: fondo claro, rojo institucional, cards blancas e iconografia relacionada a seguridad/emergencia.
- Login y registro todavia funcionan como flujo visual, porque navegan directamente sin validar completamente contra el backend desde la pantalla.
- Ya existe base tecnica para conectar API, ViewModels y Retrofit.
- El Home todavia esta pendiente de desarrollo funcional.
- Se recomienda corregir textos con caracteres danados antes de presentar o entregar.

