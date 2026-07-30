(()=>{
  let energyMapInstanceCounter=0;
  const TECHNOLOGIES={
    cycle:{label:'Ciclo combinado',color:'#4f565c'},
    cogen:{label:'Cogeneración, residuos y biomasa',color:'#67b85a'},
    cogenRenewable:{label:'Bioenergía renovable',color:'#67b85a'},
    cogenMixed:{label:'Valorización o cogeneración mixta',color:'#b07aa1'},
    cogenUnverified:{label:'Cogeneración sin combustible verificado',color:'#c8c9cc'},
    hydro:{label:'Hidráulica',color:'#247ba0'},
    wind:{label:'Eólica',color:'#79cce5'},
    solar:{label:'Autoconsumo con excedentes',color:'#f0c419'},
    other:{label:'Energía marina (undimotriz)',color:'#d55e00'}
  };
  const EVE_SOLAR_COLOR='#f0c419',EVE_SOLAR_STROKE='#9b7800',ESIOS_SOLAR_COLOR='#e97b35',ESIOS_SOLAR_STROKE='#9f4318',SOLAR_MODEL_EQUIVALENT_HOURS=1400,ESIOS_SOLAR_EXPORT_SHARE=0.2827;
  const GENERATION_PROJECT_TECHNOLOGY_LABELS={solar:'generación solar fotovoltaica',wind:'generación eólica terrestre',hydro:'generación hidroeléctrica',other:'generación renovable marina'};
  const PTS_TECHNOLOGY_LABELS={solar:'Solar fotovoltaica potencial',wind:'Eólica terrestre potencial',hydro:'Potencial hidroeléctrico',other:'Energía marina potencial'};
  const TECHNOLOGY_ORDER=['cycle','cogen','hydro','wind','solar','other'];
  const COGEN_FUEL_CLASSES={
    fossil:{label:'Generación fósil',color:'#4f565c',shortLabel:'Fósil'},
    renewable:{label:'Bioenergía renovable',color:'#67b85a',shortLabel:'Renovable'},
    mixed:{label:'Valorización o cogeneración mixta',color:'#b07aa1',shortLabel:'Mixta'},
    unverified:{label:'Combustible no verificado',color:'#c8c9cc',shortLabel:'Sin verificar'}
  };
  const COGEN_FUEL_CLASS_ORDER=['fossil','renewable','mixed','unverified'];
  const REE_TRANSPORT_CAPACITY_2024='https://www.ree.es/sites/default/files/datos/transporte/Informe_Auditoria_Calidad_de_Servicio_RdT_SEE_2024.pdf';
  const INTERCONNECTION_NODES=[
    {name:'Hernani',coordinate:[-1.97482,43.25546],voltage:'400 kV',territory:'Francia',originLabel:'Iparralde, Francia',links:['Hernani – Cantegrit'],capacityTotalMVA:2100,capacityCircuits:[['Hernani – Argia',2100]],capacityNote:'Red Eléctrica comunicó en abril de 2026 la repotenciación de Hernani–Argia de 1.600 a 2.100 MVA. La capacidad comercial se calcula para el conjunto de la frontera España–Francia, no para Hernani de forma aislada.'},
    {name:'Arkale',coordinate:[-1.89152,43.28514],voltage:'220 kV',territory:'Francia',originLabel:'Iparralde, Francia',links:['Arkale – Mouguerre'],capacityTotalMVA:460,capacityCircuits:[['Arkale – Argia',460]],capacityNote:'La línea figura con 460 MVA de capacidad térmica invernal; el desfasador de Arkale se publica aparte con 550 MVA. La capacidad comercial pertenece al conjunto de la frontera.'},
    {name:'Itxaso',coordinate:[-2.27554,43.06092],voltage:'220 y 400 kV',territory:'Navarra y Castilla y León',originLabel:'Navarra / Castilla y León',links:['Itxaso – Orcoyen 1 y 2','Barcina – Itxaso'],capacityTotalMVA:1960,capacityCircuits:[['Barcina – Itxaso',1280],['Itxaso – Orcoyen 1',300],['Itxaso – Orcoyen 2',380]]},
    {name:'Vitoria-Gasteiz',coordinate:[-2.60792,42.89822],voltage:'400 kV',territory:'Castilla y León',originLabel:'Castilla y León',links:['Grijota – Vitoria'],capacityTotalMVA:1280,capacityCircuits:[['Grijota – Vitoria',1280]]},
    {name:'Puentelarra',coordinate:[-3.04916,42.75583],voltage:'220 kV',territory:'Castilla y León',originLabel:'Castilla y León',links:['Garoña – Puentelarra','Puentelarra – Miranda'],capacityTotalMVA:1750,capacityCircuits:[['Garoña – Puentelarra 1',650],['Garoña – Puentelarra 2',650],['Miranda – Puentelarra',450]]},
    {name:'Güeñes',coordinate:[-3.03068,43.21779],voltage:'220 y 400 kV',territory:'Cantabria y Castilla y León',originLabel:'Cantabria / Castilla y León',links:['Penagos – Güeñes – Petronor','Barcina – Güeñes','Güeñes – Herrera','Villalbilla – Güeñes 1 y 2'],capacityTotalMVA:2930,capacityCircuits:[['Barcina – Güeñes',1310],['Güeñes – Virtus',1260],['T. de Ayala – Villalbilla',360]],capacityNote:'El informe de Red Eléctrica utiliza la topología y las denominaciones operativas de 2024; no todas coinciden literalmente con los nombres históricos de la cartografía.'}
  ];
  const OFFSHORE_WIND_POST_PTS=[
    {id:'bimep-offshore-wind',name:'BiMEP · DemoSATH',coordinate:[-2.875,43.455],displayOffsetPx:[-22,2],activationLayer:'offshore',modelMW:2,annualGWhEstimate:5.3,statusLabel:'Prototipo flotante conectado a red en un área de ensayo',lead:'Bizkaia cuenta frente a Armintza con su primer aerogenerador eólico flotante: el prototipo DemoSATH.',scope:'Ensayo de prototipos eólicos flotantes frente a Armintza',prototype:'DemoSATH · aerogenerador flotante de 2 MW',capacity:'Hasta dos prototipos simultáneos; infraestructura eléctrica de 4 líneas de 5 MW',depth:'50–90 m',area:'5,3 km²',planning:'Área experimental BiMEP; no es una ZLS del PTS ni un parque comercial.',locationNote:'Punto representativo aproximado del área BiMEP, desplazado ligeramente a la izquierda para separar los símbolos próximos; no delimita un parque eólico comercial.',modelEntry:'Al activar la capa se representa de forma exploratoria con sus 2 MW y 5,3 GWh/año orientativos; no se trata como parque comercial adjudicado.',detailNote:'DemoSATH permite ensayar a escala real la tecnología flotante y vierte su electricidad a la red mediante la infraestructura submarina de BiMEP. Los 20 MW corresponden a la conexión de ensayo, no a generación instalada.',photoSrc:'assets/photos/installations/demosath-bimep-armintza.jpg',photoAlt:'Aerogenerador eólico flotante DemoSATH instalado frente a Armintza, en el área de ensayos BiMEP',photoCaption:'Bizkaia cuenta con su primer molino eólico flotante frente a Armintza. Saitec Offshore.',sources:[{label:'BiMEP · DemoSATH comienza sus pruebas',url:'https://www.bimep.com/demosath-comienza-sus-pruebas-en-bimep/'},{label:'EVE · Energías oceánicas y BiMEP',url:'https://www.eve.eus/proyectos-energeticos/renovables-redes/energias-oceanicas/'},{label:'BiMEP · características técnicas',url:'https://www.bimep.com/en/bimep-area/technical-characteristics/'},{label:'Gobierno Vasco · permiso para ensayos eólicos flotantes',url:'https://www.irekia.euskadi.eus/es/news/46768-bimep-podra-acoger-investigacion-aerogeneradores-flotantes'}]},
    {id:'geroa-bimep-2',name:'GEROA · BiMEP-2',coordinate:[-2.95,43.49],activationLayer:'offshore',modelMW:50,annualGWhEstimate:132.5,statusLabel:'Propuesta precomercial sujeta a permisos, financiación y evaluación ambiental',lead:'GEROA es una propuesta de parque eólico flotante precomercial de hasta 50 MW, no una instalación construida ni adjudicada.',scope:'Tres aerogeneradores flotantes de más de 15 MW frente a la costa de Plentzia–Gorliz',prototype:'GEROA · 3 plataformas SATH con turbinas de 15 MW o más',capacity:'Hasta 50 MW de potencia conjunta propuesta',depth:'Alrededor de 130 m de profundidad media',area:'BiMEP-2 · superficie definitiva no publicada',planning:'Fuera del PTS vasco. El ámbito BiMEP-2 aparece en el POEM estatal para I+D, no como ZLS del PTS ni como ZAPER comercial.',locationNote:'Punto cartográfico aproximado, situado unos 10–11 km mar adentro al norte de Plentzia y Gorliz. No representa una delimitación oficial del parque.',modelEntry:'Al activar la capa se representa como hipótesis máxima precomercial de 50 MW y 132,5 GWh/año brutos; no altera las proyecciones publicadas del modelo.',detailNote:'La cifra de 50 MW describe la capacidad máxima propuesta por el promotor. No existe actualmente un parque de 50 MW funcionando ni una reserva del PTS vasco. La posibilidad depende de permisos estatales, evaluación ambiental, financiación, acceso y conexión.',sources:[{label:'Saitec Offshore · proyecto GEROA',url:'https://saitec-offshore.com/es/projects/geroa/'},{label:'Gobierno de España · POEM',url:'https://www.boe.es/eli/es/rd/2023/02/28/150/con'}]}
  ];
  const MARMOK_WAVE_PROTOTYPES=[
    {
      type:'Feature',
      id:990021,
      geometry:{type:'Point',coordinates:[-2.856,43.465]},
      properties:{
        objectid:990021,
        descripcion:'MARMOK-A-5 · prototipo undimotriz de IDOM',
        numero:1,
        municipio:'Área de ensayos BiMEP, frente a Armintza',
        mw:0,
        tecnologia:'Otras',
        mapLayerKey:'other',
        fuente:'EVE',
        minetur:'Prototipo experimental · no es una central comercial registrada',
        fecha_mod:Date.UTC(2026,4,13),
        informationalPrototype:true,
        detailSourceLabel:'EVE (2026)',
        detailConnectionNote:'Punto cartográfico aproximado dentro del área de ensayos BiMEP. EVE no publica la potencia nominal del prototipo en esta noticia, por lo que no se suma a la potencia instalada ni a la producción del modelo. El dispositivo se conecta a la red mediante la plataforma HarshLab para evacuar y monitorizar la electricidad generada durante el ensayo.'
      }
    }
  ];
  const WIND_REPOWERING_PTS_URL='https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-5-0-EST-AMB-ESTRATEGICO-MEMORIA.pdf';
  const WIND_REPOWERING_POTENTIAL=[
    {id:'repowering-elgea',name:'Parque eólico de Elgea',coordinate:[-2.435840999999894,42.958528000000044],currentMW:26.97,repoweredMW:38.115,currentTurbines:40,repoweredTurbines:11,increasePct:41.3,statusLabel:'Potencial técnico evaluado por el PTS'},
    {id:'repowering-urkilla',name:'Parque eólico de Urkilla',coordinate:[-2.4717879999999397,42.964271000000046],currentMW:32.3,repoweredMW:45.045,currentTurbines:38,repoweredTurbines:13,increasePct:39.5,statusLabel:'Potencial técnico evaluado por el PTS'},
    {id:'repowering-oiz',name:'Parques eólicos Oiz I y Oiz II',coordinate:[-2.5783329999999274,43.214444000000064],currentMW:34,repoweredMW:41.58,currentTurbines:40,repoweredTurbines:12,increasePct:22.3,statusLabel:'Potencial técnico agregado evaluado por el PTS',parts:'Oiz I: 25,5 → 27,72 MW; Oiz II: 8,5 → 13,86 MW'},
    {id:'repowering-badaia',name:'Parque eólico de Badaia',coordinate:[-2.8363889999999086,42.85000000000008],currentMW:50.1,registryMW:49.98,repoweredMW:107.415,currentTurbines:30,repoweredTurbines:31,increasePct:117,statusLabel:'Potencial técnico evaluado por el PTS'}
  ].map(site=>({...site,additionalMW:site.repoweredMW-site.currentMW,increasePct:100*(site.repoweredMW-site.currentMW)/site.currentMW,sourceUrl:WIND_REPOWERING_PTS_URL}));
  const VERIFIED_SUBSTATIONS=[
    {name:'ST Petronor',coordinate:[-3.10610,43.32314],voltage:'132 kV',dx:-8,dy:15,anchor:'end'},
    {name:'ST Abanto / Mantrés',coordinate:[-3.09399,43.32681],voltage:'400/132 kV',dx:8,dy:-9,anchor:'start'}
  ];
  const GEOEUSKADI_PLANTS_URL='https://www.geo.euskadi.eus/geoeuskadi/rest/services/U11/KARTOGRAFIA_CAS/MapServer/29';
  const GEOEUSKADI_ORTHOPHOTO_URL='https://www.geo.euskadi.eus/ortografia-15cm-comunidad-autonoma-del-pais-vasco-ano-2025/webgeo00-catalog/es/';
  const INSTALLATION_PHOTOS={
    'AMOREBIETA TG1':{src:'assets/photos/installations/boroa-central-termica.jpg',alt:'Central de ciclo combinado de Boroa, en Amorebieta-Etxano',description:'Central de ciclo combinado de Boroa',author:'Zarateman',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',pageUrl:'https://commons.wikimedia.org/wiki/File:Boroa_(Amorebieta)_-_Parque_Empresarial_Boroa,_Central_T%C3%A9rmica_(Bizkaia_Energia)_1.jpg'},
    'BAHIA BIZKAIA TG1':{src:'assets/photos/installations/bahia-bizkaia-electricidad.jpg',alt:'Central de ciclo combinado Bahía de Bizkaia Electricidad, en Zierbena',description:'Bahía de Bizkaia Electricidad',author:'Zarateman',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',pageUrl:'https://commons.wikimedia.org/wiki/File:Zierbena_-_Central_T%C3%A9rmica_Bah%C3%ADa_de_Bizkaia_Electricidad_(BBE)_1.jpg'},
    'SANTURCE':{src:'assets/photos/installations/santurtzi-central-termica.jpg',alt:'Central térmica de Santurtzi',description:'Central térmica de Santurtzi',author:'Zarateman',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/',pageUrl:'https://commons.wikimedia.org/wiki/File:Santurtzi_-_Central_T%C3%A9rmica_1.jpg'},
    'P.E. DE BADAIA':{src:'assets/photos/installations/badaia-parque-eolico.jpg',alt:'Parque eólico de Badaia',description:'Parque eólico de Badaia',author:'Basotxerri',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',pageUrl:'https://commons.wikimedia.org/wiki/File:Badaia_-_Parque_E%C3%B3lico_-BT-_02.jpg'},
    'P.E. OIZ':{src:'assets/photos/installations/oiz-ermita-san-cristobal.png',alt:'Ermita de San Cristóbal y aerogeneradores del parque eólico de Oiz',description:'Ermita de San Cristóbal y parque eólico de Oiz',sourceLabel:'Archivo documental de la ACTECC',expandable:true,preserveOrthophoto:true},
    'URIARTE SAFYBOX, S.A.':{
      src:'assets/photos/installations/uriarte-safybox-minieolica-autoconsumo.png',
      alt:'Aerogenerador minieólico de autoconsumo de Uriarte SafyBox en Lezama',
      description:'Instalación minieólica de autoconsumo de Uriarte SafyBox, en Lezama',
      sourceLabel:'Interempresas / Futurenergy (2014)',
      pageUrl:'https://www.interempresas.net/Energia/461265-Uriarte-SafyBox-inaugurara-una-pionera-instalacion-minieolica-de-autoconsumo.html',
      linkUrl:'https://www.interempresas.net/Energia/461265-Uriarte-SafyBox-inaugurara-una-pionera-instalacion-minieolica-de-autoconsumo.html',
      expandable:true,
      preserveOrthophoto:true,
      technical:{
        title:'Minieólica para autoconsumo industrial',
        paragraphs:[
          'La instalación de Uriarte SafyBox en Lezama está formada por dos aerogeneradores Fortis de 5 kW. La electricidad se destina directamente a distintos procesos productivos de la empresa, reduciendo la energía que necesita comprar a la red.',
          'La fuente publicó una producción prevista de 25.000 kWh al año. El punto permanece identificado como tecnología eólica, pero se muestra en la capa «Autoconsumo con excedentes» porque figura en el inventario de producción de ESIOS y su uso local está documentado. La información disponible no cuantifica cuánto excedente llega finalmente a la red.'
        ],
        citation:'(Interempresas, 2014; FuturEnergy, 2014).',
        facts:[
          ['Ubicación','Lezama, Bizkaia'],
          ['Tecnología','Minieólica'],
          ['Equipos','2 aerogeneradores Fortis de 5 kW'],
          ['Potencia total','10 kW'],
          ['Producción prevista','25.000 kWh/año'],
          ['Uso','Autoconsumo directo de procesos productivos']
        ],
        note:'Los 25.000 kWh/año son una previsión publicada, no una medida anual de ESIOS. No se aplica a este punto el factor de vertido estimado para el autoconsumo fotovoltaico.',
        references:[
          {label:'Interempresas / Futurenergy (2014) · instalación minieólica de autoconsumo',url:'https://www.interempresas.net/Energia/461265-Uriarte-SafyBox-inaugurara-una-pionera-instalacion-minieolica-de-autoconsumo.html'}
        ]
      }
    },
    'POLIDEPORTIVO ANTZIZAR · AUTOCONSUMO FOTOVOLTAICO':{
      src:'assets/photos/installations/beasain-antzizar-autoconsumo.png',
      alt:'Paneles fotovoltaicos de autoconsumo instalados en el polideportivo Antzizar de Beasain',
      description:'Instalación fotovoltaica de autoconsumo del polideportivo Antzizar, Beasain',
      sourceLabel:'Ayuntamiento de Beasain (2023)',
      pageUrl:'https://www.beasain.eus/es/noticias-es/181-infraestructuras-y-servicios/5013-las-actuaciones-a-favor-de-la-sostenibilidad-y-el-medio-ambiente-del-polideportivo-cumplen-las-expectativas',
      linkUrl:'https://www.beasain.eus/es/noticias-es/181-infraestructuras-y-servicios/5013-las-actuaciones-a-favor-de-la-sostenibilidad-y-el-medio-ambiente-del-polideportivo-cumplen-las-expectativas',
      expandable:true,
      preserveOrthophoto:true,
      technical:{
        title:'Autoconsumo fotovoltaico municipal en Antzizar',
        paragraphs:[
          'El Ayuntamiento de Beasain instaló en la cubierta del polideportivo Antzizar una planta fotovoltaica de autoconsumo de 300 kW, terminada en 2022. El proyecto estimó que cubriría el 31,1 % de la electricidad consumida por el edificio; el seguimiento municipal informó de una cobertura del 15 % del consumo energético durante los primeros meses de funcionamiento.',
          'El inventario ya contenía otro registro fotovoltaico de 10 kW, con alta en 2007, situado a unos 14 metros. Ese registro antiguo no describe la actuación de 300 kW, por lo que se conservan como instalaciones separadas. La fuente municipal no publica cuánta electricidad se vierte a la red ni confirma la modalidad de excedentes de la nueva planta.'
        ],
        citation:'(Ayuntamiento de Beasain, 2023; Energías Renovables, 2022).',
        facts:[
          ['Ubicación','Polideportivo Antzizar, Beasain, Gipuzkoa'],
          ['Tecnología','Fotovoltaica sobre cubierta'],
          ['Potencia','300 kW'],
          ['Puesta en marcha','Noviembre de 2022'],
          ['Cobertura prevista','31,1 % de la electricidad del edificio'],
          ['Primer seguimiento','15 % del consumo energético en los primeros meses'],
          ['Producción anual orientativa','0,42 GWh/año'],
          ['Inversión','311.823 € · 80 % financiado por EVE']
        ],
        note:'Los 0,42 GWh/año son una aproximación reproducible del modelo —300 kW por 1.400 horas equivalentes—, no una medición publicada. No se aplica a este punto el factor de vertido del 28,3 % usado para los registros fotovoltaicos ESIOS.',
        references:[
          {label:'Ayuntamiento de Beasain (2023) · seguimiento de la instalación de Antzizar',url:'https://www.beasain.eus/es/noticias-es/181-infraestructuras-y-servicios/5013-las-actuaciones-a-favor-de-la-sostenibilidad-y-el-medio-ambiente-del-polideportivo-cumplen-las-expectativas'},
          {label:'Energías Renovables (2022) · puesta en marcha y características',url:'https://www.energias-renovables.com/fotovoltaica/beasain-ha-instalado-placas-fotovoltaicas-para-autoconsumo-20221104'}
        ]
      }
    },
    'PARQUE ENERGIAS RENOVABLES DEL PUERTO DE BILBAO':{src:'assets/photos/installations/puerto-bilbao-parque-renovables.jpg',alt:'Aerogeneradores del parque de energías renovables del Puerto de Bilbao sobre el dique exterior',description:'Parque de energías renovables del Puerto de Bilbao, con aerogeneradores instalados sobre el dique exterior',sourceLabel:'Archivo documental de la ACTECC',expandable:true,preserveOrthophoto:true},
    'BODEGAS FERNANDEZ DE PIEROLA, S.L.':{src:'assets/photos/installations/bodegas-fernandez-pierola.jpg',alt:'Bodegas Fernández de Piérola entre viñedos, con un aerogenerador junto a las instalaciones',description:'Bodegas Fernández de Piérola, en Rioja Alavesa, con su aerogenerador junto a las instalaciones',sourceLabel:'Archivo documental de la ACTECC',expandable:true,preserveOrthophoto:true},
    'CENTRAL HIDROELECTRICA OLAVERRI':{src:'assets/photos/installations/central-hidroelectrica-olaberri.jpeg',alt:'Edificio y azud de la central hidroeléctrica Olaberri',description:'Central hidroeléctrica Olaberri y su azud',sourceLabel:'Archivo documental de la ACTECC',expandable:true,preserveOrthophoto:true},
    'PARQUE EOLICO ELGEA-URKILLA':{src:'assets/photos/installations/parque-eolico-elgea-el-correo.webp',alt:'Aerogeneradores del parque eólico de Elgea sobre la sierra',description:'Parque eólico de Elgea, parte del complejo cartográfico Elgea-Urkilla',sourceLabel:'El Correo',expandable:true,preserveOrthophoto:true,technical:{title:'Elgea-Urkilla: un único punto territorial',paragraphs:['El mapa agrupa los dos parques contiguos en un único punto para simplificar la lectura y evitar que parezcan un duplicado. La potencia total de 59,27 MW suma Elgea (26,97 MW) y Urkilla (32,3 MW) una sola vez.'],citation:'(EVE, 2003)',facts:[['Potencia de Elgea','26,97 MW'],['Potencia de Urkilla','32,3 MW'],['Potencia unificada','59,27 MW']],references:[{label:'EVE · Memoria 2003',url:'https://www.eve.eus/assets/media/memoria_2003_cas.pdf'}]}},
    'ANARBE I (PIE DE PRESA)':{src:'assets/photos/installations/anarbe-presa-central-hidroelectrica.jpeg',alt:'Presa de Añarbe y central hidroeléctrica a pie de presa',description:'Presa de Añarbe, en Errenteria, con una central hidroeléctrica a pie de presa.',sourceLabel:'Archivo documental de la ACTECC',expandable:true,preserveOrthophoto:true},
    'SOBRON 1':{src:'assets/photos/installations/sobron-presa-central-hidroelectrica.jpeg',alt:'Presa de Sobrón y central hidroeléctrica en Álava',description:'Presa de Sobrón, en Álava, vinculada a la central hidroeléctrica de Sobrón.',sourceLabel:'Archivo documental de la ACTECC',expandable:true,preserveOrthophoto:true},
    'BARAZAR 1':{
      src:'assets/photos/installations/barazar-central-subterranea.jpeg',
      alt:'Interior de la central hidroeléctrica subterránea de Barazar, en Undurraga, Zeanuri',
      description:'Interior de la central hidroeléctrica subterránea de Barazar, en Undurraga (Zeanuri). Los conjuntos amarillos son los alternadores de los dos grupos principales.',
      sourceLabel:'Ondare Lagunak',
      expandable:true,
      preserveOrthophoto:true,
      technical:{
        title:'La principal central hidroeléctrica de Euskadi por potencia instalada',
        paragraphs:[
          'La sala de máquinas está excavada aproximadamente 200 metros dentro de la montaña, en el barrio de Undurraga de Zeanuri. Los dos grandes conjuntos amarillos corresponden a los alternadores acoplados a dos turbinas Francis verticales; la central dispone además de un grupo auxiliar con turbina Pelton.',
          'El agua procede del embalse alavés de Urrunaga, recorre más de 12 kilómetros y salva un desnivel aproximado de 328–330 metros antes de llegar a la central. Barazar se puso en marcha en 1957 y su entrada completa en servicio se sitúa entre 1957 y 1958.'
        ],
        citation:'(Iberdrola España, 2024; Ondare Lagunak, 2022).',
        facts:[
          ['Potencia publicada por Iberdrola','84,32 MW'],
          ['Equipos principales','2 turbinas Francis verticales'],
          ['Grupo auxiliar','1 turbina Pelton'],
          ['Producción anual indicada por Iberdrola','152 GWh/año']
        ],
        note:'La ficha del operador publica 84,32 MW. El inventario cartográfico que alimenta este mapa muestra 82,87 MW para «BARAZAR 1»; ambas cifras se conservan separadas porque proceden de fuentes y perímetros documentales distintos.',
        references:[
          {label:'Iberdrola España · CH Barazar (2024)',url:'https://www.iberdrolaespana.com/sala-comunicacion/noticias/detalle/240402-iberdrola-espana-acerca-sus-instalaciones-renovables-hidroelectricas-a-los-estudiantes-vascos'},
          {label:'Ondare Lagunak (2022)'}
        ]
      }
    },
    'EKINDAR AZPEITIA':{
      src:'assets/photos/installations/ekindar-azpeitia-urrestilla.jpg?v=20260729',
      alt:'Paneles de la planta solar fotovoltaica Ekindar en el entorno rural de Urrestilla, Azpeitia',
      description:'Planta fotovoltaica Ekindar de Urrestilla (Azpeitia): 2.200 paneles sobre 12.681 m² y una capacidad publicada de 1,2 MW.',
      sourceLabel:'Noticias de Gipuzkoa (2024)',
      pageUrl:'https://www.noticiasdegipuzkoa.eus/gipuzkoa/bertan/2024/09/26/azkoitia-incorpora-urretxuko-ekiola-socio-8736841.html',
      linkUrl:'https://www.noticiasdegipuzkoa.eus/gipuzkoa/bertan/2024/09/26/azkoitia-incorpora-urretxuko-ekiola-socio-8736841.html',
      expandable:true,
      preserveOrthophoto:true,
      technical:{
        title:'Una comunidad energética local y un conflicto rural por el suelo',
        paragraphs:[
          'Ekindar comenzó a generar electricidad en 2024. La planta reúne 2.200 paneles sobre unos 12.000 m² en Urrestilla, cuenta con una capacidad publicada de 1,2 MW y se planteó para abastecer durante al menos 25 años a unas 600 familias de la comunidad energética local.',
          'El caso muestra un conflicto rural concreto: producir electricidad renovable cerca de quienes la consumen ocupando suelo no urbanizable de uso agrario. Los promotores reconocieron que sería preferible utilizar suelo industrial, urbanizado o degradado, pero señalaron que una planta de este tipo necesita una parcela relativamente llana, accesible y próxima a la red eléctrica, y que recurrir a suelo privado podía comprometer su viabilidad económica.',
          'La Diputación Foral de Gipuzkoa emitió un informe desfavorable por el valor agrario del terreno. ENBA y un vecino recurrieron el proyecto, mientras otros informes territoriales fueron favorables. El TSJPV desestimó ambos recursos y, en 2025, el Tribunal Supremo inadmitió la casación de ENBA. La vía judicial quedó cerrada, pero el caso conserva valor para el debate público: la legalidad de la instalación no elimina la decisión territorial entre proteger suelo agrario y dedicar parte de él a generación renovable comunitaria.'
        ],
        citation:'(NAIZ, 2024; Noticias de Gipuzkoa, 2025).',
        facts:[
          ['Entrada en funcionamiento','2024'],
          ['Paneles solares','2.200'],
          ['Superficie publicada','Aproximadamente 12.000 m²'],
          ['Capacidad publicada','1,2 MW'],
          ['Comunidad energética','Unas 600 familias'],
          ['Tipo de suelo','No urbanizable de uso agrario'],
          ['Resultado judicial','Recursos desestimados; casación inadmitida en 2025']
        ],
        note:'La información periodística redondea la capacidad a 1,2 MW. El inventario facilitado por EVE que alimenta el punto cartográfico declara 1,256 MW; el mapa conserva esta última cifra para sus sumas.',
        references:[
          {label:'NAIZ (2024) · Las ekiolas de Mendialdea, Azpeitia y Leintz Bailara ya generan luz',url:'https://www.naiz.eus/es/info/noticia/20241011/las-ekiolas-de-mendialdea-azpeitia-y-leintz-bailara-ya-generan-luz'},
          {label:'Noticias de Gipuzkoa (2025) · El horizonte de Ekindar queda libre de amenazas judiciales',url:'https://www.noticiasdegipuzkoa.eus/gipuzkoa/bertan/2025/07/09/ekindar-azpeitia-denuncias-sentencia-comunidad-energetica-placas-solares-9858280.html'}
        ]
      }
    },
    'PARQUE SOLAR FOTOVOLTAICO EKIAN (ARASUR 1)':{src:'assets/photos/installations/ekian-arasur.webp',alt:'Vista aérea del parque solar fotovoltaico Ekian en Arasur, Erriberabeitia',description:'Parque solar fotovoltaico Ekian, en Arasur (Erriberabeitia/Ribera Baja, Álava). Inaugurado en 2020, reúne más de 67.000 paneles, 24 MW de potencia y una producción aproximada de 40 GWh al año.',sourceLabel:'EVE',pageUrl:'https://www.eve.eus/proyectos-energeticos/renovables-redes/solar-fotovoltaica/',linkUrl:'https://www.eve.eus/proyectos-energeticos/renovables-redes/solar-fotovoltaica/',expandable:true,preserveOrthophoto:true},
    'MARMOK-A-5 · PROTOTIPO UNDIMOTRIZ DE IDOM':{
      src:'assets/photos/installations/marmok-a5-bimep-eve.jpg?v=20260729',
      alt:'Dispositivo undimotriz flotante MARMOK-A-5 de IDOM en el área de ensayos BiMEP frente a Armintza',
      description:'MARMOK-A-5 en el área de ensayos BiMEP, frente a Armintza',
      sourceLabel:'Imagen cedida por EVE',
      linkUrl:'https://www.eve.eus/noticias/noticias/bimep-acoge-el-nuevo-dispositivo-flotante-de-idom/',
      expandable:true,
      technical:{
        title:'MARMOK-A-5: prototipo flotante de energía de las olas',
        paragraphs:[
          'IDOM desplegó en mayo de 2026 este convertidor undimotriz flotante en el área marina de ensayos BiMEP. Utiliza una columna de agua oscilante: el movimiento del oleaje desplaza aire a través de una turbina para producir electricidad.',
          'Incorpora álabes controlables, baterías embarcadas y sistemas inteligentes de control. Se conecta a la red mediante la plataforma HarshLab, que permite evacuar la electricidad y monitorizar el comportamiento del equipo en condiciones reales.'
        ],
        citation:'(EVE, 2026).',
        facts:[
          ['Estado','Prototipo desplegado en ensayo desde mayo de 2026'],
          ['Ubicación','Área BiMEP, frente a Armintza, Bizkaia'],
          ['Tecnología','Columna de agua oscilante flotante'],
          ['Promotor tecnológico','IDOM'],
          ['Conexión','Mediante la plataforma HarshLab'],
          ['Financiación','Programa europeo EuropeWave']
        ],
        note:'EVE no publica en esta noticia la potencia nominal ni la producción prevista del prototipo. Por eso el punto es informativo y no se suma al balance eléctrico ni a las proyecciones.',
        references:[
          {label:'EVE (2026) · BiMEP acoge el nuevo dispositivo flotante de IDOM',url:'https://www.eve.eus/noticias/noticias/bimep-acoge-el-nuevo-dispositivo-flotante-de-idom/'}
        ]
      }
    },
    'PLANTA DE APROVECHAMIENTO DE LAS OLAS':{src:'assets/photos/installations/mutriku-planta-olas.jpeg',alt:'Esquema de funcionamiento y fotografías de la planta undimotriz de Mutriku',description:'Planta undimotriz de Mutriku: esquema, dique y sala de turbinas',sourceLabel:'Zientzia.eus',pageUrl:'https://zientzia.eus/artikuluak/olatuak-potentzial-handik/',linkUrl:'https://zientzia.eus/artikuluak/olatuak-potentzial-handik/',expandable:true}
  };
  const PUBLISHED_INSTALLATION_AREAS={
    5426:{display:'5,8 ha',kind:'Parcela publicada de la central',sourceLabel:'BOPV',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2021/10/2105342a.shtml'},
    5764:{display:'14 ha',kind:'Parcela publicada de la central térmica',sourceLabel:'BOE',sourceUrl:'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2002-421'},
    5809:{display:'5,1502 ha',kind:'Superficie ocupada publicada',sourceLabel:'BBE',sourceUrl:'https://www.bbe.es/quienes-somos/introduccion/'},
    5734:{display:'Complejo: 220 ha',kind:'La unidad PETRONOR 1 no está desagregada; el dato corresponde a toda la refinería',sourceLabel:'Petronor',sourceUrl:'https://petronor.eus/es/instalaciones/'}
  };
  const CARTOGRAPHED_INSTALLATION_AREAS={
    2615:{sqm:1773.20,footprintId:5060,distanceM:0},
    2616:{sqm:1941.25,footprintId:5045,distanceM:144.2},
    2679:{sqm:129.20,footprintId:5054,distanceM:0},
    2815:{sqm:1243.04,footprintId:5055,distanceM:0,shared:true},
    2816:{sqm:1243.04,footprintId:5055,distanceM:197.4,shared:true},
    5426:{sqm:78813.94,footprintId:2706,distanceM:0},
    5764:{sqm:52530.72,footprintId:6329,distanceM:0},
    5809:{sqm:26732.67,footprintId:6330,distanceM:116.0},
    8812:{sqm:542.16,footprintId:5052,distanceM:21.9},
    8902:{sqm:833.91,footprintId:5057,distanceM:34.0},
    8932:{sqm:238.91,footprintId:5051,distanceM:41.8},
    8935:{sqm:607.81,footprintId:5049,distanceM:106.1},
    8953:{sqm:437.08,footprintId:5569,distanceM:0},
    9036:{sqm:458.14,footprintId:5570,distanceM:51.0},
    9070:{sqm:4378.50,footprintId:5618,distanceM:0},
    9154:{sqm:337.31,footprintId:5046,distanceM:0}
  };
  const isLegacyGatikaLemoiz=feature=>[1132,2032].includes(Number(feature.properties?.OBJECTID))||/^Línea 400 kV Gatika - Lemoniz(?: I)?$/i.test(feature.properties?.NOMBRE_2||'');
  const lineTitle=feature=>{
    const name=feature.properties?.NOMBRE_2||'Línea eléctrica',voltage=feature.properties?.VTENS_0116||'tensión no indicada';
    if(/Penagos\s*-\s*Güeñes\s*-\s*Petronor/i.test(name))return`${name} · termina en la subestación Abanto/Mantrés, no en el punto registral PETRONOR 1`;
    return`${name} · ${voltage}`;
  };
  const keyForTechnology=value=>({
    'Ciclo combinado':'cycle',
    'Cogen/residuos/biomasa':'cogen',
    'Hidráulica':'hydro',
    'Eólica':'wind',
    'Fotovoltaica':'solar',
    'Otras':'other'
  }[value]||'other');
  const formatNumber=(value,digits=1)=>Number(value).toLocaleString('es-ES',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const cleanMunicipality=value=>String(value||'').replace(/^ARABA\/ÁLAVA\s+/i,'').replace(/^BIZKAIA\s+/i,'').replace(/^GIPUZKOA\s+/i,'').trim()||'Sin municipio indicado';
  const normalizePlaceName=value=>{const normalized=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');return normalized==='arrankudiaga'?'arrankudiagazollo':normalized};
  const normalizeInstallationName=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toUpperCase();
  const COGEN_FUEL_EVIDENCE={
    'PETRONOR 1':{fuelClass:'fossil',note:'La documentación de emergencia de Petronor identifica la cogeneración con gas de refinería y otros combustibles fósiles del complejo.',sourceLabel:'Gobierno Vasco · PEE Petronor 2024',sourceUrl:'https://www.euskadi.eus/contenidos/informacion/planes_pee/es_doc/adjuntos/PEE-PETRONOR-SA-junio-2024.pdf'},
    'PAPELERA GUIPUZCOANA':{fuelClass:'fossil',note:'La autorización ambiental describe los grupos de cogeneración registrados como turbinas alimentadas con gas natural.',sourceLabel:'Gobierno Vasco · autorización ambiental',sourceUrl:'https://www.euskadi.eus/bopv2/datos/2019/06/1903047a.pdf'},
    'COGENERACIN PAPEL ARALAR II':{fuelClass:'fossil',note:'La autorización ambiental identifica gas natural como combustible de la instalación de cogeneración.',sourceLabel:'Gobierno Vasco · Papel Aralar',sourceUrl:'https://www.euskadi.eus/eli/es-pv/res/2022/03/08/%283%29/dof/eus/html/web01-s2ing/eu/'},
    'WARTSILA':{fuelClass:'fossil',note:'La documentación institucional describe los equipos de cogeneración de Wärtsilä como motores que emplean gas o fuelóleo.',sourceLabel:'Gobierno Vasco · industria marítima',sourceUrl:'https://www.euskadi.eus/web01-a2inguru/es/contenidos/noticia/i_maritima_08/es_i_mariti/i_maritima.html'},
    'IPARLAT':{fuelClass:'fossil',note:'El registro PRTR de la instalación identifica expresamente el gas natural como combustible.',sourceLabel:'PRTR España · Iparlat',sourceUrl:'https://prtr-es.miteco.gob.es/Informes/fichacomplejo.aspx?Id_Complejo=629'},
    'PLANTA A ZABALGARBI':{fuelClass:'fossil',renewableShare:.20,note:'Valoriza residuos urbanos y emplea gas natural. En la barra se atribuye como renovable un 20 % de su electricidad: es la estimación publicada para la fracción biodegradable del residuo, no el 63 % de biomasa contenido en el residuo antes de considerar el apoyo del gas y el rendimiento del conjunto.',sourceLabel:'Parlamento Europeo · estimación renovable de Zabalgarbi',sourceUrl:'https://www.europarl.europa.eu/doceo/document/E-8-2017-006500_ES.html'},
    'EKONDAKIN ENERGIA Y MEDIOAMBIENTE, S.A.':{fuelClass:'fossil',renewableAnnualGWh:37.4281,note:'Valoriza la fracción resto de residuos municipales y dispone de combustibles auxiliares fósiles. La barra reserva 37,4 GWh como renovables, valor declarado por Ekondakin aplicando el criterio sectorial del 50 % a la electricidad generada; el resto permanece como no renovable.',sourceLabel:'Ekondakin · declaración ambiental',sourceUrl:'https://ekondakin.eus/contenidos/documentos/DeclaracionAmbiental_AnexoVII_EkondakinEnergiaYMedioambiente.pdf'},
    'COGENERACION IURRETA':{fuelClass:'fossil',renewableShare:1,note:'La autorización identifica licor negro, cortezas y otros subproductos biomásicos, y la instalación está descrita técnicamente como cogeneración mediante combustión de biomasa. Por ello, la estimación de la barra atribuye a renovable la electricidad de este registro; los consumos fósiles auxiliares del proceso no se convierten en energía renovable.',sourceLabel:'Gobierno Vasco · Smurfit Kappa Iurreta',sourceUrl:'https://www.osakidetza.euskadi.eus/eli/es-pv/res/2008/04/30/%2819%29/dof/spa/html/webosk00-cercon/es/'},
    'BIOARTIGAS S.A.':{fuelClass:'renewable',note:'Aprovechamiento de biogás de vertedero identificado en la memoria del PTS de Energías Renovables.',sourceLabel:'Gobierno Vasco · PTS de Energías Renovables',sourceUrl:'https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-1-MEMORIA.pdf'},
    'BIOCOMPOST DE ALAVA UTE':{fuelClass:'renewable',note:'Aprovechamiento de biogás de la planta de biometanización de Jundiz.',sourceLabel:'Gobierno Vasco · PTS de Energías Renovables',sourceUrl:'https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-1-MEMORIA.pdf'},
    'COG. VERTEDERO GARDELEGUI':{fuelClass:'renewable',note:'Generación a partir de biogás de vertedero.',sourceLabel:'Gobierno Vasco · PTS de Energías Renovables',sourceUrl:'https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-1-MEMORIA.pdf'},
    'BIOSASIETA':{fuelClass:'renewable',note:'Aprovechamiento de biogás de vertedero identificado en la planificación energética vasca.',sourceLabel:'Gobierno Vasco · PTS de Energías Renovables',sourceUrl:'https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-1-MEMORIA.pdf'},
    'DEPURADORA DE AGUAS RESIDUALES LOIOLA':{fuelClass:'renewable',note:'Generación con biogás de la depuración de aguas residuales de Loiola.',sourceLabel:'Gobierno Vasco · PTS de Energías Renovables',sourceUrl:'https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-1-MEMORIA.pdf'},
    'PLANTA DEPURACION AGUAS RESIDUALES':{fuelClass:'renewable',note:'Valorización del biogás de la EDAR de Galindo.',sourceLabel:'Gobierno Vasco · PTS de Energías Renovables',sourceUrl:'https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-1-MEMORIA.pdf'},
    'EDAR BAJO BIDASOA':{fuelClass:'renewable',note:'Generación asociada al biogás producido en la depuración de aguas residuales.',sourceLabel:'Gobierno Vasco · PTS de Energías Renovables',sourceUrl:'https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-1-MEMORIA.pdf'}
  };
  const cogenFuelEvidenceForName=name=>COGEN_FUEL_EVIDENCE[normalizeInstallationName(name)]||{fuelClass:'fossil',note:'El combustible de este registro no está verificado individualmente. Se atribuye provisionalmente a no renovable porque la cogeneración española emplea mayoritariamente gas natural; es una estimación conservadora que deberá revisarse si aparece documentación específica.',sourceLabel:'MITECO · combustibles de la cogeneración',sourceUrl:'https://www.miteco.gob.es/es/energia/participacion/2024/detalle-participacion-publica-k-707.html'};
  const dateLabel=value=>{const date=new Date(Number(value));return Number.isFinite(date.getTime())?date.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'}):'No indicada'};
  const territoryLabel=value=>({ALAVA:'Araba / Álava',ARABA:'Araba / Álava',BIZKAIA:'Bizkaia',GIPUZKOA:'Gipuzkoa'}[String(value||'').toUpperCase()]||value||'');
  const d3WindingGeometry=geometry=>{
    if(geometry?.type==='Polygon')return{...geometry,coordinates:geometry.coordinates.map(ring=>[...ring].reverse())};
    if(geometry?.type==='MultiPolygon')return{...geometry,coordinates:geometry.coordinates.map(polygon=>polygon.map(ring=>[...ring].reverse()))};
    return geometry;
  };
  const d3WindingCollection=collection=>({...collection,features:collection.features.map(feature=>({...feature,geometry:d3WindingGeometry(feature.geometry)}))});
  const orthophotoUrl=coordinate=>{
    const [longitude,latitude]=coordinate,longitudeRadius=.007,latitudeRadius=.005;
    const bbox=[longitude-longitudeRadius,latitude-latitudeRadius,longitude+longitudeRadius,latitude+latitudeRadius].map(value=>value.toFixed(6)).join(',');
    return `https://www.geo.euskadi.eus/geoeuskadi/rest/services/U11/ORTOARGAZKIAK/MapServer/export?bbox=${bbox}&bboxSR=4326&imageSR=4326&size=420%2C300&format=jpg&layers=show%3A189&f=image`;
  };
  const orthophotoCaption=()=>`Vista aérea de la ubicación · Ortofoto 2025 · <a href="${GEOEUSKADI_ORTHOPHOTO_URL}" target="_blank" rel="noopener">GeoEuskadi</a> / PNOA-IGN`;
  const mediaForRecord=record=>{
    const recordId=Number(record.feature?.id??record.properties?.objectid),photoKey=recordId===900012?'EKINDAR AZPEITIA':normalizeInstallationName(record.properties.descripcion);
    const orthophoto=orthophotoUrl(record.coordinate),photo=INSTALLATION_PHOTOS[photoKey];
    if(!photo)return{src:orthophoto,orthophoto,isOrthophoto:true,alt:`Vista aérea del emplazamiento de ${record.properties.descripcion||'la instalación'}`,caption:orthophotoCaption()};
    const caption=photo.licenseUrl?`${escapeHtml(photo.description)} · ${escapeHtml(photo.author)} · <a href="${photo.licenseUrl}" target="_blank" rel="noopener">${escapeHtml(photo.license)}</a> · <a href="${photo.pageUrl}" target="_blank" rel="noopener">Wikimedia Commons</a>`:photo.pageUrl?`${escapeHtml(photo.description)} · <a href="${photo.pageUrl}" target="_blank" rel="noopener">${escapeHtml(photo.sourceLabel||'Fuente')}</a> · Pulsa la imagen para abrir el artículo`:`${escapeHtml(photo.description)}${photo.sourceLabel?` · ${escapeHtml(photo.sourceLabel)}`:''}`;
    const additionalMedia=photo.preserveOrthophoto?{src:orthophoto,isOrthophoto:true,alt:`Vista aérea cartográfica del emplazamiento de ${record.properties.descripcion||'la instalación'}`,caption:orthophotoCaption()}:null;
    return{src:photo.src,orthophoto,isOrthophoto:false,alt:photo.alt,caption,linkUrl:photo.linkUrl||'',expandable:Boolean(photo.expandable),additionalMedia,technical:photo.technical||null};
  };
  const technicalMarkupForMedia=media=>{
    const technical=media.technical;
    if(!technical)return'';
    const paragraphList=technical.paragraphs||[];
    const paragraphs=paragraphList.map((paragraph,index)=>`<p>${escapeHtml(paragraph)}${technical.citation&&index===paragraphList.length-1?` ${escapeHtml(technical.citation)}`:''}</p>`).join('');
    const facts=(technical.facts||[]).map(([label,value])=>`<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join('');
    const references=(technical.references||[]).map(reference=>reference.url?`<a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener">${escapeHtml(reference.label)}</a>`:escapeHtml(reference.label)).join(' · ');
    return `<section class="map-data-note installation-technical-note"><strong>${escapeHtml(technical.title)}</strong>${paragraphs}${facts?`<dl>${facts}</dl>`:''}${technical.note?`<p><strong>Lectura de las cifras.</strong> ${escapeHtml(technical.note)}</p>`:''}</section>${references?`<span class="map-source-badge">${references}</span>`:''}`;
  };
  const formatCartographicArea=squareMetres=>squareMetres>=10000?`${formatNumber(squareMetres/10000,2)} ha`:`${formatNumber(squareMetres,0)} m²`;
  const areaForRecord=record=>{
    const id=Number(record.feature?.id),published=PUBLISHED_INSTALLATION_AREAS[id];
    if(published)return published;
    const mapped=CARTOGRAPHED_INSTALLATION_AREAS[id];
    if(!mapped)return null;
    const shared=mapped.shared?' · recinto compartido por dos registros':'';
    return{display:formatCartographicArea(mapped.sqm),kind:`Huella cartografiada del recinto${shared}`,sourceLabel:'GeoEuskadi',sourceUrl:GEOEUSKADI_PLANTS_URL};
  };
  const areaMarkup=record=>{
    const area=areaForRecord(record);
    if(!area)return'<span class="map-area-unavailable">No disponible</span><span class="map-area-kind">Sin parcela publicada o huella oficial compatible</span>';
    return`<strong class="map-area-value">${escapeHtml(area.display)}</strong><span class="map-area-kind">${escapeHtml(area.kind)} · <a href="${area.sourceUrl}" target="_blank" rel="noopener">${escapeHtml(area.sourceLabel)}</a></span>`;
  };

  window.renderEnergyTransportSummaryMap=(host,mode='electricity')=>{
    const d3=window.d3,territories=window.energyMapTerritories,surroundings=window.energyMapSurroundingRegions,highVoltage=window.energyMapHighVoltage,substations=window.energyMapSubstations,biscayInterconnector=window.energyMapBiscayInterconnector,nonElectricInfrastructure=window.energyMapNonElectricInfrastructure;
    host.classList.add('energy-transport-summary',`is-${mode}`);
    if(!d3||!territories?.features?.length){
      host.innerHTML='<p class="map-error"><strong>No se ha podido cargar esta vista.</strong> La explicación y las fuentes siguen disponibles debajo.</p>';
      return;
    }
    const W=920,H=430,mapTerritories=d3WindingCollection(territories),mapSurroundings=surroundings?.features?.length?surroundings:null;
    const svg=d3.select(host).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('role','img').attr('aria-label',mode==='electricity'?'Mapa de las redes y conexiones eléctricas de Euskadi con los territorios vecinos':'Mapa de las principales infraestructuras de transporte de combustibles y energía no eléctrica de Euskadi');
    const projection=d3.geoMercator().fitExtent([[38,42],[W-38,H-34]],mapTerritories),path=d3.geoPath(projection);
    const defs=svg.append('defs');
    const marker=(id,color,orient='auto')=>defs.append('marker').attr('id',id).attr('viewBox','0 -5 10 10').attr('refX',8.5).attr('refY',0).attr('markerWidth',6).attr('markerHeight',6).attr('orient',orient).append('path').attr('d','M0,-5L10,0L0,5Z').attr('fill',color);
    marker(`transport-arrow-${mode}`,'#0b7563');
    marker(`transport-arrow-start-${mode}`,'#0b7563','auto-start-reverse');
    marker(`transport-arrow-future-${mode}`,'#1676b7');
    marker(`transport-arrow-dark-${mode}`,'#454d52');
    svg.append('rect').attr('width',W).attr('height',H).attr('fill','#edf7fb');
    if(mapSurroundings)svg.append('g').selectAll('path').data(mapSurroundings.features).join('path').attr('d',path).attr('fill','#f2efe9').attr('stroke','#d6d5cf').attr('stroke-width',1);
    svg.append('g').selectAll('path').data(mapTerritories.features).join('path').attr('d',path).attr('fill','#dcefdc').attr('stroke','#fff').attr('stroke-width',2);
    svg.append('path').datum(mapTerritories).attr('d',path).attr('fill','none').attr('stroke','#668078').attr('stroke-width',1.2);
    const territoryLabels=[
      {label:'BIZKAIA',coordinate:[-2.89,43.24]},
      {label:'GIPUZKOA',coordinate:[-2.04,43.16]},
      {label:'ARABA / ÁLAVA',coordinate:[-2.68,42.79]}
    ];
    svg.append('g').attr('class','transport-map-territory-labels').selectAll('text').data(territoryLabels).join('text').attr('x',d=>projection(d.coordinate)[0]).attr('y',d=>projection(d.coordinate)[1]).attr('text-anchor','middle').text(d=>d.label);

    const legend=document.createElement('div');legend.className='energy-transport-map-legend';host.append(legend);
    if(mode==='electricity'){
      const lines=(highVoltage?.features||[]).filter(feature=>['132 kV','220 kV','400 kV'].includes(feature.properties?.VTENS_0116)&&!isLegacyGatikaLemoiz(feature));
      const lineColor={'132 kV':'#9eb0b7','220 kV':'#4f7f91','400 kV':'#173f52'};
      svg.append('g').attr('class','transport-electric-grid').selectAll('path').data(lines).join('path').attr('d',path).attr('fill','none').attr('stroke',d=>lineColor[d.properties?.VTENS_0116]||'#60757d').attr('stroke-width',d=>d.properties?.VTENS_0116==='400 kV'?2.2:d.properties?.VTENS_0116==='220 kV'?1.45:.8).attr('opacity',.84).append('title').text(d=>lineTitle(d));
      const substationsFeatures=substations?.features?.length?d3WindingCollection(substations).features:[];
      svg.append('g').attr('class','transport-substations').selectAll('path').data(substationsFeatures).join('path').attr('d',path).attr('fill','#fff').attr('stroke','#173f52').attr('stroke-width',.8);
      const currentConnections=[
        {name:'Hernani–Arkale',originLabel:'Iparralde / Francia',coordinate:[-1.933,43.27],outside:[-1.72,43.39],capacity:2560},
        {name:'Itxaso',originLabel:'Navarra / Castilla y León',coordinate:[-2.27554,43.06092],outside:[-2.05,42.86],capacity:1960},
        {name:'Vitoria-Gasteiz',originLabel:'Castilla y León',coordinate:[-2.60792,42.89822],outside:[-2.61,42.64],capacity:1280},
        {name:'Puentelarra',originLabel:'Castilla y León',coordinate:[-3.04916,42.75583],outside:[-3.23,42.59],capacity:1750},
        {name:'Güeñes',originLabel:'Cantabria / Castilla y León',coordinate:[-3.03068,43.21779],outside:[-3.34,43.20],capacity:2930}
      ];
      const futureSeaExit=biscayInterconnector?.metadata?.seaExit||[-2.99,43.41];
      const connections=[...currentConnections,{name:'Interconexión del Golfo de Bizkaia',originLabel:'Francia · prevista 2028',coordinate:futureSeaExit,outside:[-2.72,43.62],capacity:2000,future:true,unit:'MW'}];
      const width=d3.scaleSqrt().domain([1200,3000]).range([4.2,9]);
      const connectionLayer=svg.append('g').attr('class','transport-electric-connections');
      const groups=connectionLayer.selectAll('g').data(connections).join('g');
      groups.append('line').attr('x1',d=>projection(d.outside)[0]).attr('y1',d=>projection(d.outside)[1]).attr('x2',d=>projection(d.coordinate)[0]).attr('y2',d=>projection(d.coordinate)[1]).attr('stroke',d=>d.future?'#1676b7':'#0b7563').attr('stroke-width',d=>width(d.capacity)).attr('stroke-dasharray',d=>d.future?'9 6':null).attr('stroke-linecap','round').attr('marker-start',d=>d.future?null:`url(#transport-arrow-start-${mode})`).attr('marker-end',d=>d.future?`url(#transport-arrow-future-${mode})`:`url(#transport-arrow-${mode})`).attr('opacity',.92);
      groups.append('circle').attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1]).attr('r',d=>Math.max(4,width(d.capacity)*.62)).attr('fill','#fff').attr('stroke',d=>d.future?'#1676b7':'#0b7563').attr('stroke-width',2);
      groups.append('text').attr('class','transport-connection-label').attr('x',d=>(projection(d.outside)[0]+projection(d.coordinate)[0])/2).attr('y',d=>(projection(d.outside)[1]+projection(d.coordinate)[1])/2-10).attr('text-anchor','middle').each(function(d){
        const text=d3.select(this),x=+text.attr('x');
        text.append('tspan').attr('x',x).text(d.name);
        text.append('tspan').attr('x',x).attr('dy',12).text(`${d.originLabel} · ${formatNumber(d.capacity,0)} ${d.unit||'MVA'}`);
      });
      legend.innerHTML='<span><i style="--legend-color:#9eb0b7"></i>132 kV</span><span><i style="--legend-color:#4f7f91"></i>220 kV</span><span><i style="--legend-color:#173f52"></i>400 kV</span><span><i class="is-arrow" style="--legend-color:#0b7563"></i>Conexión bidireccional actual</span><span><i class="is-dashed" style="--legend-color:#1676b7"></i>Conexión prevista</span>';
    }else{
      const data=nonElectricInfrastructure||{},categories=data.categories||{},routes=data.routes||[],facilities=data.facilities||[];
      const routeFeatures=routes.map(route=>({type:'Feature',properties:route,geometry:{type:'LineString',coordinates:route.coordinates}}));
      svg.append('g').attr('class','transport-fuel-routes').selectAll('path').data(routeFeatures).join('path').attr('d',path).attr('fill','none').attr('stroke',d=>categories[d.properties.category]?.color||'#596168').attr('stroke-width',d=>d.properties.category==='oilRoute'?4.5:3).attr('stroke-dasharray',d=>d.properties.category==='oilRoute'?'7 4':null).attr('stroke-linecap','round').attr('opacity',.9).append('title').text(d=>d.properties.name);
      const majorLabels=new Set(['bbg','gaviota-offshore','irun-gas','petronor-refinery','petronor-terminal']);
      const facilitiesLayer=svg.append('g').attr('class','transport-fuel-facilities').selectAll('g').data(facilities).join('g');
      facilitiesLayer.append('circle').attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1]).attr('r',d=>['renewableGas','thermalBiomass'].includes(d.category)?5:7).attr('fill',d=>categories[d.category]?.color||'#596168').attr('stroke','#fff').attr('stroke-width',1.5);
      facilitiesLayer.append('title').text(d=>d.name);
      facilitiesLayer.filter(d=>majorLabels.has(d.id)).append('text').attr('class','transport-facility-label').attr('x',d=>projection(d.coordinate)[0]+(d.id==='irun-gas'?-8:8)).attr('y',d=>projection(d.coordinate)[1]+(d.id==='gaviota-offshore'?-9:15)).attr('text-anchor',d=>d.id==='irun-gas'?'end':'start').text(d=>d.id==='petronor-terminal'?'Punta Lucero':d.id==='petronor-refinery'?'Petronor':d.id==='gaviota-offshore'?'Gaviota':d.id==='irun-gas'?'Interconexión de Irún':'BBG');
      const seaOrigin=data.importOrigins?.coordinate||[-3.22,43.455],port=[-3.071,43.354],gasOrigin=[-1.63,43.34],gasEntry=[-1.79,43.34];
      const entries=[
        {from:seaOrigin,to:port,label:'Entrada marítima · GNL y crudo'},
        {from:gasOrigin,to:gasEntry,label:'Conexión gasista con Francia'}
      ];
      const entryGroups=svg.append('g').attr('class','transport-fuel-entries').selectAll('g').data(entries).join('g');
      entryGroups.append('line').attr('x1',d=>projection(d.from)[0]).attr('y1',d=>projection(d.from)[1]).attr('x2',d=>projection(d.to)[0]).attr('y2',d=>projection(d.to)[1]).attr('stroke','#454d52').attr('stroke-width',7).attr('stroke-linecap','round').attr('marker-end',`url(#transport-arrow-dark-${mode})`);
      entryGroups.append('text').attr('class','transport-connection-label').attr('x',d=>(projection(d.from)[0]+projection(d.to)[0])/2).attr('y',d=>(projection(d.from)[1]+projection(d.to)[1])/2-10).attr('text-anchor','middle').text(d=>d.label);
      legend.innerHTML='<span><i style="--legend-color:#7c8582"></i>Gasoducto</span><span><i class="is-dashed" style="--legend-color:#34383a"></i>Oleoducto o poliducto</span><span><b style="--legend-color:#7c8582"></b>Infraestructura de gas o petróleo</span><span><b style="--legend-color:#7a4a2a"></b>Combustibles renovables</span><span><b style="--legend-color:#c79a6b"></b>Biomasa para calor</span>';
    }
  };

  window.renderSelfConsumptionSolarMap=host=>{
    const d3=window.d3,installations=window.energyMapReeInstallations,territories=window.energyMapTerritories,municipalities=window.energyMapMunicipalities,surroundings=window.energyMapSurroundingRegions;
    host.classList.add('self-consumption-solar-map');
    if(!d3||!installations?.features?.length||!territories?.features?.length){
      host.innerHTML='<p class="map-error"><strong>No se ha podido cargar esta vista solar.</strong> La explicación metodológica permanece disponible.</p>';
      return;
    }
    const solarCandidates=installations.features.filter(feature=>feature.properties?.tecnologia==='Fotovoltaica'&&feature.properties?.fuente!=='Datos proporcionados por EVE');
    const excludedLargestSolar=[...solarCandidates].sort((a,b)=>(Number(b.properties?.mw)||0)-(Number(a.properties?.mw)||0)).slice(0,6),excludedLargestSolarIds=new Set(excludedLargestSolar.map(feature=>feature.id));
    const solarFeatures=solarCandidates.filter(feature=>!excludedLargestSolarIds.has(feature.id));
    const mapTerritories=d3WindingCollection(territories),mapMunicipalities=municipalities?.features?.length?d3WindingCollection(municipalities):null,mapSurroundings=surroundings?.features?.length?surroundings:null,W=920,H=470;
    const composition=document.createElement('div');
    composition.className='self-consumption-map-composition';
    composition.innerHTML=`
      <figure class="self-consumption-context-photo is-industrial">
        <img src="assets/photos/self-consumption/solar-industrial-rooftop.jpg" loading="lazy" decoding="async" alt="Cubierta de un parque empresarial ocupada por una instalación solar fotovoltaica">
        <figcaption><strong>Ejemplo de cubierta industrial.</strong> El tejado produce electricidad cerca del lugar de consumo. <a href="https://commons.wikimedia.org/wiki/File:Dornbirn-Rhombergs_Fabrik-photovoltaic_systems-01ASD.jpg">Imagen ilustrativa · Asurnipal · CC BY-SA 4.0</a></figcaption>
      </figure>
      <div class="self-consumption-map-stage"></div>
      <figure class="self-consumption-context-photo is-residential">
        <img src="assets/photos/self-consumption/solar-rooftop-installation.jpg" loading="lazy" decoding="async" alt="Paneles solares fotovoltaicos instalados sobre el tejado de una vivienda">
        <figcaption><strong>Ejemplo de cubierta residencial.</strong> Parte de la electricidad puede consumirse detrás del contador. <a href="https://commons.wikimedia.org/wiki/File:Rooftop_solar_photovoltaic_installation.jpg">Imagen ilustrativa · Marta Victoria · CC BY-SA 4.0</a></figcaption>
      </figure>`;
    host.append(composition);
    const mapStage=composition.querySelector('.self-consumption-map-stage');
    const projection=d3.geoMercator().fitExtent([[35,28],[W-35,H-28]],mapTerritories),path=d3.geoPath(projection),svg=d3.select(mapStage).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('role','img').attr('aria-label',`Mapa de Euskadi con ${solarFeatures.length} instalaciones de Red Eléctrica & ESIOS habilitadas para producir y verter excedentes. Se excluyen la capa de fotovoltaica a red y los seis registros de mayor potencia.`);
    svg.append('rect').attr('width',W).attr('height',H).attr('fill','#edf7fb');
    if(mapSurroundings)svg.append('g').selectAll('path').data(mapSurroundings.features).join('path').attr('d',path).attr('fill','#f3f0ea').attr('stroke','#ddd9d2').attr('stroke-width',1);
    svg.append('g').selectAll('path').data(mapTerritories.features).join('path').attr('d',path).attr('fill','#d7ead3').attr('stroke','#fff').attr('stroke-width',2);
    if(mapMunicipalities)svg.append('g').selectAll('path').data(mapMunicipalities.features).join('path').attr('d',path).attr('fill','none').attr('stroke','#fff').attr('stroke-width',.45).attr('opacity',.85);
    svg.append('path').datum(mapTerritories).attr('d',path).attr('fill','none').attr('stroke','#71877f').attr('stroke-width',1.2);
    const radius=d3.scaleSqrt().domain([0,30]).range([2.15,8]).clamp(true);
    svg.append('g').attr('class','self-consumption-solar-points').selectAll('circle').data(solarFeatures).join('circle').attr('cx',feature=>projection(feature.geometry.coordinates)[0]).attr('cy',feature=>projection(feature.geometry.coordinates)[1]).attr('r',feature=>radius(Number(feature.properties?.mw)||0)).attr('fill','#f0c419').attr('stroke','#fff').attr('stroke-width',1).attr('opacity',.9).append('title').text(feature=>`Punto fotovoltaico · ${cleanMunicipality(feature.properties?.municipio)}${Number(feature.properties?.mw)>0?` · ${formatNumber(feature.properties.mw,3)} MW`:''}`);
    const labels=[
      {label:'BIZKAIA',coordinate:[-2.9,43.24]},
      {label:'GIPUZKOA',coordinate:[-2.04,43.16]},
      {label:'ARABA / ÁLAVA',coordinate:[-2.68,42.79]}
    ];
    svg.append('g').attr('class','self-consumption-territory-labels').selectAll('text').data(labels).join('text').attr('x',d=>projection(d.coordinate)[0]).attr('y',d=>projection(d.coordinate)[1]).attr('text-anchor','middle').text(d=>d.label);
    const legend=document.createElement('div');legend.className='self-consumption-solar-legend';legend.innerHTML=`<span><i></i>${formatNumber(solarFeatures.length,0)} instalaciones de autoconsumo con excedentes</span><span>ESIOS no desglosa cuánto se autoconsume y cuánto se vierte</span>`;host.append(legend);
    const totalContext=document.createElement('aside');
    totalContext.className='self-consumption-total-context';
    totalContext.innerHTML=`
      <div class="self-consumption-total-figures" aria-label="Total aproximado del autoconsumo en Euskadi al cierre de 2025">
        <span><strong>Más de 8.000</strong><small>instalaciones de autoconsumo en Euskadi</small></span>
        <span><strong>192–193 MW</strong><small>potencia instalada al cierre de 2025</small></span>
      </div>
      <p><strong>Este mapa no es el censo completo del autoconsumo vasco.</strong> Los ${formatNumber(solarFeatures.length,0)} puntos mostrados son únicamente los candidatos cartografiables obtenidos del inventario ESIOS después de retirar solapes con la capa EVE y los seis registros de mayor potencia, que por su escala resultan poco plausibles como autoconsumo. La última cifra oficial publicada por el EVE indica que al cierre de 2025 operaban en Euskadi <strong>más de 8.000 instalaciones de autoconsumo</strong>, con aproximadamente <strong>192–193 MW instalados</strong>, frente a solo 7 MW en 2020 (EVE, 2026). Es el número de instalaciones, no necesariamente el de consumidores: una instalación de autoconsumo colectivo puede abastecer a varias viviendas, empresas o edificios públicos. En julio de 2026 el Gobierno Vasco mantuvo 193 MW como cifra consolidada de 2025 y comunicó otros <strong>72,5 MW de proyectos recientemente aprobados</strong>, pero no publicó un recuento exacto actualizado de instalaciones; por eso «más de 8.000» sigue siendo el último total público verificado (Gobierno Vasco, 2026). Los puntos amarillos sirven para mostrar la distribución territorial disponible, pero <strong>no deben interpretarse como el número total ni como una muestra estadística completa</strong>.</p>`;
    host.append(totalContext);
    const selfConsumptionCapacityHistoryMW=window.selfConsumptionCapacityHistoryMW||[[2020,7],[2021,26],[2022,38.5],[2023,84.7],[2024,147.7],[2025,192]];
    const observedAnnualAdditions=selfConsumptionCapacityHistoryMW.slice(1).map((item,index)=>({year:item[0],mw:item[1]-selfConsumptionCapacityHistoryMW[index][1]}));
    const rooftopTechnicalPotentialMW=1600,centralPotentialEnvelopeMW=1800,upperPotentialEnvelopeMW=2000,publicReference2025=193,publicReference2030=493;
    const buildSaturationScenario=potentialMW=>{
      const coefficient=-Math.log((potentialMW-publicReference2030)/(potentialMW-publicReference2025))/5;
      const capacity=year=>year<=2025?publicReference2025:potentialMW-(potentialMW-publicReference2025)*Math.exp(-coefficient*(year-2025));
      const annual=Array.from({length:25},(_,index)=>{
        const year=2026+index;
        return{year,mw:capacity(year)-capacity(year-1),capacity:capacity(year)};
      });
      return{potentialMW,coefficient,capacity,annual};
    };
    const lowerSaturation=buildSaturationScenario(rooftopTechnicalPotentialMW),centralSaturation=buildSaturationScenario(centralPotentialEnvelopeMW),upperSaturation=buildSaturationScenario(upperPotentialEnvelopeMW);
    const saturationAnnualAdditions=centralSaturation.annual,saturationCapacity2050=centralSaturation.capacity(2050),saturationShare2050=100*saturationCapacity2050/centralPotentialEnvelopeMW;
    const regressionX=observedAnnualAdditions.map((_,index)=>index),regressionY=observedAnnualAdditions.map(item=>item.mw),regressionN=regressionX.length,regressionSumX=regressionX.reduce((sum,value)=>sum+value,0),regressionSumY=regressionY.reduce((sum,value)=>sum+value,0),regressionSumXX=regressionX.reduce((sum,value)=>sum+value*value,0),regressionSumXY=regressionX.reduce((sum,value,index)=>sum+value*regressionY[index],0),regressionSlope=(regressionN*regressionSumXY-regressionSumX*regressionSumY)/(regressionN*regressionSumXX-regressionSumX*regressionSumX),regressionIntercept=(regressionSumY-regressionSlope*regressionSumX)/regressionN;
    const rejectedLinearAcceleration=Array.from({length:25},(_,index)=>regressionIntercept+regressionSlope*(5+index));
    const rejectedCapacity2050=192+rejectedLinearAcceleration.reduce((sum,value)=>sum+value,0),rejectedRate2050=rejectedLinearAcceleration.at(-1);
    const rateChart=document.createElement('section');
    rateChart.className='self-consumption-installation-rate';
    const rateWidth=920,rateHeight=390,rateMargin={top:42,right:34,bottom:48,left:64},ratePlotWidth=rateWidth-rateMargin.left-rateMargin.right,ratePlotHeight=rateHeight-rateMargin.top-rateMargin.bottom,rateYMax=80,rateX=year=>rateMargin.left+(year-2021)/(2050-2021)*ratePlotWidth,rateY=value=>rateMargin.top+(rateYMax-value)/rateYMax*ratePlotHeight,rateBarWidth=Math.min(22,ratePlotWidth/29*.68),rateTicks=[0,20,40,60,80];
    const rateGrid=rateTicks.map(value=>`<line class="self-consumption-rate-grid" x1="${rateMargin.left}" x2="${rateWidth-rateMargin.right}" y1="${rateY(value)}" y2="${rateY(value)}"/><text class="self-consumption-rate-label" x="${rateMargin.left-10}" y="${rateY(value)+4}" text-anchor="end">${formatNumber(value,0)}</text>`).join('');
    const rateBars=observedAnnualAdditions.map(item=>`<rect x="${rateX(item.year)-rateBarWidth/2}" y="${rateY(item.mw)}" width="${rateBarWidth}" height="${rateHeight-rateMargin.bottom-rateY(item.mw)}" rx="3" fill="#e69f00" stroke="#ca8500" stroke-width="1"/><text class="self-consumption-rate-value" x="${rateX(item.year)}" y="${rateY(item.mw)-7}" text-anchor="middle">${formatNumber(item.mw,1)}</text>`).join('');
    const rateProjectionBand=[...upperSaturation.annual,...lowerSaturation.annual.slice().reverse()].map((item,index)=>`${index?'L':'M'} ${rateX(item.year)} ${rateY(item.mw)}`).join(' ')+' Z';
    const rateProjectionPath=[observedAnnualAdditions.at(-1),...saturationAnnualAdditions].map((item,index)=>`${index?'L':'M'} ${rateX(item.year)} ${rateY(item.mw)}`).join(' ');
    const rateProjectionKeyYears=new Set([2030,2040,2050]);
    const rateProjectionDots=saturationAnnualAdditions.filter(item=>rateProjectionKeyYears.has(item.year)).map(item=>`<circle class="self-consumption-rate-projection-dot" cx="${rateX(item.year)}" cy="${rateY(item.mw)}" r="4"/><text class="self-consumption-rate-value" x="${rateX(item.year)}" y="${rateY(item.mw)-10}" text-anchor="middle">${formatNumber(item.mw,0)}</text>`).join('');
    const rateYearLabels=[2021,2025,2030,2035,2040,2045,2050].map(year=>`<text class="self-consumption-rate-year" x="${rateX(year)}" y="${rateHeight-rateMargin.bottom+22}" text-anchor="middle">${year}</text>`).join('');
    const rateProjectionStart=(rateX(2025)+rateX(2026))/2;
    rateChart.innerHTML=`
      <h3>Ritmo de instalación del autoconsumo</h3>
      <p class="self-consumption-installation-rate-lead">La potencia creció desde 7 MW en 2020 hasta 192–193 MW en 2025. Las barras muestran la incorporación histórica anual. La línea verde ya no prolonga indefinidamente esa aceleración: alcanza la referencia pública de 493 MW en 2030 y después reduce gradualmente el ritmo conforme se ocupan primero los emplazamientos más sencillos. La banda incorpora que el autoconsumo también puede instalarse en suelo vinculado al consumo, marquesinas y otros espacios artificializados.</p>
      <div class="self-consumption-rate-legend" aria-hidden="true"><span><i></i>Incorporación histórica reconstruida</span><span class="is-projection"><i></i>Senda central con saturación</span><span class="is-range"><i></i>Sensibilidad del potencial total: 1.600–2.000 MW</span></div>
      <div class="self-consumption-rate-chart">
        <svg viewBox="0 0 ${rateWidth} ${rateHeight}" role="img" aria-label="Ritmo anual de instalación de autoconsumo en Euskadi. Histórico reconstruido entre 2021 y 2025 y proyección con saturación gradual de cubiertas, suelo vinculado al consumo, marquesinas y espacios artificializados entre 2026 y 2050, en megavatios por año.">
          ${rateGrid}
          <line class="self-consumption-rate-axis" x1="${rateMargin.left}" x2="${rateMargin.left}" y1="${rateMargin.top}" y2="${rateHeight-rateMargin.bottom}"/>
          <line class="self-consumption-rate-axis" x1="${rateMargin.left}" x2="${rateWidth-rateMargin.right}" y1="${rateHeight-rateMargin.bottom}" y2="${rateHeight-rateMargin.bottom}"/>
          <text class="self-consumption-rate-label" x="${rateMargin.left}" y="18">Nueva potencia · MW/año</text>
          <line class="self-consumption-rate-axis" x1="${rateProjectionStart}" x2="${rateProjectionStart}" y1="${rateMargin.top}" y2="${rateHeight-rateMargin.bottom}" stroke-dasharray="3 4"/>
          <text class="self-consumption-rate-label" x="${rateProjectionStart-8}" y="${rateMargin.top+13}" text-anchor="end">Histórico</text>
          <text class="self-consumption-rate-label" x="${rateProjectionStart+8}" y="${rateMargin.top+13}">Proyección</text>
          ${rateBars}
          <path class="self-consumption-rate-band" d="${rateProjectionBand}"/>
          <path class="self-consumption-rate-projection" d="${rateProjectionPath}"/>
          ${rateProjectionDots}
          ${rateYearLabels}
        </svg>
      </div>
      <div class="self-consumption-rate-summary">
        <article><strong>192–193 MW · 2025</strong><span>Alrededor del 12 % del potencial oficial estimado solo en cubiertas.</span></article>
        <article><strong>493 MW · 2030</strong><span>Referencia pública: 300 MW adicionales; cerca del 31 % del potencial de cubiertas.</span></article>
        <article><strong>1.600 MW + suelo</strong><span>1.600 MW es el potencial de cubiertas; el autoconsumo en suelo y marquesinas lo amplía.</span></article>
        <article><strong>≈ ${formatNumber(saturationCapacity2050,0)} MW · 2050</strong><span>Senda central; sensibilidad de ${formatNumber(lowerSaturation.capacity(2050),0)} a ${formatNumber(upperSaturation.capacity(2050),0)} MW.</span></article>
        <article><strong>≈ ${formatNumber(saturationAnnualAdditions.at(-1).mw,0)} MW/año · 2050</strong><span>El ritmo disminuye; no sigue acelerándose indefinidamente.</span></article>
      </div>
      <section class="self-consumption-potential-audit" aria-labelledby="self-consumption-potential-title">
        <h4 id="self-consumption-potential-title">Auditoría del potencial: espacio físico no equivale a potencia que se instalará</h4>
        <div class="self-consumption-potential-audit-grid">
          <article><strong>Cubiertas · 1.600 MW</strong><p>Es la estimación oficial del PTS para tejados. Incluye un recurso técnico, no una cartera de proyectos ni una garantía de ejecución.</p></article>
          <article><strong>Suelo y marquesinas · sin censo agregado</strong><p>Urrestilla y la planta agrovoltaica de Arkaute muestran que el autoconsumo también puede ocupar suelo. El PTS admite este uso en gran parte del suelo no urbanizable, pero no publica un total vasco equivalente en MW.</p></article>
          <article><strong>Uso · límite técnico-económico</strong><p>Orientación, estructura, propiedad, inversión, coincidencia entre sol y demanda, conexión y aceptación territorial reducen la parte que acabará instalándose.</p></article>
        </div>
        <div class="self-consumption-potential-scale" aria-label="La senda central alcanza el ${formatNumber(saturationShare2050,0)} por ciento de una envolvente analítica de 1.800 megavatios en 2050"><span style="--potential-share:${saturationShare2050}%"></span></div>
        <div class="self-consumption-potential-scale-labels"><span>≈ ${formatNumber(saturationCapacity2050,0)} MW modelizados en 2050</span><span>1.800 MW · envolvente central</span></div>
        <p class="self-consumption-potential-note"><strong>La envolvente de 1.800 MW es una hipótesis, no un dato oficial:</strong> toma los 1.600 MW de cubiertas del PTS y añade un margen del 12,5 % para suelo vinculado al consumo, marquesinas y espacios artificializados. La banda prueba un rango de 1.600–2.000 MW. Un inventario georreferenciado de cubiertas, parcelas próximas y perfiles de consumo permitiría sustituir esta sensibilidad por una capacidad contrastada (Gobierno Vasco, 2023, 2025, 2026).</p>
      </section>
      <p class="self-consumption-rate-warning"><strong>Se descarta la antigua extrapolación lineal acelerada.</strong> Habría llevado a unos ${formatNumber(rejectedRate2050,0)} MW nuevos solo en 2050 y a cerca de ${formatNumber(rejectedCapacity2050,0)} MW acumulados: más de tres veces el potencial oficial de cubiertas y muy por encima incluso de la sensibilidad que añade instalaciones fuera de tejado. Mantener 60 MW cada año hasta 2050 daría unos 1.693 MW: no es físicamente imposible si crece el suelo de autoconsumo, pero exigiría aprovechar casi toda la cubierta estimada o sustituir una parte importante por suelo y marquesinas.</p>
      <p class="self-consumption-rate-method"><strong>Cómo se calcula la nueva senda.</strong> La reconstrucción histórica enlaza los hitos oficiales: 26 MW acumulados al terminar 2021; 12,5 MW incorporados en 2022; 46,2 MW en 2023; unos 148 MW acumulados en 2024; y 192–193 MW al cierre de 2025. La proyección se calibra para alcanzar los 493 MW anunciados para 2030 y, desde ahí, adopta una curva de saturación. La senda central usa una envolvente analítica de 1.800 MW; la banda prueba 1.600 MW —solo cubiertas— y 2.000 MW —mayor aportación de suelo, marquesinas y espacios artificializados—. El resultado central se aproxima a ${formatNumber(saturationCapacity2050,0)} MW en 2050 y reduce el ritmo anual desde unos ${formatNumber(saturationAnnualAdditions.find(item=>item.year===2030).mw,0)} MW en 2030 hasta ${formatNumber(saturationAnnualAdditions.at(-1).mw,0)} MW en 2050. Es una estimación transparente de despliegue, no una previsión oficial (EVE, 2022, 2024, 2026; Gobierno Vasco, 2023, 2025, 2026; MITECO, 2021).</p>`;
    host.append(rateChart);
    const arasur=installations.features.find(feature=>Number(feature.id)===2582);
    const solarEquivalentHours=1400,arasurAnnualGWh=40,basqueSelfConsumptionGeneration2025GWh=255;
    const selfConsumptionMW=solarFeatures.reduce((sum,feature)=>sum+(Number(feature.properties?.mw)||0),0);
    const selfConsumptionGWh=selfConsumptionMW*solarEquivalentHours/1000;
    const smallEveSolar=installations.features
      .filter(feature=>feature.properties?.tecnologia==='Fotovoltaica'&&feature.properties?.fuente==='Datos proporcionados por EVE'&&Number(feature.id)!==2582)
      .sort((a,b)=>(Number(a.properties?.mw)||0)-(Number(b.properties?.mw)||0));
    const selectedSmallEve=[];let equivalentGWh=selfConsumptionGWh;
    for(const feature of smallEveSolar){
      if(equivalentGWh>=arasurAnnualGWh)break;
      selectedSmallEve.push(feature);
      equivalentGWh+=Number(feature.properties?.annualGWhEstimate)||(Number(feature.properties?.mw)||0)*solarEquivalentHours/1000;
    }
    const selectedSmallEveIds=new Set(selectedSmallEve.map(feature=>feature.id));
    const equivalent=document.createElement('section');
    equivalent.className='arasur-equivalence';
    equivalent.innerHTML=`
      <h3>¿Cuántas instalaciones pequeñas hacen falta para producir como Arasur 1?</h3>
      <p class="arasur-equivalence-lead">La comparación conserva la producción publicada de Arasur 1 —aproximadamente 40 GWh/año— y aplica a los puntos de autoconsumo el estimador homogéneo del modelo. Como los ${formatNumber(solarFeatures.length,0)} puntos candidatos aportan ${formatNumber(selfConsumptionGWh,1)} GWh/año, se añaden de menor a mayor ${formatNumber(selectedSmallEve.length,0)} instalaciones de la capa «Solar a red · declarado por EVE» hasta alcanzar el equivalente.</p>
      <div class="arasur-equivalence-grid">
        <figure class="arasur-equivalence-card is-arasur" data-capture="arasur-1">
          <header><span>Una gran instalación</span><strong>Arasur 1 · 40 GWh/año</strong><small>24 MW · más de 67.000 paneles · producción publicada por EVE</small></header>
          <div class="arasur-equivalence-visual">
            <div class="arasur-equivalence-map"></div>
            <figure class="arasur-equivalence-photo"><img src="assets/photos/installations/ekian-arasur.webp" loading="lazy" decoding="async" alt="Vista aérea del parque solar fotovoltaico Ekian en Arasur"><figcaption><strong>Arasur 1 / Ekian.</strong> Fotografía asociada al punto del mapa. Fuente: EVE.</figcaption></figure>
          </div>
          <p><strong>Lectura:</strong> un solo punto representa una planta de gran escala cuya producción anual publicada sirve como referencia de la comparación.</p>
        </figure>
        <figure class="arasur-equivalence-card is-equivalent" data-capture="equivalente-arasur">
          <header><span>Conjunto equivalente</span><strong>${formatNumber(solarFeatures.length+selectedSmallEve.length,0)} instalaciones · ${formatNumber(equivalentGWh,1)} GWh/año</strong><small>${formatNumber(solarFeatures.length,0)} puntos candidatos de autoconsumo + ${formatNumber(selectedSmallEve.length,0)} instalaciones pequeñas EVE</small></header>
          <div class="arasur-equivalence-visual">
            <div class="arasur-equivalence-map"></div>
            <div class="arasur-autoconsumption-mural" aria-label="Mural de las mejores fotografías disponibles de autoconsumo solar">
              <figure><img src="assets/photos/installations/ekindar-azpeitia-urrestilla.webp" loading="lazy" decoding="async" alt="Vista aérea de la planta solar Ekindar en Urrestilla, Azpeitia"><figcaption>Ekindar Azpeitia · comunidad energética local</figcaption></figure>
              <figure><img src="assets/photos/installations/beasain-antzizar-autoconsumo.png" loading="lazy" decoding="async" alt="Instalación fotovoltaica de autoconsumo del polideportivo Antzizar en Beasain"><figcaption>Antzizar · autoconsumo municipal documentado</figcaption></figure>
              <figure><img src="assets/photos/self-consumption/solar-industrial-rooftop.jpg" loading="lazy" decoding="async" alt="Paneles solares en una cubierta industrial"><figcaption>Cubierta industrial · imagen representativa</figcaption></figure>
              <figure><img src="assets/photos/self-consumption/solar-rooftop-installation.jpg" loading="lazy" decoding="async" alt="Paneles solares en una cubierta residencial"><figcaption>Cubierta residencial · imagen representativa</figcaption></figure>
            </div>
          </div>
          <div class="arasur-equivalence-legend"><span><i style="--dot-color:#f0c419"></i>${formatNumber(solarFeatures.length,0)} puntos candidatos de autoconsumo</span><span><i style="--dot-color:#e76f51"></i>${formatNumber(selectedSmallEve.length,0)} solares pequeñas EVE añadidas</span></div>
          <p><strong>Resultado:</strong> con ${formatNumber(Math.max(0,selectedSmallEve.length-1),0)} instalaciones EVE el conjunto todavía queda por debajo de Arasur; al añadir la número ${formatNumber(selectedSmallEve.length,0)} alcanza ${formatNumber(equivalentGWh,1)} GWh/año. La suma discreta rebasa ligeramente los 40 GWh/año.</p>
        </figure>
      </div>
      <p class="arasur-total-equivalence"><strong>${formatNumber(basqueSelfConsumptionGeneration2025GWh/arasurAnnualGWh,1)} × Arasur 1</strong><span>Todo el autoconsumo fotovoltaico de Euskadi generó 255 GWh en 2025: aproximadamente la misma energía anual que ${formatNumber(basqueSelfConsumptionGeneration2025GWh/arasurAnnualGWh,1)} plantas Arasur 1 de 40 GWh/año.</span><small>Equivalencia energética orientativa; no compara potencia, superficie ni perfil horario.</small></p>`;
    host.append(equivalent);
    const comparisonProjection=d3.geoMercator().fitExtent([[24,22],[430,263]],mapTerritories);
    const comparisonPath=d3.geoPath(comparisonProjection);
    const drawBaseMap=target=>{
      const map=d3.select(target).append('svg').attr('viewBox','0 0 455 285').attr('role','img');
      map.append('rect').attr('width',455).attr('height',285).attr('fill','#edf7fb');
      if(mapSurroundings)map.append('g').selectAll('path').data(mapSurroundings.features).join('path').attr('d',comparisonPath).attr('fill','#f3f0ea').attr('stroke','#ddd9d2').attr('stroke-width',.8);
      map.append('g').selectAll('path').data(mapTerritories.features).join('path').attr('d',comparisonPath).attr('fill','#d7ead3').attr('stroke','#fff').attr('stroke-width',1.5);
      if(mapMunicipalities)map.append('g').selectAll('path').data(mapMunicipalities.features).join('path').attr('d',comparisonPath).attr('fill','none').attr('stroke','#fff').attr('stroke-width',.35);
      map.append('path').datum(mapTerritories).attr('d',comparisonPath).attr('fill','none').attr('stroke','#71877f').attr('stroke-width',1);
      return map;
    };
    const arasurMap=drawBaseMap(equivalent.querySelector('.is-arasur .arasur-equivalence-map')).attr('aria-label','Mapa de Euskadi con el punto de Arasur 1 destacado');
    if(arasur){
      const [x,y]=comparisonProjection(arasur.geometry.coordinates);
      arasurMap.append('circle').attr('class','arasur-point-halo').attr('cx',x).attr('cy',y).attr('r',13);
      arasurMap.append('circle').attr('class','arasur-point-core').attr('cx',x).attr('cy',y).attr('r',6);
      arasurMap.append('text').attr('class','equivalence-callout').attr('x',x+17).attr('y',y-8).text('ARASUR 1');
      arasurMap.append('text').attr('class','equivalence-map-label').attr('x',x+17).attr('y',y+8).text('40 GWh/año');
    }
    const equivalentMap=drawBaseMap(equivalent.querySelector('.is-equivalent .arasur-equivalence-map')).attr('aria-label',`Mapa de Euskadi con ${solarFeatures.length} puntos candidatos de autoconsumo y ${selectedSmallEve.length} instalaciones solares pequeñas EVE`);
    equivalentMap.append('g').selectAll('circle').data(solarFeatures).join('circle').attr('class','equivalent-self-point').attr('cx',feature=>comparisonProjection(feature.geometry.coordinates)[0]).attr('cy',feature=>comparisonProjection(feature.geometry.coordinates)[1]).attr('r',1.75).attr('opacity',.82);
    equivalentMap.append('g').selectAll('circle').data(selectedSmallEve).join('circle').attr('class','equivalent-eve-point').attr('cx',feature=>comparisonProjection(feature.geometry.coordinates)[0]).attr('cy',feature=>comparisonProjection(feature.geometry.coordinates)[1]).attr('r',4.2);
    equivalentMap.append('text').attr('class','equivalence-callout').attr('x',22).attr('y',24).text(`${formatNumber(solarFeatures.length+selectedSmallEve.length,0)} instalaciones`);
    equivalentMap.append('text').attr('class','equivalence-map-label').attr('x',22).attr('y',42).text(`${formatNumber(equivalentGWh,1)} GWh/año`);
  };

  window.renderEnergyInstallationsMap=(row,cfg)=>{
    row.classList.add('territory-row');
    const installations=window.energyMapReeInstallations,territories=window.energyMapTerritories,municipalities=window.energyMapMunicipalities,populations=window.energyMapPopulations,highVoltage=window.energyMapHighVoltage,substations=window.energyMapSubstations,surroundings=window.energyMapSurroundingRegions,biscayInterconnector=window.energyMapBiscayInterconnector,electricProjects=window.energyMapElectricProjects,generationProjects=window.energyMapGenerationProjects,generationPipeline=window.energyMapGenerationPipeline,ptsPotentialSites=window.energyMapPtsPotentialSites,nonElectricInfrastructure=window.energyMapNonElectricInfrastructure,electricStorage=window.energyMapElectricStorage;
    const host=row.querySelector('.territory-map-host')||row,shell=document.createElement('div');shell.className='territory-map-shell';if(cfg.onlyStorage)shell.classList.add('is-storage-focus');if(cfg.onlyOffshoreWind)shell.classList.add('is-offshore-wind-focus');host.append(shell);
    const mapInstanceId=`energy-map-${++energyMapInstanceCounter}`,patternId=name=>`${mapInstanceId}-${name}`,patternUrl=name=>`url(#${patternId(name)})`;
    if(!window.d3||!installations?.features?.length||!territories?.features?.length){
      shell.innerHTML='<p class="map-error"><strong>No se ha podido cargar el mapa.</strong> Los datos permanecen disponibles en la fuente oficial enlazada al final del indicador.</p>';
      return;
    }
    const mapTerritories=d3WindingCollection(territories),mapMunicipalities=municipalities?.features?.length?d3WindingCollection(municipalities):null,mapSubstations=substations?.features?.length?d3WindingCollection(substations):null,mapSurroundings=surroundings?.features?.length?surroundings:null;
    const allGridFeatures=highVoltage?.features||[];
    const highVoltageFeatures=allGridFeatures.filter(feature=>['220 kV','400 kV'].includes(feature.properties?.VTENS_0116)&&!isLegacyGatikaLemoiz(feature));
    const local132Features=allGridFeatures.filter(feature=>feature.properties?.VTENS_0116==='132 kV');
    const biscayFeatures=biscayInterconnector?.features||[],biscayMetadata=biscayInterconnector?.metadata||{},projectDefinitions=electricProjects?.projects||[],allGenerationProjectDefinitions=generationProjects?.projects||[],pipelineProjectDefinitions=generationPipeline?.projects||[],basePtsPotentialDefinitions=ptsPotentialSites?.sites||[],nonElectricRouteDefinitions=nonElectricInfrastructure?.routes||[],nonElectricFacilityDefinitions=nonElectricInfrastructure?.facilities||[],nonElectricCategories=nonElectricInfrastructure?.categories||{},importOrigins=nonElectricInfrastructure?.importOrigins||null,renewableImportOrigins=nonElectricInfrastructure?.renewableImportOrigins||null,storageDefinitions=electricStorage?.facilities||[];
    const marinePrototypeIds=new Set(['achieve-ceto','marmok-a5-2026']);
    const marinePrototypeDefinitions=allGenerationProjectDefinitions.filter(project=>marinePrototypeIds.has(project.id)).map(project=>({
      ...project,
      isMarinePrototype:true,
      modelExcluded:true,
      potentialMW:Number(project.mw)||0,
      technologyLabel:'Prototipo undimotriz',
      annualGWhEstimate:0,
      annualGWhMethod:'Prototipo experimental: no se incorpora al balance ni a las proyecciones.',
      photoSrc:project.id==='marmok-a5-2026'?'assets/photos/installations/marmok-a5-bimep-eve.jpg?v=20260729':'assets/photos/installations/achieve-ceto-bimep.jpg?v=20260729',
      photoAlt:project.id==='marmok-a5-2026'?'Dispositivo undimotriz flotante MARMOK-A-5 de IDOM en BiMEP':'Representación del dispositivo undimotriz CETO del programa ACHIEVE en BiMEP',
      photoCaption:project.id==='marmok-a5-2026'?'MARMOK-A-5 en el área de ensayos BiMEP. Imagen cedida por EVE.':'ACHIEVE CETO: emplazamiento y tecnología previstos para el ensayo en BiMEP. BiMEP / Carnegie Clean Energy.'
    }));
    const generationProjectDefinitions=allGenerationProjectDefinitions.filter(project=>!marinePrototypeIds.has(project.id));
    const ptsPotentialDefinitions=[...basePtsPotentialDefinitions,...marinePrototypeDefinitions];
    const isSubstationProject=project=>String(project?.kind||'').toLocaleLowerCase('es').includes('subestación');
    const isNewSubstationProject=project=>isSubstationProject(project)&&String(project?.kind||'').trim().startsWith('Subestación');

    const focusedTechnologyKey=TECHNOLOGIES[cfg.onlyTechnology]?cfg.onlyTechnology:null,onlyEveSolar=Boolean(cfg.onlyEveSolar),showBothSolar=Boolean(cfg.showBothSolar),substationFocus=Boolean(cfg.onlySubstations),storageFocus=Boolean(cfg.onlyStorage),offshoreWindFocus=Boolean(cfg.onlyOffshoreWind),usesEveSolarLayer=!substationFocus&&!storageFocus&&!offshoreWindFocus&&(!focusedTechnologyKey||focusedTechnologyKey==='solar');
    const installationFeatures=installations.features;
    const records=(substationFocus||storageFocus||offshoreWindFocus?[]:installationFeatures).map(feature=>{
      const properties=feature.properties||{},mw=Number(properties.mw)||0,units=Math.max(1,Number(properties.numero)||1);
      const key=keyForTechnology(properties.tecnologia),layerKey=TECHNOLOGIES[properties.mapLayerKey]?properties.mapLayerKey:key,cogenEvidence=key==='cogen'?cogenFuelEvidenceForName(properties.descripcion):null;
      const isEveSolar=key==='solar'&&properties.fuente==='Datos proporcionados por EVE',isEsiosSolar=key==='solar'&&!isEveSolar&&!Boolean(properties.excludeFromEsiosExportEstimate);
      return{feature,properties,mw,units,key,layerKey,isEveSolar,isEsiosSolar,isDocumentedSelfConsumption:Boolean(properties.documentedSelfConsumption),informationalPrototype:Boolean(properties.informationalPrototype),cogenFuelClass:cogenEvidence?.fuelClass||null,cogenEvidence,coordinate:feature.geometry.coordinates};
    });
    const eveSolarRecords=records.filter(record=>record.isEveSolar),eveSolarMW=eveSolarRecords.reduce((sum,record)=>sum+record.mw,0),selfConsumptionRecords=records.filter(record=>record.layerKey==='solar'&&!record.isEveSolar),esiosSolarRecords=selfConsumptionRecords.filter(record=>record.isEsiosSolar),esiosSolarMW=esiosSolarRecords.reduce((sum,record)=>sum+record.mw,0),eveSolarEstimatedGWh=eveSolarMW*SOLAR_MODEL_EQUIVALENT_HOURS/1000,esiosSolarEstimatedGWh=esiosSolarMW*SOLAR_MODEL_EQUIVALENT_HOURS/1000,esiosSolarEstimatedInjectedGWh=esiosSolarEstimatedGWh*ESIOS_SOLAR_EXPORT_SHARE;
    const recordInScope=record=>(!focusedTechnologyKey||record.layerKey===focusedTechnologyKey)&&(!onlyEveSolar||record.isEveSolar),mapRecords=records.filter(recordInScope);
    const totals=mapRecords.reduce((acc,d)=>({points:acc.points+1,units:acc.units+d.units,mw:acc.mw+d.mw}),{points:0,units:0,mw:0});
    const metadata=TECHNOLOGY_ORDER.map(key=>{
      const subset=mapRecords.filter(d=>d.layerKey===key&&!(usesEveSolarLayer&&d.isEveSolar));
      const label=key==='solar'&&onlyEveSolar?'Solar a red · listado EVE':TECHNOLOGIES[key].label;
      return{key,...TECHNOLOGIES[key],label,points:subset.length,units:subset.reduce((a,d)=>a+d.units,0),mw:subset.reduce((a,d)=>a+d.mw,0)};
    });

    const toolbar=document.createElement('div');toolbar.className='map-toolbar';
    const filters=document.createElement('div');filters.className='map-filter-list';filters.setAttribute('role','group');filters.setAttribute('aria-label','Capas y filtros del mapa energético');
    const count=document.createElement('p');count.className='map-visible-count';count.setAttribute('aria-live','polite');toolbar.append(filters,count);shell.append(toolbar);

    const layout=document.createElement('div');layout.className='territory-map-layout';
    const scenarioYear=Number(cfg.scenarioYear)||2024,isNormativeScenario=['normative','normative-imported'].includes(cfg.scenario),isTendentialScenario=cfg.scenario==='tendential',timelineStart=cfg.animationStart||null,timelineEnabled=cfg.scenario==='normative'&&Boolean(timelineStart),electricShare=Math.min(100,Math.max(0,Number(cfg.electricShare2024)||24.837)),nonElectricShare=100-electricShare,electricEnergy=Math.max(0,Number(cfg.electricEnergy2024)||13208),finalEnergy=Math.max(electricEnergy,Number(cfg.finalEnergy2024)||53178),renewableFuelEnergy=Math.max(0,Number(cfg.renewableFuelEnergy2024)||865.4),biomassEnergy=Math.max(0,Number(cfg.biomassEnergy2024)||2413.1),renewableHeatEnergy=Math.max(0,Number(cfg.renewableHeatEnergy2024)||0),renewableFuelShare=finalEnergy?100*renewableFuelEnergy/finalEnergy:0,biomassShare=finalEnergy?100*biomassEnergy/finalEnergy:0,renewableHeatShare=finalEnergy?100*renewableHeatEnergy/finalEnergy:0,directRenewableShareWithinNonElectric=nonElectricShare?100*(renewableFuelShare+biomassShare+renewableHeatShare)/nonElectricShare:0,importRenewableShare=Math.min(100,Math.max(0,Number(cfg.importRenewableShare2024)||58.953)),importNonRenewableShare=100-importRenewableShare,deliveryFactor=Math.max(0,Number(cfg.electricDeliveryFactor2024)||1),generationByTechnology=cfg.generationByTechnology2024||{},allowExploratoryGenerationLayers=Boolean(cfg.allowExploratoryGenerationLayers),generationExpansionIncludedInBase=Boolean(cfg.generationExpansionIncludedInBase)&&!allowExploratoryGenerationLayers,modelledGatewayFlows=cfg.importGatewayFlows||null;
    const configuredRenewableBiofuel=Number(cfg.renewableBiofuelEnergy2024),renewableBiofuelEnergy=Math.min(renewableFuelEnergy,Math.max(0,Number.isFinite(configuredRenewableBiofuel)?configuredRenewableBiofuel:renewableFuelEnergy)),greenHydrogenSyntheticEnergy=Math.max(0,renewableFuelEnergy-renewableBiofuelEnergy),renewableBiofuelShare=finalEnergy?100*renewableBiofuelEnergy/finalEnergy:0,greenHydrogenSyntheticShare=finalEnergy?100*greenHydrogenSyntheticEnergy/finalEnergy:0;
    const cogenCapacityByFuelClass=Object.fromEntries(COGEN_FUEL_CLASS_ORDER.map(fuelClass=>[fuelClass,records.filter(record=>record.key==='cogen'&&record.cogenFuelClass===fuelClass).reduce((sum,record)=>sum+record.mw,0)])),cogenCapacityTotal=Object.values(cogenCapacityByFuelClass).reduce((sum,value)=>sum+value,0),cogenGenerationTotal=Math.max(0,Number(generationByTechnology.cogen)||0),cogenEnergyPerMW=cogenCapacityTotal?cogenGenerationTotal/cogenCapacityTotal:0,cogenEnergyByFuelClass=Object.fromEntries(COGEN_FUEL_CLASS_ORDER.map(fuelClass=>[fuelClass,cogenCapacityTotal?cogenGenerationTotal*cogenCapacityByFuelClass[fuelClass]/cogenCapacityTotal:0]));
    const cogenEstimatedRenewableWithinFossil=records.filter(record=>record.key==='cogen'&&record.cogenFuelClass==='fossil').reduce((sum,record)=>{const allocatedEnergy=record.mw*cogenEnergyPerMW,publishedEnergy=Number(record.cogenEvidence?.renewableAnnualGWh),renewableShare=Math.min(1,Math.max(0,Number(record.cogenEvidence?.renewableShare)||0));return sum+(Number.isFinite(publishedEnergy)&&publishedEnergy>0?Math.min(allocatedEnergy,publishedEnergy):allocatedEnergy*renewableShare)},0);
    const barGenerationByTechnology={cycle:(Number(generationByTechnology.cycle)||0)+cogenEnergyByFuelClass.fossil,cogenRenewable:cogenEnergyByFuelClass.renewable,cogenMixed:cogenEnergyByFuelClass.mixed,cogenUnverified:cogenEnergyByFuelClass.unverified,hydro:Number(generationByTechnology.hydro)||0,wind:Number(generationByTechnology.wind)||0,solar:Number(generationByTechnology.solar)||0,other:Number(generationByTechnology.other)||0};
    if(cfg.targetGenerationByTechnology&&Number(cfg.targetLocatedOtherGeneration)>=0)barGenerationByTechnology.cogenRenewable=Math.max(barGenerationByTechnology.cogenRenewable,(Number(cfg.targetGenerationByTechnology.other)||0)-Number(cfg.targetLocatedOtherGeneration));
    const ownRenewableElectricityKeys=['cogenRenewable','hydro','wind','solar','other'],barTechnologyKeys=['cycle','cogenMixed','cogenUnverified',...ownRenewableElectricityKeys].filter(key=>Number(barGenerationByTechnology[key])>0),barTechnologyEnergy=Object.fromEntries(barTechnologyKeys.map(key=>[key,Number(barGenerationByTechnology[key])*deliveryFactor]));
    const operatingCapacityByTechnology=Object.fromEntries(metadata.map(item=>[item.key,item.mw]));if(usesEveSolarLayer)operatingCapacityByTechnology.solar=eveSolarMW;
    const smallCapacityByTechnology=Object.fromEntries(TECHNOLOGY_ORDER.map(key=>[key,records.filter(record=>record.key===key&&record.mw<.1).reduce((sum,record)=>sum+record.mw,0)])),futureCapacityByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,generationProjectDefinitions.filter(project=>project.technology===key).reduce((sum,project)=>sum+(Number(project.mw)||0),0)])),futureProjectCountByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,generationProjectDefinitions.filter(project=>project.technology===key).length])),pipelineCapacityByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,pipelineProjectDefinitions.filter(project=>project.technology===key).reduce((sum,project)=>sum+(Number(project.mw)||0),0)])),pipelineProjectCountByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,pipelineProjectDefinitions.filter(project=>project.technology===key).length])),ptsPotentialCapacityByTechnology=Object.fromEntries(['wind','solar','other'].map(key=>[key,ptsPotentialDefinitions.filter(site=>site.technology===key&&!site.modelExcluded).reduce((sum,site)=>sum+(Number(site.potentialMW)||0),0)]));
    const futureGenerationByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,generationProjectDefinitions.filter(project=>project.technology===key).reduce((sum,project)=>sum+(Number(project.annualGWhEstimate)||0),0)])),futureBarTechnologyEnergy=Object.fromEntries(['wind','solar'].map(key=>[key,futureGenerationByTechnology[key]*deliveryFactor])),pipelineGenerationByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,pipelineProjectDefinitions.filter(project=>project.technology===key).reduce((sum,project)=>sum+(Number(project.annualGWhEstimate)||0),0)])),pipelineBarTechnologyEnergy=Object.fromEntries(['wind','solar'].map(key=>[key,pipelineGenerationByTechnology[key]*deliveryFactor])),offshoreWindPotentialCapacityMW=OFFSHORE_WIND_POST_PTS.reduce((sum,site)=>sum+(Number(site.modelMW)||0),0),offshoreWindPotentialGenerationGWh=OFFSHORE_WIND_POST_PTS.reduce((sum,site)=>sum+(Number(site.annualGWhEstimate)||0),0),offshoreWindPotentialBarEnergy=offshoreWindPotentialGenerationGWh*deliveryFactor,ptsPotentialGenerationByTechnology=Object.fromEntries(['wind','solar','other'].map(key=>[key,ptsPotentialDefinitions.filter(site=>site.technology===key&&!site.modelExcluded).reduce((sum,site)=>sum+(Number(site.annualGWhEstimate)||0),0)])),ptsPublishedFinalShareIncrease={wind:6.5,solar:5},ptsPotentialFinalShareIncreaseByTechnology=Object.fromEntries(['wind','solar','other'].map(key=>{const published=Number(ptsPotentialSites?.totals?.[key]?.finalConsumptionShareIncreasePct);return[key,Number.isFinite(published)&&published>0?published:ptsPublishedFinalShareIncrease[key]]})),ptsPotentialBarTechnologyEnergy=Object.fromEntries(['wind','solar','other'].map(key=>[key,Number.isFinite(ptsPotentialFinalShareIncreaseByTechnology[key])&&ptsPotentialFinalShareIncreaseByTechnology[key]>0?finalEnergy*ptsPotentialFinalShareIncreaseByTechnology[key]/100:ptsPotentialGenerationByTechnology[key]*deliveryFactor]));
    if(cfg.targetGenerationByTechnology){
      const target=cfg.targetGenerationByTechnology;
      ptsPotentialBarTechnologyEnergy.wind=Math.max(0,(Number(target.wind)||0)*deliveryFactor-(barTechnologyEnergy.wind||0));
      ptsPotentialBarTechnologyEnergy.solar=Math.max(0,(Number(target.solar)||0)*deliveryFactor-(barTechnologyEnergy.solar||0));
      ptsPotentialBarTechnologyEnergy.other=Math.max(0,(Number(target.other)||0)*deliveryFactor-(barTechnologyEnergy.other||0)-(barTechnologyEnergy.cogenRenewable||0));
    }
    if(allowExploratoryGenerationLayers){
      ['wind','solar','other'].forEach(key=>{
        const publishedShare=ptsPotentialFinalShareIncreaseByTechnology[key];
        ptsPotentialBarTechnologyEnergy[key]=Number.isFinite(publishedShare)&&publishedShare>0?finalEnergy*publishedShare/100:ptsPotentialGenerationByTechnology[key]*deliveryFactor;
      });
    }
    const windRepoweringAdditionalMW=WIND_REPOWERING_POTENTIAL.reduce((sum,site)=>sum+site.additionalMW,0),windRepoweringAdditionalGWh=windRepoweringAdditionalMW*2.65;
    ptsPotentialCapacityByTechnology.wind+=windRepoweringAdditionalMW;ptsPotentialGenerationByTechnology.wind+=windRepoweringAdditionalGWh;if(!cfg.targetGenerationByTechnology||allowExploratoryGenerationLayers)ptsPotentialBarTechnologyEnergy.wind+=windRepoweringAdditionalGWh*deliveryFactor;
    const ownTechnologyEnergy=Object.values(barTechnologyEnergy).reduce((sum,value)=>sum+value,0),ownRenewableElectricityEnergyBase=ownRenewableElectricityKeys.reduce((sum,key)=>sum+(barTechnologyEnergy[key]||0),0),importedElectricEnergyBase=Math.max(0,electricEnergy-ownTechnologyEnergy);let importedElectricEnergy=importedElectricEnergyBase,displayedElectricShare=electricShare,displayedNonElectricShare=nonElectricShare,displayedOwnRenewableElectricityEnergy=ownRenewableElectricityEnergyBase,displayedOwnRenewableElectricityShare=electricEnergy?100*ownRenewableElectricityEnergyBase/electricEnergy:0;
    const fossilGenerationBlockEnergy=barTechnologyEnergy.cycle||0,fossilGenerationRenewablePercent=fossilGenerationBlockEnergy?100*cogenEstimatedRenewableWithinFossil*deliveryFactor/fossilGenerationBlockEnergy:0;
    const barTechnologyLabels={...Object.fromEntries(TECHNOLOGY_ORDER.map(key=>[key,TECHNOLOGIES[key].label])),cycle:'Generación fósil y mixta',cogenRenewable:'Bioenergía renovable',cogenMixed:'Valorización o cogeneración mixta',cogenUnverified:'Cogeneración sin combustible verificado'},barSegmentDisplayLabels={cycle:'Generación<br>fósil',cogenRenewable:'Bioenergía<br>renovable',cogenMixed:'Mixta',cogenUnverified:'Sin<br>verificar',hydro:'Hidráulica',wind:'Eólica',solar:'Solar',other:'Marina'};if(usesEveSolarLayer)barTechnologyLabels.solar='Solar a red · declarado por EVE';
    const isBarTechnologyActive=key=>key==='cycle'?fossilGenerationActive:key==='cogenRenewable'?activeCogenFuelClasses.has('renewable'):key==='cogenMixed'?activeCogenFuelClasses.has('mixed'):key==='cogenUnverified'?activeCogenFuelClasses.has('unverified'):key==='solar'&&usesEveSolarLayer?eveSolarVisible:active.has(key);
    const technologySegments=barTechnologyKeys.map(key=>{
      const energy=barTechnologyEnergy[key],electricPercent=electricEnergy?100*energy/electricEnergy:0,totalPercent=finalEnergy?100*energy/finalEnergy:0,isDrillable=['wind','solar','other'].includes(key),tag=isDrillable?'button':'div',buttonAttributes=isDrillable?` type="button" data-drilldown-technology="${key}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar ${barTechnologyLabels[key].toLowerCase()} en servicio: ${formatNumber(energy,key==='other'?3:0)} GWh"`:'';
      const futureEnergy=futureBarTechnologyEnergy[key]||0,futureSegment=futureEnergy?`<button type="button" class="map-energy-share-segment map-energy-share-future" data-future-technology="${key}" data-drilldown-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};flex:${futureEnergy}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar ${barTechnologyLabels[key].toLowerCase()} en construcción o aprobada" hidden><span class="map-energy-share-segment-label">${barSegmentDisplayLabels[key]}<br>en construcción<br>o aprobada</span><span class="map-energy-share-expanded-label"><strong>${barTechnologyLabels[key]} en construcción o aprobada</strong><small data-future-summary="${key}">${formatNumber(futureEnergy,0)} GWh potenciales · ${formatNumber(futureCapacityByTechnology[key],1)} MW</small></span></button>`:'',pipelineEnergy=pipelineBarTechnologyEnergy[key]||0,pipelineSegment=pipelineEnergy?`<button type="button" class="map-energy-share-segment map-energy-share-future map-energy-share-pipeline" data-pipeline-technology="${key}" data-drilldown-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};flex:${pipelineEnergy}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar ${barTechnologyLabels[key].toLowerCase()} en tramitación" hidden><span class="map-energy-share-segment-label">${barSegmentDisplayLabels[key]}<br>en tramitación</span><span class="map-energy-share-expanded-label"><strong>${barTechnologyLabels[key]} en tramitación</strong><small data-pipeline-summary="${key}">${formatNumber(pipelineEnergy,0)} GWh exploratorios · ${formatNumber(pipelineCapacityByTechnology[key],2)} MW solicitados</small></span></button>`:'',offshoreFutureSegment=key==='wind'?`<button type="button" class="map-energy-share-segment map-energy-share-offshore-future" data-offshore-wind-potential data-drilldown-technology="wind" style="--segment-color:#c85d58;flex:${offshoreWindPotentialBarEnergy}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar la eólica marina de BiMEP" hidden><span class="map-energy-share-segment-label">BiMEP<br>2 + ≤50 MW</span><span class="map-energy-share-expanded-label"><strong>Eólica marina · BiMEP</strong><small data-offshore-wind-summary>${formatNumber(offshoreWindPotentialBarEnergy,0)} GWh orientativos · 2 MW DemoSATH + hasta 50 MW GEROA</small></span></button>`:'',ptsPotentialEnergy=ptsPotentialBarTechnologyEnergy[key]||0,ptsPotentialSegment=ptsPotentialEnergy?`<button type="button" class="map-energy-share-segment map-energy-share-pts-potential" data-pts-potential-technology="${key}" data-drilldown-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};flex:${ptsPotentialEnergy}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar las nuevas zonas potenciales de ${barTechnologyLabels[key].toLowerCase()}, PTS y más" hidden><span class="map-energy-share-segment-label">${key==='other'?'Energía marina<br>zonas futuras':`${barSegmentDisplayLabels[key]}<br>zonas futuras<br>potenciales`}</span><span class="map-energy-share-expanded-label"><strong>${key==='other'?'Nuevas zonas potenciales de energía marina (PTS y más)':`Nuevas zonas potenciales de ${barTechnologyLabels[key].toLowerCase()} (PTS y más)`}</strong><small data-pts-potential-summary="${key}">${formatNumber(ptsPotentialEnergy,key==='other'?2:0)} GWh orientativos · ${formatNumber(ptsPotentialCapacityByTechnology[key],0)} MW agregados</small></span></button>`:'';
      const solarBreakdown=key==='solar'&&usesEveSolarLayer?`<span class="map-energy-share-expanded-label"><strong>Solar a red · declarado por EVE</strong><small>${formatNumber(energy,0)} GWh · ${formatNumber(eveSolarMW,1)} MW · ${formatNumber(eveSolarRecords.length,0)} instalaciones</small></span>`:'';
      const expandedLabel=key==='wind'?`<span class="map-energy-share-expanded-label"><strong>Eólica en servicio</strong><small>${formatNumber(energy,0)} GWh · ${formatNumber(operatingCapacityByTechnology.wind,1)} MW</small></span>`:key==='other'?`<span class="map-energy-share-expanded-label"><strong>Energía marina en servicio</strong><small>${formatNumber(energy,3)} GWh · ${formatNumber(operatingCapacityByTechnology.other,3)} MW</small></span>`:'';
      const energyDigits=key==='other'?3:0;
      const segmentBackground=key==='cycle'?`linear-gradient(to top,${COGEN_FUEL_CLASSES.fossil.color} 0 calc(100% - ${fossilGenerationRenewablePercent}%),#67b85a calc(100% - ${fossilGenerationRenewablePercent}%) 100%)`:TECHNOLOGIES[key].color,renewableEstimateNote=key==='cycle'?` · incluye ${formatNumber(cogenEstimatedRenewableWithinFossil*deliveryFactor,0)} GWh renovables estimados (${formatNumber(fossilGenerationRenewablePercent,1)} % del bloque) de Zabalgarbi, Ekondakin e Iurreta`:'';
      const currentSegment=`<${tag}${buttonAttributes} class="map-energy-share-segment${isDrillable?' map-energy-share-drillable':''}" data-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};background:${segmentBackground};flex:${energy}" title="${barTechnologyLabels[key]}: ${formatNumber(energy,energyDigits)} GWh · ${formatNumber(electricPercent,key==='other'?3:1)} % de la electricidad · ${formatNumber(totalPercent,key==='other'?4:2)} % del consumo final${renewableEstimateNote}"><span class="map-energy-share-segment-label">${barSegmentDisplayLabels[key]}<small>${formatNumber(energy,energyDigits)} GWh${key==='cogenRenewable'?` · ${formatNumber(totalPercent,2)} % total`:''}${key==='cycle'?`<br>${formatNumber(cogenEstimatedRenewableWithinFossil*deliveryFactor,0)} GWh ren. est.`:''}</small></span>${expandedLabel}${solarBreakdown}</${tag}>`;
      return`${ptsPotentialSegment}${offshoreFutureSegment}${pipelineSegment}${futureSegment}${currentSegment}`;
    }).join('');
    const energyShare=document.createElement('aside');energyShare.className='map-energy-share';energyShare.setAttribute('aria-label',`Consumo final energético de Euskadi en ${scenarioYear}: ${formatNumber(electricShare,1)} % electricidad y ${formatNumber(nonElectricShare,1)} % energía no eléctrica, principalmente petróleo y gas natural`);
    energyShare.innerHTML=`<p class="map-energy-share-title">Consumo final<br><strong>100 %</strong><span data-energy-share-basis>${scenarioYear}</span></p><div class="map-energy-share-bar" role="group" aria-label="Electricidad: ${formatNumber(electricShare,1)} %. Energía no eléctrica: ${formatNumber(nonElectricShare,1)} %"><div class="map-energy-share-rest" style="flex:${nonElectricShare}"><span>Energía<br>no eléctrica<br><strong>${formatNumber(nonElectricShare,1)} %</strong></span><span class="map-energy-share-rest-use-label">Gas y petróleo<small>Transporte · calor industrial · calefacción</small></span><div class="map-energy-share-direct-renewables" style="height:${directRenewableShareWithinNonElectric}%"><div class="map-energy-share-biomass" style="flex:${biomassEnergy}" title="Biomasa no eléctrica: ${formatNumber(biomassEnergy,1)} GWh · ${formatNumber(biomassShare,2)} % del consumo final"><span class="map-energy-share-direct-label">Biomasa<small>${formatNumber(biomassEnergy,0)} GWh</small></span></div><div class="map-energy-share-renewable-fuels" style="flex:${renewableFuelEnergy}" title="Combustibles renovables: ${formatNumber(renewableFuelEnergy,1)} GWh · ${formatNumber(renewableFuelShare,2)} % del consumo final"><span class="map-energy-share-direct-label">Combustibles<br>renovables<small>${formatNumber(renewableFuelEnergy,0)} GWh</small></span></div>${renewableHeatEnergy?`<div class="map-energy-share-renewable-heat" style="flex:${renewableHeatEnergy}" title="Calor renovable directo: ${formatNumber(renewableHeatEnergy,1)} GWh · ${formatNumber(renewableHeatShare,2)} % del consumo final"><span class="map-energy-share-direct-label">Calor<br>renovable<small>${formatNumber(renewableHeatEnergy,0)} GWh</small></span></div>`:''}</div></div><div class="map-energy-share-electric" style="flex:${electricShare}"><button type="button" class="map-energy-share-electric-toggle" aria-pressed="false" aria-expanded="false" aria-label="Ampliar el desglose de la electricidad, ${formatNumber(electricShare,1)} % del consumo final"><span class="map-energy-share-electric-label">Energía<br>eléctrica<br><strong>${formatNumber(electricShare,1)} %</strong></span></button><button type="button" class="map-energy-share-own-toggle" aria-pressed="false" aria-expanded="false" aria-label="Ampliar la electricidad renovable propia, ${formatNumber(displayedOwnRenewableElectricityShare,1)} % de toda la electricidad"><span class="map-energy-share-own-label">Electricidad<br>propia<br><strong>${formatNumber(displayedOwnRenewableElectricityShare,1)} %</strong></span></button><div class="map-energy-share-electric-stack"><div class="map-energy-share-segment map-energy-share-imported" style="flex:${importedElectricEnergy};--import-renewable-share:${importRenewableShare}%;--import-nonrenewable-share:${importNonRenewableShare}%" title="Electricidad importada: ${formatNumber(importedElectricEnergy,0)} GWh · atribución ${scenarioYear}: ${formatNumber(importRenewableShare,1)} % renovable y ${formatNumber(importNonRenewableShare,1)} % no renovable"><span class="map-energy-share-segment-label">Importada<small>${formatNumber(importRenewableShare,0)} % ren.<br>${formatNumber(importNonRenewableShare,0)} % no ren.</small></span></div>${technologySegments}</div></div></div>`;
    const renewableFuelBlock=energyShare.querySelector('.map-energy-share-renewable-fuels');
    if(renewableFuelBlock){renewableFuelBlock.innerHTML=`<span class="map-energy-share-direct-label map-energy-share-renewable-fuel-summary">Combustibles renovables<small><b style="color:#7a4a2a">Biocombustibles y biometano · ${formatNumber(renewableBiofuelEnergy,0)} GWh</b>${greenHydrogenSyntheticEnergy>0?`<b style="color:#4f9d00">Hidrógeno verde y sintéticos · ${formatNumber(greenHydrogenSyntheticEnergy,0)} GWh</b>`:'<b style="color:#4f9d00">Hidrógeno verde y sintéticos · 0 GWh</b>'}</small></span><span class="map-energy-share-renewable-fuel-substack" aria-hidden="true"><i class="map-energy-share-biofuel" style="flex:${renewableBiofuelEnergy}" title="Biocombustibles y biometano: ${formatNumber(renewableBiofuelEnergy,1)} GWh · ${formatNumber(renewableBiofuelShare,2)} % del consumo final"></i>${greenHydrogenSyntheticEnergy>0?`<i class="map-energy-share-h2-synthetic" style="flex:${greenHydrogenSyntheticEnergy}" title="Hidrógeno verde y combustibles sintéticos: ${formatNumber(greenHydrogenSyntheticEnergy,1)} GWh · ${formatNumber(greenHydrogenSyntheticShare,2)} % del consumo final"></i>`:''}</span>`;renewableFuelBlock.title=`Combustibles renovables: ${formatNumber(renewableFuelEnergy,1)} GWh · biocombustibles y biometano ${formatNumber(renewableBiofuelEnergy,1)} GWh · hidrógeno verde y combustibles sintéticos ${formatNumber(greenHydrogenSyntheticEnergy,1)} GWh`}
    const energyShareTitle=energyShare.querySelector('.map-energy-share-title');energyShareTitle.innerHTML=`<strong>Total</strong><small class="map-energy-share-basis-note">Imputado al consumo final</small><span data-energy-share-basis>${scenarioYear}</span>`;
    const energyShareCalloutLayer=document.createElement('div');energyShareCalloutLayer.className='map-energy-share-callouts';energyShareCalloutLayer.setAttribute('aria-hidden','true');energyShare.append(energyShareCalloutLayer);
    const energyShareBar=energyShare.querySelector('.map-energy-share-bar'),electricFocusButton=energyShare.querySelector('.map-energy-share-electric-toggle'),ownElectricityFocusButton=energyShare.querySelector('.map-energy-share-own-toggle'),restShareBlock=energyShare.querySelector('.map-energy-share-rest'),electricShareBlock=energyShare.querySelector('.map-energy-share-electric'),restShareStrong=energyShare.querySelector('.map-energy-share-rest strong'),technologyDrillButtons=[...energyShare.querySelectorAll('[data-drilldown-technology]')];let expandedTechnology=null,ownElectricityExpanded=false,energyCalloutFrame=0,energyCalloutAnimationFrame=0;
    const updateEnergyShareHeading=()=>{energyShareTitle.querySelector('strong').textContent=energyShareBar.classList.contains('is-own-electricity-expanded')?'Energía eléctrica propia':energyShareBar.classList.contains('is-electric-expanded')?'Energía eléctrica':'Total'};
    const refreshOwnElectricityTogglePosition=()=>{if(!ownElectricityFocusButton||!electricShareBlock)return;ownElectricityFocusButton.style.bottom='auto';const electricRect=electricShareBlock.getBoundingClientRect(),segments=ownRenewableElectricityKeys.flatMap(key=>[...energyShare.querySelectorAll(`[data-technology="${key}"],[data-future-technology="${key}"],[data-pipeline-technology="${key}"],[data-pts-potential-technology="${key}"]${key==='wind'?', [data-offshore-wind-potential]':''}`)]).filter(segment=>!segment.hidden&&getComputedStyle(segment).display!=='none');if(!segments.length)return;const top=Math.min(...segments.map(segment=>segment.getBoundingClientRect().top))-electricRect.top;ownElectricityFocusButton.style.top=`${top}px`};
    const refreshEnergyCallouts=()=>{cancelAnimationFrame(energyCalloutFrame);energyCalloutFrame=requestAnimationFrame(()=>{refreshOwnElectricityTogglePosition();energyShareCalloutLayer.replaceChildren();if(energyShareBar.classList.contains('is-technology-expanded'))return;const shareRect=energyShare.getBoundingClientRect(),barRect=energyShareBar.getBoundingClientRect(),barTop=barRect.top-shareRect.top,barBottom=barRect.bottom-shareRect.top,startX=barRect.right-shareRect.left,labelLeft=startX+20,labelWidth=Math.max(76,shareRect.width-labelLeft-5),sources=[...energyShare.querySelectorAll('.map-energy-share-rest,.map-energy-share-direct-renewables>div,.map-energy-share-imported,.map-energy-share-electric-stack>[data-technology],.map-energy-share-electric-stack>[data-future-technology],.map-energy-share-electric-stack>[data-offshore-wind-potential],.map-energy-share-electric-stack>[data-pts-potential-technology]')].filter(source=>{const rect=source.getBoundingClientRect(),style=getComputedStyle(source),layerActive=source.classList.contains('map-energy-share-rest')?energyShareBar.classList.contains('is-non-electric-visible'):source.classList.contains('map-energy-share-biomass')?energyShareBar.classList.contains('is-biomass-visible'):source.classList.contains('map-energy-share-renewable-fuels')?energyShareBar.classList.contains('is-renewable-fuel-visible'):!source.classList.contains('is-inactive');return layerActive&&!source.hidden&&style.display!=='none'&&rect.height>.05});const items=sources.flatMap(source=>{const sourceLabel=source.querySelector('.map-energy-share-rest-use-label,.map-energy-share-direct-label,.map-energy-share-segment-label'),rect=source.getBoundingClientRect(),isImported=source.classList.contains('map-energy-share-imported'),isFossilGeneration=source.dataset.technology==='cycle',splitImported=isImported&&energyShareBar.classList.contains('is-electric-expanded')&&!energyShareBar.classList.contains('is-own-electricity-expanded'),splitFossilGeneration=isFossilGeneration&&fossilGenerationRenewablePercent>0&&energyShareBar.classList.contains('is-electric-expanded')&&!energyShareBar.classList.contains('is-own-electricity-expanded'),defaultColor=source.classList.contains('map-energy-share-rest')?'#4f565c':source.classList.contains('map-energy-share-biomass')?'#c79a6b':source.classList.contains('map-energy-share-renewable-fuels')?'#7a4a2a':isImported?'#53676d':source.style.getPropertyValue('--segment-color')||'#53676d',parts=splitImported?[{anchorY:rect.top-shareRect.top+rect.height*(importRenewableShare/200),html:`Importada<br><strong>${formatNumber(importRenewableShare,0)} % renovable</strong>`,color:'#3a9b50'},{anchorY:rect.top-shareRect.top+rect.height*(importRenewableShare/100+importNonRenewableShare/200),html:`Importada no renovable<br><strong>${formatNumber(importNonRenewableShare,0)} %</strong>`,color:'#53676d'}]:splitFossilGeneration?[{anchorY:rect.top-shareRect.top+rect.height*fossilGenerationRenewablePercent/200,html:`Fracción renovable estimada<br><strong>${formatNumber(cogenEstimatedRenewableWithinFossil*deliveryFactor,0)} GWh</strong>`,color:'#3a9b50'},{anchorY:rect.top-shareRect.top+rect.height*(fossilGenerationRenewablePercent/100+(100-fossilGenerationRenewablePercent)/200),html:`Generación fósil<br><strong>${formatNumber(Math.max(0,fossilGenerationBlockEnergy-cogenEstimatedRenewableWithinFossil*deliveryFactor),0)} GWh</strong>`,color:'#4f565c'}]:[{anchorY:rect.top-shareRect.top+rect.height/2,html:sourceLabel?.innerHTML||source.getAttribute('title')||'',color:defaultColor}];return parts.map(part=>{const label=document.createElement('span');label.className='map-energy-share-callout';label.style.left=`${labelLeft}px`;label.style.width=`${labelWidth}px`;label.innerHTML=part.html;energyShareCalloutLayer.append(label);return{anchorY:part.anchorY,label,color:part.color,height:Math.max(18,label.getBoundingClientRect().height)}})}).sort((a,b)=>a.anchorY-b.anchorY);if(!items.length)return;const gap=4;items.forEach((item,index)=>{const half=item.height/2,minCenter=index?items[index-1].labelY+items[index-1].height/2+gap+half:barTop+half;item.labelY=Math.max(item.anchorY,minCenter)});let overflow=items.at(-1).labelY+items.at(-1).height/2-barBottom;if(overflow>0)items.forEach(item=>item.labelY-=overflow);for(let index=items.length-2;index>=0;index--){const item=items[index],next=items[index+1],maxCenter=next.labelY-next.height/2-gap-item.height/2;item.labelY=Math.min(item.labelY,maxCenter)}const underflow=barTop-(items[0].labelY-items[0].height/2);if(underflow>0)items.forEach(item=>item.labelY+=underflow);items.forEach(item=>{item.label.style.top=`${item.labelY}px`;item.label.style.setProperty('--callout-color',item.color);const dx=labelLeft-startX-3,dy=item.labelY-item.anchorY,line=document.createElement('i');line.className='map-energy-share-callout-line';line.style.left=`${startX}px`;line.style.top=`${item.anchorY}px`;line.style.width=`${Math.hypot(dx,dy)}px`;line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;line.style.setProperty('--callout-color',item.color);energyShareCalloutLayer.append(line)})})};
    let energyCalloutContainmentFrame=0;const containEnergyCallouts=()=>{cancelAnimationFrame(energyCalloutContainmentFrame);energyCalloutContainmentFrame=requestAnimationFrame(()=>{const labels=[...energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout')],lines=[...energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout-line')];if(!labels.length||labels.length!==lines.length)return;const shareRect=energyShare.getBoundingClientRect(),barRect=energyShareBar.getBoundingClientRect(),barTop=barRect.top-shareRect.top,barBottom=barRect.bottom-shareRect.top,gap=4,items=labels.map((label,index)=>({label,line:lines[index],anchorY:parseFloat(lines[index].style.top),height:Math.max(18,label.getBoundingClientRect().height)}));items.forEach((item,index)=>{const half=item.height/2,minimum=index?items[index-1].labelY+items[index-1].height/2+gap+half:barTop+half;item.labelY=Math.max(item.anchorY,minimum)});if(items.at(-1).labelY+items.at(-1).height/2>barBottom){items.at(-1).labelY=barBottom-items.at(-1).height/2;for(let index=items.length-2;index>=0;index--){const item=items[index],next=items[index+1],maximum=next.labelY-next.height/2-gap-item.height/2;item.labelY=Math.min(item.labelY,maximum)}}if(items[0].labelY-items[0].height/2<barTop){items[0].labelY=barTop+items[0].height/2;for(let index=1;index<items.length;index++){const item=items[index],previous=items[index-1],minimum=previous.labelY+previous.height/2+gap+item.height/2;item.labelY=Math.max(item.labelY,minimum)}}items.forEach(item=>{item.label.style.top=`${item.labelY}px`;const startX=parseFloat(item.line.style.left),labelLeft=parseFloat(item.label.style.left),dx=labelLeft-startX-3,dy=item.labelY-item.anchorY;item.line.style.width=`${Math.hypot(dx,dy)}px`;item.line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`})})};new MutationObserver(containEnergyCallouts).observe(energyShareCalloutLayer,{childList:true});
    const clarifyRenewableFractionCallout=()=>{energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout').forEach(label=>{if(label.textContent.trim().startsWith('Fracción renovable estimada')){const value=label.querySelector('strong')?.textContent||'';label.innerHTML=`Cogeneración y valorización mixta<br><strong>Fracción renovable estimada · ${value}</strong>`}})};new MutationObserver(clarifyRenewableFractionCallout).observe(energyShareCalloutLayer,{childList:true,subtree:true});
    let collapsedCalloutTimer=0;const simplifyCollapsedCallouts=()=>{if(energyShareBar.classList.contains('is-electric-expanded')||energyShareBar.classList.contains('is-own-electricity-expanded')||energyShareBar.classList.contains('is-technology-expanded'))return;const labels=[...energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout')],lines=[...energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout-line')];for(let index=labels.length-1;index>=0;index--){const label=labels[index],text=label.textContent.replace(/\s+/g,' ').trim(),isDetail=/^(Bioenergía\s*renovable|Hidráulica|Eólica(?:\s*proyectos|\s*\d)|Solar(?:\s*proyectos|\s*\d)|Energía\s*marina\s*potencial|Marina)/i.test(text);if(isDetail){label.remove();lines[index]?.remove()}}};new MutationObserver(()=>{clearTimeout(collapsedCalloutTimer);collapsedCalloutTimer=setTimeout(simplifyCollapsedCallouts,40)}).observe(energyShareCalloutLayer,{childList:true,subtree:true});
    let renewableFuelCalloutTimer=0;const splitRenewableFuelCallout=()=>{if(!energyShareBar.classList.contains('is-renewable-fuel-visible')||energyShareBar.classList.contains('is-electric-expanded'))return;const labels=[...energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout')],lines=[...energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout-line')],index=labels.findIndex(label=>label.textContent.replace(/\s+/g,' ').trim().startsWith('Combustibles renovables'));if(index<0||!lines[index])return;const originalLabel=labels[index],originalLine=lines[index],shareRect=energyShare.getBoundingClientRect(),bioSegment=renewableFuelBlock?.querySelector('.map-energy-share-biofuel'),h2Segment=renewableFuelBlock?.querySelector('.map-energy-share-h2-synthetic'),bioRect=bioSegment?.getBoundingClientRect(),h2Rect=h2Segment?.getBoundingClientRect(),startX=parseFloat(originalLine.style.left),labelLeft=parseFloat(originalLabel.style.left),labelWidth=parseFloat(originalLabel.style.width),parts=[{html:`Biocombustibles y biometano<br><strong>${formatNumber(renewableBiofuelEnergy,0)} GWh</strong>`,color:'#7a4a2a',anchorY:bioRect?bioRect.top-shareRect.top+bioRect.height/2:parseFloat(originalLine.style.top)},{html:`Hidrógeno verde y sintéticos<br><strong>${formatNumber(greenHydrogenSyntheticEnergy,0)} GWh</strong>`,color:'#4f9d00',anchorY:h2Rect?h2Rect.top-shareRect.top+h2Rect.height/2:(bioRect?bioRect.bottom-shareRect.top:parseFloat(originalLine.style.top))}];const newLabels=[],newLines=[];parts.forEach(part=>{const label=document.createElement('span');label.className='map-energy-share-callout';label.style.left=`${labelLeft}px`;label.style.width=`${labelWidth}px`;label.style.top=`${part.anchorY}px`;label.style.setProperty('--callout-color',part.color);label.innerHTML=part.html;newLabels.push(label);const line=document.createElement('i');line.className='map-energy-share-callout-line';line.style.left=`${startX}px`;line.style.top=`${part.anchorY}px`;line.style.width=`${Math.max(0,labelLeft-startX-3)}px`;line.style.transform='rotate(0rad)';line.style.setProperty('--callout-color',part.color);newLines.push(line)});originalLabel.replaceWith(...newLabels);originalLine.replaceWith(...newLines)};new MutationObserver(()=>{clearTimeout(renewableFuelCalloutTimer);renewableFuelCalloutTimer=setTimeout(splitRenewableFuelCallout,55)}).observe(energyShareCalloutLayer,{childList:true,subtree:true});
    let calloutAnchorRepairTimer=0;
    const repairEnergyCalloutAnchors=()=>{
      const labels=[...energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout')],lines=[...energyShareCalloutLayer.querySelectorAll('.map-energy-share-callout-line')];
      if(!labels.length||labels.length!==lines.length)return;
      const shareRect=energyShare.getBoundingClientRect(),barRect=energyShareBar.getBoundingClientRect(),barTop=barRect.top-shareRect.top,barBottom=barRect.bottom-shareRect.top,startX=barRect.right-shareRect.left,gap=4,normalize=value=>String(value||'').replace(/\s+/g,' ').trim().toLowerCase(),relativeCenter=element=>{const rect=element?.getBoundingClientRect();return rect?rect.top-shareRect.top+rect.height/2:NaN},sourceCandidates=[...energyShare.querySelectorAll('.map-energy-share-direct-renewables>div,.map-energy-share-imported,.map-energy-share-electric-stack>[data-technology],.map-energy-share-electric-stack>[data-future-technology],.map-energy-share-electric-stack>[data-pts-potential-technology]')];
      const anchorForLabel=label=>{
        const text=normalize(label.textContent),imported=energyShare.querySelector('.map-energy-share-imported'),cycle=energyShare.querySelector('[data-technology="cycle"]');
        if(text.startsWith('gas y petróleo')){const restRect=restShareBlock.getBoundingClientRect(),renewablesRect=energyShare.querySelector('.map-energy-share-direct-renewables')?.getBoundingClientRect(),fossilBottom=renewablesRect?Math.max(restRect.top,Math.min(restRect.bottom,renewablesRect.top)):restRect.bottom;return((restRect.top+fossilBottom)/2)-shareRect.top}
        if(text.startsWith('biocombustibles y biometano'))return relativeCenter(renewableFuelBlock?.querySelector('.map-energy-share-biofuel'));
        if(text.startsWith('hidrógeno verde y sintéticos'))return relativeCenter(renewableFuelBlock?.querySelector('.map-energy-share-h2-synthetic'));
        if(text.startsWith('biomasa'))return relativeCenter(energyShare.querySelector('.map-energy-share-biomass'));
        if(text.startsWith('calor renovable'))return relativeCenter(energyShare.querySelector('.map-energy-share-renewable-heat'));
        if(text.startsWith('importada no renovable')){const rect=imported?.getBoundingClientRect();return rect?rect.top-shareRect.top+rect.height*(importRenewableShare/100+importNonRenewableShare/200):NaN}
        if(text.startsWith('importada')&&text.includes('renovable')){const rect=imported?.getBoundingClientRect();return rect?rect.top-shareRect.top+rect.height*(importRenewableShare/200):NaN}
        if(text.startsWith('cogeneración y valorización mixta')||text.startsWith('fracción renovable estimada')){const rect=cycle?.getBoundingClientRect();return rect?rect.top-shareRect.top+rect.height*fossilGenerationRenewablePercent/200:NaN}
        if(text.startsWith('generación fósil')){const rect=cycle?.getBoundingClientRect();return rect?rect.top-shareRect.top+rect.height*(fossilGenerationRenewablePercent/100+(100-fossilGenerationRenewablePercent)/200):NaN}
        const source=sourceCandidates.find(candidate=>{const sourceLabel=candidate.querySelector('.map-energy-share-direct-label,.map-energy-share-segment-label'),sourceText=normalize(sourceLabel?.textContent);return sourceText&&(text.startsWith(sourceText)||sourceText.startsWith(text))});
        return source?relativeCenter(source):parseFloat(label.style.top);
      };
      labels.forEach(label=>{const text=normalize(label.textContent),emptyRenewableFuel=(text.startsWith('biocombustibles y biometano')&&renewableBiofuelEnergy<=.05)||(text.startsWith('hidrógeno verde y sintéticos')&&greenHydrogenSyntheticEnergy<=.05);label.style.display=emptyRenewableFuel?'none':''});
      const items=labels.filter(label=>label.style.display!=='none').map(label=>({label,anchorY:anchorForLabel(label),height:Math.max(18,label.getBoundingClientRect().height),color:label.style.getPropertyValue('--callout-color')||'#53676d'})).filter(item=>Number.isFinite(item.anchorY)).sort((a,b)=>a.anchorY-b.anchorY);
      if(!items.length)return;
      items.forEach((item,index)=>{const half=item.height/2,minimum=index?items[index-1].labelY+items[index-1].height/2+gap+half:barTop+half;item.labelY=Math.max(item.anchorY,minimum)});
      if(items.at(-1).labelY+items.at(-1).height/2>barBottom){items.at(-1).labelY=barBottom-items.at(-1).height/2;for(let index=items.length-2;index>=0;index--){const item=items[index],next=items[index+1],maximum=next.labelY-next.height/2-gap-item.height/2;item.labelY=Math.min(item.labelY,maximum)}}
      if(items[0].labelY-items[0].height/2<barTop){items[0].labelY=barTop+items[0].height/2;for(let index=1;index<items.length;index++){const item=items[index],previous=items[index-1],minimum=previous.labelY+previous.height/2+gap+item.height/2;item.labelY=Math.max(item.labelY,minimum)}}
      lines.forEach((line,index)=>line.style.display=index<items.length?'block':'none');
      items.forEach((item,index)=>{const line=lines[index],labelLeft=parseFloat(item.label.style.left),dx=labelLeft-startX-3,dy=item.labelY-item.anchorY;item.label.style.top=`${item.labelY}px`;line.style.left=`${startX}px`;line.style.top=`${item.anchorY}px`;line.style.width=`${Math.hypot(dx,dy)}px`;line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;line.style.setProperty('--callout-color',item.color)});
    };
    new MutationObserver(()=>{clearTimeout(calloutAnchorRepairTimer);calloutAnchorRepairTimer=setTimeout(repairEnergyCalloutAnchors,90)}).observe(energyShareCalloutLayer,{childList:true,subtree:true});
    window.addEventListener('resize',()=>{clearTimeout(calloutAnchorRepairTimer);calloutAnchorRepairTimer=setTimeout(repairEnergyCalloutAnchors,120)});
    const animateEnergyCallouts=()=>{cancelAnimationFrame(energyCalloutAnimationFrame);const startedAt=performance.now(),step=now=>{refreshEnergyCallouts();if(now-startedAt<650)energyCalloutAnimationFrame=requestAnimationFrame(step)};energyCalloutAnimationFrame=requestAnimationFrame(step)};
    const updateExpansionControls=()=>{const electricityExpanded=energyShareBar.classList.contains('is-electric-expanded');electricFocusButton.setAttribute('aria-pressed',String(electricityExpanded));electricFocusButton.setAttribute('aria-expanded',String(electricityExpanded));electricFocusButton.setAttribute('aria-label',expandedTechnology||ownElectricityExpanded?'Volver al desglose de toda la electricidad':electricityExpanded?`Volver al consumo final completo. Electricidad: ${formatNumber(displayedElectricShare,1)} %`:`Ampliar el desglose de la electricidad, ${formatNumber(displayedElectricShare,1)} % del consumo final`);electricFocusButton.querySelector('.map-energy-share-electric-label').innerHTML=expandedTechnology||ownElectricityExpanded?'←<br>Energía<br>eléctrica':`Energía<br>eléctrica<br><strong>${formatNumber(displayedElectricShare,1)} %</strong>`;ownElectricityFocusButton.setAttribute('aria-pressed',String(ownElectricityExpanded));ownElectricityFocusButton.setAttribute('aria-expanded',String(ownElectricityExpanded));ownElectricityFocusButton.setAttribute('aria-label',ownElectricityExpanded?'Volver al desglose de toda la electricidad':`Ampliar la electricidad renovable propia, ${formatNumber(displayedOwnRenewableElectricityShare,1)} % de toda la electricidad`);ownElectricityFocusButton.querySelector('.map-energy-share-own-label').innerHTML=ownElectricityExpanded?'←<br>Electricidad<br>propia':`Electricidad<br>propia<br><strong>${formatNumber(displayedOwnRenewableElectricityShare,1)} %</strong>`;technologyDrillButtons.forEach(button=>{const key=button.dataset.drilldownTechnology,selected=key===expandedTechnology,isFuture=Boolean(button.dataset.futureTechnology),isPtsPotential=Boolean(button.dataset.ptsPotentialTechnology),isOffshorePotential=button.hasAttribute('data-offshore-wind-potential');button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-expanded',String(selected));button.setAttribute('aria-label',selected?`Volver al desglose de toda la electricidad desde ${barTechnologyLabels[key]}`:isOffshorePotential?'Ampliar la eólica marina de BiMEP':isPtsPotential?`Ampliar las nuevas zonas potenciales de ${barTechnologyLabels[key].toLowerCase()}, PTS y más`:isFuture?`Ampliar ${barTechnologyLabels[key].toLowerCase()} en construcción o aprobada`:`Ampliar ${barTechnologyLabels[key].toLowerCase()} en servicio: ${formatNumber(barTechnologyEnergy[key],key==='other'?3:0)} GWh`)})};
    const setTechnologyExpanded=key=>{expandedTechnology=['wind','solar','other'].includes(key)?key:null;if(expandedTechnology){ownElectricityExpanded=false;energyShareBar.classList.remove('is-own-electricity-expanded')}energyShareBar.classList.toggle('is-technology-expanded',Boolean(expandedTechnology));if(expandedTechnology){energyShareBar.classList.add('is-electric-expanded');energyShareBar.dataset.expandedTechnology=expandedTechnology}else delete energyShareBar.dataset.expandedTechnology;updateExpansionControls();animateEnergyCallouts()};
    const setOwnElectricityExpanded=expanded=>{ownElectricityExpanded=Boolean(expanded);energyShareBar.classList.toggle('is-own-electricity-expanded',ownElectricityExpanded);if(ownElectricityExpanded){expandedTechnology=null;energyShareBar.classList.remove('is-technology-expanded');delete energyShareBar.dataset.expandedTechnology;energyShareBar.classList.add('is-electric-expanded')}refreshOwnElectricityTogglePosition();updateExpansionControls();animateEnergyCallouts()};
    const setElectricityExpanded=expanded=>{if(!expanded){expandedTechnology=null;ownElectricityExpanded=false;energyShareBar.classList.remove('is-technology-expanded','is-own-electricity-expanded');delete energyShareBar.dataset.expandedTechnology}energyShareBar.classList.toggle('is-electric-expanded',expanded);updateExpansionControls();animateEnergyCallouts()};
    electricFocusButton.addEventListener('click',event=>{event.stopPropagation();if(expandedTechnology)setTechnologyExpanded(null);else if(ownElectricityExpanded)setOwnElectricityExpanded(false);else setElectricityExpanded(!energyShareBar.classList.contains('is-electric-expanded'))});
    ownElectricityFocusButton.addEventListener('click',event=>{event.stopPropagation();setOwnElectricityExpanded(!ownElectricityExpanded)});
    electricShareBlock.addEventListener('click',event=>{if(event.target.closest('button'))return;setElectricityExpanded(!energyShareBar.classList.contains('is-electric-expanded'))});
    technologyDrillButtons.forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();const key=button.dataset.drilldownTechnology;setTechnologyExpanded(expandedTechnology===key?null:key)}));
    new ResizeObserver(refreshEnergyCallouts).observe(energyShareBar);new MutationObserver(()=>{refreshEnergyCallouts();updateEnergyShareHeading()}).observe(energyShareBar,{subtree:true,attributes:true,attributeFilter:['class','hidden','style']});window.addEventListener('resize',refreshEnergyCallouts);updateEnergyShareHeading();refreshEnergyCallouts();
    const viewport=document.createElement('div');viewport.className='energy-map-viewport';
    const detail=document.createElement('aside');detail.className='map-detail';detail.setAttribute('aria-live','polite');
    const substationCapacityPanel=document.createElement('aside');
    substationCapacityPanel.className='substation-capacity-panel';
    substationCapacityPanel.setAttribute('aria-label','Disponibilidad de la red de transporte para nueva demanda y actuaciones de refuerzo visibles');
    substationCapacityPanel.innerHTML=`<p class="substation-capacity-title">Disponibilidad<br><strong>de red</strong></p><div class="substation-capacity-current"><strong>18 / 38</strong><span>nudos/tensiones de transporte con algún margen general publicado para demanda</span><small>47 % · situación REE de 1 de julio de 2026</small></div><div class="substation-capacity-track" role="img" aria-label="Base actual y actuaciones de refuerzo activadas; las actuaciones futuras no están cuantificadas en megavatios"><span class="substation-capacity-base" style="height:47.4%"><b>Margen actual</b></span><span class="substation-capacity-future substation-capacity-future-new"><b>Nueva</b></span><span class="substation-capacity-future substation-capacity-future-expansion"><b>Ampliación</b></span></div><div class="substation-capacity-actions"><strong data-substation-actions-total>4 actuaciones activadas</strong><span data-substation-actions-detail>1 nueva · 3 ampliaciones o adaptaciones</span></div><p class="substation-capacity-note"><strong>La parte futura no está a escala.</strong> Una obra habilita capacidad, pero su margen útil en MW solo puede publicarse después del cálculo por nudo, tensión y escenario de seguridad. Los MW de zonas compartidas no se pueden sumar.</p>`;
    const sideIndicator=substationFocus?substationCapacityPanel:energyShare;
    layout.append(sideIndicator,viewport,detail);shell.append(layout);
    const detailModal=document.createElement('div');detailModal.className='map-detail-modal';detailModal.hidden=true;detailModal.setAttribute('role','dialog');detailModal.setAttribute('aria-modal','true');
    detailModal.innerHTML='<div class="map-detail-modal-card"><div class="map-detail-modal-head"><strong>Información completa</strong><button type="button" class="map-detail-modal-close">Cerrar</button></div><div class="map-detail-modal-body"></div></div>';
    shell.append(detailModal);
    const detailModalBody=detailModal.querySelector('.map-detail-modal-body'),detailModalClose=detailModal.querySelector('.map-detail-modal-close'),detailModalTitle=detailModal.querySelector('.map-detail-modal-head strong');
    const openImageModal=(figure,title)=>{
      const copy=figure.cloneNode(true);copy.classList.add('installation-photo-expanded');copy.querySelector('.installation-photo-expand')?.remove();detailModalTitle.textContent=title;detailModalBody.replaceChildren(copy);detailModal.hidden=false;detailModalClose.focus();
    };
    const refreshDetailActions=()=>{
      detail.querySelector('.map-detail-more')?.remove();
      const dataList=detail.querySelector('dl');
      if(dataList){
        [...detail.querySelectorAll('.installation-photo')].forEach(photo=>dataList.before(photo));
      }
      const button=document.createElement('button');button.type='button';button.className='map-detail-more';button.textContent='Ver ficha completa';button.setAttribute('aria-label','Abrir la ficha completa en una ventana');
      button.addEventListener('click',()=>{
        const copy=detail.cloneNode(true);copy.querySelector('.map-detail-more')?.remove();detailModalTitle.textContent='Información completa';detailModalBody.replaceChildren(...copy.childNodes);detailModal.hidden=false;detailModalClose.focus();
      });
  detail.prepend(button);
    };
    const closeDetailModal=()=>{detailModal.hidden=true};
    detailModalClose.addEventListener('click',closeDetailModal);detailModal.addEventListener('click',event=>{if(event.target===detailModal)closeDetailModal()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!detailModal.hidden)closeDetailModal()});
    const importLayerScope=modelledGatewayFlows?(cfg.unifiedNormativeMap?'«Importación eléctrica modelizada» adapta los flujos anuales a la senda normativa activa. Al aumentar la generación propia, el grosor y las etiquetas de las cuatro entradas se reducen en la misma proporción que la importación de la barra. Las bandas separan el componente renovable del nuclear francés; no representan un despacho horario por línea.':'«Importación eléctrica modelizada» muestra los flujos anuales del escenario 2050. El grosor es proporcional a los GWh de cada origen y las bandas separan el componente renovable del nuclear francés; las flechas suman exactamente la importación anual del modelo, pero no representan un despacho horario por línea.'):isTendentialScenario&&!timelineEnabled?'«Capacidad de entrada de importación» reutiliza las flechas rectas y las proporciones lineales del mapa peninsular. En la vista vasca el grosor se amplía al doble para facilitar la lectura, sin cambiar la relación entre los GWh de unas conexiones y otras. Las bandas verde y gris reflejan el mix del territorio de origen; la dirección representa un saldo anual probable de 2025, no una medición por línea.':'«Capacidad de entrada de importación» muestra las puertas exteriores con dos bandas: verde oscuro para el componente renovable atribuido y gris para el no renovable. El grosor compara capacidad nominal, no energía anual.';
    const scope=document.createElement('details');scope.className='map-scope';scope.innerHTML=`<summary><strong>Cómo leer el mapa</strong><small>Expandir</small></summary><div class="map-scope-body">La capa amarilla «Solar a red · declarado por EVE» reúne ${formatNumber(eveSolarRecords.length,0)} instalaciones y representa una producción estimada de ${formatNumber(eveSolarEstimatedGWh,1)} GWh/año con las ${formatNumber(SOLAR_MODEL_EQUIVALENT_HOURS,0)} horas equivalentes del modelo; es la única capa solar en servicio vinculada a la barra lateral, cuya energía anual conserva el balance oficial. La capa naranja «Autoconsumo con excedentes» reúne ${formatNumber(selfConsumptionRecords.length,0)} puntos. El cálculo agregado se aplica solo a los ${formatNumber(esiosSolarRecords.length,0)} registros fotovoltaicos de Red Eléctrica & ESIOS. Para estos últimos, sus ${formatNumber(esiosSolarEstimatedGWh,1)} GWh/año de generación bruta estimada se convierten en ${formatNumber(esiosSolarEstimatedInjectedGWh,1)} GWh/año de vertido estimado aplicando el ${formatNumber(ESIOS_SOLAR_EXPORT_SHARE*100,1)} % observado por Red Eléctrica en la fotovoltaica de autoconsumo española de 2025. La misma capa incorpora dos casos documentados individualmente: la minieólica de Uriarte SafyBox y la fotovoltaica municipal del polideportivo Antzizar. Mantienen su tecnología y su producción propia, pero no se les aplica el coeficiente fotovoltaico de vertido porque sus fuentes no cuantifican el excedente enviado a la red. Este coeficiente se aplica exclusivamente a los puntos fotovoltaicos ESIOS; no se usa para EVE ni para autoconsumo sin excedentes. Es una aproximación agregada, no una medida de los puntos vascos, y no se suma ni activa la barra. ESIOS ya excluye los cuatro solapes verificados con EVE —Arasur, Ekiola Mendialdea, Leintz Bailarako Ekiola y Ekindar Azpeitia—; no se han eliminado simples coincidencias por cercanía. «Nuevas zonas potenciales (PTS y más)» reúne las zonas para instalaciones nuevas y las “P” de repotenciación sobre Elgea, Urkilla, Oiz y Badaia. La barra suma únicamente los 88,785 MW adicionales, estimados en 235,3 GWh/año con 2.650 horas equivalentes, para no duplicar la potencia existente. «Red eléctrica» muestra únicamente las líneas de 132, 220 y 400 kV y sus actuaciones. «Subestaciones» es una capa independiente: clasifica las huellas existentes de GeoEuskadi por la red de mayor tensión situada a menos de 1,25 km y distingue, con símbolos propios, la nueva subestación y las ampliaciones o adaptaciones cuya localización está documentada. Esta clasificación es cartográfica y no sustituye la ficha técnica de cada instalación. ${importLayerScope} «Generación fósil» agrupa el ciclo combinado y la cogeneración asignada a combustible fósil. Dentro de su bloque, una banda verde reserva ${formatNumber(cogenEstimatedRenewableWithinFossil*deliveryFactor,0)} GWh (${formatNumber(fossilGenerationRenewablePercent,1)} %) para la fracción renovable estimada de Zabalgarbi, Ekondakin e Iurreta; el total del bloque no cambia. El resto de la categoría registral «Cogeneración, residuos y biomasa» se separa en bioenergía renovable, valorización mixta y combustible no verificado. La barra reparte los ${formatNumber(cogenGenerationTotal,0)} GWh agregados en proporción a la potencia instalada y aplica después las fracciones documentadas; es una estimación, no una medición directa por combustible. «Infraestructura no eléctrica» reúne gas y petróleo en gris; «Combustibles renovables» separa biocombustibles, bioGNL e hidrógeno con el marrón del mix renovable directo. Los trazados son esquemáticos cuando la fuente solo publica sus extremos. <strong>Poblaciones.</strong> Los cuadrados negros sitúan los municipios según su población a 1 de enero de 2025.</div>`;scope.addEventListener('toggle',()=>{scope.querySelector('summary small').textContent=scope.open?'Ocultar':'Expandir'});shell.append(scope);
    const barScope=document.createElement('details');barScope.className='map-scope';barScope.innerHTML='<summary><strong>Cómo leer la barra lateral</strong><small>Expandir</small></summary><div class="map-scope-body"><strong>El ajuste no corresponde únicamente a pérdidas físicas.</strong> Los GWh de generación eléctrica se llevan al perímetro del consumo final mediante la relación 13.210,1 / 14.711,41. La diferencia recoge conjuntamente las pérdidas de transporte y distribución y los consumos propios del sistema energético que se producen antes de llegar al usuario final. Por eso, los 81,7 GWh de generación solar se representan como 73 GWh imputados al consumo final.</div>';barScope.addEventListener('toggle',()=>{barScope.querySelector('summary small').textContent=barScope.open?'Ocultar':'Expandir'});shell.append(barScope);

    const currentGatewayNominalMVA=INTERCONNECTION_NODES.reduce((sum,node)=>sum+(Number(node.capacityTotalMVA)||0),0);
    const largestCurrentGateway=INTERCONNECTION_NODES.reduce((largest,node)=>(Number(node.capacityTotalMVA)||0)>(Number(largest.capacityTotalMVA)||0)?node:largest,INTERCONNECTION_NODES[0]);
    const largestCurrentGatewayMVA=Number(largestCurrentGateway.capacityTotalMVA)||0;
    const currentGatewayN1ScreenMVA=currentGatewayNominalMVA-largestCurrentGatewayMVA;
    const futureMarineGatewayMW=2000;
    const auditedNominalMVA=currentGatewayNominalMVA+(isNormativeScenario?futureMarineGatewayMW:0);
    const auditedN1ScreenMVA=currentGatewayN1ScreenMVA+(isNormativeScenario?futureMarineGatewayMW:0);
    const configuredAuditImport=Number(cfg.importedElectricEnergyAudit),auditedImportedElectricEnergy=Number.isFinite(configuredAuditImport)?Math.max(0,configuredAuditImport):importedElectricEnergy;
    const importedAverageMW=auditedImportedElectricEnergy*1000/8760;
    const currentScreenUse=100*importedAverageMW/currentGatewayN1ScreenMVA;
    const auditedScreenUse=100*importedAverageMW/auditedN1ScreenMVA;
    const gatewayAuditList=INTERCONNECTION_NODES.map(node=>`<li><span>${escapeHtml(node.name)}</span><strong>${formatNumber(node.capacityTotalMVA,0)} MVA</strong></li>`).join('');
    const capacityAudit=document.createElement('details');capacityAudit.className='map-scope map-capacity-audit';capacityAudit.innerHTML=`<summary><strong>Auditoría de las puertas de entrada eléctrica</strong><small>Expandir</small></summary><div class="map-scope-body"><ul class="map-capacity-audit-list">${gatewayAuditList}</ul><p><strong>Resultado:</strong> las seis puertas actuales suman <strong>${formatNumber(currentGatewayNominalMVA,0)} MVA</strong> de capacidad térmica nominal de línea. Como cribado deliberadamente conservador, al retirar completa la puerta agregada de mayor capacidad —${escapeHtml(largestCurrentGateway.name)}, ${formatNumber(largestCurrentGatewayMVA,0)} MVA— quedan <strong>${formatNumber(currentGatewayN1ScreenMVA,0)} MVA</strong>. Es más severo que un N−1 convencional, que suele retirar un único circuito y no todos los circuitos agrupados en una puerta.</p><p>La importación del escenario ${scenarioYear} es de <strong>${formatNumber(auditedImportedElectricEnergy,0)} GWh/año</strong>, equivalente a <strong>${formatNumber(importedAverageMW,0)} MW medios</strong>: el ${formatNumber(currentScreenUse,1)} % de ese cribado con la red actual.${isNormativeScenario?` Con la interconexión submarina del Golfo de Bizkaia —2.000 MW, en construcción— la capacidad nominal combinada orientativa ascendería a ${formatNumber(auditedNominalMVA,0)} MW/MVA y el cribado a ${formatNumber(auditedN1ScreenMVA,0)} MW/MVA; la demanda media importada de 2050 ocuparía el ${formatNumber(auditedScreenUse,1)} %.`:''}</p><p><strong>Valoración:</strong> hay margen suficiente en energía anual para el escenario. Esta suma no es una capacidad comercial simultánea garantizada: para certificar la punta horaria hacen falta cálculos de flujo de carga de Red Eléctrica que consideren topología, flujos en tránsito, tensión, indisponibilidades y los límites N−1 reales.</p><span class="map-source-badge"><a href="${REE_TRANSPORT_CAPACITY_2024}" target="_blank" rel="noopener">REE · capacidades térmicas 2024</a> · <a href="https://www.ree.es/es/sala-de-prensa/actualidad/nota-de-prensa/2026/04/beatriz-corredor-e-imanol-pradales-analizan-inversiones-red-electrica-euskadi" target="_blank" rel="noopener">REE · actualización 2026</a></span></div>`;capacityAudit.addEventListener('toggle',()=>{capacityAudit.querySelector('summary small').textContent=capacityAudit.open?'Ocultar':'Expandir'});shell.append(capacityAudit);

    const W=900,H=590,svg=d3.select(viewport).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('preserveAspectRatio','xMidYMin meet').attr('role','img').attr('aria-label','Mapa de Euskadi y su entorno con instalaciones y redes energéticas eléctricas y no eléctricas');
    const syncMapViewBox=()=>{
      const width=Math.max(1,viewport.clientWidth||W),height=Math.max(1,viewport.clientHeight||H),viewHeight=Math.max(H,W*height/width);
      svg.attr('viewBox',`0 0 ${W} ${viewHeight}`);
    };
    if('ResizeObserver'in window)new ResizeObserver(syncMapViewBox).observe(viewport);else window.addEventListener('resize',syncMapViewBox);
    requestAnimationFrame(syncMapViewBox);
    const defs=svg.append('defs');
    const seaPattern=defs.append('pattern').attr('id',patternId('sea-wave-pattern')).attr('patternUnits','userSpaceOnUse').attr('width',36).attr('height',18);
    seaPattern.append('rect').attr('width',36).attr('height',18).attr('fill','#eef7fa');
    seaPattern.append('path').attr('d','M-9 12 Q0 4 9 12 T27 12 T45 12').attr('fill','none').attr('stroke','#7fb3c8').attr('stroke-width',1.2).attr('opacity',.48);
    TECHNOLOGY_ORDER.forEach(key=>{
      const pattern=defs.append('pattern').attr('id',patternId(`generation-project-${key}-hatch`)).attr('patternUnits','userSpaceOnUse').attr('width',6).attr('height',6);
      pattern.append('rect').attr('width',6).attr('height',6).attr('fill',TECHNOLOGIES[key].color);
      pattern.append('path').attr('d','M-2 2 L2 -2 M0 6 L6 0 M4 8 L8 4').attr('fill','none').attr('stroke','#111').attr('stroke-width',.65).attr('opacity',.9);
      const pipelinePattern=defs.append('pattern').attr('id',patternId(`pipeline-project-${key}-dots`)).attr('patternUnits','userSpaceOnUse').attr('width',5).attr('height',5);
      pipelinePattern.append('rect').attr('width',5).attr('height',5).attr('fill',TECHNOLOGIES[key].color);
      pipelinePattern.append('circle').attr('cx',1.25).attr('cy',1.25).attr('r',.72).attr('fill','#111').attr('opacity',.92);
      pipelinePattern.append('circle').attr('cx',3.75).attr('cy',3.75).attr('r',.72).attr('fill','#111').attr('opacity',.92);
      const gridPattern=defs.append('pattern').attr('id',patternId(`pts-potential-${key}-grid`)).attr('patternUnits','userSpaceOnUse').attr('width',6).attr('height',6);
      gridPattern.append('rect').attr('width',6).attr('height',6).attr('fill',TECHNOLOGIES[key].color);
      gridPattern.append('path').attr('d','M0 0 H6 M0 3 H6 M0 6 H6 M0 0 V6 M3 0 V6 M6 0 V6').attr('fill','none').attr('stroke','#111').attr('stroke-width',.42).attr('opacity',.88);
    });
    const cogenMixedPattern=defs.append('pattern').attr('id',patternId('cogen-fuel-mixed')).attr('patternUnits','userSpaceOnUse').attr('width',8).attr('height',8);
    cogenMixedPattern.append('rect').attr('width',8).attr('height',8).attr('fill',COGEN_FUEL_CLASSES.mixed.color);
    cogenMixedPattern.append('path').attr('d','M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6').attr('stroke',COGEN_FUEL_CLASSES.renewable.color).attr('stroke-width',2.2);
    const storageAuthorizedPattern=defs.append('pattern').attr('id',patternId('electric-storage-authorized-hatch')).attr('patternUnits','userSpaceOnUse').attr('width',6).attr('height',6);
    storageAuthorizedPattern.append('rect').attr('width',6).attr('height',6).attr('fill','#6fb7bf');
    storageAuthorizedPattern.append('path').attr('d','M-2 2 L2 -2 M0 6 L6 0 M4 8 L8 4').attr('fill','none').attr('stroke','#17383f').attr('stroke-width',.7);
    const storagePipelinePattern=defs.append('pattern').attr('id',patternId('electric-storage-pipeline-grid')).attr('patternUnits','userSpaceOnUse').attr('width',6).attr('height',6);
    storagePipelinePattern.append('rect').attr('width',6).attr('height',6).attr('fill','#6fb7bf');
    storagePipelinePattern.append('path').attr('d','M0 0 H6 M0 3 H6 M0 6 H6 M0 0 V6 M3 0 V6 M6 0 V6').attr('fill','none').attr('stroke','#17383f').attr('stroke-width',.45);
    const windRepoweringPattern=defs.append('pattern').attr('id',patternId('wind-repowering-grid')).attr('patternUnits','userSpaceOnUse').attr('width',5).attr('height',5);
    windRepoweringPattern.append('rect').attr('width',5).attr('height',5).attr('fill','#79cce5');
    windRepoweringPattern.append('path').attr('d','M0 0 H5 M0 0 V5').attr('fill','none').attr('stroke','#164f70').attr('stroke-width',.55).attr('opacity',.82);
    const mapLayer=svg.append('g').attr('class','energy-map-layer');
    const projection=d3.geoMercator().fitExtent([[28,118],[W-28,H-24]],mapTerritories),path=d3.geoPath(projection);
    const seaBackground={type:'Feature',properties:{role:'sea-background'},geometry:{type:'Polygon',coordinates:[[[-8,43.05],[-8,50],[5,50],[5,43.05],[-8,43.05]]]}};
    mapLayer.append('path').datum(seaBackground).attr('class','sea-area').attr('d',path).style('fill',patternUrl('sea-wave-pattern'));
    if(mapSurroundings)mapLayer.selectAll('path.surrounding-land').data(mapSurroundings.features).join('path').attr('class','surrounding-land').attr('d',path);
    mapLayer.selectAll('path.territory-fill').data(mapTerritories.features).join('path').attr('class','territory-fill').attr('d',path);
    if(mapMunicipalities)mapLayer.selectAll('path.municipality-line').data(mapMunicipalities.features).join('path').attr('class','municipality-line').attr('d',path);
    const flattenLineStrings=geometry=>{
      if(!geometry)return[];
      if(geometry.type==='LineString')return[geometry.coordinates||[]];
      if(geometry.type==='MultiLineString')return geometry.coordinates||[];
      return[];
    };
    const pointSegmentDistanceKm=(point,start,end)=>{
      const latitudeRadians=point[1]*Math.PI/180,scaleX=111.32*Math.cos(latitudeRadians),scaleY=110.57;
      const ax=(start[0]-point[0])*scaleX,ay=(start[1]-point[1])*scaleY,bx=(end[0]-point[0])*scaleX,by=(end[1]-point[1])*scaleY;
      const dx=bx-ax,dy=by-ay,lengthSquared=dx*dx+dy*dy,t=lengthSquared?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/lengthSquared)):0;
      return Math.hypot(ax+t*dx,ay+t*dy);
    };
    const voltageLineSegments=new Map(['400 kV','220 kV','132 kV'].map(voltage=>[voltage,allGridFeatures.filter(feature=>feature.properties?.VTENS_0116===voltage).flatMap(feature=>flattenLineStrings(feature.geometry)).flatMap(line=>line.slice(1).map((point,index)=>[line[index],point]))]));
    const classifySubstation=feature=>{
      const point=d3.geoCentroid(feature),distances=Object.fromEntries([...voltageLineSegments].map(([voltage,segments])=>[voltage,segments.reduce((minimum,[start,end])=>Math.min(minimum,pointSegmentDistanceKm(point,start,end)),Infinity)]));
      const voltage=['400 kV','220 kV','132 kV'].find(candidate=>distances[candidate]<=1.25)||Object.entries(distances).sort((a,b)=>a[1]-b[1])[0]?.[0]||'Sin clasificar';
      const key=voltage.startsWith('400')?'400':voltage.startsWith('220')?'220':voltage.startsWith('132')?'132':'other';
      return{feature,voltage,key,distanceKm:distances[voltage]};
    };
    const substationRecords=(mapSubstations?.features||[]).map(classifySubstation);
    const substationLayer=mapLayer.append('g').attr('class','substation-layer');
    const substationShapes=substationLayer.selectAll('path').data(substationRecords).join('path').attr('class',record=>`substation-footprint substation-voltage-${record.key}`).attr('d',record=>path(record.feature));
    substationShapes.append('title').text(record=>`Subestación existente · ${record.voltage} · clasificación cartográfica según la red de mayor tensión situada a menos de 1,25 km`);
    const substationCentroids=substationLayer.selectAll('g.substation-centroid').data(substationRecords).join('g').attr('class',record=>`substation-centroid substation-voltage-${record.key}`).attr('transform',record=>`translate(${projection(d3.geoCentroid(record.feature)).join(',')})`);
    substationCentroids.append('circle').attr('r',2.75);
    substationCentroids.append('title').text(record=>`Subestación existente · ${record.voltage}`);
    const local132Layer=mapLayer.append('g').attr('class','local-132-grid');
    const local132Lines=local132Layer.selectAll('path').data(local132Features).join('path').attr('class','high-voltage-line voltage-132').attr('d',path);
    local132Lines.append('title').text(lineTitle);
    const gridLayer=mapLayer.append('g').attr('class','high-voltage-grid');
    const gridLines=gridLayer.selectAll('path').data(highVoltageFeatures).join('path')
      .attr('class',d=>`high-voltage-line voltage-${String(d.properties?.VTENS_0116||'').replace(/\D/g,'')}`).attr('d',path);
    gridLines.append('title').text(lineTitle);
    const projectLayer=mapLayer.append('g').attr('class','electric-project-layer');
    const projectLineRecords=projectDefinitions.flatMap(project=>{
      if(project.geometry)return[{project,feature:{type:'Feature',properties:{projectId:project.id},geometry:project.geometry}}];
      const ids=new Set((project.lineObjectIds||[]).map(Number));
      return allGridFeatures.filter(feature=>ids.has(Number(feature.properties?.OBJECTID))).map(feature=>({project,feature}));
    });
    const projectPathLayer=projectLayer.append('g').attr('class','electric-project-lines');
    const projectPaths=projectPathLayer.selectAll('path').data(projectLineRecords).join('path')
      .attr('class',record=>`electric-project-route project-${record.project.status} project-voltage-${String(record.project.voltage||'').replace(/\D/g,'')}`).attr('d',record=>path(record.feature))
      .attr('tabindex',0).attr('role','button').attr('aria-label',record=>`${record.project.name}; ${record.project.statusLabel}; ${record.project.voltage}`);
    projectPaths.append('title').text(record=>`${record.project.name} · ${record.project.statusLabel}. ${record.project.geometryNote||''}`);
    const projectPointRecords=projectDefinitions.filter(project=>project.coordinate||project.locatorObjectId).map(project=>{
      if(project.coordinate)return{project,position:projection(project.coordinate)};
      const locator=allGridFeatures.find(feature=>Number(feature.properties?.OBJECTID)===Number(project.locatorObjectId));
      return locator?{project,position:path.centroid(locator)}:null;
    }).filter(record=>record&&record.position.every(Number.isFinite));
    const projectPointLayer=projectLayer.append('g').attr('class','electric-project-points');
    const projectMarkers=projectPointLayer.selectAll('g').data(projectPointRecords).join('g')
      .attr('class',record=>`electric-project-marker project-${record.project.status} project-voltage-${String(record.project.voltage||'').replace(/\D/g,'')}${isSubstationProject(record.project)?` substation-project-marker ${String(record.project.kind||'').startsWith('Subestación')?'is-new':'is-expansion'}`:''}`).attr('transform',record=>`translate(${record.position.join(',')})`)
      .attr('tabindex',0).attr('role','button').attr('aria-label',record=>`${record.project.name}; ${record.project.statusLabel}; ${record.project.voltage}`);
    projectMarkers.append('rect').attr('class','electric-project-node').attr('x',-5).attr('y',-5).attr('width',10).attr('height',10);
    projectMarkers.append('title').text(record=>`${record.project.name} · ${record.project.statusLabel}. ${record.project.geometryNote||''}`);
    const biscayLayer=projectLayer.append('g').attr('class','biscay-interconnector-layer');
    const biscayPaths=biscayLayer.selectAll('path').data(biscayFeatures).join('path')
      .attr('class',d=>`biscay-interconnector-route segment-${d.properties?.segment||'unknown'}`).attr('d',path)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.properties?.label||biscayMetadata.name}; ${biscayMetadata.status||'en construcción'}`);
    biscayPaths.append('title').text(d=>`${d.properties?.label||biscayMetadata.name}. ${d.properties?.accuracy||biscayMetadata.geometryNote||''}`);
    const biscayNodeLayer=projectLayer.append('g').attr('class','biscay-interconnector-nodes');
    const biscayNodes=biscayNodeLayer.selectAll('g').data([
      {type:'converter',name:'Gatika · conversora',coordinate:biscayMetadata.gatika,dx:9,dy:16,anchor:'start'},
      {type:'landfall',name:'Aterraje submarino · Lemoiz',coordinate:biscayMetadata.seaExit,dx:9,dy:-9,anchor:'start'}
    ].filter(d=>Array.isArray(d.coordinate))).join('g').attr('class',d=>`biscay-node-group ${d.type}`).attr('transform',d=>`translate(${projection(d.coordinate).join(',')})`);
    biscayNodes.filter('.converter').append('rect').attr('class','biscay-node').attr('x',-4).attr('y',-4).attr('width',8).attr('height',8);
    biscayNodes.filter('.landfall').append('circle').attr('class','biscay-node').attr('r',4.3);
    biscayNodes.append('text').attr('class','biscay-node-label').attr('x',d=>d.dx).attr('y',d=>d.dy).attr('text-anchor',d=>d.anchor).text(d=>d.name);
    biscayNodes.append('title').text(d=>d.type==='landfall'?'Punto de salida central del cable al mar publicado en el proyecto técnico de INELFE':'Nueva estación conversora de Gatika');
    const marineFeature=biscayFeatures.find(feature=>feature.properties?.segment==='marine'),marineCoordinates=marineFeature?.geometry?.coordinates||[];
    if(marineCoordinates.length){const destination=marineCoordinates.at(-1),position=projection(destination);biscayNodeLayer.append('text').attr('class','biscay-destination-label').attr('x',position[0]-5).attr('y',position[1]-10).attr('text-anchor','end').text('Hacia Francia · Cubnezais')}
    mapLayer.selectAll('path.territory-outline').data(mapTerritories.features).join('path').attr('class','territory-outline').attr('d',path);
    mapLayer.selectAll('text.territory-label').data(mapTerritories.features).join('text').attr('class','territory-label').attr('x',d=>path.centroid(d)[0]).attr('y',d=>path.centroid(d)[1]).attr('dy','0.35em').text(d=>territoryLabel(d.properties?.TERRITORIO));

    const nonElectricLayer=mapLayer.append('g').attr('class','non-electric-infrastructure-layer');
    const nonElectricRouteRecords=nonElectricRouteDefinitions.filter(route=>Array.isArray(route.coordinates)&&route.coordinates.length>1).map(route=>({route,feature:{type:'Feature',properties:{routeId:route.id},geometry:{type:'LineString',coordinates:route.coordinates}}}));
    const nonElectricRoutes=nonElectricLayer.append('g').attr('class','non-electric-routes').selectAll('path').data(nonElectricRouteRecords).join('path')
      .attr('class',record=>`non-electric-route ${record.route.category==='oilRoute'?'route-oil':'route-gas'} status-${record.route.status||'operational'}`).attr('d',record=>path(record.feature))
      .attr('tabindex',0).attr('role','button').attr('aria-label',record=>`${record.route.name}; ${record.route.statusLabel||'estado no indicado'}; ${record.route.specification||''}`);
    nonElectricRoutes.append('title').text(record=>`${record.route.name} · ${record.route.specification||''}. ${record.route.geometryNote||nonElectricInfrastructure?.geometryNote||''}`);
    const renewableFuelFacilityIdFilter=Array.isArray(cfg.renewableFuelFacilityIds)?new Set(cfg.renewableFuelFacilityIds):null;
    const nonElectricFacilityRecords=nonElectricFacilityDefinitions.filter(facility=>Array.isArray(facility.coordinate)&&facility.coordinate.length===2).filter(facility=>facility.category!=='renewableGas'||!renewableFuelFacilityIdFilter||renewableFuelFacilityIdFilter.has(facility.id)),renewableFuelFacilityRecords=nonElectricFacilityRecords.filter(facility=>facility.category==='renewableGas'),biomassFacilityRecords=nonElectricFacilityRecords.filter(facility=>facility.category==='thermalBiomass'),fossilFacilityRecords=nonElectricFacilityRecords.filter(facility=>!['renewableGas','thermalBiomass'].includes(facility.category));
    const nonElectricFacilityPosition=facility=>{const position=projection(facility.coordinate),offset=Array.isArray(facility.displayOffset)?facility.displayOffset:[0,0];return[position[0]+Number(offset[0]||0),position[1]+Number(offset[1]||0)]};
    const nonElectricFacilityLayer=nonElectricLayer.append('g').attr('class','non-electric-facilities');
    const nonElectricFacilityLeaders=nonElectricFacilityLayer.selectAll('line.non-electric-facility-leader').data(nonElectricFacilityRecords.filter(facility=>Array.isArray(facility.displayOffset))).join('line').attr('class',facility=>`non-electric-facility-leader${facility.category==='renewableGas'?' renewable-fuel-leader':facility.category==='thermalBiomass'?' biomass-thermal-leader':''}`)
      .attr('x1',facility=>projection(facility.coordinate)[0]).attr('y1',facility=>projection(facility.coordinate)[1]).attr('x2',facility=>nonElectricFacilityPosition(facility)[0]).attr('y2',facility=>nonElectricFacilityPosition(facility)[1]);
    const nonElectricFacilityMarkers=nonElectricFacilityLayer.selectAll('g').data(nonElectricFacilityRecords).join('g')
      .attr('class',facility=>`non-electric-facility-marker category-${facility.category} status-${facility.status||'operational'}`)
      .attr('transform',facility=>`translate(${nonElectricFacilityPosition(facility).join(',')})`).attr('tabindex',0).attr('role','button')
      .attr('aria-label',facility=>`${facility.name}; ${nonElectricCategories[facility.category]?.label||'infraestructura energética no eléctrica'}; ${facility.statusLabel||'estado no indicado'}; ${facility.municipality||''}`);
    nonElectricFacilityMarkers.append('circle').attr('class','non-electric-facility-symbol').attr('r',facility=>facility.category==='gasFacility'?7.2:facility.category==='oilFacility'?7.8:6.5)
      .attr('fill',facility=>nonElectricCategories[facility.category]?.color||'#777');
    nonElectricFacilityMarkers.filter(facility=>facility.status&&facility.status!=='operational').append('circle').attr('class','non-electric-facility-future-ring').attr('r',10.2);
    nonElectricFacilityMarkers.append('title').text(facility=>`${facility.name} · ${facility.statusLabel||'Estado no indicado'} · ${facility.function||''}`);
    const importOriginPosition=projection(importOrigins?.coordinate||[-3.31,43.49]),importOriginVesselTransform=(scale=1)=>`translate(${importOriginPosition.join(',')}) scale(${1/Math.pow(scale,.62)})`;
    const importOriginVessel=nonElectricLayer.append('g').attr('class','energy-import-vessel').attr('transform',importOriginVesselTransform()).attr('tabindex',0).attr('role','button').attr('aria-label','Barco de importación de gas y petróleo. Consultar el origen por países en 2024.');
    importOriginVessel.append('path').attr('class','energy-import-vessel-hull').attr('d','M-31 2 L-24 10 H20 L29 1 H-18 L-22-3 H-31 Z');
    importOriginVessel.append('path').attr('class','energy-import-vessel-deck').attr('d','M-23-4 H11 V1 H-19 Z');
    [-13,-3,7].forEach(x=>importOriginVessel.append('circle').attr('class','energy-import-vessel-tank').attr('cx',x).attr('cy',-4).attr('r',4.2));
    importOriginVessel.append('rect').attr('class','energy-import-vessel-cabin').attr('x',13).attr('y',-13).attr('width',9).attr('height',14);
    importOriginVessel.append('rect').attr('class','energy-import-vessel-stack').attr('x',17).attr('y',-22).attr('width',4).attr('height',9);
    importOriginVessel.append('path').attr('class','energy-import-vessel-smoke').attr('d','M19-24 C15-28 21-30 17-34');
    importOriginVessel.append('text').attr('class','energy-import-origin-label').attr('x',0).attr('y',24).attr('text-anchor','middle').text('ORIGEN 2024');
    importOriginVessel.append('title').text('Origen del gas y del petróleo por países · datos publicados de 2024');
    const renewableImportOriginPosition=projection(renewableImportOrigins?.coordinate||[-2.98,43.465]),renewableImportOriginVesselTransform=(scale=1)=>`translate(${renewableImportOriginPosition.join(',')}) scale(${1/Math.pow(scale,.62)})`;
    const renewableImportOriginVessel=nonElectricLayer.append('g').attr('class','energy-import-vessel renewable-import-vessel').attr('transform',renewableImportOriginVesselTransform()).attr('tabindex',0).attr('role','button').attr('aria-label','Barco de importación de combustibles renovables. Consultar el origen de las materias primas y sus riesgos ambientales en 2024.');
    renewableImportOriginVessel.append('path').attr('class','energy-import-vessel-hull').attr('d','M-31 2 L-24 10 H20 L29 1 H-18 L-22-3 H-31 Z');
    renewableImportOriginVessel.append('path').attr('class','energy-import-vessel-deck').attr('d','M-23-4 H11 V1 H-19 Z');
    [-13,-3,7].forEach(x=>renewableImportOriginVessel.append('circle').attr('class','energy-import-vessel-tank').attr('cx',x).attr('cy',-4).attr('r',4.2));
    renewableImportOriginVessel.append('rect').attr('class','energy-import-vessel-cabin').attr('x',13).attr('y',-13).attr('width',9).attr('height',14);
    renewableImportOriginVessel.append('rect').attr('class','energy-import-vessel-stack').attr('x',17).attr('y',-22).attr('width',4).attr('height',9);
    renewableImportOriginVessel.append('path').attr('class','energy-import-vessel-smoke').attr('d','M19-24 C15-28 21-30 17-34');
    renewableImportOriginVessel.append('text').attr('class','energy-import-origin-label').attr('x',0).attr('y',24).attr('text-anchor','middle').text('ORIGEN REN. 2024');
    renewableImportOriginVessel.append('title').text('Origen declarado de las materias primas de combustibles renovables · España 2024');

    const municipalityFeaturesByName=d3.group(mapMunicipalities?.features||[],feature=>normalizePlaceName(feature.properties?.NOMBRE_CAS));
    const populationRecords=(populations?.populations||[]).map(([name,population])=>{
      const candidates=municipalityFeaturesByName.get(normalizePlaceName(name))||[];
      const feature=candidates.reduce((largest,candidate)=>!largest||path.area(candidate)>path.area(largest)?candidate:largest,null);
      if(!feature)return null;
      const position=path.centroid(feature);
      return{name,population:Number(population)||0,territory:territoryLabel(feature.properties?.TERRITORIO),feature,position};
    }).filter(record=>record&&record.position.every(Number.isFinite)).sort((a,b)=>a.population-b.population);
    const populationTotal=populationRecords.reduce((total,record)=>total+record.population,0),populationYear=String(populations?.referenceDate||'2025').slice(0,4);
    const populationRadius=d3.scaleSqrt().domain([100,d3.max(populationRecords,record=>record.population)||1]).range([2.1,9.5]).clamp(true);
    const populationLayer=mapLayer.append('g').attr('class','population-layer');
    const populationGroups=populationLayer.selectAll('g').data(populationRecords).join('g').attr('class','population-group')
      .attr('transform',record=>`translate(${record.position.join(',')})`).attr('tabindex',0).attr('role','button')
      .attr('aria-label',record=>`${record.name}; ${formatNumber(record.population,0)} habitantes a 1 de enero de ${populationYear}; ${record.territory}`);
    const populationDots=populationGroups.append('rect').attr('class','population-dot')
      .attr('x',record=>-populationRadius(record.population)).attr('y',record=>-populationRadius(record.population))
      .attr('width',record=>populationRadius(record.population)*2).attr('height',record=>populationRadius(record.population)*2);
    populationDots.append('title').text(record=>`${record.name} · ${formatNumber(record.population,0)} habitantes · 1 de enero de ${populationYear}`);
    const populationLabels=populationGroups.append('text').attr('class','population-label').attr('x',record=>populationRadius(record.population)+3).attr('y',3.5).text(record=>record.name);

    const radius=d3.scaleSqrt().domain([0.1,d3.max(records,d=>d.mw)||1]).range([3.3,19]).clamp(true);
    const windCapacityRadius=mw=>Math.max(2.3,Math.sqrt(Math.max(0,Number(mw)||0))*1.25);
    const windTurbinePath='M0 0 V5 M-2.5 5 H2.5 M0 0 L0 -5 M0 0 L-4.3 2.5 M0 0 L4.3 2.5';
    const appendMiniWindTurbines=(layer,data,position,radiusFor,className)=>{
      const symbols=layer.selectAll(`g.${className}`).data(data).join('g').attr('class',`mini-wind-turbine ${className}`)
        .attr('transform',d=>{const point=position(d),scale=Math.max(.58,Math.min(1.18,(Number(radiusFor(d))||3)/7));return`translate(${point.join(',')}) scale(${scale})`});
      symbols.append('path').attr('class','mini-wind-turbine-outline').attr('d',windTurbinePath);
      symbols.append('path').attr('class','mini-wind-turbine-line').attr('d',windTurbinePath);
      symbols.append('circle').attr('class','mini-wind-turbine-hub').attr('r',1.15);
      return symbols;
    };
    const ordered=[...records].sort((a,b)=>b.mw-a.mw);
    const populationAnchorByName=new Map(populationRecords.map(record=>[normalizePlaceName(record.name),record]));
    const markerPosition=(record,zoomScale=1)=>{
      const anchorName=record.properties?.mapDisplayAnchorMunicipality,anchor=anchorName?populationAnchorByName.get(normalizePlaceName(anchorName)):null;
      if(anchor){
        const labelNode=populationLabels.filter(item=>item===anchor).node(),measuredWidth=labelNode&&typeof labelNode.getComputedTextLength==='function'?Number(labelNode.getComputedTextLength())||0:0,baseLabelWidth=Math.max(String(anchor.name||anchorName).length*5.7,measuredWidth),scale=Math.max(1,Number(zoomScale)||1);
        const dotAndGap=(populationRadius(anchor.population)+3)/Math.pow(scale,.62),labelWidth=baseLabelWidth/Math.pow(scale,.78),screenGap=5/scale;
        return[anchor.position[0]+dotAndGap+labelWidth+screenGap,anchor.position[1]];
      }
      const position=projection(record.coordinate),offset=record.properties?.mapDisplayOffsetPx;
      return Array.isArray(offset)&&offset.length===2
        ?[position[0]+(Number(offset[0])||0)/Math.max(1,zoomScale),position[1]+(Number(offset[1])||0)/Math.max(1,zoomScale)]
        :position;
    };
    const cogenMarkerFill=record=>record.cogenFuelClass==='mixed'?patternUrl('cogen-fuel-mixed'):COGEN_FUEL_CLASSES[record.cogenFuelClass]?.color||TECHNOLOGIES.cogen.color;
    const operatingMarkerLayer=mapLayer.append('g').attr('class','energy-markers');
    const markers=operatingMarkerLayer.selectAll('circle').data(ordered).join('circle')
      .attr('class',d=>`energy-marker${d.informationalPrototype?' is-informational-prototype':''}${d.key==='cogen'?` cogen-fuel-${d.cogenFuelClass}`:''}`).attr('cx',d=>markerPosition(d)[0]).attr('cy',d=>markerPosition(d)[1])
      .attr('r',d=>d.informationalPrototype?10:d.isEveSolar?Math.max(5,d.mw<0.1?3.4:radius(d.mw)):d.key==='wind'?windCapacityRadius(d.mw):d.mw<0.1?2.3:radius(d.mw)).attr('fill',d=>d.informationalPrototype?'#f29b58':d.isEveSolar?EVE_SOLAR_COLOR:d.layerKey==='solar'?ESIOS_SOLAR_COLOR:d.key==='cogen'?cogenMarkerFill(d):TECHNOLOGIES[d.key].color).attr('fill-opacity',.95).attr('stroke',d=>d.informationalPrototype?'#6f2d00':d.isEveSolar?EVE_SOLAR_STROKE:d.layerKey==='solar'?ESIOS_SOLAR_STROKE:'#fff').attr('stroke-width',d=>d.informationalPrototype?2.5:d.isEveSolar?1.6:.8)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.properties.descripcion||'Instalación'}; ${d.isEveSolar?'Solar fotovoltaica a red · declarada por EVE':d.isDocumentedSelfConsumption?(d.properties.selfConsumptionLabel||'Autoconsumo documentado'):d.key==='solar'?'Fotovoltaica inscrita en ESIOS · modalidad no determinada':d.key==='cogen'?COGEN_FUEL_CLASSES[d.cogenFuelClass].label:TECHNOLOGIES[d.key].label}; ${d.informationalPrototype?'potencia no publicada; prototipo experimental':`${formatNumber(d.mw,Math.max(0,d.mw<1?3:1))} MW`}; ${cleanMunicipality(d.properties.municipio)}`);
    const wavePrototypeLabels=operatingMarkerLayer.selectAll('text.wave-prototype-label').data(ordered.filter(d=>d.informationalPrototype)).join('text')
      .attr('class','wave-prototype-label').attr('x',d=>markerPosition(d)[0]+13).attr('y',d=>markerPosition(d)[1]-11).text('MARMOK-A-5');
    const operatingWindTurbines=appendMiniWindTurbines(operatingMarkerLayer,ordered.filter(d=>d.key==='wind'),d=>projection(d.coordinate),d=>windCapacityRadius(d.mw),'mini-wind-operating');

    const generationProjectRecords=generationProjectDefinitions.filter(project=>Array.isArray(project.coordinate)&&project.coordinate.length===2).map(project=>({...project,key:project.technology in TECHNOLOGIES?project.technology:'other',mw:Number(project.mw)||0}));
    const generationProjectRadius=d3.scaleSqrt().domain([.5,d3.max(generationProjectRecords,d=>d.mw)||1]).range([5,17]).clamp(true);
    const generationProjectLayer=mapLayer.append('g').attr('class','generation-project-layer');
    const generationProjectMarkers=generationProjectLayer.selectAll('circle').data([...generationProjectRecords].sort((a,b)=>b.mw-a.mw)).join('circle')
      .attr('class',d=>`generation-project-marker project-${d.status}`).attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1])
      .attr('r',d=>d.key==='wind'?windCapacityRadius(d.mw):generationProjectRadius(d.mw)).attr('fill',d=>patternUrl(`generation-project-${d.key}-hatch`))
      .attr('data-project-id',d=>d.id)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.name}; ${GENERATION_PROJECT_TECHNOLOGY_LABELS[d.key]||TECHNOLOGIES[d.key].label}; ${formatNumber(d.mw,d.powerBasis==='MWp'?2:d.mw<10?1:0)} ${d.powerBasis||'MW'}; ${d.statusLabel}; ${d.municipalities.join(', ')}`);
    generationProjectMarkers.append('title').text(d=>`${d.name} · ${GENERATION_PROJECT_TECHNOLOGY_LABELS[d.key]||TECHNOLOGIES[d.key].label} · ${formatNumber(d.mw,d.powerBasis==='MWp'?2:d.mw<10?1:0)} ${d.powerBasis||'MW'} · ${d.statusLabel}`);
    const generationProjectWindTurbines=appendMiniWindTurbines(generationProjectLayer,generationProjectRecords.filter(d=>d.key==='wind'),d=>projection(d.coordinate),d=>windCapacityRadius(d.mw),'mini-wind-project');

    const pipelineProjectRecords=pipelineProjectDefinitions.filter(project=>Array.isArray(project.coordinate)&&project.coordinate.length===2).map(project=>({...project,key:project.technology in TECHNOLOGIES?project.technology:'other',mw:Number(project.mw)||0}));
    const pipelineProjectRadius=d3.scaleSqrt().domain([.5,d3.max(pipelineProjectRecords,d=>d.mw)||1]).range([5,17]).clamp(true);
    const pipelineProjectLayer=mapLayer.append('g').attr('class','pipeline-project-layer');
    const pipelineProjectMarkers=pipelineProjectLayer.selectAll('circle').data([...pipelineProjectRecords].sort((a,b)=>b.mw-a.mw)).join('circle')
      .attr('class',d=>`pipeline-project-marker stage-${d.stage}`).attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1])
      .attr('r',d=>d.key==='wind'?windCapacityRadius(d.mw):pipelineProjectRadius(d.mw)).attr('fill',d=>patternUrl(`pipeline-project-${d.key}-dots`))
      .attr('data-pipeline-project-id',d=>d.id)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.name}; ${GENERATION_PROJECT_TECHNOLOGY_LABELS[d.key]||TECHNOLOGIES[d.key].label}; ${formatNumber(d.mw,d.mw<10?2:0)} MW solicitados; ${d.stageLabel}; ${d.municipalities.join(', ')}`);
    pipelineProjectMarkers.append('title').text(d=>`${d.name} · ${formatNumber(d.mw,d.mw<10?2:0)} MW solicitados · ${d.stageLabel} · suma exploratoria al activar; no autorizado`);
    const pipelineProjectWindTurbines=appendMiniWindTurbines(pipelineProjectLayer,pipelineProjectRecords.filter(d=>d.key==='wind'),d=>projection(d.coordinate),d=>windCapacityRadius(d.mw),'mini-wind-pipeline');

    const ptsPotentialRecords=ptsPotentialDefinitions.filter(site=>Array.isArray(site.coordinate)&&site.coordinate.length===2).map(site=>({...site,key:site.technology in TECHNOLOGIES?site.technology:'other',mw:Number(site.potentialMW)||0}));
    const ptsPotentialRadius=d3.scaleSqrt().domain([4,d3.max(ptsPotentialRecords,d=>d.mw)||1]).range([4.8,17]).clamp(true);
    const ptsPotentialLayer=mapLayer.append('g').attr('class','pts-potential-layer');
    const ptsPotentialMarkers=ptsPotentialLayer.selectAll('circle').data([...ptsPotentialRecords].sort((a,b)=>b.mw-a.mw)).join('circle')
      .attr('class',d=>`pts-potential-marker${d.isMarinePrototype?' is-marine-prototype':''}`).attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1])
      .attr('r',d=>d.isMarinePrototype?8.5:d.key==='wind'?windCapacityRadius(d.mw):ptsPotentialRadius(d.mw)).attr('fill',d=>patternUrl(`pts-potential-${d.key}-grid`))
      .attr('tabindex',0).attr('role','button')
      .attr('aria-label',d=>d.isMarinePrototype?`${d.name}; prototipo undimotriz experimental; ${d.statusLabel}; no se suma al modelo`:`${d.name}; ${d.technologyLabel||PTS_TECHNOLOGY_LABELS[d.key]||TECHNOLOGIES[d.key].label}; Zona de Localización Seleccionada del PTS; potencia orientativa no oficial por zona ${formatNumber(d.mw,d.mw<10?1:0)} MW; ${(d.municipalities||[]).join(', ')}`);
    ptsPotentialMarkers.append('title').text(d=>d.isMarinePrototype?`${d.name} · Prototipo experimental · fuera de la capa de generación en construcción · no se suma al modelo`:`${d.name} · ${d.technologyLabel||PTS_TECHNOLOGY_LABELS[d.key]||TECHNOLOGIES[d.key].label} · ${formatNumber(d.mw,d.mw<10?1:0)} MW orientativos, no asignación oficial por zona`);
    const marinePrototypeLabels=ptsPotentialLayer.selectAll('text.pts-marine-prototype-label').data(ptsPotentialRecords.filter(d=>d.isMarinePrototype)).join('text')
      .attr('class','pts-marine-prototype-label')
      .attr('x',d=>projection(d.coordinate)[0]+11)
      .attr('y',d=>projection(d.coordinate)[1]+(d.id==='achieve-ceto'?-9:15))
      .text(d=>d.id==='achieve-ceto'?'ACHIEVE CETO':'MARMOK-A-5');
    const ptsPotentialWindTurbines=appendMiniWindTurbines(ptsPotentialLayer,ptsPotentialRecords.filter(d=>d.key==='wind'),d=>projection(d.coordinate),d=>windCapacityRadius(d.mw),'mini-wind-pts');

    const storageRecords=storageDefinitions.filter(facility=>Array.isArray(facility.coordinate)&&facility.coordinate.length===2).map(facility=>({...facility,powerMW:Number.isFinite(Number(facility.powerMW))?Number(facility.powerMW):null,energyMWh:Number.isFinite(Number(facility.energyMWh))?Number(facility.energyMWh):null,sizeBasis:Number(facility.energyMWh)||Number(facility.powerMW)||1}));
    const storageRadius=d3.scaleSqrt().domain([1,d3.max(storageRecords,d=>d.sizeBasis)||1]).range([5,17]).clamp(true);
    const storageLayer=mapLayer.append('g').attr('class','electric-storage-layer');
    const storageMarkerGroups=storageLayer.selectAll('g').data([...storageRecords].sort((a,b)=>b.sizeBasis-a.sizeBasis)).join('g')
      .attr('class',d=>`storage-marker-group storage-${d.status}`).attr('transform',d=>`translate(${projection(d.coordinate).join(',')})`)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.name}; ${d.statusLabel}; ${d.powerMW!=null?`${formatNumber(d.powerMW,2)} MW`:''}${d.energyMWh!=null?`; ${formatNumber(d.energyMWh,2)} MWh`:''}`);
    const storageMarkers=storageMarkerGroups.append('circle').attr('class','storage-marker').attr('r',d=>storageRadius(d.sizeBasis))
      .attr('fill',d=>d.status==='operational'?'#6fb7bf':d.status==='authorized'?patternUrl('electric-storage-authorized-hatch'):patternUrl('electric-storage-pipeline-grid'));
    storageMarkerGroups.append('text').attr('class','storage-marker-label').text(d=>d.storageKind==='pumped-hydro'?'H':'B');
    storageMarkerGroups.append('title').text(d=>`${d.name} · ${d.statusLabel}${d.powerMW!=null?` · ${formatNumber(d.powerMW,2)} MW`:''}${d.energyMWh!=null?` · ${formatNumber(d.energyMWh,2)} MWh`:''}`);

    const offshoreWindPostPtsPosition=(site,zoomScale=1)=>{
      const position=projection(site.coordinate),offset=site.displayOffsetPx||[0,0];
      return[position[0]+offset[0]/Math.max(1,zoomScale),position[1]+offset[1]/Math.max(1,zoomScale)];
    };
    const offshoreWindPostPtsLayer=mapLayer.append('g').attr('class','offshore-wind-post-pts-layer');
    const offshoreWindPostPtsMarkers=offshoreWindPostPtsLayer.selectAll('g').data(OFFSHORE_WIND_POST_PTS).join('g')
      .attr('class',d=>`offshore-wind-post-pts-marker${d.id==='geroa-bimep-2'?' is-geroa':''}`).attr('transform',d=>`translate(${offshoreWindPostPtsPosition(d).join(',')})`)
      .attr('tabindex',0).attr('role','button')
      .attr('aria-label',d=>`${d.name}; eólica marina flotante ${d.id==='geroa-bimep-2'?'precomercial propuesta, fuera del PTS vasco':'en ensayo'}; ${d.statusLabel}; ${d.scope}`);
    offshoreWindPostPtsMarkers.append('circle').attr('class','offshore-wind-post-pts-disc').attr('r',d=>d.id==='geroa-bimep-2'?16:7.5);
    offshoreWindPostPtsMarkers.append('path').attr('class','offshore-wind-post-pts-turbine').attr('d','M0 1 V10 M-4 10 H4 M0 1 L0 -8 M0 1 L-7 5 M0 1 L7 5').attr('transform',d=>d.id==='geroa-bimep-2'?null:'scale(.72)');
    offshoreWindPostPtsMarkers.append('circle').attr('class','offshore-wind-post-pts-hub').attr('r',d=>d.id==='geroa-bimep-2'?1.7:1.25);
    offshoreWindPostPtsMarkers.append('text').attr('class','offshore-wind-post-pts-label')
      .attr('x',d=>d.id==='geroa-bimep-2'?-18:10).attr('y',d=>d.id==='geroa-bimep-2'?-18:14)
      .attr('text-anchor',d=>d.id==='geroa-bimep-2'?'end':'start').text(d=>d.id==='geroa-bimep-2'?'GEROA · hasta 50 MW':'BiMEP · DemoSATH');
    offshoreWindPostPtsMarkers.append('title').text(d=>`${d.name} · Eólica marina flotante · ${d.statusLabel}.${d.id==='geroa-bimep-2'?' Fuera del PTS vasco; incluida en el POEM para I+D.':''}`);

    const windRepoweringLayer=mapLayer.append('g').attr('class','wind-repowering-layer');
    const windRepoweringMarkers=windRepoweringLayer.selectAll('g').data([...WIND_REPOWERING_POTENTIAL].sort((a,b)=>b.repoweredMW-a.repoweredMW)).join('g')
      .attr('class','wind-repowering-marker').attr('transform',d=>`translate(${projection(d.coordinate).join(',')})`)
      .attr('tabindex',0).attr('role','button')
      .attr('aria-label',d=>`${d.name}; potencial de repotenciación; ${formatNumber(d.currentMW,2)} MW actuales; hasta ${formatNumber(d.repoweredMW,3)} MW según el PTS`);
    windRepoweringMarkers.append('circle').attr('class','wind-repowering-disc').attr('r',d=>windCapacityRadius(d.repoweredMW)).style('fill',patternUrl('wind-repowering-grid'));
    const windRepoweringTurbines=windRepoweringMarkers.append('g').attr('class','mini-wind-turbine mini-wind-repowering').attr('transform','translate(0,-3.8) scale(.58)');
    windRepoweringTurbines.append('path').attr('class','mini-wind-turbine-outline').attr('d',windTurbinePath);
    windRepoweringTurbines.append('path').attr('class','mini-wind-turbine-line').attr('d',windTurbinePath);
    windRepoweringTurbines.append('circle').attr('class','mini-wind-turbine-hub').attr('r',1.15);
    windRepoweringMarkers.append('text').attr('y',6.2).attr('dy','.35em').text('P');
    windRepoweringMarkers.append('title').text(d=>`${d.name} · Repotenciación PTS: ${formatNumber(d.currentMW,2)} → ${formatNumber(d.repoweredMW,3)} MW (+${formatNumber(d.additionalMW,3)} MW)`);

    const verifiedSubstationLayer=mapLayer.append('g').attr('class','verified-substations');
    const verifiedSubstations=verifiedSubstationLayer.selectAll('g').data(VERIFIED_SUBSTATIONS).join('g').attr('class',d=>`verified-substation-group substation-voltage-${String(d.voltage||'').includes('400')?'400':String(d.voltage||'').includes('220')?'220':'132'}`).attr('transform',d=>`translate(${projection(d.coordinate).join(',')})`);
    verifiedSubstations.append('rect').attr('class','verified-substation-node').attr('x',-3.5).attr('y',-3.5).attr('width',7).attr('height',7);
    verifiedSubstations.append('text').attr('class','verified-substation-label').attr('x',d=>d.dx).attr('y',d=>d.dy).attr('text-anchor',d=>d.anchor).text(d=>d.name);
    verifiedSubstations.append('title').text(d=>`${d.name} · ${d.voltage} · nodo verificado en GeoEuskadi`);

    const nodeLayer=mapLayer.append('g').attr('class','interconnection-nodes');
    const networkNodes=nodeLayer.selectAll('g').data(INTERCONNECTION_NODES).join('g').attr('class','interconnection-node-group')
      .attr('transform',d=>`translate(${projection(d.coordinate).join(',')})`).attr('tabindex',0).attr('role','button')
      .attr('aria-label',d=>`${d.name}; interconexión exterior bidireccional; ${d.voltage}; conexión con ${d.territory}; suma nominal de circuitos ${formatNumber(d.capacityTotalMVA,0)} MVA`);
    networkNodes.append('path').attr('class','interconnection-node').attr('d',d3.symbol().type(d3.symbolDiamond).size(105));
    networkNodes.append('text').attr('class','interconnection-label').attr('x',9).attr('y',-8).text(d=>d.name);
    const importGatewayLayer=mapLayer.append('g').attr('class','import-gateway-layer'),euskadiMapCenter=projection([-2.55,43.08]);
    const normalizeGatewayText=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const gatewayAliases={
      Hernani:['hernani'],Arkale:['arkale'],Itxaso:['itxaso'],
      'Vitoria-Gasteiz':['vitoria'],'Puentelarra':['puentelarra'],Güeñes:['guenes']
    };
    const gatewayCoordinateOverrides={
      Güeñes:[-3.41761,43.13332]
    };
    const isInsideEuskadi=coordinate=>(mapTerritories.features||[]).some(feature=>d3.geoContains(feature,coordinate));
    const geometryLines=geometry=>geometry?.type==='LineString'?[geometry.coordinates]:geometry?.type==='MultiLineString'?geometry.coordinates:[];
    const boundaryPoint=(insidePoint,outsidePoint)=>{
      let inside=insidePoint.slice(),outside=outsidePoint.slice();
      for(let iteration=0;iteration<28;iteration+=1){
        const midpoint=[(inside[0]+outside[0])/2,(inside[1]+outside[1])/2];
        if(isInsideEuskadi(midpoint))inside=midpoint;else outside=midpoint;
      }
      return[(inside[0]+outside[0])/2,(inside[1]+outside[1])/2];
    };
    const gatewayCoordinateForNode=node=>{
      const aliases=gatewayAliases[node.name]||[node.name];
      const matchingFeatures=allGridFeatures.filter(feature=>{
        const featureText=normalizeGatewayText(Object.values(feature.properties||{}).join(' '));
        return aliases.some(alias=>featureText.includes(normalizeGatewayText(alias)));
      });
      const crossings=[];
      matchingFeatures.forEach(feature=>geometryLines(feature.geometry).forEach(line=>{
        for(let index=1;index<line.length;index+=1){
          const previous=line[index-1],current=line[index],previousInside=isInsideEuskadi(previous),currentInside=isInsideEuskadi(current);
          if(previousInside!==currentInside){
            crossings.push(boundaryPoint(previousInside?previous:current,previousInside?current:previous));
          }
        }
      }));
      if(!crossings.length)return node.coordinate;
      return crossings.reduce((nearest,candidate)=>d3.geoDistance(candidate,node.coordinate)<d3.geoDistance(nearest,node.coordinate)?candidate:nearest,crossings[0]);
    };
    const rawImportGatewayRecords=INTERCONNECTION_NODES.map(node=>{
      const gatewayCoordinate=gatewayCoordinateOverrides[node.name]||gatewayCoordinateForNode(node),borderPosition=projection(gatewayCoordinate);
      return{...node,gatewayCoordinate,borderPosition};
    });
    const clusteredImportGatewayRecords=[];
    rawImportGatewayRecords.forEach(record=>{
      const isIparraldeGateway=name=>name==='Hernani'||name==='Arkale'||name==='Hernani–Arkale';
      const existing=!record.isFuture&&clusteredImportGatewayRecords.find(candidate=>!candidate.isFuture&&(
        (isIparraldeGateway(candidate.name)&&isIparraldeGateway(record.name))||
        Math.hypot(candidate.borderPosition[0]-record.borderPosition[0],candidate.borderPosition[1]-record.borderPosition[1])<26
      ));
      if(!existing){clusteredImportGatewayRecords.push({...record});return}
      const previousCapacity=existing.capacityTotalMVA,totalCapacity=previousCapacity+record.capacityTotalMVA;
      const isIparraldeCluster=isIparraldeGateway(existing.name)&&isIparraldeGateway(record.name);
      existing.name=isIparraldeCluster?'Hernani–Arkale':`${existing.name} / ${record.name}`;
      existing.borderPosition=[(existing.borderPosition[0]*previousCapacity+record.borderPosition[0]*record.capacityTotalMVA)/totalCapacity,(existing.borderPosition[1]*previousCapacity+record.borderPosition[1]*record.capacityTotalMVA)/totalCapacity];
      existing.gatewayCoordinate=[(existing.gatewayCoordinate[0]*previousCapacity+record.gatewayCoordinate[0]*record.capacityTotalMVA)/totalCapacity,(existing.gatewayCoordinate[1]*previousCapacity+record.gatewayCoordinate[1]*record.capacityTotalMVA)/totalCapacity];
      existing.coordinate=existing.gatewayCoordinate;
      existing.capacityTotalMVA=totalCapacity;
      existing.capacityCircuits=[...(existing.capacityCircuits||[]),...(record.capacityCircuits||[])];
      existing.links=[...(existing.links||[]),...(record.links||[])];
      existing.territory=[...new Set(`${existing.territory} y ${record.territory}`.split(' y '))].join(' y ');
      existing.originLabel=[...new Set([existing.originLabel,record.originLabel].filter(Boolean))].join(' / ');
      existing.voltage=[...new Set(`${existing.voltage} y ${record.voltage}`.split(' y '))].join(' y ');
      existing.capacityNote=[existing.capacityNote,record.capacityNote,isIparraldeCluster?'Hernani–Argia (400 kV) y Arkale–Argia (220 kV) son dos infraestructuras físicas distintas que llegan a la misma red de Iparralde. El mapa las agrupa en una única puerta visual de 2.560 MVA nominales; esta suma no equivale a capacidad comercial simultánea garantizada.':'Los dos corredores se representan mediante una sola flecha porque cruzan la frontera en puntos cartográficamente casi coincidentes.'].filter(Boolean).join(' ');
    });
    const useEstimatedGatewayFlows=Boolean(modelledGatewayFlows)||(isTendentialScenario&&!timelineEnabled);
    const PENINSULAR_FLOW_MAX_GWH=Number(window.energyMapPeninsularFlowMaxGWh)||16026;
    const estimatedGatewayFlowByName=modelledGatewayFlows||{
      'Hernani–Arkale':{from:'Euskadi',to:'Francia',gwh:687,renewableShare:34.2,outward:true},
      Itxaso:{from:'Navarra',to:'Euskadi',gwh:2821,renewableShare:68.3},
      'Vitoria-Gasteiz':{from:'Castilla y León',to:'Euskadi',gwh:3768,renewableShare:94},
      Puentelarra:{from:'La Rioja',to:'Euskadi',gwh:337,renewableShare:90.8,coordinate:[-2.72,42.62]},
      Güeñes:{from:'Cantabria',to:'Euskadi',gwh:3750,renewableShare:82.4}
    };
    const importGatewayLengthScale=d3.scaleSqrt().domain([0,3600]).range([.78,1.5]).clamp(true),
      importGatewayThicknessScale=d3.scaleLinear().domain([0,3600]).range([.42,2.35]).clamp(true),
      estimatedGatewayThicknessScale=d3.scaleLinear().domain([0,PENINSULAR_FLOW_MAX_GWH]).range([0,9]);
    const importGatewayRecords=clusteredImportGatewayRecords.map(node=>{
      const estimatedFlow=useEstimatedGatewayFlows&&!node.isFuture?(estimatedGatewayFlowByName[node.name]||Object.entries(estimatedGatewayFlowByName).find(([name])=>node.name.includes(name))?.[1]||null):null,
        normativeReinforcement=isNormativeScenario&&!timelineEnabled&&node.name.includes('Itxaso')?1400:0,
        displayCapacityMVA=node.capacityTotalMVA+normativeReinforcement,
        flowBorderPosition=estimatedFlow?.coordinate?projection(estimatedFlow.coordinate):node.borderPosition,
        inwardAngle=node.isFuture?150:Math.atan2(euskadiMapCenter[1]-flowBorderPosition[1],euskadiMapCenter[0]-flowBorderPosition[0])*180/Math.PI,
        angle=estimatedFlow?.outward?inwardAngle+180:inwardAngle,
        symbolScale=estimatedFlow?.gwh ? .43 : importGatewayLengthScale(displayCapacityMVA),
        thicknessScale=estimatedFlow?.gwh?estimatedGatewayThicknessScale(estimatedFlow.gwh):importGatewayThicknessScale(displayCapacityMVA),
        angleRadians=angle*Math.PI/180,
        outwardOffset=node.isFuture?32*symbolScale:9+3*symbolScale;
      const position=[flowBorderPosition[0]-Math.cos(angleRadians)*outwardOffset,flowBorderPosition[1]-Math.sin(angleRadians)*outwardOffset];
      return{...node,estimatedFlow,estimatedAnnualGWh:estimatedFlow?.gwh||null,displayedAnnualGWh:estimatedFlow?.gwh||null,flowRenewableShare:estimatedFlow?.renewableShare??null,displayCapacityMVA,position,angle,symbolScale,thicknessScale,labelDy:-10*symbolScale};
    }).filter(node=>!modelledGatewayFlows||node.estimatedFlow);
    const importGateways=importGatewayLayer.selectAll('g').data(importGatewayRecords).join('g').attr('class',d=>`import-gateway${d.isFuture?' is-future':''}${d.estimatedFlow?' is-estimated-flow':''}`)
      .attr('transform',d=>`translate(${d.position.join(',')})`).attr('tabindex',0).attr('role','button')
      .attr('aria-label',d=>d.estimatedFlow?`Conexión eléctrica entre ${d.estimatedFlow.from} y ${d.estimatedFlow.to}; ${d.estimatedFlow.modelled?'flujo anual modelizado para 2050':'saldo anual probable'} de ${d.estimatedFlow.from} hacia ${d.estimatedFlow.to}: ${formatNumber(d.estimatedAnnualGWh,0)} GWh; ${formatNumber(d.flowRenewableShare,1)} % renovable y ${formatNumber(100-d.flowRenewableShare,1)} % no renovable`:`Conexión eléctrica ${d.isFuture?'futura ':''}bidireccional por el corredor de ${d.name}; cruce de frontera con ${d.territory}; ${formatNumber(d.capacityTotalMVA,0)} MVA nominales asociados; bandas agregadas de 2024: ${formatNumber(importRenewableShare,1)} % renovable y ${formatNumber(importNonRenewableShare,1)} % no renovable; ${d.voltage}${d.isFuture?`; ${d.statusLabel}`:''}`);
    const arrowStart=-66,dualImportArrowPaths=(renewablePercent,gwh=0,compactHead=false)=>{
      const isMajor=gwh>=6000,arrowEnd=isMajor?28:24,arrowHeadStart=isMajor?-2:8,reverseHeadEnd=-48,gap=compactHead?0:1.8,totalThickness=18,
        renewableThickness=(totalThickness-gap)*Math.max(0,Math.min(100,renewablePercent))/100,
        nonRenewableThickness=(totalThickness-gap)-renewableThickness;
      const makeBand=(center,thickness)=>{
        const half=thickness/2,top=center-half,bottom=center+half,headHalf=half+(compactHead?1.6+thickness*.03:isMajor?4+thickness*.10:5);
        return`M${arrowStart},${center} L${reverseHeadEnd},${center-headHalf} V${top} H${arrowHeadStart} V${center-headHalf} L${arrowEnd},${center} L${arrowHeadStart},${center+headHalf} V${bottom} H${reverseHeadEnd} V${center+headHalf} Z`;
      };
      const nonRenewableCenter=-(gap/2+nonRenewableThickness/2),renewableCenter=gap/2+renewableThickness/2;
      return{
        nonRenewable:makeBand(nonRenewableCenter,nonRenewableThickness),
        renewable:makeBand(renewableCenter,renewableThickness)
      };
    };
    const gatewaySymbolTransform=(d,zoomScale=1,capacity=d.displayCapacityMVA)=>{
      const length=d.estimatedFlow ? .43 : importGatewayLengthScale(capacity),
        thickness=d.estimatedFlow?estimatedGatewayThicknessScale(d.displayedAnnualGWh??d.estimatedAnnualGWh):importGatewayThicknessScale(capacity);
      return`rotate(${d.angle}) scale(${length/Math.pow(zoomScale,.72)},${thickness/Math.pow(zoomScale,.72)})`;
    };
    const importGatewaySymbols=importGateways.append('g').attr('class','import-gateway-symbol').attr('transform',d=>gatewaySymbolTransform(d));
    importGatewaySymbols.append('path').attr('class','import-gateway-arrow-segment import-gateway-arrow-nonrenewable').attr('d',d=>dualImportArrowPaths(d.flowRenewableShare??importRenewableShare,d.estimatedAnnualGWh||0).nonRenewable);
    importGatewaySymbols.append('path').attr('class','import-gateway-arrow-segment import-gateway-arrow-renewable').attr('d',d=>dualImportArrowPaths(d.flowRenewableShare??importRenewableShare,d.estimatedAnnualGWh||0).renewable);
    const importGatewayVoltageIcons=importGateways.append('g').attr('class','import-gateway-voltage-icon').attr('aria-hidden','true');
    importGatewayVoltageIcons.style('display',d=>d.estimatedFlow?'none':null);
    importGatewayVoltageIcons.append('path').attr('class','import-gateway-voltage-sign').attr('d','M0,-12 L12,10 H-12 Z');
    importGatewayVoltageIcons.append('path').attr('class','import-gateway-voltage-bolt').attr('d','M1.2,-5 L-3,0.5 H0 L-1.1,4.8 L4,-1.2 H1.2 Z');
    const gatewayLabelPosition=(d,zoomScale=1)=>{
      if(d.estimatedFlow?.labelInside)return{x:32/Math.pow(zoomScale,.72),y:-9/Math.pow(zoomScale,.72),anchor:'start',tailY:0};
      const angleRadians=d.angle*Math.PI/180,tailDistance=(Math.abs(arrowStart)+5)*d.symbolScale/Math.pow(zoomScale,.72),tailX=-Math.cos(angleRadians)*tailDistance,tailY=-Math.sin(angleRadians)*tailDistance;
      if(Math.abs(tailX)<7)return{x:tailX,y:tailY+(tailY>=0?11:-17)/Math.pow(zoomScale,.72),anchor:'middle',tailY};
      return{x:tailX+(tailX>0?5:-5)/Math.pow(zoomScale,.72),y:tailY+(tailY<0?-8:3)/Math.pow(zoomScale,.72),anchor:tailX>0?'start':'end',tailY};
    };
    const gatewayLabelLines=d=>d.estimatedFlow?[`${d.estimatedFlow.from} → ${d.estimatedFlow.to}`,`${formatNumber(d.displayedAnnualGWh??d.estimatedAnnualGWh,0)} GWh · ${d.estimatedFlow.modelled?'modelizado 2050':'estimado 2025'}`]:d.isFuture?[`Desde Francia · Lemoiz · ${formatNumber(d.displayCapacityMVA,0)} MW`,`(${d.originLabel}) · en construcción`]:[`${d.name} · ${formatNumber(d.displayCapacityMVA,0)} MVA${d.displayCapacityMVA>d.capacityTotalMVA?' · con refuerzo':''}`,`(${d.originLabel||d.territory})`];
    const importGatewayLabels=importGateways.append('text').attr('class','import-gateway-label').attr('x',d=>gatewayLabelPosition(d).x).attr('y',d=>gatewayLabelPosition(d).y).attr('text-anchor',d=>gatewayLabelPosition(d).anchor);
    importGatewayLabels.each(function(d){const label=d3.select(this),x=gatewayLabelPosition(d).x;gatewayLabelLines(d).forEach((line,index)=>label.append('tspan').attr('x',x).attr('dy',index?'1.15em':'0em').text(line))});
    importGateways.append('title').text(d=>d.estimatedFlow?`Conexión ${d.estimatedFlow.from} ↔ ${d.estimatedFlow.to} · ${d.estimatedFlow.modelled?'flujo modelizado 2050':'saldo probable 2025'} ${d.estimatedFlow.from} → ${d.estimatedFlow.to}: ${formatNumber(d.estimatedAnnualGWh,0)} GWh · ${formatNumber(d.flowRenewableShare,1)} % renovable / ${formatNumber(100-d.flowRenewableShare,1)} % no renovable`:`Conexión ${d.isFuture?'futura en construcción ':''}bidireccional · cruce fronterizo del corredor de ${d.name} · ${formatNumber(d.capacityTotalMVA,0)} MVA nominales · conexión con ${d.territory} · color agregado 2024: ${formatNumber(importRenewableShare,1)} % renovable y ${formatNumber(importNonRenewableShare,1)} % no renovable`);
    nonElectricLayer.raise();

    let currentZoomScale=1,markerClusterTimer=0;
    const syncModelledGatewayFlows=totalGWh=>{
      if(!modelledGatewayFlows)return;
      const scale=importedElectricEnergyBase?Math.max(0,totalGWh)/importedElectricEnergyBase:0;
      importGatewayRecords.forEach(record=>{record.displayedAnnualGWh=(record.estimatedAnnualGWh||0)*scale});
      importGatewaySymbols.attr('transform',d=>gatewaySymbolTransform(d,currentZoomScale));
      importGatewaySymbols.select('.import-gateway-arrow-nonrenewable').attr('d',d=>dualImportArrowPaths(d.flowRenewableShare??importRenewableShare,d.displayedAnnualGWh||0).nonRenewable);
      importGatewaySymbols.select('.import-gateway-arrow-renewable').attr('d',d=>dualImportArrowPaths(d.flowRenewableShare??importRenewableShare,d.displayedAnnualGWh||0).renewable);
      importGatewayLabels.each(function(d){const label=d3.select(this),position=gatewayLabelPosition(d,currentZoomScale);label.attr('x',position.x).attr('y',position.y).attr('text-anchor',position.anchor);label.selectAll('tspan').remove();gatewayLabelLines(d).forEach((line,index)=>label.append('tspan').attr('x',position.x).attr('dy',index?'1.15em':'0em').text(line))});
      importGateways.attr('aria-label',d=>`Conexión eléctrica entre ${d.estimatedFlow.from} y ${d.estimatedFlow.to}; flujo anual modelizado para la senda activa de ${d.estimatedFlow.from} hacia ${d.estimatedFlow.to}: ${formatNumber(d.displayedAnnualGWh,0)} GWh; ${formatNumber(d.flowRenewableShare,1)} % renovable y ${formatNumber(100-d.flowRenewableShare,1)} % no renovable`);
      importGateways.select('title').text(d=>`Conexión ${d.estimatedFlow.from} ↔ ${d.estimatedFlow.to} · flujo modelizado para la senda activa ${d.estimatedFlow.from} → ${d.estimatedFlow.to}: ${formatNumber(d.displayedAnnualGWh,0)} GWh · ${formatNumber(d.flowRenewableShare,1)} % renovable / ${formatNumber(100-d.flowRenewableShare,1)} % no renovable`);
    };
    const markerClusterPositions=new Map();
    const markerNodeIsVisible=node=>{
      for(let current=node;current&&current!==mapLayer.node();current=current.parentNode){
        if(current.style?.display==='none'||current.getAttribute?.('display')==='none')return false;
      }
      return true;
    };
    const markerStableKey=(kind,record,index)=>`${kind}:${record?.id??record?.properties?.objectid??record?.properties?.OBJECTID??record?.name??index}`;
    const markerKeyAngle=key=>{
      let hash=2166136261;
      for(let index=0;index<key.length;index+=1)hash=Math.imul(hash^key.charCodeAt(index),16777619);
      return((hash>>>0)%360)*Math.PI/180;
    };
    const miniWindTransform=(record,position,radiusFor)=>{
      const scale=Math.max(.58,Math.min(1.18,(Number(radiusFor(record))||3)/7));
      return`translate(${position.join(',')}) scale(${scale})`;
    };
    const applyCircularMarkerClusterLayout=()=>{
      clearTimeout(markerClusterTimer);
      markerClusterPositions.clear();
      const nodes=[];
      const addCircleMarkers=(selection,kind,basePosition,radiusFor,applyPosition)=>{
        selection.each(function(record,index){
          if(!markerNodeIsVisible(this))return;
          const anchor=basePosition(record),radiusValue=Number(radiusFor(record,this));
          if(!anchor?.every(Number.isFinite)||!Number.isFinite(radiusValue)||radiusValue<=0)return;
          nodes.push({record,key:markerStableKey(kind,record,index),anchorX:anchor[0],anchorY:anchor[1],x:anchor[0],y:anchor[1],r:radiusValue,applyPosition});
        });
      };
      addCircleMarkers(markers,'operating',record=>markerPosition(record,currentZoomScale),(record,node)=>Number(node.getAttribute('r')),position=>position);
      addCircleMarkers(generationProjectMarkers,'authorized',record=>projection(record.coordinate),(record,node)=>Number(node.getAttribute('r')),position=>position);
      addCircleMarkers(pipelineProjectMarkers,'pipeline',record=>projection(record.coordinate),(record,node)=>Number(node.getAttribute('r')),position=>position);
      addCircleMarkers(ptsPotentialMarkers,'pts',record=>projection(record.coordinate),(record,node)=>Number(node.getAttribute('r')),position=>position);
      addCircleMarkers(storageMarkerGroups,'storage',record=>projection(record.coordinate),(record,node)=>Number(node.querySelector('.storage-marker')?.getAttribute('r')),position=>position);
      addCircleMarkers(windRepoweringMarkers,'repowering',record=>projection(record.coordinate),(record,node)=>Number(node.querySelector('.wind-repowering-disc')?.getAttribute('r')),position=>position);
      addCircleMarkers(offshoreWindPostPtsMarkers,'offshore',record=>offshoreWindPostPtsPosition(record,currentZoomScale),(record,node)=>Number(node.querySelector('.offshore-wind-post-pts-disc')?.getAttribute('r'))||7.5,position=>position);
      addCircleMarkers(nonElectricFacilityMarkers,'non-electric',record=>nonElectricFacilityPosition(record),record=>{
        const baseRadius=record.category==='gasFacility'?7.2:record.category==='oilFacility'?7.8:6.5;
        return baseRadius/Math.pow(currentZoomScale,.62);
      },position=>position);
      addCircleMarkers(projectMarkers,'electric-project',record=>record.position,()=>Math.SQRT2*5/Math.pow(currentZoomScale,.72),position=>position);
      addCircleMarkers(verifiedSubstations,'verified-substation',record=>projection(record.coordinate),()=>Math.SQRT2*3.5/Math.pow(currentZoomScale,.72),position=>position);
      addCircleMarkers(substationCentroids,'substation-centroid',record=>projection(d3.geoCentroid(record.feature)),()=>3.25,position=>position);
      addCircleMarkers(networkNodes,'interconnection-node',record=>projection(record.coordinate),()=>7.3/Math.pow(currentZoomScale,.72),position=>position);
      if(!nodes.length)return;
      nodes.sort((a,b)=>b.r-a.r||a.key.localeCompare(b.key)).forEach((node,index)=>{node.order=index});
      const padding=3/Math.max(1,currentZoomScale),maximumRadius=d3.max(nodes,node=>node.r+padding)||0;
      for(let pass=0;pass<112;pass+=1){
        const tree=d3.quadtree(nodes,node=>node.x,node=>node.y);
        let overlapCount=0;
        nodes.forEach(node=>{
          const searchRadius=node.r+maximumRadius+padding;
          tree.visit((quad,x0,y0,x1,y1)=>{
            const other=quad.data;
            if(other&&other.order>node.order){
              let dx=other.x-node.x,dy=other.y-node.y,distance=Math.hypot(dx,dy),minimumDistance=node.r+other.r+padding;
              if(distance<minimumDistance){
                overlapCount+=1;
                if(distance<1e-7){const angle=markerKeyAngle(`${node.key}|${other.key}`);dx=Math.cos(angle);dy=Math.sin(angle);distance=1}
                const correction=(minimumDistance-distance+.002/Math.max(1,currentZoomScale))/distance,
                  nodeShare=other.r/(node.r+other.r),otherShare=node.r/(node.r+other.r);
                node.x-=dx*correction*nodeShare;node.y-=dy*correction*nodeShare;
                other.x+=dx*correction*otherShare;other.y+=dy*correction*otherShare;
              }
            }
            return x0>node.x+searchRadius||x1<node.x-searchRadius||y0>node.y+searchRadius||y1<node.y-searchRadius;
          });
        });
        if(!overlapCount)break;
      }
      nodes.forEach(node=>markerClusterPositions.set(node.record,[node.x,node.y]));
      markers.attr('cx',record=>(markerClusterPositions.get(record)||markerPosition(record,currentZoomScale))[0]).attr('cy',record=>(markerClusterPositions.get(record)||markerPosition(record,currentZoomScale))[1]);
      generationProjectMarkers.attr('cx',record=>(markerClusterPositions.get(record)||projection(record.coordinate))[0]).attr('cy',record=>(markerClusterPositions.get(record)||projection(record.coordinate))[1]);
      pipelineProjectMarkers.attr('cx',record=>(markerClusterPositions.get(record)||projection(record.coordinate))[0]).attr('cy',record=>(markerClusterPositions.get(record)||projection(record.coordinate))[1]);
      ptsPotentialMarkers.attr('cx',record=>(markerClusterPositions.get(record)||projection(record.coordinate))[0]).attr('cy',record=>(markerClusterPositions.get(record)||projection(record.coordinate))[1]);
      storageMarkerGroups.attr('transform',record=>`translate(${(markerClusterPositions.get(record)||projection(record.coordinate)).join(',')})`);
      windRepoweringMarkers.attr('transform',record=>`translate(${(markerClusterPositions.get(record)||projection(record.coordinate)).join(',')})`);
      offshoreWindPostPtsMarkers.attr('transform',record=>`translate(${(markerClusterPositions.get(record)||offshoreWindPostPtsPosition(record,currentZoomScale)).join(',')})`);
      nonElectricFacilityMarkers.attr('transform',record=>`translate(${(markerClusterPositions.get(record)||nonElectricFacilityPosition(record)).join(',')}) scale(${1/Math.pow(currentZoomScale,.62)})`);
      nonElectricFacilityLeaders.attr('x2',record=>(markerClusterPositions.get(record)||nonElectricFacilityPosition(record))[0]).attr('y2',record=>(markerClusterPositions.get(record)||nonElectricFacilityPosition(record))[1]);
      projectMarkers.attr('transform',record=>`translate(${(markerClusterPositions.get(record)||record.position).join(',')})`);
      verifiedSubstations.attr('transform',record=>`translate(${(markerClusterPositions.get(record)||projection(record.coordinate)).join(',')})`);
      substationCentroids.attr('transform',record=>`translate(${(markerClusterPositions.get(record)||projection(d3.geoCentroid(record.feature))).join(',')})`);
      networkNodes.attr('transform',record=>`translate(${(markerClusterPositions.get(record)||projection(record.coordinate)).join(',')})`);
      operatingWindTurbines.attr('transform',record=>miniWindTransform(record,markerClusterPositions.get(record)||markerPosition(record,currentZoomScale),item=>windCapacityRadius(item.mw)));
      generationProjectWindTurbines.attr('transform',record=>miniWindTransform(record,markerClusterPositions.get(record)||projection(record.coordinate),item=>windCapacityRadius(item.mw)));
      pipelineProjectWindTurbines.attr('transform',record=>miniWindTransform(record,markerClusterPositions.get(record)||projection(record.coordinate),item=>windCapacityRadius(item.mw)));
      ptsPotentialWindTurbines.attr('transform',record=>miniWindTransform(record,markerClusterPositions.get(record)||projection(record.coordinate),item=>windCapacityRadius(item.mw)));
      wavePrototypeLabels.attr('x',record=>(markerClusterPositions.get(record)||markerPosition(record,currentZoomScale))[0]+13/currentZoomScale).attr('y',record=>(markerClusterPositions.get(record)||markerPosition(record,currentZoomScale))[1]-11/currentZoomScale);
      marinePrototypeLabels.attr('x',record=>(markerClusterPositions.get(record)||projection(record.coordinate))[0]+11/currentZoomScale).attr('y',record=>(markerClusterPositions.get(record)||projection(record.coordinate))[1]+(record.id==='achieve-ceto'?-9:15)/currentZoomScale);
    };
    const scheduleCircularMarkerClusterLayout=()=>{
      clearTimeout(markerClusterTimer);
      markerClusterTimer=setTimeout(applyCircularMarkerClusterLayout,36);
    };
    const zoom=d3.zoom().scaleExtent([1,9]).on('zoom',event=>{
      currentZoomScale=event.transform.k;
      mapLayer.attr('transform',event.transform);
      markers.attr('cx',d=>markerPosition(d,event.transform.k)[0]).attr('cy',d=>markerPosition(d,event.transform.k)[1]).attr('r',d=>(d.informationalPrototype?10:d.key==='wind'?windCapacityRadius(d.mw):d.mw<0.1?2.3:radius(d.mw))/Math.pow(event.transform.k,.62));
      wavePrototypeLabels.attr('x',d=>markerPosition(d,event.transform.k)[0]+13/event.transform.k).attr('y',d=>markerPosition(d,event.transform.k)[1]-11/event.transform.k).style('font-size',`${11/event.transform.k}px`).style('stroke-width',`${3.5/event.transform.k}px`);
      generationProjectMarkers.attr('r',d=>(d.key==='wind'?windCapacityRadius(d.mw):generationProjectRadius(d.mw))/Math.pow(event.transform.k,.62));
      pipelineProjectMarkers.attr('r',d=>(d.key==='wind'?windCapacityRadius(d.mw):pipelineProjectRadius(d.mw))/Math.pow(event.transform.k,.62));
      ptsPotentialMarkers.attr('r',d=>(d.isMarinePrototype?8.5:d.key==='wind'?windCapacityRadius(d.mw):ptsPotentialRadius(d.mw))/Math.pow(event.transform.k,.62));
      marinePrototypeLabels.style('font-size',`${10/Math.pow(event.transform.k,.45)}px`).style('stroke-width',`${3/Math.pow(event.transform.k,.55)}px`);
      offshoreWindPostPtsMarkers.attr('transform',d=>`translate(${offshoreWindPostPtsPosition(d,event.transform.k).join(',')})`);
      storageMarkers.attr('r',d=>storageRadius(d.sizeBasis)/Math.pow(event.transform.k,.62));
      storageMarkerGroups.select('.storage-marker-label').style('font-size',`${8/Math.pow(event.transform.k,.62)}px`);
      windRepoweringMarkers.select('.wind-repowering-disc').attr('r',d=>windCapacityRadius(d.repoweredMW)/Math.pow(event.transform.k,.62));
      nonElectricFacilityMarkers.attr('transform',facility=>`translate(${nonElectricFacilityPosition(facility).join(',')}) scale(${1/Math.pow(event.transform.k,.62)})`);
      importOriginVessel.attr('transform',importOriginVesselTransform(event.transform.k));
      renewableImportOriginVessel.attr('transform',renewableImportOriginVesselTransform(event.transform.k));
      mapLayer.selectAll('.territory-label').style('font-size',`${13/Math.pow(event.transform.k,.72)}px`);
      populationDots.attr('x',record=>-populationRadius(record.population)/Math.pow(event.transform.k,.62)).attr('y',record=>-populationRadius(record.population)/Math.pow(event.transform.k,.62))
        .attr('width',record=>populationRadius(record.population)*2/Math.pow(event.transform.k,.62)).attr('height',record=>populationRadius(record.population)*2/Math.pow(event.transform.k,.62));
      populationLabels.attr('x',record=>(populationRadius(record.population)+3)/Math.pow(event.transform.k,.62)).attr('y',3.5/Math.pow(event.transform.k,.72)).style('font-size',`${10.5/Math.pow(event.transform.k,.78)}px`);
      verifiedSubstations.select('.verified-substation-node').attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      verifiedSubstations.select('.verified-substation-label').style('font-size',`${10.5/Math.pow(event.transform.k,.72)}px`);
      projectMarkers.select('.electric-project-node').attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      networkNodes.select('.interconnection-node').attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      networkNodes.select('.interconnection-label').style('font-size',`${11/Math.pow(event.transform.k,.72)}px`);
      importGateways.select('.import-gateway-symbol').attr('transform',d=>gatewaySymbolTransform(d,event.transform.k,d.timelineCapacityMVA??d.displayCapacityMVA));
      importGatewayVoltageIcons.attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      const zoomedGatewayLabels=importGateways.select('.import-gateway-label').attr('x',d=>gatewayLabelPosition(d,event.transform.k).x).attr('y',d=>gatewayLabelPosition(d,event.transform.k).y).attr('text-anchor',d=>gatewayLabelPosition(d,event.transform.k).anchor).style('font-size',`${10.5/Math.pow(event.transform.k,.72)}px`);
      zoomedGatewayLabels.selectAll('tspan').attr('x',d=>gatewayLabelPosition(d,event.transform.k).x);
      biscayNodes.select('.biscay-node').attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      biscayNodeLayer.selectAll('.biscay-node-label,.biscay-destination-label').style('font-size',`${10.5/Math.pow(event.transform.k,.72)}px`);
      updatePopulationVisibility();
      scheduleCircularMarkerClusterLayout();
    }).on('end',applyCircularMarkerClusterLayout);
    svg.call(zoom).on('dblclick.zoom',null);
    const mapViewOverlay=document.createElement('div');mapViewOverlay.className='map-view-overlay';viewport.prepend(mapViewOverlay);
    const zoomControls=document.createElement('div');zoomControls.className='map-zoom-controls';
    let networkLegend;
    const defaultZoomTransform=()=>{
      const [[x0,y0],[x1,y1]]=path.bounds(mapTerritories),safeTop=18,safeBottom=H-18,safeLeft=18,safeRight=W-18;
      const fitScale=Math.min((safeRight-safeLeft)/Math.max(1,x1-x0),(safeBottom-safeTop)/Math.max(1,y1-y0));
      const scale=Math.max(1,Math.min(2.1,fitScale*1.4));
      return d3.zoomIdentity.translate((safeLeft+safeRight)/2,(safeTop+safeBottom)/2+140).scale(scale).translate(-(x0+x1)/2,-(y0+y1)/2);
    };
    const resetMapView=(animated=false)=>animated
      ?svg.transition().duration(260).call(zoom.transform,defaultZoomTransform())
      :svg.interrupt().call(zoom.transform,defaultZoomTransform());
    const makeZoomButton=(label,title,className,handler)=>{const button=document.createElement('button');button.type='button';button.className=`map-zoom-button${className?` ${className}`:''}`;button.textContent=label;button.title=title;button.setAttribute('aria-label',title);button.addEventListener('click',handler);zoomControls.append(button);return button};
    let fallbackFullscreen=false,fullscreenButton;
    const fullscreenElement=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
    const fullscreenActive=()=>fullscreenElement()===shell||fallbackFullscreen;
    const updateFullscreenButton=()=>{
      if(!fullscreenButton)return;
      const active=fullscreenActive(),label=active?'Salir de pantalla completa':'Pantalla completa';
      fullscreenButton.textContent=active?'↙ Salir de pantalla completa':'⛶ Pantalla completa';
      fullscreenButton.title=label;fullscreenButton.setAttribute('aria-label',label);fullscreenButton.setAttribute('aria-pressed',String(active));
    };
    const enterFallbackFullscreen=()=>{fallbackFullscreen=true;shell.classList.add('is-map-maximized');document.body.classList.add('map-fullscreen-open');updateFullscreenButton()};
    const enterFullscreen=async()=>{enterFallbackFullscreen()};
    const exitFullscreen=async()=>{
      if(fallbackFullscreen){fallbackFullscreen=false;shell.classList.remove('is-map-maximized');document.body.classList.remove('map-fullscreen-open');updateFullscreenButton();return}
      const exit=document.exitFullscreen||document.webkitExitFullscreen;
      if(exit&&fullscreenElement()===shell){try{await exit.call(document)}catch(error){/* Esc sigue disponible como salida nativa. */}}
      updateFullscreenButton();
    };
    const toggleFullscreen=()=>fullscreenActive()?exitFullscreen():enterFullscreen();
    makeZoomButton('+','Acercar','',()=>svg.transition().duration(220).call(zoom.scaleBy,1.55));
    makeZoomButton('−','Alejar','',()=>svg.transition().duration(220).call(zoom.scaleBy,1/1.55));
    makeZoomButton('Recentrar','Restablecer el encuadre ampliado y centrado','reset',()=>resetMapView(true));
    fullscreenButton=makeZoomButton('⛶ Pantalla completa','Pantalla completa','fullscreen',toggleFullscreen);fullscreenButton.setAttribute('aria-pressed','false');
    document.addEventListener('fullscreenchange',updateFullscreenButton);document.addEventListener('webkitfullscreenchange',updateFullscreenButton);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&fallbackFullscreen)exitFullscreen()});
    mapViewOverlay.append(zoomControls);
    const disclosure=host.closest('details');
    if(disclosure)disclosure.addEventListener('toggle',()=>{
      if(!disclosure.open)return;
      requestAnimationFrame(()=>requestAnimationFrame(()=>resetMapView()));
    });
    const importLegendLabel=modelledGatewayFlows?(cfg.unifiedNormativeMap?'Importación modelizada · senda activa · grosor proporcional a GWh':'Importación modelizada 2050 · grosor proporcional a GWh'):useEstimatedGatewayFlows?'Flujos estimados 2025 · grosor proporcional a GWh · escala visual ×2':`Capacidad de entrada de importación · ${formatNumber(importRenewableShare,0)} % renov. / ${formatNumber(importNonRenewableShare,0)} % no renov.`;
    networkLegend=document.createElement('div');networkLegend.className='map-network-legend';networkLegend.innerHTML=`<span data-layer="grid"><i class="line-400" aria-hidden="true"></i>400 kV</span><span data-layer="grid"><i class="line-220" aria-hidden="true"></i>220 kV</span><span data-layer="grid"><i class="line-132" aria-hidden="true"></i>132 kV</span><span data-layer="grid"><i class="project-construction" aria-hidden="true"></i>Línea en construcción o aprobada</span><span data-layer="grid"><i class="node" aria-hidden="true"></i>Nodo exterior</span><span data-layer="substations-existing"><i class="substation substation-400" aria-hidden="true"></i>Existente · 400 kV</span><span data-layer="substations-existing"><i class="substation substation-220" aria-hidden="true"></i>Existente · 220 kV</span><span data-layer="substations-existing"><i class="substation substation-132" aria-hidden="true"></i>Existente · 132 kV</span><span data-layer="substations-new"><i class="substation-new" aria-hidden="true"></i>Nueva · en construcción</span><span data-layer="substations-expansion"><i class="substation-expansion" aria-hidden="true"></i>Ampliación / adaptación</span><span data-layer="imports"><i class="import-gateway" aria-hidden="true"></i>${importLegendLabel}</span><span data-layer="generation-projects"><i class="generation-project-construction" aria-hidden="true"></i>Generación en construcción o aprobada</span><span data-layer="pipeline-projects"><i class="pipeline-project" aria-hidden="true"></i>Generación en tramitación · suma exploratoria</span><span data-layer="pts-potentials"><i class="pts-potential" aria-hidden="true"></i>Nuevas zonas potenciales (PTS y más)</span><span data-layer="pts-potentials"><i class="wind-repowering" aria-hidden="true">P</i>Repotenciación</span><span data-layer="offshore-demo"><i class="offshore-wind-post-pts" aria-hidden="true"></i>BiMEP · ensayo existente</span><span data-layer="offshore-geroa"><i class="offshore-wind-post-pts offshore-wind-geroa" aria-hidden="true"></i>GEROA · ≤50 MW propuestos · fuera del PTS</span><span data-layer="storage"><i class="storage-operational" aria-hidden="true"></i>Almacenamiento en servicio</span><span data-layer="storage"><i class="storage-authorized" aria-hidden="true"></i>Almacenamiento autorizado</span><span data-layer="storage"><i class="storage-pipeline" aria-hidden="true"></i>Almacenamiento en tramitación</span><span data-layer="non-electric"><i class="non-electric-gas" aria-hidden="true"></i>Gasoducto</span><span data-layer="non-electric"><i class="non-electric-oil" aria-hidden="true"></i>Oleoducto / poliducto</span><span data-layer="non-electric"><i class="non-electric-gas-facility" aria-hidden="true"></i>GNL / almacenamiento gasista</span><span data-layer="non-electric"><i class="non-electric-oil-facility" aria-hidden="true"></i>Refinería / terminal</span><span data-layer="renewable-fuels"><i class="renewable-fuel-facility" aria-hidden="true"></i>Combustibles renovables</span><span data-layer="renewable-fuels"><i class="renewable-import-origin" aria-hidden="true"></i>Barco marrón · origen y riesgo de materias primas</span><span data-layer="thermal-biomass"><i class="thermal-biomass-facility" aria-hidden="true"></i>Biomasa no eléctrica · instalaciones representativas</span>`;mapViewOverlay.append(networkLegend);
    requestAnimationFrame(()=>requestAnimationFrame(()=>resetMapView()));

    const constructionProjectCount=projectDefinitions.filter(project=>project.status==='construction').length+1,authorizedProjectCount=projectDefinitions.filter(project=>project.status==='authorized').length,activeProjectCount=constructionProjectCount+authorizedProjectCount;
    const clearProjectSelection=()=>{projectPaths.classed('is-selected',false);projectMarkers.classed('is-selected',false)};
    const clearGenerationProjectSelection=()=>{generationProjectMarkers.classed('is-selected',false);pipelineProjectMarkers.classed('is-selected',false)};
    const clearPipelineProjectSelection=()=>pipelineProjectMarkers.classed('is-selected',false);
    const clearPtsPotentialSelection=()=>ptsPotentialMarkers.classed('is-selected',false);
    const clearStorageSelection=()=>storageMarkerGroups.classed('is-selected',false);
    const clearOffshoreWindPostPtsSelection=()=>offshoreWindPostPtsMarkers.classed('is-selected',false);
    const clearWindRepoweringSelection=()=>windRepoweringMarkers.classed('is-selected',false);
    const clearNonElectricSelection=()=>{clearOffshoreWindPostPtsSelection();clearWindRepoweringSelection();nonElectricRoutes.classed('is-selected',false);nonElectricFacilityMarkers.classed('is-selected',false);importOriginVessel.classed('is-selected',false);renewableImportOriginVessel.classed('is-selected',false)};
    const clearNetworkSelection=()=>{networkNodes.classed('is-selected',false);importGateways.classed('is-selected',false)};
    const defaultDetail=()=>{detail.innerHTML=`<h4>Infraestructura energética cartografiada</h4><p class="map-detail-lead">Selecciona una instalación, un proyecto, una zona PTS, un almacenamiento, una población, un nodo o un trazado para consultar sus datos.</p><dl><dt>Emplazamientos eléctricos en servicio</dt><dd>${formatNumber(totals.points,0)}</dd><dt>Potencia eléctrica en servicio</dt><dd>${formatNumber(totals.mw,1)} MW</dd><dt>Proyectos de generación</dt><dd>${formatNumber(generationProjectDefinitions.length,0)} autorizados o en obra</dd><dt>Expedientes en tramitación</dt><dd>${formatNumber(pipelineProjectRecords.length,0)} · ${formatNumber(pipelineProjectRecords.reduce((sum,project)=>sum+project.mw,0),2)} MW solicitados · suma exploratoria al activar</dd><dt>Zonas potenciales PTS</dt><dd>${formatNumber(ptsPotentialRecords.length,0)} oportunidades territoriales</dd><dt>Repotenciación eólica</dt><dd>${formatNumber(WIND_REPOWERING_POTENTIAL.length,0)} parques evaluados; 143,37 → 232,16 MW</dd><dt>Eólica marina · BiMEP</dt><dd>${formatNumber(OFFSHORE_WIND_POST_PTS.length,0)} puntos · 2 MW DemoSATH + hasta 50 MW GEROA</dd><dt>Almacenamiento eléctrico</dt><dd>${formatNumber(storageRecords.length,0)} instalaciones y proyectos inventariados</dd><dt>Infraestructura de gas y petróleo</dt><dd>${formatNumber(fossilFacilityRecords.length,0)} instalaciones y ${formatNumber(nonElectricRouteRecords.length,0)} conducciones principales</dd><dt>Combustibles renovables</dt><dd>${formatNumber(renewableFuelFacilityRecords.length,0)} instalaciones</dd><dt>Biomasa no eléctrica</dt><dd>${formatNumber(biomassEnergy,1)} GWh en 2024; ${formatNumber(biomassFacilityRecords.length,0)} referencias cartografiadas</dd><dt>Población ${populationYear}</dt><dd>${formatNumber(populationTotal,0)} habitantes</dd><dt>Red eléctrica</dt><dd>132, 220 y 400 kV</dd><dt>Nodos eléctricos exteriores</dt><dd>${formatNumber(INTERCONNECTION_NODES.length,0)}</dd><dt>Inventario</dt><dd>${escapeHtml(generationPipeline?.updated||electricStorage?.updated||nonElectricInfrastructure?.updated||ptsPotentialSites?.updated||generationProjects?.updated||electricProjects?.updated||'2026')}</dd></dl><p class="map-data-note">El relleno punteado identifica expedientes administrativos activos, no instalaciones aprobadas. Al activar la capa, su producción estimada se añade a la electricidad propia solar o eólica y reduce importación de forma exploratoria; no modifica por sí sola las proyecciones publicadas. La “P” azul identifica potencial de repotenciación evaluado por el PTS, no proyectos autorizados.</p><span class="map-source-badge">Red Eléctrica & ESIOS · GeoEuskadi · PTS · EVE · Gobierno Vasco · BOE · BiMEP · MITECO · Enagás · BBG · Petronor · Exolum</span>`;refreshDetailActions()};
    const showDetail=d=>{
      clearNonElectricSelection();
      markers.classed('is-selected',candidate=>candidate===d);
      populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();
      const digits=d.mw<.1?3:d.mw<10?2:1,groupNote=d.informationalPrototype?'Punto informativo de un prototipo experimental desplegado en BiMEP; no es una central comercial del inventario.':d.isEveSolar?`Instalación fotovoltaica en servicio incluida en la capa «Solar a red · declarado por EVE»${d.units>1?`; el punto agrupa ${formatNumber(d.units,0)} instalaciones`:''}.`:d.isDocumentedSelfConsumption?`Instalación de autoconsumo documentada individualmente${d.units>1?`; el punto agrupa ${formatNumber(d.units,0)} instalaciones`:''}.`:d.key==='solar'?`Instalación fotovoltaica inscrita en el inventario de producción ESIOS. Su modalidad individual —venta total o autoconsumo con excedentes— no está identificada en esta fuente${d.units>1?`; el punto agrupa ${formatNumber(d.units,0)} instalaciones`:''}.`:d.units>1?`Este punto agrupa ${formatNumber(d.units,0)} instalaciones.`:'Este punto corresponde a una instalación.',powerLabel=d.informationalPrototype?'No publicada por EVE':`${formatNumber(d.mw,digits)} MW`;
      const isPetronor=/^PETRONOR 1$/i.test(d.properties.descripcion||''),connectionNote=d.properties.detailConnectionNote||(isPetronor?'Petronor no conecta directamente con las líneas de 400 kV. La documentación oficial sitúa su enlace en 132 kV hacia ST Petronor y ST Abanto/Mantrés; las líneas de 400 kV terminan correctamente en esta última.':d.isDocumentedSelfConsumption?'La fuente documenta que la instalación utiliza electricidad renovable en el propio emplazamiento, pero no publica cuánto se autoconsume ni cuánto excedente se vierte a la red.':d.key==='solar'&&!d.isEveSolar?'La instalación figura en el inventario de producción de Red Eléctrica & ESIOS y puede inyectar energía. La ficha individual no permite distinguir si se trata de venta total o autoconsumo con excedentes, ni cuánto se consume localmente y cuánto se vierte.':'La coordenada procede del inventario de generación y no representa necesariamente la posición exacta de la subestación o del punto de conexión.');
      const media=mediaForRecord(d),orthophotoWarning='Imagen centrada en la coordenada registral; puede representar una ubicación aproximada o varias unidades agrupadas.';
      const imageMarkup=`<img src="${escapeHtml(media.src)}" data-orthophoto="${escapeHtml(media.orthophoto)}" data-using-orthophoto="${media.isOrthophoto}" alt="${escapeHtml(media.alt)}" loading="lazy" decoding="async">`,linkedImageMarkup=media.linkUrl?`<a class="installation-photo-link" href="${escapeHtml(media.linkUrl)}" target="_blank" rel="noopener" title="Abrir la fuente de la imagen">${imageMarkup}</a>`:imageMarkup;
      const additionalMediaMarkup=media.additionalMedia?`<figure class="installation-photo installation-photo-secondary"><img src="${escapeHtml(media.additionalMedia.src)}" data-using-orthophoto="true" alt="${escapeHtml(media.additionalMedia.alt)}" loading="lazy" decoding="async"><figcaption>${media.additionalMedia.caption}</figcaption><span class="installation-photo-warning">${orthophotoWarning}</span></figure>`:'';
      const installationTechnicalMarkup=technicalMarkupForMedia(media);
      const cogenFuelMarkup=d.key==='cogen'?`<dt>Clase de combustible</dt><dd><span class="cogen-fuel-detail cogen-fuel-${d.cogenFuelClass}">${escapeHtml(COGEN_FUEL_CLASSES[d.cogenFuelClass].label)}</span></dd>`:'',cogenFuelNote=d.key==='cogen'?`<p class="map-data-note"><strong>Clasificación del combustible.</strong> ${escapeHtml(d.cogenEvidence.note)}</p><span class="map-source-badge"><a href="${escapeHtml(d.cogenEvidence.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(d.cogenEvidence.sourceLabel)}</a></span>`:'';
      const technologyLabel=d.isEveSolar?'Solar fotovoltaica a red · declarada por EVE':d.isDocumentedSelfConsumption?(d.properties.selfConsumptionLabel||'Autoconsumo documentado'):d.key==='solar'?'Fotovoltaica inscrita en ESIOS · modalidad no determinada':TECHNOLOGIES[d.key].label,sourceLabel=d.properties.detailSourceLabel||d.properties.fuente||(d.isEveSolar?'EVE':'Red Eléctrica & ESIOS');
      detail.innerHTML=`<h4>${escapeHtml(d.properties.descripcion||'Instalación de producción')}</h4><p class="map-detail-lead">${groupNote}</p><dl><dt>Tecnología</dt><dd>${technologyLabel}</dd>${cogenFuelMarkup}<dt>Municipio</dt><dd>${escapeHtml(cleanMunicipality(d.properties.municipio))}</dd><dt>Potencia</dt><dd>${powerLabel}</dd><dt>Instalaciones</dt><dd>${formatNumber(d.units,0)}</dd><dt>Área / huella</dt><dd class="map-area">${areaMarkup(d)}</dd><dt>Registro</dt><dd>${escapeHtml(d.properties.minetur||'No indicado')}</dd><dt>Actualización</dt><dd>${dateLabel(d.properties.fecha_mod)}</dd></dl><p class="map-data-note">${connectionNote}</p><span class="map-source-badge">${sourceLabel}</span>${cogenFuelNote}${installationTechnicalMarkup}<figure class="installation-photo">${linkedImageMarkup}${media.expandable?'<button type="button" class="installation-photo-expand">Ampliar imagen</button>':''}<figcaption>${media.caption}</figcaption>${media.isOrthophoto?`<span class="installation-photo-warning">${orthophotoWarning}</span>`:''}</figure>${additionalMediaMarkup}`;
      const mediaImage=detail.querySelector('.installation-photo img'),mediaFigure=detail.querySelector('.installation-photo'),expandImageButton=detail.querySelector('.installation-photo-expand');
      expandImageButton?.addEventListener('click',()=>openImageModal(mediaFigure,`Imagen ampliada · ${d.properties.descripcion||'Instalación'}`));
      refreshDetailActions();
      mediaImage?.addEventListener('error',()=>{
        const figure=mediaImage.closest('.installation-photo'),caption=figure?.querySelector('figcaption');
        if(mediaImage.dataset.usingOrthophoto!=='true'){
          mediaImage.dataset.usingOrthophoto='true';
          mediaImage.src=mediaImage.dataset.orthophoto;
          mediaImage.alt=`Vista aérea del emplazamiento de ${d.properties.descripcion||'la instalación'}`;
          if(caption)caption.innerHTML=orthophotoCaption();
          if(figure&&!figure.querySelector('.installation-photo-warning')){
            const warning=document.createElement('span');warning.className='installation-photo-warning';warning.textContent=orthophotoWarning;figure.append(warning);
          }
          return;
        }
        const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Vista aérea no disponible en este momento.';mediaImage.replaceWith(unavailable);
      });
    };
    const showPopulationDetail=record=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',candidate=>candidate===record);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();
      detail.innerHTML=`<h4>${escapeHtml(record.name)}</h4><p class="map-detail-lead">Población residente del municipio a 1 de enero de ${populationYear}.</p><dl><dt>Habitantes</dt><dd>${formatNumber(record.population,0)}</dd><dt>Territorio histórico</dt><dd>${escapeHtml(record.territory)}</dd><dt>Fecha de referencia</dt><dd>1 de enero de ${populationYear}</dd><dt>Representación</dt><dd>Centroide del término municipal</dd></dl><p class="map-data-note">El punto sirve para contextualizar territorialmente la infraestructura. No representa la extensión urbana ni localiza cada núcleo de población dentro del municipio.</p><span class="map-source-badge"><a href="${escapeHtml(populations?.sourceUrl||'https://es.eustat.eus/elementos/tbl0011429_c.html')}" target="_blank" rel="noopener">Eustat · población municipal ${populationYear}</a></span>`;refreshDetailActions();
    };
    const showNetworkDetail=d=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();networkNodes.classed('is-selected',candidate=>candidate.name===d.name);importGateways.classed('is-selected',candidate=>candidate.name===d.name);biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();
      if(d.estimatedFlow){
        detail.innerHTML=`<h4>${escapeHtml(d.estimatedFlow.from)} ↔ ${escapeHtml(d.estimatedFlow.to)}</h4><p class="map-detail-lead">Conexión física bidireccional y saldo eléctrico anual probable para 2025, trasladado del mapa peninsular con las mismas proporciones entre flujos.</p><dl><dt>Saldo anual probable</dt><dd>${escapeHtml(d.estimatedFlow.from)} → ${escapeHtml(d.estimatedFlow.to)} · ${formatNumber(d.estimatedAnnualGWh,0)} GWh/año</dd><dt>Potencia media equivalente</dt><dd>${formatNumber(d.estimatedAnnualGWh/8.76,0)} MW</dd><dt>Banda renovable</dt><dd>${formatNumber(d.flowRenewableShare,1)} %</dd><dt>Banda no renovable</dt><dd>${formatNumber(100-d.flowRenewableShare,1)} %</dd><dt>Grosor</dt><dd>Proporcional a los GWh; ampliado ×2 en la vista vasca para mejorar su lectura</dd><dt>Puntas en ambos lados</dt><dd>La infraestructura puede intercambiar electricidad en los dos sentidos</dd></dl><p class="map-data-note">Las dos puntas no significan que el volumen sea igual en ambos sentidos: el dato conserva el saldo anual probable indicado. La flecha no es una medición por línea ni una capacidad nominal. El reparto verde/gris usa el mix anual del territorio de origen del saldo y no permite rastrear físicamente cada MWh.</p><span class="map-source-badge"><a href="https://www.sistemaelectrico-ree.es/es/informe-del-sistema-electrico" target="_blank" rel="noopener">Red Eléctrica · balance territorial 2025</a> · inferencia propia del mapa peninsular</span>`;refreshDetailActions();return;
      }
      const capacityUnit=d.isFuture?'MW':'MVA',circuitCapacity=d.capacityCircuits.map(([name,capacity])=>`${escapeHtml(name)}: <strong>${formatNumber(capacity,0)} ${capacityUnit}</strong>`).join('<br>'),capacityNote=d.capacityNote?` ${escapeHtml(d.capacityNote)}`:'',reference=d.isFuture?'Puesta en servicio prevista a comienzos de 2028':'Invierno de 2024',sourceUrl=d.isFuture?'https://www.inelfe.eu/es/proyectos/golfo-de-bizkaia':REE_TRANSPORT_CAPACITY_2024,sourceLabel=d.isFuture?'INELFE · interconexión Golfo de Bizkaia':'Red Eléctrica · calidad de servicio de la red de transporte 2024';
      detail.innerHTML=`<h4>${escapeHtml(d.name)}</h4><p class="map-detail-lead">${d.isFuture?'Futura puerta submarina de intercambio eléctrico con Francia, actualmente en construcción.':'Nodo de interconexión exterior: puede canalizar electricidad tanto de entrada como de salida.'}</p><dl>${d.isFuture?`<dt>Estado</dt><dd>${escapeHtml(d.statusLabel)}</dd>`:''}<dt>Tensión</dt><dd>${escapeHtml(d.voltage)}</dd><dt>Procedencia territorial</dt><dd>${escapeHtml(d.originLabel||d.territory)}</dd><dt>Conexiones cartografiadas</dt><dd>${d.links.map(escapeHtml).join('<br>')}</dd><dt>Capacidad nominal</dt><dd>${formatNumber(d.capacityTotalMVA,0)} ${capacityUnit}</dd><dt>Capacidad por enlace</dt><dd>${circuitCapacity}</dd><dt>Referencia</dt><dd>${reference}</dd><dt>Sentido del flujo</dt><dd>Bidireccional y variable</dd><dt>Energía importada por el nodo</dt><dd>No publicada de forma desagregada</dd></dl><p class="map-data-note">${d.isFuture?'La capacidad nominal no equivale a una importación continua ni permite calcular por sí sola la energía anual en GWh.':'Los MVA expresan la capacidad aparente de las líneas, no la energía anual que entra en GWh ni un flujo real fijo en MW. Su suma es una referencia física, no una capacidad simultánea garantizada: las restricciones y el criterio de seguridad N-1 pueden reducir el intercambio efectivo.'}${capacityNote}</p><span class="map-source-badge"><a href="${sourceUrl}" target="_blank" rel="noopener">${sourceLabel}</a></span>`;refreshDetailActions();
    };
    const showProjectDetail=project=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearGenerationProjectSelection();clearPtsPotentialSelection();
      projectPaths.classed('is-selected',record=>record.project===project);projectMarkers.classed('is-selected',record=>record.project===project);
      const statusNote=project.status==='authorized'?'Dispone de autorización administrativa de construcción, pero esa resolución no acredita que las obras hayan comenzado.':project.status==='scheduled'?'El proyecto dispone de declaración de impacto ambiental favorable y Red Eléctrica ha anunciado el inicio de las obras para finales de 2026; todavía no se presenta como infraestructura en servicio ni como obra iniciada.':'El inicio de las obras ha sido confirmado por una fuente oficial.';
      detail.innerHTML=`<h4>${escapeHtml(project.name)}</h4><p class="map-detail-lead">${escapeHtml(project.kind||'Actuación sobre la red eléctrica')}</p><dl><dt>Estado</dt><dd>${escapeHtml(project.statusLabel)}</dd><dt>Tensión</dt><dd>${escapeHtml(project.voltage||'No indicada')}</dd><dt>Actuación</dt><dd>${escapeHtml(project.scope||'No indicada')}</dd><dt>Representación</dt><dd>${escapeHtml(project.geometryNote||'Localización cartográfica orientativa')}</dd></dl><p class="map-data-note">${statusNote}</p><span class="map-source-badge"><a href="${escapeHtml(project.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(project.sourceLabel||'Fuente oficial')}</a></span>`;refreshDetailActions();
    };
    const showGenerationProjectDetail=project=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearPtsPotentialSelection();
      generationProjectMarkers.classed('is-selected',candidate=>candidate===project);
      const statusNote=project.status==='construction'?'El comienzo de las obras consta en una fuente oficial. El proyecto todavía no se contabiliza como potencia en servicio.':project.status==='construction-authorized'?'La autorización administrativa de construcción permite ejecutar el proyecto, pero no demuestra que las obras hayan comenzado.':'La autorización administrativa previa aprueba las características esenciales. Antes de construir necesita también autorización administrativa de construcción.';
      const sourceLinks=(project.sources||[{label:project.sourceLabel,url:project.sourceUrl}]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · ');
      const powerLabel=project.powerBasis==='MWp'?`${formatNumber(project.mwp||project.mw,2)} MWp`:project.mwp&&Math.abs(project.mwp-project.mw)>.05?`${formatNumber(project.mw,project.mw<10?1:0)} MW nominales · ${formatNumber(project.mwp,project.mwp<10?2:1)} MWp`:`${formatNumber(project.mw,project.mw<10?1:0)} MW`;
      const projectOrthophoto=orthophotoUrl(project.coordinate);
      const productionEstimate=Number(project.annualGWhEstimate)>0?`<dt>Producción anual estimada</dt><dd>${formatNumber(project.annualGWhEstimate,1)} GWh/año</dd><dt>Método de estimación</dt><dd>${escapeHtml(project.annualGWhMethod||'No indicado')}</dd><dt>Entrada en el modelo</dt><dd>50 % en ${formatNumber(project.modelFirstYear,0)} · 100 % desde ${formatNumber(project.modelFullYear,0)}</dd>`:'';
      const projectPhoto=project.photoSrc?`<figure class="installation-photo">${project.photoLink?`<a class="installation-photo-link" href="${escapeHtml(project.photoLink)}" target="_blank" rel="noopener">`:''}<img src="${escapeHtml(project.photoSrc)}" alt="${escapeHtml(project.photoAlt||project.name)}" loading="lazy" decoding="async">${project.photoLink?'</a>':''}<figcaption>${escapeHtml(project.photoCaption||project.name)}</figcaption></figure>`:'';
      const orthophotoFigure=project.photoSrc?'':`<figure class="installation-photo"><img src="${escapeHtml(projectOrthophoto)}" alt="Vista aérea del ámbito de ${escapeHtml(project.name)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption()}</figcaption><span class="installation-photo-warning">La imagen muestra el ámbito de referencia, no una planta necesariamente construida.</span></figure>`;
      const financingFacts=Number(project.totalInvestmentMEur)>0?`<dt>Inversión y financiación</dt><dd>${formatNumber(project.totalInvestmentMEur,0)} M€ de inversión total · ${formatNumber(project.greenLoanMEur,0)} M€ de préstamo verde del BEI</dd>`:'';
      const localImpactFacts=Number(project.constructionJobs)>0?`<dt>Impacto local anunciado</dt><dd>Hasta ${formatNumber(project.constructionJobs,0)} empleos durante la construcción. ${escapeHtml(project.citizenParticipation||'')} ${escapeHtml(project.localEnergyContracts||'')}</dd>`:'';
      const eveIndicators=Number(project.eveAnnualGWh)>0?`<dt>Indicadores publicados por EVE</dt><dd>${formatNumber(project.eveAnnualGWh,0)} GWh/año · electricidad equivalente para unas ${formatNumber(project.peopleEquivalent,0)} personas · ${formatNumber(project.avoidedCO2Tonnes,0)} t de CO₂ evitadas al año</dd>`:'';
      const projectTimeline=Array.isArray(project.timeline)&&project.timeline.length?`<section class="project-timeline" aria-label="Cronología administrativa de ${escapeHtml(project.name)}"><h5>${escapeHtml(project.timelineTitle||'Cronología administrativa')}</h5><ol>${project.timeline.map(item=>`<li><time>${escapeHtml(item.date)}</time><span><strong>${escapeHtml(item.title)}.</strong> ${escapeHtml(item.text)}</span></li>`).join('')}</ol>${project.timelineConclusion?`<p class="project-timeline-conclusion"><strong>Cómo leer el caso.</strong> ${escapeHtml(project.timelineConclusion)}</p>`:''}</section>`:'';
      const projectLead=project.caseLead||`Proyecto de ${GENERATION_PROJECT_TECHNOLOGY_LABELS[project.key]||TECHNOLOGIES[project.key].label.toLowerCase()} incluido en «Generación en construcción o aprobada»; el círculo rayado conserva el color de la tecnología.`;
      detail.innerHTML=`<h4>${escapeHtml(project.name)}</h4><p class="map-detail-lead">${escapeHtml(projectLead)}</p>${projectPhoto}<dl><dt>Estado</dt><dd>${escapeHtml(project.statusLabel)}</dd><dt>Fecha de la resolución</dt><dd>${escapeHtml(project.approvalDate||'No indicada')}</dd><dt>Potencia</dt><dd>${powerLabel}</dd>${productionEstimate}${financingFacts}${localImpactFacts}${eveIndicators}<dt>Municipios</dt><dd>${project.municipalities.map(escapeHtml).join(', ')}</dd>${project.area?`<dt>Superficie</dt><dd>${escapeHtml(project.area)}</dd>`:''}<dt>Representación</dt><dd>${escapeHtml(project.locationNote||'Punto representativo del ámbito documentado')}</dd></dl><p class="map-data-note">${statusNote}${project.note?` ${escapeHtml(project.note)}`:''}</p>${projectTimeline}<span class="map-source-badge">${sourceLinks}</span>${orthophotoFigure}`;
      refreshDetailActions();
      const projectImage=detail.querySelector('.installation-photo img');
      projectImage?.addEventListener('error',()=>{const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Vista aérea no disponible en este momento.';projectImage.replaceWith(unavailable)});
    };
    const showPipelineProjectDetail=project=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();
      pipelineProjectMarkers.classed('is-selected',candidate=>candidate===project);
      const sourceLinks=(project.sources||[]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · ');
      const powerLabel=project.mwp&&Math.abs(project.mwp-project.mw)>.05?`${formatNumber(project.mw,project.mw<10?3:1)} MW nominales · ${formatNumber(project.mwp,project.mwp<10?3:1)} MWp`:`${formatNumber(project.mw,project.mw<10?3:1)} MW`;
      const earlyStage=project.stage==='competition';
      detail.innerHTML=`<h4>${escapeHtml(project.name)}</h4><p class="map-detail-lead">Expediente oficial incluido en «Generación en tramitación». El círculo punteado conserva el color de la tecnología y lo diferencia de los proyectos autorizados.</p><dl><dt>Fase comprobada</dt><dd>${escapeHtml(project.stageLabel)}</dd><dt>Fecha de referencia</dt><dd>${escapeHtml(project.stageDate||'No indicada')}</dd><dt>Tecnología</dt><dd>${escapeHtml(GENERATION_PROJECT_TECHNOLOGY_LABELS[project.key]||TECHNOLOGIES[project.key].label)}</dd><dt>Potencia solicitada</dt><dd>${powerLabel}</dd><dt>Producción anual estimada</dt><dd>${formatNumber(project.annualGWhEstimate,1)} GWh/año</dd><dt>Método</dt><dd>${escapeHtml(project.annualGWhMethod||'No indicado')}</dd><dt>Incertidumbre</dt><dd>${escapeHtml(project.annualGWhUncertainty||'No cuantificada')}</dd><dt>Municipios</dt><dd>${(project.municipalities||[]).map(escapeHtml).join(', ')}</dd>${project.area?`<dt>Superficie / configuración</dt><dd>${escapeHtml(project.area)}</dd>`:''}<dt>Representación</dt><dd>${escapeHtml(project.locationNote||'Punto representativo del ámbito documentado')}</dd><dt>Entrada en la barra</dt><dd>Al activar la capa se suma de forma exploratoria a la electricidad propia ${project.key==='solar'?'solar':'eólica'} y reduce importación; no cambia las proyecciones publicadas.</dd></dl><p class="map-data-note"><strong>${earlyStage?'Madurez administrativa muy inicial.':'Todavía no es una instalación autorizada.'}</strong> ${escapeHtml(project.note||'No se ha localizado una autorización administrativa previa firme.')}</p><span class="map-source-badge">${sourceLinks||'Fuente oficial no enlazada'}</span>`;
      refreshDetailActions();
    };
    const showPtsPotentialDetail=site=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();
      ptsPotentialMarkers.classed('is-selected',candidate=>candidate===site);
      const sourceLinks=(site.sources||ptsPotentialSites?.sources||[]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · '),siteOrthophoto=orthophotoUrl(site.coordinate);
      if(site.isMarinePrototype){
        const prototypePhoto=site.photoSrc?`<figure class="installation-photo"><img src="${escapeHtml(site.photoSrc)}" alt="${escapeHtml(site.photoAlt||site.name)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(site.photoCaption||site.name)}</figcaption></figure>`:'';
        detail.innerHTML=`<h4>${escapeHtml(site.name)}</h4><p class="map-detail-lead">Prototipo undimotriz experimental incluido en «Nuevas zonas potenciales (PTS y más)», no en «Generación en construcción».</p>${prototypePhoto}<dl><dt>Estado</dt><dd>${escapeHtml(site.statusLabel)}</dd><dt>Fecha</dt><dd>${escapeHtml(site.approvalDate||'No indicada')}</dd><dt>Tecnología</dt><dd>Conversión de la energía de las olas</dd><dt>Potencia nominal publicada</dt><dd>${formatNumber(site.mw,site.mw<1?2:1)} MW</dd><dt>Ámbito</dt><dd>${(site.municipalities||[]).map(escapeHtml).join(', ')}</dd><dt>Representación</dt><dd>${escapeHtml(site.locationNote||'Punto aproximado dentro del área de ensayos BiMEP')}</dd><dt>Entrada en el modelo</dt><dd>No se suma a la generación instalada, al balance eléctrico ni a las proyecciones.</dd></dl><p class="map-data-note">${escapeHtml(site.note||'Instalación experimental, no parque comercial.')}</p><span class="map-source-badge">${sourceLinks}</span>`;
        refreshDetailActions();
        const prototypeImage=detail.querySelector('.installation-photo img');
        prototypeImage?.addEventListener('error',()=>{const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Imagen no disponible en este momento.';prototypeImage.replaceWith(unavailable)});
        return;
      }
      const production=Number(site.annualGWhEstimate)>0?`<dt>Producción anual orientativa</dt><dd>${formatNumber(site.annualGWhEstimate,1)} GWh/año</dd><dt>Método de producción</dt><dd>${escapeHtml(site.annualGWhMethod||'No indicado')}</dd>`:`<dt>Producción anual</dt><dd>No estimada</dd><dt>Motivo</dt><dd>${escapeHtml(site.annualGWhMethod||'No existe una tecnología de referencia suficientemente definida.')}</dd>`;
      detail.innerHTML=`<h4>${escapeHtml(site.name)}</h4><p class="map-detail-lead">Zona de Localización Seleccionada (ZLS) de ${escapeHtml((site.technologyLabel||PTS_TECHNOLOGY_LABELS[site.key]||TECHNOLOGIES[site.key].label).toLowerCase())}: potencial territorial del PTS, no proyecto autorizado, instalación comprometida ni autoconsumo.</p><dl><dt>Estado</dt><dd>${escapeHtml(site.statusLabel||'Zona seleccionada por el PTS')}</dd><dt>Tecnología</dt><dd>${escapeHtml(site.technologyLabel||PTS_TECHNOLOGY_LABELS[site.key]||TECHNOLOGIES[site.key].label)}</dd><dt>Código ZLS</dt><dd>${escapeHtml(site.code||site.id||'No indicado')}</dd><dt>Potencia orientativa</dt><dd>${formatNumber(site.mw,site.mw<10?1:0)} MW</dd><dt>Carácter de la cifra</dt><dd>Estimación analítica; el PTS no asigna potencia oficial a cada zona</dd><dt>Método de potencia</dt><dd>${escapeHtml(site.potentialMWMethod||'No indicado')}</dd>${production}${Number(site.areaHa)>0?`<dt>Superficie oficial</dt><dd>${formatNumber(site.areaHa,2)} ha</dd>`:''}<dt>Municipios</dt><dd>${(site.municipalities||[]).map(escapeHtml).join(', ')||'No indicados'}</dd>${site.areaFunctional?`<dt>Área funcional</dt><dd>${escapeHtml(site.areaFunctional)}</dd>`:''}<dt>Incertidumbre</dt><dd>${escapeHtml(site.uncertainty||'No indicada')}</dd><dt>Representación</dt><dd>${escapeHtml(site.locationNote||'Punto representativo de la zona territorial')}</dd></dl><p class="map-data-note">${escapeHtml(ptsPotentialSites?.importantNote||'Una ZLS expresa aptitud territorial y no garantiza que se construya una instalación.')} La barra lateral muestra este potencial de forma exploratoria. Solo descuenta proyectos de la misma tecnología cuando estos disponen de una producción anual cuantificada; los prototipos marinos sin GWh publicados permanecen en el mapa, pero no se suman ni se descuentan.</p><span class="map-source-badge">${sourceLinks||'Gobierno Vasco · PTS de Energías Renovables'}</span><figure class="installation-photo"><img src="${escapeHtml(siteOrthophoto)}" alt="Vista aérea del ámbito aproximado de ${escapeHtml(site.name)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption()}</figcaption><span class="installation-photo-warning">La imagen se centra en el punto oficial de referencia de la ZLS; no representa una instalación proyectada.</span></figure>`;
      refreshDetailActions();
      const siteImage=detail.querySelector('.installation-photo img');
      siteImage?.addEventListener('error',()=>{const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Vista aérea no disponible en este momento.';siteImage.replaceWith(unavailable)});
    };
    const showOffshoreWindPostPtsDetail=site=>{
      clearNonElectricSelection();markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();offshoreWindPostPtsMarkers.classed('is-selected',candidate=>candidate===site);
      const sourceLinks=(site.sources||[]).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a>`).join(' · ');
      const photo=site.photoSrc?`<figure class="installation-photo"><img src="${escapeHtml(site.photoSrc)}" alt="${escapeHtml(site.photoAlt||site.name)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(site.photoCaption||'Prototipo eólico flotante instalado en BiMEP.')}</figcaption></figure>`:'';
      detail.innerHTML=`<h4>${escapeHtml(site.name)}</h4><p class="map-detail-lead">${escapeHtml(site.lead||'Ámbito de eólica marina flotante en Euskadi.')}</p><dl><dt>Estado</dt><dd>${escapeHtml(site.statusLabel)}</dd><dt>Configuración</dt><dd>${escapeHtml(site.prototype||'No definida')}</dd><dt>Tecnología</dt><dd>Eólica marina flotante</dd><dt>Función</dt><dd>${escapeHtml(site.scope)}</dd><dt>Capacidad</dt><dd>${escapeHtml(site.capacity)}</dd><dt>Profundidad</dt><dd>${escapeHtml(site.depth)}</dd><dt>Superficie / ámbito</dt><dd>${escapeHtml(site.area)}</dd><dt>Planificación</dt><dd>${escapeHtml(site.planning||'No indicada')}</dd><dt>Representación</dt><dd>${escapeHtml(site.locationNote)}</dd><dt>Entrada en el modelo</dt><dd>${escapeHtml(site.modelEntry||'No se suma al modelo.')}</dd></dl><p class="map-data-note">${escapeHtml(site.detailNote||'El símbolo representa una localización aproximada y no acredita autorización.')}</p><span class="map-source-badge">${sourceLinks}</span>${photo}`;refreshDetailActions();
    };
    const showWindRepoweringDetail=site=>{
      clearNonElectricSelection();markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();windRepoweringMarkers.classed('is-selected',candidate=>candidate===site);
      detail.innerHTML=`<h4>${escapeHtml(site.name)} · repotenciación</h4><p class="map-detail-lead">Sustitución potencial de aerogeneradores existentes por modelos modernos de mayor potencia.</p><dl><dt>Estado</dt><dd>${escapeHtml(site.statusLabel)}</dd><dt>Potencia base del estudio</dt><dd>${formatNumber(site.currentMW,2)} MW${Number.isFinite(site.registryMW)?` · inventario cartográfico: ${formatNumber(site.registryMW,2)} MW`:''}</dd><dt>Potencia repotenciada</dt><dd>${formatNumber(site.repoweredMW,3)} MW</dd><dt>Aumento potencial</dt><dd>+${formatNumber(site.additionalMW,3)} MW · +${formatNumber(site.increasePct,1)} %</dd><dt>Aerogeneradores actuales</dt><dd>${formatNumber(site.currentTurbines,0)}</dd><dt>Aerogeneradores del modelo PTS</dt><dd>${formatNumber(site.repoweredTurbines,0)}</dd>${site.parts?`<dt>Desglose</dt><dd>${escapeHtml(site.parts)}</dd>`:''}<dt>Entrada en la barra</dt><dd>Se suma solo el incremento de potencia, convertido con 2.650 horas equivalentes.</dd><dt>Entrada en las proyecciones</dt><dd>No se fija una fecha: es potencial técnico, no proyecto autorizado.</dd></dl><p class="map-data-note">Estas “P” forman parte de la capa «Nuevas zonas potenciales (PTS y más)», pero se colocan sobre parques ya existentes. El área de todos los círculos eólicos del mapa usa una única escala proporcional a los MW, por lo que un punto de mayor potencia siempre tiene mayor superficie. El total oficial evaluado para Elgea, Urkilla, Oiz y Badaia pasa de 143,37 a 232,155 MW (+62,6 %). La barra añade únicamente 88,785 MW y unos 235,3 GWh/año para evitar doble conteo. Punta Lucero no fue considerado como opción de repotenciación por el PTS.</p><span class="map-source-badge"><a href="${escapeHtml(site.sourceUrl)}" target="_blank" rel="noopener">Gobierno Vasco · PTS de Energías Renovables, estudio de repotenciación</a></span>`;refreshDetailActions();
    };
    const showBiscayInterconnectorDetail=()=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();biscayPaths.classed('is-selected',true);
      detail.innerHTML=`<h4>${escapeHtml(biscayMetadata.name||'Interconexión eléctrica por el Golfo de Bizkaia')}</h4><p class="map-detail-lead">Nuevo enlace independiente entre los sistemas eléctricos de España y Francia.</p><dl><dt>Estado</dt><dd>${escapeHtml(biscayMetadata.status||'En construcción')}</dd><dt>Puesta en servicio</dt><dd>Prevista a comienzos de 2028</dd><dt>Extremos</dt><dd>Gatika – Cubnezais (Francia)</dd><dt>Tecnología</dt><dd>${escapeHtml(biscayMetadata.voltage||'HVDC ±400 kV')}</dd><dt>Capacidad</dt><dd>${escapeHtml(biscayMetadata.capacity||'2 enlaces de 1.000 MW')}</dd><dt>Cables</dt><dd>${escapeHtml(biscayMetadata.cables||'4 cables')}</dd><dt>Tramo en Bizkaia</dt><dd>${escapeHtml(biscayMetadata.landLength||'13 km soterrados')}</dd><dt>Tramo submarino</dt><dd>${escapeHtml(biscayMetadata.marineLength||'Aproximadamente 300 km')}</dd></dl><p class="map-data-note">El enlace nuevo llega soterrado hasta Lemoiz y sale al mar mediante perforación dirigida. El eje azul marino procede del proyecto técnico georreferenciado; el tramo terrestre se representa de forma esquemática a esta escala.</p><span class="map-source-badge">INELFE / Red Eléctrica · proyecto en construcción</span>`;refreshDetailActions();
    };
    const sourceLinksForNonElectric=item=>(item.sources||nonElectricInfrastructure?.sources||[]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · ');
    const selectOnlyNonElectric=()=>{markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();clearNonElectricSelection()};
    const showNonElectricRouteDetail=record=>{
      const route=record.route;selectOnlyNonElectric();nonElectricRoutes.classed('is-selected',candidate=>candidate===record);
      detail.innerHTML=`<h4>${escapeHtml(route.name)}</h4><p class="map-detail-lead">${escapeHtml(nonElectricCategories[route.category]?.label||'Conducción energética no eléctrica')}.</p><dl><dt>Estado</dt><dd>${escapeHtml(route.statusLabel||'No indicado')}</dd><dt>Características publicadas</dt><dd>${escapeHtml(route.specification||'No indicadas')}</dd><dt>Representación</dt><dd>${escapeHtml(route.geometryNote||nonElectricInfrastructure?.geometryNote||'Recorrido aproximado')}</dd></dl><p class="map-data-note">Los extremos y las características técnicas proceden de la fuente enlazada. La línea permite comprender la estructura territorial de la red, pero no reproduce el trazado parcelario ni sirve para localizar servidumbres.</p><span class="map-source-badge">${sourceLinksForNonElectric(route)}</span>`;refreshDetailActions();
    };
    const showNonElectricFacilityDetail=facility=>{
      selectOnlyNonElectric();nonElectricFacilityMarkers.classed('is-selected',candidate=>candidate===facility);
      const category=nonElectricCategories[facility.category]?.label||'Infraestructura energética no eléctrica',facilityOrthophoto=orthophotoUrl(facility.coordinate),area=facility.area?`<dt>Área / ámbito</dt><dd>${escapeHtml(facility.area)}</dd>`:'';
      const orthophotoFigure=`<figure class="installation-photo"><img src="${escapeHtml(facilityOrthophoto)}" alt="Vista aérea del emplazamiento de ${escapeHtml(facility.name)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption()}</figcaption><span class="installation-photo-warning">La ortofoto se centra en la coordenada de referencia y no delimita necesariamente toda la instalación.</span></figure>`;
      const mainPhoto=facility.photoSrc?`<figure class="installation-photo"><img src="${escapeHtml(facility.photoSrc)}" alt="${escapeHtml(facility.photoAlt||facility.name)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(facility.photoCaption||facility.name)}</figcaption></figure>`:orthophotoFigure;
      const secondaryPhoto=facility.photoSrc?orthophotoFigure:'';
      detail.innerHTML=`<h4>${escapeHtml(facility.name)}</h4><p class="map-detail-lead">${escapeHtml(category)}.</p>${mainPhoto}<dl><dt>Estado</dt><dd>${escapeHtml(facility.statusLabel||'No indicado')}</dd><dt>Municipio / ámbito</dt><dd>${escapeHtml(facility.municipality||'No indicado')}</dd><dt>Función</dt><dd>${escapeHtml(facility.function||'No indicada')}</dd><dt>Capacidad</dt><dd>${escapeHtml(facility.capacity||'No publicada')}</dd>${area}</dl><p class="map-data-note">Esta capa representa los principales activos de entrada, transporte, almacenamiento y transformación. No incorpora la red capilar de distribución, estaciones de servicio ni todos los depósitos privados de consumo.</p><span class="map-source-badge">${sourceLinksForNonElectric(facility)}</span>${secondaryPhoto}`;refreshDetailActions();
      detail.querySelectorAll('.installation-photo img').forEach(facilityImage=>facilityImage.addEventListener('error',()=>{const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Imagen no disponible en este momento.';facilityImage.replaceWith(unavailable)}));
    };
    const originChartMarkup=(dataset,limit,extraClass='')=>{
      if(!dataset?.countries?.length)return'';
      const shown=dataset.countries.slice(0,limit||dataset.countries.length),hidden=limit?dataset.countries.slice(limit):[],items=[...shown];
      if(hidden.length)items.push({name:'Otros países',value:hidden.reduce((sum,item)=>sum+Number(item.value||0),0)});
      const rows=items.map(item=>{const share=dataset.total?100*Number(item.value||0)/dataset.total:0;return`<li data-origin-country="${escapeHtml(item.name)}"><span class="origin-country-name">${escapeHtml(item.name)}</span><span class="origin-country-track"><i style="width:${Math.max(.4,share).toFixed(2)}%"></i></span><strong>${formatNumber(share,1)} %</strong><small>${formatNumber(item.value,0)} ${escapeHtml(dataset.unit)}</small></li>`}).join('');
      return`<section class="energy-origin-chart ${extraClass}"><h5>${escapeHtml(dataset.title)}</h5><p>Total: <strong>${formatNumber(dataset.total,0)} ${escapeHtml(dataset.unit)}</strong></p><ol>${rows}</ol><span class="map-source-badge"><a href="${escapeHtml(dataset.source?.url||'#')}" target="_blank" rel="noopener">${escapeHtml(dataset.source?.label||'Fuente oficial')}</a></span></section>`;
    };
    const showImportOriginsDetail=()=>{
      selectOnlyNonElectric();importOriginVessel.classed('is-selected',true);
      const localShips=importOrigins?.bilbaoLngShips,localRows=localShips?.countries?.map(item=>`<li><strong>${formatNumber(item.value,0)}</strong> ${escapeHtml(item.name)}</li>`).join('')||'';
      detail.innerHTML=`<h4>Origen del gas y del petróleo · ${escapeHtml(importOrigins?.year||'2024')}</h4><p class="map-detail-lead">El barco abre la procedencia publicada de los productos energéticos no renovables que llegan por mar.</p><p class="map-data-note map-origin-scope"><strong>Ámbito de los datos.</strong> ${escapeHtml(importOrigins?.scopeNote||'Los datos disponibles tienen ámbitos territoriales diferentes.')}</p><div class="energy-origin-chart-grid">${originChartMarkup(importOrigins?.gas,5)}${originChartMarkup(importOrigins?.crude,5)}</div><section class="energy-origin-local"><h5>${escapeHtml(localShips?.title||'Terminal de Bilbao')}</h5><p><strong>${formatNumber(localShips?.total||0,0)} metaneros:</strong></p><ul>${localRows}</ul><p>${escapeHtml(localShips?.note||'')}</p><span class="map-source-badge"><a href="${escapeHtml(localShips?.source?.url||'#')}" target="_blank" rel="noopener">${escapeHtml(localShips?.source?.label||'Fuente oficial')}</a></span></section><div class="energy-origin-full">${originChartMarkup(importOrigins?.gas,null)}${originChartMarkup(importOrigins?.crude,null)}<p class="map-data-note">${escapeHtml(importOrigins?.bilbaoOilNote||'')}</p><span class="map-source-badge"><a href="${escapeHtml(importOrigins?.bilbaoOilSource?.url||'#')}" target="_blank" rel="noopener">${escapeHtml(importOrigins?.bilbaoOilSource?.label||'Puerto de Bilbao')}</a></span></div>`;
      refreshDetailActions();
    };
    const showRenewableImportOriginsDetail=()=>{
      selectOnlyNonElectric();renewableImportOriginVessel.classed('is-selected',true);
      const countryCharts=(renewableImportOrigins?.countryOrigins||[]).map(dataset=>originChartMarkup({...dataset,source:renewableImportOrigins?.source},5,'renewable-origin-chart')).join('');
      const countryChartsFull=(renewableImportOrigins?.countryOrigins||[]).map(dataset=>originChartMarkup({...dataset,source:renewableImportOrigins?.source},null,'renewable-origin-chart')).join('');
      const feedstockCharts=(renewableImportOrigins?.feedstocks||[]).map(dataset=>originChartMarkup({...dataset,source:renewableImportOrigins?.source},null,'renewable-origin-chart')).join('');
      detail.innerHTML=`<h4>Origen de los combustibles renovables · ${escapeHtml(renewableImportOrigins?.year||'2024')}</h4><p class="map-detail-lead">El barco marrón muestra el primer país de origen declarado de las materias primas certificadas en España.</p><p class="map-data-note map-origin-scope"><strong>Ámbito de los datos.</strong> ${escapeHtml(renewableImportOrigins?.scopeNote||'No existe un desglose público específico para Euskadi.')}</p><div class="energy-origin-chart-grid renewable-origin-grid">${countryCharts}</div><section class="energy-origin-local renewable-origin-risk"><h5>Riesgo de deforestación y uso del suelo</h5><p>${escapeHtml(renewableImportOrigins?.riskNote||'El origen geográfico es una señal de riesgo, no una prueba directa de deforestación.')}</p><span class="map-source-badge"><a href="${escapeHtml(renewableImportOrigins?.riskSource?.url||'#')}" target="_blank" rel="noopener">${escapeHtml(renewableImportOrigins?.riskSource?.label||'Marco europeo de sostenibilidad')}</a></span></section><div class="energy-origin-full renewable-origin-full">${countryChartsFull}${feedstockCharts}<p class="map-data-note"><strong>Cómo leer las materias primas.</strong> ${escapeHtml(renewableImportOrigins?.methodNote||'')}</p></div>`;
      refreshDetailActions();
    };
    const showStorageDetail=facility=>{
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();clearNonElectricSelection();
      storageMarkerGroups.classed('is-selected',candidate=>candidate===facility);
      const sourceLinks=(facility.sources||[]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · ');
      const isPumpedHydro=facility.storageKind==='pumped-hydro',powerMarkup=facility.powerMW===null?'No publicada':`${formatNumber(facility.powerMW,facility.powerMW<10?2:1)} MW`,energyMarkup=facility.energyMWh===null?'No publicada':`${formatNumber(facility.energyMWh,facility.energyMWh<10?3:2)} MWh`,durationMarkup=Number.isFinite(Number(facility.durationHours))?`${formatNumber(facility.durationHours,2)} horas a potencia nominal`:'No calculable con los datos publicados',connectionMarkup=Number.isFinite(Number(facility.connectionMW))?`<dt>Potencia en conexión</dt><dd>${formatNumber(facility.connectionMW,2)} MW</dd>`:'',existingGenerationMarkup=Number.isFinite(Number(facility.existingGenerationMW))?`<dt>Potencia de generación existente</dt><dd>${formatNumber(facility.existingGenerationMW,2)} MW</dd>`:'';
      detail.innerHTML=`<h4>${escapeHtml(facility.name)}</h4><p class="map-detail-lead">${isPumpedHydro?'Proyecto de almacenamiento hidráulico reversible. El agua se eleva en horas valle y vuelve a turbinarse cuando resulta útil para el sistema.':'Almacenamiento eléctrico con batería. El tamaño del círculo representa los MWh cuando están publicados.'}</p><dl><dt>Estado</dt><dd>${escapeHtml(facility.statusLabel)}</dd><dt>Municipio</dt><dd>${escapeHtml(facility.municipality)}</dd><dt>Potencia de almacenamiento</dt><dd>${powerMarkup}</dd>${connectionMarkup}${existingGenerationMarkup}<dt>Capacidad energética</dt><dd>${energyMarkup}</dd><dt>Duración equivalente</dt><dd>${durationMarkup}</dd><dt>Tecnología</dt><dd>${escapeHtml(facility.technology||'Sistema BESS')}</dd><dt>Localización y alcance</dt><dd>${escapeHtml(facility.locationNote||'Punto representativo del ámbito documentado')}</dd></dl><p class="map-data-note">${isPumpedHydro?'<strong>Antoñana aún no suma capacidad cuantificada al modelo.</strong> El expediente confirma la conversión reversible y publica volúmenes de agua y horas de operación, pero no la potencia de bombeo ni los MWh eléctricos útiles. Por eso el símbolo tiene tamaño mínimo y el proyecto queda fuera de los totales cuantitativos.':'<strong>MW no son MWh.</strong> Los MW indican cuánta potencia puede entregar o absorber en un instante; los MWh, cuánta energía puede almacenar. Esta instalación desplaza electricidad en el tiempo, pero no genera energía nueva y no se suma a la barra lateral.'}</p><span class="map-source-badge">${sourceLinks||'Fuente pública no enlazada'}</span>`;
      refreshDetailActions();
    };
    let detailPinned=false;
    const handleDetailInteraction=(event,render)=>{if(event.type==='mouseenter'&&detailPinned)return;if(event.type==='click'){event.stopPropagation();detailPinned=true}clearStorageSelection();render()};
    const handleDetailKeyboard=(event,render)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();detailPinned=true;clearStorageSelection();render()}};
    markers.on('mouseenter focus click',(event,d)=>handleDetailInteraction(event,()=>showDetail(d))).on('keydown',(event,d)=>handleDetailKeyboard(event,()=>showDetail(d)));
    populationGroups.on('mouseenter focus click',(event,record)=>handleDetailInteraction(event,()=>showPopulationDetail(record))).on('keydown',(event,record)=>handleDetailKeyboard(event,()=>showPopulationDetail(record)));
    networkNodes.on('mouseenter focus click',(event,d)=>handleDetailInteraction(event,()=>showNetworkDetail(d))).on('keydown',(event,d)=>handleDetailKeyboard(event,()=>showNetworkDetail(d)));
    importGateways.on('mouseenter focus click',(event,d)=>handleDetailInteraction(event,()=>showNetworkDetail(d))).on('keydown',(event,d)=>handleDetailKeyboard(event,()=>showNetworkDetail(d)));
    projectPaths.on('mouseenter focus click',(event,record)=>handleDetailInteraction(event,()=>showProjectDetail(record.project))).on('keydown',(event,record)=>handleDetailKeyboard(event,()=>showProjectDetail(record.project)));
    projectMarkers.on('mouseenter focus click',(event,record)=>handleDetailInteraction(event,()=>showProjectDetail(record.project))).on('keydown',(event,record)=>handleDetailKeyboard(event,()=>showProjectDetail(record.project)));
    generationProjectMarkers.on('mouseenter focus click',(event,project)=>handleDetailInteraction(event,()=>showGenerationProjectDetail(project))).on('keydown',(event,project)=>handleDetailKeyboard(event,()=>showGenerationProjectDetail(project)));
    pipelineProjectMarkers.on('mouseenter focus click',(event,project)=>handleDetailInteraction(event,()=>showPipelineProjectDetail(project))).on('keydown',(event,project)=>handleDetailKeyboard(event,()=>showPipelineProjectDetail(project)));
    ptsPotentialMarkers.on('mouseenter focus click',(event,site)=>handleDetailInteraction(event,()=>showPtsPotentialDetail(site))).on('keydown',(event,site)=>handleDetailKeyboard(event,()=>showPtsPotentialDetail(site)));
    offshoreWindPostPtsMarkers.on('mouseenter focus click',(event,site)=>handleDetailInteraction(event,()=>showOffshoreWindPostPtsDetail(site))).on('keydown',(event,site)=>handleDetailKeyboard(event,()=>showOffshoreWindPostPtsDetail(site)));
    windRepoweringMarkers.on('mouseenter focus click',(event,site)=>handleDetailInteraction(event,()=>showWindRepoweringDetail(site))).on('keydown',(event,site)=>handleDetailKeyboard(event,()=>showWindRepoweringDetail(site)));
    biscayPaths.on('mouseenter focus click',event=>handleDetailInteraction(event,showBiscayInterconnectorDetail)).on('keydown',event=>handleDetailKeyboard(event,showBiscayInterconnectorDetail));
    nonElectricRoutes.on('mouseenter focus click',(event,record)=>handleDetailInteraction(event,()=>showNonElectricRouteDetail(record))).on('keydown',(event,record)=>handleDetailKeyboard(event,()=>showNonElectricRouteDetail(record)));
    nonElectricFacilityMarkers.on('mouseenter focus click',(event,facility)=>handleDetailInteraction(event,()=>showNonElectricFacilityDetail(facility))).on('keydown',(event,facility)=>handleDetailKeyboard(event,()=>showNonElectricFacilityDetail(facility)));
    importOriginVessel.on('mouseenter focus click',event=>handleDetailInteraction(event,showImportOriginsDetail)).on('keydown',event=>handleDetailKeyboard(event,showImportOriginsDetail));
    renewableImportOriginVessel.on('mouseenter focus click',event=>handleDetailInteraction(event,showRenewableImportOriginsDetail)).on('keydown',event=>handleDetailKeyboard(event,showRenewableImportOriginsDetail));
    storageMarkerGroups.on('mouseenter focus click',(event,facility)=>handleDetailInteraction(event,()=>showStorageDetail(facility))).on('keydown',(event,facility)=>handleDetailKeyboard(event,()=>showStorageDetail(facility)));
    svg.on('click',event=>{if(event.target===svg.node()){detailPinned=false;markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPipelineProjectSelection();clearPtsPotentialSelection();clearOffshoreWindPostPtsSelection();clearStorageSelection();clearNonElectricSelection();defaultDetail()}});
    defaultDetail();

    const infrastructureFocus=substationFocus||storageFocus||offshoreWindFocus,focusedWindMap=focusedTechnologyKey==='wind',focusedSolarMap=focusedTechnologyKey==='solar',focusedMarineMap=focusedTechnologyKey==='other',active=new Set(infrastructureFocus?[]:(focusedTechnologyKey?[focusedTechnologyKey]:TECHNOLOGY_ORDER)),activeCogenFuelClasses=new Set(!infrastructureFocus&&(!focusedTechnologyKey||focusedTechnologyKey==='cogen')?COGEN_FUEL_CLASS_ORDER:[]),threshold=.1,defaultGenerationProjectsVisible=cfg.defaultGenerationProjectsVisible!==undefined?Boolean(cfg.defaultGenerationProjectsVisible):!infrastructureFocus&&(isNormativeScenario||focusedWindMap),defaultPtsPotentialVisible=cfg.defaultPtsPotentialVisible!==undefined?Boolean(cfg.defaultPtsPotentialVisible):!infrastructureFocus&&(isNormativeScenario||focusedWindMap),defaultImportsVisible=Boolean(cfg.defaultImportsVisible),defaultFossilGenerationVisible=cfg.defaultFossilGenerationVisible!==undefined?Boolean(cfg.defaultFossilGenerationVisible):!infrastructureFocus&&(!focusedTechnologyKey||focusedTechnologyKey==='cycle');let fossilGenerationActive=defaultFossilGenerationVisible,includeSmall=!infrastructureFocus,eveSolarVisible=!infrastructureFocus&&usesEveSolarLayer,networkVisible=false,substationsVisible=false,substationExistingVisible=substationFocus,substationNewVisible=substationFocus,substationExpansionVisible=substationFocus,importsVisible=defaultImportsVisible,generationProjectsVisible=defaultGenerationProjectsVisible,pipelineProjectsVisible=false,ptsPotentialVisible=defaultPtsPotentialVisible,offshoreWindPostPtsVisible=offshoreWindFocus||focusedWindMap,storageVisible=storageFocus,populationsVisible=false,nonElectricVisible=false,renewableFuelVisible=false,biomassVisible=false;
    if(!defaultFossilGenerationVisible){active.delete('cycle');activeCogenFuelClasses.delete('fossil');if(!activeCogenFuelClasses.size)active.delete('cogen')}
    const isPotentialTechnologyActive=key=>key==='solar'&&usesEveSolarLayer?eveSolarVisible:active.has(key);
    const filterButtons=new Map(),cogenFuelButtons=new Map();
    const networkButton=document.createElement('button');networkButton.type='button';networkButton.className='map-network-toggle';networkButton.setAttribute('aria-pressed','false');networkButton.innerHTML='<i aria-hidden="true"></i>Red eléctrica · líneas 132/220/400 kV';networkButton.title='Mostrar u ocultar las líneas de 132, 220 y 400 kV y sus actuaciones aprobadas o en construcción; las subestaciones tienen una capa independiente';networkButton.addEventListener('click',()=>{networkVisible=!networkVisible;updateNetworkVisibility()});
    const substationButton=document.createElement('button');substationButton.type='button';substationButton.className='map-substation-toggle';substationButton.setAttribute('aria-pressed','false');substationButton.innerHTML='<i aria-hidden="true"></i>Subestaciones · existentes, ampliaciones y nuevas';substationButton.title='Mostrar u ocultar las subestaciones existentes clasificadas por tensión y las nuevas o ampliadas con localización pública verificada';substationButton.addEventListener('click',()=>{substationsVisible=!substationsVisible;updateNetworkVisibility();updateVisibility()});
    const substationExistingButton=document.createElement('button');substationExistingButton.type='button';substationExistingButton.className='map-substation-toggle map-substation-existing-toggle';substationExistingButton.setAttribute('aria-pressed',String(substationExistingVisible));substationExistingButton.innerHTML='<i aria-hidden="true"></i>Subestaciones existentes';substationExistingButton.title='Mostrar u ocultar las huellas y nudos de subestaciones existentes, diferenciados por tensión';substationExistingButton.addEventListener('click',()=>{substationExistingVisible=!substationExistingVisible;updateNetworkVisibility();updateVisibility()});
    const substationNewButton=document.createElement('button');substationNewButton.type='button';substationNewButton.className='map-substation-toggle map-substation-new-toggle';substationNewButton.setAttribute('aria-pressed',String(substationNewVisible));substationNewButton.innerHTML='<i aria-hidden="true"></i>Nueva · en construcción';substationNewButton.title='Mostrar u ocultar la nueva subestación localizada de Luminabaso';substationNewButton.addEventListener('click',()=>{substationNewVisible=!substationNewVisible;updateNetworkVisibility();updateVisibility()});
    const substationExpansionButton=document.createElement('button');substationExpansionButton.type='button';substationExpansionButton.className='map-substation-toggle map-substation-expansion-toggle';substationExpansionButton.setAttribute('aria-pressed',String(substationExpansionVisible));substationExpansionButton.innerHTML='<i aria-hidden="true"></i>Ampliación o adaptación';substationExpansionButton.title='Mostrar u ocultar las ampliaciones o adaptaciones localizadas en Abanto, Mercedes-Benz y Gatika';substationExpansionButton.addEventListener('click',()=>{substationExpansionVisible=!substationExpansionVisible;updateNetworkVisibility();updateVisibility()});
    const importButton=document.createElement('button');importButton.type='button';importButton.className='map-import-toggle';importButton.setAttribute('aria-pressed',String(importsVisible));importButton.innerHTML=`<i aria-hidden="true"></i>${modelledGatewayFlows?'Importación eléctrica modelizada':'Capacidad de entrada de importación'}`;importButton.title=modelledGatewayFlows?'Mostrar u ocultar los flujos anuales de importación modelizados para 2050':useEstimatedGatewayFlows?'Mostrar u ocultar los flujos anuales estimados de 2025 con la misma escala que el mapa peninsular':'Mostrar u ocultar la capacidad de las conexiones exteriores por las que puede entrar electricidad a Euskadi';importButton.addEventListener('click',()=>{importsVisible=!importsVisible;updateNetworkVisibility()});
    const storageButton=document.createElement('button');storageButton.type='button';storageButton.className='map-storage-toggle';storageButton.setAttribute('aria-pressed','false');storageButton.innerHTML='<i aria-hidden="true"></i>Almacenamiento eléctrico';storageButton.title='Mostrar u ocultar baterías y proyectos de almacenamiento hidráulico con tramitación pública';storageButton.addEventListener('click',()=>{storageVisible=!storageVisible;updateNetworkVisibility();updateVisibility()});
    const generationProjectButton=document.createElement('button');generationProjectButton.type='button';generationProjectButton.className='map-generation-project-toggle';generationProjectButton.setAttribute('aria-pressed','false');generationProjectButton.innerHTML='<i aria-hidden="true"></i>Generación en construcción o aprobada';generationProjectButton.title='Mostrar u ocultar los proyectos de generación con autorización formal o construcción iniciada';generationProjectButton.addEventListener('click',()=>{generationProjectsVisible=!generationProjectsVisible;updateNetworkVisibility();updateVisibility()});
    const pipelineProjectButton=document.createElement('button');pipelineProjectButton.type='button';pipelineProjectButton.className='map-pipeline-project-toggle';pipelineProjectButton.setAttribute('aria-pressed','false');pipelineProjectButton.innerHTML='<i aria-hidden="true"></i>Generación en tramitación';pipelineProjectButton.title='Mostrar u ocultar expedientes públicos todavía no autorizados; al activarlos su producción estimada se suma de forma exploratoria a la electricidad propia solar o eólica';pipelineProjectButton.addEventListener('click',()=>{pipelineProjectsVisible=!pipelineProjectsVisible;updateNetworkVisibility();updateVisibility()});
    const ptsPotentialButton=document.createElement('button');ptsPotentialButton.type='button';ptsPotentialButton.className='map-pts-potential-toggle';ptsPotentialButton.setAttribute('aria-pressed','false');ptsPotentialButton.innerHTML='<i aria-hidden="true"></i>Nuevas zonas potenciales (PTS y más)';ptsPotentialButton.title=focusedMarineMap?'Mostrar u ocultar las zonas portuarias seleccionadas por el PTS para posible aprovechamiento de energía oceánica y otras propuestas de futuro':'Mostrar u ocultar las zonas potenciales del PTS, la repotenciación de parques existentes y otras propuestas de futuro que no forman parte del PTS';ptsPotentialButton.addEventListener('click',()=>{ptsPotentialVisible=!ptsPotentialVisible;updateNetworkVisibility();updateVisibility()});
    const normativeScenarioButton=document.createElement('button');normativeScenarioButton.type='button';normativeScenarioButton.className='map-normative-scenario-toggle';normativeScenarioButton.title='Alternar entre la senda normativa con más electricidad renovable importada y la senda con más generación renovable propia';const ownGenerationScenarioActive=()=>generationProjectsVisible&&pipelineProjectsVisible&&ptsPotentialVisible,syncNormativeScenarioButton=()=>{const ownActive=ownGenerationScenarioActive();normativeScenarioButton.setAttribute('aria-pressed',String(ownActive));normativeScenarioButton.innerHTML=`<i aria-hidden="true"></i>${ownActive?'Más generación renovable propia':'Más energía renovable importada'}`};normativeScenarioButton.addEventListener('click',()=>{const next=!ownGenerationScenarioActive();generationProjectsVisible=next;pipelineProjectsVisible=next;ptsPotentialVisible=next;updateNetworkVisibility();updateVisibility()});syncNormativeScenarioButton();
    const offshoreWindPostPtsButton=document.createElement('button');offshoreWindPostPtsButton.type='button';offshoreWindPostPtsButton.className='map-offshore-post-pts-toggle';offshoreWindPostPtsButton.setAttribute('aria-pressed','false');offshoreWindPostPtsButton.innerHTML=`<i aria-hidden="true"></i>${offshoreWindFocus?'Eólica marina flotante · BiMEP':'Eólica marina · BiMEP'}`;offshoreWindPostPtsButton.title='Mostrar u ocultar el ámbito de investigación y ensayo de eólica marina flotante de BiMEP';offshoreWindPostPtsButton.addEventListener('click',()=>{offshoreWindPostPtsVisible=!offshoreWindPostPtsVisible;updateNetworkVisibility();updateVisibility()});
    const populationButton=document.createElement('button');populationButton.type='button';populationButton.className='map-population-toggle';populationButton.setAttribute('aria-pressed','false');populationButton.innerHTML='<i aria-hidden="true"></i>Poblaciones';populationButton.title='Mostrar u ocultar las poblaciones; aparecen más nombres al acercar el mapa';populationButton.addEventListener('click',()=>{populationsVisible=!populationsVisible;updatePopulationVisibility()});
    const nonElectricButton=document.createElement('button');nonElectricButton.type='button';nonElectricButton.className='map-non-electric-toggle';nonElectricButton.setAttribute('aria-pressed','false');nonElectricButton.innerHTML='<i aria-hidden="true"></i>Infraestructura de gas y petróleo';nonElectricButton.title='Mostrar u ocultar gasoductos, almacenamiento y entrada de gas, refinería, terminales, oleoductos y poliductos';nonElectricButton.addEventListener('click',()=>{nonElectricVisible=!nonElectricVisible;updateNetworkVisibility();updateVisibility()});
    const renewableFuelLayerLabel=cfg.renewableFuelLayerLabel||'Combustibles renovables',renewableFuelButton=document.createElement('button');renewableFuelButton.type='button';renewableFuelButton.className='map-renewable-fuel-toggle';renewableFuelButton.setAttribute('aria-pressed','false');renewableFuelButton.innerHTML=`<i aria-hidden="true"></i>${escapeHtml(renewableFuelLayerLabel)}`;renewableFuelButton.title=renewableFuelFacilityIdFilter?'Mostrar u ocultar las instalaciones cartografiadas de biocombustibles y biometano':'Mostrar u ocultar las instalaciones de biocombustibles, bioGNL e hidrógeno renovable';renewableFuelButton.addEventListener('click',()=>{renewableFuelVisible=!renewableFuelVisible;updateNetworkVisibility();updateVisibility()});
    const biomassButton=document.createElement('button');biomassButton.type='button';biomassButton.className='map-biomass-toggle';biomassButton.setAttribute('aria-pressed','false');biomassButton.innerHTML='<i aria-hidden="true"></i>Biomasa no eléctrica';biomassButton.title='Mostrar instalaciones térmicas representativas y el total agregado de biomasa usada directamente para calor';biomassButton.addEventListener('click',()=>{biomassVisible=!biomassVisible;updateNetworkVisibility();updateVisibility()});
    const eveSolarButton=document.createElement('button');eveSolarButton.type='button';eveSolarButton.className='map-filter';eveSolarButton.style.setProperty('--map-color',EVE_SOLAR_COLOR);eveSolarButton.setAttribute('aria-pressed','true');eveSolarButton.innerHTML=`<i aria-hidden="true"></i>Solar a red · declarado por EVE <strong>(${formatNumber(eveSolarEstimatedGWh,1)} GWh/año est. · ${formatNumber(eveSolarRecords.length,0)} instalaciones)</strong>`;eveSolarButton.title=`${formatNumber(eveSolarEstimatedGWh,1)} GWh/año estimados para ${formatNumber(eveSolarRecords.length,0)} instalaciones declaradas por EVE, aplicando ${formatNumber(SOLAR_MODEL_EQUIVALENT_HOURS,0)} horas equivalentes · única capa solar en servicio vinculada a la barra lateral`;eveSolarButton.addEventListener('click',()=>{eveSolarVisible=!eveSolarVisible;eveSolarButton.setAttribute('aria-pressed',String(eveSolarVisible));updateVisibility()});
    metadata.filter(item=>item.points>0&&!['cycle','cogen'].includes(item.key)).forEach(item=>{
      const button=document.createElement('button'),annualEnergy=onlyEveSolar?eveSolarEstimatedGWh:esiosSolarEstimatedInjectedGWh,energyLabel=onlyEveSolar?'GWh/año est.':'GWh/año vertidos est.',summary=item.key==='solar'?(onlyEveSolar?`(${formatNumber(annualEnergy,1)} ${energyLabel} · ${formatNumber(item.points,0)} puntos)`:`(${formatNumber(item.points,0)} puntos)`):formatNumber(item.points,0);button.type='button';button.className='map-filter';button.style.setProperty('--map-color',item.key==='solar'?(onlyEveSolar?EVE_SOLAR_COLOR:ESIOS_SOLAR_COLOR):item.color);button.setAttribute('aria-pressed','true');button.innerHTML=`<i aria-hidden="true"></i>${item.label} <strong>${summary}</strong>`;button.title=item.key==='solar'?(onlyEveSolar?`${formatNumber(eveSolarEstimatedGWh,1)} GWh/año estimados para ${formatNumber(item.points,0)} instalaciones solares a red declaradas por EVE, aplicando ${formatNumber(SOLAR_MODEL_EQUIVALENT_HOURS,0)} horas equivalentes`:`${formatNumber(esiosSolarEstimatedInjectedGWh,1)} GWh/año vertidos estimados sobre ${formatNumber(esiosSolarRecords.length,0)} registros fotovoltaicos ESIOS; la capa muestra ${formatNumber(item.points,0)} puntos en total: ${formatNumber(esiosSolarEstimatedGWh,1)} GWh/año brutos × ${formatNumber(ESIOS_SOLAR_EXPORT_SHARE*100,1)} % de vertido solar observado por Red Eléctrica en 2025 · no se vincula a la barra lateral`):`${formatNumber(item.points,0)} emplazamientos · ${formatNumber(item.mw,1)} MW nominales inventariados`;
      button.addEventListener('click',()=>{active.has(item.key)?active.delete(item.key):active.add(item.key);button.setAttribute('aria-pressed',String(active.has(item.key)));updateVisibility()});
      filterButtons.set(item.key,button);
    });
    const fossilCycleRecords=records.filter(record=>record.key==='cycle'),fossilCogenRecords=records.filter(record=>record.key==='cogen'&&record.cogenFuelClass==='fossil'),fossilGenerationButton=document.createElement('button');fossilGenerationButton.type='button';fossilGenerationButton.className='map-filter map-cogen-filter cogen-fuel-fossil';fossilGenerationButton.style.setProperty('--map-color',COGEN_FUEL_CLASSES.fossil.color);fossilGenerationButton.setAttribute('aria-pressed',String(fossilGenerationActive));fossilGenerationButton.innerHTML=`<i aria-hidden="true"></i>Generación fósil <strong>${formatNumber(fossilCycleRecords.length+fossilCogenRecords.length,0)}</strong>`;fossilGenerationButton.title=`Ciclo combinado y cogeneración con combustible fósil verificado · ${formatNumber(fossilCycleRecords.reduce((sum,record)=>sum+record.mw,0)+fossilCogenRecords.reduce((sum,record)=>sum+record.mw,0),1)} MW`;
    fossilGenerationButton.addEventListener('click',()=>{fossilGenerationActive=!fossilGenerationActive;fossilGenerationActive?(active.add('cycle'),activeCogenFuelClasses.add('fossil')):(active.delete('cycle'),activeCogenFuelClasses.delete('fossil'));activeCogenFuelClasses.size?active.add('cogen'):active.delete('cogen');fossilGenerationButton.setAttribute('aria-pressed',String(fossilGenerationActive));updateVisibility()});cogenFuelButtons.set('fossil',fossilGenerationButton);
    COGEN_FUEL_CLASS_ORDER.filter(fuelClass=>fuelClass!=='fossil').forEach(fuelClass=>{
      const config=COGEN_FUEL_CLASSES[fuelClass],subset=records.filter(record=>record.key==='cogen'&&record.cogenFuelClass===fuelClass);if(!subset.length)return;const button=document.createElement('button');button.type='button';button.className=`map-filter map-cogen-filter cogen-fuel-${fuelClass}`;button.style.setProperty('--map-color',config.color);button.setAttribute('aria-pressed','true');button.innerHTML=`<i aria-hidden="true"></i>${config.label} <strong>${formatNumber(subset.length,0)}</strong>`;button.title=`${formatNumber(subset.length,0)} emplazamientos · ${formatNumber(subset.reduce((sum,record)=>sum+record.mw,0),1)} MW. Subgrupo del inventario agregado «Cogeneración, residuos y biomasa».`;
      button.addEventListener('click',()=>{activeCogenFuelClasses.has(fuelClass)?activeCogenFuelClasses.delete(fuelClass):activeCogenFuelClasses.add(fuelClass);activeCogenFuelClasses.size?active.add('cogen'):active.delete('cogen');button.setAttribute('aria-pressed',String(activeCogenFuelClasses.has(fuelClass)));updateVisibility()});cogenFuelButtons.set(fuelClass,button);
    });
    const smallButton=document.createElement('button');smallButton.type='button';smallButton.className='map-reset-filters';smallButton.setAttribute('aria-pressed','true');smallButton.textContent='Ocultar instalaciones pequeñas';smallButton.title='Muestra u oculta los puntos de instalaciones menores de 0,1 MW';smallButton.addEventListener('click',()=>{includeSmall=!includeSmall;smallButton.setAttribute('aria-pressed',String(includeSmall));smallButton.textContent=includeSmall?'Ocultar instalaciones pequeñas':'Mostrar instalaciones pequeñas';updateVisibility()});
    const standardFilterControls=[cfg.unifiedNormativeMap?normativeScenarioButton:null,nonElectricButton,importButton,storageButton,filterButtons.get('cycle'),...COGEN_FUEL_CLASS_ORDER.map(key=>cogenFuelButtons.get(key)),renewableFuelButton,biomassButton,filterButtons.get('hydro'),filterButtons.get('wind'),usesEveSolarLayer?eveSolarButton:null,filterButtons.get('solar'),filterButtons.get('other'),cfg.unifiedNormativeMap?null:generationProjectButton,cfg.unifiedNormativeMap?null:pipelineProjectButton,cfg.unifiedNormativeMap?null:ptsPotentialButton,offshoreWindPostPtsButton,populationButton,networkButton,substationButton];
    const focusedFilterControls=[...(focusedSolarMap&&showBothSolar?[eveSolarButton,filterButtons.get('solar')]:[onlyEveSolar?eveSolarButton:filterButtons.get(focusedTechnologyKey)]),(focusedWindMap||focusedSolarMap)?generationProjectButton:null,(focusedWindMap||focusedSolarMap)?pipelineProjectButton:null,(focusedWindMap||focusedSolarMap||focusedMarineMap)?ptsPotentialButton:null,focusedWindMap?offshoreWindPostPtsButton:null,populationButton];
    const substationFilterControls=[substationExistingButton,substationNewButton,substationExpansionButton,populationButton];
    const storageFilterControls=[storageButton,populationButton];
    const offshoreWindFilterControls=[offshoreWindPostPtsButton,populationButton];
    (substationFocus?substationFilterControls:storageFocus?storageFilterControls:offshoreWindFocus?offshoreWindFilterControls:focusedTechnologyKey?focusedFilterControls:standardFilterControls).filter(Boolean).forEach(button=>filters.append(button));
    const clearButton=document.createElement('button');clearButton.type='button';clearButton.className='map-reset-filters map-clear-filters';clearButton.textContent='Limpiar mapa';clearButton.title='Ocultar todas las tecnologías, instalaciones, redes y capas del mapa';clearButton.addEventListener('click',()=>{active.clear();activeCogenFuelClasses.clear();fossilGenerationActive=false;filterButtons.forEach(button=>button.setAttribute('aria-pressed','false'));cogenFuelButtons.forEach(button=>button.setAttribute('aria-pressed','false'));includeSmall=false;eveSolarVisible=false;eveSolarButton.setAttribute('aria-pressed','false');smallButton.setAttribute('aria-pressed','false');smallButton.textContent='Mostrar instalaciones pequeñas';networkVisible=false;substationsVisible=false;substationExistingVisible=false;substationNewVisible=false;substationExpansionVisible=false;importsVisible=false;generationProjectsVisible=false;pipelineProjectsVisible=false;ptsPotentialVisible=false;offshoreWindPostPtsVisible=false;storageVisible=false;populationsVisible=false;nonElectricVisible=false;renewableFuelVisible=false;biomassVisible=false;detailPinned=false;markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPipelineProjectSelection();clearPtsPotentialSelection();clearOffshoreWindPostPtsSelection();clearWindRepoweringSelection();clearStorageSelection();clearNonElectricSelection();setElectricityExpanded(false);updateNetworkVisibility();updatePopulationVisibility();updateVisibility();defaultDetail()});filters.append(clearButton);
    const resetButton=document.createElement('button');resetButton.type='button';resetButton.className='map-reset-filters';resetButton.textContent='Restablecer filtros';resetButton.addEventListener('click',()=>{
      active.clear();(infrastructureFocus?[]:(focusedTechnologyKey?[focusedTechnologyKey]:TECHNOLOGY_ORDER)).forEach(key=>active.add(key));
      activeCogenFuelClasses.clear();if(!infrastructureFocus&&(!focusedTechnologyKey||focusedTechnologyKey==='cogen'))COGEN_FUEL_CLASS_ORDER.forEach(key=>activeCogenFuelClasses.add(key));
      fossilGenerationActive=defaultFossilGenerationVisible;if(!defaultFossilGenerationVisible){active.delete('cycle');activeCogenFuelClasses.delete('fossil');if(!activeCogenFuelClasses.size)active.delete('cogen')}
      filterButtons.forEach((button,key)=>button.setAttribute('aria-pressed',String(active.has(key))));
      cogenFuelButtons.forEach((button,key)=>button.setAttribute('aria-pressed',String(activeCogenFuelClasses.has(key))));
      includeSmall=!infrastructureFocus;eveSolarVisible=!infrastructureFocus;eveSolarButton.setAttribute('aria-pressed',String(eveSolarVisible));smallButton.setAttribute('aria-pressed',String(includeSmall));smallButton.textContent=includeSmall?'Ocultar instalaciones pequeñas':'Mostrar instalaciones pequeñas';networkVisible=false;substationsVisible=false;substationExistingVisible=substationFocus;substationNewVisible=substationFocus;substationExpansionVisible=substationFocus;importsVisible=defaultImportsVisible;generationProjectsVisible=focusedWindMap||(!focusedTechnologyKey&&defaultGenerationProjectsVisible);pipelineProjectsVisible=false;ptsPotentialVisible=focusedWindMap||(!focusedTechnologyKey&&defaultPtsPotentialVisible);offshoreWindPostPtsVisible=offshoreWindFocus||focusedWindMap;storageVisible=storageFocus;populationsVisible=false;nonElectricVisible=false;renewableFuelVisible=false;biomassVisible=false;setElectricityExpanded(false);updateNetworkVisibility();updatePopulationVisibility();updateVisibility()
    });filters.append(resetButton);

    function updateNetworkVisibility(){
      const facilityIsVisible=facility=>facility.category==='renewableGas'?renewableFuelVisible:facility.category==='thermalBiomass'?biomassVisible:nonElectricVisible;
      const showExistingSubstations=substationFocus?substationExistingVisible:substationsVisible,showNewSubstations=substationFocus?substationNewVisible:substationsVisible,showExpandedSubstations=substationFocus?substationExpansionVisible:substationsVisible,showAnySubstations=showExistingSubstations||showNewSubstations||showExpandedSubstations;
      const offshoreSiteIsVisible=site=>offshoreWindPostPtsVisible,anyOffshoreSiteVisible=OFFSHORE_WIND_POST_PTS.some(offshoreSiteIsVisible);
      gridLayer.style('display',networkVisible?null:'none');nodeLayer.style('display',networkVisible?null:'none');local132Layer.style('display',networkVisible?null:'none');substationLayer.style('display',showExistingSubstations?null:'none');verifiedSubstationLayer.style('display',showExistingSubstations?null:'none');projectLayer.style('display',networkVisible||showAnySubstations?null:'none');projectPaths.style('display',networkVisible?null:'none');projectMarkers.style('display',record=>isSubstationProject(record.project)?(isNewSubstationProject(record.project)?(showNewSubstations?null:'none'):(showExpandedSubstations?null:'none')):(networkVisible?null:'none'));biscayLayer.style('display',networkVisible?null:'none');biscayNodeLayer.style('display',networkVisible?null:'none');importGatewayLayer.style('display',importsVisible?null:'none');generationProjectLayer.style('display',generationProjectsVisible?null:'none');pipelineProjectLayer.style('display',pipelineProjectsVisible?null:'none');ptsPotentialLayer.style('display',ptsPotentialVisible?null:'none');windRepoweringLayer.style('display',ptsPotentialVisible&&active.has('wind')?null:'none');offshoreWindPostPtsLayer.style('display',anyOffshoreSiteVisible?null:'none');offshoreWindPostPtsMarkers.style('display',site=>offshoreSiteIsVisible(site)?null:'none');storageLayer.style('display',storageVisible?null:'none');nonElectricLayer.style('display',nonElectricVisible||renewableFuelVisible||biomassVisible?null:'none');nonElectricRoutes.style('display',nonElectricVisible?null:'none');nonElectricFacilityMarkers.style('display',facility=>facilityIsVisible(facility)?null:'none');nonElectricFacilityLeaders.style('display',facility=>facilityIsVisible(facility)?null:'none');importOriginVessel.style('display',nonElectricVisible?null:'none');renewableImportOriginVessel.style('display',renewableFuelVisible?null:'none');networkLegend.hidden=!(networkVisible||showAnySubstations||importsVisible||generationProjectsVisible||pipelineProjectsVisible||ptsPotentialVisible||anyOffshoreSiteVisible||storageVisible||nonElectricVisible||renewableFuelVisible||biomassVisible);networkButton.setAttribute('aria-pressed',String(networkVisible));substationButton.setAttribute('aria-pressed',String(substationsVisible));substationExistingButton.setAttribute('aria-pressed',String(substationExistingVisible));substationNewButton.setAttribute('aria-pressed',String(substationNewVisible));substationExpansionButton.setAttribute('aria-pressed',String(substationExpansionVisible));importButton.setAttribute('aria-pressed',String(importsVisible));generationProjectButton.setAttribute('aria-pressed',String(generationProjectsVisible));pipelineProjectButton.setAttribute('aria-pressed',String(pipelineProjectsVisible));ptsPotentialButton.setAttribute('aria-pressed',String(ptsPotentialVisible));if(cfg.unifiedNormativeMap)syncNormativeScenarioButton();offshoreWindPostPtsButton.setAttribute('aria-pressed',String(offshoreWindPostPtsVisible));storageButton.setAttribute('aria-pressed',String(storageVisible));nonElectricButton.setAttribute('aria-pressed',String(nonElectricVisible));renewableFuelButton.setAttribute('aria-pressed',String(renewableFuelVisible));biomassButton.setAttribute('aria-pressed',String(biomassVisible));energyShareBar.classList.toggle('is-non-electric-visible',nonElectricVisible);energyShareBar.classList.toggle('is-renewable-fuel-visible',renewableFuelVisible);energyShareBar.classList.toggle('is-biomass-visible',biomassVisible);
      networkLegend.querySelectorAll('[data-layer="grid"]').forEach(item=>item.hidden=!networkVisible);networkLegend.querySelectorAll('[data-layer="substations-existing"]').forEach(item=>item.hidden=!showExistingSubstations);networkLegend.querySelectorAll('[data-layer="substations-new"]').forEach(item=>item.hidden=!showNewSubstations);networkLegend.querySelectorAll('[data-layer="substations-expansion"]').forEach(item=>item.hidden=!showExpandedSubstations);networkLegend.querySelectorAll('[data-layer="imports"]').forEach(item=>item.hidden=!importsVisible);networkLegend.querySelectorAll('[data-layer="generation-projects"]').forEach(item=>item.hidden=!generationProjectsVisible);networkLegend.querySelectorAll('[data-layer="pipeline-projects"]').forEach(item=>item.hidden=!pipelineProjectsVisible);networkLegend.querySelectorAll('[data-layer="pts-potentials"]').forEach(item=>item.hidden=!ptsPotentialVisible);networkLegend.querySelectorAll('[data-layer="offshore-demo"]').forEach(item=>item.hidden=!offshoreWindPostPtsVisible);networkLegend.querySelectorAll('[data-layer="offshore-geroa"]').forEach(item=>item.hidden=!offshoreWindPostPtsVisible);networkLegend.querySelectorAll('[data-layer="storage"]').forEach(item=>item.hidden=!storageVisible);networkLegend.querySelectorAll('[data-layer="non-electric"]').forEach(item=>item.hidden=!nonElectricVisible);networkLegend.querySelectorAll('[data-layer="renewable-fuels"]').forEach(item=>item.hidden=!renewableFuelVisible);networkLegend.querySelectorAll('[data-layer="thermal-biomass"]').forEach(item=>item.hidden=!biomassVisible);
      const newActionCount=projectPointRecords.filter(record=>isNewSubstationProject(record.project)).length,expansionActionCount=projectPointRecords.filter(record=>isSubstationProject(record.project)&&!isNewSubstationProject(record.project)).length,visibleActionCount=(showNewSubstations?newActionCount:0)+(showExpandedSubstations?expansionActionCount:0),futureNewSegment=substationCapacityPanel.querySelector('.substation-capacity-future-new'),futureExpansionSegment=substationCapacityPanel.querySelector('.substation-capacity-future-expansion'),actionTotal=substationCapacityPanel.querySelector('[data-substation-actions-total]'),actionDetail=substationCapacityPanel.querySelector('[data-substation-actions-detail]');
      futureNewSegment.hidden=!showNewSubstations;futureExpansionSegment.hidden=!showExpandedSubstations;actionTotal.textContent=`${formatNumber(visibleActionCount,0)} actuaciones activadas`;actionDetail.textContent=[showNewSubstations?`${formatNumber(newActionCount,0)} nueva`:null,showExpandedSubstations?`${formatNumber(expansionActionCount,0)} ampliaciones o adaptaciones`:null].filter(Boolean).join(' · ')||'Activa las capas futuras para comparar';
      const selectedProjectNode=projectMarkers.filter('.is-selected').node(),selectedProjectRecord=selectedProjectNode?.__data__,selectedProjectHidden=selectedProjectRecord&&(isSubstationProject(selectedProjectRecord.project)?(isNewSubstationProject(selectedProjectRecord.project)?!showNewSubstations:!showExpandedSubstations):!networkVisible);
      if((!networkVisible&&(biscayPaths.filter('.is-selected').node()||projectPaths.filter('.is-selected').node()))||selectedProjectHidden){biscayPaths.classed('is-selected',false);clearProjectSelection();defaultDetail()}
      if(!networkVisible&&!importsVisible&&(networkNodes.filter('.is-selected').node()||importGateways.filter('.is-selected').node())){clearNetworkSelection();defaultDetail()}
      if(!generationProjectsVisible&&generationProjectMarkers.filter('.is-selected').node()){clearGenerationProjectSelection();defaultDetail()}
      if(!pipelineProjectsVisible&&pipelineProjectMarkers.filter('.is-selected').node()){clearPipelineProjectSelection();defaultDetail()}
      if(!ptsPotentialVisible&&ptsPotentialMarkers.filter('.is-selected').node()){clearPtsPotentialSelection();defaultDetail()}
      if((!ptsPotentialVisible||!active.has('wind'))&&windRepoweringMarkers.filter('.is-selected').node()){clearWindRepoweringSelection();defaultDetail()}
      const selectedOffshoreNode=offshoreWindPostPtsMarkers.filter('.is-selected').node(),selectedOffshoreSite=selectedOffshoreNode?.__data__;if(selectedOffshoreSite&&!offshoreSiteIsVisible(selectedOffshoreSite)){clearOffshoreWindPostPtsSelection();defaultDetail()}
      if(!storageVisible&&storageMarkerGroups.filter('.is-selected').node()){clearStorageSelection();defaultDetail()}
      if(!nonElectricVisible&&(nonElectricRoutes.filter('.is-selected').node()||nonElectricFacilityMarkers.filter(facility=>!['renewableGas','thermalBiomass'].includes(facility.category)).filter('.is-selected').node()||importOriginVessel.classed('is-selected'))){clearNonElectricSelection();defaultDetail()}
      if(!renewableFuelVisible&&(nonElectricFacilityMarkers.filter(facility=>facility.category==='renewableGas').filter('.is-selected').node()||renewableImportOriginVessel.classed('is-selected'))){clearNonElectricSelection();defaultDetail()}
      if(!biomassVisible&&nonElectricFacilityMarkers.filter(facility=>facility.category==='thermalBiomass').filter('.is-selected').node()){clearNonElectricSelection();defaultDetail()}
      updateEnergyShare();
    }

    function updatePopulationVisibility(){
      const pointThreshold=currentZoomScale>=3.5?0:currentZoomScale>=1.8?1000:5000;
      const labelThreshold=currentZoomScale>=3.5?1000:currentZoomScale>=1.8?10000:30000;
      populationLayer.style('display',populationsVisible?null:'none');populationButton.setAttribute('aria-pressed',String(populationsVisible));
      populationGroups.style('display',record=>record.population>=pointThreshold?null:'none');populationLabels.style('display',record=>record.population>=labelThreshold?null:'none');
      if(!populationsVisible&&populationGroups.filter('.is-selected').node()){populationGroups.classed('is-selected',false);defaultDetail()}
    }

    function updateVisibility(){
      const visible=records.filter(d=>recordInScope(d)&&((d.isEveSolar&&usesEveSolarLayer)?eveSolarVisible:active.has(d.layerKey))&&(d.key!=='cogen'||activeCogenFuelClasses.has(d.cogenFuelClass))&&((d.isEveSolar&&usesEveSolarLayer)||(d.layerKey==='solar'&&!d.isEveSolar)||d.informationalPrototype||includeSmall||d.mw>=threshold)),visibleSet=new Set(visible);
      markers.style('display',d=>visibleSet.has(d)?null:'none');
      operatingWindTurbines.style('display',d=>visibleSet.has(d)?null:'none');
      windRepoweringLayer.style('display',ptsPotentialVisible&&active.has('wind')?null:'none');
      const visibleGenerationProjects=generationProjectRecords.filter(project=>isPotentialTechnologyActive(project.key)),visibleGenerationProjectSet=new Set(visibleGenerationProjects);generationProjectMarkers.style('display',project=>visibleGenerationProjectSet.has(project)?null:'none');
      generationProjectWindTurbines.style('display',project=>visibleGenerationProjectSet.has(project)?null:'none');
      const visiblePipelineProjects=pipelineProjectRecords.filter(project=>isPotentialTechnologyActive(project.key)),visiblePipelineProjectSet=new Set(visiblePipelineProjects);pipelineProjectMarkers.style('display',project=>visiblePipelineProjectSet.has(project)?null:'none');
      const visiblePtsPotentials=ptsPotentialRecords.filter(site=>isPotentialTechnologyActive(site.key)),visiblePtsPotentialSet=new Set(visiblePtsPotentials);ptsPotentialMarkers.style('display',site=>visiblePtsPotentialSet.has(site)?null:'none');
      ptsPotentialWindTurbines.style('display',site=>visiblePtsPotentialSet.has(site)?null:'none');
      scheduleCircularMarkerClusterLayout();
      const units=visible.reduce((a,d)=>a+d.units,0),mw=visible.reduce((a,d)=>a+d.mw,0);
      count.textContent=storageFocus?`${formatNumber(storageRecords.length,0)} instalaciones de almacenamiento · ${formatNumber(storageRecords.reduce((sum,facility)=>sum+(facility.powerMW||0),0),1)} MW · ${formatNumber(storageRecords.reduce((sum,facility)=>sum+(facility.energyMWh||0),0),1)} MWh publicados`:`${formatNumber(visible.length,0)} emplazamientos · ${formatNumber(units,0)} instalaciones · ${formatNumber(mw,1)} MW en servicio visibles${generationProjectsVisible?` · ${formatNumber(visibleGenerationProjects.length,0)} proyectos autorizados (${formatNumber(visibleGenerationProjects.reduce((sum,project)=>sum+project.mw,0),1)} MW)`:''}${pipelineProjectsVisible?` · ${formatNumber(visiblePipelineProjects.length,0)} en tramitación (${formatNumber(visiblePipelineProjects.reduce((sum,project)=>sum+project.mw,0),2)} MW solicitados; suma exploratoria)`:''}${ptsPotentialVisible?` · ${formatNumber(visiblePtsPotentials.length,0)} ZLS PTS (${formatNumber(visiblePtsPotentials.reduce((sum,site)=>sum+site.mw,0),1)} MW orientativos)${active.has('wind')?` · ${formatNumber(WIND_REPOWERING_POTENTIAL.length,0)} parques repotenciables (+${formatNumber(windRepoweringAdditionalMW,1)} MW)`:''}`:''}${substationsVisible?` · ${formatNumber(substationRecords.length,0)} subestaciones existentes · ${formatNumber(projectPointRecords.filter(record=>isSubstationProject(record.project)).length,0)} actuaciones localizadas`:''}${storageVisible?` · ${formatNumber(storageRecords.length,0)} almacenamientos (${formatNumber(storageRecords.reduce((sum,facility)=>sum+(facility.powerMW||0),0),1)} MW; ${formatNumber(storageRecords.reduce((sum,facility)=>sum+(facility.energyMWh||0),0),1)} MWh publicados)`:''}${nonElectricVisible?` · ${formatNumber(fossilFacilityRecords.length,0)} instalaciones y ${formatNumber(nonElectricRouteRecords.length,0)} conducciones de gas y petróleo`:''}${renewableFuelVisible?` · ${formatNumber(renewableFuelFacilityRecords.length,0)} instalaciones de combustibles renovables`:''}${biomassVisible?` · ${formatNumber(biomassFacilityRecords.length,0)} referencias de biomasa térmica (inventario no exhaustivo)`:''}`;
      if(focusedTechnologyKey==='other'){
        const serviceRecords=visible.filter(record=>!record.informationalPrototype),prototypeCount=visible.length-serviceRecords.length,serviceMW=serviceRecords.reduce((sum,record)=>sum+record.mw,0);
        count.textContent=`${formatNumber(serviceRecords.length,0)} instalación permanente · ${formatNumber(serviceMW,3)} MW en servicio${prototypeCount?` · ${formatNumber(prototypeCount,0)} prototipo experimental con potencia no publicada`:''}${ptsPotentialVisible?` · ${formatNumber(visiblePtsPotentials.length,0)} zonas portuarias potenciales`:''}`;
      }
      if(substationFocus){
        const newCount=projectPointRecords.filter(record=>isNewSubstationProject(record.project)).length,expansionCount=projectPointRecords.filter(record=>isSubstationProject(record.project)&&!isNewSubstationProject(record.project)).length,parts=[];
        if(substationExistingVisible)parts.push(`${formatNumber(substationRecords.length,0)} huellas de subestación existentes`);
        if(substationNewVisible)parts.push(`${formatNumber(newCount,0)} nueva en construcción`);
        if(substationExpansionVisible)parts.push(`${formatNumber(expansionCount,0)} ampliaciones o adaptaciones`);
        count.textContent=parts.join(' · ')||'Todas las capas de subestaciones están ocultas';
      }
      if(offshoreWindFocus)count.textContent=offshoreWindPostPtsVisible?'2 puntos BiMEP · DemoSATH 2 MW · GEROA hasta 50 MW · 20 MW de conexión experimental · 0 MW comerciales adjudicados':'La capa de eólica marina está oculta';
      const selectedNode=markers.filter('.is-selected').node(),selected=selectedNode?selectedNode.__data__:null;
      if(selected&&!visibleSet.has(selected)){markers.classed('is-selected',false);defaultDetail()}
      const selectedProjectNode=generationProjectMarkers.filter('.is-selected').node(),selectedProject=selectedProjectNode?selectedProjectNode.__data__:null;if(selectedProject&&!visibleGenerationProjectSet.has(selectedProject)){clearGenerationProjectSelection();defaultDetail()}
      const selectedPtsNode=ptsPotentialMarkers.filter('.is-selected').node(),selectedPts=selectedPtsNode?selectedPtsNode.__data__:null;if(selectedPts&&!visiblePtsPotentialSet.has(selectedPts)){clearPtsPotentialSelection();defaultDetail()}
      updateEnergyShare();
    }

    function updateEnergyShare(){
      const potentialKeys=['wind','solar','other'],rawFutureEnergy=Object.values(futureBarTechnologyEnergy).reduce((sum,value)=>sum+value,0),futureScale=rawFutureEnergy?Math.min(1,importedElectricEnergyBase/rawFutureEnergy):0,projectEnergyByTechnology=Object.fromEntries(potentialKeys.map(key=>[key,!generationExpansionIncludedInBase&&generationProjectsVisible&&isPotentialTechnologyActive(key)?(futureBarTechnologyEnergy[key]||0)*futureScale:0])),futureEnergy=Object.values(projectEnergyByTechnology).reduce((sum,value)=>sum+value,0),importedAfterProjects=Math.max(0,importedElectricEnergyBase-futureEnergy),rawPipelineEnergyByTechnology=Object.fromEntries(potentialKeys.map(key=>[key,pipelineProjectsVisible&&isPotentialTechnologyActive(key)?pipelineBarTechnologyEnergy[key]||0:0])),rawPipelineEnergy=Object.values(rawPipelineEnergyByTechnology).reduce((sum,value)=>sum+value,0),pipelineScale=rawPipelineEnergy?Math.min(1,importedAfterProjects/rawPipelineEnergy):0,pipelineEnergyByTechnology=Object.fromEntries(potentialKeys.map(key=>[key,rawPipelineEnergyByTechnology[key]*pipelineScale])),pipelineEnergy=Object.values(pipelineEnergyByTechnology).reduce((sum,value)=>sum+value,0),importedAfterPipeline=Math.max(0,importedAfterProjects-pipelineEnergy),offshoreWindEnergy=offshoreWindPostPtsVisible?Math.min(offshoreWindPotentialBarEnergy,importedAfterPipeline):0,importedAfterOffshore=Math.max(0,importedAfterPipeline-offshoreWindEnergy),cycleEnergyBase=barTechnologyEnergy.cycle||0;
      const rawPtsResidualByTechnology=Object.fromEntries(potentialKeys.map(key=>[key,ptsPotentialVisible&&isPotentialTechnologyActive(key)?Math.max(0,(ptsPotentialBarTechnologyEnergy[key]||0)-(generationProjectsVisible?(projectEnergyByTechnology[key]||0):0)-(pipelineProjectsVisible?(pipelineEnergyByTechnology[key]||0):0)):0])),rawPtsResidualEnergy=Object.values(rawPtsResidualByTechnology).reduce((sum,value)=>sum+value,0),ptsAvailableEnergy=cycleEnergyBase+importedAfterOffshore,ptsScale=rawPtsResidualEnergy?Math.min(1,ptsAvailableEnergy/rawPtsResidualEnergy):0,ptsEnergyByTechnology=Object.fromEntries(potentialKeys.map(key=>[key,rawPtsResidualByTechnology[key]*ptsScale])),ptsEnergy=Object.values(ptsEnergyByTechnology).reduce((sum,value)=>sum+value,0),cycleDisplacement=Math.min(cycleEnergyBase,ptsEnergy),ptsImportDisplacement=Math.max(0,ptsEnergy-cycleDisplacement),displayedElectricEnergy=electricEnergy;
      importedElectricEnergy=Math.max(0,importedAfterOffshore-ptsImportDisplacement);if(cfg.unifiedNormativeMap)syncModelledGatewayFlows(importedElectricEnergy);displayedElectricShare=electricShare;displayedNonElectricShare=nonElectricShare;displayedOwnRenewableElectricityEnergy=ownRenewableElectricityEnergyBase+futureEnergy+pipelineEnergy+offshoreWindEnergy+ptsEnergy;displayedOwnRenewableElectricityShare=displayedElectricEnergy?100*displayedOwnRenewableElectricityEnergy/displayedElectricEnergy:0;let selectedEnergy=0;
      barTechnologyKeys.forEach(key=>{
        const segment=energyShare.querySelector(`[data-technology="${key}"]`),isActive=isBarTechnologyActive(key),energy=barTechnologyEnergy[key],displayEnergy=key==='cycle'?Math.max(0,energy-cycleDisplacement):energy;
        if(!segment)return;
        segment.classList.toggle('is-inactive',!isActive);segment.style.flex=String(displayEnergy);
        const smallNote=key==='solar'&&usesEveSolarLayer?` · vinculada exclusivamente a Solar a red declarada por EVE: ${formatNumber(eveSolarMW,1)} MW en ${formatNumber(eveSolarRecords.length,0)} instalaciones`:key==='solar'?` · ${formatNumber(smallCapacityByTechnology.solar,2)} MW corresponden a puntos menores de 0,1 MW del inventario cartografiado`:'';
        segment.title=`${barTechnologyLabels[key]}${isActive?'':' (capa oculta)'}: ${formatNumber(displayEnergy,key==='other'?3:0)} GWh · ${formatNumber(electricEnergy?100*displayEnergy/electricEnergy:0,key==='other'?3:1)} % de la electricidad${key==='cycle'?` · ${formatNumber(Math.min(displayEnergy,cogenEstimatedRenewableWithinFossil*deliveryFactor),0)} GWh renovables estimados de instalaciones mixtas`:''}${key==='cycle'&&cycleDisplacement?` · ${formatNumber(cycleDisplacement,0)} GWh sustituidos por las nuevas zonas potenciales visibles`:''}${smallNote}`;
        if(isActive)selectedEnergy+=displayEnergy;
      });
      ['wind','solar'].forEach(key=>{
        const segment=energyShare.querySelector(`[data-future-technology="${key}"]`),energy=projectEnergyByTechnology[key]||0;
        if(!segment)return;
        const isVisible=!generationExpansionIncludedInBase&&generationProjectsVisible&&isPotentialTechnologyActive(key);segment.hidden=!isVisible;
        segment.style.flex=String(energy);
        const summary=segment.querySelector(`[data-future-summary="${key}"]`);if(summary)summary.textContent=`${formatNumber(energy,0)} GWh potenciales · ${formatNumber(futureCapacityByTechnology[key],1)} MW`;
        segment.title=`${barTechnologyLabels[key]} en construcción o aprobada: ${formatNumber(futureCapacityByTechnology[key],1)} MW · ${formatNumber(energy,0)} GWh/año finales estimados con producción publicada o recurso local · ${formatNumber(futureProjectCountByTechnology[key],0)} proyectos`;
        if(isVisible)selectedEnergy+=energy;
      });
      ['wind','solar'].forEach(key=>{
        const segment=energyShare.querySelector(`[data-pipeline-technology="${key}"]`),energy=pipelineEnergyByTechnology[key]||0;
        if(!segment)return;
        const isVisible=pipelineProjectsVisible&&isPotentialTechnologyActive(key);segment.hidden=!isVisible;
        segment.style.flex=String(energy);
        const summary=segment.querySelector(`[data-pipeline-summary="${key}"]`);if(summary)summary.textContent=`${formatNumber(energy,0)} GWh en la barra · ${formatNumber(pipelineCapacityByTechnology[key],2)} MW solicitados`;
        segment.title=`${barTechnologyLabels[key]} en tramitación: ${formatNumber(pipelineCapacityByTechnology[key],2)} MW solicitados · ${formatNumber(pipelineGenerationByTechnology[key],1)} GWh/año brutos estimados · ${formatNumber(energy,0)} GWh en el perímetro de consumo final · ${formatNumber(pipelineProjectCountByTechnology[key],0)} expedientes. Exploración condicionada: todavía no son instalaciones autorizadas.`;
        if(isVisible)selectedEnergy+=energy;
      });
      const offshoreSegment=energyShare.querySelector('[data-offshore-wind-potential]');
      if(offshoreSegment){
        offshoreSegment.hidden=!offshoreWindPostPtsVisible;offshoreSegment.style.flex=String(offshoreWindEnergy);
        const summary=offshoreSegment.querySelector('[data-offshore-wind-summary]');if(summary)summary.textContent=`${formatNumber(offshoreWindEnergy,0)} GWh en la barra · 2 MW DemoSATH + hasta 50 MW GEROA`;
        offshoreSegment.title=`Eólica marina · BiMEP: 52 MW máximos representados —2 MW de DemoSATH y hasta 50 MW de GEROA— · ${formatNumber(offshoreWindPotentialGenerationGWh,1)} GWh/año brutos orientativos con 2.650 horas equivalentes · ${formatNumber(offshoreWindEnergy,0)} GWh en el perímetro de consumo final. Los 20 MW de conexión experimental de BiMEP no se cuentan como generación. GEROA sigue sujeto a permisos y no altera por sí solo las proyecciones publicadas.`;
        if(offshoreWindPostPtsVisible)selectedEnergy+=offshoreWindEnergy;
      }
      ['wind','solar','other'].forEach(key=>{
        const segment=energyShare.querySelector(`[data-pts-potential-technology="${key}"]`),energy=ptsEnergyByTechnology[key]||0,rawResidual=rawPtsResidualByTechnology[key]||0;
        if(!segment)return;
        const isVisible=ptsPotentialVisible&&isPotentialTechnologyActive(key)&&rawResidual>0;segment.hidden=!isVisible;segment.style.flex=String(energy);
        const deductedProjectEnergy=generationProjectsVisible&&(projectEnergyByTechnology[key]||0)>0,residualCapacity=Math.max(0,(ptsPotentialCapacityByTechnology[key]||0)-(deductedProjectEnergy?(futureCapacityByTechnology[key]||0):0)),summary=segment.querySelector(`[data-pts-potential-summary="${key}"]`);if(summary)summary.textContent=`${formatNumber(energy,key==='other'?2:0)} GWh en la barra · ${formatNumber(residualCapacity,0)} MW orientativos${deductedProjectEnergy?' restantes tras descontar proyectos':''}`;
        const officialShare=ptsPotentialFinalShareIncreaseByTechnology[key],basis=Number.isFinite(officialShare)&&officialShare>0?`incremento agregado oficial de +${formatNumber(officialShare,1)} puntos del consumo final`:'producción anual orientativa agregada de las ZLS',repoweringNote=key==='wind'?` Además incorpora ${formatNumber(windRepoweringAdditionalMW,3)} MW adicionales de repotenciación (${formatNumber(windRepoweringAdditionalGWh,1)} GWh/año con 2.650 horas equivalentes), sin volver a contar la potencia existente.`:'';
        const marineNote=key==='other'?' Referencia 3E2030 de 60 MW y producción prevista oficial del PTS de 123,03 GWh en 2030; el reparto entre las 12 ZLS es solo una visualización y no un cupo oficial por puerto. Los prototipos marinos sin producción anual publicada no se suman ni se descuentan de esta barra.':'';
        segment.title=`Nuevas zonas potenciales de ${barTechnologyLabels[key].toLowerCase()} (PTS y más): ${formatNumber(ptsPotentialCapacityByTechnology[key],0)} MW agregados · base de la barra: ${basis}. El PTS no asigna potencia oficial a cada zona.${repoweringNote}${marineNote} El conjunto del potencial sustituye primero generación fósil y después electricidad importada.${deductedProjectEnergy?' Para evitar doble conteo se descuenta la energía de los proyectos autorizados o en obra.':''}${ptsScale<1?' La representación se limita a la generación fósil y la importación desplazables en la base 2024.':''}`;
        if(isVisible)selectedEnergy+=energy;
      });
      const importedSegment=energyShare.querySelector('.map-energy-share-imported'),bar=energyShare.querySelector('.map-energy-share-bar'),basisLabel=energyShare.querySelector('[data-energy-share-basis]');
      if(restShareBlock)restShareBlock.style.flex=String(displayedNonElectricShare);if(electricShareBlock)electricShareBlock.style.flex=String(displayedElectricShare);if(restShareStrong)restShareStrong.textContent=`${formatNumber(displayedNonElectricShare,1)} %`;updateExpansionControls();energyShare.setAttribute('aria-label',`Consumo final energético de Euskadi: ${formatNumber(displayedElectricShare,1)} % electricidad y ${formatNumber(displayedNonElectricShare,1)} % energía no eléctrica, principalmente petróleo y gas natural`);
      if(importedSegment){importedSegment.style.flex=String(importedElectricEnergy);importedSegment.classList.toggle('is-inactive',!importsVisible);importedSegment.title=`Electricidad importada${importsVisible?'':' (capa de entradas oculta)'}: ${formatNumber(importedElectricEnergy,0)} GWh · ${formatNumber(displayedElectricEnergy?100*importedElectricEnergy/displayedElectricEnergy:0,1)} % de la electricidad · atribución ${scenarioYear}: ${formatNumber(importRenewableShare,1)} % renovable y ${formatNumber(importNonRenewableShare,1)} % no renovable${generationProjectsVisible&&!generationExpansionIncludedInBase?' · reducida por el potencial anual estimado de los proyectos solares y eólicos autorizados o en construcción':''}${pipelineProjectsVisible?` · reducida de forma exploratoria por ${formatNumber(pipelineEnergy,0)} GWh de expedientes en tramitación`:''}${offshoreWindPostPtsVisible?' · reducida de forma exploratoria por DemoSATH y la propuesta GEROA visible':''}${ptsPotentialVisible?' · reducida además por el potencial territorial PTS visible, sin doble contabilizar los proyectos':''}`}
      if(basisLabel){
        const exploratoryLayers=[generationProjectsVisible?'construcción':null,pipelineProjectsVisible?'tramitación':null,ptsPotentialVisible?'zonas potenciales':null,offshoreWindPostPtsVisible?'BiMEP':null].filter(Boolean);
        basisLabel.textContent=cfg.unifiedNormativeMap?`Escenario normativo · ${ownGenerationScenarioActive()?'más generación renovable propia':'más energía renovable importada'} · 2050`:isNormativeScenario?`Escenario normativo · 2050${allowExploratoryGenerationLayers&&exploratoryLayers.length?` + ${exploratoryLayers.join(' + ')} · exploración`:''}`:generationProjectsVisible&&ptsPotentialVisible?`Base ${scenarioYear} + proyectos + zonas potenciales${offshoreWindPostPtsVisible?' + BiMEP':''}`:generationProjectsVisible?`Base ${scenarioYear} + proyectos${offshoreWindPostPtsVisible?' + BiMEP':''}`:ptsPotentialVisible?`Base ${scenarioYear} + zonas potenciales${offshoreWindPostPtsVisible?' + BiMEP':''}`:offshoreWindPostPtsVisible?`Base ${scenarioYear} + BiMEP`:String(scenarioYear);
        if(pipelineProjectsVisible&&!isNormativeScenario)basisLabel.textContent+=' + tramitación';
      }
      if(bar){bar.classList.toggle('is-small-hidden',!includeSmall);bar.setAttribute('aria-label',`Electricidad: ${formatNumber(displayedElectricShare,1)} % del consumo final. Energía no eléctrica: ${formatNumber(displayedNonElectricShare,1)} %. ${nonElectricVisible?'La franja gris identifica la infraestructura de gas y petróleo.':'La capa de gas y petróleo está oculta.'} ${renewableFuelVisible?`La franja marrón identifica ${formatNumber(renewableFuelEnergy,1)} GWh de combustibles renovables, equivalentes al ${formatNumber(renewableFuelShare,2)} % del consumo final.`:'La capa de combustibles renovables está oculta.'} ${biomassVisible?`La franja marrón claro identifica ${formatNumber(biomassEnergy,1)} GWh de biomasa no eléctrica, equivalentes al ${formatNumber(biomassShare,2)} % del consumo final.`:'La capa de biomasa no eléctrica está oculta.'} Las capas de generación visibles representan ${formatNumber(selectedEnergy,0)} GWh; la capa de entradas de electricidad importada ${importsVisible?'muestra':'oculta'} ${formatNumber(importedElectricEnergy,0)} GWh importados, atribuidos en ${scenarioYear} en un ${formatNumber(importRenewableShare,1)} % a renovables y un ${formatNumber(importNonRenewableShare,1)} % a fuentes no renovables.${generationProjectsVisible?` Los proyectos solares y eólicos visibles añaden ${formatNumber(futureEnergy,0)} GWh potenciales y reducen importación.`:''}${offshoreWindPostPtsVisible?` La capa BiMEP añade visualmente ${formatNumber(offshoreWindEnergy,0)} GWh orientativos correspondientes a 2 MW de DemoSATH y hasta 50 MW de GEROA; es una exploración y no una previsión autorizada.`:''}${ptsPotentialVisible?` Las ZLS del PTS añaden visualmente ${formatNumber(ptsEnergy,0)} GWh de potencial territorial; sustituyen primero ${formatNumber(cycleDisplacement,0)} GWh de ciclo combinado y después ${formatNumber(ptsImportDisplacement,0)} GWh de importación. Los proyectos ya representados se descuentan para evitar doble conteo.${isNormativeScenario&&!allowExploratoryGenerationLayers?' Este cierre forma parte del mapa normativo de 2050.':' Esta exploración no modifica las proyecciones del modelo.'}`:''}`)}
    }
    let timelineTimer=0,timelineYear=Number(timelineStart?.year)||2024,timelinePlaying=false;
    const lerp=(from,to,t)=>Number(from||0)+(Number(to||0)-Number(from||0))*t;
    const timelineStage=year=>year<2027?'Infraestructura actual: las ampliaciones futuras todavía no están activadas.':year<2031?'Entran en servicio proyectos aprobados y nuevas conexiones eléctricas.':year<2041?'Se despliegan las zonas PTS, la repotenciación y la sustitución de generación fósil.':'La red eléctrica y la producción renovable propia crecen mientras retroceden gas, petróleo y generación fósil.';
    const ptsTimelineYearById=new Map;['wind','solar','other'].forEach(key=>{const sites=ptsPotentialRecords.filter(site=>site.key===key).sort((a,b)=>(b.mw||0)-(a.mw||0)),start=key==='other'?2029:2030,end=2050;sites.forEach((site,index)=>ptsTimelineYearById.set(site.id,Math.round(start+(end-start)*(sites.length<=1?0:index/(sites.length-1)))))});
    const staggerRetirements=(items,start,end,weight=value=>Number(value.mw)||0)=>{const ordered=[...items].sort((a,b)=>weight(a)-weight(b)),schedule=new Map;ordered.forEach((item,index)=>schedule.set(item,Math.round(start+(end-start)*(ordered.length<=1?0:index/(ordered.length-1)))));return schedule},fossilOperatingRecords=records.filter(record=>record.key==='cycle'||(record.key==='cogen'&&record.cogenFuelClass!=='renewable')),fossilRetirementYear=staggerRetirements(fossilOperatingRecords,2033,2050),fossilRouteRetirementYear=staggerRetirements(nonElectricRouteRecords,2036,2050,record=>Number(record.route?.capacity)||0),fossilFacilityRetirementYear=staggerRetirements(fossilFacilityRecords,2035,2050,facility=>Number(facility.capacity)||0);
    const projectRampAtYear=(project,year)=>{const fallbackIndex=Math.max(0,generationProjectRecords.findIndex(item=>item.id===project.id)),first=Number(project.modelFirstYear)||(2027+fallbackIndex%5),full=Number(project.modelFullYear)||first+1;if(year<first)return 0;if(year>=full)return 1;return .5};
    const projectFractionByTechnology=year=>Object.fromEntries(['wind','solar'].map(key=>{const items=generationProjectRecords.filter(project=>project.key===key),total=items.reduce((sum,project)=>sum+(Number(project.annualGWhEstimate)||project.mw||0),0),visible=items.reduce((sum,project)=>sum+(Number(project.annualGWhEstimate)||project.mw||0)*projectRampAtYear(project,year),0);return[key,generationProjectsVisible&&total?visible/total:0]}));
    const ptsFractionByTechnology=year=>Object.fromEntries(['wind','solar','other'].map(key=>{const items=ptsPotentialRecords.filter(site=>site.key===key),total=items.reduce((sum,site)=>sum+(Number(site.annualGWhEstimate)||site.mw||0),0),visible=items.filter(site=>year>=(ptsTimelineYearById.get(site.id)||2050)).reduce((sum,site)=>sum+(Number(site.annualGWhEstimate)||site.mw||0),0);return[key,ptsPotentialVisible&&total?visible/total:0]}));
    const visibleTimelineProjectIds=new Set,visibleTimelinePtsIds=new Set;
    let timeline=null,timelinePlay=null,timelineRange=null,timelineYearLabel=null,timelineCopy=null;
    const applyTimelineYear=value=>{
      if(!timelineEnabled)return;
      const previousYear=timelineYear,year=Math.max(Number(timelineStart.year)||2024,Math.min(scenarioYear,Math.round(Number(value)||2024))),progress=(year-(Number(timelineStart.year)||2024))/Math.max(1,scenarioYear-(Number(timelineStart.year)||2024)),projectFractions=projectFractionByTechnology(year),ptsFractions=ptsFractionByTechnology(year),networkReady=networkVisible&&year>=2028;
      timelineYear=year;
      const currentFinal=lerp(timelineStart.finalEnergy,finalEnergy,progress),currentElectricShare=lerp(timelineStart.electricShare,electricShare,progress),currentNonElectricShare=100-currentElectricShare;
      displayedElectricShare=currentElectricShare;displayedNonElectricShare=currentNonElectricShare;
      restShareBlock.style.flex=String(currentNonElectricShare);electricShareBlock.style.flex=String(currentElectricShare);restShareStrong.textContent=`${formatNumber(currentNonElectricShare,1)} %`;
      const electricStrong=electricFocusButton.querySelector('strong');if(electricStrong)electricStrong.textContent=`${formatNumber(currentElectricShare,1)} %`;
      const currentBiofuel=lerp(timelineStart.renewableBiofuelEnergy,renewableBiofuelEnergy,progress),currentH2=lerp(timelineStart.greenHydrogenSyntheticEnergy,greenHydrogenSyntheticEnergy,progress),currentBiomass=lerp(timelineStart.biomassEnergy,biomassEnergy,progress),currentHeat=lerp(timelineStart.renewableHeatEnergy,renewableHeatEnergy,progress),currentFuel=currentBiofuel+currentH2,currentDirect=currentFuel+currentBiomass+currentHeat,directBlock=energyShare.querySelector('.map-energy-share-direct-renewables'),biomassBlock=energyShare.querySelector('.map-energy-share-biomass'),heatBlock=energyShare.querySelector('.map-energy-share-renewable-heat'),bioSegment=renewableFuelBlock?.querySelector('.map-energy-share-biofuel'),h2Segment=renewableFuelBlock?.querySelector('.map-energy-share-h2-synthetic');
      if(directBlock)directBlock.style.height=`${currentNonElectricShare?100*(100*currentDirect/currentFinal)/currentNonElectricShare:0}%`;if(biomassBlock){biomassBlock.style.flex=String(currentBiomass);const small=biomassBlock.querySelector('small');if(small)small.textContent=`${formatNumber(currentBiomass,0)} GWh`}if(renewableFuelBlock)renewableFuelBlock.style.flex=String(currentFuel);if(heatBlock){heatBlock.style.flex=String(currentHeat);const small=heatBlock.querySelector('small');if(small)small.textContent=`${formatNumber(currentHeat,0)} GWh`}if(bioSegment)bioSegment.style.flex=String(currentBiofuel);if(h2Segment)h2Segment.style.flex=String(Math.max(.001,currentH2));const fuelNotes=renewableFuelBlock?[...renewableFuelBlock.querySelectorAll('.map-energy-share-renewable-fuel-summary b')]:[];if(fuelNotes[0])fuelNotes[0].textContent=`Biocombustibles y biometano · ${formatNumber(currentBiofuel,0)} GWh`;if(fuelNotes[1])fuelNotes[1].textContent=`Hidrógeno verde y sintéticos · ${formatNumber(currentH2,0)} GWh`;
      const futureSegments=[...energyShare.querySelectorAll('[data-future-technology]')],ptsSegments=[...energyShare.querySelectorAll('[data-pts-potential-technology]')];futureSegments.forEach(segment=>{const key=segment.dataset.futureTechnology,full=parseFloat(segment.dataset.timelineFull||segment.style.flex)||0,shown=full*(projectFractions[key]||0);segment.dataset.timelineFull=String(full);segment.style.flex=String(shown);segment.style.opacity='1';const small=segment.querySelector('small');if(small)small.textContent=`${formatNumber(shown,0)} GWh incorporados`});ptsSegments.forEach(segment=>{const key=segment.dataset.ptsPotentialTechnology,full=parseFloat(segment.dataset.timelineFull||segment.style.flex)||0,shown=full*(ptsFractions[key]||0);segment.dataset.timelineFull=String(full);segment.style.flex=String(shown);segment.style.opacity='1';const small=segment.querySelector('small');if(small)small.textContent=`${formatNumber(shown,key==='other'?2:0)} GWh incorporados`});
      const importedSegment=energyShare.querySelector('.map-energy-share-imported');if(importedSegment){const finalImported=parseFloat(importedSegment.dataset.timelineFinal||importedSegment.style.flex)||importedElectricEnergy;importedSegment.dataset.timelineFinal=String(finalImported);const currentImported=lerp(timelineStart.importedElectricEnergy,finalImported,progress),currentRenewableShare=lerp(timelineStart.importRenewableShare,importRenewableShare,progress),currentArrowPaths=dualImportArrowPaths(currentRenewableShare);importedSegment.style.flex=String(currentImported);importedSegment.style.setProperty('--import-renewable-share',`${currentRenewableShare}%`);importedSegment.style.setProperty('--import-nonrenewable-share',`${100-currentRenewableShare}%`);const small=importedSegment.querySelector('small');if(small)small.innerHTML=`${formatNumber(currentRenewableShare,0)} % ren.<br>${formatNumber(100-currentRenewableShare,0)} % no ren.`;importGatewaySymbols.filter(d=>!d.estimatedFlow).select('.import-gateway-arrow-nonrenewable').attr('d',currentArrowPaths.nonRenewable);importGatewaySymbols.filter(d=>!d.estimatedFlow).select('.import-gateway-arrow-renewable').attr('d',currentArrowPaths.renewable)}
      const fossilRemainingFraction=1-Math.max(0,Math.min(1,(year-2032)/18));['cycle','cogenMixed','cogenUnverified'].forEach(key=>{const segment=energyShare.querySelector(`[data-technology="${key}"]`);if(segment)segment.style.flex=String((barTechnologyEnergy[key]||0)*fossilRemainingFraction)});
      generationProjectLayer.style('opacity',1);ptsPotentialLayer.style('opacity',1);projectLayer.style('opacity',networkReady?1:0);gridLayer.style('opacity',1);nonElectricLayer.style('opacity',1);windRepoweringLayer.style('opacity',1);
      const bounded=value=>Math.max(0,Math.min(1,value)),gatewayCapacityAtYear=d=>d.isFuture?d.capacityTotalMVA*bounded((year-2027)/2):d.name.includes('Itxaso')?d.capacityTotalMVA+1400*bounded((year-2028)/3):d.name.includes('Hernani–Arkale')?lerp(2060,d.capacityTotalMVA,bounded((year-2024)/2)):d.name.includes('Hernani')?lerp(1600,d.capacityTotalMVA,bounded((year-2024)/2)):d.capacityTotalMVA;
      importGateways.each(d=>{d.timelineCapacityMVA=gatewayCapacityAtYear(d)}).style('display',d=>importsVisible&&d.timelineCapacityMVA>1?null:'none');importGateways.select('.import-gateway-symbol').interrupt().transition().duration(300).attr('transform',d=>gatewaySymbolTransform(d,currentZoomScale,d.timelineCapacityMVA));importGatewayLabels.style('display',d=>importsVisible&&d.timelineCapacityMVA>1?null:'none');importGatewayLabels.select('tspan').text(d=>d.isFuture?`Desde Francia · Lemoiz · ${formatNumber(d.timelineCapacityMVA,0)} MW`:`${d.name} · ${formatNumber(d.timelineCapacityMVA,0)} MVA${d.timelineCapacityMVA>d.capacityTotalMVA+1?' · con refuerzo':''}`);
      const projectIsVisible=d=>generationProjectsVisible&&isPotentialTechnologyActive(d.key)&&projectRampAtYear(d,year)>0,ptsIsVisible=d=>ptsPotentialVisible&&isPotentialTechnologyActive(d.key)&&year>=(ptsTimelineYearById.get(d.id)||2050),currentProjectIds=new Set(generationProjectRecords.filter(projectIsVisible).map(d=>d.id)),currentPtsIds=new Set(ptsPotentialRecords.filter(ptsIsVisible).map(d=>d.id)),newProjectIds=new Set([...currentProjectIds].filter(id=>!visibleTimelineProjectIds.has(id))),newPtsIds=new Set([...currentPtsIds].filter(id=>!visibleTimelinePtsIds.has(id)));
      generationProjectMarkers.style('display',d=>projectIsVisible(d)?null:'none').classed('timeline-pop-marker',d=>newProjectIds.has(d.id));generationProjectWindTurbines.style('display',d=>projectIsVisible(d)?null:'none').classed('timeline-pop-marker',d=>newProjectIds.has(d.id));ptsPotentialMarkers.style('display',d=>ptsIsVisible(d)?null:'none').classed('timeline-pop-marker',d=>newPtsIds.has(d.id));ptsPotentialWindTurbines.style('display',d=>ptsIsVisible(d)?null:'none').classed('timeline-pop-marker',d=>newPtsIds.has(d.id));visibleTimelineProjectIds.clear();currentProjectIds.forEach(id=>visibleTimelineProjectIds.add(id));visibleTimelinePtsIds.clear();currentPtsIds.forEach(id=>visibleTimelinePtsIds.add(id));if(newProjectIds.size||newPtsIds.size)setTimeout(()=>{generationProjectMarkers.classed('timeline-pop-marker',false);generationProjectWindTurbines.classed('timeline-pop-marker',false);ptsPotentialMarkers.classed('timeline-pop-marker',false);ptsPotentialWindTurbines.classed('timeline-pop-marker',false)},680);
      const timelineFacilityVisible=facility=>facility.category==='renewableGas'?renewableFuelVisible:facility.category==='thermalBiomass'?biomassVisible:nonElectricVisible&&year<(fossilFacilityRetirementYear.get(facility)||2050);markers.filter(d=>d.key==='cycle'||(d.key==='cogen'&&d.cogenFuelClass!=='renewable')).style('display',d=>{const layerActive=d.key==='cycle'?active.has('cycle')&&fossilGenerationActive:active.has('cogen')&&activeCogenFuelClasses.has(d.cogenFuelClass);return layerActive&&year<(fossilRetirementYear.get(d)||2050)?null:'none'});nonElectricRoutes.style('display',record=>nonElectricVisible&&year<(fossilRouteRetirementYear.get(record)||2050)?null:'none');nonElectricFacilityMarkers.style('display',facility=>timelineFacilityVisible(facility)?null:'none');nonElectricFacilityLeaders.style('display',facility=>timelineFacilityVisible(facility)?null:'none');importOriginVessel.style('display',nonElectricVisible&&year<2050?null:'none');
      const basisLabel=energyShare.querySelector('[data-energy-share-basis]');if(basisLabel)basisLabel.textContent=`Evolución normativa · ${year}`;
      if(timelineRange)timelineRange.value=String(year);if(timelineYearLabel)timelineYearLabel.textContent=String(year);if(timelineCopy)timelineCopy.innerHTML=`<strong>${year}</strong> · ${timelineStage(year)} <span>Los filtros elegidos se mantienen durante toda la reproducción.</span>`;
      refreshEnergyCallouts();
    };
    const stopTimeline=()=>{clearInterval(timelineTimer);timelineTimer=0;timelinePlaying=false;if(timeline){timeline.classList.remove('is-playing')}if(timelinePlay){timelinePlay.textContent='▶ Reproducir 2024–2050';timelinePlay.setAttribute('aria-pressed','false')}};
    if(timelineEnabled){
      networkVisible=true;importsVisible=true;generationProjectsVisible=true;ptsPotentialVisible=true;nonElectricVisible=true;renewableFuelVisible=true;biomassVisible=true;
      timeline=document.createElement('section');timeline.className='map-timeline';timeline.setAttribute('aria-label','Animación temporal de la infraestructura energética hacia 2050');timeline.innerHTML=`<button type="button" class="map-timeline-play" aria-pressed="false">▶ Reproducir 2024–2050</button><output class="map-timeline-year">${timelineYear}</output><input type="range" min="${timelineYear}" max="${scenarioYear}" step="1" value="${timelineYear}" aria-label="Año de la evolución de la infraestructura"><p class="map-timeline-copy"><strong>${timelineYear}</strong> · ${timelineStage(timelineYear)} <span>Activa o desactiva capas: la selección se conserva al reproducir.</span></p>`;toolbar.insertBefore(timeline,filters);timelinePlay=timeline.querySelector('.map-timeline-play');timelineRange=timeline.querySelector('input');timelineYearLabel=timeline.querySelector('output');timelineCopy=timeline.querySelector('.map-timeline-copy');
      timelinePlay.addEventListener('click',()=>{if(timelinePlaying){stopTimeline();return}if(timelineYear>=scenarioYear)applyTimelineYear(timelineStart.year);timelinePlaying=true;timeline.classList.add('is-playing');timelinePlay.textContent='Ⅱ Pausar';timelinePlay.setAttribute('aria-pressed','true');timelineTimer=setInterval(()=>{if(timelineYear>=scenarioYear){stopTimeline();return}applyTimelineYear(timelineYear+1)},360)});
      timelineRange.addEventListener('input',event=>{stopTimeline();applyTimelineYear(event.target.value)});[...filters.querySelectorAll('button')].forEach(button=>button.addEventListener('click',()=>setTimeout(()=>applyTimelineYear(timelineYear),0)));
      updateNetworkVisibility();updatePopulationVisibility();updateVisibility();applyTimelineYear(timelineYear);
    }else{
      updateNetworkVisibility();updatePopulationVisibility();updateVisibility();
    }
  };
})();
