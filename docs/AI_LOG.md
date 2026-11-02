### Entrada #1

- **Fecha:** 2026-11-01 20:40 -05:00
- **Integrante:** Jhon Oquendo
- **Herramienta:** Antigravity (Google DeepMind)
- **Objetivo:** Analizar el proyecto base existente e identificar su arquitectura para usarla como referencia en el nuevo proyecto.
- **Prompt:** "Analiza el contenido de esta carpeta [proyecto base React Native]"
- **Resumen de la respuesta:** Se analizó la estructura del proyecto base (React Native + Expo SDK 57), se identificaron 3 bugs (imagen en Card.js, filtro en StartScreen.js, prop onAction en EstadoVacio.js) y se documentó la arquitectura completa de pantallas, contextos, hooks y tema.
- **Qué se usó / modificó / descartó:** Se tomó como referencia la separación modular en carpetas (components, context, hooks, services, theme, screens). Se descartó la navegación manual de tabs para adoptar React Navigation oficial.
- **Archivos y commit:** Ninguno — solo planificación y análisis.
- **Verificación:** No aplica (fase de análisis).
- **Aprendizaje:** Entendí la importancia de revisar bugs en el código base antes de replicar patrones. El bug del filtro en StartScreen (operador `||` incorrecto) es un error común al combinar condiciones de filtrado.

### Entrada #2

- **Fecha:** 2026-11-01 20:45 -05:00
- **Integrante:** Jhon Oquendo
- **Herramienta:** Antigravity (Google DeepMind)
- **Objetivo:** Definir la arquitectura del nuevo proyecto ViaMax y obtener un plan de trabajo por fases.
- **Prompt:** "Toma como base esa estructura y genera un plan de trabajo para el siguiente proyecto [UberClone versión conductor]"
- **Resumen de la respuesta:** Se propuso arquitectura completa con 8 fases de desarrollo, estructura de carpetas `src/`, state machine del viaje, 3 navegadores (Stack, Tabs, Drawer), hooks personalizados requeridos y configuración de tarifas centralizada.
- **Qué se usó / modificó / descartó:** Se aceptó la estructura general de carpetas y las 8 fases. Se ajustaron los nombres de carpetas de screens para agrupar por módulo. Se descartó Firebase por ahora; se implementará en fases posteriores.
- **Archivos y commit:** Ninguno — solo planificación.
- **Verificación:** No aplica (fase de planificación).
- **Aprendizaje:** Organizar screens por módulo (`registration/`, `trip/`, `earnings/`) en lugar de una carpeta plana facilita la navegación del código cuando el proyecto crece a 10+ pantallas.

### Entrada #3

- **Fecha:** 2026-11-01 21:41 -05:00
- **Integrante:** Jhon Oquendo
- **Herramienta:** Antigravity (Google DeepMind)
- **Objetivo:** Entender la fórmula correcta para redondear tarifas a múltiplos de 100 COP y aplicar tarifa mínima garantizada por categoría.
- **Prompt:** "En una app de transporte con tarifas en pesos colombianos, ¿cómo redondeo el total calculado al múltiplo de 100 más cercano y aplico una tarifa mínima garantizada por categoría de vehículo?"
- **Resumen de la respuesta:** Sugirió usar `Math.round(value / unit) * unit` para el redondeo y aplicar `Math.max(subtotal, minimumFare)` antes de redondear, para que la tarifa mínima también quede redondeada.
- **Qué se usó / modificó / descartó:** Se adoptó la fórmula de redondeo. Se modificó el orden de operaciones: primero máximo entre subtotal y mínimo, luego redondeo. Se descartó `Math.ceil` porque generaba diferencias de hasta 99 COP innecesarias.
- **Archivos y commit:** `src/utils/calculateFare.js`, `src/config/pricing.js` — 5a1789.
- **Verificación:** Pendiente — se verificará con caso: 8.5 km, 22 min, categoría economy (resultado esperado: múltiplo de 100 ≥ 5000).
- **Aprendizaje:** El orden de operaciones es crítico: redondear antes del mínimo puede dejar el mínimo sin redondear. En el futuro definiré los casos borde antes de escribir la función.

### Entrada #4

- **Fecha:** 2026-11-01
- **Integrante:** Yeison David Uribe Tobon
- **Herramienta:** Gemini
- **Objetivo:** Consultar la estructura e implementación modular del navegador por pestañas (`RegisterTabNavigator`) articulado con los tokens de tema del proyecto.
- **Prompt:** "Muestra cómo estructurar el Tab.Navigator conectando las pantallas de registro PersonalData, VehicleData y Documents aplicando los tokens de tema"
- **Resumen de la respuesta:** Se orientó la configuración de `createBottomTabNavigator` integrando las pantallas de registro, la personalización visual de `tabBarStyle`, `headerStyle` con tokens de color (`theme`) y el manejo de íconos dinámicos mediante `@expo/vector-icons`.
- **Qué se usó / modificó / descartó:** Se adoptó la estructura de navegación declarativa con `screenOptions` y los íconos de Ionicons. Se adaptaron los nombres de las rutas (`PersonalData`, `VehicleData`, `Documents`) al flujo de la aplicación.
- **Archivos y commit:** `src/navigation/RegisterTabNavigator.jsx`, `docs/AI_LOG.md` - c0753a2
- **Verificación:** Probado en emulador de Android (Small_Phone:5554), navegación fluida entre pestañas y tema oscuro visible
- **Aprendizaje:** Comprendí el uso de `screenOptions` centralizado en `Tab.Navigator` para vincular tokens de tema homogéneos y evitar duplicación de estilos en cada pantalla.

### Entrada #5

- **Fecha:** 2026-11-01 23:40 -05:00
- **Integrante:** Jhon Oquendo
- **Herramienta:** Antigravity (Google DeepMind)
- **Objetivo:** Construir el formulario de registro completo en 3 pestañas con validaciones en tiempo real sin Alert, manejo de color híbrido y estado de aprobación
- **Prompt:** "Genera la implementación de las 3 pantallas de registro (PersonalData, VehicleData, Documents) consumiendo RegistrationContext, InputField reutilizable, validaciones colombianas y botón de envío condicional"
- **Resumen de la respuesta:** Se implementó InputField con errores debajo de cada campo, validators.js con regex colombiano (ABC123, cédula, celular, 18+ años), selector híbrido de color y bloqueo de botón de envío hasta completar las 3 pestañas con éxito
- **Qué se usó / modificó / descartó:** Se aplicó la totalidad de las reglas de validación sin alerts. Se descartó una lista estática de colores a favor de un selector rápido + campo libre para no limitar opciones. Se guardó el perfil en AsyncStorage con status 'pending_approval'
- **Archivos y commit:** src/components/forms/InputField.js, src/utils/validators.js, src/context/RegistrationContext.js, src/screens/registration/* — f9a3c5e
- **Verificación:** Probado en emulador de Android: inputs validados, error inline en rojo y actualización de estado entre pestañas
- **Aprendizaje:** Comprendí cómo centralizar validaciones reactivas con useMemo en el Context para que múltiples pantallas compartan el estado de validación global sin renderizados innecesarios

---

### Entrada #6
- **Fecha y Hora:** 2026-11-02, 12:56 AM
- **Integrante:** Yeison David Uribe Tobon
- **Herramienta:** Gemini
- **Objetivo:** Estructurar la pantalla principal del mapa (`DriverHomeScreen`), el menú lateral (`MainDrawer`) y la lógica de transición post-registro.
- **Prompt:** "Muestra cómo estructurar DriverHomeScreen con react-native-maps, toggle de disponibilidad con tracking en tiempo real, MainDrawer y transición automática al completar el registro"
- **Resumen de la respuesta:** Se configuró useDriverLocation con watchPositionAsync y cleanup estricto en useEffect al apagar disponibilidad. Se integró MainDrawer con react-native-gesture-handler y transición fluida entre el registro y el mapa principal
- **Qué se usó / modificó / descartó:** Se implementó el switch Disponible/No disponible con persistencia en AsyncStorage. Se corrigieron imports duplicados en DocumentsScreen y se conectó el callback onRegisterComplete para cambiar la vista al Drawer sin recargar
- **Archivos y commit:** `src/hooks/useDriverLocation.js`, `src/screens/home/DriverHomeScreen.js`, `src/navigation/MainDrawer.js`, `src/screens/earnings/`, `src/screens/history/`, `src/screens/profile/*`, `App.js` — e9bcc06
- **Verificación:** Probado en emulador de Android: mapa interactivo, marcador centrado y flujo de navegación Drawer verificado
- **Aprendizaje:** Comprobé la necesidad obligatoria de importar react-native-gesture-handler en la raíz al usar DrawerNavigator y el uso de cleanup functions para evitar fugas de memoria con el GPS

### Entrada #7

- **Fecha:** 2026-11-02 01:27 -05:00
- **Integrante:** Yeison David Uribe Tobon
- **Herramienta:** gemini
- **Objetivo:** Analizar por qué la simulación de aprobación en `DocumentsScreen` no permitía visualizar el módulo principal del conductor.
- **Prompt:** "Analiza el DocumentsScreen y ayúdame a encontrar por qué al simular que ya está registrado no me deja visualizar la entrada al módulo"
- **Resumen de la respuesta:** Se identificó que `DocumentsScreen` guardaba el perfil con estado `approved`, pero `AppNavigator` solo consultaba `AsyncStorage` al montarse. Al pulsar el botón de aprobación se cambiaba únicamente el estado local de la pantalla, sin actualizar el estado del navegador raíz, por lo que la aplicación permanecía en las pestañas de registro.
- **Qué se usó / modificó / descartó:** Se añadió `registrationCompleted` y `markRegistrationCompleted` a `RegistrationContext`, se notificó la aprobación desde `DocumentsScreen` y se actualizó `AppNavigator` para mostrar `MainDrawer` cuando el registro se completa. Se descartó recargar manualmente la aplicación o depender de una nueva lectura de `AsyncStorage`.
- **Archivos y commit:** `src/context/RegistrationContext.js`, `src/screens/registration/DocumentsScreen.js`, `src/navigation/AppNavigator.js` — 26c1307.
- **Verificación:** Pendiente — probar en el emulador completando el registro, pulsando "Simular Aprobación y Entrar al Mapa" y verificando la entrada inmediata al `MainDrawer`.
- **Aprendizaje:** La persistencia en `AsyncStorage` no actualiza automáticamente el árbol de navegación. Cuando una pantalla modifica una condición que controla el navegador raíz, también debe comunicar el cambio mediante estado compartido o un callback explícito.