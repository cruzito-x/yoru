# Fecha de los gastos y menú inferior

## Uso

En **Nuevo gasto** o **Editar gasto**, toca el campo **Fecha del gasto**. Se abre un calendario dentro del formulario. Usa las flechas para cambiar de mes o toca el mes/año para elegirlos directamente. Al tocar un día, el calendario se cierra y el campo muestra la fecha en español.

El calendario sigue la referencia visual: tarjeta redondeada, mes y año a la izquierda, flechas a la derecha, separador bajo los días de la semana y días adyacentes atenuados. Selecciona **una fecha** por gasto. Empieza en domingo y muestra las siete columnas; el calendario de pagos en Ajustes conserva su orden de lunes a domingo.

La selección usa la paleta global: azul marino en modo claro y el acento azul del modo oscuro con texto marino para conservar el contraste. El día actual se distingue con un borde; la fecha elegida tiene fondo sólido. Las vistas de meses y años también respetan el tema.

Elegir una fecha no guarda el gasto. **Guardar gasto** confirma todos los campos; **Cerrar** descarta los cambios. Los domingos se guardan como domingos: el ajuste al viernes pertenece al calendario de pagos, no a la fecha de un gasto.

El menú inferior muestra el icono y la etiqueta de la vista activa sobre un rectángulo con esquinas redondeadas. La respuesta al pulsar y el efecto de Android se recortan dentro del mismo contorno.

## Recorrido del código

1. `ExpenseForm.tsx` mantiene la fecha en su estado, junto al nombre, monto, categoría y nota.
2. `ExpenseDatePicker.tsx` recibe `value` y `onChange`. Encapsula `@amjed-bouhouch/react-native-ui-datepicker` **2.1.4**, en modo `single`, sin selector de hora.
3. `localDate(value)` convierte la fecha guardada a mediodía local para abrir el calendario. `dayjs(date).format('YYYY-MM-DD')` convierte la selección a la misma representación local; no se usa `toISOString()`, que puede desplazar el día al convertirlo a UTC.
4. `isValidDate` mantiene el límite de 1900 a 2100. El formulario envía `SAVE_EXPENSE` solo al confirmar.
5. `useTheme()` entrega los colores de `src/theme/theme.ts`; el componente no define una paleta aparte.
6. `BottomTabs.tsx` aplica `borderRadius: 18` y `overflow: 'hidden'` al elemento pulsable completo, con un espacio entre opciones.

No cambia la estructura de almacenamiento ni las reglas del presupuesto. Los gastos existentes abren su fecha guardada al editarlos.

## Comprobación manual

- Crear un gasto un domingo, guardarlo y comprobar esa fecha en Historial.
- Editar el gasto, elegir otro día y confirmar que se actualiza sin duplicarse.
- Elegir una fecha y cerrar el formulario: los datos guardados deben permanecer iguales.
- Visitar un mes de seis semanas y febrero de un año bisiesto; comprobar domingos, último día y días adyacentes.
- Repetir en tema claro y oscuro y comprobar las tres opciones del menú inferior.

Consulta `VALIDACION.md` para los resultados y los límites de las comprobaciones de esta entrega.
