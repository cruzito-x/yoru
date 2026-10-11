# Identidad Yoru · versión 1.3.0

**Yoru** es el nombre elegido para la dirección japonesa y Y2K solicitada. La palabra de marca se presenta como **YORU**, con letras separadas y el emblema original.

## Logo

Se usó la imagen adjunta como objetivo de edición, conservando sus tres formas orgánicas y los recortes curvos. El emblema violeta pasó a azul marino y el destello de cuatro puntas de la parte superior se rellenó. El fondo del emblema es transparente.

El archivo principal es `assets/brand-mark.png`. El componente `BrandLogo` lo coloca sobre una base marfil para que el mismo logo marino siga siendo visible en modo oscuro. No se usa un destello ni se añaden adornos nuevos.

| Archivo | Uso |
| --- | --- |
| `assets/brand-mark.png` | Emblema transparente dentro de la app. |
| `assets/icon.png` | Icono general cuadrado de 1024 px, con base marfil. |
| `assets/android-icon-foreground.png` | Logo centrado dentro de la zona segura del icono adaptativo de Android. |
| `assets/android-icon-monochrome.png` | Misma silueta para los iconos temáticos de Android; el sistema decide el color cuando se activan. |
| `assets/splash-icon.png` | Logo de la pantalla nativa de inicio. |
| `assets/favicon.png` | Icono del navegador. |

## Descripción de la edición

Se utilizó la herramienta integrada de generación y edición de imágenes. La instrucción fue: conservar exactamente la silueta, proporciones y los espacios curvos de las tres piezas del logo; recolorear el violeta a azul marino con referencia `#142B4C`; rellenar el hueco del destello superior con el mismo azul; eliminar el fondo marfil y conservar los demás recortes transparentes; no añadir texto, brillos, bordes, sombras ni adornos. Después se adaptaron únicamente el tamaño, centrado y lienzo a los formatos de icono y de inicio.

## Configuración y compatibilidad

El nombre visible y el texto de marca están en `src/config/brand.ts`; el nombre del lanzador está en `app.json`, en `expo.name`. La versión es 1.3.0 y `android.versionCode` es 3.

Se conserva el identificador Android `com.bolsillo.gastos`, el slug Expo `bolsillo` y la clave de AsyncStorage `@bolsillo/budget-v1`. Son identificadores de continuidad, no el nombre que aparece en la app. El formato de datos sigue siendo versión 3; no se modifica ningún gasto ni ajuste por el cambio de marca.

Si ya hay un APK instalado, se debe compilar el nuevo e instalarlo con el mismo proyecto, paquete y firma, conservando los datos. El cambio de icono y nombre requiere una nueva compilación nativa. No se ha generado un APK firmado desde este entorno.
