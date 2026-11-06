(()=>{
  const layers=[
    {id:'aptitude-wind',file:'pts-map/APTITUD_EOLICA_2026.geojson',kind:'aptitude',tech:'Eólica'},
    {id:'aptitude-solar',file:'pts-map/APTITUD_FOTOVOLTAICA_2026.geojson',kind:'aptitude',tech:'Fotovoltaica'},
    {id:'exclusion-wind',file:'pts-map/ZONAS_DE_EXCLUSION_EOLICA_2026.geojson',kind:'exclusion',tech:'Eólica'},
    {id:'exclusion-solar',file:'pts-map/ZONAS_DE_EXCLUSION_FOTOVOLTAICA_2026.geojson',kind:'exclusion',tech:'Fotovoltaica'},
    {id:'zls-wind',file:'pts-map/ZONAS_DE_LOCALIZACION_SELECCIONADA_EOLICA_2026.geojson',kind:'zls',tech:'Eólica'},
    {id:'zls-solar',file:'pts-map/ZONAS_DE_LOCALIZACION_SELECCIONADA_FOTOVOLTAICA_2026.geojson',kind:'zls',tech:'Fotovoltaica'},
    {id:'existing-wind',file:'existing-wind-installations-2025.geojson',kind:'existing-wind',tech:'Eólica existente'},
    {id:'approved-wind',file:'approved-wind-areas-2026.geojson',kind:'generation-area',stage:'approved',tech:'Eólica',color:'#54a7cf'},
    {id:'pipeline-wind',file:'pipeline-wind-areas-2026.geojson',kind:'generation-area',stage:'pipeline',tech:'Eólica',color:'#3567c8'},
    {id:'existing-solar',kind:'generation-area',stage:'existing',tech:'Fotovoltaica',color:'#7a5c00'},
    {id:'approved-solar',kind:'generation-area',stage:'approved',tech:'Fotovoltaica',color:'#c07600'},
    {id:'pipeline-solar',kind:'generation-area',stage:'pipeline',tech:'Fotovoltaica',color:'#e08a00'},
    {id:'urban',file:'udalplan-urban-2024.geojson',kind:'urban',tech:'Suelo urbano'},
    {id:'roads',file:'bta-main-roads-2025.geojson',kind:'roads',tech:'Carreteras principales'},
  ];

  const windGeometry=geometry=>geometry?.type==='Polygon'
    ? {...geometry,coordinates:geometry.coordinates.map(ring=>[...ring].reverse())}
    : geometry?.type==='MultiPolygon'
      ? {...geometry,coordinates:geometry.coordinates.map(polygon=>polygon.map(ring=>[...ring].reverse()))}
      : geometry;
  const windCollection=collection=>({...collection,features:collection.features.map(feature=>({...feature,geometry:windGeometry(feature.geometry)}))});
  const aptitudeColor=value=>({ALTA:'#2f7d55',MEDIA:'#9abf58',BAJA:'#e2bb48','MUY BAJA':'#d78650'}[String(value||'').toUpperCase()]||'#7fa58f');
  const SOLAR_EQUIVALENT_HA_PER_MW=1.35;
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const formatNumber=(value,digits=1)=>Number(value).toLocaleString('es-ES',{minimumFractionDigits:0,maximumFractionDigits:digits});
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
    const stageLead=layer.stage==='existing'?'Instalación en servicio representada mediante una superficie territorial comparable.':layer.stage==='pipeline'?'Expediente oficial en tramitación; todavía no es una instalación autorizada.':'Proyecto autorizado o en construcción; todavía no se contabiliza como generación en servicio.';
    const powerMarkup=Number.isFinite(power)?`${formatNumber(power,power<10?3:1)} MW${Number.isFinite(peakPower)&&Math.abs(peakPower-power)>.05?` nominales · ${formatNumber(peakPower,peakPower<10?3:1)} MWp`:''}`:'No publicada';
    const productionMarkup=annual>0?`<dt>Producción anual estimada</dt><dd>${formatNumber(annual,1)} GWh/año</dd>${project.annualGWhMethod?`<dt>Método de estimación</dt><dd>${escapeHtml(project.annualGWhMethod)}</dd>`:''}`:'';
    const modelMarkup=Number(project.modelFirstYear)>0?`<dt>Entrada en el modelo</dt><dd>50 % en ${formatNumber(project.modelFirstYear,0)} · 100 % desde ${formatNumber(project.modelFullYear,0)}</dd>`:layer.stage==='pipeline'?'<dt>Entrada en el modelo</dt><dd>Solo se suma de forma exploratoria cuando se activa la capa; no modifica las proyecciones publicadas.</dd>':'';
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
    if(!document.getElementById('pts-aptitude-scale-style')){
      const style=document.createElement('style');
      style.id='pts-aptitude-scale-style';
      style.textContent='.pts-aptitude-scale{display:inline-flex;align-items:center;gap:.28rem;margin-left:.05rem;padding:.2rem .36rem;border:1px solid #c7d7d1;border-radius:999px;background:#fff;font-size:.58rem;color:#315b51;white-space:nowrap}.pts-aptitude-scale[hidden]{display:none}.pts-aptitude-scale span{display:inline-flex;align-items:center;gap:.18rem}.pts-aptitude-scale i{display:inline-block;width:.62rem;height:.62rem;border:1px solid rgba(35,65,57,.35);border-radius:.12rem}.pts-map-detail{align-self:start;max-height:500px;overflow:auto}.pts-map-detail .map-detail-lead{margin:.1rem 0 .65rem;color:#58716a}.pts-map-detail dl{display:grid;grid-template-columns:1fr;gap:.12rem;margin:.45rem 0 0;padding-top:.55rem;border-top:1px solid #d3e0dc}.pts-map-detail dt{margin-top:.28rem;color:#58716a;font-weight:700}.pts-map-detail dd{margin:0;color:#23463e;min-width:0}.pts-map-detail .map-data-note{margin:.65rem 0 0;padding:.55rem;background:#f6f8ec;border-left:3px solid #91a731}.pts-map-detail .installation-photo{margin:.55rem 0}.pts-map-detail .installation-photo img{height:125px}.pts-map-detail .pts-technical-note{margin:.55rem 0;padding:.55rem;border:1px solid #d3e0dc;background:#fff}.pts-map-detail .pts-technical-note h6{margin:0 0 .25rem;font-size:.7rem}.pts-map-detail .pts-technical-note p{margin:.2rem 0}@media(max-width:780px){.pts-aptitude-scale{max-width:100%;margin-left:0;white-space:normal;flex-wrap:wrap}.pts-map-detail{max-height:none;overflow:visible}}';
      document.head.append(style);
    }
    story.querySelectorAll('[data-pts-layer^="aptitude-"]').forEach(button=>{
      if(button.nextElementSibling?.classList.contains('pts-aptitude-scale'))return;
      const scale=document.createElement('span');
      scale.className='pts-aptitude-scale';
      scale.hidden=true;
      scale.setAttribute('aria-hidden','true');
      scale.innerHTML='<span><i style="background:#2f7d55"></i>Alta</span><span><i style="background:#9abf58"></i>Media</span><span><i style="background:#e2bb48"></i>Baja</span><span><i style="background:#d78650"></i>Muy baja</span>';
      button.insertAdjacentElement('afterend',scale);
    });
    const fullscreenButton=story.querySelector('[data-pts-fullscreen]');
    const fullscreenPanel=story.querySelector('.pts-overlap-map');
    const detailPanel=story.querySelector('[data-pts-map-detail]');
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
    const updateFullscreenLabel=()=>{
      const active=document.fullscreenElement===fullscreenPanel;
      if(!fullscreenButton)return;
      fullscreenButton.textContent=active?'Salir de pantalla completa':'Ampliar mapa';
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

    story.addEventListener('toggle',async()=>{
      if(!story.open||rendered)return;
      rendered=true;
      const host=story.querySelector('[data-pts-map-canvas]');
      const detail=story.querySelector('[data-pts-map-detail]');
      try{
        const sets=await Promise.all(layers.map(async layer=>{
          if(layer.kind==='generation-area'&&layer.file){
            const response=await fetch(`assets/data/${layer.file}?v=20261105c`);
            if(!response.ok)throw Error(layer.file);
            const windAreas=await response.json();
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
          const response=await fetch(`assets/data/${layer.file}?v=20261105b`);
          if(!response.ok)throw Error(layer.file);
          const data=await response.json();
          const mapped=['urban','existing-wind'].includes(layer.kind)?data:windCollection(data);
          return {...layer,data:layer.kind==='existing-wind'
            ? {...mapped,features:mapped.features.filter(feature=>feature.properties?.representation==='repowering_max_envelope')}
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
          .attr('aria-label','Mapa del PTS con exclusiones, aptitudes, Zonas de Localización Seleccionada, suelo urbano y áreas de instalaciones eólicas existentes y aprobadas');
        const defs=svg.append('defs');
        const pattern=defs.append('pattern').attr('id','pts-exclusion-hatch').attr('patternUnits','userSpaceOnUse').attr('width',8).attr('height',8).attr('patternTransform','rotate(35)');
        pattern.append('rect').attr('width',8).attr('height',8).attr('fill','#ad2430');
        pattern.append('line').attr('y2',8).attr('stroke','#fff').attr('stroke-width',2).attr('opacity',.7);
        const viewport=svg.append('g').attr('class','pts-map-viewport');
        viewport.append('path').datum(territory).attr('d',path).attr('fill','#eef4f1').attr('stroke','#6d8d83').attr('stroke-width',.28).attr('stroke-opacity',.34);
        const groups=new Map();
        const normalizeMunicipalityName=name=>String(name||'').split(' / ').join('/').split('/ ').join('/').split(' /').join('/').replace(/^Arrankudiaga-Zollo$/,'Arrankudiaga');
        const populationValues=new Map((window.energyMapPopulations?.populations||[]).map(([name,value])=>[normalizeMunicipalityName(name),Number(value)]));
        const populationLabels=windCollection(window.energyMapMunicipalities).features
          .map(feature=>({feature,name:feature.properties?.NOMBRE_CAS||'Municipio',population:populationValues.get(normalizeMunicipalityName(feature.properties?.NOMBRE_CAS))||0}))
          .filter(item=>item.population>=20000);

        sets.forEach(layer=>{
          const group=viewport.append('g').attr('class','pts-map-layer').attr('data-layer',layer.id);
          groups.set(layer.id,group);
          group.selectAll('path').data(layer.data.features).join('path')
            .attr('class',layer.kind==='urban'?'pts-map-feature pts-urban-feature':'pts-map-feature')
            .attr('d',path)
            .attr('fill-rule','evenodd')
            .attr('fill',feature=>layer.kind==='generation-area'
              ? layer.color
              : layer.kind==='existing-wind'
              ? '#005b96'
              : layer.kind==='roads'
              ? 'none'
              : layer.kind==='exclusion'
              ? 'url(#pts-exclusion-hatch)'
              : layer.kind==='aptitude'
                ? aptitudeColor(feature.properties?.APTITUD)
                : layer.kind==='urban'
                  ? '#17211e'
                  : layer.tech==='Eólica'?'#2988ba':'#c58b00')
            .attr('fill-opacity',feature=>layer.kind==='generation-area'
              ? 1
              : layer.kind==='existing-wind'
              ? 1
              : layer.kind==='urban'?.72:layer.kind==='zls'?1:.58)
            .attr('stroke',feature=>layer.kind==='generation-area'
              ? 'none'
              : layer.kind==='existing-wind'
              ? 'none'
              : layer.kind==='roads'?'#8b9692':layer.kind==='urban'?'#8b9692':layer.kind==='zls'?'none':'#fff')
            .attr('stroke-width',feature=>layer.kind==='generation-area'
              ? 0
              : layer.kind==='existing-wind'
              ? 0
              : layer.kind==='roads'?.68:layer.kind==='urban'?.18:layer.kind==='zls'?0:.2)
            .attr('stroke-linecap',layer.kind==='roads'?'round':null)
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
        const zoom=d3.zoom().scaleExtent([1,12]).translateExtent([[-W*.35,-H*.35],[W*1.35,H*1.35]]).on('zoom',event=>viewport.attr('transform',event.transform));
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
          const opacity=Number(story.querySelector('[data-pts-opacity]').value)/100;
          story.querySelectorAll('[data-pts-layer]').forEach(button=>{
            const active=button.getAttribute('aria-pressed')==='true';
            groups.get(button.dataset.ptsLayer)?.style('display',active?null:'none').style('opacity',['urban','roads','existing-wind','approved-wind','pipeline-wind','existing-solar','approved-solar','pipeline-solar'].includes(button.dataset.ptsLayer)?1:opacity);
            if(button.dataset.ptsLayer?.startsWith('aptitude-')){
              const scale=button.nextElementSibling?.classList.contains('pts-aptitude-scale')?button.nextElementSibling:null;
              if(scale){scale.hidden=!active;scale.setAttribute('aria-hidden',String(!active));}
            }
          });
        };
        story.querySelectorAll('[data-pts-layer]').forEach(button=>button.addEventListener('click',()=>{
          button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));
          update();
        }));
        story.querySelector('[data-pts-opacity]').addEventListener('input',update);
        update();
      }catch(error){
        host.innerHTML='<p class="map-error"><strong>No se ha podido cargar la cartografía del PTS.</strong></p>';
        rendered=false;
      }
    });
  };
})();
