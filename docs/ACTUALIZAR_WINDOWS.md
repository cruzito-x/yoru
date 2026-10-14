# Actualizar Yoru 1.7.6 en Windows

Carpeta del proyecto: `C:\Users\dcruz\OneDrive\Escritorio\yoru`.

1. Detén Metro en su terminal con `Ctrl + C`.
2. Descomprime `yoru-react-native.zip` en una carpeta temporal.
3. Copia **el contenido** de la carpeta `yoru` del ZIP dentro de tu carpeta del proyecto, reemplazando los archivos correspondientes. Evita crear `yoru\yoru`.
4. Abre una terminal en el proyecto y reinicia la vista previa:

```powershell
Set-Location 'C:\Users\dcruz\OneDrive\Escritorio\yoru'
npx expo start --web --clear
```

Esta entrega mantiene las mismas dependencias de la versiones 1.6.0 y 1.7.0; si la versión web ya abría, puedes conservar `node_modules`. Para una instalación nueva, ejecuta primero `npm ci` y espera a que termine sin errores.

Los archivos de código del ZIP no contienen tus gastos. Los datos del navegador permanecen en su almacenamiento local; usa el mismo navegador y dirección de vista previa para continuar con ellos. La app migra automáticamente el formato anterior. Para Android, conserva la instalación, la firma y el identificador de la app al recompilar; consulta [ANDROID.md](ANDROID.md).

Si OneDrive vuelve a bloquear archivos con `EPERM`, cierra Metro y VS Code y trabaja en una carpeta fuera de OneDrive, por ejemplo `C:\Proyectos\yoru`.

## Comprobar los cambios

- En Ajustes → Ingresos y planilla, configura el sueldo bruto y antigüedad en Planilla; en la tarjeta expandible configura viáticos mensuales ($150 equivale a $75 por quincena). Guarda los datos base de planilla. El ingreso disponible y su desglose se calculan automáticamente.
- Las pestañas de Aguinaldo y Quincena 25 muestran cálculos de consulta y no permiten registrarlos como ingresos.
- En el calendario de pagos, los campos del primer y segundo día aparecen en una sola fila.
- Al crear o editar una categoría, usa la paleta, el matiz o el campo HEX y guarda el color elegido. La muestra queda alineada con el campo y el código se muestra en minúsculas.
- En Dashboard hay un solo botón superior para añadir categorías y no aparece el texto inferior de deslizamiento.
