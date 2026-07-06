# Funcionamiento Movil + Backend - FireSupport IA

Esta guia explica como funciona la app movil Android, como se conecta con el backend, que datos envia, a que rutas llega y donde se configura cada parte.

## 1. Resumen General

La aplicacion movil esta en:

```text
android/
```

El backend esta en:

```text
backend/
```

La comunicacion funciona asi:

```text
Pantalla Android
  -> ViewModel
  -> Repository
  -> RetrofitClient
  -> ApiService
  -> Backend Express
  -> Controller
  -> Modelo Sequelize
  -> Base de datos MySQL
```

En palabras simples:

1. El usuario escribe datos en la app movil.
2. Android valida algunos campos.
3. Android arma un JSON.
4. Retrofit envia ese JSON al backend.
5. El backend recibe la peticion.
6. El backend valida otra vez los datos.
7. El backend guarda o consulta en MySQL.
8. El backend responde con JSON.
9. Android recibe la respuesta y muestra exito o error.

## 2. Donde se Configura la URL del Backend en Android

Archivo:

```text
android/app/src/main/java/com/firesupportia/mobile/data/remote/RetrofitClient.kt
```

Actualmente tiene:

```kotlin
private const val BASE_URL = "http://10.229.94.50:3000/api/"
```

Esa URL significa:

- `http`: conexion sin HTTPS, usada para pruebas locales.
- `10.229.94.50`: IP de la laptop o PC donde corre el backend.
- `3000`: puerto del backend.
- `/api/`: prefijo general de las rutas del backend.

## 3. Que URL Usar Segun el Caso

### Si pruebas desde emulador Android

Usa:

```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

`10.0.2.2` es una direccion especial que permite que el emulador Android llegue al `localhost` de tu computadora.

### Si pruebas desde celular fisico

Usa la IP real de tu laptop en la misma red WiFi o hotspot:

```kotlin
private const val BASE_URL = "http://IP_DE_TU_LAPTOP:3000/api/"
```

Ejemplo:

```kotlin
private const val BASE_URL = "http://192.168.1.25:3000/api/"
```

Para que funcione:

- La laptop y el celular deben estar en la misma red.
- El backend debe estar corriendo.
- El backend debe escuchar en `0.0.0.0`, y este proyecto ya lo hace.
- El firewall de Windows no debe bloquear Node.js.

### Si pruebas desde navegador web en la misma laptop

Puedes usar:

```text
http://localhost:3000
```

Pero Android no siempre puede usar `localhost`, porque en Android `localhost` significa el propio celular o emulador, no tu laptop.

## 4. Permisos Android Necesarios

Archivo:

```text
android/app/src/main/AndroidManifest.xml
```

La app ya tiene permiso de internet:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Tambien tiene:

```xml
android:usesCleartextTraffic="true"
```

Esto permite usar URLs `http://` durante pruebas locales. Sin esto, Android puede bloquear llamadas HTTP no seguras.

## 5. Como se Define una Ruta en Android

Archivo:

```text
android/app/src/main/java/com/firesupportia/mobile/data/remote/ApiService.kt
```

Actualmente existe esta ruta:

```kotlin
@POST("auth/register")
suspend fun register(
    @Body request: RegisterRequest
): Response<RegisterResponse>
```

Como `BASE_URL` termina en `/api/`, esta ruta se convierte en:

```text
http://IP:3000/api/auth/register
```

Ejemplo con la IP actual:

```text
http://10.229.94.50:3000/api/auth/register
```

## 6. Que Datos Envia el Registro

Archivo:

```text
android/app/src/main/java/com/firesupportia/mobile/data/model/AuthModels.kt
```

Modelo que Android envia:

```kotlin
data class RegisterRequest(
    val nombre: String,
    val email: String,
    val password: String,
    val rol: String = "donante"
)
```

El JSON enviado al backend se ve asi:

```json
{
  "nombre": "Juan Perez",
  "email": "juan@email.com",
  "password": "Password123!",
  "rol": "donante"
}
```

Importante:

- Android envia `rol`, pero el backend actual no lo usa en el registro.
- El backend crea el usuario con rol por defecto `donante`.

## 7. Quien Envia los Datos desde Android

Archivo:

```text
android/app/src/main/java/com/firesupportia/mobile/data/repository/AuthRepository.kt
```

El repositorio ejecuta la llamada real:

```kotlin
suspend fun register(
    nombre: String,
    email: String,
    password: String
) = RetrofitClient.apiService.register(
    RegisterRequest(
        nombre = nombre,
        email = email,
        password = password
    )
)
```

El repository es una capa intermedia. Sirve para que las pantallas no llamen directamente a Retrofit.

## 8. Donde se Valida el Registro en Android

Archivo:

```text
android/app/src/main/java/com/firesupportia/mobile/viewmodel/AuthViewModel.kt
```

El `AuthViewModel` valida:

- Nombre obligatorio.
- Email obligatorio.
- Telefono obligatorio.
- Password obligatorio.
- Nombre con letras y al menos nombre + apellido.
- Email valido.
- Telefono peruano de 9 digitos que empieza con 9.
- Password minimo 8 caracteres.
- Password con mayuscula.
- Password con numero.
- Password con simbolo.
- Confirmacion de password.

Luego llama al repository:

```kotlin
repository.register(
    nombre = nombreLimpio,
    email = emailLimpio,
    password = password
)
```

Observacion importante:

La pantalla actual de registro todavia no esta conectada completamente a este `AuthViewModel`. Visualmente navega directo al OTP. Por eso, para que el registro sea real, hay que conectar `RegisterScreen` con `AuthViewModel`.

## 9. Como el Backend Recibe el Registro

Archivo:

```text
backend/src/app.js
```

El backend registra las rutas asi:

```js
app.use("/api/auth", authRoutes);
```

Archivo:

```text
backend/src/routes/auth.js
```

Define:

```js
router.post('/register', register);
router.post('/login', login);
```

Entonces la ruta completa del registro es:

```text
POST /api/auth/register
```

## 10. Que Hace el Backend al Registrar

Archivo:

```text
backend/src/controllers/authController.js
```

Funcion:

```js
const register = async (req, res) => { ... }
```

Pasos del backend:

1. Recibe `nombre`, `email`, `password` desde `req.body`.
2. Valida que no esten vacios.
3. Valida formato de email.
4. Valida que la contrasena tenga minimo 6 caracteres.
5. Busca si el correo ya existe.
6. Encripta la contrasena con `bcrypt`.
7. Guarda el usuario en MySQL.
8. Responde:

```json
{
  "message": "Usuario registrado correctamente"
}
```

## 11. Donde se Guarda en Base de Datos

Archivo:

```text
backend/src/models/Usuario.js
```

Tabla:

```text
usuarios
```

Campos principales:

- `id`
- `nombre`
- `email`
- `password_hash`
- `rol`
- `estado`
- `created_at`

El password no se guarda como texto normal. Se guarda como `password_hash`, que es una version encriptada.

## 12. Como se Configura MySQL en Backend

Archivo:

```text
backend/src/config/database.js
```

Usa variables de entorno:

```js
process.env.DB_NAME
process.env.DB_USER
process.env.DB_PASSWORD
process.env.DB_HOST
process.env.DB_PORT
```

Tambien necesita:

```js
process.env.JWT_SECRET
```

para generar tokens cuando el usuario inicia sesion.

El backend no tiene `.env.example`, pero deberia existir un archivo:

```text
backend/.env
```

Ejemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=firesupport_db
DB_USER=root
DB_PASSWORD=tu_password

JWT_SECRET=clave_secreta_para_tokens
```

Si usas una base de datos remota con SSL, la configuracion actual puede funcionar. Si usas MySQL local y te da error SSL, podria ser necesario ajustar `dialectOptions` en `database.js`.

## 13. Como se Ejecuta el Backend

Desde la carpeta principal del proyecto:

```bash
npm run backend
```

O directamente:

```bash
cd backend
npm run dev
```

El backend corre por defecto en:

```text
http://localhost:3000
```

Y como en `app.js` tiene:

```js
app.listen(PORT, '0.0.0.0', () => { ... })
```

tambien puede recibir peticiones desde otro dispositivo de la misma red.

## 14. Como Probar si el Backend Esta Vivo

En el navegador de tu laptop:

```text
http://localhost:3000
```

Deberia responder algo como:

```text
Backend FireSupport IA funcionando
```

Desde un celular fisico, usando la IP de la laptop:

```text
http://IP_DE_TU_LAPTOP:3000
```

Ejemplo:

```text
http://192.168.1.25:3000
```

Si no abre:

- El backend no esta corriendo.
- La IP no es correcta.
- El celular no esta en la misma red.
- Windows Firewall esta bloqueando Node.js.

## 15. Flujo Real de Registro

```text
Usuario llena formulario
  -> RegisterScreen
  -> AuthViewModel.register()
  -> AuthRepository.register()
  -> RetrofitClient.apiService.register()
  -> POST http://IP:3000/api/auth/register
  -> backend/src/routes/auth.js
  -> backend/src/controllers/authController.js
  -> Usuario.create()
  -> tabla usuarios en MySQL
  -> respuesta JSON
  -> Android muestra exito o error
```

## 16. Login: Que Existe y Que Falta

En backend ya existe:

```text
POST /api/auth/login
```

El backend espera:

```json
{
  "email": "usuario@email.com",
  "password": "Password123!"
}
```

Si el login es correcto responde:

```json
{
  "message": "Login exitoso",
  "token": "jwt...",
  "usuario": {
    "id": 1,
    "nombre": "Juan Perez",
    "email": "usuario@email.com",
    "rol": "donante"
  }
}
```

Pero en Android falta agregar:

- `LoginRequest`
- `LoginResponse`
- metodo `login()` en `ApiService`
- metodo `login()` en `AuthRepository`
- funcion `login()` en `AuthViewModel`
- conectar `LoginScreen` para que no navegue directo, sino que espere respuesta del backend.
- guardar el token JWT, idealmente con DataStore.

## 17. Que Datos Viajan en Cada Caso

### Registro

Android envia:

```json
{
  "nombre": "...",
  "email": "...",
  "password": "..."
}
```

Backend guarda:

```text
nombre
email
password_hash
rol = donante
estado = activo
```

Backend responde:

```json
{
  "message": "Usuario registrado correctamente"
}
```

### Login

Android deberia enviar:

```json
{
  "email": "...",
  "password": "..."
}
```

Backend responde:

```json
{
  "message": "Login exitoso",
  "token": "...",
  "usuario": {
    "id": 1,
    "nombre": "...",
    "email": "...",
    "rol": "donante"
  }
}
```

Ese token sirve para entrar luego a rutas protegidas.

## 18. Recomendacion Para Dejarlo Bien Configurado

Para una demo con emulador:

1. Levantar backend:

```bash
cd backend
npm run dev
```

2. En Android usar:

```kotlin
private const val BASE_URL = "http://10.0.2.2:3000/api/"
```

3. Verificar que `AndroidManifest.xml` tenga:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

4. Probar:

```text
http://localhost:3000
```

5. Ejecutar app Android.

Para una demo con celular fisico:

1. Conectar laptop y celular a la misma red.
2. Buscar la IP de la laptop.
3. Configurar:

```kotlin
private const val BASE_URL = "http://IP_DE_TU_LAPTOP:3000/api/"
```

4. Levantar backend.
5. Abrir desde el celular:

```text
http://IP_DE_TU_LAPTOP:3000
```

6. Ejecutar app Android.

## 19. Estado Actual del Proyecto Movil

Actualmente:

- Splash funciona visualmente.
- Login funciona visualmente, pero no llama al backend.
- Registro tiene pantalla visual, pero todavia no esta conectado completamente al `AuthViewModel`.
- Retrofit esta configurado.
- El endpoint de registro existe en Android.
- El backend tiene rutas reales para registro y login.
- MySQL se configura con `.env`.
- Home esta pendiente.

Siguiente paso recomendado:

Conectar `RegisterScreen` y `LoginScreen` al `AuthViewModel`, agregar login en Retrofit y guardar el token JWT.

