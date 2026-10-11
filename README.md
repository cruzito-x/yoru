# Yoru

Aplicación de gestión de gastos hecha con **React Native, Expo y TypeScript**. El código está organizado para que un desarrollador Junior pueda seguir el recorrido de los datos sin necesitar Redux, un backend ni un sistema complejo de navegación.

La versión **1.3.0** adopta el nombre **Yoru** y el logo suministrado, editado a azul marino sin el destello superior. Actualiza el icono de Android, la imagen de inicio, el favicon y los encabezados de las tres vistas. También conserva el azul marino, permite configurar **dos días de pago por mes** y calcula automáticamente los próximos cobros. Si caen sábado o domingo, los adelanta al viernes. Incluye un perfil para generar un APK de Android. El calendario organiza cada semana en siete columnas fijas de lunes a domingo, para mantener todos los días visibles incluso en pantallas estrechas.

## Ejecutar

Necesitas Node.js 20.19 o superior y npm. Se recomienda una versión LTS compatible con Expo SDK 55.

```bash
cd yoru
npm ci
npm start
```

En Android, abre **Expo Go** y escanea el QR de la terminal. El teléfono y la computadora deben estar en la misma red. Este proyecto usa **Expo SDK 55**: la versión de Expo Go debe ser compatible con ese SDK. Consulta https://expo.dev/go si necesitas la versión correspondiente. Si Metro muestra problemas de caché, ejecuta `npx expo start --clear`.

También puedes ejecutar:

```bash
npm run android  # Emulador Android instalado y abierto
npm run ios      # Simulador iOS; necesita macOS y Xcode
npm run web      # Navegador para revisar la misma app
```

El ZIP contiene el código fuente, no un APK. Para instalarla como app independiente en Android, sigue **[docs/ANDROID.md](docs/ANDROID.md)**. El perfil `preview` de `eas.json` genera un APK de lanzamiento; no necesita Expo Go ni mantener la computadora encendida. EAS Build requiere tu cuenta de Expo para compilar. La app instalada guarda los gastos localmente y funciona sin cuenta ni conexión.

## Las tres vistas

| Vista | Funciones |
| --- | --- |
| Dashboard | Seleccionar quincena, ver sueldo/saldo, dona con porcentajes, crear y editar categorías, añadir y editar gastos dentro de cada categoría. |
| Historial | Consultar día, semana, mes o año; navegar entre períodos o introducir una fecha; ver gastos agrupados por día y editarlos. |
| Ajustes | Configurar sueldo quincenal, configurar dos días recurrentes de pago y ver las fechas reales en el calendario, registrar aguinaldo en diciembre y elegir tema claro, oscuro o automático. |

Un menú inferior mantiene las tres vistas accesibles. Cada gasto guarda nombre, monto, categoría, fecha y nota opcional. Para editarlo, toca su fila. Para eliminarlo, abre la edición y confirma la eliminación.

El sueldo inicial es **$300 por quincena**, editable. Se incluyen cuatro categorías vacías; no se cargan gastos personales ni pagos ficticios.

## Organización del código

| Ruta | Responsabilidad |
| --- | --- |
| `src/config/brand.ts` | Nombre, palabra de marca y versión visible en un único archivo. |
| `src/components/BrandLogo.tsx` | Muestra el logo marino sobre una base marfil, legible en ambos temas. |
| `assets/brand-mark.png` | Logo con fondo transparente, sin destello. |
| `docs/IDENTIDAD.md` | Identidad Yoru, descripción de la edición y compatibilidad al actualizar. |
| `App.tsx` | Conecta los proveedores, las pantallas y el menú inferior; muestra errores de carga/guardado. |
| `src/screens/` | Una pantalla por vista: `DashboardScreen`, `HistoryScreen`, `SettingsScreen`. |
| `src/components/` | Componentes reutilizables: dona, categorías, filas de gastos, formularios, botones, campos, modales y calendario. |
| `src/components/Calendar.tsx` | Cuadrícula de meses: permite elegir días habituales y marca los cobros reales, incluidos los adelantados al viernes. |
| `src/components/PaymentScheduleCard.tsx` | Selecciona dos días habituales, guarda la regla y muestra los siguientes seis cobros. |
| `src/components/AnnualBonusCard.tsx` | Habilita el monto de aguinaldo en diciembre y actualiza el registro del año. |
| `src/context/BudgetContext.tsx` | Comparte los datos entre pantallas y coordina su carga y guardado. |
| `src/context/budgetReducer.ts` | Define las operaciones de crear, editar, eliminar y cambiar ajustes. |
| `src/theme/theme.ts` | **Archivo global con todos los colores de los temas claro y oscuro.** |
| `src/theme/useTheme.ts` | Resuelve el tema del usuario o del sistema y entrega los colores a cada componente. |
| `src/services/storage.ts` | Lee y guarda datos con AsyncStorage. |
| `src/utils/payments.ts` | Calcula pagos mensuales, ajustes de fin de semana y próximas fechas; valida que no coincidan dos pagos. |
| `eas.json` | Perfiles de compilación: `preview` para APK y `production` para Google Play. |
| `docs/ANDROID.md` | Guía de Expo Go y de instalación de un APK. |
| `src/utils/budgetSchema.ts` | Valida el estado y migra automáticamente los datos de la versión anterior. |
| `src/hooks/useToday.ts` | Actualiza la fecha al volver a la app y cada minuto mientras permanece abierta. |
| `src/utils/` | Funciones independientes para dinero, fechas, filtros y totales. |
| `src/types/budget.ts` | Tipos de categorías, gastos, sueldo, tema y períodos. |
| `src/data/defaults.ts` | Sueldo, categorías y colores iniciales. |
| `tests/budget.test.ts` | Pruebas de cálculos y reglas del presupuesto. |

### Ruta sugerida de lectura para un Junior

1. `types/budget.ts`: entender qué datos se guardan.
2. `data/defaults.ts`: ver cómo se crea el estado inicial.
3. `context/budgetReducer.ts`: ver las acciones que modifican el estado.
4. `context/BudgetContext.tsx`: entender cómo se comparte y persiste el estado.
5. `screens/DashboardScreen.tsx`: seguir los datos hasta su presentación.
6. `components/ExpenseForm.tsx`: seguir la entrada del usuario hasta `dispatch`.
7. `theme/theme.ts` y `theme/useTheme.ts`: modificar la apariencia global.

Ejemplo: al guardar un gasto, el formulario valida los campos y envía `SAVE_EXPENSE`. El reducer actualiza el estado. El contexto guarda el estado con AsyncStorage y React actualiza el saldo, la dona y el historial. Los comentarios del código explican las decisiones que no resultan evidentes.

## Dos fechas de pago y aguinaldo

En Ajustes, configura **Día del primer pago** y **Día del segundo pago**. Puedes escribir los días o elegir **Primer pago / Segundo pago** y tocar el calendario. Para la segunda fecha puedes usar **Último día**; de ese modo cambia entre 28, 29, 30 y 31 según el mes. Pulsa **Guardar calendario de pagos** una vez.

La app repite ambos días cada mes, muestra los próximos seis cobros y marca automáticamente las fechas de los meses que visites. La lista avanza al cambiar la fecha actual, al regresar a la app o mientras permanece abierta; no necesitas volver a guardar. Las reglas persisten al cerrar y abrir la app.

- Si cae **sábado**, el pago será el **viernes anterior**.
- Si cae **domingo**, el pago será el **viernes anterior**, dos días antes.
- Los demás días se mantienen. Ejemplo: el domingo 15 de noviembre de 2026 se cobra el viernes 13.
- Un día fijo 29, 30 o 31 que no exista en un mes usa primero el último día de ese mes y luego aplica el ajuste de fin de semana. El 30 de febrero de 2026 se resuelve como 28 de febrero y se adelanta al viernes 27.
- El calendario muestra el cobro real en azul y el día habitual adelantado con un borde. Las fechas pasadas del mes también se pueden tocar, porque se está configurando un día recurrente, no una fecha única futura.
- Los días deben estar en orden y separados al menos tres días, también entre meses. Así no coinciden en un mismo viernes ni se convierten en una sola fecha en febrero.
- No se contemplan feriados. El calendario no crea depósitos bancarios ni notificaciones; el presupuesto mantiene los períodos del 1 al 14 y del 15 al fin de mes.

El campo **Aguinaldo (USD)** se habilita únicamente cuando la fecha actual del dispositivo está en **diciembre**. Navegar a diciembre dentro del calendario no lo activa si el mes actual es otro. El apartado se actualiza al volver a la app y al cambiar de mes mientras está abierta.

Se guarda un aguinaldo por año. Para un registro nuevo se propone el próximo cobro de diciembre o la fecha actual si no hay ninguno. Puedes cambiar **Fecha del aguinaldo (AAAA-MM-DD)** por cualquier fecha válida de diciembre del año actual. Si ya existe un aguinaldo, editar su monto conserva su fecha; el avance del calendario no lo traslada a otra quincena.

El dashboard suma el sueldo y el aguinaldo en la quincena que contiene su fecha. Por ejemplo, sueldo de $300 y aguinaldo de $200 para el 15 de diciembre producen ingresos de $500 en la segunda quincena de diciembre. Editar el monto reemplaza el registro del año; no duplica el ingreso. Guardar 0 lo retira del saldo. Al terminar diciembre se bloquea su edición, pero el registro histórico se conserva.

## La dona

Se utiliza **react-native-svg**, incluido entre las librerías compatibles con Expo. `DonutChart.tsx` dibuja la dona con círculos y segmentos SVG; funciona de forma nativa en Android/iOS y también en web. Es una alternativa a Chart.js para evitar añadir Canvas o una WebView a la app móvil.

- Los ingresos son el sueldo más el aguinaldo que corresponda a la quincena.
- Con gastos menores o iguales a los ingresos, cada categoría representa su porcentaje del ingreso y el resto corresponde al saldo disponible.
- Si se superan los ingresos, la dona representa la distribución de los gastos totales y el saldo restante es 0%. El centro muestra el porcentaje del ingreso consumido, que puede superar el 100%, y el dashboard muestra el déficit.
- Con ingresos cero no se divide entre cero; se muestra el monto gastado.
- Con ingresos y gastos cero se muestra un anillo vacío.
- Los porcentajes se redondean a un decimal; sus etiquetas pueden sumar 99.9% o 100.1% por redondeo.

## Reglas de datos

- **Dinero:** centavos enteros (`amountCents`). Por ejemplo, $2.90 se guarda como `290`. Los formularios permiten punto o coma decimal, hasta dos decimales y montos de hasta $999,999.99. No admiten separadores de miles. Un gasto debe ser mayor a cero; el sueldo puede ser cero.
- **Fechas:** cadenas locales `AAAA-MM-DD`. Se validan días, meses y años bisiestos. No se usa UTC para filtrar fechas; las fechas admitidas van de 1900 a 2100.
- **Quincenas:** del 1 al 14 y del 15 al último día del mes, sin traslapes. El saldo no se arrastra entre quincenas.
- **Sueldo:** un cambio aplica a toda la quincena actual y a las siguientes. Las quincenas anteriores conservan el sueldo configurado para ellas. No se registran depósitos bancarios reales; el sueldo es el presupuesto del período.
- **Semanas:** lunes a domingo, incluso al cruzar meses o años.
- **Categorías:** no se permiten nombres duplicados sin distinguir mayúsculas. Una categoría con gastos no puede eliminarse para conservar su historial; primero se deben mover sus gastos a otra categoría o eliminarlos desde su edición.
- **Gastos:** se pueden registrar fechas pasadas o futuras. Todos los registros cuentan como gastos de su período; no hay un estado separado de gasto previsto o pagado.
- **Persistencia:** gastos, categorías, tema, historial del sueldo, dos días habituales de pago y aguinaldos se guardan localmente. Las escrituras se ejecutan en orden. Si falla la lectura, la app conserva los datos almacenados y permite reintentar; si falla el guardado, muestra un aviso y permite reintentarlo.
- **Actualización:** el formato de datos pasa a versión 3. Se conserva la clave de AsyncStorage y se migran las versiones 1 y 2 manteniendo gastos, categorías, sueldos, tema y aguinaldos. La fecha única de la versión 2 se conserva y aparece como referencia hasta que confirmes tus dos días habituales; no se inventa un segundo día de pago.

## Modificaciones frecuentes

- Cambiar nombre visible: `src/config/brand.ts` y `expo.name` en `app.json`.
- Cambiar logo: `assets/brand-mark.png` y los iconos de plataforma en `assets/`; recompila el APK para actualizar el icono del lanzador.
- Cambiar colores: `src/theme/theme.ts`.
- Cambiar sueldo/categorías iniciales: `src/data/defaults.ts`. Esto aplica a instalaciones sin datos guardados; usa Ajustes para modificar una instalación existente.
- Añadir una vista: crear la pantalla, agregar una opción a `Tab` en `types/budget.ts`, agregar el botón en `BottomTabs.tsx` y renderizarla desde `App.tsx`.
- Añadir un campo a un gasto: actualizar `Expense` en `types/budget.ts`, el formulario y la validación de `utils/budgetSchema.ts`. Si cambia el formato persistido, añadir una migración antes de modificar su versión.
- Conectar un backend: conservar los componentes y sustituir la capa `services/storage.ts`, gestionando la sincronización y los errores correspondientes.

## Verificación

```bash
npm run typecheck
npm run lint
npm test
npm run export:all
```

Las 29 pruebas cubren centavos exactos, entradas inválidas, porcentajes con sueldo cero, límites de quincenas, años bisiestos, semanas que cruzan el año, navegación desde el día 31, filtros inclusivos, altas/ediciones sin duplicados, protección de categorías utilizadas, cambios de sueldo, serialización del tema, calendario, dos fechas mensuales, sábados/domingos, meses cortos, cambios de año, próximos pagos, habilitación de diciembre, aguinaldos por año y migración sin pérdida de datos.

Durante la creación se verifica también el flujo en la versión web con tamaño móvil: categorías, formularios, gastos, historial, sueldo, temas, recarga de datos, calendario y aguinaldo en distintos meses. La exportación de Android/iOS valida los paquetes de JavaScript/Hermes; no equivale a instalar ni probar un APK o una app de iOS en un dispositivo físico. Revisa `docs/VALIDACION.md` para los resultados concretos.

## Alcance

Esta versión funciona sin backend y sin sincronización entre dispositivos. AsyncStorage es almacenamiento local no cifrado. Desinstalar la app, borrar sus datos o limpiar los datos del sitio web elimina la información. No incluye importación/exportación, gastos recurrentes automáticos, otros ingresos extraordinarios ni sincronización bancaria. El historial usa listas sencillas para mantener el código legible; con volúmenes muy grandes convendría migrarlo a `SectionList` y una base de datos local.

## Documentación oficial

- Expo SDK 55: https://docs.expo.dev/versions/v55.0.0/
- SVG: https://docs.expo.dev/versions/v55.0.0/sdk/svg/
- AsyncStorage: https://docs.expo.dev/versions/v55.0.0/sdk/async-storage/
- Temas: https://docs.expo.dev/develop/user-interface/color-themes/

- APK de Android: https://docs.expo.dev/build-reference/apk/
- Configuración EAS: https://docs.expo.dev/build/setup/
