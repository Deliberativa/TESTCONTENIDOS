(()=>{
  const TECHNOLOGIES={
    cycle:{label:'Ciclo combinado',color:'#4f565c'},
    cogen:{label:'Cogeneración, residuos y biomasa',color:'#8f6aa8'},
    cogenRenewable:{label:'Bioenergía renovable',color:'#8f6aa8'},
    cogenMixed:{label:'Valorización o cogeneración mixta',color:'#b07aa1'},
    cogenUnverified:{label:'Cogeneración sin combustible verificado',color:'#c8c9cc'},
    hydro:{label:'Hidráulica',color:'#247ba0'},
    wind:{label:'Eólica',color:'#79cce5'},
    solar:{label:'Fotovoltaica',color:'#f0c419'},
    other:{label:'Energía marina (undimotriz)',color:'#d55e00'}
  };
  const TECHNOLOGY_ORDER=['cycle','cogen','hydro','wind','solar','other'];
  const COGEN_FUEL_CLASSES={
    fossil:{label:'Generación fósil',color:'#4f565c',shortLabel:'Fósil'},
    renewable:{label:'Bioenergía renovable',color:'#8f6aa8',shortLabel:'Renovable'},
    mixed:{label:'Valorización o cogeneración mixta',color:'#b07aa1',shortLabel:'Mixta'},
    unverified:{label:'Combustible no verificado',color:'#c8c9cc',shortLabel:'Sin verificar'}
  };
  const COGEN_FUEL_CLASS_ORDER=['fossil','renewable','mixed','unverified'];
  const REE_TRANSPORT_CAPACITY_2024='https://www.ree.es/sites/default/files/datos/transporte/Informe_Auditoria_Calidad_de_Servicio_RdT_SEE_2024.pdf';
  const INTERCONNECTION_NODES=[
    {name:'Hernani',coordinate:[-1.97482,43.25546],voltage:'400 kV',territory:'Francia',links:['Hernani – Cantegrit'],capacityTotalMVA:1628,capacityCircuits:[['Hernani – Argia',1628]],capacityNote:'La capacidad comercial se calcula para el conjunto de la frontera España–Francia, no para Hernani de forma aislada.'},
    {name:'Arkale',coordinate:[-1.89152,43.28514],voltage:'220 kV',territory:'Francia',links:['Arkale – Mouguerre'],capacityTotalMVA:460,capacityCircuits:[['Arkale – Argia',460]],capacityNote:'La línea figura con 460 MVA de capacidad térmica invernal; el desfasador de Arkale se publica aparte con 550 MVA. La capacidad comercial pertenece al conjunto de la frontera.'},
    {name:'Itxaso',coordinate:[-2.27554,43.06092],voltage:'220 y 400 kV',territory:'Navarra y Castilla y León',links:['Itxaso – Orcoyen 1 y 2','Barcina – Itxaso'],capacityTotalMVA:1960,capacityCircuits:[['Barcina – Itxaso',1280],['Itxaso – Orcoyen 1',300],['Itxaso – Orcoyen 2',380]]},
    {name:'Vitoria-Gasteiz',coordinate:[-2.60792,42.89822],voltage:'400 kV',territory:'Castilla y León',links:['Grijota – Vitoria'],capacityTotalMVA:1280,capacityCircuits:[['Grijota – Vitoria',1280]]},
    {name:'Puentelarra',coordinate:[-3.04916,42.75583],voltage:'220 kV',territory:'Castilla y León',links:['Garoña – Puentelarra','Puentelarra – Miranda'],capacityTotalMVA:1750,capacityCircuits:[['Garoña – Puentelarra 1',650],['Garoña – Puentelarra 2',650],['Miranda – Puentelarra',450]]},
    {name:'Güeñes',coordinate:[-3.03068,43.21779],voltage:'220 y 400 kV',territory:'Cantabria y Castilla y León',links:['Penagos – Güeñes – Petronor','Barcina – Güeñes','Güeñes – Herrera','Villalbilla – Güeñes 1 y 2'],capacityTotalMVA:2930,capacityCircuits:[['Barcina – Güeñes',1310],['Güeñes – Virtus',1260],['T. de Ayala – Villalbilla',360]],capacityNote:'El informe de Red Eléctrica utiliza la topología y las denominaciones operativas de 2024; no todas coinciden literalmente con los nombres históricos de la cartografía.'}
  ];
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
    'P.E. OIZ':{src:'assets/photos/installations/oiz-parque-eolico.jpg',alt:'Vista parcial del parque eólico de Oiz',description:'Vista parcial del parque eólico de Oiz',author:'Txo',license:'Dominio público',licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',pageUrl:'https://commons.wikimedia.org/wiki/File:Oiz_parque_e%C3%B3lico,_vista_parcial.JPG'},
    'P.E. ELGEA-URKILLA':{src:'assets/photos/installations/elgea-parque-eolico.jpg',alt:'Vista general del parque eólico de Elgea',description:'Vista general del parque de Elgea; no identifica un aerogenerador concreto',author:'Basotxerri',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',pageUrl:'https://commons.wikimedia.org/wiki/File:Elgea_-_Monte_Usakoatxa_01.jpg'},
    'PARQUE EOLICO SIERRA ELGEA':{src:'assets/photos/installations/elgea-parque-eolico.jpg',alt:'Vista general del parque eólico de Elgea',description:'Vista general del parque de Elgea; no identifica un aerogenerador concreto',author:'Basotxerri',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',pageUrl:'https://commons.wikimedia.org/wiki/File:Elgea_-_Monte_Usakoatxa_01.jpg'},
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
    const orthophoto=orthophotoUrl(record.coordinate),photo=INSTALLATION_PHOTOS[normalizeInstallationName(record.properties.descripcion)];
    if(!photo)return{src:orthophoto,orthophoto,isOrthophoto:true,alt:`Vista aérea del emplazamiento de ${record.properties.descripcion||'la instalación'}`,caption:orthophotoCaption()};
    const caption=photo.licenseUrl?`${escapeHtml(photo.description)} · ${escapeHtml(photo.author)} · <a href="${photo.licenseUrl}" target="_blank" rel="noopener">${escapeHtml(photo.license)}</a> · <a href="${photo.pageUrl}" target="_blank" rel="noopener">Wikimedia Commons</a>`:`${escapeHtml(photo.description)} · <a href="${photo.pageUrl}" target="_blank" rel="noopener">${escapeHtml(photo.sourceLabel||'Fuente')}</a> · Pulsa la imagen para abrir el artículo`;
    return{src:photo.src,orthophoto,isOrthophoto:false,alt:photo.alt,caption,linkUrl:photo.linkUrl||'',expandable:Boolean(photo.expandable)};
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

  window.renderEnergyInstallationsMap=(row,cfg)=>{
    row.classList.add('territory-row');
    const installations=window.energyMapReeInstallations,territories=window.energyMapTerritories,municipalities=window.energyMapMunicipalities,populations=window.energyMapPopulations,highVoltage=window.energyMapHighVoltage,substations=window.energyMapSubstations,surroundings=window.energyMapSurroundingRegions,biscayInterconnector=window.energyMapBiscayInterconnector,electricProjects=window.energyMapElectricProjects,generationProjects=window.energyMapGenerationProjects,ptsPotentialSites=window.energyMapPtsPotentialSites,nonElectricInfrastructure=window.energyMapNonElectricInfrastructure;
    const host=row.querySelector('.territory-map-host')||row,shell=document.createElement('div');shell.className='territory-map-shell';host.append(shell);
    if(!window.d3||!installations?.features?.length||!territories?.features?.length){
      shell.innerHTML='<p class="map-error"><strong>No se ha podido cargar el mapa.</strong> Los datos permanecen disponibles en la fuente oficial enlazada al final del indicador.</p>';
      return;
    }
    const mapTerritories=d3WindingCollection(territories),mapMunicipalities=municipalities?.features?.length?d3WindingCollection(municipalities):null,mapSubstations=substations?.features?.length?d3WindingCollection(substations):null,mapSurroundings=surroundings?.features?.length?surroundings:null;
    const allGridFeatures=highVoltage?.features||[];
    const highVoltageFeatures=allGridFeatures.filter(feature=>['220 kV','400 kV'].includes(feature.properties?.VTENS_0116)&&!isLegacyGatikaLemoiz(feature));
    const local132Features=allGridFeatures.filter(feature=>feature.properties?.VTENS_0116==='132 kV');
    const biscayFeatures=biscayInterconnector?.features||[],biscayMetadata=biscayInterconnector?.metadata||{},projectDefinitions=electricProjects?.projects||[],generationProjectDefinitions=generationProjects?.projects||[],ptsPotentialDefinitions=ptsPotentialSites?.sites||[],nonElectricRouteDefinitions=nonElectricInfrastructure?.routes||[],nonElectricFacilityDefinitions=nonElectricInfrastructure?.facilities||[],nonElectricCategories=nonElectricInfrastructure?.categories||{},importOrigins=nonElectricInfrastructure?.importOrigins||null,renewableImportOrigins=nonElectricInfrastructure?.renewableImportOrigins||null;

    const records=installations.features.map(feature=>{
      const properties=feature.properties||{},mw=Number(properties.mw)||0,units=Math.max(1,Number(properties.numero)||1);
      const key=keyForTechnology(properties.tecnologia),cogenEvidence=key==='cogen'?cogenFuelEvidenceForName(properties.descripcion):null;
      return{feature,properties,mw,units,key,cogenFuelClass:cogenEvidence?.fuelClass||null,cogenEvidence,coordinate:feature.geometry.coordinates};
    });
    const totals=records.reduce((acc,d)=>({points:acc.points+1,units:acc.units+d.units,mw:acc.mw+d.mw}),{points:0,units:0,mw:0});
    const metadata=TECHNOLOGY_ORDER.map(key=>{
      const subset=records.filter(d=>d.key===key);
      return{key,...TECHNOLOGIES[key],points:subset.length,units:subset.reduce((a,d)=>a+d.units,0),mw:subset.reduce((a,d)=>a+d.mw,0)};
    });

    const toolbar=document.createElement('div');toolbar.className='map-toolbar';
    const filters=document.createElement('div');filters.className='map-filter-list';filters.setAttribute('role','group');filters.setAttribute('aria-label','Capas y filtros del mapa energético');
    const count=document.createElement('p');count.className='map-visible-count';count.setAttribute('aria-live','polite');toolbar.append(filters,count);shell.append(toolbar);

    const layout=document.createElement('div');layout.className='territory-map-layout';
    const electricShare=Math.min(100,Math.max(0,Number(cfg.electricShare2024)||24.837)),nonElectricShare=100-electricShare,electricEnergy=Math.max(0,Number(cfg.electricEnergy2024)||13208),finalEnergy=Math.max(electricEnergy,Number(cfg.finalEnergy2024)||53178),renewableFuelEnergy=Math.max(0,Number(cfg.renewableFuelEnergy2024)||865.4),biomassEnergy=Math.max(0,Number(cfg.biomassEnergy2024)||2413.1),renewableFuelShare=finalEnergy?100*renewableFuelEnergy/finalEnergy:0,biomassShare=finalEnergy?100*biomassEnergy/finalEnergy:0,directRenewableShareWithinNonElectric=nonElectricShare?100*(renewableFuelShare+biomassShare)/nonElectricShare:0,importRenewableShare=Math.min(100,Math.max(0,Number(cfg.importRenewableShare2024)||58.953)),importNonRenewableShare=100-importRenewableShare,deliveryFactor=Math.max(0,Number(cfg.electricDeliveryFactor2024)||1),generationByTechnology=cfg.generationByTechnology2024||{};
    const cogenCapacityByFuelClass=Object.fromEntries(COGEN_FUEL_CLASS_ORDER.map(fuelClass=>[fuelClass,records.filter(record=>record.key==='cogen'&&record.cogenFuelClass===fuelClass).reduce((sum,record)=>sum+record.mw,0)])),cogenCapacityTotal=Object.values(cogenCapacityByFuelClass).reduce((sum,value)=>sum+value,0),cogenGenerationTotal=Math.max(0,Number(generationByTechnology.cogen)||0),cogenEnergyPerMW=cogenCapacityTotal?cogenGenerationTotal/cogenCapacityTotal:0,cogenEnergyByFuelClass=Object.fromEntries(COGEN_FUEL_CLASS_ORDER.map(fuelClass=>[fuelClass,cogenCapacityTotal?cogenGenerationTotal*cogenCapacityByFuelClass[fuelClass]/cogenCapacityTotal:0]));
    const cogenEstimatedRenewableWithinFossil=records.filter(record=>record.key==='cogen'&&record.cogenFuelClass==='fossil').reduce((sum,record)=>{const allocatedEnergy=record.mw*cogenEnergyPerMW,publishedEnergy=Number(record.cogenEvidence?.renewableAnnualGWh),renewableShare=Math.min(1,Math.max(0,Number(record.cogenEvidence?.renewableShare)||0));return sum+(Number.isFinite(publishedEnergy)&&publishedEnergy>0?Math.min(allocatedEnergy,publishedEnergy):allocatedEnergy*renewableShare)},0);
    const barGenerationByTechnology={cycle:(Number(generationByTechnology.cycle)||0)+cogenEnergyByFuelClass.fossil,cogenRenewable:cogenEnergyByFuelClass.renewable,cogenMixed:cogenEnergyByFuelClass.mixed,cogenUnverified:cogenEnergyByFuelClass.unverified,hydro:Number(generationByTechnology.hydro)||0,wind:Number(generationByTechnology.wind)||0,solar:Number(generationByTechnology.solar)||0,other:Number(generationByTechnology.other)||0},barTechnologyKeys=['cycle','cogenRenewable','cogenMixed','cogenUnverified','hydro','wind','solar','other'].filter(key=>Number(barGenerationByTechnology[key])>0),barTechnologyEnergy=Object.fromEntries(barTechnologyKeys.map(key=>[key,Number(barGenerationByTechnology[key])*deliveryFactor]));
    const operatingCapacityByTechnology=Object.fromEntries(metadata.map(item=>[item.key,item.mw])),smallCapacityByTechnology=Object.fromEntries(TECHNOLOGY_ORDER.map(key=>[key,records.filter(record=>record.key===key&&record.mw<.1).reduce((sum,record)=>sum+record.mw,0)])),futureCapacityByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,generationProjectDefinitions.filter(project=>project.technology===key).reduce((sum,project)=>sum+(Number(project.mw)||0),0)])),futureProjectCountByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,generationProjectDefinitions.filter(project=>project.technology===key).length])),ptsPotentialCapacityByTechnology=Object.fromEntries(['wind','solar','other'].map(key=>[key,ptsPotentialDefinitions.filter(site=>site.technology===key).reduce((sum,site)=>sum+(Number(site.potentialMW)||0),0)]));
    const futureGenerationByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,generationProjectDefinitions.filter(project=>project.technology===key).reduce((sum,project)=>sum+(Number(project.annualGWhEstimate)||0),0)])),futureBarTechnologyEnergy=Object.fromEntries(['wind','solar'].map(key=>[key,futureGenerationByTechnology[key]*deliveryFactor])),ptsPotentialGenerationByTechnology=Object.fromEntries(['wind','solar','other'].map(key=>[key,ptsPotentialDefinitions.filter(site=>site.technology===key).reduce((sum,site)=>sum+(Number(site.annualGWhEstimate)||0),0)])),ptsPublishedFinalShareIncrease={wind:6.5,solar:5},ptsPotentialFinalShareIncreaseByTechnology=Object.fromEntries(['wind','solar','other'].map(key=>{const published=Number(ptsPotentialSites?.totals?.[key]?.finalConsumptionShareIncreasePct);return[key,Number.isFinite(published)&&published>0?published:ptsPublishedFinalShareIncrease[key]]})),ptsPotentialBarTechnologyEnergy=Object.fromEntries(['wind','solar','other'].map(key=>[key,Number.isFinite(ptsPotentialFinalShareIncreaseByTechnology[key])&&ptsPotentialFinalShareIncreaseByTechnology[key]>0?finalEnergy*ptsPotentialFinalShareIncreaseByTechnology[key]/100:ptsPotentialGenerationByTechnology[key]*deliveryFactor])),smallBarTechnologyEnergy=Object.fromEntries(['wind','solar'].map(key=>[key,operatingCapacityByTechnology[key]?barTechnologyEnergy[key]*smallCapacityByTechnology[key]/operatingCapacityByTechnology[key]:0]));
    const ownTechnologyEnergy=Object.values(barTechnologyEnergy).reduce((sum,value)=>sum+value,0),importedElectricEnergyBase=Math.max(0,electricEnergy-ownTechnologyEnergy);let importedElectricEnergy=importedElectricEnergyBase,displayedElectricShare=electricShare,displayedNonElectricShare=nonElectricShare;
    const fossilGenerationBlockEnergy=barTechnologyEnergy.cycle||0,fossilGenerationRenewablePercent=fossilGenerationBlockEnergy?100*cogenEstimatedRenewableWithinFossil*deliveryFactor/fossilGenerationBlockEnergy:0;
    const barTechnologyLabels={...Object.fromEntries(TECHNOLOGY_ORDER.map(key=>[key,TECHNOLOGIES[key].label])),cycle:'Generación fósil y mixta',cogenRenewable:'Bioenergía renovable',cogenMixed:'Valorización o cogeneración mixta',cogenUnverified:'Cogeneración sin combustible verificado'},barSegmentDisplayLabels={cycle:'Generación<br>fósil',cogenRenewable:'Bioenergía<br>renovable',cogenMixed:'Mixta',cogenUnverified:'Sin<br>verificar',hydro:'Hidráulica',wind:'Eólica',solar:'Solar',other:'Marina'};
    const isBarTechnologyActive=key=>key==='cycle'?fossilGenerationActive:key==='cogenRenewable'?activeCogenFuelClasses.has('renewable'):key==='cogenMixed'?activeCogenFuelClasses.has('mixed'):key==='cogenUnverified'?activeCogenFuelClasses.has('unverified'):active.has(key);
    const technologySegments=barTechnologyKeys.map(key=>{
      const energy=barTechnologyEnergy[key],electricPercent=electricEnergy?100*energy/electricEnergy:0,totalPercent=finalEnergy?100*energy/finalEnergy:0,isDrillable=['wind','solar','other'].includes(key),tag=isDrillable?'button':'div',buttonAttributes=isDrillable?` type="button" data-drilldown-technology="${key}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar ${barTechnologyLabels[key].toLowerCase()} en servicio: ${formatNumber(energy,key==='other'?3:0)} GWh"`:'';
      const futureEnergy=futureBarTechnologyEnergy[key]||0,futureSegment=futureEnergy?`<button type="button" class="map-energy-share-segment map-energy-share-future" data-future-technology="${key}" data-drilldown-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};flex:${futureEnergy}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar ${barTechnologyLabels[key].toLowerCase()} en construcción o aprobada" hidden><span class="map-energy-share-segment-label">${barSegmentDisplayLabels[key]}<br>proyectos</span><span class="map-energy-share-expanded-label"><strong>${barTechnologyLabels[key]} en construcción o aprobada</strong><small data-future-summary="${key}">${formatNumber(futureEnergy,0)} GWh potenciales · ${formatNumber(futureCapacityByTechnology[key],1)} MW</small></span></button>`:'',ptsPotentialEnergy=ptsPotentialBarTechnologyEnergy[key]||0,ptsPotentialSegment=ptsPotentialEnergy?`<button type="button" class="map-energy-share-segment map-energy-share-pts-potential" data-pts-potential-technology="${key}" data-drilldown-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};flex:${ptsPotentialEnergy}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar el potencial PTS de ${barTechnologyLabels[key].toLowerCase()}" hidden><span class="map-energy-share-segment-label">${barSegmentDisplayLabels[key]}<br>PTS</span><span class="map-energy-share-expanded-label"><strong>Potencial PTS de ${barTechnologyLabels[key].toLowerCase()}</strong><small data-pts-potential-summary="${key}">${formatNumber(ptsPotentialEnergy,key==='other'?2:0)} GWh orientativos · ${formatNumber(ptsPotentialCapacityByTechnology[key],0)} MW agregados</small></span></button>`:'';
      const solarSmallEnergy=key==='solar'?smallBarTechnologyEnergy.solar:0,solarRestEnergy=key==='solar'?Math.max(0,energy-solarSmallEnergy):0,solarBreakdown=key==='solar'?`<span class="map-energy-share-substack"><span class="map-energy-share-subsegment map-energy-share-solar-rest" style="flex:${solarRestEnergy}"><strong>Resto solar en servicio</strong><small>${formatNumber(solarRestEnergy,1)} GWh · ${formatNumber(operatingCapacityByTechnology.solar-smallCapacityByTechnology.solar,1)} MW</small></span><span class="map-energy-share-subsegment map-energy-share-solar-small" style="flex:${solarSmallEnergy}"><strong>Emplazamientos solares &lt; 0,1 MW</strong><small>${formatNumber(solarSmallEnergy,1)} GWh estimados · ${formatNumber(smallCapacityByTechnology.solar,2)} MW</small></span></span>`:'';
      const expandedLabel=key==='wind'?`<span class="map-energy-share-expanded-label"><strong>Eólica en servicio</strong><small>${formatNumber(energy,0)} GWh · ${formatNumber(operatingCapacityByTechnology.wind,1)} MW</small></span>`:key==='other'?`<span class="map-energy-share-expanded-label"><strong>Energía marina en servicio</strong><small>${formatNumber(energy,3)} GWh · ${formatNumber(operatingCapacityByTechnology.other,3)} MW</small></span>`:'';
      const energyDigits=key==='other'?3:0;
      const segmentBackground=key==='cycle'?`linear-gradient(to top,${COGEN_FUEL_CLASSES.fossil.color} 0 calc(100% - ${fossilGenerationRenewablePercent}%),${COGEN_FUEL_CLASSES.renewable.color} calc(100% - ${fossilGenerationRenewablePercent}%) 100%)`:TECHNOLOGIES[key].color,renewableEstimateNote=key==='cycle'?` · incluye ${formatNumber(cogenEstimatedRenewableWithinFossil*deliveryFactor,0)} GWh renovables estimados (${formatNumber(fossilGenerationRenewablePercent,1)} % del bloque) de Zabalgarbi, Ekondakin e Iurreta`:'';
      const currentSegment=`<${tag}${buttonAttributes} class="map-energy-share-segment${isDrillable?' map-energy-share-drillable':''}" data-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};background:${segmentBackground};flex:${energy}" title="${barTechnologyLabels[key]}: ${formatNumber(energy,energyDigits)} GWh · ${formatNumber(electricPercent,key==='other'?3:1)} % de la electricidad · ${formatNumber(totalPercent,key==='other'?4:2)} % del consumo final${renewableEstimateNote}"><span class="map-energy-share-segment-label">${barSegmentDisplayLabels[key]}<small>${formatNumber(energy,energyDigits)} GWh${key==='cogenRenewable'?` · ${formatNumber(totalPercent,2)} % total`:''}${key==='cycle'?`<br>${formatNumber(cogenEstimatedRenewableWithinFossil*deliveryFactor,0)} GWh ren. est.`:''}</small></span>${expandedLabel}${solarBreakdown}</${tag}>`;
      return`${ptsPotentialSegment}${futureSegment}${currentSegment}`;
    }).join('');
    const energyShare=document.createElement('aside');energyShare.className='map-energy-share';energyShare.setAttribute('aria-label',`Consumo final energético de Euskadi en 2024: ${formatNumber(electricShare,1)} % electricidad y ${formatNumber(nonElectricShare,1)} % energía no eléctrica, principalmente petróleo y gas natural`);
    energyShare.innerHTML=`<p class="map-energy-share-title">Consumo final<br><strong>100 %</strong><span data-energy-share-basis>2024</span></p><div class="map-energy-share-bar" role="group" aria-label="Electricidad: ${formatNumber(electricShare,1)} %. Energía no eléctrica: ${formatNumber(nonElectricShare,1)} %"><div class="map-energy-share-rest" style="flex:${nonElectricShare}"><span>Energía<br>no eléctrica<br><strong>${formatNumber(nonElectricShare,1)} %</strong></span><div class="map-energy-share-direct-renewables" style="height:${directRenewableShareWithinNonElectric}%"><div class="map-energy-share-biomass" style="flex:${biomassEnergy}" title="Biomasa no eléctrica: ${formatNumber(biomassEnergy,1)} GWh · ${formatNumber(biomassShare,2)} % del consumo final"><span class="map-energy-share-direct-label">Biomasa<small>${formatNumber(biomassEnergy,0)} GWh</small></span></div><div class="map-energy-share-renewable-fuels" style="flex:${renewableFuelEnergy}" title="Combustibles renovables: ${formatNumber(renewableFuelEnergy,1)} GWh · ${formatNumber(renewableFuelShare,2)} % del consumo final"><span class="map-energy-share-direct-label">Combustibles<br>renovables<small>${formatNumber(renewableFuelEnergy,0)} GWh</small></span></div></div></div><div class="map-energy-share-electric" style="flex:${electricShare}"><button type="button" class="map-energy-share-electric-toggle" aria-pressed="false" aria-expanded="false" aria-label="Ampliar el desglose de la electricidad, ${formatNumber(electricShare,1)} % del consumo final"><span class="map-energy-share-electric-label">Electricidad<br><strong>${formatNumber(electricShare,1)} %</strong></span></button><div class="map-energy-share-electric-stack"><div class="map-energy-share-segment map-energy-share-imported" style="flex:${importedElectricEnergy};--import-renewable-share:${importRenewableShare}%;--import-nonrenewable-share:${importNonRenewableShare}%" title="Electricidad importada: ${formatNumber(importedElectricEnergy,0)} GWh · atribución 2024: ${formatNumber(importRenewableShare,1)} % renovable y ${formatNumber(importNonRenewableShare,1)} % no renovable"><span class="map-energy-share-segment-label">Importada<small>${formatNumber(importRenewableShare,0)} % ren.<br>${formatNumber(importNonRenewableShare,0)} % no ren.</small></span></div>${technologySegments}</div></div></div>`;
    const energyShareCalloutLayer=document.createElement('div');energyShareCalloutLayer.className='map-energy-share-callouts';energyShareCalloutLayer.setAttribute('aria-hidden','true');energyShare.append(energyShareCalloutLayer);
    const energyShareBar=energyShare.querySelector('.map-energy-share-bar'),electricFocusButton=energyShare.querySelector('.map-energy-share-electric-toggle'),restShareBlock=energyShare.querySelector('.map-energy-share-rest'),electricShareBlock=energyShare.querySelector('.map-energy-share-electric'),restShareStrong=energyShare.querySelector('.map-energy-share-rest strong'),technologyDrillButtons=[...energyShare.querySelectorAll('[data-drilldown-technology]')];let expandedTechnology=null,energyCalloutFrame=0,energyCalloutAnimationFrame=0;
    const refreshEnergyCallouts=()=>{cancelAnimationFrame(energyCalloutFrame);energyCalloutFrame=requestAnimationFrame(()=>{energyShareCalloutLayer.replaceChildren();if(energyShareBar.classList.contains('is-technology-expanded'))return;const shareRect=energyShare.getBoundingClientRect(),barRect=energyShareBar.getBoundingClientRect(),barTop=barRect.top-shareRect.top,barBottom=barRect.bottom-shareRect.top,startX=barRect.right-shareRect.left,labelLeft=startX+20,labelWidth=Math.max(76,shareRect.width-labelLeft-5),sources=[...energyShare.querySelectorAll('.map-energy-share-direct-renewables>div,.map-energy-share-imported,.map-energy-share-electric-stack>[data-technology],.map-energy-share-electric-stack>[data-future-technology],.map-energy-share-electric-stack>[data-pts-potential-technology]')].filter(source=>{const rect=source.getBoundingClientRect(),style=getComputedStyle(source),layerActive=source.classList.contains('map-energy-share-biomass')?energyShareBar.classList.contains('is-biomass-visible'):source.classList.contains('map-energy-share-renewable-fuels')?energyShareBar.classList.contains('is-renewable-fuel-visible'):!source.classList.contains('is-inactive');return layerActive&&!source.hidden&&style.display!=='none'&&rect.height>.05});const items=sources.map(source=>{const sourceLabel=source.querySelector('.map-energy-share-direct-label,.map-energy-share-segment-label'),rect=source.getBoundingClientRect(),anchorY=rect.top-shareRect.top+rect.height/2,label=document.createElement('span');label.className='map-energy-share-callout';label.style.left=`${labelLeft}px`;label.style.width=`${labelWidth}px`;label.innerHTML=sourceLabel?.innerHTML||source.getAttribute('title')||'';energyShareCalloutLayer.append(label);const color=source.classList.contains('map-energy-share-biomass')?'#c79a6b':source.classList.contains('map-energy-share-renewable-fuels')?'#7a4a2a':source.classList.contains('map-energy-share-imported')?'#53676d':source.style.getPropertyValue('--segment-color')||'#53676d';return{anchorY,label,color,height:Math.max(18,label.getBoundingClientRect().height)}}).sort((a,b)=>a.anchorY-b.anchorY);if(!items.length)return;const gap=4;items.forEach((item,index)=>{const half=item.height/2,minCenter=index?items[index-1].labelY+items[index-1].height/2+gap+half:barTop+half;item.labelY=Math.max(item.anchorY,minCenter)});let overflow=items.at(-1).labelY+items.at(-1).height/2-barBottom;if(overflow>0)items.forEach(item=>item.labelY-=overflow);for(let index=items.length-2;index>=0;index--){const item=items[index],next=items[index+1],maxCenter=next.labelY-next.height/2-gap-item.height/2;item.labelY=Math.min(item.labelY,maxCenter)}const underflow=barTop-(items[0].labelY-items[0].height/2);if(underflow>0)items.forEach(item=>item.labelY+=underflow);items.forEach(item=>{item.label.style.top=`${item.labelY}px`;item.label.style.setProperty('--callout-color',item.color);const dx=labelLeft-startX-3,dy=item.labelY-item.anchorY,line=document.createElement('i');line.className='map-energy-share-callout-line';line.style.left=`${startX}px`;line.style.top=`${item.anchorY}px`;line.style.width=`${Math.hypot(dx,dy)}px`;line.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;line.style.setProperty('--callout-color',item.color);energyShareCalloutLayer.append(line)})})};
    const animateEnergyCallouts=()=>{cancelAnimationFrame(energyCalloutAnimationFrame);const startedAt=performance.now(),step=now=>{refreshEnergyCallouts();if(now-startedAt<650)energyCalloutAnimationFrame=requestAnimationFrame(step)};energyCalloutAnimationFrame=requestAnimationFrame(step)};
    const updateExpansionControls=()=>{const electricityExpanded=energyShareBar.classList.contains('is-electric-expanded');electricFocusButton.setAttribute('aria-pressed',String(electricityExpanded));electricFocusButton.setAttribute('aria-expanded',String(electricityExpanded));electricFocusButton.setAttribute('aria-label',expandedTechnology?`Volver al desglose de toda la electricidad desde ${barTechnologyLabels[expandedTechnology]}`:electricityExpanded?`Volver al consumo final completo. Electricidad: ${formatNumber(displayedElectricShare,1)} %`:`Ampliar el desglose de la electricidad, ${formatNumber(displayedElectricShare,1)} % del consumo final`);electricFocusButton.querySelector('.map-energy-share-electric-label').innerHTML=expandedTechnology?'←<br>Electricidad':`Electricidad<br><strong>${formatNumber(displayedElectricShare,1)} %</strong>`;technologyDrillButtons.forEach(button=>{const key=button.dataset.drilldownTechnology,selected=key===expandedTechnology,isFuture=Boolean(button.dataset.futureTechnology),isPtsPotential=Boolean(button.dataset.ptsPotentialTechnology);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-expanded',String(selected));button.setAttribute('aria-label',selected?`Volver al desglose de toda la electricidad desde ${barTechnologyLabels[key]}`:isPtsPotential?`Ampliar el potencial PTS de ${barTechnologyLabels[key].toLowerCase()}`:isFuture?`Ampliar ${barTechnologyLabels[key].toLowerCase()} en construcción o aprobada`:`Ampliar ${barTechnologyLabels[key].toLowerCase()} en servicio: ${formatNumber(barTechnologyEnergy[key],key==='other'?3:0)} GWh`)})};
    const setTechnologyExpanded=key=>{expandedTechnology=['wind','solar','other'].includes(key)?key:null;energyShareBar.classList.toggle('is-technology-expanded',Boolean(expandedTechnology));if(expandedTechnology){energyShareBar.classList.add('is-electric-expanded');energyShareBar.dataset.expandedTechnology=expandedTechnology}else delete energyShareBar.dataset.expandedTechnology;updateExpansionControls();animateEnergyCallouts()};
    const setElectricityExpanded=expanded=>{if(!expanded){expandedTechnology=null;energyShareBar.classList.remove('is-technology-expanded');delete energyShareBar.dataset.expandedTechnology}energyShareBar.classList.toggle('is-electric-expanded',expanded);updateExpansionControls();animateEnergyCallouts()};
    electricFocusButton.addEventListener('click',event=>{event.stopPropagation();if(expandedTechnology)setTechnologyExpanded(null);else setElectricityExpanded(!energyShareBar.classList.contains('is-electric-expanded'))});
    electricShareBlock.addEventListener('click',event=>{if(event.target.closest('button'))return;setElectricityExpanded(!energyShareBar.classList.contains('is-electric-expanded'))});
    technologyDrillButtons.forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();const key=button.dataset.drilldownTechnology;setTechnologyExpanded(expandedTechnology===key?null:key)}));
    new ResizeObserver(refreshEnergyCallouts).observe(energyShareBar);new MutationObserver(refreshEnergyCallouts).observe(energyShareBar,{subtree:true,attributes:true,attributeFilter:['class','hidden','style']});window.addEventListener('resize',refreshEnergyCallouts);refreshEnergyCallouts();
    const viewport=document.createElement('div');viewport.className='energy-map-viewport';
    const detail=document.createElement('aside');detail.className='map-detail';detail.setAttribute('aria-live','polite');
    layout.append(energyShare,viewport,detail);shell.append(layout);
    const detailModal=document.createElement('div');detailModal.className='map-detail-modal';detailModal.hidden=true;detailModal.setAttribute('role','dialog');detailModal.setAttribute('aria-modal','true');
    detailModal.innerHTML='<div class="map-detail-modal-card"><div class="map-detail-modal-head"><strong>Información completa</strong><button type="button" class="map-detail-modal-close">Cerrar</button></div><div class="map-detail-modal-body"></div></div>';
    shell.append(detailModal);
    const detailModalBody=detailModal.querySelector('.map-detail-modal-body'),detailModalClose=detailModal.querySelector('.map-detail-modal-close'),detailModalTitle=detailModal.querySelector('.map-detail-modal-head strong');
    const openImageModal=(figure,title)=>{
      const copy=figure.cloneNode(true);copy.classList.add('installation-photo-expanded');copy.querySelector('.installation-photo-expand')?.remove();detailModalTitle.textContent=title;detailModalBody.replaceChildren(copy);detailModal.hidden=false;detailModalClose.focus();
    };
    const refreshDetailActions=()=>{
      detail.querySelector('.map-detail-more')?.remove();
      const button=document.createElement('button');button.type='button';button.className='map-detail-more';button.textContent='Ver ficha completa';button.setAttribute('aria-label','Abrir la ficha completa en una ventana');
      button.addEventListener('click',()=>{
        const copy=detail.cloneNode(true);copy.querySelector('.map-detail-more')?.remove();detailModalTitle.textContent='Información completa';detailModalBody.replaceChildren(...copy.childNodes);detailModal.hidden=false;detailModalClose.focus();
      });
  detail.prepend(button);
    };
    const closeDetailModal=()=>{detailModal.hidden=true};
    detailModalClose.addEventListener('click',closeDetailModal);detailModal.addEventListener('click',event=>{if(event.target===detailModal)closeDetailModal()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!detailModal.hidden)closeDetailModal()});
    const scope=document.createElement('p');scope.className='map-scope';scope.innerHTML=`<strong>Cómo leer el mapa.</strong> «Red eléctrica» agrupa las redes de 132, 220 y 400 kV, las subestaciones y las actuaciones aprobadas o en construcción. «Entradas de electricidad importada» muestra las puertas exteriores con dos bandas: verde oscuro para el ${formatNumber(importRenewableShare,1)} % atribuido a renovables en 2024 y gris para el ${formatNumber(importNonRenewableShare,1)} % atribuido a fuentes no renovables. Es una composición estadística agregada, no la trazabilidad física de cada conexión. «Generación fósil» agrupa el ciclo combinado y la cogeneración asignada a combustible fósil. Dentro de su bloque, una banda verde reserva ${formatNumber(cogenEstimatedRenewableWithinFossil*deliveryFactor,0)} GWh (${formatNumber(fossilGenerationRenewablePercent,1)} %) para la fracción renovable estimada de Zabalgarbi, Ekondakin e Iurreta; el total del bloque no cambia. El resto de la categoría registral «Cogeneración, residuos y biomasa» se separa en bioenergía renovable, valorización mixta y combustible no verificado. La barra reparte los ${formatNumber(cogenGenerationTotal,0)} GWh agregados en proporción a la potencia instalada y aplica después las fracciones documentadas; es una estimación, no una medición directa por combustible. «Infraestructura no eléctrica» reúne gas y petróleo en gris; «Combustibles renovables» separa biocombustibles, bioGNL e hidrógeno con el marrón del mix renovable directo. Los trazados son esquemáticos cuando la fuente solo publica sus extremos. <strong>Poblaciones.</strong> Los cuadrados negros sitúan los municipios según su población a 1 de enero de 2025.`;shell.append(scope);

    const W=900,H=590,svg=d3.select(viewport).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('preserveAspectRatio','xMidYMin meet').attr('role','img').attr('aria-label','Mapa de Euskadi y su entorno con instalaciones y redes energéticas eléctricas y no eléctricas');
    const syncMapViewBox=()=>{
      const width=Math.max(1,viewport.clientWidth||W),height=Math.max(1,viewport.clientHeight||H),viewHeight=Math.max(H,W*height/width);
      svg.attr('viewBox',`0 0 ${W} ${viewHeight}`);
    };
    if('ResizeObserver'in window)new ResizeObserver(syncMapViewBox).observe(viewport);else window.addEventListener('resize',syncMapViewBox);
    requestAnimationFrame(syncMapViewBox);
    const defs=svg.append('defs');
    const seaPattern=defs.append('pattern').attr('id','sea-wave-pattern').attr('patternUnits','userSpaceOnUse').attr('width',36).attr('height',18);
    seaPattern.append('rect').attr('width',36).attr('height',18).attr('fill','#eef7fa');
    seaPattern.append('path').attr('d','M-9 12 Q0 4 9 12 T27 12 T45 12').attr('fill','none').attr('stroke','#7fb3c8').attr('stroke-width',1.2).attr('opacity',.48);
    TECHNOLOGY_ORDER.forEach(key=>{
      const pattern=defs.append('pattern').attr('id',`generation-project-${key}-hatch`).attr('patternUnits','userSpaceOnUse').attr('width',6).attr('height',6);
      pattern.append('rect').attr('width',6).attr('height',6).attr('fill',TECHNOLOGIES[key].color);
      pattern.append('path').attr('d','M-2 2 L2 -2 M0 6 L6 0 M4 8 L8 4').attr('fill','none').attr('stroke','#111').attr('stroke-width',.65).attr('opacity',.9);
      const gridPattern=defs.append('pattern').attr('id',`pts-potential-${key}-grid`).attr('patternUnits','userSpaceOnUse').attr('width',6).attr('height',6);
      gridPattern.append('rect').attr('width',6).attr('height',6).attr('fill',TECHNOLOGIES[key].color);
      gridPattern.append('path').attr('d','M0 0 H6 M0 3 H6 M0 6 H6 M0 0 V6 M3 0 V6 M6 0 V6').attr('fill','none').attr('stroke','#111').attr('stroke-width',.42).attr('opacity',.88);
    });
    const cogenMixedPattern=defs.append('pattern').attr('id','cogen-fuel-mixed').attr('patternUnits','userSpaceOnUse').attr('width',8).attr('height',8);
    cogenMixedPattern.append('rect').attr('width',8).attr('height',8).attr('fill',COGEN_FUEL_CLASSES.mixed.color);
    cogenMixedPattern.append('path').attr('d','M-2 2 L2 -2 M0 8 L8 0 M6 10 L10 6').attr('stroke',COGEN_FUEL_CLASSES.renewable.color).attr('stroke-width',2.2);
    const mapLayer=svg.append('g').attr('class','energy-map-layer');
    const projection=d3.geoMercator().fitExtent([[28,118],[W-28,H-24]],mapTerritories),path=d3.geoPath(projection);
    const seaBackground={type:'Feature',properties:{role:'sea-background'},geometry:{type:'Polygon',coordinates:[[[-8,43.05],[-8,50],[5,50],[5,43.05],[-8,43.05]]]}};
    mapLayer.append('path').datum(seaBackground).attr('class','sea-area').attr('d',path);
    if(mapSurroundings)mapLayer.selectAll('path.surrounding-land').data(mapSurroundings.features).join('path').attr('class','surrounding-land').attr('d',path);
    mapLayer.selectAll('path.territory-fill').data(mapTerritories.features).join('path').attr('class','territory-fill').attr('d',path);
    if(mapMunicipalities)mapLayer.selectAll('path.municipality-line').data(mapMunicipalities.features).join('path').attr('class','municipality-line').attr('d',path);
    const substationLayer=mapLayer.append('g').attr('class','substation-layer');
    const substationShapes=substationLayer.selectAll('path').data(mapSubstations?.features||[]).join('path').attr('class','substation-footprint').attr('d',path);
    substationShapes.append('title').text('Subestación eléctrica · GeoEuskadi');
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
      .attr('class',record=>`electric-project-marker project-${record.project.status} project-voltage-${String(record.project.voltage||'').replace(/\D/g,'')}`).attr('transform',record=>`translate(${record.position.join(',')})`)
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
    const nonElectricFacilityRecords=nonElectricFacilityDefinitions.filter(facility=>Array.isArray(facility.coordinate)&&facility.coordinate.length===2),renewableFuelFacilityRecords=nonElectricFacilityRecords.filter(facility=>facility.category==='renewableGas'),biomassFacilityRecords=nonElectricFacilityRecords.filter(facility=>facility.category==='thermalBiomass'),fossilFacilityRecords=nonElectricFacilityRecords.filter(facility=>!['renewableGas','thermalBiomass'].includes(facility.category));
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
    const ordered=[...records].sort((a,b)=>b.mw-a.mw);
    const cogenMarkerFill=record=>record.cogenFuelClass==='mixed'?'url(#cogen-fuel-mixed)':COGEN_FUEL_CLASSES[record.cogenFuelClass]?.color||TECHNOLOGIES.cogen.color;
    const markers=mapLayer.append('g').attr('class','energy-markers').selectAll('circle').data(ordered).join('circle')
      .attr('class',d=>`energy-marker${d.key==='cogen'?` cogen-fuel-${d.cogenFuelClass}`:''}`).attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1])
      .attr('r',d=>d.mw<0.1?2.3:radius(d.mw)).attr('fill',d=>d.key==='cogen'?cogenMarkerFill(d):TECHNOLOGIES[d.key].color).attr('fill-opacity',.86)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.properties.descripcion||'Instalación'}; ${d.key==='cogen'?COGEN_FUEL_CLASSES[d.cogenFuelClass].label:TECHNOLOGIES[d.key].label}; ${formatNumber(d.mw,Math.max(0,d.mw<1?3:1))} MW; ${cleanMunicipality(d.properties.municipio)}`);

    const generationProjectRecords=generationProjectDefinitions.filter(project=>Array.isArray(project.coordinate)&&project.coordinate.length===2).map(project=>({...project,key:project.technology in TECHNOLOGIES?project.technology:'other',mw:Number(project.mw)||0}));
    const generationProjectRadius=d3.scaleSqrt().domain([.5,d3.max(generationProjectRecords,d=>d.mw)||1]).range([5,17]).clamp(true);
    const generationProjectLayer=mapLayer.append('g').attr('class','generation-project-layer');
    const generationProjectMarkers=generationProjectLayer.selectAll('circle').data([...generationProjectRecords].sort((a,b)=>b.mw-a.mw)).join('circle')
      .attr('class',d=>`generation-project-marker project-${d.status}`).attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1])
      .attr('r',d=>generationProjectRadius(d.mw)).attr('fill',d=>`url(#generation-project-${d.key}-hatch)`)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.name}; ${TECHNOLOGIES[d.key].label}; ${formatNumber(d.mw,d.mw<10?1:0)} MW; ${d.statusLabel}; ${d.municipalities.join(', ')}`);
    generationProjectMarkers.append('title').text(d=>`${d.name} · ${TECHNOLOGIES[d.key].label} · ${formatNumber(d.mw,d.mw<10?1:0)} MW · ${d.statusLabel}`);

    const ptsPotentialRecords=ptsPotentialDefinitions.filter(site=>Array.isArray(site.coordinate)&&site.coordinate.length===2).map(site=>({...site,key:site.technology in TECHNOLOGIES?site.technology:'other',mw:Number(site.potentialMW)||0}));
    const ptsPotentialRadius=d3.scaleSqrt().domain([4,d3.max(ptsPotentialRecords,d=>d.mw)||1]).range([4.8,17]).clamp(true);
    const ptsPotentialLayer=mapLayer.append('g').attr('class','pts-potential-layer');
    const ptsPotentialMarkers=ptsPotentialLayer.selectAll('circle').data([...ptsPotentialRecords].sort((a,b)=>b.mw-a.mw)).join('circle')
      .attr('class','pts-potential-marker').attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1])
      .attr('r',d=>ptsPotentialRadius(d.mw)).attr('fill',d=>`url(#pts-potential-${d.key}-grid)`)
      .attr('tabindex',0).attr('role','button')
      .attr('aria-label',d=>`${d.name}; ${d.technologyLabel||TECHNOLOGIES[d.key].label}; Zona de Localización Seleccionada del PTS; potencia orientativa no oficial por zona ${formatNumber(d.mw,d.mw<10?1:0)} MW; ${(d.municipalities||[]).join(', ')}`);
    ptsPotentialMarkers.append('title').text(d=>`${d.name} · ${d.technologyLabel||TECHNOLOGIES[d.key].label} · ${formatNumber(d.mw,d.mw<10?1:0)} MW orientativos, no asignación oficial por zona`);

    const verifiedSubstationLayer=mapLayer.append('g').attr('class','verified-substations');
    const verifiedSubstations=verifiedSubstationLayer.selectAll('g').data(VERIFIED_SUBSTATIONS).join('g').attr('class','verified-substation-group').attr('transform',d=>`translate(${projection(d.coordinate).join(',')})`);
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
    const futureMarineGateway=Array.isArray(biscayMetadata.seaExit)?{name:'Golfo de Bizkaia · Lemoiz',coordinate:biscayMetadata.seaExit,voltage:biscayMetadata.voltage||'HVDC ±400 kV',territory:'Francia',links:['Lemoiz – Cubnezais'],capacityTotalMVA:2000,capacityCircuits:[['Enlace HVDC 1',1000],['Enlace HVDC 2',1000]],capacityNote:'La capacidad publicada es de 2.000 MW. La flecha discontinua indica que la interconexión está en construcción y no representa un flujo actual.',isFuture:true,statusLabel:biscayMetadata.status||'En construcción'}:null;
    const rawImportGatewayRecords=[...INTERCONNECTION_NODES,...(futureMarineGateway?[futureMarineGateway]:[])].map(node=>{
      const gatewayCoordinate=node.isFuture?node.coordinate:gatewayCoordinateForNode(node),borderPosition=projection(gatewayCoordinate);
      return{...node,gatewayCoordinate,borderPosition};
    });
    const clusteredImportGatewayRecords=[];
    rawImportGatewayRecords.forEach(record=>{
      const existing=!record.isFuture&&clusteredImportGatewayRecords.find(candidate=>!candidate.isFuture&&Math.hypot(candidate.borderPosition[0]-record.borderPosition[0],candidate.borderPosition[1]-record.borderPosition[1])<26);
      if(!existing){clusteredImportGatewayRecords.push({...record});return}
      const previousCapacity=existing.capacityTotalMVA,totalCapacity=previousCapacity+record.capacityTotalMVA;
      existing.name=`${existing.name} / ${record.name}`;
      existing.borderPosition=[(existing.borderPosition[0]*previousCapacity+record.borderPosition[0]*record.capacityTotalMVA)/totalCapacity,(existing.borderPosition[1]*previousCapacity+record.borderPosition[1]*record.capacityTotalMVA)/totalCapacity];
      existing.gatewayCoordinate=[(existing.gatewayCoordinate[0]*previousCapacity+record.gatewayCoordinate[0]*record.capacityTotalMVA)/totalCapacity,(existing.gatewayCoordinate[1]*previousCapacity+record.gatewayCoordinate[1]*record.capacityTotalMVA)/totalCapacity];
      existing.coordinate=existing.gatewayCoordinate;
      existing.capacityTotalMVA=totalCapacity;
      existing.capacityCircuits=[...(existing.capacityCircuits||[]),...(record.capacityCircuits||[])];
      existing.links=[...(existing.links||[]),...(record.links||[])];
      existing.territory=[...new Set(`${existing.territory} y ${record.territory}`.split(' y '))].join(' y ');
      existing.voltage=[...new Set(`${existing.voltage} y ${record.voltage}`.split(' y '))].join(' y ');
      existing.capacityNote=[existing.capacityNote,record.capacityNote,'Los dos corredores se representan mediante una sola flecha porque cruzan la frontera en puntos cartográficamente casi coincidentes.'].filter(Boolean).join(' ');
    });
    const importGatewayCapacityScale=d3.scaleSqrt().domain(d3.extent(clusteredImportGatewayRecords,node=>node.capacityTotalMVA)).range([1.05,1.9]).clamp(true);
    const importGatewayRecords=clusteredImportGatewayRecords.map(node=>{
      const angle=Math.atan2(euskadiMapCenter[1]-node.borderPosition[1],euskadiMapCenter[0]-node.borderPosition[0])*180/Math.PI,symbolScale=importGatewayCapacityScale(node.capacityTotalMVA),angleRadians=angle*Math.PI/180,outwardOffset=9+3*symbolScale;
      const position=[node.borderPosition[0]-Math.cos(angleRadians)*outwardOffset,node.borderPosition[1]-Math.sin(angleRadians)*outwardOffset];
      return{...node,position,angle,symbolScale,labelDy:-10*symbolScale};
    });
    const futureMarineTailPath=record=>{
      const routeCoordinates=marineCoordinates.slice(0,Math.min(11,marineCoordinates.length)).reverse(),points=routeCoordinates.map(coordinate=>{const projected=projection(coordinate);return[projected[0]-record.position[0],projected[1]-record.position[1]]});
      if(points.length<2)return'M-105 0 H-25';
      return d3.line().curve(d3.curveCatmullRom.alpha(.55))(points);
    };
    const importGateways=importGatewayLayer.selectAll('g').data(importGatewayRecords).join('g').attr('class',d=>`import-gateway${d.isFuture?' is-future':''}`)
      .attr('transform',d=>`translate(${d.position.join(',')})`).attr('tabindex',0).attr('role','button')
      .attr('aria-label',d=>`${d.isFuture?'Entrada futura':'Entrada'} de electricidad importada por el corredor de ${d.name}; cruce de frontera; conexión con ${d.territory}; ${formatNumber(d.capacityTotalMVA,0)} MVA nominales asociados; bandas agregadas de 2024: ${formatNumber(importRenewableShare,1)} % renovable y ${formatNumber(importNonRenewableShare,1)} % no renovable; ${d.voltage}${d.isFuture?`; ${d.statusLabel}`:''}`);
    const arrowStart=-30,arrowEnd=20,arrowHeadStart=10,arrowHeight=7,chevronDepth=6,arrowSplit=arrowStart+(arrowEnd-arrowStart)*importNonRenewableShare/100;
    const nonRenewableArrowPath=`M${arrowStart},${-arrowHeight} H${arrowSplit} L${arrowSplit+chevronDepth},0 L${arrowSplit},${arrowHeight} H${arrowStart} Z`;
    const renewableArrowPath=`M${arrowSplit},${-arrowHeight} H${arrowHeadStart} L${arrowEnd},0 L${arrowHeadStart},${arrowHeight} H${arrowSplit} L${arrowSplit+chevronDepth},0 Z`;
    importGateways.filter(d=>d.isFuture).append('path').attr('class','import-gateway-tail').attr('d',futureMarineTailPath);
    const importGatewaySymbols=importGateways.append('g').attr('class','import-gateway-symbol').attr('transform',d=>`rotate(${d.angle}) scale(${d.symbolScale})`);
    importGatewaySymbols.append('path').attr('class','import-gateway-arrow-segment import-gateway-arrow-nonrenewable').attr('d',nonRenewableArrowPath);
    importGatewaySymbols.append('path').attr('class','import-gateway-arrow-segment import-gateway-arrow-renewable').attr('d',renewableArrowPath);
    importGatewaySymbols.append('path').attr('class','import-gateway-arrow-detail import-gateway-arrow-detail-nonrenewable').attr('d',`M${arrowStart+6},-2 H${Math.max(arrowStart+11,arrowSplit-5)} M${arrowStart+6},3 H${Math.max(arrowStart+9,arrowSplit-8)}`);
    importGatewaySymbols.append('path').attr('class','import-gateway-arrow-detail import-gateway-arrow-detail-renewable').attr('d',`M${arrowSplit+chevronDepth+3},-2 H${arrowHeadStart-1} M${arrowSplit+chevronDepth+3},3 H${arrowHeadStart-5}`);
    importGateways.append('text').attr('class','import-gateway-label').attr('x',d=>26*d.symbolScale).attr('y',d=>d.labelDy).text(d=>d.isFuture?`Desde Francia · Lemoiz · ${formatNumber(d.capacityTotalMVA,0)} MW`:`${d.name} · ${formatNumber(d.capacityTotalMVA,0)} MVA`);
    importGateways.append('title').text(d=>`${d.isFuture?'Puerta futura en construcción':'Puerta de entrada'} de electricidad importada · cruce fronterizo del corredor de ${d.name} · ${formatNumber(d.capacityTotalMVA,0)} MVA nominales · conexión con ${d.territory} · color agregado 2024: ${formatNumber(importRenewableShare,1)} % renovable y ${formatNumber(importNonRenewableShare,1)} % no renovable`);
    nonElectricLayer.raise();

    let currentZoomScale=1;
    const zoom=d3.zoom().scaleExtent([1,9]).on('zoom',event=>{
      currentZoomScale=event.transform.k;
      mapLayer.attr('transform',event.transform);
      markers.attr('r',d=>(d.mw<0.1?2.3:radius(d.mw))/Math.pow(event.transform.k,.62));
      generationProjectMarkers.attr('r',d=>generationProjectRadius(d.mw)/Math.pow(event.transform.k,.62));
      ptsPotentialMarkers.attr('r',d=>ptsPotentialRadius(d.mw)/Math.pow(event.transform.k,.62));
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
      importGateways.select('.import-gateway-symbol').attr('transform',d=>`rotate(${d.angle}) scale(${d.symbolScale/Math.pow(event.transform.k,.72)})`);
      importGateways.select('.import-gateway-label').style('font-size',`${10.5/Math.pow(event.transform.k,.72)}px`);
      biscayNodes.select('.biscay-node').attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      biscayNodeLayer.selectAll('.biscay-node-label,.biscay-destination-label').style('font-size',`${10.5/Math.pow(event.transform.k,.72)}px`);
      updatePopulationVisibility();
    });
    svg.call(zoom).on('dblclick.zoom',null);
    const zoomControls=document.createElement('div');zoomControls.className='map-zoom-controls';
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
    const enterFullscreen=async()=>{
      const request=shell.requestFullscreen||shell.webkitRequestFullscreen;
      if(location.protocol==='file:'){enterFallbackFullscreen();return}
      if(request){try{await request.call(shell);updateFullscreenButton();return}catch(error){/* El navegador integrado puede no autorizar el modo nativo. */}}
      enterFallbackFullscreen();
    };
    const exitFullscreen=async()=>{
      if(fallbackFullscreen){fallbackFullscreen=false;shell.classList.remove('is-map-maximized');document.body.classList.remove('map-fullscreen-open');updateFullscreenButton();return}
      const exit=document.exitFullscreen||document.webkitExitFullscreen;
      if(exit&&fullscreenElement()===shell){try{await exit.call(document)}catch(error){/* Esc sigue disponible como salida nativa. */}}
      updateFullscreenButton();
    };
    const toggleFullscreen=()=>fullscreenActive()?exitFullscreen():enterFullscreen();
    makeZoomButton('+','Acercar','',()=>svg.transition().duration(220).call(zoom.scaleBy,1.55));
    makeZoomButton('−','Alejar','',()=>svg.transition().duration(220).call(zoom.scaleBy,1/1.55));
    makeZoomButton('Recentrar','Restablecer el encuadre','reset',()=>svg.transition().duration(260).call(zoom.transform,d3.zoomIdentity));
    fullscreenButton=makeZoomButton('⛶ Pantalla completa','Pantalla completa','fullscreen',toggleFullscreen);fullscreenButton.setAttribute('aria-pressed','false');
    document.addEventListener('fullscreenchange',updateFullscreenButton);document.addEventListener('webkitfullscreenchange',updateFullscreenButton);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&fallbackFullscreen)exitFullscreen()});
    viewport.append(zoomControls);
    const networkLegend=document.createElement('div');networkLegend.className='map-network-legend';networkLegend.innerHTML=`<span data-layer="grid"><i class="line-400" aria-hidden="true"></i>400 kV</span><span data-layer="grid"><i class="line-220" aria-hidden="true"></i>220 kV</span><span data-layer="grid"><i class="line-132" aria-hidden="true"></i>132 kV</span><span data-layer="grid"><i class="substation" aria-hidden="true"></i>Subestación</span><span data-layer="grid"><i class="project-construction" aria-hidden="true"></i>Red en construcción o aprobada</span><span data-layer="grid"><i class="node" aria-hidden="true"></i>Nodo exterior</span><span data-layer="imports"><i class="import-gateway" aria-hidden="true"></i>Entrada importada · ${formatNumber(importRenewableShare,0)} % renov. / ${formatNumber(importNonRenewableShare,0)} % no renov.</span><span data-layer="generation-projects"><i class="generation-project-construction" aria-hidden="true"></i>Generación en construcción o aprobada</span><span data-layer="pts-potentials"><i class="pts-potential" aria-hidden="true"></i>Potenciales nuevas instalaciones · PTS</span><span data-layer="non-electric"><i class="non-electric-gas" aria-hidden="true"></i>Gasoducto</span><span data-layer="non-electric"><i class="non-electric-oil" aria-hidden="true"></i>Oleoducto / poliducto</span><span data-layer="non-electric"><i class="non-electric-gas-facility" aria-hidden="true"></i>GNL / almacenamiento gasista</span><span data-layer="non-electric"><i class="non-electric-oil-facility" aria-hidden="true"></i>Refinería / terminal</span><span data-layer="renewable-fuels"><i class="renewable-fuel-facility" aria-hidden="true"></i>Combustibles renovables</span><span data-layer="renewable-fuels"><i class="renewable-import-origin" aria-hidden="true"></i>Barco marrón · origen y riesgo de materias primas</span><span data-layer="thermal-biomass"><i class="thermal-biomass-facility" aria-hidden="true"></i>Biomasa no eléctrica · instalaciones representativas</span>`;viewport.append(networkLegend);

    const constructionProjectCount=projectDefinitions.filter(project=>project.status==='construction').length+1,authorizedProjectCount=projectDefinitions.filter(project=>project.status==='authorized').length,activeProjectCount=constructionProjectCount+authorizedProjectCount;
    const clearProjectSelection=()=>{projectPaths.classed('is-selected',false);projectMarkers.classed('is-selected',false)};
    const clearGenerationProjectSelection=()=>generationProjectMarkers.classed('is-selected',false);
    const clearPtsPotentialSelection=()=>ptsPotentialMarkers.classed('is-selected',false);
    const clearNonElectricSelection=()=>{nonElectricRoutes.classed('is-selected',false);nonElectricFacilityMarkers.classed('is-selected',false);importOriginVessel.classed('is-selected',false);renewableImportOriginVessel.classed('is-selected',false)};
    const clearNetworkSelection=()=>{networkNodes.classed('is-selected',false);importGateways.classed('is-selected',false)};
    const defaultDetail=()=>{detail.innerHTML=`<h4>Infraestructura energética cartografiada</h4><p class="map-detail-lead">Selecciona una instalación, un proyecto, una zona PTS, una población, un nodo o un trazado para consultar sus datos.</p><dl><dt>Emplazamientos eléctricos en servicio</dt><dd>${formatNumber(totals.points,0)}</dd><dt>Potencia eléctrica en servicio</dt><dd>${formatNumber(totals.mw,1)} MW</dd><dt>Proyectos de generación</dt><dd>${formatNumber(generationProjectDefinitions.length,0)} autorizados o en obra</dd><dt>Zonas potenciales PTS</dt><dd>${formatNumber(ptsPotentialRecords.length,0)} oportunidades territoriales</dd><dt>Infraestructura de gas y petróleo</dt><dd>${formatNumber(fossilFacilityRecords.length,0)} instalaciones y ${formatNumber(nonElectricRouteRecords.length,0)} conducciones principales</dd><dt>Combustibles renovables</dt><dd>${formatNumber(renewableFuelFacilityRecords.length,0)} instalaciones</dd><dt>Biomasa no eléctrica</dt><dd>${formatNumber(biomassEnergy,1)} GWh en 2024; ${formatNumber(biomassFacilityRecords.length,0)} referencias cartografiadas</dd><dt>Población ${populationYear}</dt><dd>${formatNumber(populationTotal,0)} habitantes</dd><dt>Red eléctrica</dt><dd>132, 220 y 400 kV</dd><dt>Nodos eléctricos exteriores</dt><dd>${formatNumber(INTERCONNECTION_NODES.length,0)}</dd><dt>Inventario</dt><dd>${escapeHtml(nonElectricInfrastructure?.updated||ptsPotentialSites?.updated||generationProjects?.updated||electricProjects?.updated||'2026')}</dd></dl><p class="map-data-note">Gas y petróleo se muestran en gris. Los combustibles renovables se muestran en marrón y la biomasa térmica en marrón claro. EVE contabiliza más de 3.000 instalaciones térmicas; sus tres puntos son referencias significativas, no el inventario completo.</p><span class="map-source-badge">Red Eléctrica / ESIOS · GeoEuskadi · PTS · EVE · Enagás · BBG · Petronor · Exolum</span>`;refreshDetailActions()};
    const showDetail=d=>{
      clearNonElectricSelection();
      markers.classed('is-selected',candidate=>candidate===d);
      populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();
      const digits=d.mw<.1?3:d.mw<10?2:1,groupNote=d.units>1?`Este punto agrupa ${formatNumber(d.units,0)} instalaciones.`:'Este punto corresponde a una instalación.';
      const isPetronor=/^PETRONOR 1$/i.test(d.properties.descripcion||''),connectionNote=isPetronor?'Petronor no conecta directamente con las líneas de 400 kV. La documentación oficial sitúa su enlace en 132 kV hacia ST Petronor y ST Abanto/Mantrés; las líneas de 400 kV terminan correctamente en esta última.':'La coordenada procede del inventario de generación y no representa necesariamente la posición exacta de la subestación o del punto de conexión.';
      const media=mediaForRecord(d),orthophotoWarning='Imagen centrada en la coordenada registral; puede representar una ubicación aproximada o varias unidades agrupadas.';
      const imageMarkup=`<img src="${escapeHtml(media.src)}" data-orthophoto="${escapeHtml(media.orthophoto)}" data-using-orthophoto="${media.isOrthophoto}" alt="${escapeHtml(media.alt)}" loading="lazy" decoding="async">`,linkedImageMarkup=media.linkUrl?`<a class="installation-photo-link" href="${escapeHtml(media.linkUrl)}" target="_blank" rel="noopener" title="Abrir el artículo de Zientzia.eus">${imageMarkup}</a>`:imageMarkup;
      const cogenFuelMarkup=d.key==='cogen'?`<dt>Clase de combustible</dt><dd><span class="cogen-fuel-detail cogen-fuel-${d.cogenFuelClass}">${escapeHtml(COGEN_FUEL_CLASSES[d.cogenFuelClass].label)}</span></dd>`:'',cogenFuelNote=d.key==='cogen'?`<p class="map-data-note"><strong>Clasificación del combustible.</strong> ${escapeHtml(d.cogenEvidence.note)}</p><span class="map-source-badge"><a href="${escapeHtml(d.cogenEvidence.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(d.cogenEvidence.sourceLabel)}</a></span>`:'';
      detail.innerHTML=`<h4>${escapeHtml(d.properties.descripcion||'Instalación de producción')}</h4><p class="map-detail-lead">${groupNote}</p><dl><dt>Tecnología</dt><dd>${TECHNOLOGIES[d.key].label}</dd>${cogenFuelMarkup}<dt>Municipio</dt><dd>${escapeHtml(cleanMunicipality(d.properties.municipio))}</dd><dt>Potencia</dt><dd>${formatNumber(d.mw,digits)} MW</dd><dt>Instalaciones</dt><dd>${formatNumber(d.units,0)}</dd><dt>Área / huella</dt><dd class="map-area">${areaMarkup(d)}</dd><dt>Registro</dt><dd>${escapeHtml(d.properties.minetur||'No indicado')}</dd><dt>Actualización</dt><dd>${dateLabel(d.properties.fecha_mod)}</dd></dl><p class="map-data-note">${connectionNote}</p><span class="map-source-badge">Red Eléctrica / ESIOS</span>${cogenFuelNote}<figure class="installation-photo">${linkedImageMarkup}${media.expandable?'<button type="button" class="installation-photo-expand">Ampliar imagen</button>':''}<figcaption>${media.caption}</figcaption>${media.isOrthophoto?`<span class="installation-photo-warning">${orthophotoWarning}</span>`:''}</figure>`;
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
      const capacityUnit=d.isFuture?'MW':'MVA',circuitCapacity=d.capacityCircuits.map(([name,capacity])=>`${escapeHtml(name)}: <strong>${formatNumber(capacity,0)} ${capacityUnit}</strong>`).join('<br>'),capacityNote=d.capacityNote?` ${escapeHtml(d.capacityNote)}`:'',reference=d.isFuture?'Puesta en servicio prevista a comienzos de 2028':'Invierno de 2024',sourceUrl=d.isFuture?'https://www.inelfe.eu/es/proyectos/golfo-de-bizkaia':REE_TRANSPORT_CAPACITY_2024,sourceLabel=d.isFuture?'INELFE · interconexión Golfo de Bizkaia':'Red Eléctrica · calidad de servicio de la red de transporte 2024';
      detail.innerHTML=`<h4>${escapeHtml(d.name)}</h4><p class="map-detail-lead">${d.isFuture?'Futura puerta submarina de intercambio eléctrico con Francia; la flecha discontinua indica que está en construcción.':'Nodo de interconexión exterior: puede canalizar electricidad tanto de entrada como de salida.'}</p><dl>${d.isFuture?`<dt>Estado</dt><dd>${escapeHtml(d.statusLabel)}</dd>`:''}<dt>Tensión</dt><dd>${escapeHtml(d.voltage)}</dd><dt>Conecta con</dt><dd>${escapeHtml(d.territory)}</dd><dt>Conexiones cartografiadas</dt><dd>${d.links.map(escapeHtml).join('<br>')}</dd><dt>Capacidad nominal</dt><dd>${formatNumber(d.capacityTotalMVA,0)} ${capacityUnit}</dd><dt>Capacidad por enlace</dt><dd>${circuitCapacity}</dd><dt>Referencia</dt><dd>${reference}</dd><dt>Sentido del flujo</dt><dd>Bidireccional y variable</dd><dt>Energía importada por el nodo</dt><dd>No publicada de forma desagregada</dd></dl><p class="map-data-note">${d.isFuture?'La capacidad nominal no equivale a una importación continua ni permite calcular por sí sola la energía anual en GWh.':'Los MVA expresan la capacidad aparente de las líneas, no la energía anual que entra en GWh ni un flujo real fijo en MW. Su suma es una referencia física, no una capacidad simultánea garantizada: las restricciones y el criterio de seguridad N-1 pueden reducir el intercambio efectivo.'}${capacityNote}</p><span class="map-source-badge"><a href="${sourceUrl}" target="_blank" rel="noopener">${sourceLabel}</a></span>`;refreshDetailActions();
    };
    const showProjectDetail=project=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearGenerationProjectSelection();clearPtsPotentialSelection();
      projectPaths.classed('is-selected',record=>record.project===project);projectMarkers.classed('is-selected',record=>record.project===project);
      const statusNote=project.status==='authorized'?'Dispone de autorización administrativa de construcción, pero esa resolución no acredita que las obras hayan comenzado.':'El inicio de las obras ha sido confirmado por una fuente oficial.';
      detail.innerHTML=`<h4>${escapeHtml(project.name)}</h4><p class="map-detail-lead">${escapeHtml(project.kind||'Actuación sobre la red eléctrica')}</p><dl><dt>Estado</dt><dd>${escapeHtml(project.statusLabel)}</dd><dt>Tensión</dt><dd>${escapeHtml(project.voltage||'No indicada')}</dd><dt>Actuación</dt><dd>${escapeHtml(project.scope||'No indicada')}</dd><dt>Representación</dt><dd>${escapeHtml(project.geometryNote||'Localización cartográfica orientativa')}</dd></dl><p class="map-data-note">${statusNote}</p><span class="map-source-badge"><a href="${escapeHtml(project.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(project.sourceLabel||'Fuente oficial')}</a></span>`;refreshDetailActions();
    };
    const showGenerationProjectDetail=project=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearPtsPotentialSelection();
      generationProjectMarkers.classed('is-selected',candidate=>candidate===project);
      const statusNote=project.status==='construction'?'El comienzo de las obras consta en una fuente oficial. El proyecto todavía no se contabiliza como potencia en servicio.':project.status==='construction-authorized'?'La autorización administrativa de construcción permite ejecutar el proyecto, pero no demuestra que las obras hayan comenzado.':'La autorización administrativa previa aprueba las características esenciales. Antes de construir necesita también autorización administrativa de construcción.';
      const sourceLinks=(project.sources||[{label:project.sourceLabel,url:project.sourceUrl}]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · ');
      const powerLabel=project.mwp&&Math.abs(project.mwp-project.mw)>.05?`${formatNumber(project.mw,project.mw<10?1:0)} MW nominales · ${formatNumber(project.mwp,project.mwp<10?2:1)} MWp`:`${formatNumber(project.mw,project.mw<10?1:0)} MW`;
      const projectOrthophoto=orthophotoUrl(project.coordinate);
      const productionEstimate=Number(project.annualGWhEstimate)>0?`<dt>Producción anual estimada</dt><dd>${formatNumber(project.annualGWhEstimate,1)} GWh/año</dd><dt>Método de estimación</dt><dd>${escapeHtml(project.annualGWhMethod||'No indicado')}</dd><dt>Entrada en el modelo</dt><dd>50 % en ${formatNumber(project.modelFirstYear,0)} · 100 % desde ${formatNumber(project.modelFullYear,0)}</dd>`:'';
      detail.innerHTML=`<h4>${escapeHtml(project.name)}</h4><p class="map-detail-lead">Proyecto de ${escapeHtml(TECHNOLOGIES[project.key].label.toLowerCase())}; círculo rayado del mismo color tecnológico.</p><dl><dt>Estado</dt><dd>${escapeHtml(project.statusLabel)}</dd><dt>Fecha de la resolución</dt><dd>${escapeHtml(project.approvalDate||'No indicada')}</dd><dt>Potencia</dt><dd>${powerLabel}</dd>${productionEstimate}<dt>Municipios</dt><dd>${project.municipalities.map(escapeHtml).join(', ')}</dd>${project.area?`<dt>Superficie</dt><dd>${escapeHtml(project.area)}</dd>`:''}<dt>Representación</dt><dd>${escapeHtml(project.locationNote||'Punto representativo del ámbito documentado')}</dd></dl><p class="map-data-note">${statusNote}${project.note?` ${escapeHtml(project.note)}`:''}</p><span class="map-source-badge">${sourceLinks}</span><figure class="installation-photo"><img src="${escapeHtml(projectOrthophoto)}" alt="Vista aérea del ámbito de ${escapeHtml(project.name)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption()}</figcaption><span class="installation-photo-warning">La imagen muestra el ámbito de referencia, no una planta necesariamente construida.</span></figure>`;
      refreshDetailActions();
      const projectImage=detail.querySelector('.installation-photo img');
      projectImage?.addEventListener('error',()=>{const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Vista aérea no disponible en este momento.';projectImage.replaceWith(unavailable)});
    };
    const showPtsPotentialDetail=site=>{
      clearNonElectricSelection();
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();
      ptsPotentialMarkers.classed('is-selected',candidate=>candidate===site);
      const sourceLinks=(site.sources||ptsPotentialSites?.sources||[]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · '),siteOrthophoto=orthophotoUrl(site.coordinate);
      const production=Number(site.annualGWhEstimate)>0?`<dt>Producción anual orientativa</dt><dd>${formatNumber(site.annualGWhEstimate,1)} GWh/año</dd><dt>Método de producción</dt><dd>${escapeHtml(site.annualGWhMethod||'No indicado')}</dd>`:`<dt>Producción anual</dt><dd>No estimada</dd><dt>Motivo</dt><dd>${escapeHtml(site.annualGWhMethod||'No existe una tecnología de referencia suficientemente definida.')}</dd>`;
      detail.innerHTML=`<h4>${escapeHtml(site.name)}</h4><p class="map-detail-lead">Zona de Localización Seleccionada (ZLS) del PTS: oportunidad territorial, no proyecto autorizado ni instalación comprometida.</p><dl><dt>Estado</dt><dd>${escapeHtml(site.statusLabel||'Zona seleccionada por el PTS')}</dd><dt>Tecnología</dt><dd>${escapeHtml(site.technologyLabel||TECHNOLOGIES[site.key].label)}</dd><dt>Código ZLS</dt><dd>${escapeHtml(site.code||site.id||'No indicado')}</dd><dt>Potencia orientativa</dt><dd>${formatNumber(site.mw,site.mw<10?1:0)} MW</dd><dt>Carácter de la cifra</dt><dd>Estimación analítica; el PTS no asigna potencia oficial a cada zona</dd><dt>Método de potencia</dt><dd>${escapeHtml(site.potentialMWMethod||'No indicado')}</dd>${production}${Number(site.areaHa)>0?`<dt>Superficie oficial</dt><dd>${formatNumber(site.areaHa,2)} ha</dd>`:''}<dt>Municipios</dt><dd>${(site.municipalities||[]).map(escapeHtml).join(', ')||'No indicados'}</dd>${site.areaFunctional?`<dt>Área funcional</dt><dd>${escapeHtml(site.areaFunctional)}</dd>`:''}<dt>Incertidumbre</dt><dd>${escapeHtml(site.uncertainty||'No indicada')}</dd><dt>Representación</dt><dd>${escapeHtml(site.locationNote||'Punto representativo de la zona territorial')}</dd></dl><p class="map-data-note">${escapeHtml(ptsPotentialSites?.importantNote||'Una ZLS expresa aptitud territorial y no garantiza que se construya una instalación.')} La barra lateral muestra este potencial de forma exploratoria. Solo descuenta proyectos de la misma tecnología cuando estos disponen de una producción anual cuantificada; los prototipos marinos sin GWh publicados permanecen en el mapa, pero no se suman ni se descuentan.</p><span class="map-source-badge">${sourceLinks||'Gobierno Vasco · PTS de Energías Renovables'}</span><figure class="installation-photo"><img src="${escapeHtml(siteOrthophoto)}" alt="Vista aérea del ámbito aproximado de ${escapeHtml(site.name)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption()}</figcaption><span class="installation-photo-warning">La imagen se centra en el punto oficial de referencia de la ZLS; no representa una instalación proyectada.</span></figure>`;
      refreshDetailActions();
      const siteImage=detail.querySelector('.installation-photo img');
      siteImage?.addEventListener('error',()=>{const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Vista aérea no disponible en este momento.';siteImage.replaceWith(unavailable)});
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
      detail.innerHTML=`<h4>${escapeHtml(facility.name)}</h4><p class="map-detail-lead">${escapeHtml(category)}.</p><dl><dt>Estado</dt><dd>${escapeHtml(facility.statusLabel||'No indicado')}</dd><dt>Municipio / ámbito</dt><dd>${escapeHtml(facility.municipality||'No indicado')}</dd><dt>Función</dt><dd>${escapeHtml(facility.function||'No indicada')}</dd><dt>Capacidad</dt><dd>${escapeHtml(facility.capacity||'No publicada')}</dd>${area}</dl><p class="map-data-note">Esta capa representa los principales activos de entrada, transporte, almacenamiento y transformación. No incorpora la red capilar de distribución, estaciones de servicio ni todos los depósitos privados de consumo.</p><span class="map-source-badge">${sourceLinksForNonElectric(facility)}</span><figure class="installation-photo"><img src="${escapeHtml(facilityOrthophoto)}" alt="Vista aérea del emplazamiento de ${escapeHtml(facility.name)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption()}</figcaption><span class="installation-photo-warning">La ortofoto se centra en la coordenada de referencia y no delimita necesariamente toda la instalación.</span></figure>`;refreshDetailActions();
      const facilityImage=detail.querySelector('.installation-photo img');facilityImage?.addEventListener('error',()=>{const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Vista aérea no disponible en este momento.';facilityImage.replaceWith(unavailable)});
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
    let detailPinned=false;
    const handleDetailInteraction=(event,render)=>{if(event.type==='mouseenter'&&detailPinned)return;if(event.type==='click'){event.stopPropagation();detailPinned=true}render()};
    const handleDetailKeyboard=(event,render)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();detailPinned=true;render()}};
    markers.on('mouseenter focus click',(event,d)=>handleDetailInteraction(event,()=>showDetail(d))).on('keydown',(event,d)=>handleDetailKeyboard(event,()=>showDetail(d)));
    populationGroups.on('mouseenter focus click',(event,record)=>handleDetailInteraction(event,()=>showPopulationDetail(record))).on('keydown',(event,record)=>handleDetailKeyboard(event,()=>showPopulationDetail(record)));
    networkNodes.on('mouseenter focus click',(event,d)=>handleDetailInteraction(event,()=>showNetworkDetail(d))).on('keydown',(event,d)=>handleDetailKeyboard(event,()=>showNetworkDetail(d)));
    importGateways.on('mouseenter focus click',(event,d)=>handleDetailInteraction(event,()=>showNetworkDetail(d))).on('keydown',(event,d)=>handleDetailKeyboard(event,()=>showNetworkDetail(d)));
    projectPaths.on('mouseenter focus click',(event,record)=>handleDetailInteraction(event,()=>showProjectDetail(record.project))).on('keydown',(event,record)=>handleDetailKeyboard(event,()=>showProjectDetail(record.project)));
    projectMarkers.on('mouseenter focus click',(event,record)=>handleDetailInteraction(event,()=>showProjectDetail(record.project))).on('keydown',(event,record)=>handleDetailKeyboard(event,()=>showProjectDetail(record.project)));
    generationProjectMarkers.on('mouseenter focus click',(event,project)=>handleDetailInteraction(event,()=>showGenerationProjectDetail(project))).on('keydown',(event,project)=>handleDetailKeyboard(event,()=>showGenerationProjectDetail(project)));
    ptsPotentialMarkers.on('mouseenter focus click',(event,site)=>handleDetailInteraction(event,()=>showPtsPotentialDetail(site))).on('keydown',(event,site)=>handleDetailKeyboard(event,()=>showPtsPotentialDetail(site)));
    biscayPaths.on('mouseenter focus click',event=>handleDetailInteraction(event,showBiscayInterconnectorDetail)).on('keydown',event=>handleDetailKeyboard(event,showBiscayInterconnectorDetail));
    nonElectricRoutes.on('mouseenter focus click',(event,record)=>handleDetailInteraction(event,()=>showNonElectricRouteDetail(record))).on('keydown',(event,record)=>handleDetailKeyboard(event,()=>showNonElectricRouteDetail(record)));
    nonElectricFacilityMarkers.on('mouseenter focus click',(event,facility)=>handleDetailInteraction(event,()=>showNonElectricFacilityDetail(facility))).on('keydown',(event,facility)=>handleDetailKeyboard(event,()=>showNonElectricFacilityDetail(facility)));
    importOriginVessel.on('mouseenter focus click',event=>handleDetailInteraction(event,showImportOriginsDetail)).on('keydown',event=>handleDetailKeyboard(event,showImportOriginsDetail));
    renewableImportOriginVessel.on('mouseenter focus click',event=>handleDetailInteraction(event,showRenewableImportOriginsDetail)).on('keydown',event=>handleDetailKeyboard(event,showRenewableImportOriginsDetail));
    svg.on('click',event=>{if(event.target===svg.node()){detailPinned=false;markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();clearNonElectricSelection();defaultDetail()}});
    defaultDetail();

    const active=new Set(TECHNOLOGY_ORDER),activeCogenFuelClasses=new Set(COGEN_FUEL_CLASS_ORDER),threshold=.1;let fossilGenerationActive=true,includeSmall=true,networkVisible=false,importsVisible=false,generationProjectsVisible=false,ptsPotentialVisible=false,populationsVisible=false,nonElectricVisible=false,renewableFuelVisible=false,biomassVisible=false;
    const filterButtons=new Map(),cogenFuelButtons=new Map();
    const networkButton=document.createElement('button');networkButton.type='button';networkButton.className='map-network-toggle';networkButton.setAttribute('aria-pressed','false');networkButton.innerHTML='<i aria-hidden="true"></i>Red eléctrica · 132/220/400 kV y actuaciones';networkButton.title='Mostrar u ocultar conjuntamente las redes de 132, 220 y 400 kV, sus subestaciones y las actuaciones aprobadas o en construcción';networkButton.addEventListener('click',()=>{networkVisible=!networkVisible;updateNetworkVisibility()});
    const importButton=document.createElement('button');importButton.type='button';importButton.className='map-import-toggle';importButton.setAttribute('aria-pressed','false');importButton.innerHTML='<i aria-hidden="true"></i>Entradas de electricidad importada';importButton.title='Mostrar u ocultar las puertas exteriores por las que puede entrar electricidad a Euskadi';importButton.addEventListener('click',()=>{importsVisible=!importsVisible;updateNetworkVisibility()});
    const generationProjectButton=document.createElement('button');generationProjectButton.type='button';generationProjectButton.className='map-generation-project-toggle';generationProjectButton.setAttribute('aria-pressed','false');generationProjectButton.innerHTML='<i aria-hidden="true"></i>Generación en construcción o aprobada';generationProjectButton.title='Mostrar u ocultar los proyectos de generación con autorización formal o construcción iniciada';generationProjectButton.addEventListener('click',()=>{generationProjectsVisible=!generationProjectsVisible;updateNetworkVisibility();updateVisibility()});
    const ptsPotentialButton=document.createElement('button');ptsPotentialButton.type='button';ptsPotentialButton.className='map-pts-potential-toggle';ptsPotentialButton.setAttribute('aria-pressed','false');ptsPotentialButton.innerHTML='<i aria-hidden="true"></i>Potenciales nuevas instalaciones';ptsPotentialButton.title='Mostrar u ocultar las Zonas de Localización Seleccionada del PTS; son oportunidades territoriales, no proyectos autorizados';ptsPotentialButton.addEventListener('click',()=>{ptsPotentialVisible=!ptsPotentialVisible;updateNetworkVisibility();updateVisibility()});
    const populationButton=document.createElement('button');populationButton.type='button';populationButton.className='map-population-toggle';populationButton.setAttribute('aria-pressed','false');populationButton.innerHTML='<i aria-hidden="true"></i>Poblaciones';populationButton.title='Mostrar u ocultar las poblaciones; aparecen más nombres al acercar el mapa';populationButton.addEventListener('click',()=>{populationsVisible=!populationsVisible;updatePopulationVisibility()});
    const nonElectricButton=document.createElement('button');nonElectricButton.type='button';nonElectricButton.className='map-non-electric-toggle';nonElectricButton.setAttribute('aria-pressed','false');nonElectricButton.innerHTML='<i aria-hidden="true"></i>Infraestructura de gas y petróleo';nonElectricButton.title='Mostrar u ocultar gasoductos, almacenamiento y entrada de gas, refinería, terminales, oleoductos y poliductos';nonElectricButton.addEventListener('click',()=>{nonElectricVisible=!nonElectricVisible;updateNetworkVisibility();updateVisibility()});
    const renewableFuelButton=document.createElement('button');renewableFuelButton.type='button';renewableFuelButton.className='map-renewable-fuel-toggle';renewableFuelButton.setAttribute('aria-pressed','false');renewableFuelButton.innerHTML='<i aria-hidden="true"></i>Combustibles renovables';renewableFuelButton.title='Mostrar u ocultar las instalaciones de biocombustibles, bioGNL e hidrógeno renovable';renewableFuelButton.addEventListener('click',()=>{renewableFuelVisible=!renewableFuelVisible;updateNetworkVisibility();updateVisibility()});
    const biomassButton=document.createElement('button');biomassButton.type='button';biomassButton.className='map-biomass-toggle';biomassButton.setAttribute('aria-pressed','false');biomassButton.innerHTML='<i aria-hidden="true"></i>Biomasa no eléctrica';biomassButton.title='Mostrar instalaciones térmicas representativas y el total agregado de biomasa usada directamente para calor';biomassButton.addEventListener('click',()=>{biomassVisible=!biomassVisible;updateNetworkVisibility();updateVisibility()});
    metadata.filter(item=>!['cycle','cogen'].includes(item.key)).forEach(item=>{
      const button=document.createElement('button');button.type='button';button.className='map-filter';button.style.setProperty('--map-color',item.color);button.setAttribute('aria-pressed','true');button.innerHTML=`<i aria-hidden="true"></i>${item.label} <strong>${formatNumber(item.points,0)}</strong>`;button.title=`${formatNumber(item.points,0)} emplazamientos · ${formatNumber(item.mw,1)} MW`;
      button.addEventListener('click',()=>{active.has(item.key)?active.delete(item.key):active.add(item.key);button.setAttribute('aria-pressed',String(active.has(item.key)));updateVisibility()});
      filterButtons.set(item.key,button);
    });
    const fossilCycleRecords=records.filter(record=>record.key==='cycle'),fossilCogenRecords=records.filter(record=>record.key==='cogen'&&record.cogenFuelClass==='fossil'),fossilGenerationButton=document.createElement('button');fossilGenerationButton.type='button';fossilGenerationButton.className='map-filter map-cogen-filter cogen-fuel-fossil';fossilGenerationButton.style.setProperty('--map-color',COGEN_FUEL_CLASSES.fossil.color);fossilGenerationButton.setAttribute('aria-pressed','true');fossilGenerationButton.innerHTML=`<i aria-hidden="true"></i>Generación fósil <strong>${formatNumber(fossilCycleRecords.length+fossilCogenRecords.length,0)}</strong>`;fossilGenerationButton.title=`Ciclo combinado y cogeneración con combustible fósil verificado · ${formatNumber(fossilCycleRecords.reduce((sum,record)=>sum+record.mw,0)+fossilCogenRecords.reduce((sum,record)=>sum+record.mw,0),1)} MW`;
    fossilGenerationButton.addEventListener('click',()=>{fossilGenerationActive=!fossilGenerationActive;fossilGenerationActive?(active.add('cycle'),activeCogenFuelClasses.add('fossil')):(active.delete('cycle'),activeCogenFuelClasses.delete('fossil'));activeCogenFuelClasses.size?active.add('cogen'):active.delete('cogen');fossilGenerationButton.setAttribute('aria-pressed',String(fossilGenerationActive));updateVisibility()});cogenFuelButtons.set('fossil',fossilGenerationButton);
    COGEN_FUEL_CLASS_ORDER.filter(fuelClass=>fuelClass!=='fossil').forEach(fuelClass=>{
      const config=COGEN_FUEL_CLASSES[fuelClass],subset=records.filter(record=>record.key==='cogen'&&record.cogenFuelClass===fuelClass);if(!subset.length)return;const button=document.createElement('button');button.type='button';button.className=`map-filter map-cogen-filter cogen-fuel-${fuelClass}`;button.style.setProperty('--map-color',config.color);button.setAttribute('aria-pressed','true');button.innerHTML=`<i aria-hidden="true"></i>${config.label} <strong>${formatNumber(subset.length,0)}</strong>`;button.title=`${formatNumber(subset.length,0)} emplazamientos · ${formatNumber(subset.reduce((sum,record)=>sum+record.mw,0),1)} MW. Subgrupo del inventario agregado «Cogeneración, residuos y biomasa».`;
      button.addEventListener('click',()=>{activeCogenFuelClasses.has(fuelClass)?activeCogenFuelClasses.delete(fuelClass):activeCogenFuelClasses.add(fuelClass);activeCogenFuelClasses.size?active.add('cogen'):active.delete('cogen');button.setAttribute('aria-pressed',String(activeCogenFuelClasses.has(fuelClass)));updateVisibility()});cogenFuelButtons.set(fuelClass,button);
    });
    const smallButton=document.createElement('button');smallButton.type='button';smallButton.className='map-reset-filters';smallButton.setAttribute('aria-pressed','true');smallButton.textContent='Ocultar pequeñas < 0,1 MW';smallButton.addEventListener('click',()=>{includeSmall=!includeSmall;smallButton.setAttribute('aria-pressed',String(includeSmall));smallButton.textContent=includeSmall?'Ocultar pequeñas < 0,1 MW':'Incluir pequeñas < 0,1 MW';updateVisibility()});
    [nonElectricButton,importButton,filterButtons.get('cycle'),...COGEN_FUEL_CLASS_ORDER.map(key=>cogenFuelButtons.get(key)),renewableFuelButton,biomassButton,filterButtons.get('hydro'),filterButtons.get('wind'),filterButtons.get('solar'),filterButtons.get('other'),generationProjectButton,ptsPotentialButton,populationButton,smallButton,networkButton].filter(Boolean).forEach(button=>filters.append(button));
    const clearButton=document.createElement('button');clearButton.type='button';clearButton.className='map-reset-filters map-clear-filters';clearButton.textContent='Limpiar mapa';clearButton.title='Ocultar todas las tecnologías, instalaciones, redes y capas del mapa';clearButton.addEventListener('click',()=>{active.clear();activeCogenFuelClasses.clear();fossilGenerationActive=false;filterButtons.forEach(button=>button.setAttribute('aria-pressed','false'));cogenFuelButtons.forEach(button=>button.setAttribute('aria-pressed','false'));includeSmall=false;smallButton.setAttribute('aria-pressed','false');smallButton.textContent='Incluir pequeñas < 0,1 MW';networkVisible=false;importsVisible=false;generationProjectsVisible=false;ptsPotentialVisible=false;populationsVisible=false;nonElectricVisible=false;renewableFuelVisible=false;biomassVisible=false;detailPinned=false;markers.classed('is-selected',false);populationGroups.classed('is-selected',false);clearNetworkSelection();biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();clearPtsPotentialSelection();clearNonElectricSelection();setElectricityExpanded(false);updateNetworkVisibility();updatePopulationVisibility();updateVisibility();defaultDetail()});filters.append(clearButton);
    const resetButton=document.createElement('button');resetButton.type='button';resetButton.className='map-reset-filters';resetButton.textContent='Restablecer filtros';resetButton.addEventListener('click',()=>{TECHNOLOGY_ORDER.forEach(key=>active.add(key));COGEN_FUEL_CLASS_ORDER.forEach(key=>activeCogenFuelClasses.add(key));fossilGenerationActive=true;filterButtons.forEach(button=>button.setAttribute('aria-pressed','true'));cogenFuelButtons.forEach(button=>button.setAttribute('aria-pressed','true'));includeSmall=true;smallButton.setAttribute('aria-pressed','true');smallButton.textContent='Ocultar pequeñas < 0,1 MW';networkVisible=false;importsVisible=false;generationProjectsVisible=false;ptsPotentialVisible=false;populationsVisible=false;nonElectricVisible=false;renewableFuelVisible=false;biomassVisible=false;setElectricityExpanded(false);updateNetworkVisibility();updatePopulationVisibility();updateVisibility()});filters.append(resetButton);

    function updateNetworkVisibility(){
      const facilityIsVisible=facility=>facility.category==='renewableGas'?renewableFuelVisible:facility.category==='thermalBiomass'?biomassVisible:nonElectricVisible;
      gridLayer.style('display',networkVisible?null:'none');nodeLayer.style('display',networkVisible?null:'none');projectLayer.style('display',networkVisible?null:'none');local132Layer.style('display',networkVisible?null:'none');substationLayer.style('display',networkVisible?null:'none');verifiedSubstationLayer.style('display',networkVisible?null:'none');importGatewayLayer.style('display',importsVisible?null:'none');generationProjectLayer.style('display',generationProjectsVisible?null:'none');ptsPotentialLayer.style('display',ptsPotentialVisible?null:'none');nonElectricLayer.style('display',nonElectricVisible||renewableFuelVisible||biomassVisible?null:'none');nonElectricRoutes.style('display',nonElectricVisible?null:'none');nonElectricFacilityMarkers.style('display',facility=>facilityIsVisible(facility)?null:'none');nonElectricFacilityLeaders.style('display',facility=>facilityIsVisible(facility)?null:'none');importOriginVessel.style('display',nonElectricVisible?null:'none');renewableImportOriginVessel.style('display',renewableFuelVisible?null:'none');networkLegend.hidden=!(networkVisible||importsVisible||generationProjectsVisible||ptsPotentialVisible||nonElectricVisible||renewableFuelVisible||biomassVisible);networkButton.setAttribute('aria-pressed',String(networkVisible));importButton.setAttribute('aria-pressed',String(importsVisible));generationProjectButton.setAttribute('aria-pressed',String(generationProjectsVisible));ptsPotentialButton.setAttribute('aria-pressed',String(ptsPotentialVisible));nonElectricButton.setAttribute('aria-pressed',String(nonElectricVisible));renewableFuelButton.setAttribute('aria-pressed',String(renewableFuelVisible));biomassButton.setAttribute('aria-pressed',String(biomassVisible));energyShareBar.classList.toggle('is-non-electric-visible',nonElectricVisible);energyShareBar.classList.toggle('is-renewable-fuel-visible',renewableFuelVisible);energyShareBar.classList.toggle('is-biomass-visible',biomassVisible);
      networkLegend.querySelectorAll('[data-layer="grid"]').forEach(item=>item.hidden=!networkVisible);networkLegend.querySelectorAll('[data-layer="imports"]').forEach(item=>item.hidden=!importsVisible);networkLegend.querySelectorAll('[data-layer="generation-projects"]').forEach(item=>item.hidden=!generationProjectsVisible);networkLegend.querySelectorAll('[data-layer="pts-potentials"]').forEach(item=>item.hidden=!ptsPotentialVisible);networkLegend.querySelectorAll('[data-layer="non-electric"]').forEach(item=>item.hidden=!nonElectricVisible);networkLegend.querySelectorAll('[data-layer="renewable-fuels"]').forEach(item=>item.hidden=!renewableFuelVisible);networkLegend.querySelectorAll('[data-layer="thermal-biomass"]').forEach(item=>item.hidden=!biomassVisible);
      if(!networkVisible&&(biscayPaths.filter('.is-selected').node()||projectPaths.filter('.is-selected').node()||projectMarkers.filter('.is-selected').node())){biscayPaths.classed('is-selected',false);clearProjectSelection();defaultDetail()}
      if(!networkVisible&&!importsVisible&&(networkNodes.filter('.is-selected').node()||importGateways.filter('.is-selected').node())){clearNetworkSelection();defaultDetail()}
      if(!generationProjectsVisible&&generationProjectMarkers.filter('.is-selected').node()){clearGenerationProjectSelection();defaultDetail()}
      if(!ptsPotentialVisible&&ptsPotentialMarkers.filter('.is-selected').node()){clearPtsPotentialSelection();defaultDetail()}
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
      const visible=records.filter(d=>active.has(d.key)&&(d.key!=='cogen'||activeCogenFuelClasses.has(d.cogenFuelClass))&&(includeSmall||d.mw>=threshold)),visibleSet=new Set(visible);
      markers.style('display',d=>visibleSet.has(d)?null:'none');
      const visibleGenerationProjects=generationProjectRecords.filter(project=>active.has(project.key)),visibleGenerationProjectSet=new Set(visibleGenerationProjects);generationProjectMarkers.style('display',project=>visibleGenerationProjectSet.has(project)?null:'none');
      const visiblePtsPotentials=ptsPotentialRecords.filter(site=>active.has(site.key)),visiblePtsPotentialSet=new Set(visiblePtsPotentials);ptsPotentialMarkers.style('display',site=>visiblePtsPotentialSet.has(site)?null:'none');
      const units=visible.reduce((a,d)=>a+d.units,0),mw=visible.reduce((a,d)=>a+d.mw,0);
      count.textContent=`${formatNumber(visible.length,0)} emplazamientos · ${formatNumber(units,0)} instalaciones · ${formatNumber(mw,1)} MW en servicio visibles${generationProjectsVisible?` · ${formatNumber(visibleGenerationProjects.length,0)} proyectos (${formatNumber(visibleGenerationProjects.reduce((sum,project)=>sum+project.mw,0),1)} MW)`:''}${ptsPotentialVisible?` · ${formatNumber(visiblePtsPotentials.length,0)} ZLS PTS (${formatNumber(visiblePtsPotentials.reduce((sum,site)=>sum+site.mw,0),1)} MW orientativos)`:''}${nonElectricVisible?` · ${formatNumber(fossilFacilityRecords.length,0)} instalaciones y ${formatNumber(nonElectricRouteRecords.length,0)} conducciones de gas y petróleo`:''}${renewableFuelVisible?` · ${formatNumber(renewableFuelFacilityRecords.length,0)} instalaciones de combustibles renovables`:''}${biomassVisible?` · ${formatNumber(biomassFacilityRecords.length,0)} referencias de biomasa térmica (inventario no exhaustivo)`:''}`;
      const selectedNode=markers.filter('.is-selected').node(),selected=selectedNode?selectedNode.__data__:null;
      if(selected&&!visibleSet.has(selected)){markers.classed('is-selected',false);defaultDetail()}
      const selectedProjectNode=generationProjectMarkers.filter('.is-selected').node(),selectedProject=selectedProjectNode?selectedProjectNode.__data__:null;if(selectedProject&&!visibleGenerationProjectSet.has(selectedProject)){clearGenerationProjectSelection();defaultDetail()}
      const selectedPtsNode=ptsPotentialMarkers.filter('.is-selected').node(),selectedPts=selectedPtsNode?selectedPtsNode.__data__:null;if(selectedPts&&!visiblePtsPotentialSet.has(selectedPts)){clearPtsPotentialSelection();defaultDetail()}
      updateEnergyShare();
    }

    function updateEnergyShare(){
      const potentialKeys=['wind','solar','other'],rawFutureEnergy=Object.values(futureBarTechnologyEnergy).reduce((sum,value)=>sum+value,0),futureScale=rawFutureEnergy?Math.min(1,importedElectricEnergyBase/rawFutureEnergy):0,projectEnergyByTechnology=Object.fromEntries(potentialKeys.map(key=>[key,generationProjectsVisible&&active.has(key)?(futureBarTechnologyEnergy[key]||0)*futureScale:0])),futureEnergy=Object.values(projectEnergyByTechnology).reduce((sum,value)=>sum+value,0),importedAfterProjects=Math.max(0,importedElectricEnergyBase-futureEnergy),cycleEnergyBase=barTechnologyEnergy.cycle||0;
      const rawPtsResidualByTechnology=Object.fromEntries(potentialKeys.map(key=>[key,ptsPotentialVisible&&active.has(key)?Math.max(0,(ptsPotentialBarTechnologyEnergy[key]||0)-(generationProjectsVisible?(futureBarTechnologyEnergy[key]||0):0)):0])),rawPtsResidualEnergy=Object.values(rawPtsResidualByTechnology).reduce((sum,value)=>sum+value,0),ptsAvailableEnergy=cycleEnergyBase+importedAfterProjects,ptsScale=rawPtsResidualEnergy?Math.min(1,ptsAvailableEnergy/rawPtsResidualEnergy):0,ptsEnergyByTechnology=Object.fromEntries(potentialKeys.map(key=>[key,rawPtsResidualByTechnology[key]*ptsScale])),ptsEnergy=Object.values(ptsEnergyByTechnology).reduce((sum,value)=>sum+value,0),cycleDisplacement=Math.min(cycleEnergyBase,ptsEnergy),ptsImportDisplacement=Math.max(0,ptsEnergy-cycleDisplacement),displayedElectricEnergy=electricEnergy;
      importedElectricEnergy=Math.max(0,importedAfterProjects-ptsImportDisplacement);displayedElectricShare=electricShare;displayedNonElectricShare=nonElectricShare;let selectedEnergy=0;
      barTechnologyKeys.forEach(key=>{
        const segment=energyShare.querySelector(`[data-technology="${key}"]`),isActive=isBarTechnologyActive(key),energy=barTechnologyEnergy[key],displayEnergy=key==='cycle'?Math.max(0,energy-cycleDisplacement):energy;
        if(!segment)return;
        segment.classList.toggle('is-inactive',!isActive);segment.style.flex=String(displayEnergy);
        const smallNote=key==='solar'?` · pequeña solar: ${formatNumber(smallBarTechnologyEnergy.solar,1)} GWh estimados (${formatNumber(smallCapacityByTechnology.solar,2)} MW)`:'';
        segment.title=`${barTechnologyLabels[key]}${isActive?'':' (capa oculta)'}: ${formatNumber(displayEnergy,key==='other'?3:0)} GWh · ${formatNumber(electricEnergy?100*displayEnergy/electricEnergy:0,key==='other'?3:1)} % de la electricidad${key==='cycle'?` · ${formatNumber(Math.min(displayEnergy,cogenEstimatedRenewableWithinFossil*deliveryFactor),0)} GWh renovables estimados de instalaciones mixtas`:''}${key==='cycle'&&cycleDisplacement?` · ${formatNumber(cycleDisplacement,0)} GWh sustituidos por el potencial PTS visible`:''}${smallNote}`;
        if(isActive)selectedEnergy+=key==='solar'&&!includeSmall?Math.max(0,displayEnergy-smallBarTechnologyEnergy.solar):displayEnergy;
      });
      ['wind','solar'].forEach(key=>{
        const segment=energyShare.querySelector(`[data-future-technology="${key}"]`),energy=projectEnergyByTechnology[key]||0;
        if(!segment)return;
        const isVisible=generationProjectsVisible&&active.has(key);segment.hidden=!isVisible;
        segment.style.flex=String(energy);
        const summary=segment.querySelector(`[data-future-summary="${key}"]`);if(summary)summary.textContent=`${formatNumber(energy,0)} GWh potenciales · ${formatNumber(futureCapacityByTechnology[key],1)} MW`;
        segment.title=`${barTechnologyLabels[key]} en construcción o aprobada: ${formatNumber(futureCapacityByTechnology[key],1)} MW · ${formatNumber(energy,0)} GWh/año finales estimados con producción publicada o recurso local · ${formatNumber(futureProjectCountByTechnology[key],0)} proyectos`;
        if(isVisible)selectedEnergy+=energy;
      });
      ['wind','solar','other'].forEach(key=>{
        const segment=energyShare.querySelector(`[data-pts-potential-technology="${key}"]`),energy=ptsEnergyByTechnology[key]||0,rawResidual=rawPtsResidualByTechnology[key]||0;
        if(!segment)return;
        const isVisible=ptsPotentialVisible&&active.has(key)&&rawResidual>0;segment.hidden=!isVisible;segment.style.flex=String(energy);
        const deductedProjectEnergy=generationProjectsVisible&&(futureBarTechnologyEnergy[key]||0)>0,residualCapacity=Math.max(0,(ptsPotentialCapacityByTechnology[key]||0)-(deductedProjectEnergy?(futureCapacityByTechnology[key]||0):0)),summary=segment.querySelector(`[data-pts-potential-summary="${key}"]`);if(summary)summary.textContent=`${formatNumber(energy,key==='other'?2:0)} GWh en la barra · ${formatNumber(residualCapacity,0)} MW orientativos${deductedProjectEnergy?' restantes tras descontar proyectos':''}`;
        const officialShare=ptsPotentialFinalShareIncreaseByTechnology[key],basis=Number.isFinite(officialShare)&&officialShare>0?`incremento agregado oficial de +${formatNumber(officialShare,1)} puntos del consumo final`:'producción anual orientativa agregada de las ZLS';
        const marineNote=key==='other'?' Referencia 3E2030 de 60 MW y producción estimada con el factor de capacidad observado en Mutriku en 2024; es una hipótesis de alta incertidumbre, no una contribución oficial del PTS. Los prototipos marinos sin producción anual publicada no se suman ni se descuentan de esta barra.':'';
        segment.title=`Potencial PTS de ${barTechnologyLabels[key].toLowerCase()}: ${formatNumber(ptsPotentialCapacityByTechnology[key],0)} MW agregados · base de la barra: ${basis}. El PTS no asigna potencia oficial a cada zona.${marineNote} El conjunto del potencial sustituye primero generación fósil y después electricidad importada.${deductedProjectEnergy?' Para evitar doble conteo se descuenta la energía de los proyectos autorizados o en obra.':''}${ptsScale<1?' La representación se limita a la generación fósil y la importación desplazables en la base 2024.':''}`;
        if(isVisible)selectedEnergy+=energy;
      });
      const importedSegment=energyShare.querySelector('.map-energy-share-imported'),bar=energyShare.querySelector('.map-energy-share-bar'),basisLabel=energyShare.querySelector('[data-energy-share-basis]');
      if(restShareBlock)restShareBlock.style.flex=String(displayedNonElectricShare);if(electricShareBlock)electricShareBlock.style.flex=String(displayedElectricShare);if(restShareStrong)restShareStrong.textContent=`${formatNumber(displayedNonElectricShare,1)} %`;updateExpansionControls();energyShare.setAttribute('aria-label',`Consumo final energético de Euskadi: ${formatNumber(displayedElectricShare,1)} % electricidad y ${formatNumber(displayedNonElectricShare,1)} % energía no eléctrica, principalmente petróleo y gas natural`);
      if(importedSegment){importedSegment.style.flex=String(importedElectricEnergy);importedSegment.classList.toggle('is-inactive',!importsVisible);importedSegment.title=`Electricidad importada${importsVisible?'':' (capa de entradas oculta)'}: ${formatNumber(importedElectricEnergy,0)} GWh · ${formatNumber(displayedElectricEnergy?100*importedElectricEnergy/displayedElectricEnergy:0,1)} % de la electricidad · atribución 2024: ${formatNumber(importRenewableShare,1)} % renovable y ${formatNumber(importNonRenewableShare,1)} % no renovable${generationProjectsVisible?' · reducida por el potencial anual estimado de los proyectos solares y eólicos autorizados o en construcción':''}${ptsPotentialVisible?' · reducida además por el potencial territorial PTS visible, sin doble contabilizar los proyectos':''}`}
      if(basisLabel)basisLabel.textContent=generationProjectsVisible&&ptsPotentialVisible?'Base 2024 + proyectos + potencial PTS':generationProjectsVisible?'Base 2024 + proyectos':ptsPotentialVisible?'Base 2024 + potencial PTS':'2024';
      if(bar){bar.classList.toggle('is-small-hidden',!includeSmall);bar.setAttribute('aria-label',`Electricidad: ${formatNumber(displayedElectricShare,1)} % del consumo final. Energía no eléctrica: ${formatNumber(displayedNonElectricShare,1)} %. ${nonElectricVisible?'La franja gris identifica la infraestructura de gas y petróleo.':'La capa de gas y petróleo está oculta.'} ${renewableFuelVisible?`La franja marrón identifica ${formatNumber(renewableFuelEnergy,1)} GWh de combustibles renovables, equivalentes al ${formatNumber(renewableFuelShare,2)} % del consumo final.`:'La capa de combustibles renovables está oculta.'} ${biomassVisible?`La franja marrón claro identifica ${formatNumber(biomassEnergy,1)} GWh de biomasa no eléctrica, equivalentes al ${formatNumber(biomassShare,2)} % del consumo final.`:'La capa de biomasa no eléctrica está oculta.'} Las capas de generación visibles representan ${formatNumber(selectedEnergy,0)} GWh; la capa de entradas de electricidad importada ${importsVisible?'muestra':'oculta'} ${formatNumber(importedElectricEnergy,0)} GWh importados, atribuidos en 2024 en un ${formatNumber(importRenewableShare,1)} % a renovables y un ${formatNumber(importNonRenewableShare,1)} % a fuentes no renovables.${generationProjectsVisible?` Los proyectos solares y eólicos visibles añaden ${formatNumber(futureEnergy,0)} GWh potenciales y reducen importación.`:''}${ptsPotentialVisible?` Las ZLS del PTS añaden visualmente ${formatNumber(ptsEnergy,0)} GWh de potencial territorial; sustituyen primero ${formatNumber(cycleDisplacement,0)} GWh de ciclo combinado y después ${formatNumber(ptsImportDisplacement,0)} GWh de importación. Los proyectos ya representados se descuentan para evitar doble conteo. Esta exploración no modifica las proyecciones del modelo.`:''}`)}
    }
    updateNetworkVisibility();
    updatePopulationVisibility();
    updateVisibility();
  };
})();
