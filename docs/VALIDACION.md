# Validación de Yoru 1.3.1

El selector de fecha y la navegación redondeada se verificaron el 11 de octubre de 2026, en la versión 1.3.1. La identidad Yoru se verificó previamente ese mismo día en 1.3.0. Las pruebas históricas de la versión 1.2/1.2.1 se realizaron el 11 de octubre UTC (10 de octubre en El Salvador).

Historia del calendario previamente verificada: el usuario configura dos días mensuales; el formulario valida la regla, el reducer la guarda, AsyncStorage la persiste y el calendario muestra los cobros reales. La fecha actual hace avanzar los próximos pagos automáticamente.

| Verificación | Resultado | Evidencia |
| --- | --- | --- |
| TypeScript | Correcto | `npm run typecheck`, código 0. |
| ESLint | Correcto | `npm run lint`, sin errores ni avisos de código. |
| Dependencias de Expo | Comprobación local de 1.3.1 | Se añadieron el selector solicitado 2.1.4 y Day.js mediante `expo install`. `EXPO_OFFLINE=1 npx expo install --check`: `Dependencies are up to date`. La comprobación sin conexión no sustituye una validación remota. |
| Lógica del presupuesto | Correcto | `npm test`: 29 pruebas aprobadas, 0 fallos en 1.3.1. |
| Exportación Android | Correcto | Metro generó el paquete Hermes de Android. |
| Exportación iOS | Correcto | Metro generó el paquete Hermes de iOS. |
| Exportación web | Correcto | Metro generó el paquete web y el HTML. |
| Vista móvil en web | Correcto | Chromium, zona America/El_Salvador, anchos 320, 390 y 768 px, en ambos temas; sin desbordamiento. |
| Selector de fecha del gasto | Correcto | 18 comprobaciones de calendario: octubre/agosto de 2026 y febrero de 2028, en tres tamaños y dos temas; todas las fechas y siete columnas, incluyendo domingos. |
| Navegación redondeada | Correcto | 18 comprobaciones de vistas: radio de 18 px, recorte del fondo y color activo conforme al tema. |
| Calendario en distintos tamaños | Verificado en 1.2.1 | 50 comprobaciones de meses en anchos de 320, 360, 390, 412 y 768 px; siete columnas y domingos visibles. |
| Errores de ejecución en web | Correcto | Ningún evento `pageerror` en los flujos probados. |
| Perfil APK | Preparado | `eas.json`: `preview`, distribución interna, `developmentClient: false`, `android.buildType: apk`. |

## Selector de gastos y navegación verificados en 1.3.1

1. El formulario de alta y edición usa `@amjed-bouhouch/react-native-ui-datepicker` 2.1.4 en modo de selección única, sin hora. El antiguo campo de texto de fecha ya no aparece en el formulario del gasto.
2. La referencia se adapta con flechas a la derecha, días adyacentes atenuados, tarjeta y selección redondeadas. La fecha y los meses aparecen en español.
3. Cada fecha de los meses probados aparece una sola vez, todas las filas tienen siete días y cada fecha se alinea con su día de la semana. Se incluyen un mes de seis filas y el 29 de febrero de 2028.
4. El fondo seleccionado usa azul marino y texto blanco en modo claro; en modo oscuro usa el acento azul del tema y texto marino. Se comprobó el color renderizado y un radio de 8 px en la selección.
5. Elegir el 29 de febrero y cerrar el formulario conservó el estado anterior, sin guardar gastos automáticamente.
6. Se creó un gasto de $12.50 con nombre y nota para el domingo 4 de octubre de 2026. Se guardó exactamente `2026-10-04` en la zona de El Salvador, sin adelantarlo al viernes. El saldo pasó de $280 a $267.50.
7. Se editó ese gasto desde Historial al domingo 25 de octubre y a $15.00. Se conservaron el identificador y la nota, sin duplicar el registro. La fecha guardada fue `2026-10-25`.
8. Al recargar, se conservaron el gasto modificado, el gasto anterior, el tema y las reglas de pago. El saldo de la primera quincena volvió a $280 porque el gasto editado pasó a la segunda.
9. Las tres opciones del menú inferior muestran su fondo activo sobre el elemento completo, con radio de 18 px y `overflow: hidden`. Se comprobaron selección, color y límites de pantalla en ambos temas y tres tamaños.
10. No hubo errores `pageerror` ni solicitudes HTTP fallidas. Se revisó el aspecto de la interfaz; las capturas de comprobación son internas y no forman parte del entregable.
11. Se verificaron TypeScript, ESLint, las 29 pruebas del presupuesto y las exportaciones de Android/iOS/web. No cambia el esquema de datos (versión 3), la clave local ni el identificador de Android.

## Identidad Yoru comprobada en la versión 1.3.0

1. `expo.name`, el título web y el nombre mostrado en las tres pantallas pasaron a Yoru; los encabezados muestran YORU y el pie de Ajustes muestra la versión 1.3.0.
2. El logo suministrado se editó a azul marino y se rellenó el destello superior. Se integró en el componente reutilizable BrandLogo, el icono general, las capas adaptativas de Android, la pantalla de inicio y el favicon.
3. Se validaron siete assets PNG cuadrados y un icono general de 1024 px completamente opaco. El emblema adaptativo tiene un radio máximo de 292 px respecto al centro, dentro de la zona segura de 313 px del lienzo de 1024 px.
4. Se exportaron correctamente los paquetes de Android, iOS y web con el nuevo asset incluido. TypeScript y ESLint terminaron sin errores de código.
5. Se verificaron 19 presentaciones de pantalla: Dashboard, Historial y Ajustes, en temas claro/oscuro y en anchos de 320, 390 y 768 px, más una recarga. Todos los logos cargaron, sin solicitudes fallidas ni eventos pageerror ni desbordamiento horizontal.
6. Inicio con un estado anterior de versión 3: el gasto guardado de $20, sueldo de $300, saldo de $280, calendario 15/último día y aguinaldo histórico se conservaron. Después de recargar también se conservó el tema oscuro.
7. El domingo 11 de octubre permaneció visible y seleccionable en el calendario.
8. El identificador Android, el slug Expo y la clave de almacenamiento permanecen iguales; no se necesita una migración de datos para esta nueva marca.

El nuevo icono y el nombre del lanzador requieren compilar e instalar el APK actualizado. Esta comprobación valida la configuración y las exportaciones, sin afirmar una instalación nativa en un teléfono físico.

## Corrección de domingos en la versión 1.2.1

La cuadrícula dejó de depender de `flexWrap` y anchos porcentuales. Cada semana se dibuja en una fila explícita de siete celdas con `flex: 1`, alineadas con los encabezados Lun, Mar, Mié, Jue, Vie, Sáb y Dom. Ninguna columna depende de que siete porcentajes redondeados quepan en una fila.

Se comprueban todos los días del mes, no solo las fechas de cobro: cada fecha existe una única vez, permanece dentro de la vista y se alinea con su día de la semana. También se comprueba que el domingo es siempre la séptima columna, que cada fila conserva siete celdas y que no hay desbordamiento horizontal.

La verificación incluye cinco anchos de pantalla (320, 360, 390, 412 y 768 px), meses de cuatro, cinco y seis filas, febrero de 2027 y febrero bisiesto de 2028, tema claro y oscuro. Son 50 comprobaciones de meses, sin errores de ejecución. Se selecciona un domingo para configurar el día habitual de pago y se confirma que sigue visible mientras el cobro real se marca en el viernes anterior.

Se repitieron TypeScript, ESLint, las 29 pruebas de lógica y las exportaciones de Android, iOS y web. El formato de almacenamiento sigue siendo versión 3; esta corrección no necesita migrar ni modificar los datos del usuario.

## Calendario recurrente probado en web (versión 1.2)

1. Inicio con datos de versión 2: se migró a versión 3 conservando un gasto previo de $20, sueldo de $300, saldo de $280, tema y un aguinaldo de 2025. La fecha única anterior continuó disponible como referencia.
2. Selección del primer pago y segundo pago tocando dos días distintos del calendario; guardado de las reglas 15 y 30.
3. El domingo 15 de noviembre de 2026 se marcó como cobro el viernes 13; el 15 quedó como fecha habitual sin seleccionar como cobro real.
4. Cambio de la segunda regla a último día del mes; persistencia de la regla `15 / last`.
5. Rechazo de 27 / último día, combinación que puede colapsar ambos pagos en febrero. El calendario guardado se conservó.
6. Navegación a diciembre durante noviembre: el aguinaldo permaneció deshabilitado.
7. Tema oscuro y recarga: ambos días habituales, el calendario y el tema se conservaron.
8. Cambio de fecha actual del 12 al 14 de noviembre sin recargar: el próximo pago avanzó del viernes 13 al lunes 30.
9. Cambio a diciembre con la app abierta: se habilitó el aguinaldo y se propuso el 15 de diciembre.
10. Rechazo de una fecha de aguinaldo de noviembre, guardado de $200 para el 15 de diciembre y edición a $250 después de que pasó ese cobro. Se conservó la fecha del 15, sin duplicar el registro ni moverlo al siguiente pago.
11. El dashboard mostró $550 en la quincena correspondiente, incluyendo sueldo de $300 y aguinaldo de $250.
12. Cambio a enero de 2027 sin recargar: la lista pasó al próximo cobro del 15 de enero y el aguinaldo quedó deshabilitado.
13. Calendario de enero: domingo 31 adelantado al viernes 29. Calendario de febrero de 2027: domingo 28 adelantado al viernes 26.
14. Desactivación del calendario: regla guardada en `null` y lista de próximos pagos retirada.
15. Sin errores de ejecución ni desbordamiento horizontal.

## Pruebas de reglas y límites

Las 29 pruebas cubren dinero en centavos, entradas inválidas, porcentajes sin división por cero, gastos y categorías, historia de sueldos, límites de quincenas, filtros inclusivos, fechas locales, semanas y cambios de año, cuadrícula del calendario, aguinaldo por año y migraciones de versiones 1 y 2.

Los nuevos casos comprueban sábados y domingos adelantados al viernes, días laborables intactos, febrero normal y bisiesto, días fijos 29/30/31 ajustados a meses cortos, cobros de hoy incluidos y pagos pasados omitidos, cambio de año y pagos del día 1 adelantados al mes anterior. Se recorren todos los meses de 2010 a 2035 para tres calendarios distintos y se comprueba que hay dos cobros únicos por mes, ordenados y fuera de fines de semana.

## Flujo general verificado en la versión 1.2

También se volvió a probar el flujo de gestión de gastos: creación y edición de categorías, validación de importes, alta y edición de gastos, saldo y dona, historial por día/semana/mes/año, cambio de sueldo sin alterar períodos anteriores, tema claro/oscuro, recarga, cancelación y confirmación de eliminaciones, déficit y sueldo cero.

Los datos de las pruebas son temporales y no se incluyen en los valores iniciales del proyecto.

## Límites de la validación

La verificación interactiva se hizo sobre React Native Web. Las exportaciones de Android/iOS comprueban los paquetes JavaScript/Hermes; **no generan ni prueban un APK o IPA**. No se realizó una compilación nativa firmada con EAS ni una instalación en un teléfono físico. La configuración del APK y los comandos están listos en `docs/ANDROID.md`; la primera compilación necesita la cuenta de Expo del usuario.

El calendario ajusta fines de semana, sin calendario de feriados. No ejecuta depósitos ni notificaciones; los períodos del presupuesto siguen siendo del 1 al 14 y del 15 al fin de mes. La persistencia es local, sin servicios bancarios o API remotas.
