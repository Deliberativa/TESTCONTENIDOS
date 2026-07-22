window.energyMapElectricProjects={
  updated:'15 de julio de 2026',
  methodology:'Solo se incluyen obras cuyo inicio ha sido confirmado oficialmente, actuaciones que disponen de autorización administrativa de construcción o corredores estratégicos cuyo comienzo ha sido anunciado públicamente por Red Eléctrica. Una autorización o un calendario anunciado no acreditan por sí solos que las obras hayan comenzado.',
  projects:[
    {
      id:'luminabaso-220',name:'Nueva subestación de Luminabaso',status:'construction',statusLabel:'En construcción',voltage:'220 kV',kind:'Subestación y entrada/salida',
      coordinate:[-2.725445,43.210802],scope:'Nueva subestación de 220 kV en Amorebieta-Etxano y modificación de entrada/salida de la red.',geometryNote:'El símbolo se sitúa en la huella oficial de la subestación publicada por GeoEuskadi.',
      sourceLabel:'Red Eléctrica, abril de 2026',sourceUrl:'https://www.ree.es/es/sala-de-prensa/actualidad/nota-de-prensa/2026/04/beatriz-corredor-e-imanol-pradales-analizan-inversiones-red-electrica-euskadi'
    },
    {
      id:'abanto-400',name:'Ampliación de la subestación de Abanto',status:'construction',statusLabel:'En construcción',voltage:'400 kV',kind:'Ampliación de subestación',
      coordinate:[-3.0931655,43.3266686],scope:'Ampliación de la subestación de transporte de Abanto para reforzar la capacidad de conexión del entorno industrial y portuario.',geometryNote:'El símbolo se sitúa en el centroide de la huella oficial de la subestación.',
      sourceLabel:'Red Eléctrica, abril de 2026',sourceUrl:'https://www.ree.es/es/sala-de-prensa/actualidad/nota-de-prensa/2026/04/beatriz-corredor-e-imanol-pradales-analizan-inversiones-red-electrica-euskadi'
    },
    {
      id:'mercedes-220',name:'Adaptación de la subestación Mercedes-Benz',status:'authorized',statusLabel:'Autorización de construcción',voltage:'220 kV',kind:'Adaptación y ampliación de subestación',
      coordinate:[-2.707140,42.855768],scope:'Adaptación de la subestación y ampliación de la posición de consumidor para la planta de Vitoria-Gasteiz.',geometryNote:'El símbolo localiza la subestación; no representa la superficie exacta de la obra.',
      sourceLabel:'Gobierno Vasco, 4 de noviembre de 2025',sourceUrl:'https://www.euskadi.eus/gobierno-vasco/-/resolucion/resolucion-4-noviembre-2025-del-delegado-territorial-industria-transicion-energetica-y-sostenibilidad-alava-que-se-concede-autorizacion-administrativa-previa-y-construccion-instalacion-correspondiente-al-proyecto-/adaptacion-p-o-subestacion-mercedes-benz-220-kv-y-ampliacion-consumidor-termino-municipal-vitoria-gasteiz-territorio-historico-alava/'
    },
    {
      id:'gatika-400',name:'Ampliación de la subestación de Gatika',status:'authorized',statusLabel:'Autorización de construcción',voltage:'400 kV',kind:'Ampliación de subestación',
      coordinate:[-2.880672,43.349727],scope:'Ampliación de la subestación de Gatika asociada al refuerzo de la red y a la nueva interconexión.',geometryNote:'El símbolo se sitúa en la huella oficial de la subestación.',
      sourceLabel:'BOE, 13 de agosto de 2025',sourceUrl:'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-16484'
    },
    {
      id:'electrolizador-abanto-400',name:'Conexión del electrolizador con Abanto',status:'authorized',statusLabel:'Autorización de construcción',voltage:'400 kV',kind:'Línea de doble circuito',
      geometry:{type:'LineString',coordinates:[[-3.0969179,43.3243300],[-3.0964735,43.3244173],[-3.0963143,43.3252611],[-3.0964289,43.3263748],[-3.0963102,43.3267440],[-3.0931655,43.3266686]]},scope:'Conexión privada de 670,1 m entre la subestación del electrolizador y la subestación de Abanto: parte aérea y parte soterrada.',geometryNote:'Los apoyos proceden del proyecto autorizado; el enlace final soterrado hasta el centroide de ST Abanto se simplifica a esta escala.',
      sourceLabel:'Gobierno Vasco / BOPV, 24 de abril de 2025',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2025/05/2501935a.pdf'
    },
    {
      id:'gatika-guenes-220',name:'Repotenciación Gatika–Güeñes, circuito 1',status:'authorized',statusLabel:'Autorización de construcción',voltage:'220 kV',kind:'Repotenciación de línea existente',
      lineObjectIds:[2022],scope:'Aumento de capacidad de transporte del circuito 1 entre las subestaciones de Gatika y Güeñes.',geometryNote:'Se resalta el corredor existente de GeoEuskadi; no es una línea nueva.',
      sourceLabel:'Gobierno Vasco, 29 de julio de 2025',sourceUrl:'https://www.euskadi.eus/gobierno-vasco/-/resolucion/resolucion-29-julio-2025-delegada-territorial-industria-transicion-energetica-y-sostenibilidad-bizkaia-que-se-concede-autorizacion-administrativa-previa-y-construccion-instalacion-correspondiente-al-/proyecto-repotenciacion-linea-transporte-energia-electrica-220-kv-st-gatica-st-guenes-circuito-1-terminos-municipales-guenes-alonsotegi-arrigorriaga-ugao-miraballes-zaratamo-galdakao/'
    },
    {
      id:'abadino-vitoria-220',name:'Repotenciación Abadiño–Vitoria',status:'authorized',statusLabel:'Autorización de construcción',voltage:'220 kV',kind:'Repotenciación de línea existente',
      lineObjectIds:[1150],scope:'Repotenciación de aproximadamente 38,8 km de la línea de transporte entre Abadiño y Vitoria.',geometryNote:'Se resalta el corredor existente de GeoEuskadi; no es una línea nueva.',
      sourceLabel:'Gobierno Vasco, 18 de junio de 2025',sourceUrl:'https://www.euskadi.eus/gobierno-vasco/-/resolucion/resolucion-11-julio-2025-del-director-descarbonizacion-correccion-errores-resolucion-18-junio-2025-que-se-concede-autorizacion-administrativa-previa-y-construccion-al-proyecto-repotenciacion-/linea-transporte-energia-electrica-220-kv-sc-se-abadiano-se-vitoria-terminos-municipales-arratzua-ubarrundia-zigoitia-y-aramaio-territorio-historico-alava-y-terminos-municipales-otxandio-ubide-/'
    },
    {
      id:'elgea-itxaso-220',name:'Renovación Elgea–Itxaso',status:'authorized',statusLabel:'Autorización de construcción',voltage:'220 kV',kind:'Renovación de línea existente',
      geometry:{type:'LineString',coordinates:[[-2.450114,42.892684],[-2.242083,43.043461]]},scope:'Renovación del tramo entre el apoyo 389, en el entorno de Elgea, y la subestación de Itxaso.',geometryNote:'Eje cartográfico simplificado entre los extremos oficiales; no reproduce cada apoyo.',
      sourceLabel:'Gobierno Vasco / BOPV, 18 de julio de 2025',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2025/09/2503761a.pdf'
    },
    {
      id:'itxaso-castejon-muruarte-400',name:'Nueva conexión Navarra–Euskadi · Itxaso–Castejón/Muruarte',status:'scheduled',statusLabel:'DIA favorable · obras previstas desde finales de 2026',voltage:'400 kV',kind:'Nueva línea aérea de doble circuito',
      geometry:{type:'LineString',coordinates:[[-2.275540,43.060920],[-2.244000,43.031000],[-2.201000,42.982000],[-2.151000,42.936000],[-2.099000,42.897000],[-2.020000,42.912000],[-1.943000,42.901000],[-1.875000,42.864000],[-1.831000,42.824000],[-1.803000,42.774000],[-1.759000,42.731000],[-1.724000,42.695000]]},scope:'Nueva conexión de 92,482 km entre la subestación de Itxaso y el apoyo T113 de la línea Castejón–Muruarte. El proyecto dispone dos circuitos de 400 kV —2.080 MVA por circuito en verano y 2.440 MVA en invierno— y prevé desmontar las líneas Itxaso–Orcoyen 1 y 2 de 220 kV.',geometryNote:'Trazado esquemático construido a partir del corredor y los núcleos citados en la declaración de impacto ambiental. Representa la dirección y el alcance territorial de la conexión, no la posición exacta de sus 192 apoyos.',
      sourceLabel:'BOE, DIA de 13 de noviembre de 2023 · Red Eléctrica, junio de 2026',sourceUrl:'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-23855'
    },
    {
      id:'alonsotegi-basauri-guenes-220',name:'Modificaciones en Alonsotegi–Basauri y Basauri–Güeñes',status:'authorized',statusLabel:'Autorización de construcción',voltage:'220 kV',kind:'Modificación local de líneas existentes',
      locatorObjectId:2651,scope:'Modificación de dos tramos cortos de las líneas Alonsotegi–Basauri 2 y Basauri–Güeñes 2.',geometryNote:'El símbolo se coloca sobre el corredor existente y solo localiza la actuación; no representa su eje de obra.',
      sourceLabel:'Gobierno Vasco, 4 de noviembre de 2025',sourceUrl:'https://www.euskadi.eus/gobierno-vasco/-/resolucion/resolucion-4-noviembre-2025-delegada-territorial-industria-transicion-energetica-y-sostenibilidad-bizkaia-que-se-concede-autorizacion-administrativa-previa-y-construccion-instalacion-correspondiente-/al-proyecto-modificacion-lineas-aereas-transporte-energia-electrica-220-kv-simple-circuito-alonsotegui-basauri-2-y-basauri-guenes-2-tramos-t1-t18-y-t14-t18-terminos-municipales-alonsotegi/'
    },
    {
      id:'lemoa-132',name:'Renovación de la entrada/salida de Lemoa',status:'authorized',statusLabel:'Autorización de construcción',voltage:'132 kV',kind:'Renovación de línea existente',
      lineObjectIds:[1241],scope:'Renovación del doble circuito Abadiño–Basauri 1/2 en su derivación a la subestación de Lemoa.',geometryNote:'Se resalta el corredor existente de GeoEuskadi.',
      sourceLabel:'Gobierno Vasco / BOPV, 14 de agosto de 2025',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2025/09/2503780a.pdf'
    },
    {
      id:'abadino-bergara-132',name:'Renovación Abadiño–Azpeitia y entrada/salida de Bergara',status:'authorized',statusLabel:'Autorización de construcción',voltage:'132 kV',kind:'Renovación de línea existente',
      geometry:{type:'LineString',coordinates:[[-2.502508,43.137912],[-2.423231,43.133322]]},scope:'Renovación del tramo comprendido entre el apoyo 27 y la entrada/salida de la subestación de Bergara.',geometryNote:'Eje simplificado entre los extremos publicados; no reproduce cada apoyo.',
      sourceLabel:'Gobierno Vasco / BOPV, 19 de diciembre de 2025',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2026/01/2600199a.pdf'
    },
    {
      id:'artxanda-gatika-132',name:'Reforma Artxanda–Gatika en Loiu',status:'authorized',statusLabel:'Autorización de construcción',voltage:'132 kV',kind:'Reforma local de línea existente',
      coordinate:[-2.9160,43.3020],scope:'Reforma del doble circuito entre las subestaciones de Artxanda y Gatika en el término municipal de Loiu.',geometryNote:'Posición de referencia en Loiu; el símbolo no representa el eje exacto de obra.',
      sourceLabel:'Gobierno Vasco / BOPV, 30 de enero de 2026',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2026/02/2600663a.pdf'
    },
    {
      id:'mondragon-132',name:'Derivación a la subestación de Mondragón',status:'authorized',statusLabel:'Autorización de construcción',voltage:'132 kV',kind:'Derivación de línea',
      lineObjectIds:[853],scope:'Derivación desde la línea Ormaiztegi–Abadiño hacia la subestación de Mondragón.',geometryNote:'Se resalta la derivación cartografiada por GeoEuskadi.',
      sourceLabel:'Gobierno Vasco / BOPV, 17 de febrero de 2026',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2026/02/2600896a.pdf'
    },
    {
      id:'zorrotzaurre-132',name:'Derivación a la futura subestación de Zorrotzaurre',status:'authorized',statusLabel:'Autorización de construcción',voltage:'132 kV',kind:'Tramo aéreo y soterrado',
      geometry:{type:'LineString',coordinates:[[-2.9756557,43.2827796],[-2.9752851,43.2829214],[-2.9745641,43.2831932],[-2.9667300,43.2759600]]},scope:'Nueva derivación de 1.415,6 m hasta el emplazamiento previsto de la subestación de Zorrotzaurre.',geometryNote:'Los primeros apoyos proceden del proyecto autorizado; el tramo soterrado se simplifica hasta el emplazamiento de la futura subestación. La autorización corresponde a la línea, no a la subestación futura.',
      sourceLabel:'Gobierno Vasco / BOPV, 17 de marzo de 2026',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2026/03/2601355a.pdf'
    }
  ]
};
