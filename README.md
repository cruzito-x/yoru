# Yoru

Aplicación de gestión de gastos hecha con **React Native, Expo y TypeScript**. El código está organizado para que un desarrollador Junior pueda seguir el recorrido de los datos sin necesitar Redux, un backend ni un sistema complejo de navegación.

La versión **1.7.6** organiza los días habituales de pago en una fila, alinea la muestra con el campo HEX y mantiene el código de color en minúsculas. Incluye los cálculos de planilla y prestaciones y el desglose colapsable del ingreso quincenal.

La versión **1.7.1** separó ingresos y planilla en dos pestañas dentro de Ajustes. El ingreso quincenal desglosa AFP, ISSS, renta y viáticos; el sueldo bruto mantiene la base del aguinaldo y la Quincena 25.

La versión **1.7.0** añadió sueldo mensual en planilla y antigüedad, calcula automáticamente el aguinaldo y la Quincena 25 y los organiza en dos pestañas dentro de Ajustes. El formulario de categorías incluye una paleta de color personalizada y entrada HEX. El dashboard conserva únicamente el botón superior para añadir categorías y retira el texto de deslizamiento. Las categorías siguen en un carrusel táctil, con hasta cuatro gastos completos visibles y scroll para consultar el resto.

La app funciona **sin conexión a una base de datos remota**. Gastos, categorías y ajustes se guardan automáticamente en el teléfono con AsyncStorage; no necesita cuentas, credenciales ni variables de conexión. Las categorías se mantienen en un carrusel horizontal manual, una tarjeta a la vez; las listas de gastos se pueden mostrar u ocultar en conjunto.

La versión **1.3.1** añadió un selector de fecha para crear y editar gastos con `@amjed-bouhouch/react-native-ui-datepicker` y redondea el fondo activo y pulsado del menú inferior. El calendario de gastos usa una sola fecha, español, domingos visibles, días adyacentes atenuados y flechas a la derecha; los colores se adaptan al tema global. La versión 1.3.0 adopta el nombre **Yoru** y el logo suministrado, editado a azul marino sin el destello superior. Actualiza el icono de Android, la imagen de inicio, el favicon y los encabezados de las tres vistas. También conserva el azul marino, permite configurar **dos días de pago por mes** y calcula automáticamente los próximos cobros. Si caen sábado o domingo, los adelanta al viernes. Incluye un perfil para generar un APK de Android. El calendario organiza cada semana en siete columnas fijas de lunes a domingo, para mantener todos los días visibles incluso en pantallas estrechas.

## Actualizar en Windows

Para aplicar esta entrega en `C:\Users\dcruz\OneDrive\Escritorio\yoru`, sigue [docs/ACTUALIZAR_WINDOWS.md](docs/ACTUALIZAR_WINDOWS.md).

## Ejecutar

Necesitas Node.js 24 LTS y npm. También puedes usar una versión actual de Node 22, desde 22.13.0; Node 22.12.0 no cumple los requisitos de algunas dependencias de ESLint.

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

## Las vistas

| Vista | Funciones |
| --- | --- |
| Dashboard | Seleccionar quincena, ver ingresos/saldo y dona; recorrer categorías mediante deslizamiento táctil; mostrar u ocultar listas de gastos, añadir gastos y editarlos desde sus filas. |
| Historial | Consultar día, semana, mes o año; navegar entre períodos o introducir una fecha; ver gastos agrupados por día y editarlos. |
| Ajustes | Configurar sueldo mensual bruto en planilla, antigüedad y viáticos; consultar los cálculos de ingreso neto, aguinaldo y Quincena 25; elegir el tema. |

Un menú inferior permite cambiar entre las tres vistas. Aguinaldo y Quincena 25 tienen dos pestañas internas en Ajustes y muestran resultados derivados de la planilla, sin registro manual ni efecto directo en el saldo. Cada gasto guarda nombre, monto, categoría, fecha y nota opcional. En el formulario, toca **Fecha del gasto**, navega con las flechas o los selectores de mes/año y toca un día. Elegir la fecha no guarda el gasto: confirma con **Guardar gasto**. Para editarlo, toca su fila. Para eliminarlo, abre la edición y confirma la eliminación.

El sueldo inicial es **$300 por quincena**, editable. Se incluyen cuatro categorías vacías; no se cargan gastos personales ni pagos ficticios.

## Organización del código

| Ruta | Responsabilidad |
| --- | --- |
| `src/config/brand.ts` | Nombre, palabra de marca y versión visible en un único archivo. |
| `src/components/BrandLogo.tsx` | Muestra el logo marino sobre una base marfil, legible en ambos temas. |
| `assets/brand-mark.png` | Logo con fondo transparente, sin destello. |
| `docs/IDENTIDAD.md` | Identidad Yoru, descripción de la edición y compatibilidad al actualizar. |
| `App.tsx` | Conecta los proveedores de datos/tema y el espacio de rutas; muestra errores de carga/guardado. |
| `src/app/` | Rutas y navegación con Expo Router; `(tabs)/_layout.tsx` conecta el menú inferior. |
| `src/components/CategoryCarousel.tsx` | Una categoría por página, deslizamiento táctil e indicador de posición, sin flechas. |
| `src/components/CategoryExpenseList.tsx` | Lista de cuatro filas de altura uniforme, adaptada al contenido más alto, con scroll vertical. |
| `src/screens/` | Una pantalla por vista: `DashboardScreen`, `HistoryScreen`, `SettingsScreen`. |
| `src/components/` | Componentes reutilizables: dona, categorías, filas de gastos, formularios, botones, campos, modales y calendario. |
| `src/components/ExpenseDatePicker.tsx` | Selector de fecha para gastos e ingresos; encapsula la dependencia, el tema y la conversión a fecha local. |
| `docs/SELECTOR_FECHA.md` | Uso del calendario, recorrido del código y comprobaciones manuales. |
| `src/components/Calendar.tsx` | Cuadrícula de meses: permite elegir días habituales y marca los cobros reales, incluidos los adelantados al viernes. |
| `src/components/PaymentScheduleCard.tsx` | Selecciona dos días habituales, guarda la regla y muestra los siguientes seis cobros. |
| `src/components/AnnualBonusCard.tsx` | Consulta de aguinaldo calculado con sueldo y antigüedad. |
| `src/components/Quincena25Card.tsx` | Consulta de Quincena 25 calculada desde el sueldo mensual bruto. |
| `src/components/PayrollCard.tsx` | Pestañas de ingresos y planilla; desglose colapsable y guardado sólo de datos base. |
| `src/components/SpecialIncomeTabs.tsx` | Pestañas internas Aguinaldo / Quincena 25 con parámetros de Expo Router. |
| `src/components/ColorPicker.tsx` | Matiz, saturación, brillo, vista previa y código HEX para categorías. |
| `src/utils/payroll.ts` | Validación y fórmulas del aguinaldo y Quincena 25. |
| `src/utils/colors.ts` | Conversión HEX/HSV y validación de colores. |
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
| `src/data/defaults.ts` | Sueldo, categorías, colores y montos sugeridos de ingresos especiales. |
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

## Categorías y listas de gastos

Desliza horizontalmente sobre las tarjetas para cambiar de categoría. El indicador muestra la posición y la categoría actual; no hay flechas ni avance automático. Las tarjetas muestran la lista de gastos por defecto. Usa la flecha para ocultar o volver a mostrar las listas de todas las categorías; usa **Añadir gasto** para crear un gasto y toca una fila para editarlo.

Cada tarjeta muestra hasta cuatro gastos; si hay más, desliza verticalmente dentro de la lista para verlos. Los totales de la tarjeta siempre consideran todos los gastos.

## Planilla, aguinaldo y Quincena 25

En **Ajustes → Ingresos y planilla**, usa las pestañas **Ingresos** y **Planilla**. Ingresos muestra el total disponible y un desglose colapsable de AFP (7.25%), ISSS (3%), renta y viáticos. Planilla presenta el sueldo mensual bruto, seguido por las cards colapsables de viáticos y antigüedad para el aguinaldo. El botón **Guardar planilla** guarda estos datos base; el ingreso presupuestado se calcula automáticamente y no se guarda como resultado independiente.

Los valores iniciales reflejan $500 mensuales brutos, $150 mensuales de viáticos ($75 por quincena) y una planilla neta estimada de $224.38 por quincena; total disponible: $299.38. Con esos ingresos, la retención de renta estimada es $0. Un campo inválido impide guardar cambios parciales.

Debajo encontrarás las dos pestañas **Aguinaldo** y **Quincena 25**. Ambas muestran cálculos de consulta basados en la planilla guardada y se actualizan automáticamente; no se registran como ingresos ni alteran el saldo del dashboard.

| Antigüedad para el aguinaldo | Días de salario | Fórmula |
| --- | --- | --- |
| 1 a menos de 3 años | 15 | Sueldo mensual × 15 / 30 |
| 3 a menos de 10 años | 19 | Sueldo mensual × 19 / 30 |
| 10 años o más | 21 | Sueldo mensual × 21 / 30 |

El cálculo aplica las tres reglas solicitadas, disponibles a partir de un año de servicio. Se redondea el resultado final a centavos, sin redondear antes el salario diario. Tabla del Ministerio de Trabajo: https://defiendetuaguinaldo.mtps.gob.sv/.

**Quincena 25 = sueldo mensual en planilla / 2.** Con $500 y un año y medio de antigüedad, ambos cálculos muestran $250. Con $500 y 3 años, el aguinaldo es $316.67 y la Quincena 25 sigue en $250.

- **Aguinaldo:** el cálculo usa sueldo mensual y antigüedad de planilla; consulta la referencia del Ministerio de Trabajo: https://defiendetuaguinaldo.mtps.gob.sv/.
- **Quincena 25:** muestra la mitad del sueldo mensual bruto configurado. La referencia legal y fechas de pago están en: https://www.mtps.gob.sv/2026/01/14/ministro-de-trabajo-informa-aplicacion-de-ley-quincena-25/.

## Colores de categorías

Usa el único botón superior **+ Categoría** para crear una categoría y el icono de edición de su tarjeta para modificarla. Además de los ocho colores rápidos, el modal ofrece **Color personalizado**: arrastra por la paleta para cambiar saturación/brillo y por la barra para cambiar el matiz. La muestra y el código HEX se actualizan inmediatamente. También puedes introducir seis dígitos HEX, con o sin `#`; un código inválido bloquea el guardado. Confirma con **Guardar categoría**. Cambiar el color conserva los gastos de la categoría y actualiza su tarjeta y los gráficos.

## Dos fechas de pago

En Ajustes, configura **Día del primer pago** y **Día del segundo pago**. Puedes escribir los días o elegir **Primer pago / Segundo pago** y tocar el calendario. Para la segunda fecha puedes usar **Último día**; de ese modo cambia entre 28, 29, 30 y 31 según el mes. Pulsa **Guardar calendario de pagos** una vez.

La app repite ambos días cada mes, muestra los próximos seis cobros y marca automáticamente las fechas de los meses que visites. La lista avanza al cambiar la fecha actual, al regresar a la app o mientras permanece abierta; no necesitas volver a guardar. Las reglas persisten al cerrar y abrir la app.

- Si cae **sábado**, el pago será el **viernes anterior**.
- Si cae **domingo**, el pago será el **viernes anterior**, dos días antes.
- Los demás días se mantienen. Ejemplo: el domingo 15 de noviembre de 2026 se cobra el viernes 13.
- Un día fijo 29, 30 o 31 que no exista en un mes usa primero el último día de ese mes y luego aplica el ajuste de fin de semana. El 30 de febrero de 2026 se resuelve como 28 de febrero y se adelanta al viernes 27.
- El calendario muestra el cobro real en azul y el día habitual adelantado con un borde. Las fechas pasadas del mes también se pueden tocar, porque se está configurando un día recurrente, no una fecha única futura.
- Los días deben estar en orden y separados al menos tres días, también entre meses. Así no coinciden en un mismo viernes ni se convierten en una sola fecha en febrero.
- No se contemplan feriados. El calendario no crea depósitos bancarios ni notificaciones; el presupuesto mantiene los períodos del 1 al 14 y del 15 al fin de mes.

## La dona

Se utiliza **react-native-svg**, incluido entre las librerías compatibles con Expo. `DonutChart.tsx` dibuja la dona con círculos y segmentos SVG; funciona de forma nativa en Android/iOS y también en web. Es una alternativa a Chart.js para evitar añadir Canvas o una WebView a la app móvil.

- El ingreso por quincena se calcula desde el sueldo bruto mensual, las deducciones estimadas y los viáticos.
- Con gastos menores o iguales a los ingresos, cada categoría representa su porcentaje del ingreso y el resto corresponde al saldo disponible.
- Si se superan los ingresos, la dona representa la distribución de los gastos totales y el saldo restante es 0%. El centro muestra el porcentaje del ingreso consumido, que puede superar el 100%, y el dashboard muestra el déficit.
- Con ingresos cero no se divide entre cero; se muestra el monto gastado.
- Con ingresos y gastos cero se muestra un anillo vacío.
- Los porcentajes se redondean a un decimal; sus etiquetas pueden sumar 99.9% o 100.1% por redondeo.

## Reglas de datos

- **Dinero:** centavos enteros (`amountCents`). Por ejemplo, $2.90 se guarda como `290`. Los formularios permiten punto o coma decimal, hasta dos decimales y montos de hasta $999,999.99. No admiten separadores de miles. Un gasto debe ser mayor a cero; el sueldo puede ser cero.
- **Fechas:** cadenas locales `AAAA-MM-DD`. Se validan días, meses y años bisiestos. No se usa UTC para filtrar fechas; las fechas admitidas van de 1900 a 2100.
- **Quincenas:** del 1 al 14 y del 15 al último día del mes, sin traslapes. El saldo no se arrastra entre quincenas.
- **Sueldo:** al guardar cambios en Planilla, el ingreso presupuestado se vuelve a calcular desde los datos base. No se registran depósitos bancarios reales.
- **Semanas:** lunes a domingo, incluso al cruzar meses o años.
- **Categorías:** no se permiten nombres duplicados sin distinguir mayúsculas. Una categoría con gastos no puede eliminarse para conservar su historial; primero se deben mover sus gastos a otra categoría o eliminarlos desde su edición.
- **Gastos:** se pueden registrar fechas pasadas o futuras. Todos los registros cuentan como gastos de su período; no hay un estado separado de gasto previsto o pagado.
- **Persistencia:** gastos, categorías, tema, historial del sueldo, dos días habituales de pago, planilla, antigüedad, aguinaldos e ingresos Quincena 25 se guardan localmente. Las escrituras se ejecutan en orden. Si falla la lectura, la app conserva los datos almacenados y permite reintentar; si falla el guardado, muestra un aviso y permite reintentarlo.
- **Actualización:** el formato de datos pasa a versión 6. Se conserva la clave de AsyncStorage y se migran las versiones 1 a 5 manteniendo el historial guardado e incorporando viáticos. La fecha única de la versión 2 se conserva y aparece como referencia hasta que confirmes tus dos días habituales.

## Modificaciones frecuentes

- Cambiar nombre visible: `src/config/brand.ts` y `expo.name` en `app.json`.
- Cambiar logo: `assets/brand-mark.png` y los iconos de plataforma en `assets/`; recompila el APK para actualizar el icono del lanzador.
- Cambiar colores: `src/theme/theme.ts`.
- Cambiar sueldo/categorías iniciales: `src/data/defaults.ts`. Esto aplica a instalaciones sin datos guardados; usa Ajustes para modificar una instalación existente.
- Añadir una vista: crear la pantalla, agregar una opción a `Tab` en `types/budget.ts`, agregar el botón en `BottomTabs.tsx` y añadir su archivo de ruta en `src/app/(tabs)/` y su entrada en el layout de pestañas.
- Añadir un campo a un gasto: actualizar `Expense` en `types/budget.ts`, el formulario y la validación de `utils/budgetSchema.ts`. Si cambia el formato persistido, añadir una migración antes de modificar su versión.
- Modificar el guardado local: `services/storage.ts`. El estado y los cálculos siguen separados de los componentes.

## Verificación

```bash
npm run typecheck
npm run lint
npm test
npm run export:all
```

Las 41 pruebas cubren cálculos, fechas, categorías, colores, gastos, sueldos, planilla, antigüedad, pagos recurrentes, aguinaldo, Quincena 25 y migraciones sin pérdida de datos.

Durante la creación se verifica también el flujo en la versión web con tamaño móvil: categorías, formularios, gastos, historial, sueldo, temas, recarga de datos, calendario y aguinaldo en distintos meses. La exportación de Android/iOS valida los paquetes de JavaScript/Hermes; no equivale a instalar ni probar un APK o una app de iOS en un dispositivo físico. Revisa `docs/VALIDACION.md` para los resultados concretos.

## Alcance

La app funciona sin conexión a una base de datos remota. AsyncStorage guarda automáticamente el presupuesto en el dispositivo y es almacenamiento local no cifrado. Desinstalar la app, borrar sus datos o limpiar los datos del sitio web elimina la información local. No hay cuentas, sincronización entre dispositivos, sincronización bancaria ni gastos recurrentes automáticos. El historial usa listas sencillas; para grandes volúmenes convendría paginar y utilizar una base de datos local.

## Documentación oficial

- Expo SDK 55: https://docs.expo.dev/versions/v55.0.0/
- SVG: https://docs.expo.dev/versions/v55.0.0/sdk/svg/
- AsyncStorage: https://docs.expo.dev/versions/v55.0.0/sdk/async-storage/
- Temas: https://docs.expo.dev/develop/user-interface/color-themes/

- APK de Android: https://docs.expo.dev/build-reference/apk/
- Configuración EAS: https://docs.expo.dev/build/setup/
