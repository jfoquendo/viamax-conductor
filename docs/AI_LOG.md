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



### Entrada #8

- **Fecha:** 2026-11-04 01:30 -05:00
- **Integrante:** Jhon Oquendo
- **Herramienta:** Gemini
- **Objetivo:** Priorizar el módulo de navegación del conductor: visualización y renderizado de Google Maps oficial, rastreo GPS en tiempo real con `useDriverLocation`, resolución de pantalla negra en emulador/físico y configuración de credenciales de Google Cloud Platform.
- **Prompt:** "Quiero priorizar la navegación del conductor con mapa en tiempo real; revisa el proyecto, logs y por qué no se ve el mapa en emulador ni en celular físico, configurando la API oficial de Google Maps requerida en el documento."
- **Resumen de la respuesta:** Se realizó un diagnóstico en profundidad analizando los logs de Android (`adb logcat`, `AirMapRenderer`, `GoogleApiManager`). Se identificó que la pantalla negra se debía a tres factores combinados: 1) En Expo SDK 58, `PROVIDER_GOOGLE` en Android requiere que la clave de API esté declarada tanto en `android.config.googleMaps` como en el plugin oficial `react-native-maps` dentro del arreglo de plugins de `app.json`; 2) El mapa requería dimensiones explícitas (`width: '100%', height: '100%'`) para evitar colapso de capa en el contenedor oscuro; 3) `customMapStyle` oscuro bloqueaba el lienzo durante la carga inicial de baldosas de Google.
- **Qué se usó / modificó / descartó:** 
  - Se habilitaron las APIs en Google Cloud Console (`Maps SDK for Android` y `Routes API` que unifica Directions y Distance Matrix).
  - Se creó el archivo `.env.example` con la estructura de variables requerida por la rúbrica de seguridad.
  - Se configuró el plugin de `react-native-maps` con `androidGoogleMapsApiKey` en `app.json`.
  - Se garantizó `import 'react-native-gesture-handler'` en la línea 1 de `index.js`.
  - En `DriverHomeScreen.js` se implementó la animación de cámara suave hacia las coordenadas GPS, marcador rotacional según el `heading`, botón flotante de centrado y se removió temporalmente la máscara de estilo oscuro custom.
- **Archivos y commit:** `app.json`, `index.js`, `src/screens/home/DriverHomeScreen.js`, `.env.example`, `src/theme/mapDarkStyle.js` — pendiente de commit.
- **Verificación:** Verificado con éxito tanto en el emulador de Android (Small_Phone:5554) como en dispositivo móvil físico: las calles, cuadrículas de Google Maps, marcador de vehículo y controles flotantes renderizan de forma nítida y fluida.
- **Aprendizaje:** Comprendí que en proyectos modernos con Expo SDK 58, la inicialización de Google Maps nativo (`AirMapRenderer LATEST`) depende directamente del config-plugin de `react-native-maps` en `app.json` para inyectar correctamente los metadatos en el `AndroidManifest` en tiempo de empaquetado, y que forzar estilos oscuros saturados antes del primer renderizado de baldosas puede causar falsos positivos de fallo visual.

### Entrada #9

- **Fecha:** 2026-11-07 02:40 -05:00
- **Integrante:** Jhon Oquendo
- **Herramienta:** OpenClaw (Astra)
- **Objetivo:** Consolidar el ciclo de vida completo de la cuenta del conductor en la aplicación: separar el acceso de usuarios nuevos de los ya registrados, exigir un registro completo antes de operar, habilitar la sesión persistente y dejar el estado de la cuenta (pendiente, aprobado, rechazado) bajo control del servidor en lugar de un indicador local.
- **Prompt:** "Necesito cerrar el flujo de cuenta del conductor. Hoy cualquiera entra directo al mapa y el registro se comporta como un formulario suelto: quiero un inicio de sesión real con opción de crear cuenta, un cierre de sesión accesible desde el menú lateral y desde el perfil, una navegación paso a paso dentro del formulario de registro (con botón de siguiente y de regreso, mostrando en qué paso va) y que cada campo de fecha se elija con un calendario en lugar de escribirse. Además, al usar el teclado los campos inferiores quedan tapados, así que el formulario debe desplazarse para mantener visible el campo activo. El registro no puede dar acceso inmediato: debe quedar en revisión y solo activarse cuando la cuenta sea aprobada. Todo debe funcionar sin costos, usando únicamente el plan gratuito de Firebase, tanto para autenticación como para el estado de aprobación."
- **Resumen de la respuesta:** Se propuso y se adoptó una puerta de entrada única que evalúa el estado real de la cuenta antes de decidir qué mostrar: sin sesión se presenta el inicio de sesión con acceso a crear cuenta, con sesión pero sin registro se presenta el formulario de registro, con registro enviado se presenta una pantalla de revisión, y solo con la cuenta aprobada se habilita el área de trabajo del conductor. El registro se organizó como un recorrido de tres pasos con pie de navegación fijo que indica el número de paso y bloquea el avance hasta que la pestaña actual sea válida, ocultando la barra de pestañas inferior para que no compita con el botón de siguiente. Los campos de fecha se reemplazaron por un selector con calendario nativo, conservando el formato de almacenamiento interno y mostrando la fecha en formato local al usuario. El formulario se envolvió en una estructura que reacciona a la aparición del teclado, tanto en las pantallas de registro como en el inicio de sesión, y se ajustó la configuración nativa de Android para que la ventana se redimensione en lugar de superponer el teclado. Para la cuenta se definió que el perfil del conductor y su estado viven en una colección de Firestore identificada por el identificador del usuario autenticado: la aplicación puede crear y actualizar su propio documento mientras esté pendiente, pero no puede modificar el campo de estado, de modo que la aprobación solo ocurre desde la consola de administración y la aplicación lo detecta en tiempo real mediante una suscripción al documento.
- **Qué se usó / modificó / descartó:** Se adoptó el SDK de Firebase en el cliente con autenticación por correo y contraseña, persistencia de sesión en el almacenamiento del dispositivo y Firestore con lectura en tiempo real del documento del conductor. Se adoptó el selector de fecha nativo de la comunidad de React Native por su integración con Expo y su comportamiento predecible en Android e iOS. Se descartó el acceso directo al mapa sin sesión, el indicador local de registro completado como fuente de verdad y la regla de que el registro nunca podía reenviarse. Se descartó almacenar el perfil completo en el almacenamiento local cuando Firebase está configurado, y se eliminó la lógica de aprobación simulada de las pantallas de producción, dejándola únicamente disponible en desarrollo. Se descartó implementar el flujo de aprobación mediante Cloud Functions porque exige un plan de pago; en su lugar la seguridad se delegó a las reglas de Firestore, que permiten al conductor leer y escribir solo su documento, exigen que el alta nazca en estado pendiente, impiden cambiar el estado y bloquean el borrado desde el cliente.
- **Archivos y commit:** Se agregó el contexto de autenticación con el manejo de sesión y de estado de la cuenta, el servicio de inicialización de Firebase, el servicio de acceso al documento del conductor, la pantalla de inicio de sesión, la pantalla de revisión de cuenta, el componente de campo de fecha con calendario, el componente de pie de navegación por pasos, el componente contenedor que gestiona el teclado, las utilidades de fecha y el navegador de autenticación; se reescribieron el navegador raíz, el navegador de pestañas de registro, el menú lateral con contenido personalizado y cierre de sesión, las tres pantallas de registro, el componente de campo de texto con control de contraseña visible y la pantalla de perfil; se actualizaron el contexto de registro con validaciones de contraseña, la configuración de la aplicación, las reglas y la configuración de Firestore y el documento de entorno de ejemplo. Sin commit.
- **Verificación:** Se validó la sintaxis de todos los archivos del proyecto con un analizador de JavaScript, sin errores, y se generó el paquete de la aplicación para Android con el empaquetador de Expo, que completó sin fallos. Queda pendiente la prueba en emulador y en dispositivo del recorrido completo: crear cuenta, enviar registro, aprobar desde la consola y entrar al área del conductor.
- **Aprendizaje:** El estado de una cuenta no puede vivir en el cliente: si el flujo depende de una bandera local, cualquier reinicio o reenvío de formulario produce experiencias inconsistentes y deja la aprobación como un punto débil. Delegar esa condición a un documento remoto con lectura en tiempo real simplifica el árbol de navegación, porque la aplicación reacciona sola al cambio y no necesita recargar ni mantener condiciones paralelas. En cuanto a la interfaz, un formulario largo necesita una sola guía de avance visible: dejar la barra de pestañas y además el botón de siguiente duplica la acción y confunde al usuario.

### Entrada #10

- **Fecha:** 2026-11-11 13:55 -05:00
- **Integrante:** Jhon Oquendo
- **Herramienta:** OpenClaw (Astra)
- **Objetivo:** Entender cómo estructurar los módulos de viajes cuando todavía no se conoce la API externa que entregará las solicitudes, y cómo debe quedar el cálculo de tarifas, la comisión y la publicación de la ubicación del conductor bajo el plan gratuito de Firebase.
- **Prompt:** "Estoy armando los módulos de viajes pero todavía no tengo la API de solicitudes, ¿cuál sería la mejor forma de organizar esa parte para que el desarrollo no se bloquee mientras llega? También quisiera saber cómo debería quedar el cálculo de tarifas con el desglose de comisión y ganancia del conductor, y cuál sería la manera adecuada de que el conductor publique su ubicación mientras está en turno, teniendo en cuenta que el backend es sin costos y todo debe quedar en Firestore. Explícame paso a paso cómo estructurarlo y por qué conviene hacerlo así."
- **Resumen de la respuesta:** Se explicó, paso a paso, que conviene separar el origen de los datos de quien los consume: la aplicación trabaja siempre contra una misma interfaz y el origen puede ser Firestore o una fuente de simulación, de modo que el cambio posterior se reduce a una sola pieza cuando llegue la API externa. Para las solicitudes se propuso un ciclo con siete estados, un temporizador de quince segundos para responder y la idea de que al vencer la solicitud se descarte localmente sin cancelar el viaje del pasajero. Para las ganancias se planteó un resumen por día, semana y mes, y un saldo que distingue lo cobrado por tarjeta, que la plataforma retiene, de lo cobrado en efectivo, del cual el conductor solo debe cubrir la comisión. En tarifas se explicó el modelo del proyecto: una sola base para todas las categorías, costo por kilómetro y por minuto, multiplicador por categoría y un mínimo garantizado, con la comisión calculada sobre la tarifa exacta y la propina suministrada completa al conductor. En ubicación se indicó escribirla en una colección independiente del perfil, con umbrales de distancia y de tiempo entre envíos para no agotar la cuota gratuita.
- **Qué se usó / modificó / descartó:** Se aplicó Firestore como única fuente persistente y un adaptador en memoria para probar el flujo sin conexión. Se descartó crear un backend propio. Se descartó guardar la ubicación junto al perfil, para separar datos personales de datos de alta frecuencia. En tarifas se descartó la comisión redondeada a cien pesos y el cobro de comisión sobre la propina.
- **Archivos y commit:** Se agregaron la configuración de estados y etiquetas de viaje, el servicio de viajes con sus dos orígenes de datos, el hook de solicitudes entrantes, el hook de ganancias y el servicio de ubicación, además de la colección y las reglas correspondientes. Los cambios se agruparon en tres commits: "Estructura de viajes y origen de datos", "recibir solicitudes de viaje" y "Calculo de ganancias". Las tarifas quedan pendientes de confirmación.
- **Verificación:** Se validó la sintaxis de todos los archivos del proyecto sin errores y se ejecutó el origen local de simulación de punta a punta: recepción de una solicitud, aceptación por parte de un conductor, avance de estado y descarte final. Se comprobaron los casos de tarifa del proyecto: recorrido de ocho kilómetros y medio en veintidós minutos, corto dentro del mínimo, y con propina, coincidiendo en tarifa, comisión y ganancia neta. La lectura en tiempo real desde Firestore queda pendiente de prueba en dispositivo.
- **Aprendizaje:** Separar el origen de datos de su consumidor evita bloquear el desarrollo cuando falta la integración externa. En tarifas, el orden de las operaciones altera el resultado y el detalle de si la propina entra o no en la base de la comisión cambia la ganancia del conductor. En ubicación, un umbral de movimiento y de tiempo es tan necesario como el propio envío para no consumir la cuota diaria.
