# Instalar Yoru en Android

El ZIP es el **proyecto fuente**. No es un APK: descargarlo en el teléfono no instala la app. Tienes dos opciones.

## Opción 1: probar con Expo Go

1. En una computadora, instala Node.js 24 LTS (o Node 22.13.0 o superior dentro de la rama 22) y descomprime `yoru-react-native.zip`.
2. En Android, instala **Expo Go compatible con SDK 55**. Si la versión de Google Play no acepta este proyecto, usa la versión para SDK 55 del sitio oficial: https://expo.dev/go?sdkVersion=55&platform=android&device=true.
3. Abre una terminal dentro de la carpeta `yoru` y ejecuta:

```bash
npm ci
npm start
```

4. Conecta teléfono y computadora a la misma red Wi-Fi. Abre Expo Go y escanea el QR de la terminal. Mantén Metro y la computadora funcionando mientras pruebas.
5. Si Metro muestra un error de caché, cierra el servidor y ejecuta `npx expo start --clear`.

Expo Go permite revisar las pantallas. No instala Yoru como una app independiente. Sus datos tampoco se transfieren automáticamente al APK.

## Opción 2: instalar un APK independiente

Necesitas una computadora con Node/npm, Internet y una cuenta de Expo (https://expo.dev/signup). No necesitas Android Studio ni una cuenta de Google Play para esta instalación directa.

1. Descomprime el ZIP y abre la terminal en la carpeta `yoru`.
2. Ejecuta estos comandos en orden:

```bash
npm ci
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --platform android --profile preview
```

- `login`: ingresa a tu cuenta de Expo desde tu terminal.
- `init`: crea o vincula el proyecto a tu cuenta y escribe su identificador real en `app.json`. Acepta crear un proyecto nuevo si es la primera compilación; no reemplaces el identificador por un valor de ejemplo.
- `build`: envía el código a EAS para generar el APK. El archivo `eas.json` ya incluye `preview` con `android.buildType: "apk"`, distribución interna y `developmentClient: false`. Se genera una app de lanzamiento que incluye su JavaScript y funciona sin Metro.
- Si EAS pregunta por Git, acepta inicializar el repositorio y crear el commit inicial. Si solicita firmar Android, selecciona **Generate new keystore** para que gestione la firma.

3. Espera a que la compilación termine correctamente. Abre en tu Android el enlace de instalación que muestra EAS; también lo encontrarás en el panel de compilaciones de tu cuenta de Expo.
4. Descarga el archivo `.apk`, ábrelo y pulsa **Instalar**. Si Android lo solicita, permite **Instalar apps desconocidas** para el navegador o gestor de archivos con el que abriste este APK. El nombre del ajuste varía según el teléfono.
5. Abre **Yoru** desde su icono. Ya puedes usarla sin computadora, Expo Go o conexión a Internet. Los gastos y ajustes se guardan en el teléfono.

El paquete usa Android 7 o posterior según los requisitos de Expo SDK 55. El identificador de aplicación es `com.bolsillo.gastos`; conserva este valor y el mismo proyecto/keystore para actualizar una instalación existente. Si vas a publicar en Google Play, elige antes un identificador propio disponible.

## Actualizar una instalación

Para actualizar el código fuente desde un ZIP, descomprímelo en una carpeta nueva. Esto evita conservar rutas o archivos retirados de versiones anteriores. Vuelve a vincular el mismo proyecto EAS y usa la misma firma al generar el APK.

Esta versión conserva el nombre visible **Yoru**, el icono, `com.bolsillo.gastos`, el slug `bolsillo` y la clave local para mantener la continuidad de la app y sus datos. El `android.versionCode` actual es 11 (versión 1.7.6). Genera e instala el nuevo APK con el mismo proyecto y firma; conserva la instalación anterior para mantener sus datos.

Mantén el `android.package`, el proyecto EAS y la firma. Incrementa `android.versionCode` en `app.json`, vuelve a compilar con `preview` e instala el nuevo APK sobre el anterior. No desinstales para actualizar si quieres conservar los datos. Cambiar de firma, borrar datos o desinstalar elimina o impide conservar esa instalación.

## Qué incluye y qué se ha comprobado

- El proyecto incluye `eas.json`, identificador Android e instrucciones; todavía **no se ha generado ni firmado un APK** con tu cuenta.
- Se verifican TypeScript, pruebas de lógica y exportación de JavaScript/Hermes para Android; eso no sustituye una compilación nativa ni una prueba en un teléfono.
- Una exportación `npm run export:all` no produce un APK.
- El perfil `production` genera un `.aab` para Google Play; para instalar directamente usa `preview`.

## Referencias oficiales

- EAS: https://docs.expo.dev/build/setup/
- APK: https://docs.expo.dev/build-reference/apk/
- Distribución interna: https://docs.expo.dev/build/internal-distribution/
- Expo Go SDK 55: https://expo.dev/go?sdkVersion=55&platform=android&device=true
- Requisitos SDK 55: https://docs.expo.dev/versions/v55.0.0/
