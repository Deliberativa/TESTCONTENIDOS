(()=>{
  let mapInstanceSequence=0;
  const scriptBase=new URL('./',document.currentScript?.src||location.href);
  let offlineBundlePromise=null;
  const ensureOfflineBundle=()=>{
    if(window.energyMapPtsOfflineData)return Promise.resolve(window.energyMapPtsOfflineData);
    if(!offlineBundlePromise)offlineBundlePromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=new URL('data/pts-map-offline-bundle.js?v=20261112b',scriptBase).href;
      script.onload=()=>window.energyMapPtsOfflineData?resolve(window.energyMapPtsOfflineData):reject(Error('Respaldo cartográfico local vacío'));
      script.onerror=()=>reject(Error('No se ha podido cargar el respaldo cartográfico local'));
      document.head.append(script);
    }).catch(error=>{offlineBundlePromise=null;throw error;});
    return offlineBundlePromise;
  };
  const loadGeoJson=async(file,version)=>{
    if(location.protocol==='file:'){
      const bundle=await ensureOfflineBundle();
      if(!bundle[file])throw Error(`Capa no incluida en el respaldo local: ${file}`);
      return bundle[file];
    }
    const response=await fetch(`assets/data/${file}?v=${version}`);
    if(!response.ok)throw Error(file);
    const data=await response.json();
    if(data?.type!=='FeatureCollectionChunks')return data;
    const chunks=await Promise.all(data.chunks.map(async chunk=>{
      const chunkResponse=await fetch(`assets/data/${chunk}?v=${version}`);
      if(!chunkResponse.ok)throw Error(chunk);
      return chunkResponse.json();
    }));
    return {type:'FeatureCollection',features:chunks.flatMap(chunk=>chunk.features||[])};
  };
  const layers=[
    {id:'contours',file:'pts-map/contours-200m-2026.geojson',kind:'contours',tech:'Curvas de nivel'},
    {id:'wind-resource',kind:'wind-resource',tech:'Recurso eólico'},
    {id:'aptitude-wind-high',file:'pts-map/APTITUD_EOLICA_2026.geojson',kind:'aptitude',tech:'Eólica',aptitudeValue:'ALTA'},
    {id:'aptitude-wind-medium',file:'pts-map/APTITUD_EOLICA_2026.geojson',kind:'aptitude',tech:'Eólica',aptitudeValue:'MEDIA'},
    {id:'aptitude-wind-low',file:'pts-map/APTITUD_EOLICA_2026.geojson',kind:'aptitude',tech:'Eólica',aptitudeValue:'BAJA'},
    {id:'aptitude-wind-very-low',file:'pts-map/APTITUD_EOLICA_2026.geojson',kind:'aptitude',tech:'Eólica',aptitudeValue:'MUY BAJA'},
    {id:'aptitude-solar-high',file:'pts-map/APTITUD_FOTOVOLTAICA_2026.geojson',kind:'aptitude',tech:'Fotovoltaica',aptitudeValue:'ALTA'},
    {id:'aptitude-solar-medium',file:'pts-map/APTITUD_FOTOVOLTAICA_2026.geojson',kind:'aptitude',tech:'Fotovoltaica',aptitudeValue:'MEDIA'},
    {id:'aptitude-solar-low',file:'pts-map/APTITUD_FOTOVOLTAICA_2026.geojson',kind:'aptitude',tech:'Fotovoltaica',aptitudeValue:'BAJA'},
    {id:'aptitude-solar-very-low',file:'pts-map/APTITUD_FOTOVOLTAICA_2026.geojson',kind:'aptitude',tech:'Fotovoltaica',aptitudeValue:'MUY BAJA'},
    {id:'exclusion-wind',file:'pts-map/ZONAS_DE_EXCLUSION_EOLICA_2026.geojson',kind:'exclusion',tech:'Eólica'},
    {id:'exclusion-solar',file:'pts-map/ZONAS_DE_EXCLUSION_FOTOVOLTAICA_2026.geojson',kind:'exclusion',tech:'Fotovoltaica'},
    {id:'zls-wind',file:'pts-map/ZONAS_DE_LOCALIZACION_SELECCIONADA_EOLICA_2026.geojson',kind:'zls',tech:'Eólica'},
    {id:'zls-solar',file:'pts-map/ZONAS_DE_LOCALIZACION_SELECCIONADA_FOTOVOLTAICA_2026.geojson',kind:'zls',tech:'Fotovoltaica'},
    {id:'existing-wind',file:'existing-wind-installations-2025.geojson',kind:'existing-wind',tech:'Eólica existente'},
    {id:'approved-wind',file:'approved-wind-areas-2026.geojson',kind:'generation-area',stage:'approved',tech:'Eólica',color:'#54a7cf'},
    {id:'pipeline-wind',file:'pipeline-wind-areas-2026.geojson',kind:'generation-area',stage:'pipeline',tech:'Eólica',color:'#176f9f'},
    {id:'existing-solar',kind:'generation-area',stage:'existing',tech:'Fotovoltaica',color:'#7a5c00'},
    {id:'approved-solar',kind:'generation-area',stage:'approved',tech:'Fotovoltaica',color:'#c07600'},
    {id:'pipeline-solar',kind:'generation-area',stage:'pipeline',tech:'Fotovoltaica',color:'#d95721'},
    {id:'rejected-solar',kind:'generation-area',stage:'rejected',tech:'Fotovoltaica',color:'#8d3d4b'},
    {id:'artificialized',file:'udalplan-artificialized-2024.geojson',kind:'artificialized',tech:'Suelo artificializado'},
    {id:'urban',file:'udalplan-urban-2024.geojson',kind:'urban',tech:'Suelo urbano'},
    {id:'roads',file:'bta-main-roads-2025.geojson',kind:'roads',tech:'Carreteras principales'},
  ];

  const windGeometry=geometry=>geometry?.type==='Polygon'
    ? {...geometry,coordinates:geometry.coordinates.map(ring=>[...ring].reverse())}
    : geometry?.type==='MultiPolygon'
      ? {...geometry,coordinates:geometry.coordinates.map(polygon=>polygon.map(ring=>[...ring].reverse()))}
      : geometry;
  const windCollection=collection=>({...collection,features:collection.features.map(feature=>({...feature,geometry:windGeometry(feature.geometry)}))});
  const solarAptitudeColors={ALTA:'#742313',MEDIA:'#d86622',BAJA:'#e5a72b','MUY BAJA':'#f2d985'};
  const windAptitudeColors={ALTA:'#032a4d',MEDIA:'#167f98',BAJA:'#55b8ad','MUY BAJA':'#c7e8da'};
  const aptitudeColor=(value,tech)=>(tech==='Eólica'?windAptitudeColors:solarAptitudeColors)[String(value||'').toUpperCase()]||'#7fa58f';
  const aptitudeScaleMarkup=(label,colors)=>`<strong>${label}</strong><span><i style="background:${colors.ALTA}"></i>Alta</span><span><i style="background:${colors.MEDIA}"></i>Media</span><span><i style="background:${colors.BAJA}"></i>Baja</span><span><i style="background:${colors['MUY BAJA']}"></i>Muy baja</span>`;
  const SOLAR_EQUIVALENT_HA_PER_MW=1.35;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const formatNumber=(value,digits=1)=>Number(value).toLocaleString('es-ES',{minimumFractionDigits:0,maximumFractionDigits:digits});
  const SELF_CONSUMPTION_DIRECT_2050_GWH=1427.4813601453334;
  const ELECTRICITY_SERVICE_2050_GWH=18745.5996;
  const FINAL_ENERGY_2050_GWH=ELECTRICITY_SERVICE_2050_GWH/.52;
  const REGISTERED_FINAL_ENERGY_2050_GWH=FINAL_ENERGY_2050_GWH-SELF_CONSUMPTION_DIRECT_2050_GWH;
  const CURRENT_ELECTRICITY_2024_GWH=13210.096;
  const CURRENT_FINAL_ENERGY_2024_GWH=53187.7;
  const ELECTRIFICATION_SCENARIOS={
    current:{id:'current',label:'Actual · 24,8 %',share:100*CURRENT_ELECTRICITY_2024_GWH/CURRENT_FINAL_ENERGY_2024_GWH,service:CURRENT_ELECTRICITY_2024_GWH,grid:CURRENT_ELECTRICITY_2024_GWH,registeredFinal:CURRENT_FINAL_ENERGY_2024_GWH,year:2024,sourceLabel:'Balance energético de Euskadi',sourceUrl:'https://www.eve.eus/impulsamos-la-transicion/datos-energeticos/datos-energeticos-euskadi/'},
    reference:{id:'52',label:'52 %',share:52,service:ELECTRICITY_SERVICE_2050_GWH,grid:ELECTRICITY_SERVICE_2050_GWH-SELF_CONSUMPTION_DIRECT_2050_GWH,registeredFinal:REGISTERED_FINAL_ENERGY_2050_GWH,selfConsumption:SELF_CONSUMPTION_DIRECT_2050_GWH,year:2050,sourceLabel:'Estrategia de Descarbonización a Largo Plazo de España',sourceUrl:'https://www.miteco.gob.es/es/prensa/ultimas-noticias/2020/07/oportunidades_demodernizacioneconomicaasociadasalograrlaneutrali.html'},
    high:{id:'66.7',label:'66,7 %',share:100*2/3,service:FINAL_ENERGY_2050_GWH*2/3,grid:FINAL_ENERGY_2050_GWH*2/3-SELF_CONSUMPTION_DIRECT_2050_GWH,registeredFinal:REGISTERED_FINAL_ENERGY_2050_GWH,selfConsumption:SELF_CONSUMPTION_DIRECT_2050_GWH,year:2050,sourceLabel:'Escenario 2050 de Stop Fosilak para Euskal Herria',sourceUrl:'https://stopfosilak.eus/es/escenario-2050/'},
    full:{id:'100',label:'100 %',share:100,service:FINAL_ENERGY_2050_GWH,grid:REGISTERED_FINAL_ENERGY_2050_GWH,registeredFinal:REGISTERED_FINAL_ENERGY_2050_GWH,selfConsumption:SELF_CONSUMPTION_DIRECT_2050_GWH,year:2050,sourceLabel:'Caso límite de electrificación total; no es una previsión',sourceUrl:''},
  };
  const CURRENT_WIND_GWH=305.8;
  const CURRENT_SOLAR_TO_GRID_GWH=66.591054;
  const REPOWERING_ADDITIONAL_GWH=235.3;
  const cleanMunicipality=value=>String(value||'').replace(/^(ARABA\/ÁLAVA|BIZKAIA|GIPUZKOA)\s+/i,'');
  const sourceLinks=sources=>(sources||[]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · ');
  const projectSources=(project,properties)=>{
    const sources=[...(project?.sources||[])];
    if(properties?.sourceUrl&&!sources.some(source=>source.url===properties.sourceUrl))sources.push({label:properties.source||'Fuente cartográfica oficial',url:properties.sourceUrl});
    return sources;
  };
  const projectPhoto=project=>project?.photoSrc?`<figure class="installation-photo"><img src="${escapeHtml(project.photoSrc)}" alt="${escapeHtml(project.photoAlt||project.name)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(project.photoCaption||project.name)}</figcaption></figure>`:'';
  const projectDetailMarkup=(properties,layer)=>{
    const project=properties.detailData||{};
    const technology=properties.technology==='solar'?'Solar fotovoltaica':'Eólica';
    const power=Number(project.mw??properties.mw);
    const peakPower=Number(project.mwp);
    const annual=Number(project.annualGWhEstimate);
    const municipalities=(project.municipalities||properties.municipalities||[]).map(cleanMunicipality).join(', ')||'No indicados';
    const stageLead=layer.stage==='existing'?'Instalación en servicio representada mediante una superficie territorial comparable.':layer.stage==='pipeline'?'Expediente oficial en tramitación; todavía no es una instalación autorizada.':layer.stage==='rejected'?'Expediente desistido o archivado; se conserva solo como antecedente y no representa un proyecto activo.':'Proyecto autorizado o en construcción; todavía no se contabiliza como generación en servicio.';
    const powerMarkup=Number.isFinite(power)?`${formatNumber(power,power<10?3:1)} MW${Number.isFinite(peakPower)&&Math.abs(peakPower-power)>.05?` nominales · ${formatNumber(peakPower,peakPower<10?3:1)} MWp`:''}`:'No publicada';
    const productionMarkup=annual>0?`<dt>Producción anual estimada</dt><dd>${formatNumber(annual,1)} GWh/año</dd>${project.annualGWhMethod?`<dt>Método de estimación</dt><dd>${escapeHtml(project.annualGWhMethod)}</dd>`:''}`:'';
    const modelMarkup=Number(project.modelFirstYear)>0?`<dt>Entrada en el modelo</dt><dd>50 % en ${formatNumber(project.modelFirstYear,0)} · 100 % desde ${formatNumber(project.modelFullYear,0)}</dd>`:layer.stage==='pipeline'?'<dt>Entrada en el modelo</dt><dd>Solo se suma de forma exploratoria cuando se activa la capa; no modifica las proyecciones publicadas.</dd>':layer.stage==='rejected'?'<dt>Contribución al modelo</dt><dd>0 MW y 0 GWh/año. No se contabiliza en generación, superficie activa ni impactos.</dd>':'';
    const financeMarkup=Number(project.totalInvestmentMEur)>0?`<dt>Inversión y financiación</dt><dd>${formatNumber(project.totalInvestmentMEur,0)} M€ de inversión total${Number(project.greenLoanMEur)>0?` · ${formatNumber(project.greenLoanMEur,0)} M€ de préstamo verde del BEI`:''}</dd>`:'';
    const localMarkup=Number(project.constructionJobs)>0?`<dt>Impacto local anunciado</dt><dd>Hasta ${formatNumber(project.constructionJobs,0)} empleos durante la construcción.${project.citizenParticipation?` ${escapeHtml(project.citizenParticipation)}`:''}${project.localEnergyContracts?` ${escapeHtml(project.localEnergyContracts)}`:''}</dd>`:'';
    const eveMarkup=Number(project.eveAnnualGWh)>0?`<dt>Indicadores publicados por EVE</dt><dd>${formatNumber(project.eveAnnualGWh,0)} GWh/año${Number(project.peopleEquivalent)>0?` · electricidad equivalente para unas ${formatNumber(project.peopleEquivalent,0)} personas`:''}${Number(project.avoidedCO2Tonnes)>0?` · ${formatNumber(project.avoidedCO2Tonnes,0)} t de CO₂ evitadas al año`:''}</dd>`:'';
    const registryMarkup=project.minetur?`<dt>Registro</dt><dd>${escapeHtml(project.minetur)}</dd>`:'';
    const uncertainty=properties.uncertaintyLabel||properties.uncertainty||'';
    const sources=sourceLinks(projectSources(project,properties));
    const note=properties.note||project.note||'';
    return `<h5>${escapeHtml(properties.name||project.name||'Proyecto de generación')}</h5><p class="map-detail-lead">${escapeHtml(stageLead)}</p>${projectPhoto(project)}<dl><dt>Estado</dt><dd>${escapeHtml(project.statusLabel||properties.statusLabel||'No indicado')}</dd>${project.approvalDate||properties.approvalDate?`<dt>Fecha de referencia</dt><dd>${escapeHtml(project.approvalDate||properties.approvalDate)}</dd>`:''}<dt>Tecnología</dt><dd>${technology}</dd><dt>Potencia</dt><dd>${powerMarkup}</dd>${productionMarkup}${modelMarkup}${financeMarkup}${localMarkup}${eveMarkup}<dt>Municipios</dt><dd>${escapeHtml(municipalities)}</dd>${registryMarkup}${project.area?`<dt>Superficie o configuración publicada</dt><dd>${escapeHtml(project.area)}</dd>`:''}<dt>Superficie representada</dt><dd>${escapeHtml(properties.area||'No indicada')}</dd><dt>Método cartográfico</dt><dd>${escapeHtml(properties.basis||'No indicado')}</dd>${project.locationNote||properties.locationNote?`<dt>Localización</dt><dd>${escapeHtml(project.locationNote||properties.locationNote)}</dd>`:''}</dl>${uncertainty?`<p class="map-data-note"><strong>Cautela cartográfica.</strong> ${escapeHtml(uncertainty)}</p>`:''}${note?`<p class="map-data-note">${escapeHtml(note)}</p>`:''}${sources?`<span class="map-source-badge">${sources}</span>`:''}`;
  };
  const windParkAliases={
    'Badaia':[/BADAIA/i],
    'Elgea–Urkilla':[/ELGEA/i,/URKILLA/i],
    'Puerto de Bilbao':[/PUERTO DE BILBAO/i],
    'Oiz':[/\bOIZ\b/i],
  };
  const windRepowering={
    'Badaia':{currentMW:50.1,repoweredMW:107.415,currentTurbines:30,repoweredTurbines:31},
    'Elgea–Urkilla':{currentMW:59.27,repoweredMW:83.16,currentTurbines:78,repoweredTurbines:24},
    'Oiz':{currentMW:34,repoweredMW:41.58,currentTurbines:40,repoweredTurbines:12},
  };
  const windParkMedia={
    'Badaia':{src:'assets/photos/installations/badaia-parque-eolico.jpg',alt:'Parque eólico de Badaia',caption:'Parque eólico de Badaia · Basotxerri · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Badaia_-_Parque_E%C3%B3lico_-BT-_02.jpg" target="_blank" rel="noopener">Wikimedia Commons</a>'},
    'Elgea–Urkilla':{src:'assets/photos/installations/parque-eolico-elgea-el-correo.webp',alt:'Aerogeneradores del parque eólico de Elgea sobre la sierra',caption:'Parque eólico de Elgea, parte del complejo cartográfico Elgea–Urkilla · El Correo',preserveOrthophoto:true,technical:'El mapa agrupa los dos parques contiguos en una única ficha para simplificar la lectura y evitar que parezcan un duplicado. La potencia total de 59,27 MW suma Elgea (26,97 MW) y Urkilla (32,3 MW) una sola vez.',technicalSource:'https://www.eve.eus/assets/media/memoria_2003_cas.pdf'},
    'Oiz':{src:'assets/photos/installations/oiz-ermita-san-cristobal.png',alt:'Ermita de San Cristóbal y aerogeneradores del parque eólico de Oiz',caption:'Ermita de San Cristóbal y parque eólico de Oiz · Archivo documental de la ACTECC',preserveOrthophoto:true},
    'Puerto de Bilbao':{src:'assets/photos/installations/puerto-bilbao-parque-renovables.jpg',alt:'Aerogeneradores del parque de energías renovables del Puerto de Bilbao sobre el dique exterior',caption:'Parque de energías renovables del Puerto de Bilbao · Archivo documental de la ACTECC',preserveOrthophoto:true},
  };
  const orthophotoUrl=coordinate=>{
    const [longitude,latitude]=coordinate,longitudeRadius=.007,latitudeRadius=.005;
    const bbox=[longitude-longitudeRadius,latitude-latitudeRadius,longitude+longitudeRadius,latitude+latitudeRadius].map(value=>value.toFixed(6)).join(',');
    return `https://www.geo.euskadi.eus/geoeuskadi/rest/services/U11/ORTOARGAZKIAK/MapServer/export?bbox=${bbox}&bboxSR=4326&imageSR=4326&size=420%2C300&format=jpg&layers=show%3A189&f=image`;
  };
  const orthophotoCaption='<a href="https://www.geo.euskadi.eus/ortografia-15cm-comunidad-autonoma-del-pais-vasco-ano-2025/webgeo00-catalog/es/" target="_blank" rel="noopener">Vista aérea · Ortofoto 2025 · GeoEuskadi / PNOA-IGN</a>';
  const windParkMediaMarkup=(park,coordinate)=>{
    const media=windParkMedia[park],orthophoto=orthophotoUrl(coordinate);
    if(!media)return `<figure class="installation-photo"><img src="${orthophoto}" alt="Vista aérea del ámbito de ${escapeHtml(park)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption}</figcaption><span class="installation-photo-warning">La ortofoto se centra en el ámbito cartográfico y no delimita por sí sola toda la instalación.</span></figure>`;
    const main=`<figure class="installation-photo"><img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt)}" loading="lazy" decoding="async"><figcaption>${media.caption}</figcaption></figure>`;
    const aerial=media.preserveOrthophoto?`<figure class="installation-photo installation-photo-secondary"><img src="${orthophoto}" alt="Vista aérea cartográfica del ámbito de ${escapeHtml(park)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption}</figcaption><span class="installation-photo-warning">La ortofoto se centra en el ámbito cartográfico y no delimita por sí sola toda la instalación.</span></figure>`:'';
    const technical=media.technical?`<section class="pts-technical-note"><h6>Por qué aparece como una sola instalación</h6><p>${escapeHtml(media.technical)}</p>${media.technicalSource?`<span class="map-source-badge"><a href="${escapeHtml(media.technicalSource)}" target="_blank" rel="noopener">EVE · Memoria 2003</a></span>`:''}</section>`:'';
    return `${main}${technical}${aerial}`;
  };
  const dateLabel=value=>{
    const date=new Date(Number(value));
    return Number.isFinite(date.getTime())?new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric'}).format(date):'No indicada';
  };
  const existingWindDetailMarkup=(properties,feature)=>{
    const aliases=windParkAliases[properties.park]||[];
    const records=(window.energyMapReeInstallations?.features||[]).map(feature=>feature.properties||{}).filter(record=>record.tecnologia==='Eólica'&&aliases.some(pattern=>pattern.test(record.descripcion||'')));
    const registryMW=records.reduce((sum,record)=>sum+Number(record.mw||0),0);
    const repowering=windRepowering[properties.park];
    const municipalities=[...new Set(records.map(record=>cleanMunicipality(record.municipio)).filter(Boolean))];
    const registry=records.map(record=>record.minetur).filter(Boolean).join(' · ');
    const units=records.reduce((sum,record)=>sum+Number(record.numero||1),0);
    const latestUpdate=Math.max(...records.map(record=>Number(record.fecha_mod)||0));
    const coordinate=d3.geoCentroid(feature);
    const sourceUrl='https://www.euskadi.eus/contenidos/informacion/proceso_elaboracion_ptsere/es_def/adjuntos/PROVISIONAL-DOC-5-0-EST-AMB-ESTRATEGICO-MEMORIA.pdf';
    return `<h5>${escapeHtml(properties.park||'Parque eólico existente')}</h5><p class="map-detail-lead">Parque en servicio y ámbito máximo indicativo de una posible repotenciación evaluada por el PTS.</p>${windParkMediaMarkup(properties.park,coordinate)}<dl><dt>Estado</dt><dd>En servicio</dd><dt>Tecnología</dt><dd>Eólica terrestre</dd><dt>Potencia registrada</dt><dd>${records.length?`${formatNumber(registryMW,2)} MW`:'No localizada en el inventario cartográfico'}</dd><dt>Registros agrupados</dt><dd>${formatNumber(units,0)}</dd>${repowering?`<dt>Potencia base del estudio</dt><dd>${formatNumber(repowering.currentMW,2)} MW</dd><dt>Potencia repotenciada</dt><dd>${formatNumber(repowering.repoweredMW,3)} MW</dd><dt>Aumento potencial</dt><dd>+${formatNumber(repowering.repoweredMW-repowering.currentMW,3)} MW · +${formatNumber(100*(repowering.repoweredMW-repowering.currentMW)/repowering.currentMW,1)} %</dd><dt>Aerogeneradores</dt><dd>${formatNumber(repowering.currentTurbines,0)} actuales · ${formatNumber(repowering.repoweredTurbines,0)} en el modelo PTS</dd>`:''}${municipalities.length?`<dt>Municipios registrados</dt><dd>${escapeHtml(municipalities.join(', '))}</dd>`:''}${registry?`<dt>Registro</dt><dd>${escapeHtml(registry)}</dd>`:''}${latestUpdate>0?`<dt>Actualización del inventario</dt><dd>${dateLabel(latestUpdate)}</dd>`:''}<dt>Área de referencia actual</dt><dd>${formatNumber(properties.current_area_ha,1)} ha</dd><dt>Máximo teórico con +20 %</dt><dd>${formatNumber(properties.maximum_area_ha,1)} ha</dd><dt>Base cartográfica</dt><dd>${escapeHtml(properties.basis)}</dd></dl><p class="map-data-note">La coordenada y el registro proceden del inventario cartográfico de generación; no representan necesariamente la posición exacta de la subestación o del punto de conexión.</p><p class="map-data-note">El área azul oscura integra el ámbito actual y el máximo indicativo de repotenciación. No representa una ampliación autorizada: la forma y localización reales dependerían del proyecto y no podrían invadir zonas de exclusión.${properties.park==='Puerto de Bilbao'?' El PTS no incluyó Punta Lucero en su estudio de repotenciación, por lo que aquí no se muestra una nueva potencia potencial.':''}</p><span class="map-source-badge"><a href="https://www.geo.euskadi.eus/geoeuskadi/rest/services/U11/KARTOGRAFIA_CAS/MapServer/29" target="_blank" rel="noopener">Gobierno Vasco · inventario cartográfico de generación</a> · <a href="${sourceUrl}" target="_blank" rel="noopener">PTS de Energías Renovables · estudio de repotenciación</a></span>`;
  };
  const parseAreaHa=value=>{
    const match=String(value||'').match(/(\d+(?:[.,]\d+)?)\s*ha/i);
    return match?Number(match[1].replace(',','.')):null;
  };
  const equalAreaGeometry=(coordinate,areaHa)=>{
    const radiusKm=Math.sqrt(Math.max(.02,Number(areaHa))*.01/Math.PI);
    return d3.geoCircle().center(coordinate).radius(radiusKm/111.32).precision(20)();
  };
  const areaFeature=(project,areaHa,basis,extra={})=>({
    type:'Feature',
    geometry:equalAreaGeometry(project.coordinate,areaHa),
    properties:{
      id:project.id||project.objectid,
      name:project.name||project.descripcion||'Instalación renovable',
      technology:project.technology||extra.technology,
      mw:Number(project.mw)||0,
      statusLabel:project.statusLabel||project.stageLabel||extra.statusLabel,
      approvalDate:project.approvalDate||project.stageDate||'',
      municipalities:project.municipalities||[project.municipio].filter(Boolean),
      comparable_area_ha:Number(areaHa),
      area:`${Number(areaHa).toLocaleString('es-ES',{maximumFractionDigits:2})} ha equivalentes`,
      basis,
      locationNote:project.locationNote||extra.locationNote||'',
      note:project.note||'',
      detailData:project,
      representation:'equivalent_area',
      ...extra,
    },
  });
  const generatedAreaCollection=layer=>{
    if(layer.id==='rejected-solar'){
      const projects=(window.energyMapGenerationPipeline?.excluded||[]).filter(project=>project.technology==='solar'&&Array.isArray(project.coordinate));
      return {type:'FeatureCollection',features:projects.map(project=>{
        const published=parseAreaHa(project.area);
        const areaHa=published||Number(project.mw)*SOLAR_EQUIVALENT_HA_PER_MW;
        return areaFeature(project,areaHa,published?'Superficie publicada del proyecto archivado; se dibuja como círculo de igual área alrededor de la localización de referencia.':'Estimación comparable: potencia × 1,35 ha/MW.',{technology:'solar',statusLabel:project.statusLabel||'Expediente archivado',uncertaintyLabel:'La geometría se conserva únicamente como antecedente histórico; no representa un proyecto activo ni suma al modelo.'});
      })};
    }
    if(layer.id==='pipeline-solar'){
      const projects=(window.energyMapGenerationPipeline?.projects||[]).filter(project=>project.technology==='solar'&&Array.isArray(project.coordinate));
      return {type:'FeatureCollection',features:projects.map(project=>{
        const published=parseAreaHa(project.area);
        const areaHa=published||Number(project.mw)*SOLAR_EQUIVALENT_HA_PER_MW;
        return areaFeature(project,areaHa,published?'Superficie publicada en el expediente; se dibuja como círculo de igual área alrededor de la localización de referencia.':'Estimación comparable: potencia × 1,35 ha/MW.',{technology:'solar',uncertaintyLabel:'Superficie equivalente para comparar escalas; la forma circular no reproduce las parcelas del proyecto.'});
      })};
    }
    if(layer.id==='approved-solar'){
      const projects=(window.energyMapGenerationProjects?.projects||[]).filter(project=>project.technology==='solar'&&Array.isArray(project.coordinate));
      return {type:'FeatureCollection',features:projects.map(project=>{
        const published=parseAreaHa(project.area);
        const sharedComplex=/Complejo Val/i.test(String(project.area||''));
        const areaHa=published?(sharedComplex?published/2:published):Number(project.mw)*SOLAR_EQUIVALENT_HA_PER_MW;
        return areaFeature(project,areaHa,published?'Superficie publicada; se dibuja como círculo de igual área alrededor de la localización de referencia.':'Estimación comparable: potencia × 1,35 ha/MW.',{technology:'solar',uncertaintyLabel:'La forma circular permite comparar superficie, pero no reproduce las parcelas del proyecto.'});
      })};
    }
    if(layer.id==='existing-solar'){
      const features=(window.energyMapReeInstallations?.features||[]).filter(feature=>{
        const properties=feature.properties||{};
        return properties.tecnologia==='Fotovoltaica'&&Number(properties.mw)>=.7&&Array.isArray(feature.geometry?.coordinates)&&(properties.eveTipo==='Fotovoltaica a red'||/ARASUR/i.test(properties.descripcion||''));
      });
      return {type:'FeatureCollection',features:features.map(feature=>{
        const properties=feature.properties||{};
        const project={id:feature.id,name:properties.descripcion,technology:'solar',mw:properties.mw,coordinate:feature.geometry.coordinates,municipalities:[properties.municipio],statusLabel:'En servicio',minetur:properties.minetur,fecha_mod:properties.fecha_mod,sources:[{label:'Gobierno Vasco · inventario cartográfico de instalaciones de generación',url:'https://www.geo.euskadi.eus/geoeuskadi/rest/services/U11/KARTOGRAFIA_CAS/MapServer/29'}]};
        const isArasur=/ARASUR/i.test(properties.descripcion||'');
        const areaHa=isArasur?55:Number(properties.mw)*SOLAR_EQUIVALENT_HA_PER_MW;
        return areaFeature(project,areaHa,isArasur?'Superficie publicada de EKIAN–Arasur; se dibuja como círculo de igual área.':'Estimación comparable: potencia × 1,35 ha/MW.',{technology:'solar',uncertaintyLabel:'Capa limitada a instalaciones solares a red de 0,7 MW o más; la forma circular no reproduce las parcelas.'});
      })};
    }
    return {type:'FeatureCollection',features:[]};
  };
  window.bindPtsOverlapMap=story=>{
    let rendered=false;
    const impactMode=story.hasAttribute('data-pts-impact-model');
    const impactWindSlider=story.querySelector('[data-pts-impact-wind-slider]');
    const impactSolarSlider=story.querySelector('[data-pts-impact-solar-slider]');
    const impactSelfConsumptionSlider=story.querySelector('[data-pts-impact-self-consumption-slider]');
    const territorialConstraintControl=story.querySelector('[data-pts-territorial-constraint]');
    let activeTerritorialConstraint='maximum';
    const instancePrefix=`pts-map-${++mapInstanceSequence}`;
    const svgId=name=>`${instancePrefix}-${name}`;
    if(!document.getElementById('pts-aptitude-scale-style')){
      const style=document.createElement('style');
      style.id='pts-aptitude-scale-style';
      style.textContent='.pts-aptitude-scale,.pts-wind-resource-scale{display:inline-flex;align-items:center;gap:.28rem;margin-left:.05rem;padding:.2rem .36rem;border:1px solid #c7d7d1;border-radius:999px;background:#fff;font-size:.58rem;color:#315b51;white-space:nowrap}.pts-aptitude-scale[hidden],.pts-wind-resource-scale[hidden]{display:none}.pts-aptitude-scale strong,.pts-wind-resource-scale strong{font-size:.58rem;color:#234b42}.pts-aptitude-scale span{display:inline-flex;align-items:center;gap:.18rem}.pts-aptitude-scale .pts-aptitude-scale-divider{width:1px;height:.82rem;margin:0 .12rem;background:#c7d7d1}.pts-aptitude-scale i{display:inline-block;width:.62rem;height:.62rem;border:1px solid rgba(35,65,57,.35);border-radius:.12rem}.pts-wind-resource-ramp{display:inline-block;width:5.4rem;height:.62rem;border:1px solid rgba(35,65,57,.35);border-radius:.12rem;background:linear-gradient(90deg,#4fa4c5,#a9d5a0,#fff96a,#ffb33f,#f34a2c)}.pts-map-detail{align-self:start;max-height:500px;overflow:auto}.pts-map-detail .map-detail-lead{margin:.1rem 0 .65rem;color:#58716a}.pts-map-detail dl{display:grid;grid-template-columns:1fr;gap:.12rem;margin:.45rem 0 0;padding-top:.55rem;border-top:1px solid #d3e0dc}.pts-map-detail dt{margin-top:.28rem;color:#58716a;font-weight:700}.pts-map-detail dd{margin:0;color:#23463e;min-width:0}.pts-map-detail .map-data-note{margin:.65rem 0 0;padding:.55rem;background:#f6f8ec;border-left:3px solid #91a731}.pts-map-detail .installation-photo{margin:.55rem 0}.pts-map-detail .installation-photo img{height:125px}.pts-map-detail .pts-technical-note{margin:.55rem 0;padding:.55rem;border:1px solid #d3e0dc;background:#fff}.pts-map-detail .pts-technical-note h6{margin:0 0 .25rem;font-size:.7rem}.pts-map-detail .pts-technical-note p{margin:.2rem 0}@media(max-width:780px){.pts-aptitude-scale,.pts-wind-resource-scale{max-width:100%;margin-left:0;white-space:normal;flex-wrap:wrap}.pts-map-detail{max-height:none;overflow:visible}}';
      document.head.append(style);
    }
    story.querySelectorAll('.pts-aptitude-scale').forEach(scale=>scale.remove());
    const aptitudeScale=document.createElement('span');
    aptitudeScale.className='pts-aptitude-scale';
    aptitudeScale.hidden=true;
    aptitudeScale.setAttribute('aria-hidden','true');
    aptitudeScale.innerHTML=aptitudeScaleMarkup('Eólica',windAptitudeColors);
    const finalExclusionButton=story.querySelector('[data-pts-layer="exclusion-solar"]')||story.querySelector('[data-pts-layer="exclusion-wind"]');
    finalExclusionButton?.insertAdjacentElement('afterend',aptitudeScale);
    const windResourceScale=document.createElement('span');
    windResourceScale.className='pts-wind-resource-scale';
    windResourceScale.hidden=true;
    windResourceScale.setAttribute('aria-hidden','true');
    windResourceScale.innerHTML='<strong>Viento medio a 100 m</strong><span>&lt;3,5</span><i class="pts-wind-resource-ramp" aria-hidden="true"></i><span>&gt;9 m/s</span>';
    aptitudeScale.insertAdjacentElement('afterend',windResourceScale);
    const expandButton=story.querySelector('[data-pts-expand]');
    const fullscreenButton=story.querySelector('[data-pts-fullscreen]');
    const fullscreenPanel=story.querySelector('.pts-overlap-map');
    const detailPanel=story.querySelector('[data-pts-map-detail]');
    let impactSideMetrics=null;
    if(impactMode){
      const impactHelp=detailPanel?.querySelector('p');
      if(impactHelp)impactHelp.textContent='La base muestra las instalaciones conocidas. Cada control añade de manera independiente una fracción del potencial de las ZLS de su tecnología.';
      const contextRow=story.querySelector('.pts-map-control-context');
      const legendDetails=document.createElement('details');
      legendDetails.className='pts-impact-legend-details';
      legendDetails.innerHTML='<summary>Leyenda de colores</summary><div class="pts-impact-legend-popover"></div>';
      const legendBody=legendDetails.querySelector('.pts-impact-legend-popover');
      if(impactHelp)legendBody.append(impactHelp.cloneNode(true));
      const legend=detailPanel?.querySelector('.pts-map-legend');
      if(legend)legendBody.append(legend.cloneNode(true));
      contextRow?.append(legendDetails);
      if(detailPanel)detailPanel.hidden=true;
    }
    const mapLayout=story.querySelector('.pts-map-layout');
    if(impactMode&&mapLayout){
      impactSideMetrics=document.createElement('aside');
      impactSideMetrics.className='pts-impact-dashboard pts-impact-side-metrics';
      impactSideMetrics.setAttribute('aria-label','Indicadores principales del modelo');
      mapLayout.insertBefore(impactSideMetrics,detailPanel||null);
    }
    const impactDashboard=story.querySelector('[data-pts-impact-dashboard]');
    const energyShare=document.createElement('aside');
    energyShare.className='pts-energy-share';
    energyShare.dataset.ptsEnergyShare='';
    energyShare.setAttribute('aria-live','polite');
    energyShare.innerHTML=`<h5>${impactMode?'Porcentaje de la demanda restante de red en 2050 cubierto':'Potencial físico-técnico de las capas activadas'}</h5>${impactMode?'<div class="pts-electrification-fixed"><span>Nivel de electrificación fijo</span><strong>52 % · 2050</strong></div>':'<div class="pts-electrification-switch"><span>Nivel de electrificación del consumo final</span><div role="group" aria-label="Nivel de electrificación"><button type="button" data-pts-electrification="current" aria-pressed="false">Actual · 24,8 %</button><button type="button" data-pts-electrification="reference" aria-pressed="true">52 %</button><button type="button" data-pts-electrification="high" aria-pressed="false">66,7 %</button><button type="button" data-pts-electrification="full" aria-pressed="false">100 %</button></div></div>'}<p class="pts-energy-share-intro" data-pts-energy-intro></p><div class="pts-energy-track" data-pts-energy-track><div class="pts-energy-potential-fill" data-pts-potential-fill hidden></div></div><div class="pts-energy-scale"><span>0 %</span><span>100 %</span></div><p class="pts-energy-total" data-pts-energy-total><strong>0 GWh/año · 0 %</strong>Activa capas para calcular su generación.</p><div class="pts-energy-legend" data-pts-energy-legend></div><p class="pts-energy-caveat" data-pts-energy-caveat>Las ZLS y las aptitudes representan potencial territorial, no proyectos autorizados.</p>`;
    let birdImpactCard=null;
    let landImpactCard=null;
    let employmentImpactCard=null;
    let canonImpactCard=null;
    let localPublicIncomeCard=null;
    let territoryImpactCard=null;
    let activeTerritoryMetric='total';
    if(impactMode&&impactDashboard){
      energyShare.classList.add('pts-impact-metric');
      (impactSideMetrics||impactDashboard).append(energyShare);
      birdImpactCard=document.createElement('article');
      birdImpactCard.className='pts-impact-metric is-birds';
      birdImpactCard.setAttribute('aria-live','polite');
      birdImpactCard.innerHTML=`<h5>Mortalidad estimada de aves</h5><div class="pts-impact-reference"><span>Media corregida en tres parques actuales</span><strong>65,25 aves/año</strong></div><span class="pts-impact-method-tag">Extrapolación ilustrativa por superficie eólica</span><p class="pts-impact-metric-intro">La estimación aumenta con el área eólica incorporada por el modelo. Sirve para comparar órdenes de magnitud, no para predecir la mortalidad de cada emplazamiento.</p><div class="pts-impact-track" role="img" data-pts-bird-track><span class="pts-impact-track-fill" data-pts-bird-fill></span><i class="pts-impact-track-marker" data-pts-bird-marker></i><b class="pts-impact-track-value" data-pts-bird-total></b></div><div class="pts-impact-scale"><span>≈66/año actuales</span><span data-pts-bird-max></span></div><section class="pts-impact-submetric is-endangered" aria-labelledby="pts-endangered-birds-title"><h6 id="pts-endangered-birds-title">Aves catalogadas «En peligro de extinción» (milano real)</h6><div class="pts-impact-reference"><span>Mínimo documentado entre 2007 y 2024</span><strong>≥5 milanos reales · 0,28/año</strong></div><p class="pts-impact-metric-intro">La barra aplica esa tasa histórica al área eólica incorporada para mostrar un orden de magnitud.</p><div class="pts-impact-track" role="img" data-pts-endangered-track><span class="pts-impact-track-fill" data-pts-endangered-fill></span><i class="pts-impact-track-marker" data-pts-endangered-marker></i><b class="pts-impact-track-value" data-pts-endangered-total></b></div><div class="pts-impact-scale"><span>≈0,28/año documentados</span><span data-pts-endangered-max></span></div></section><p class="pts-impact-metric-caveat">Base: media corregida de 65,25 aves/año —0,44 por aerogenerador— en Badaia, Elgea‑Urkilla y Oiz durante los cuatro años comparables. Los cinco milanos reales constituyen un mínimo documentado, no el total real de aves amenazadas muertas. Ambas tasas se escalan por área territorial comparable. La ubicación, las especies, el diseño, la detectabilidad y las medidas de parada pueden cambiar radicalmente el resultado. <a href="comparativa_impactos.html#wind-birds">Ver datos y fuentes</a>.</p>`;
      landImpactCard=document.createElement('article');
      landImpactCard.className='pts-impact-metric is-land';
      landImpactCard.setAttribute('aria-live','polite');
      landImpactCard.innerHTML=`<h5>Ocupación estimada de suelo agrario por solar</h5><div class="pts-impact-reference"><span>Desglose de la superficie solar seleccionada</span><strong>cultivos y pastos</strong></div><span class="pts-impact-method-tag">Extrapolación del patrón observado</span><p class="pts-impact-metric-intro">Los dos rectángulos avanzan con el dial solar. Cada barra completa representa el 100 % de la superficie total de ese uso agrario en Euskadi.</p><div class="pts-land-split-grid"><section class="pts-land-kind is-cropland"><h6>Tierras labradas · total 84.805 ha</h6><div class="pts-impact-track" role="img" data-pts-cropland-track><span class="pts-impact-track-fill" data-pts-cropland-fill></span><i class="pts-impact-track-marker" data-pts-cropland-marker></i></div><div class="pts-impact-scale"><span>0 %</span><span>100 % de las tierras labradas</span></div><p class="pts-impact-metric-total" data-pts-cropland-total></p></section><section class="pts-land-kind is-pasture"><h6>Pastos permanentes · total 92.206 ha</h6><div class="pts-impact-track" role="img" data-pts-pasture-track><span class="pts-impact-track-fill" data-pts-pasture-fill></span><i class="pts-impact-track-marker" data-pts-pasture-marker></i></div><div class="pts-impact-scale"><span>0 %</span><span>100 % de los pastos</span></div><p class="pts-impact-metric-total" data-pts-pasture-total></p></section></div><p class="pts-impact-metric-caveat">Hipótesis de trabajo: del 86,3 % de superficie solar agraria documentada, se asigna un 85 % del total solar a tierras labradas y un 1,3 % a pastos permanentes; el 13,7 % restante corresponde a otros usos. Es una extrapolación del patrón observado, no un cruce cartográfico parcela a parcela de todas las ZLS. Totales de referencia: 84.805 ha labradas y 92.206 ha de pastos permanentes. <a href="comparativa_impactos.html#solar-land-composition-title">Ver método y fuentes</a>.</p>`;
      [['cropland','−100 % de las tierras labradas'],['pasture','−100 % de los pastos']].forEach(([kind,leftLabel])=>{
        const track=landImpactCard.querySelector(`[data-pts-${kind}-track]`);
        const fill=landImpactCard.querySelector(`[data-pts-${kind}-fill]`);
        const labels=track?.nextElementSibling?.querySelectorAll('span');
        if(track){track.style.display='flex';track.style.direction='rtl';track.style.background='#fff7f6'}
        if(fill)fill.style.background='#c63d32';
        if(labels?.length===2){labels[0].textContent=leftLabel;labels[1].textContent='0 %'}
      });
      employmentImpactCard=document.createElement('article');
      employmentImpactCard.className='pts-impact-metric is-employment';
      employmentImpactCard.setAttribute('aria-live','polite');
      employmentImpactCard.innerHTML=`<h5>Empleo renovable y empleo agrario potencialmente desplazado</h5><p class="pts-impact-metric-intro">Contrasta dos referencias de empleo estable por superficie solar, con una escala común.</p><div class="pts-comparison-bars"><section><h6>Operación y mantenimiento renovable</h6><div class="pts-impact-track" role="img" data-pts-renewable-jobs-track><span class="pts-impact-track-fill" data-pts-renewable-jobs-fill></span></div><p class="pts-impact-metric-total" data-pts-renewable-jobs-total></p></section><section><h6>Empleo agrario potencialmente desplazado</h6><div class="pts-impact-track" role="img" data-pts-agricultural-jobs-track><span class="pts-impact-track-fill" data-pts-agricultural-jobs-fill></span></div><p class="pts-impact-metric-total" data-pts-agricultural-jobs-total></p></section></div><p class="pts-impact-metric-caveat">Referencias del Libro Blanco: ≈16 empleos de operación y mantenimiento solar por 100 ha y ≈2,2 personas ocupadas en agricultura por 100 ha agrarias. No es un balance neto: el empleo renovable puede no ser local y la ocupación solar no implica necesariamente perder todo el empleo agrario si existen compatibilidades, compensaciones o continuidad de la actividad. <a href="comparativa_impactos.html#land-comparison-title">Ver datos y fuentes</a>.</p>`;
      canonImpactCard=document.createElement('article');
      canonImpactCard.className='pts-impact-metric is-canon';
      canonImpactCard.setAttribute('aria-live','polite');
      canonImpactCard.innerHTML=`<h5>Canon anual estimado de energías renovables</h5><p class="pts-impact-metric-intro">Muestra la recaudación anual orientativa asociada al despliegue seleccionado.</p><div class="pts-impact-track pts-canon-track" role="img" data-pts-canon-track><span class="pts-impact-track-fill" data-pts-canon-fill></span><b class="pts-impact-track-value" data-pts-canon-track-value></b></div><div class="pts-impact-scale"><span>0 €/año</span><span>más ingresos →</span></div><div class="pts-canon-total" data-pts-canon-total></div><div class="pts-canon-breakdown"><section class="is-solar"><span>Solar · 700 €/ha</span><div class="pts-impact-track pts-canon-component-track" role="img" data-pts-canon-solar-track><span class="pts-impact-track-fill" data-pts-canon-solar-fill></span></div><strong data-pts-canon-solar></strong></section><section class="is-wind"><span>Eólica · 2.600–5.400 €/aerogenerador</span><div class="pts-impact-track pts-canon-component-track" role="img" data-pts-canon-wind-track><span class="pts-impact-track-fill" data-pts-canon-wind-fill></span></div><strong data-pts-canon-wind></strong></section></div><p class="pts-impact-metric-caveat">Estimación indicativa al aplicar las tarifas del canon vasco a la superficie solar y al número aproximado de aerogeneradores del modelo. Para las futuras ZLS se supone una máquina de 5 MW. La liquidación real depende de la configuración, potencia, número de máquinas, exenciones y situación administrativa de cada instalación; no incluye impuestos locales, alquileres ni participación pública. La longitud de las barras es orientativa y conserva margen a la derecha: no representa un techo de recaudación. <a href="comparativa_impactos.html#renewable-canon-title">Ver canon y fuentes</a>.</p>`;
      canonImpactCard.querySelector('[data-pts-canon-solar-fill]').style.background='#d4a017';
      canonImpactCard.querySelector('[data-pts-canon-wind-fill]').style.background='#176f9f';
      localPublicIncomeCard=document.createElement('article');
      localPublicIncomeCard.className='pts-impact-metric is-local-public-income';
      localPublicIncomeCard.setAttribute('aria-live','polite');
      localPublicIncomeCard.style.borderTopColor='#176f9f';
      localPublicIncomeCard.innerHTML=`<h5>Otros ingresos públicos locales anuales</h5><p class="pts-impact-metric-intro">Extrapolación orientativa del caso de Labraza al despliegue eólico seleccionado. No incluye el canon autonómico mostrado en la tarjeta anterior.</p><div class="pts-impact-track pts-canon-track" role="img" data-pts-local-income-track><span class="pts-impact-track-fill" data-pts-local-income-land-fill style="position:absolute;left:0;background:#155e75"></span><span class="pts-impact-track-fill" data-pts-local-income-other-fill style="position:absolute;background:#3d98b7"></span><b class="pts-impact-track-value" data-pts-local-income-track-value></b></div><div class="pts-impact-scale"><span>0 €/año</span><span>referencia abierta →</span></div><div class="pts-canon-total" data-pts-local-income-total style="background:#e8f4f7;color:#16566b"></div><div class="pts-canon-breakdown"><section class="is-wind"><span>Ocupación anual de montes públicos</span><strong data-pts-local-income-land></strong></section><section class="is-wind"><span>Otros impuestos y cánones locales no desglosados</span><strong data-pts-local-income-other></strong></section></div><div class="pts-impact-reference" style="margin-top:.35rem"><span>Participación pública en Aixeindar</span><strong>25 % EVE · no cuantificado</strong></div><p class="pts-impact-metric-caveat">Labraza aporta una referencia documentada de 230.000 € anuales en impuestos y cánones para 40 MW: 5.750 €/MW·año. De ese total, la Diputación Foral de Álava identifica 35.368,68 €/año por ocupación de montes públicos de Labraza y Barriobusto; el resto no está desglosado por figura tributaria. La barra aplica linealmente esa referencia a la potencia eólica seleccionada, pero cada proyecto puede ocupar suelo privado, soportar otros tipos impositivos o generar ingresos muy distintos. EVE posee el 25 % de Aixeindar, pero no se ha publicado una previsión de beneficios ni una política de dividendos de Labraza; por eso esa posible rentabilidad pública se muestra sin sumarla. <a href="https://www.euskadi.eus/gobierno-vasco/-/noticia/2026/el-parque-eolico-labraza-avanza-llegada-primeras-palas-aerogeneradores/" target="_blank" rel="noopener">Gobierno Vasco</a>; <a href="https://www.araba.eus/botha/Boletines/2025/105/2025_105_02666_C.pdf" target="_blank" rel="noopener">BOTHA</a>; <a href="https://www.eve.eus/quienes-somos/sociedades-participadas/" target="_blank" rel="noopener">EVE</a>.</p>`;
      territoryImpactCard=document.createElement('article');
      territoryImpactCard.className='pts-impact-metric is-territory';
      territoryImpactCard.setAttribute('aria-live','polite');
      territoryImpactCard.innerHTML=`<div class="pts-territory-head"><div><h5>Distribución territorial de la generación</h5><p data-pts-territory-subtitle>Compara el despliegue seleccionado entre los tres territorios históricos.</p></div><div class="pts-territory-switch" role="group" aria-label="Unidad de comparación territorial"><button type="button" data-pts-territory-metric="total" aria-pressed="true">Total</button><button type="button" data-pts-territory-metric="person" aria-pressed="false">Por persona</button><button type="button" data-pts-territory-metric="area" aria-pressed="false">Por km²</button></div></div><div class="pts-territory-legend"><span><i class="is-wind"></i>Eólica</span><span><i class="is-solar"></i>Solar</span></div><div class="pts-territory-chart" data-pts-territory-chart></div><p class="pts-impact-metric-caveat" data-pts-territory-caveat>Las instalaciones existentes, aprobadas y en tramitación se asignan por dato territorial o por su localización. Las ZLS se asignan al territorio donde cae su punto oficial de referencia: es una aproximación indicativa y no divide las zonas que atraviesan límites. Población a 1 de enero de 2025: Eustat; superficie: Gobierno Vasco.</p>`;
      const collapseMethodText=(card,nodes)=>{
        const details=document.createElement('details');
        details.className='pts-impact-method-details';
        details.innerHTML='<summary>Cómo se calcula</summary><div class="pts-impact-method-body"></div>';
        const body=details.querySelector('.pts-impact-method-body');
        nodes.filter(Boolean).forEach(node=>body.append(node));
        card.append(details);
      };
      collapseMethodText(energyShare,[energyShare.querySelector('.pts-electrification-fixed'),energyShare.querySelector('.pts-energy-share-intro'),energyShare.querySelector('.pts-energy-caveat')]);
      collapseMethodText(birdImpactCard,[...birdImpactCard.querySelectorAll('.pts-impact-reference,.pts-impact-method-tag,.pts-impact-metric-intro,.pts-impact-metric-caveat')]);
      collapseMethodText(landImpactCard,[...landImpactCard.querySelectorAll('.pts-impact-reference,.pts-impact-method-tag,.pts-impact-metric-intro,.pts-impact-metric-caveat')]);
      collapseMethodText(employmentImpactCard,[...employmentImpactCard.querySelectorAll('.pts-impact-metric-intro,.pts-impact-metric-caveat')]);
      collapseMethodText(canonImpactCard,[...canonImpactCard.querySelectorAll('.pts-impact-metric-intro,.pts-impact-metric-caveat')]);
      collapseMethodText(localPublicIncomeCard,[...localPublicIncomeCard.querySelectorAll('.pts-impact-metric-intro,.pts-impact-metric-caveat')]);
      territoryImpactCard.querySelectorAll('[data-pts-territory-metric]').forEach(button=>button.addEventListener('click',()=>{
        activeTerritoryMetric=button.dataset.ptsTerritoryMetric||'total';
        territoryImpactCard.querySelectorAll('[data-pts-territory-metric]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
        updateEnergyShare();
      }));
      (impactSideMetrics||impactDashboard).append(birdImpactCard,landImpactCard,employmentImpactCard,canonImpactCard,localPublicIncomeCard,territoryImpactCard);
      if(impactSideMetrics)impactDashboard.closest('.pts-impact-dashboard-section')?.setAttribute('hidden','');
    }else mapLayout?.prepend(energyShare);
    let activeElectrificationScenario=ELECTRIFICATION_SCENARIOS.reference;
    const approvedProjects=window.energyMapGenerationProjects?.projects||[];
    const pipelineProjects=window.energyMapGenerationPipeline?.projects||[];
    const ptsTotals=window.energyMapPtsPotentialSites?.totals||{};
    const aptitudePotential=window.energyMapPtsAptitudePotential?.layers||{};
    const sumAnnual=(projects,technology)=>projects.filter(project=>project.technology===technology).reduce((sum,project)=>sum+(Number(project.annualGWhEstimate)||0),0);
    const energyLayers={
      'existing-wind':{label:'Eólica existente',gwh:CURRENT_WIND_GWH,technology:'wind'},
      'approved-wind':{label:'Eólica aprobada / construcción',gwh:sumAnnual(approvedProjects,'wind'),technology:'wind'},
      'pipeline-wind':{label:'Eólica en tramitación',gwh:sumAnnual(pipelineProjects,'wind'),technology:'wind'},
      'existing-solar':{label:'Solar actual vertida a red',gwh:CURRENT_SOLAR_TO_GRID_GWH,technology:'solar'},
      'approved-solar':{label:'Solar aprobada / construcción',gwh:sumAnnual(approvedProjects,'solar'),technology:'solar'},
      'pipeline-solar':{label:'Solar en tramitación',gwh:sumAnnual(pipelineProjects,'solar'),technology:'solar'},
    };
    const zlsGeneration={wind:Number(ptsTotals.wind?.annualGWhEstimate)||2915,solar:Number(ptsTotals.solar?.annualGWhEstimate)||3285};
    const MONITORED_WIND_AREA_HA=2077.4;
    const CURRENT_WIND_AREA_HA=2102.38;
    const APPROVED_WIND_AREA_HA=602.73;
    const PIPELINE_WIND_AREA_HA=3199.554;
    const CORRECTED_BIRD_MORTALITY_ANNUAL=65.25;
    const BIRD_MORTALITY_PER_HA=CORRECTED_BIRD_MORTALITY_ANNUAL/MONITORED_WIND_AREA_HA;
    const DOCUMENTED_ENDANGERED_BIRD_ANNUAL=5/18;
    const ENDANGERED_BIRD_PER_HA=DOCUMENTED_ENDANGERED_BIRD_ANNUAL/MONITORED_WIND_AREA_HA;
    const BASE_WIND_AREA_HA=CURRENT_WIND_AREA_HA+APPROVED_WIND_AREA_HA+PIPELINE_WIND_AREA_HA;
    const ZLS_WIND_AREA_HA=Number(ptsTotals.wind?.areaHa)||6258.635;
    const CURRENT_SOLAR_TOTAL_HA=116.9;
    const APPROVED_SOLAR_TOTAL_HA=452.68;
    const PIPELINE_SOLAR_TOTAL_HA=45.209;
    const DOCUMENTED_CROPLAND_SHARE=.85;
    const DOCUMENTED_PASTURE_SHARE=.013;
    const BASE_SOLAR_TOTAL_HA=APPROVED_SOLAR_TOTAL_HA+PIPELINE_SOLAR_TOTAL_HA;
    const MAX_SOLAR_TOTAL_HA=2930.9;
    const EUSKADI_CROPLAND_AREA_HA=84805;
    const EUSKADI_PERMANENT_PASTURE_AREA_HA=92206;
    const RENEWABLE_OM_JOBS_PER_100_HA=16;
    const AGRICULTURAL_JOBS_PER_100_HA=2.2;
    const SOLAR_CANON_EUR_PER_HA=700;
    const WIND_CANON_MIN_EUR_PER_TURBINE=2600;
    const WIND_CANON_MAX_EUR_PER_TURBINE=5400;
    const CURRENT_WIND_TURBINES=153;
    const CURRENT_WIND_MW=153;
    const ZLS_WIND_REFERENCE_MW=1100;
    const ZLS_REFERENCE_TURBINE_MW=5;
    const turbineCountFromProject=project=>{
      if(project.technology!=='wind')return 0;
      const match=String(project.area||'').match(/([\d.,]+)\s*aerogeneradores?/i);
      if(match)return Number(match[1].replace(',','.'))||0;
      if(project.id==='azazeta')return 8;
      return (Number(project.mw)||0)/ZLS_REFERENCE_TURBINE_MW;
    };
    const BASE_WIND_TURBINES=CURRENT_WIND_TURBINES+[...approvedProjects,...pipelineProjects].reduce((sum,project)=>sum+turbineCountFromProject(project),0);
    const ZLS_WIND_TURBINES=ZLS_WIND_REFERENCE_MW/ZLS_REFERENCE_TURBINE_MW;
    const BASE_WIND_MW=CURRENT_WIND_MW+[...approvedProjects,...pipelineProjects].filter(project=>project.technology==='wind').reduce((sum,project)=>sum+(Number(project.mw)||0),0);
    const LABRAZA_LOCAL_PUBLIC_INCOME_EUR_PER_MW_YEAR=230000/40;
    const LABRAZA_PUBLIC_LAND_EUR_PER_MW_YEAR=35368.68/40;
    const LABRAZA_OTHER_LOCAL_INCOME_EUR_PER_MW_YEAR=LABRAZA_LOCAL_PUBLIC_INCOME_EUR_PER_MW_YEAR-LABRAZA_PUBLIC_LAND_EUR_PER_MW_YEAR;
    const territoryMeta=[
      {id:'araba',label:'Araba / Álava',population:337680,areaKm2:3037.3},
      {id:'bizkaia',label:'Bizkaia',population:1155733,areaKm2:2217.2},
      {id:'gipuzkoa',label:'Gipuzkoa',population:724797,areaKm2:1980.3},
    ];
    const territoryIdFromName=value=>{
      const normalized=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
      if(normalized.includes('BIZKAIA'))return 'bizkaia';
      if(normalized.includes('GIPUZKOA'))return 'gipuzkoa';
      if(normalized.includes('ARABA')||normalized.includes('LAVA'))return 'araba';
      return null;
    };
    const territoryFeatures=window.energyMapTerritories?.features?.length?windCollection(window.energyMapTerritories).features:[];
    const territoryIdFromCoordinate=coordinate=>{
      if(!Array.isArray(coordinate)||coordinate.length<2||typeof d3==='undefined')return null;
      const feature=territoryFeatures.find(candidate=>d3.geoContains(candidate,coordinate));
      if(feature)return territoryIdFromName(feature.properties?.TERRITORIO);
      const nearest=territoryFeatures.map(candidate=>({
        feature:candidate,
        distance:d3.geoDistance(coordinate,d3.geoCentroid(candidate)),
      })).sort((a,b)=>a.distance-b.distance)[0]?.feature;
      return territoryIdFromName(nearest?.properties?.TERRITORIO);
    };
    const blankTerritoryGeneration=()=>Object.fromEntries(territoryMeta.map(territory=>[territory.id,{wind:0,solar:0}]));
    const addTerritoryGeneration=(target,territoryId,technology,gwh)=>{
      if(target[territoryId]&&(technology==='wind'||technology==='solar'))target[territoryId][technology]+=Number(gwh)||0;
    };
    const existingTerritoryGeneration=blankTerritoryGeneration();
    const registeredWindMw=blankTerritoryGeneration();
    (window.energyMapReeInstallations?.features||[]).forEach(feature=>{
      const properties=feature.properties||{};
      if(properties.tecnologia!=='Eólica')return;
      addTerritoryGeneration(registeredWindMw,territoryIdFromName(properties.provincia),'wind',properties.mw??properties.potencia_mw);
    });
    const totalRegisteredWindMw=Object.values(registeredWindMw).reduce((sum,item)=>sum+item.wind,0);
    territoryMeta.forEach(territory=>{
      if(totalRegisteredWindMw>0)existingTerritoryGeneration[territory.id].wind=CURRENT_WIND_GWH*registeredWindMw[territory.id].wind/totalRegisteredWindMw;
    });
    Object.entries(window.energyMapSolarMunicipal2025?.territories||{}).forEach(([name,data])=>{
      addTerritoryGeneration(existingTerritoryGeneration,territoryIdFromName(name),'solar',data.estimatedGridInjectedGWh);
    });
    const projectTerritoryGeneration=projects=>{
      const result=blankTerritoryGeneration();
      projects.forEach(project=>addTerritoryGeneration(result,territoryIdFromCoordinate(project.coordinate),project.technology,project.annualGWhEstimate));
      return result;
    };
    const approvedTerritoryGeneration=projectTerritoryGeneration(approvedProjects);
    const pipelineTerritoryGeneration=projectTerritoryGeneration(pipelineProjects);
    const zlsTerritoryGeneration=blankTerritoryGeneration();
    const zlsSites=(window.energyMapPtsPotentialSites?.sites||[]).filter(site=>site.technology==='wind'||site.technology==='solar');
    const zlsSiteByCode=new Map(zlsSites.map(site=>[String(site.code||'').toUpperCase(),site]));
    zlsSites.forEach(site=>addTerritoryGeneration(zlsTerritoryGeneration,territoryIdFromCoordinate(site.coordinate),site.technology,site.annualGWhEstimate));
    ['wind','solar'].forEach(technology=>{
      const assigned=territoryMeta.reduce((sum,territory)=>sum+zlsTerritoryGeneration[territory.id][technology],0);
      const factor=assigned>0?zlsGeneration[technology]/assigned:0;
      territoryMeta.forEach(territory=>{zlsTerritoryGeneration[territory.id][technology]*=factor;});
    });
    const territorialConstraintLabels={
      maximum:'toda la energía posible',
      'equal-total':'misma energía total',
      'equal-area':'misma energía por superficie',
      'equal-person':'misma energía por persona',
    };
    const territorialConstraintWeight=(territory,mode)=>mode==='equal-area'?territory.areaKm2:mode==='equal-person'?territory.population:1;
    const territorialConstraintProfile=(technology,mode=activeTerritorialConstraint)=>{
      const capacities=Object.fromEntries(territoryMeta.map(territory=>[territory.id,zlsTerritoryGeneration[territory.id][technology]]));
      if(mode==='maximum')return {mode,maxShare:1,maxTotal:zlsGeneration[technology],maxByTerritory:{...capacities},capacities};
      const weights=Object.fromEntries(territoryMeta.map(territory=>[territory.id,territorialConstraintWeight(territory,mode)]));
      const limitingUnit=Math.min(...territoryMeta.map(territory=>capacities[territory.id]/weights[territory.id]));
      const maxByTerritory=Object.fromEntries(territoryMeta.map(territory=>[territory.id,limitingUnit*weights[territory.id]]));
      const maxTotal=Object.values(maxByTerritory).reduce((sum,value)=>sum+value,0);
      return {mode,maxShare:zlsGeneration[technology]>0?maxTotal/zlsGeneration[technology]:0,maxTotal,maxByTerritory,capacities};
    };
    const zlsAllocation=(technology,deploymentShare)=>{
      const profile=territorialConstraintProfile(technology);
      const boundedShare=Math.max(0,Math.min(profile.maxShare,deploymentShare));
      const progress=profile.maxShare>0?boundedShare/profile.maxShare:0;
      const byTerritory=Object.fromEntries(territoryMeta.map(territory=>[territory.id,profile.maxByTerritory[territory.id]*progress]));
      return {...profile,deploymentShare:boundedShare,progress,byTerritory,total:Object.values(byTerritory).reduce((sum,value)=>sum+value,0)};
    };
    const selectedDeploymentShare=technology=>{
      if(!impactMode)return 1;
      if(activeTerritorialConstraint!=='maximum')return territorialConstraintProfile(technology).maxShare;
      const slider=technology==='wind'?impactWindSlider:impactSolarSlider;
      return Math.max(0,Math.min(1,Number(slider?.value||0)/100));
    };
    const currentZlsAllocations=()=>({
      wind:zlsAllocation('wind',selectedDeploymentShare('wind')),
      solar:zlsAllocation('solar',selectedDeploymentShare('solar')),
    });
    const zlsFeatureModelData=(feature,technology)=>{
      const code=String(feature?.properties?.CODIGO||'').toUpperCase();
      const site=zlsSiteByCode.get(code);
      const fallbackArea=Math.max(0,Number(feature?.properties?.HECTARIAS)||0);
      const totalArea=Math.max(1,Number(ptsTotals[technology]?.areaHa)||1);
      return {
        code,
        territoryId:territoryIdFromCoordinate(site?.coordinate||d3.geoCentroid(feature)),
        annualGWh:Math.max(0,Number(site?.annualGWhEstimate)||zlsGeneration[technology]*fallbackArea/totalArea),
      };
    };
    const updateSliderConstraints=()=>{
      if(!impactMode)return;
      const profiles={wind:territorialConstraintProfile('wind'),solar:territorialConstraintProfile('solar')};
      [[impactWindSlider,profiles.wind],[impactSolarSlider,profiles.solar]].forEach(([slider,profile])=>{
        if(!slider)return;
        const maximum=Math.max(0,Math.min(100,profile.maxShare*100));
        slider.max='100';
        if(activeTerritorialConstraint==='maximum'){
          slider.disabled=false;
          const current=Math.max(0,Math.min(100,Number(slider.value||0)));
          slider.value=current.toFixed(1);
          slider.setAttribute('value',current.toFixed(1));
        }else{
          slider.value=maximum.toFixed(1);
          slider.setAttribute('value',maximum.toFixed(1));
          slider.disabled=true;
        }
      });
      const status=story.querySelector('[data-pts-constraint-status]');
      if(!status)return;
      const combinedShare=100*(profiles.wind.maxTotal+profiles.solar.maxTotal)/(zlsGeneration.wind+zlsGeneration.solar);
      status.innerHTML=activeTerritorialConstraint==='maximum'
        ?'Sin límite adicional: ambos controles parten del <strong>0 %</strong> y pueden aumentarse manualmente hasta el 100 % de sus ZLS.'
        :`Diales fijados automáticamente en el máximo compatible: <strong>eólica ${formatNumber(profiles.wind.maxShare*100,1)} %</strong>, <strong>solar ${formatNumber(profiles.solar.maxShare*100,1)} %</strong> y <strong>despliegue conjunto ${formatNumber(combinedShare,1)} %</strong> del potencial ZLS sin restricciones.`;
    };
    const updateTerritoryChart=(active,zlsAllocations)=>{
      if(!territoryImpactCard)return;
      const base=blankTerritoryGeneration();
      const additions=blankTerritoryGeneration();
      territoryMeta.forEach(territory=>{
        ['wind','solar'].forEach(technology=>{
          const existingLayer=`existing-${technology}`;
          const approvedLayer=`approved-${technology}`;
          const pipelineLayer=`pipeline-${technology}`;
          if(active.has(existingLayer))base[territory.id][technology]+=existingTerritoryGeneration[territory.id][technology];
          if(active.has(approvedLayer))base[territory.id][technology]+=approvedTerritoryGeneration[territory.id][technology];
          if(active.has(pipelineLayer))base[territory.id][technology]+=pipelineTerritoryGeneration[territory.id][technology];
          const zlsLayer=`zls-${technology}`;
          if(active.has(zlsLayer))additions[territory.id][technology]+=zlsAllocations[technology].byTerritory[territory.id];
        });
      });
      const constrainedView=impactMode&&activeTerritorialConstraint!=='maximum';
      const totals=blankTerritoryGeneration();
      territoryMeta.forEach(territory=>['wind','solar'].forEach(technology=>{
        totals[territory.id][technology]=additions[territory.id][technology]+(constrainedView?0:base[territory.id][technology]);
      }));
      const subtitle=territoryImpactCard.querySelector('[data-pts-territory-subtitle]');
      const caveat=territoryImpactCard.querySelector('[data-pts-territory-caveat]');
      if(subtitle)subtitle.textContent=constrainedView
        ?`Nueva generación ZLS repartida con el criterio «${territorialConstraintLabels[activeTerritorialConstraint]}».`
        :'Generación total seleccionada: instalaciones de partida más nueva generación ZLS.';
      if(caveat)caveat.textContent=constrainedView
        ?'Para que pueda verse la igualdad buscada, esta vista muestra únicamente la nueva generación ZLS que se está distribuyendo; la generación existente, aprobada y en tramitación continúa incluida en el indicador energético general. El mapa activa en cada territorio solo las ZLS necesarias, en orden de código oficial, y recorta gráficamente la última cuando la cuota no completa una zona: es una representación proporcional, no una propuesta de emplazamientos. Población: Eustat, 1 de enero de 2025; superficie: Gobierno Vasco.'
        :'Las instalaciones existentes, aprobadas y en tramitación se asignan por dato territorial o localización. Las ZLS se atribuyen por su punto oficial de referencia: es una aproximación indicativa y no divide zonas que atraviesan límites. Población: Eustat, 1 de enero de 2025; superficie: Gobierno Vasco.';
      const metricDefinition={
        total:{unit:'GWh/año',convert:(gwh)=>gwh,digits:1},
        person:{unit:'kWh/persona·año',convert:(gwh,territory)=>gwh*1e6/territory.population,digits:0},
        area:{unit:'MWh/km²·año',convert:(gwh,territory)=>gwh*1000/territory.areaKm2,digits:0},
      }[activeTerritoryMetric]||null;
      const rows=territoryMeta.map(territory=>{
        const wind=metricDefinition.convert(totals[territory.id].wind,territory);
        const solar=metricDefinition.convert(totals[territory.id].solar,territory);
        return {...territory,wind,solar,total:wind+solar};
      });
      const maximum=Math.max(1,...rows.map(row=>row.total));
      territoryImpactCard.querySelector('[data-pts-territory-chart]').innerHTML=rows.map(row=>`<div class="pts-territory-row"><div class="pts-territory-label"><span>${row.label}</span><strong>${formatNumber(row.total,metricDefinition.digits)} ${metricDefinition.unit}</strong></div><div class="pts-territory-track" role="img" aria-label="${row.label}: ${formatNumber(row.wind,metricDefinition.digits)} ${metricDefinition.unit} de eólica y ${formatNumber(row.solar,metricDefinition.digits)} ${metricDefinition.unit} de solar"><span class="is-wind" style="width:${100*row.wind/maximum}%" title="Eólica: ${formatNumber(row.wind,metricDefinition.digits)} ${metricDefinition.unit}"></span><span class="is-solar" style="width:${100*row.solar/maximum}%" title="Solar: ${formatNumber(row.solar,metricDefinition.digits)} ${metricDefinition.unit}"></span></div></div>`).join('');
    };
    const updateEnergyShare=()=>{
      const zlsWindDeploymentShare=selectedDeploymentShare('wind');
      const zlsSolarDeploymentShare=selectedDeploymentShare('solar');
      const zlsAllocations=impactMode?currentZlsAllocations():null;
      const selfConsumptionDeploymentShare=impactMode?Math.max(0,Math.min(1,Number(impactSelfConsumptionSlider?.value||0)/100)):1;
      const selectedSelfConsumptionGWh=impactMode?SELF_CONSUMPTION_DIRECT_2050_GWH*selfConsumptionDeploymentShare:activeElectrificationScenario.selfConsumption;
      const electricityGridDemand=impactMode?activeElectrificationScenario.service-selectedSelfConsumptionGWh:activeElectrificationScenario.grid;
      const registeredElectricShare=100*electricityGridDemand/activeElectrificationScenario.registeredFinal;
      const sourceMarkup=activeElectrificationScenario.sourceUrl?`<a href="${activeElectrificationScenario.sourceUrl}" target="_blank" rel="noopener">${activeElectrificationScenario.sourceLabel}</a>`:activeElectrificationScenario.sourceLabel;
      energyShare.querySelector('[data-pts-energy-intro]').innerHTML=impactMode
        ?`El servicio eléctrico total se mantiene en <strong>${formatNumber(activeElectrificationScenario.service,0)} GWh/año</strong> (electrificación física del 52 %). El dial cubre directamente <strong>${formatNumber(selectedSelfConsumptionGWh,0)} GWh/año</strong> mediante autoconsumo y deja <strong>${formatNumber(electricityGridDemand,0)} GWh/año</strong> por abastecer desde la red. ${sourceMarkup}.`
        :activeElectrificationScenario.id==='current'
        ?`<strong>100 % = ${formatNumber(electricityGridDemand,0)} GWh/año</strong> de consumo final eléctrico en 2024, equivalente al <strong>${formatNumber(activeElectrificationScenario.share,1)} %</strong> de los ${formatNumber(activeElectrificationScenario.registeredFinal,0)} GWh de consumo final. ${sourceMarkup}.`
        :`<strong>100 % = ${formatNumber(electricityGridDemand,0)} GWh/año</strong> de demanda abastecida por la red en 2050 <strong>(electrificación física del ${formatNumber(activeElectrificationScenario.share,1)} %; ${formatNumber(registeredElectricShare,1)} % en el balance registrado tras descontar el autoconsumo)</strong>. El servicio eléctrico total alcanza ${formatNumber(activeElectrificationScenario.service,0)} GWh/año al incluir ${formatNumber(activeElectrificationScenario.selfConsumption,0)} GWh de autoconsumo directo. ${sourceMarkup}.`;
      const active=new Set([...story.querySelectorAll('[data-pts-layer][aria-pressed="true"]')].map(button=>button.dataset.ptsLayer));
      const entries=Object.entries(energyLayers).filter(([id,item])=>active.has(id)&&item.gwh>0).map(([id,item])=>({id,...item}));
      if(active.has('existing-wind')&&!impactMode)entries.push({id:'repowering-wind',label:'Repotenciación eólica potencial',gwh:REPOWERING_ADDITIONAL_GWH,technology:'wind'});
      const selectedGWh=entries.reduce((sum,item)=>sum+item.gwh,0);
      const technologyStyles={wind:{label:'Eólica',color:'#176f9f'},solar:{label:'Solar',color:'#d4a017'}};
      const displayEntries=['wind','solar'].map(technology=>({
        technology,
        ...technologyStyles[technology],
        gwh:entries.filter(item=>item.technology===technology).reduce((sum,item)=>sum+item.gwh,0),
      })).filter(item=>item.gwh>0);
      const zlsWindGWh=active.has('zls-wind')?(impactMode?zlsAllocations.wind.total:zlsGeneration.wind*zlsWindDeploymentShare):0;
      const zlsSolarGWh=active.has('zls-solar')?(impactMode?zlsAllocations.solar.total:zlsGeneration.solar*zlsSolarDeploymentShare):0;
      const zlsGWh=zlsWindGWh+zlsSolarGWh;
      const activeAptitudeEntries=Object.entries(aptitudePotential).filter(([id])=>active.has(id)).map(([id,item])=>({id,...item}));
      const aptitudeValue=(item,field='annualGWhEstimate')=>{
        const outsideZls=Number(item[field])||Number(item.annualGWhEstimate)||0;
        const zlsActive=active.has(item.technology==='wind'?'zls-wind':'zls-solar');
        if(zlsActive)return outsideZls;
        const totalArea=Number(item.totalAreaHa)||0;
        const outsideArea=Number(item.additionalAreaHa)||0;
        return totalArea>0&&outsideArea>0?outsideZls*totalArea/outsideArea:outsideZls;
      };
      const aptitudeGWh=activeAptitudeEntries.reduce((sum,item)=>sum+aptitudeValue(item),0);
      const territorialPotentialGWh=zlsGWh+aptitudeGWh;
      const territorialByTechnology={
        wind:zlsWindGWh+activeAptitudeEntries.filter(item=>item.technology==='wind').reduce((sum,item)=>sum+aptitudeValue(item),0),
        solar:zlsSolarGWh+activeAptitudeEntries.filter(item=>item.technology==='solar').reduce((sum,item)=>sum+aptitudeValue(item),0),
      };
      const generationByTechnology={
        wind:(displayEntries.find(item=>item.technology==='wind')?.gwh||0)+territorialByTechnology.wind,
        solar:(displayEntries.find(item=>item.technology==='solar')?.gwh||0)+territorialByTechnology.solar,
      };
      const totalActiveGWh=generationByTechnology.wind+generationByTechnology.solar;
      const totalActivePct=100*totalActiveGWh/electricityGridDemand;
      const potentialFill=energyShare.querySelector('[data-pts-potential-fill]');
      potentialFill.hidden=!totalActiveGWh;
      potentialFill.style.height=impactMode?'100%':`${Math.min(100,totalActivePct)}%`;
      potentialFill.style.width=impactMode?`${Math.min(100,totalActivePct)}%`:'100%';
      potentialFill.innerHTML=totalActiveGWh?['wind','solar'].filter(technology=>generationByTechnology[technology]>0).map(technology=>{const technologyShare=100*generationByTechnology[technology]/totalActiveGWh;return `<span style="--potential-color:${technologyStyles[technology].color};${impactMode?`width:${technologyShare}%;height:100%`:`height:${technologyShare}%`}" title="${technologyStyles[technology].label}: ${formatNumber(generationByTechnology[technology],1)} GWh/año · ${formatNumber(100*generationByTechnology[technology]/electricityGridDemand,2)} %"></span>`}).join(''):'';
      const aptitudeLow=activeAptitudeEntries.reduce((sum,item)=>sum+aptitudeValue(item,'annualGWhLow'),0);
      const aptitudeHigh=activeAptitudeEntries.reduce((sum,item)=>sum+aptitudeValue(item,'annualGWhHigh'),0);
      const discountedOverlapHa=activeAptitudeEntries.filter(item=>active.has(item.technology==='wind'?'zls-wind':'zls-solar')).reduce((sum,item)=>sum+(Number(item.zlsOverlapHa)||0),0);
      const zlsDetail=impactMode?[zlsWindGWh?`ZLS eólicas al ${formatNumber(100*zlsWindDeploymentShare,0)} %: ${formatNumber(zlsWindGWh,0)} GWh/año.`:'',zlsSolarGWh?`ZLS solares al ${formatNumber(100*zlsSolarDeploymentShare,0)} %: ${formatNumber(zlsSolarGWh,0)} GWh/año.`:''].filter(Boolean).join(' '):(zlsGWh?`ZLS activas: ${formatNumber(zlsGWh,0)} GWh/año.`:'');
      const detailParts=[selectedGWh?`Instalaciones de base: ${formatNumber(selectedGWh,0)} GWh/año.`:'',zlsDetail,aptitudeGWh?`Aptitud activa sin duplicar ZLS: ${formatNumber(aptitudeGWh,0)} GWh/año${Math.abs(aptitudeHigh-aptitudeLow)>.5?` (intervalo ${formatNumber(aptitudeLow,0)}–${formatNumber(aptitudeHigh,0)})`:''}.`:'',discountedOverlapHa?`Solapamiento descontado: ${formatNumber(discountedOverlapHa,0)} ha.`:''].filter(Boolean).join(' ');
      energyShare.querySelector('[data-pts-energy-total]').innerHTML=`<strong>${formatNumber(totalActiveGWh,1)} GWh/año · ${formatNumber(totalActivePct,2)} %</strong><span class="pts-result-explanation">${totalActiveGWh?`Potencial de generación de todas las capas activadas. ${detailParts}${totalActivePct>100?' El potencial supera la demanda anual de referencia; no implica que pueda instalarse ni aprovecharse íntegramente.':''}`:'Activa capas para calcular su generación.'}</span>`;
      energyShare.querySelector('[data-pts-energy-legend]').innerHTML=[...['wind','solar'].filter(technology=>generationByTechnology[technology]>0).map(technology=>`<span><i style="--legend-color:${technologyStyles[technology].color}"></i>${technologyStyles[technology].label} · ${formatNumber(generationByTechnology[technology],1)} GWh · ${formatNumber(100*generationByTechnology[technology]/electricityGridDemand,2)} %</span>`),...(impactMode?[`<span><i style="--legend-color:#168c73"></i>Autoconsumo directo · ${formatNumber(selectedSelfConsumptionGWh,1)} GWh · reduce un ${formatNumber(100*selectedSelfConsumptionGWh/activeElectrificationScenario.service,2)} % la demanda de red</span>`]:[])].join('');
      const unquantifiedAptitude=[...active].some(id=>id.startsWith('aptitude-')&&!aptitudePotential[id]);
      energyShare.querySelector('[data-pts-energy-caveat]').textContent=impactMode
        ?`Simulación lineal para comparar magnitudes con el criterio «${territorialConstraintLabels[activeTerritorialConstraint]}». Los criterios de igualdad se aplican por separado a la nueva generación ZLS eólica y solar; no redistribuyen las instalaciones de base. El dial de autoconsumo no reduce el servicio eléctrico: descuenta de la demanda de red entre 0 y 1.427 GWh/año cubiertos directamente. Los deslizadores no representan proyectos autorizados. La solar actual usa los 66,6 GWh totales vertidos a red; el mapa solo localiza las plantas de 0,7 MW o más.`
        :`El PTS y su PDF todavía son provisionales: sus geometrías pueden ampliarse o modificarse. Las ZLS y aptitudes se usan aquí como áreas de exploración, no como proyectos ni límites definitivos.${activeAptitudeEntries.length?' Alta, media, baja y muy baja muestran un máximo físico-técnico orientativo, calculado con rendimiento continuo y densidad máxima, sin limitarse al umbral de recurso favorable ni al régimen de usos propuesto por el PTS. Si la ZLS de una tecnología está activa, su coincidencia se descuenta de la aptitud; si está desactivada, la aptitud computa toda su superficie. No es producción asegurada, superficie autorizable ni escenario probable.':''}${unquantifiedAptitude?' Existe una capa activa sin estimación energética disponible.':''}${active.has('existing-solar')?' La solar actual usa los 66,6 GWh totales vertidos a red; el mapa solo localiza las plantas de 0,7 MW o más.':''}`;
      updateTerritoryChart(active,zlsAllocations||{wind:zlsAllocation('wind',1),solar:zlsAllocation('solar',1)});
      if(impactMode&&birdImpactCard&&landImpactCard){
        const selectedWindAreaHa=BASE_WIND_AREA_HA+ZLS_WIND_AREA_HA*zlsWindDeploymentShare;
        const currentBirdMortality=CORRECTED_BIRD_MORTALITY_ANNUAL;
        const selectedBirdMortality=BIRD_MORTALITY_PER_HA*selectedWindAreaHa;
        const maxBirdMortality=BIRD_MORTALITY_PER_HA*(BASE_WIND_AREA_HA+ZLS_WIND_AREA_HA);
        const birdFill=birdImpactCard.querySelector('[data-pts-bird-fill]');
        const birdMarker=birdImpactCard.querySelector('[data-pts-bird-marker]');
        birdFill.style.width=`${Math.min(62,62*selectedBirdMortality/maxBirdMortality)}%`;
        birdMarker.style.left=`${Math.min(62,62*currentBirdMortality/maxBirdMortality)}%`;
        birdImpactCard.querySelector('[data-pts-bird-track]').setAttribute('aria-label',`Mortalidad anual ilustrativa: ${formatNumber(selectedBirdMortality,0)} aves; referencia actual: ${formatNumber(currentBirdMortality,0)}. La escala visual permanece abierta y no representa un límite biológico.`);
        birdImpactCard.querySelector('[data-pts-bird-max]').textContent='más mortalidad →';
        birdImpactCard.querySelector('[data-pts-bird-total]').textContent=`≈${formatNumber(selectedBirdMortality,0)} aves/año`;

        const selectedEndangeredBirdMortality=ENDANGERED_BIRD_PER_HA*selectedWindAreaHa;
        const maxEndangeredBirdMortality=ENDANGERED_BIRD_PER_HA*(BASE_WIND_AREA_HA+ZLS_WIND_AREA_HA);
        const endangeredFill=birdImpactCard.querySelector('[data-pts-endangered-fill]');
        const endangeredMarker=birdImpactCard.querySelector('[data-pts-endangered-marker]');
        endangeredFill.style.width=`${Math.min(62,62*selectedEndangeredBirdMortality/maxEndangeredBirdMortality)}%`;
        endangeredMarker.style.left=`${Math.min(62,62*DOCUMENTED_ENDANGERED_BIRD_ANNUAL/maxEndangeredBirdMortality)}%`;
        birdImpactCard.querySelector('[data-pts-endangered-track]').setAttribute('aria-label',`Mortalidad anual ilustrativa de aves catalogadas en peligro de extinción: ${formatNumber(selectedEndangeredBirdMortality,2)}; mínimo histórico documentado: ${formatNumber(DOCUMENTED_ENDANGERED_BIRD_ANNUAL,2)}. La escala visual permanece abierta y no representa un límite biológico.`);
        birdImpactCard.querySelector('[data-pts-endangered-max]').textContent='más mortalidad →';
        birdImpactCard.querySelector('[data-pts-endangered-total]').textContent=`≈${formatNumber(selectedEndangeredBirdMortality,2)}/año`;

        const selectedSolarTotalHa=BASE_SOLAR_TOTAL_HA+(MAX_SOLAR_TOTAL_HA-BASE_SOLAR_TOTAL_HA)*zlsSolarDeploymentShare;
        const selectedCroplandHa=selectedSolarTotalHa*DOCUMENTED_CROPLAND_SHARE;
        const selectedPastureHa=selectedSolarTotalHa*DOCUMENTED_PASTURE_SHARE;
        const currentCroplandHa=CURRENT_SOLAR_TOTAL_HA*DOCUMENTED_CROPLAND_SHARE;
        const currentPastureHa=CURRENT_SOLAR_TOTAL_HA*DOCUMENTED_PASTURE_SHARE;
        const selectedCroplandPct=100*selectedCroplandHa/EUSKADI_CROPLAND_AREA_HA;
        const selectedPasturePct=100*selectedPastureHa/EUSKADI_PERMANENT_PASTURE_AREA_HA;
        const currentCroplandPct=100*currentCroplandHa/EUSKADI_CROPLAND_AREA_HA;
        const currentPasturePct=100*currentPastureHa/EUSKADI_PERMANENT_PASTURE_AREA_HA;
        landImpactCard.querySelector('[data-pts-cropland-fill]').style.width=`${Math.min(100,selectedCroplandPct)}%`;
        landImpactCard.querySelector('[data-pts-pasture-fill]').style.width=`${Math.min(100,selectedPasturePct)}%`;
        landImpactCard.querySelector('[data-pts-cropland-marker]').style.right=`${Math.min(100,currentCroplandPct)}%`;
        landImpactCard.querySelector('[data-pts-cropland-marker]').style.left='auto';
        landImpactCard.querySelector('[data-pts-pasture-marker]').style.right=`${Math.min(100,currentPasturePct)}%`;
        landImpactCard.querySelector('[data-pts-pasture-marker]').style.left='auto';
        landImpactCard.querySelector('[data-pts-cropland-track]').setAttribute('aria-label',`Tierras labradas asociadas al despliegue solar: ${formatNumber(selectedCroplandHa,0)} hectáreas, equivalentes al ${formatNumber(selectedCroplandPct,2)} por ciento de las tierras labradas de Euskadi.`);
        landImpactCard.querySelector('[data-pts-pasture-track]').setAttribute('aria-label',`Pastos permanentes asociados al despliegue solar: ${formatNumber(selectedPastureHa,1)} hectáreas, equivalentes al ${formatNumber(selectedPasturePct,3)} por ciento de los pastos permanentes de Euskadi.`);
        landImpactCard.querySelector('[data-pts-cropland-total]').innerHTML=`<strong>≈−${formatNumber(selectedCroplandHa,0)} ha · −${formatNumber(selectedCroplandPct,2)} %</strong><span class="pts-result-explanation">ocupadas sobre las 84.805 ha de tierras labradas; referencia actual ≈−${formatNumber(currentCroplandHa,0)} ha.</span>`;
        landImpactCard.querySelector('[data-pts-pasture-total]').innerHTML=`<strong>≈−${formatNumber(selectedPastureHa,1)} ha · −${formatNumber(selectedPasturePct,3)} %</strong><span class="pts-result-explanation">ocupadas sobre las 92.206 ha de pastos permanentes; referencia actual ≈−${formatNumber(currentPastureHa,1)} ha.</span>`;

        if(employmentImpactCard){
          const selectedAgrarianHa=selectedCroplandHa+selectedPastureHa;
          const renewableJobs=selectedSolarTotalHa*RENEWABLE_OM_JOBS_PER_100_HA/100;
          const displacedAgriculturalJobs=selectedAgrarianHa*AGRICULTURAL_JOBS_PER_100_HA/100;
          const maxRenewableJobs=MAX_SOLAR_TOTAL_HA*RENEWABLE_OM_JOBS_PER_100_HA/100;
          const sharedJobsScale=Math.max(maxRenewableJobs,1);
          employmentImpactCard.querySelector('[data-pts-renewable-jobs-fill]').style.width=`${Math.min(100,100*renewableJobs/sharedJobsScale)}%`;
          employmentImpactCard.querySelector('[data-pts-agricultural-jobs-fill]').style.width=`${Math.min(100,100*displacedAgriculturalJobs/sharedJobsScale)}%`;
          employmentImpactCard.querySelector('[data-pts-renewable-jobs-track]').setAttribute('aria-label',`Empleo estable asociado a la operación y mantenimiento renovable: aproximadamente ${formatNumber(renewableJobs,0)} puestos.`);
          employmentImpactCard.querySelector('[data-pts-agricultural-jobs-track]').setAttribute('aria-label',`Empleo agrario potencialmente desplazado: aproximadamente ${formatNumber(displacedAgriculturalJobs,1)} puestos.`);
          employmentImpactCard.querySelector('[data-pts-renewable-jobs-total]').innerHTML=`<strong>≈${formatNumber(renewableJobs,0)} empleos</strong><span>operación y mantenimiento renovable asociados</span>`;
          employmentImpactCard.querySelector('[data-pts-agricultural-jobs-total]').innerHTML=`<strong>≈−${formatNumber(displacedAgriculturalJobs,1)} empleos</strong><span>agrarios potencialmente desplazados</span>`;
        }

        if(canonImpactCard){
          const selectedWindTurbines=BASE_WIND_TURBINES+ZLS_WIND_TURBINES*zlsWindDeploymentShare;
          const solarCanon=selectedSolarTotalHa*SOLAR_CANON_EUR_PER_HA;
          const windCanonMin=selectedWindTurbines*WIND_CANON_MIN_EUR_PER_TURBINE;
          const windCanonMax=selectedWindTurbines*WIND_CANON_MAX_EUR_PER_TURBINE;
          const totalCanonMin=solarCanon+windCanonMin;
          const totalCanonMax=solarCanon+windCanonMax;
          const maximumSolarCanon=MAX_SOLAR_TOTAL_HA*SOLAR_CANON_EUR_PER_HA;
          const maximumWindCanon=(BASE_WIND_TURBINES+ZLS_WIND_TURBINES)*WIND_CANON_MAX_EUR_PER_TURBINE;
          const maximumCanon=maximumSolarCanon+maximumWindCanon;
          const formatCurrency=value=>`${formatNumber(value/1000000,value>=1000000?2:3)} M€`;
          const canonFillPct=Math.min(62,62*totalCanonMax/Math.max(maximumCanon,1));
          canonImpactCard.querySelector('[data-pts-canon-fill]').style.width=`${canonFillPct}%`;
          canonImpactCard.querySelector('[data-pts-canon-solar-fill]').style.width=`${Math.min(62,62*solarCanon/Math.max(maximumSolarCanon,1))}%`;
          canonImpactCard.querySelector('[data-pts-canon-wind-fill]').style.width=`${Math.min(62,62*windCanonMax/Math.max(maximumWindCanon,1))}%`;
          canonImpactCard.querySelector('[data-pts-canon-track-value]').textContent=`${formatCurrency(totalCanonMin)}–${formatCurrency(totalCanonMax)}`;
          canonImpactCard.querySelector('[data-pts-canon-total]').innerHTML=`<strong>${formatCurrency(totalCanonMin)}–${formatCurrency(totalCanonMax)} al año</strong><span>canon anual conjunto estimado</span>`;
          canonImpactCard.querySelector('[data-pts-canon-solar]').textContent=`≈${formatCurrency(solarCanon)}/año`;
          canonImpactCard.querySelector('[data-pts-canon-wind]').textContent=`≈${formatCurrency(windCanonMin)}–${formatCurrency(windCanonMax)}/año`;
          canonImpactCard.querySelector('[data-pts-canon-total]').setAttribute('aria-label',`Canon anual conjunto estimado: entre ${formatNumber(totalCanonMin,0)} y ${formatNumber(totalCanonMax,0)} euros.`);
          canonImpactCard.querySelector('[data-pts-canon-track]').setAttribute('aria-label',`Canon anual conjunto estimado: entre ${formatNumber(totalCanonMin,0)} y ${formatNumber(totalCanonMax,0)} euros. La barra muestra una progresión visual abierta y no representa un techo de recaudación.`);
          canonImpactCard.querySelector('[data-pts-canon-solar-track]').setAttribute('aria-label',`Canon solar anual estimado: ${formatNumber(solarCanon,0)} euros.`);
          canonImpactCard.querySelector('[data-pts-canon-wind-track]').setAttribute('aria-label',`Canon eólico anual estimado: entre ${formatNumber(windCanonMin,0)} y ${formatNumber(windCanonMax,0)} euros.`);
        }
        if(localPublicIncomeCard){
          const selectedWindMw=BASE_WIND_MW+ZLS_WIND_REFERENCE_MW*zlsWindDeploymentShare;
          const maximumWindMw=BASE_WIND_MW+ZLS_WIND_REFERENCE_MW;
          const publicLandIncome=selectedWindMw*LABRAZA_PUBLIC_LAND_EUR_PER_MW_YEAR;
          const otherLocalIncome=selectedWindMw*LABRAZA_OTHER_LOCAL_INCOME_EUR_PER_MW_YEAR;
          const totalLocalIncome=publicLandIncome+otherLocalIncome;
          const maximumLocalIncome=maximumWindMw*LABRAZA_LOCAL_PUBLIC_INCOME_EUR_PER_MW_YEAR;
          const publicLandWidth=Math.min(62,62*publicLandIncome/Math.max(maximumLocalIncome,1));
          const otherLocalWidth=Math.min(62-publicLandWidth,62*otherLocalIncome/Math.max(maximumLocalIncome,1));
          const formatLocalCurrency=value=>value>=1000000?`${formatNumber(value/1000000,2)} M€`:`${formatNumber(value/1000,0)} mil €`;
          const publicLandFill=localPublicIncomeCard.querySelector('[data-pts-local-income-land-fill]');
          const otherLocalFill=localPublicIncomeCard.querySelector('[data-pts-local-income-other-fill]');
          publicLandFill.style.width=`${publicLandWidth}%`;
          otherLocalFill.style.left=`${publicLandWidth}%`;
          otherLocalFill.style.width=`${otherLocalWidth}%`;
          localPublicIncomeCard.querySelector('[data-pts-local-income-track-value]').textContent=`≈${formatLocalCurrency(totalLocalIncome)}/año`;
          localPublicIncomeCard.querySelector('[data-pts-local-income-total]').innerHTML=`<strong>≈${formatLocalCurrency(totalLocalIncome)} al año</strong><span>referencia local recurrente extrapolada a ${formatNumber(selectedWindMw,1)} MW eólicos seleccionados</span>`;
          localPublicIncomeCard.querySelector('[data-pts-local-income-land]').textContent=`≈${formatLocalCurrency(publicLandIncome)}/año`;
          localPublicIncomeCard.querySelector('[data-pts-local-income-other]').textContent=`≈${formatLocalCurrency(otherLocalIncome)}/año`;
          localPublicIncomeCard.querySelector('[data-pts-local-income-track]').setAttribute('aria-label',`Otros ingresos públicos locales anuales extrapolados con la referencia de Labraza: ${formatNumber(totalLocalIncome,0)} euros; de ellos, ${formatNumber(publicLandIncome,0)} euros por ocupación de montes públicos y ${formatNumber(otherLocalIncome,0)} euros por otros impuestos y cánones no desglosados.`);
        }
      }
    };
    energyShare.querySelectorAll('[data-pts-electrification]').forEach(button=>button.addEventListener('click',()=>{
      const scenario=ELECTRIFICATION_SCENARIOS[button.dataset.ptsElectrification];
      if(!scenario)return;
      activeElectrificationScenario=scenario;
      energyShare.querySelectorAll('[data-pts-electrification]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
      updateEnergyShare();
    }));
    const detailModal=document.createElement('div');
    detailModal.className='map-detail-modal';
    detailModal.hidden=true;
    detailModal.setAttribute('role','dialog');
    detailModal.setAttribute('aria-modal','true');
    detailModal.setAttribute('aria-label','Ficha completa de la instalación');
    detailModal.innerHTML='<div class="map-detail-modal-card"><div class="map-detail-modal-head"><strong>Información completa</strong><button type="button" class="map-detail-modal-close">Cerrar</button></div><div class="map-detail-modal-body"></div></div>';
    fullscreenPanel.append(detailModal);
    const detailModalBody=detailModal.querySelector('.map-detail-modal-body');
    const detailModalClose=detailModal.querySelector('.map-detail-modal-close');
    const detailModalTitle=detailModal.querySelector('.map-detail-modal-head strong');
    let detailReturnFocus=null;
    const closeDetailModal=()=>{
      detailModal.hidden=true;
      detailModalBody.replaceChildren();
      detailReturnFocus?.focus();
      detailReturnFocus=null;
    };
    const ensureDetailAction=()=>{
      if(!detailPanel?.querySelector('dl')||detailPanel.querySelector('.map-detail-more'))return;
      const button=document.createElement('button');
      button.type='button';
      button.className='map-detail-more';
      button.textContent='Ver ficha completa';
      button.setAttribute('aria-label','Abrir la ficha completa de esta instalación en una ventana');
      button.addEventListener('click',()=>{
        detailReturnFocus=button;
        const copy=detailPanel.cloneNode(true);
        copy.querySelector('.map-detail-more')?.remove();
        detailModalTitle.textContent=detailPanel.querySelector('h5')?.textContent?.trim()||'Información completa';
        detailModalBody.replaceChildren(...copy.childNodes);
        detailModal.hidden=false;
        detailModalClose.focus();
      });
      detailPanel.prepend(button);
    };
    new MutationObserver(()=>requestAnimationFrame(ensureDetailAction)).observe(detailPanel,{childList:true});
    detailModalClose.addEventListener('click',closeDetailModal);
    detailModal.addEventListener('click',event=>{if(event.target===detailModal)closeDetailModal()});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!detailModal.hidden)closeDetailModal()});
    const setWindowExpanded=active=>{
      fullscreenPanel?.classList.toggle('is-window-expanded',active);
      document.documentElement.classList.toggle('pts-map-window-open',active);
      if(expandButton){
        expandButton.textContent=active?'Cerrar ampliación':'Ampliar mapa';
        expandButton.setAttribute('aria-pressed',String(active));
      }
    };
    expandButton?.addEventListener('click',()=>setWindowExpanded(!fullscreenPanel?.classList.contains('is-window-expanded')));
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&detailModal.hidden&&fullscreenPanel?.classList.contains('is-window-expanded'))setWindowExpanded(false);
    });
    const updateFullscreenLabel=()=>{
      const active=document.fullscreenElement===fullscreenPanel;
      if(!fullscreenButton)return;
      fullscreenButton.textContent=active?'Salir de pantalla completa':'Pantalla completa';
      fullscreenButton.setAttribute('aria-pressed',String(active));
    };
    fullscreenButton?.addEventListener('click',async()=>{
      try{
        if(document.fullscreenElement===fullscreenPanel)await document.exitFullscreen();
        else await fullscreenPanel.requestFullscreen();
      }catch(error){
        fullscreenPanel?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
    document.addEventListener('fullscreenchange',updateFullscreenLabel);
    updateFullscreenLabel();

    const renderMap=async()=>{
      if(!story.open||rendered)return;
      rendered=true;
      const host=story.querySelector('[data-pts-map-canvas]');
      const detail=story.querySelector('[data-pts-map-detail]');
      const legend=detail?.querySelector('.pts-map-legend');
      if(legend&&!legend.querySelector('[data-pts-artificialized-legend]'))legend.insertAdjacentHTML('beforeend','<span data-pts-artificialized-legend><i style="background:#66517a;border:0"></i>Suelo artificializado</span>');
      try{
        const sets=await Promise.all(layers.filter(layer=>!['contours','wind-resource'].includes(layer.kind)).map(async layer=>{
          if(layer.kind==='generation-area'&&layer.file){
            const windAreas=await loadGeoJson(layer.file,'20261112b');
            if(['pipeline-wind','approved-wind'].includes(layer.id)){
              const sourceProjects=layer.id==='pipeline-wind'?window.energyMapGenerationPipeline?.projects:window.energyMapGenerationProjects?.projects;
              const projects=new Map((sourceProjects||[]).map(project=>[project.id,project]));
              windAreas.features=windAreas.features.map(feature=>{
                const project=projects.get(feature.properties?.id)||{};
                const area=Number(feature.properties?.comparable_area_ha);
                const officialPolygon=feature.properties?.representation==='official_administrative_polygon';
                return {...feature,properties:{
                  ...feature.properties,
                  technology:'wind',
                  mw:Number(project.mw)||Number(feature.properties?.mw)||0,
                  statusLabel:project.stageLabel||project.statusLabel||feature.properties?.statusLabel||(layer.id==='pipeline-wind'?'En tramitación':'Autorizado'),
                  approvalDate:project.stageDate||project.approvalDate||feature.properties?.approvalDate||'',
                  municipalities:project.municipalities||feature.properties?.municipalities||[],
                  area:`${area.toLocaleString('es-ES',{maximumFractionDigits:2})} ha${officialPolygon?' de poligonal oficial':' de área territorial comparable'}`,
                  locationNote:project.locationNote||'',
                  note:[feature.properties?.note,project.note].filter(Boolean).join(' '),
                  detailData:project,
                }};
              });
            }
            return {...layer,data:windAreas};
          }
          if(layer.kind==='generation-area')return {...layer,data:generatedAreaCollection(layer)};
          const data=await loadGeoJson(layer.file,'20261112b');
          const mapped=['urban','artificialized','existing-wind'].includes(layer.kind)?data:windCollection(data);
          return {...layer,data:layer.kind==='existing-wind'
            ? {...mapped,features:mapped.features.filter(feature=>feature.properties?.representation==='repowering_max_envelope')}
            : layer.kind==='aptitude'
              ? {...mapped,features:mapped.features.filter(feature=>String(feature.properties?.APTITUD||'').toUpperCase()===layer.aptitudeValue)}
              : mapped};
        }));
        host.innerHTML='';
        const W=820,H=500;
        const territory=windCollection(window.energyMapTerritories);
        const projection=d3.geoMercator().fitExtent([[14,14],[W-14,H-14]],territory);
        const path=d3.geoPath(projection);
        const svg=d3.select(host).append('svg')
          .attr('viewBox',`0 0 ${W} ${H}`)
          .attr('role','img')
          .attr('aria-label','Mapa del PTS con exclusiones, aptitudes, Zonas de Localización Seleccionada, curvas de nivel, suelo artificializado y áreas de instalaciones renovables');
        const defs=svg.append('defs');
        const pattern=defs.append('pattern').attr('id',svgId('exclusion-hatch')).attr('patternUnits','userSpaceOnUse').attr('width',8).attr('height',8).attr('patternTransform','rotate(35)');
        pattern.append('rect').attr('width',8).attr('height',8).attr('fill','#ad2430');
        pattern.append('line').attr('y2',8).attr('stroke','#fff').attr('stroke-width',2).attr('opacity',.7);
        const windPipelinePattern=defs.append('pattern').attr('id',svgId('wind-pipeline-hatch')).attr('patternUnits','userSpaceOnUse').attr('width',2.4).attr('height',2.4).attr('patternTransform','rotate(35)');
        windPipelinePattern.append('line').attr('y2',2.4).attr('stroke','#176f9f').attr('stroke-width',.9);
        const windApprovedPattern=defs.append('pattern').attr('id',svgId('wind-approved-dots')).attr('patternUnits','userSpaceOnUse').attr('width',1.6).attr('height',1.6);
        windApprovedPattern.append('circle').attr('cx',.8).attr('cy',.8).attr('r',.34).attr('fill','#3f9fc9');
        const windExistingPattern=defs.append('pattern').attr('id',svgId('wind-existing-crosshatch')).attr('patternUnits','userSpaceOnUse').attr('width',2.8).attr('height',2.8);
        windExistingPattern.append('path').attr('d','M0,0 L2.8,2.8 M2.8,0 L0,2.8').attr('fill','none').attr('stroke','#005b96').attr('stroke-width',.6);
        const solarPipelinePattern=defs.append('pattern').attr('id',svgId('solar-pipeline-hatch')).attr('patternUnits','userSpaceOnUse').attr('width',2.4).attr('height',2.4).attr('patternTransform','rotate(35)');
        solarPipelinePattern.append('line').attr('y2',2.4).attr('stroke','#d35f1d').attr('stroke-width',.9);
        const solarApprovedPattern=defs.append('pattern').attr('id',svgId('solar-approved-dots')).attr('patternUnits','userSpaceOnUse').attr('width',1.6).attr('height',1.6);
        solarApprovedPattern.append('circle').attr('cx',.8).attr('cy',.8).attr('r',.34).attr('fill','#bd6500');
        const solarExistingPattern=defs.append('pattern').attr('id',svgId('solar-existing-crosshatch')).attr('patternUnits','userSpaceOnUse').attr('width',2.8).attr('height',2.8);
        solarExistingPattern.append('path').attr('d','M0,0 L2.8,2.8 M2.8,0 L0,2.8').attr('fill','none').attr('stroke','#874700').attr('stroke-width',.6);
        const solarRejectedPattern=defs.append('pattern').attr('id',svgId('solar-rejected-crosshatch')).attr('patternUnits','userSpaceOnUse').attr('width',3.2).attr('height',3.2);
        solarRejectedPattern.append('path').attr('d','M0,0 L3.2,3.2 M3.2,0 L0,3.2').attr('fill','none').attr('stroke','#8d3d4b').attr('stroke-width',.65);
        const viewport=svg.append('g').attr('class','pts-map-viewport');
        viewport.append('path').datum(territory).attr('d',path).attr('fill','#eef4f1').attr('stroke','#6d8d83').attr('stroke-width',.28).attr('stroke-opacity',.34);
        const groups=new Map();
        defs.append('clipPath').attr('id',svgId('wind-resource-territory-clip')).append('path').datum(territory).attr('d',path);
        const windResourceBounds={west:-3.79,south:42.15,east:-1.62,north:43.57};
        const windResourceNorthWest=projection([windResourceBounds.west,windResourceBounds.north]);
        const windResourceSouthEast=projection([windResourceBounds.east,windResourceBounds.south]);
        const windResourceGroup=viewport.append('g').attr('class','pts-map-layer').attr('data-layer','wind-resource').style('display','none').style('pointer-events','none');
        windResourceGroup.append('image')
          .attr('href',new URL('data/pts-map/RECURSO_EOLICO_100M_PTS_2026.webp?v=20261112a',scriptBase).href)
          .attr('x',windResourceNorthWest[0]).attr('y',windResourceNorthWest[1])
          .attr('width',windResourceSouthEast[0]-windResourceNorthWest[0]).attr('height',windResourceSouthEast[1]-windResourceNorthWest[1])
          .attr('preserveAspectRatio','none').attr('clip-path',`url(#${svgId('wind-resource-territory-clip')})`);
        groups.set('wind-resource',windResourceGroup);
        const drawContours=data=>{
          if(groups.has('contours'))return groups.get('contours');
          const group=viewport.insert('g','g.pts-map-layer').attr('class','pts-map-layer').attr('data-layer','contours');
          groups.set('contours',group);
          group.append('path')
            .datum(data)
            .attr('class','pts-contour-feature')
            .attr('d',path)
            .attr('fill','none')
            .attr('stroke','#778b84')
            .attr('stroke-width',.34)
            .attr('stroke-opacity',.54)
            .attr('vector-effect','non-scaling-stroke')
            .style('pointer-events','none');
          return group;
        };
        let contourLoadPromise=null;
        const ensureContours=async()=>{
          if(groups.has('contours'))return groups.get('contours');
          if(!contourLoadPromise)contourLoadPromise=loadGeoJson('pts-map/contours-200m-2026.geojson','20261112b')
            .then(drawContours)
            .catch(error=>{contourLoadPromise=null;throw error;});
          return contourLoadPromise;
        };
        const normalizeMunicipalityName=name=>String(name||'').split(' / ').join('/').split('/ ').join('/').split(' /').join('/').replace(/^Arrankudiaga-Zollo$/,'Arrankudiaga');
        const populationValues=new Map((window.energyMapPopulations?.populations||[]).map(([name,value])=>[normalizeMunicipalityName(name),Number(value)]));
        const populationLabels=windCollection(window.energyMapMunicipalities).features
          .map(feature=>({feature,name:feature.properties?.NOMBRE_CAS||'Municipio',population:populationValues.get(normalizeMunicipalityName(feature.properties?.NOMBRE_CAS))||0}))
          .filter(item=>item.population>=20000);

        const featureTransform=(layer,feature)=>{
          if(layer.kind!=='existing-wind'||feature.properties?.park!=='Elgea–Urkilla')return null;
          const [centerX,centerY]=projection(d3.geoCentroid(feature));
          return `translate(${centerX} ${centerY}) scale(1 .84) translate(${-centerX} ${-centerY})`;
        };
        sets.forEach(layer=>{
          const group=viewport.append('g').attr('class','pts-map-layer').attr('data-layer',layer.id);
          groups.set(layer.id,group);
          if(['existing-wind','approved-wind','pipeline-wind','existing-solar','approved-solar','pipeline-solar','rejected-solar'].includes(layer.id)){
            layer.data.features.forEach((feature,index)=>{
              defs.append('clipPath')
                .attr('id',svgId(`${layer.id}-clip-${index}`))
                .attr('clipPathUnits','userSpaceOnUse')
                .append('path')
                .datum(feature)
                .attr('d',path)
                .attr('transform',featureTransform(layer,feature))
                .attr('fill-rule','evenodd');
            });
          }
          group.selectAll('path').data(layer.data.features).join('path')
            .attr('class',layer.kind==='urban'?'pts-map-feature pts-urban-feature':layer.kind==='artificialized'?'pts-map-feature pts-artificialized-feature':'pts-map-feature')
            .attr('d',path)
            .attr('transform',feature=>featureTransform(layer,feature))
            .attr('fill-rule','evenodd')
            .attr('fill',feature=>layer.kind==='generation-area'
              ? layer.id==='pipeline-wind'
                ? `url(#${svgId('wind-pipeline-hatch')})`
                : layer.id==='approved-wind'
                  ? `url(#${svgId('wind-approved-dots')})`
                  : layer.id==='pipeline-solar'
                    ? `url(#${svgId('solar-pipeline-hatch')})`
                    : layer.id==='approved-solar'
                      ? `url(#${svgId('solar-approved-dots')})`
                      : layer.id==='rejected-solar'
                        ? `url(#${svgId('solar-rejected-crosshatch')})`
                      : layer.id==='existing-solar'
                        ? `url(#${svgId('solar-existing-crosshatch')})`
                  : layer.color
              : layer.kind==='existing-wind'
              ? `url(#${svgId('wind-existing-crosshatch')})`
              : layer.kind==='roads'
              ? 'none'
              : layer.kind==='exclusion'
              ? `url(#${svgId('exclusion-hatch')})`
              : layer.kind==='aptitude'
                ? aptitudeColor(feature.properties?.APTITUD,layer.tech)
                : layer.kind==='urban'
                  ? '#17211e'
                  : layer.kind==='artificialized'
                    ? '#66517a'
                  : layer.tech==='Eólica'?'#2988ba':'#c58b00')
            .attr('fill-opacity',feature=>layer.kind==='generation-area'
              ? 1
              : layer.kind==='existing-wind'
              ? 1
              : layer.kind==='urban'?.72:layer.kind==='artificialized'?.34:layer.kind==='zls'?1:.58)
            .attr('stroke',feature=>layer.kind==='generation-area'
              ? layer.id==='pipeline-wind'
                ? '#0c5f8d'
                : layer.id==='approved-wind'
                  ? '#287da8'
                  : layer.id==='pipeline-solar'
                    ? '#a94916'
                    : layer.id==='approved-solar'
                      ? '#9f5400'
                      : layer.id==='rejected-solar'
                        ? '#6f2534'
                      : layer.id==='existing-solar'
                        ? '#703a00'
                  : 'none'
              : layer.kind==='existing-wind'
              ? '#004f83'
              : layer.kind==='roads'
                ? '#8b9692'
                : layer.kind==='urban'
                  ? '#8b9692'
                  : layer.kind==='artificialized'
                    ? 'none'
                  : layer.kind==='zls'
                    ? 'none'
                    : layer.kind==='aptitude'
                      ? aptitudeColor(feature.properties?.APTITUD,layer.tech)
                      : '#fff')
            .attr('stroke-width',feature=>layer.kind==='generation-area'
              ? ['approved-wind','pipeline-wind','existing-solar','approved-solar','pipeline-solar','rejected-solar'].includes(layer.id)?1.4:0
              : layer.kind==='existing-wind'
              ? 1.4
              : layer.kind==='roads'?.68:layer.kind==='urban'?.18:layer.kind==='artificialized'?0:['zls','aptitude'].includes(layer.kind)?0:.2)
            .attr('stroke-opacity',1)
            .attr('stroke-linecap',layer.kind==='roads'?'round':null)
            .attr('clip-path',(feature,index)=>['existing-wind','approved-wind','pipeline-wind','existing-solar','approved-solar','pipeline-solar','rejected-solar'].includes(layer.id)?`url(#${svgId(`${layer.id}-clip-${index}`)})`:null)
            .attr('vector-effect',['existing-wind','approved-wind','pipeline-wind','existing-solar','approved-solar','pipeline-solar','rejected-solar'].includes(layer.id)?'non-scaling-stroke':null)
            .on('mouseenter click',(event,feature)=>{
              const properties=feature.properties||{};
              if(layer.kind==='roads'){
                detail.innerHTML=`<h5>${properties.codigo||'Carretera principal'}</h5><p><strong>Jerarquía:</strong> ${properties.jerarquia||'Red principal'}.</p><p>Capa orientativa de la Base Topográfica Armonizada del Gobierno Vasco. Incluye la red de interés preferente y la red básica.</p>`;
                return;
              }
              if(layer.kind==='urban'){
                const area=Number(properties.superficie_ha);
                detail.innerHTML=`<h5>Suelo urbano · ${properties.municipio||'Municipio'}</h5><p><strong>Superficie representada:</strong> ${area.toLocaleString('es-ES',{maximumFractionDigits:1})} ha.</p><p>Incluye suelo urbano consolidado y no consolidado de uso residencial y de actividades económicas. No incluye suelo urbanizable futuro ni sistemas generales aislados.</p>`;
                return;
              }
              if(layer.kind==='artificialized'){
                const area=Number(properties.superficie_ha);
                const analysis=layer.data.metadata?.analysis||{};
                const zlsSolar=analysis.solapes_pts?.['ZLS solar'];
                detail.innerHTML=`<h5>Suelo artificializado · ${properties.municipio||'Municipio'}</h5><p><strong>Categoría:</strong> ${properties.categoria||'No indicada'}.</p><p><strong>Superficie representada:</strong> ${area.toLocaleString('es-ES',{maximumFractionDigits:1})} ha.</p><p>La capa reconstruye la definición estadística de Eustat con UDALPLAN: residencial, actividades económicas y sistemas generales sin zonas verdes. <strong>No equivale a suelo libre ni a potencial fotovoltaico.</strong></p>${zlsSolar?`<p class="map-data-note">En el conjunto de Euskadi solo ${formatNumber(zlsSolar.solape_ha,1)} ha coinciden con ZLS solares (${formatNumber(zlsSolar.porcentaje_capa_pts,2)} % de su superficie). La mayor parte del potencial sobre cubiertas y aparcamientos queda fuera de la lógica territorial de las grandes plantas sobre suelo.</p>`:''}<span class="map-source-badge"><a href="https://www.eustat.eus/elementos/tbl0014152_c.html" target="_blank" rel="noopener">Eustat · suelo artificializado 2024</a> · <a href="https://www.geo.euskadi.eus/udalplan-cartografia-del-planeamiento-municipal-en-el-pais-vasco/webgeo00-catalog/es/" target="_blank" rel="noopener">UDALPLAN 2024</a></span>`;
                return;
              }
              if(layer.kind==='existing-wind'){
                detail.innerHTML=existingWindDetailMarkup(properties,feature);
                return;
              }
              if(layer.kind==='generation-area'){
                detail.innerHTML=projectDetailMarkup(properties,layer);
                return;
              }
              const title=layer.kind==='zls'
                ? `ZLS ${layer.tech.toLowerCase()} · ${properties.CODIGO||'sin código'}`
                : layer.kind==='exclusion'
                  ? `Zona de exclusión ${layer.tech.toLowerCase()}`
                  : `Aptitud ${String(properties.APTITUD||'no indicada').toLowerCase()} · ${layer.tech.toLowerCase()}`;
              const area=Number(properties.HECTARIAS);
              detail.innerHTML=`<h5>${title}</h5><p><strong>Tipo:</strong> ${layer.kind==='zls'?'Zona de Localización Seleccionada':layer.kind==='exclusion'?'Exclusión normativa':'Graduación de aptitud territorial'}.</p>${Number.isFinite(area)?`<p><strong>Superficie:</strong> ${area.toLocaleString('es-ES',{maximumFractionDigits:1})} ha.</p>`:''}<p>${layer.kind==='zls'?'Potencial territorial: no equivale a proyecto ni autorización.':layer.kind==='exclusion'?'El criterio de exclusión prevalece para instalaciones medianas y grandes de esta tecnología.':'Combina recurso favorable y sensibilidad ambiental; debe leerse junto con las exclusiones.'}</p>`;
            });
          if(layer.kind==='urban'){
            group.selectAll('text.pts-urban-label').data(populationLabels).join('text')
              .attr('class','pts-urban-label')
              .attr('x',item=>projection(d3.geoCentroid(item.feature))[0])
              .attr('y',item=>projection(d3.geoCentroid(item.feature))[1])
              .attr('text-anchor','middle')
              .text(item=>item.name);
          }
        });
        groups.get('urban')?.selectAll('text.pts-urban-label').raise();

        viewport.append('path').datum(territory).attr('d',path).attr('fill','none').attr('stroke','#315b51').attr('stroke-width',.48).attr('stroke-opacity',.42).style('pointer-events','none');
        const zoom=d3.zoom()
          .scaleExtent([1,12])
          .extent([[0,0],[W,H]])
          .translateExtent([[0,0],[W,H]])
          .filter(event=>event.type==='wheel'?(event.ctrlKey||event.metaKey):!event.button)
          .on('zoom',event=>viewport.attr('transform',event.transform));
        svg.call(zoom).on('dblclick.zoom',null);
        const zoomControls=document.createElement('div');
        zoomControls.className='pts-map-zoom-controls';
        zoomControls.setAttribute('aria-label','Controles de zoom del mapa');
        zoomControls.innerHTML='<button type="button" data-pts-zoom-in aria-label="Acercar mapa" title="Acercar">+</button><button type="button" data-pts-zoom-out aria-label="Alejar mapa" title="Alejar">−</button><button type="button" data-pts-zoom-reset aria-label="Restablecer vista del mapa" title="Restablecer vista">↺</button>';
        host.append(zoomControls);
        zoomControls.querySelector('[data-pts-zoom-in]').addEventListener('click',()=>svg.transition().duration(220).call(zoom.scaleBy,1.6));
        zoomControls.querySelector('[data-pts-zoom-out]').addEventListener('click',()=>svg.transition().duration(220).call(zoom.scaleBy,1/1.6));
        zoomControls.querySelector('[data-pts-zoom-reset]').addEventListener('click',()=>svg.transition().duration(260).call(zoom.transform,d3.zoomIdentity));
        const update=()=>{
          const opacityInput=story.querySelector('[data-pts-opacity]');
          const opacity=opacityInput?Number(opacityInput.value)/100:.68;
          const zlsWindDeploymentShare=selectedDeploymentShare('wind');
          const zlsSolarDeploymentShare=selectedDeploymentShare('solar');
          const zlsAllocations=impactMode?currentZlsAllocations():null;
          if(impactMode)groups.forEach(group=>group.style('display','none'));
          story.querySelectorAll('[data-pts-layer]').forEach(button=>{
            const active=button.getAttribute('aria-pressed')==='true';
            const group=groups.get(button.dataset.ptsLayer);
            group?.style('display',active?null:'none').style('opacity',['urban','artificialized','roads','contours','existing-wind','approved-wind','pipeline-wind','existing-solar','approved-solar','pipeline-solar','rejected-solar'].includes(button.dataset.ptsLayer)?1:opacity);
            if(impactMode&&group&&['zls-wind','zls-solar'].includes(button.dataset.ptsLayer)){
              const technology=button.dataset.ptsLayer==='zls-wind'?'wind':'solar';
              const allocation=zlsAllocations[technology];
              const rows=group.selectAll('path.pts-map-feature').nodes().map((node,index)=>{
                const feature=d3.select(node).datum();
                const model=zlsFeatureModelData(feature,technology);
                return {node,index,feature,...model};
              });
              const grouped=rows.reduce((result,row)=>{
                const key=row.territoryId||'unknown';
                if(!result.has(key))result.set(key,[]);
                result.get(key).push(row);
                return result;
              },new Map());
              grouped.forEach((territoryRows,territoryId)=>{
                let remaining=Math.max(0,Number(allocation.byTerritory[territoryId])||0);
                territoryRows.sort((a,b)=>a.code.localeCompare(b.code,'es',{numeric:true})).forEach(row=>{
                  const zoneGWh=Math.max(0,row.annualGWh);
                  const fraction=zoneGWh>0?Math.max(0,Math.min(1,remaining/zoneGWh)):0;
                  row.node.style.display=fraction>0.0001?'':'none';
                  row.node.dataset.ptsSelectedFraction=String(fraction);
                  if(fraction>0.0001&&fraction<0.9999){
                    const clipId=svgId(`impact-${technology}-selection-${row.index}`);
                    let clip=defs.select(`#${clipId}`);
                    if(clip.empty())clip=defs.append('clipPath').attr('id',clipId).attr('clipPathUnits','userSpaceOnUse').append('rect').attr('data-pts-zls-selection-clip','');
                    const box=row.node.getBBox();
                    defs.select(`#${clipId}`).select('rect')
                      .attr('x',box.x).attr('y',box.y)
                      .attr('width',Math.max(0,box.width*fraction)).attr('height',Math.max(0,box.height));
                    row.node.setAttribute('clip-path',`url(#${clipId})`);
                  }else row.node.removeAttribute('clip-path');
                  remaining=Math.max(0,remaining-zoneGWh*fraction);
                });
              });
            }
          });
          if(impactMode){
            const windOutput=story.querySelector('[data-pts-impact-wind-output]');
            const solarOutput=story.querySelector('[data-pts-impact-solar-output]');
            const selfConsumptionOutput=story.querySelector('[data-pts-impact-self-consumption-output]');
            const windLimit=territorialConstraintProfile('wind').maxShare*100;
            const solarLimit=territorialConstraintProfile('solar').maxShare*100;
            if(windOutput)windOutput.textContent=`${formatNumber(zlsWindDeploymentShare*100,1)} % eólico${windLimit<99.95?` · tope ${formatNumber(windLimit,1)} %`:''}`;
            if(solarOutput)solarOutput.textContent=`${formatNumber(zlsSolarDeploymentShare*100,1)} % solar${solarLimit<99.95?` · tope ${formatNumber(solarLimit,1)} %`:''}`;
            if(selfConsumptionOutput){
              const share=Math.max(0,Math.min(1,Number(impactSelfConsumptionSlider?.value||0)/100));
              selfConsumptionOutput.textContent=`${formatNumber(share*100,1)} % · ${formatNumber(SELF_CONSUMPTION_DIRECT_2050_GWH*share,0)} GWh/año`;
            }
          }
          const windAptitudeActive=[...story.querySelectorAll('[data-pts-layer^="aptitude-wind-"]')].some(button=>button.getAttribute('aria-pressed')==='true');
          const solarAptitudeActive=[...story.querySelectorAll('[data-pts-layer^="aptitude-solar-"]')].some(button=>button.getAttribute('aria-pressed')==='true');
          const anyAptitudeActive=windAptitudeActive||solarAptitudeActive;
          aptitudeScale.innerHTML=[windAptitudeActive?aptitudeScaleMarkup('Eólica',windAptitudeColors):'',solarAptitudeActive?aptitudeScaleMarkup('Fotovoltaica',solarAptitudeColors):''].filter(Boolean).join('<span class="pts-aptitude-scale-divider" aria-hidden="true"></span>');
          aptitudeScale.hidden=!anyAptitudeActive;
          aptitudeScale.setAttribute('aria-hidden',String(!anyAptitudeActive));
          const windResourceActive=story.querySelector('[data-pts-layer="wind-resource"]')?.getAttribute('aria-pressed')==='true';
          windResourceScale.hidden=!windResourceActive;
          windResourceScale.setAttribute('aria-hidden',String(!windResourceActive));
          updateEnergyShare();
        };
        story.querySelectorAll('[data-pts-layer]').forEach(button=>button.addEventListener('click',async()=>{
          const active=button.getAttribute('aria-pressed')!=='true';
          button.setAttribute('aria-pressed',String(active));
          if(button.dataset.ptsLayer==='contours'&&active&&!groups.has('contours')){
            button.disabled=true;
            const originalText=button.textContent;
            button.textContent='Cargando curvas…';
            try{await ensureContours();}
            catch(error){
              button.setAttribute('aria-pressed','false');
              detail.innerHTML='<h5>Curvas de nivel</h5><p>No se ha podido cargar esta capa de contexto. El resto del mapa sigue disponible.</p>';
            }finally{
              button.disabled=false;
              button.textContent=originalText;
            }
          }
          update();
          if(button.dataset.ptsLayer==='wind-resource'&&active){
            detail.innerHTML='<h5>Recurso eólico medio a 100 m</h5><p>Simulación WRF empleada por el PTS, con un periodo representativo de diez años y resolución de 1 km.</p><p><strong>Umbral de recurso favorable del PTS:</strong> 6,22 m/s de velocidad media a 100 m, o más de 2.650 horas equivalentes anuales.</p><p class="map-data-note"><strong>Cautela.</strong> La memoria publica esta información como figura raster, no como capa GIS. Su ajuste al visor es aproximado y solo permite interpretar patrones regionales; no debe utilizarse para medir parcelas.</p><span class="map-source-badge"><a href="https://www.euskadi.eus/contenidos/informacion/pts_fase_ap_defi/es_def/adjuntos/DEFINITIVA-DOC-I-MEMORIA.pdf" target="_blank" rel="noopener">PTS de Energías Renovables · Memoria, figura 2</a></span>';
          }
        }));
        story.querySelector('[data-pts-opacity]')?.addEventListener('input',update);
        territorialConstraintControl?.querySelectorAll('input[type="radio"]').forEach(input=>input.addEventListener('change',()=>{
          if(!input.checked)return;
          activeTerritorialConstraint=input.value||'maximum';
          activeTerritoryMetric={
            'equal-total':'total',
            'equal-area':'area',
            'equal-person':'person',
          }[activeTerritorialConstraint]||'total';
          territoryImpactCard?.querySelectorAll('[data-pts-territory-metric]').forEach(option=>option.setAttribute('aria-pressed',String(option.dataset.ptsTerritoryMetric===activeTerritoryMetric)));
          updateSliderConstraints();
          update();
        }));
        impactWindSlider?.addEventListener('input',update);
        impactSolarSlider?.addEventListener('input',update);
        impactSelfConsumptionSlider?.addEventListener('input',update);
        updateSliderConstraints();
        update();
      }catch(error){
        host.innerHTML='<p class="map-error"><strong>No se ha podido cargar la cartografía del PTS.</strong></p>';
        rendered=false;
      }
    };
    story.addEventListener('toggle',renderMap);
    if(story.open)renderMap();
  };
})();
