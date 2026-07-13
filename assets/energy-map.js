(()=>{
  const TECHNOLOGIES={
    cycle:{label:'Ciclo combinado',color:'#4f565c'},
    cogen:{label:'Cogeneración, residuos y biomasa',color:'#8f6aa8'},
    hydro:{label:'Hidráulica',color:'#247ba0'},
    wind:{label:'Eólica',color:'#79cce5'},
    solar:{label:'Fotovoltaica',color:'#f0c419'},
    other:{label:'Otras',color:'#d55e00'}
  };
  const TECHNOLOGY_ORDER=['cycle','cogen','hydro','wind','solar','other'];
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
    'PARQUE EOLICO SIERRA ELGEA':{src:'assets/photos/installations/elgea-parque-eolico.jpg',alt:'Vista general del parque eólico de Elgea',description:'Vista general del parque de Elgea; no identifica un aerogenerador concreto',author:'Basotxerri',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',pageUrl:'https://commons.wikimedia.org/wiki/File:Elgea_-_Monte_Usakoatxa_01.jpg'}
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
    const caption=`${escapeHtml(photo.description)} · ${escapeHtml(photo.author)} · <a href="${photo.licenseUrl}" target="_blank" rel="noopener">${escapeHtml(photo.license)}</a> · <a href="${photo.pageUrl}" target="_blank" rel="noopener">Wikimedia Commons</a>`;
    return{src:photo.src,orthophoto,isOrthophoto:false,alt:photo.alt,caption};
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
    const installations=window.energyMapReeInstallations,territories=window.energyMapTerritories,municipalities=window.energyMapMunicipalities,populations=window.energyMapPopulations,highVoltage=window.energyMapHighVoltage,substations=window.energyMapSubstations,surroundings=window.energyMapSurroundingRegions,biscayInterconnector=window.energyMapBiscayInterconnector,electricProjects=window.energyMapElectricProjects,generationProjects=window.energyMapGenerationProjects;
    const host=row.querySelector('.territory-map-host')||row,shell=document.createElement('div');shell.className='territory-map-shell';host.append(shell);
    if(!window.d3||!installations?.features?.length||!territories?.features?.length){
      shell.innerHTML='<p class="map-error"><strong>No se ha podido cargar el mapa.</strong> Los datos permanecen disponibles en la fuente oficial enlazada al final del indicador.</p>';
      return;
    }
    const mapTerritories=d3WindingCollection(territories),mapMunicipalities=municipalities?.features?.length?d3WindingCollection(municipalities):null,mapSubstations=substations?.features?.length?d3WindingCollection(substations):null,mapSurroundings=surroundings?.features?.length?surroundings:null;
    const allGridFeatures=highVoltage?.features||[];
    const highVoltageFeatures=allGridFeatures.filter(feature=>['220 kV','400 kV'].includes(feature.properties?.VTENS_0116)&&!isLegacyGatikaLemoiz(feature));
    const local132Features=allGridFeatures.filter(feature=>feature.properties?.VTENS_0116==='132 kV');
    const biscayFeatures=biscayInterconnector?.features||[],biscayMetadata=biscayInterconnector?.metadata||{},projectDefinitions=electricProjects?.projects||[],generationProjectDefinitions=generationProjects?.projects||[];

    const records=installations.features.map(feature=>{
      const properties=feature.properties||{},mw=Number(properties.mw)||0,units=Math.max(1,Number(properties.numero)||1);
      return{feature,properties,mw,units,key:keyForTechnology(properties.tecnologia),coordinate:feature.geometry.coordinates};
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
    const electricShare=Math.min(100,Math.max(0,Number(cfg.electricShare2024)||24.837)),nonElectricShare=100-electricShare,electricEnergy=Math.max(0,Number(cfg.electricEnergy2024)||13208),finalEnergy=Math.max(electricEnergy,Number(cfg.finalEnergy2024)||53178),deliveryFactor=Math.max(0,Number(cfg.electricDeliveryFactor2024)||1),generationByTechnology=cfg.generationByTechnology2024||{},barTechnologyKeys=['cycle','cogen','hydro','wind','solar'].filter(key=>Number(generationByTechnology[key])>0),barTechnologyEnergy=Object.fromEntries(barTechnologyKeys.map(key=>[key,Number(generationByTechnology[key])*deliveryFactor]));
    const operatingCapacityByTechnology=Object.fromEntries(metadata.map(item=>[item.key,item.mw])),smallCapacityByTechnology=Object.fromEntries(TECHNOLOGY_ORDER.map(key=>[key,records.filter(record=>record.key===key&&record.mw<.1).reduce((sum,record)=>sum+record.mw,0)])),futureCapacityByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,generationProjectDefinitions.filter(project=>project.technology===key).reduce((sum,project)=>sum+(Number(project.mw)||0),0)])),futureProjectCountByTechnology=Object.fromEntries(['wind','solar'].map(key=>[key,generationProjectDefinitions.filter(project=>project.technology===key).length]));
    const generationYieldPerMw=Object.fromEntries(['wind','solar'].map(key=>[key,operatingCapacityByTechnology[key]?Number(generationByTechnology[key])/operatingCapacityByTechnology[key]:0])),futureBarTechnologyEnergy=Object.fromEntries(['wind','solar'].map(key=>[key,futureCapacityByTechnology[key]*generationYieldPerMw[key]*deliveryFactor])),smallBarTechnologyEnergy=Object.fromEntries(['wind','solar'].map(key=>[key,operatingCapacityByTechnology[key]?barTechnologyEnergy[key]*smallCapacityByTechnology[key]/operatingCapacityByTechnology[key]:0]));
    const ownTechnologyEnergy=Object.values(barTechnologyEnergy).reduce((sum,value)=>sum+value,0),importedElectricEnergyBase=Math.max(0,electricEnergy-ownTechnologyEnergy);let importedElectricEnergy=importedElectricEnergyBase;
    const barTechnologyLabels={...Object.fromEntries(TECHNOLOGY_ORDER.map(key=>[key,TECHNOLOGIES[key].label])),cogen:'Cogeneración, residuos, biomasa y otras renovables eléctricas'},barSegmentDisplayLabels={cycle:'Ciclo<br>combinado',cogen:'Cogeneración',hydro:'Hidráulica',wind:'Eólica',solar:'Solar'};
    const technologySegments=barTechnologyKeys.map(key=>{
      const energy=barTechnologyEnergy[key],electricPercent=electricEnergy?100*energy/electricEnergy:0,totalPercent=finalEnergy?100*energy/finalEnergy:0,isDrillable=key==='wind'||key==='solar',tag=isDrillable?'button':'div',buttonAttributes=isDrillable?` type="button" data-drilldown-technology="${key}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar ${barTechnologyLabels[key].toLowerCase()} en servicio: ${formatNumber(energy,0)} GWh"`:'';
      const futureEnergy=futureBarTechnologyEnergy[key]||0,futureSegment=futureEnergy?`<button type="button" class="map-energy-share-segment map-energy-share-future" data-future-technology="${key}" data-drilldown-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};flex:${futureEnergy}" aria-pressed="false" aria-expanded="false" aria-label="Ampliar ${barTechnologyLabels[key].toLowerCase()} en construcción o aprobada" hidden><span class="map-energy-share-segment-label">${barSegmentDisplayLabels[key]}<br>proyectos</span><span class="map-energy-share-expanded-label"><strong>${barTechnologyLabels[key]} en construcción o aprobada</strong><small data-future-summary="${key}">${formatNumber(futureEnergy,0)} GWh potenciales · ${formatNumber(futureCapacityByTechnology[key],1)} MW</small></span></button>`:'';
      const solarSmallEnergy=key==='solar'?smallBarTechnologyEnergy.solar:0,solarRestEnergy=key==='solar'?Math.max(0,energy-solarSmallEnergy):0,solarBreakdown=key==='solar'?`<span class="map-energy-share-substack"><span class="map-energy-share-subsegment map-energy-share-solar-rest" style="flex:${solarRestEnergy}"><strong>Resto solar en servicio</strong><small>${formatNumber(solarRestEnergy,1)} GWh · ${formatNumber(operatingCapacityByTechnology.solar-smallCapacityByTechnology.solar,1)} MW</small></span><span class="map-energy-share-subsegment map-energy-share-solar-small" style="flex:${solarSmallEnergy}"><strong>Emplazamientos solares &lt; 0,1 MW</strong><small>${formatNumber(solarSmallEnergy,1)} GWh estimados · ${formatNumber(smallCapacityByTechnology.solar,2)} MW</small></span></span>`:'';
      const expandedLabel=key==='wind'?`<span class="map-energy-share-expanded-label"><strong>Eólica en servicio</strong><small>${formatNumber(energy,0)} GWh · ${formatNumber(operatingCapacityByTechnology.wind,1)} MW</small></span>`:'';
      const currentSegment=`<${tag}${buttonAttributes} class="map-energy-share-segment${isDrillable?' map-energy-share-drillable':''}" data-technology="${key}" style="--segment-color:${TECHNOLOGIES[key].color};background:${TECHNOLOGIES[key].color};flex:${energy}" title="${barTechnologyLabels[key]}: ${formatNumber(energy,0)} GWh · ${formatNumber(electricPercent,1)} % de la electricidad · ${formatNumber(totalPercent,2)} % del consumo final"><span class="map-energy-share-segment-label">${barSegmentDisplayLabels[key]}</span>${expandedLabel}${solarBreakdown}</${tag}>`;
      return`${futureSegment}${currentSegment}`;
    }).join('');
    const energyShare=document.createElement('aside');energyShare.className='map-energy-share';energyShare.setAttribute('aria-label',`Consumo final energético de Euskadi en 2024: ${formatNumber(electricShare,1)} % electricidad y ${formatNumber(nonElectricShare,1)} % energía no eléctrica, principalmente petróleo y gas natural`);
    energyShare.innerHTML=`<p class="map-energy-share-title">Consumo final<br><strong>100 %</strong><span data-energy-share-basis>2024</span></p><div class="map-energy-share-bar" role="group" aria-label="Electricidad: ${formatNumber(electricShare,1)} %. Energía no eléctrica, principalmente petróleo y gas natural: ${formatNumber(nonElectricShare,1)} %"><div class="map-energy-share-rest" style="flex:${nonElectricShare}"><span>Energía<br>no eléctrica<br><strong>${formatNumber(nonElectricShare,1)} %</strong><small class="map-energy-share-rest-note">Sobre todo<br>petróleo y gas</small></span></div><div class="map-energy-share-electric" style="flex:${electricShare}"><button type="button" class="map-energy-share-electric-toggle" aria-pressed="false" aria-expanded="false" aria-label="Ampliar el desglose de la electricidad, ${formatNumber(electricShare,1)} % del consumo final"><span class="map-energy-share-electric-label">Electricidad<br><strong>${formatNumber(electricShare,1)} %</strong></span></button><div class="map-energy-share-electric-stack"><div class="map-energy-share-segment map-energy-share-imported" style="flex:${importedElectricEnergy}" title="Electricidad importada: ${formatNumber(importedElectricEnergy,0)} GWh · ${formatNumber(electricEnergy?100*importedElectricEnergy/electricEnergy:0,1)} % de la electricidad"><span class="map-energy-share-segment-label">Importada</span></div>${technologySegments}</div></div></div>`;
    const energyShareBar=energyShare.querySelector('.map-energy-share-bar'),electricFocusButton=energyShare.querySelector('.map-energy-share-electric-toggle'),technologyDrillButtons=[...energyShare.querySelectorAll('[data-drilldown-technology]')];let expandedTechnology=null;
    const updateExpansionControls=()=>{const electricityExpanded=energyShareBar.classList.contains('is-electric-expanded');electricFocusButton.setAttribute('aria-pressed',String(electricityExpanded));electricFocusButton.setAttribute('aria-expanded',String(electricityExpanded));electricFocusButton.setAttribute('aria-label',expandedTechnology?`Volver al desglose de toda la electricidad desde ${barTechnologyLabels[expandedTechnology]}`:electricityExpanded?`Volver al consumo final completo. Electricidad: ${formatNumber(electricShare,1)} %`:`Ampliar el desglose de la electricidad, ${formatNumber(electricShare,1)} % del consumo final`);electricFocusButton.querySelector('.map-energy-share-electric-label').innerHTML=expandedTechnology?'←<br>Electricidad':`Electricidad<br><strong>${formatNumber(electricShare,1)} %</strong>`;technologyDrillButtons.forEach(button=>{const key=button.dataset.drilldownTechnology,selected=key===expandedTechnology,isFuture=Boolean(button.dataset.futureTechnology);button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-expanded',String(selected));button.setAttribute('aria-label',selected?`Volver al desglose de toda la electricidad desde ${barTechnologyLabels[key]}`:isFuture?`Ampliar ${barTechnologyLabels[key].toLowerCase()} en construcción o aprobada`:`Ampliar ${barTechnologyLabels[key].toLowerCase()} en servicio: ${formatNumber(barTechnologyEnergy[key],0)} GWh`)})};
    const setTechnologyExpanded=key=>{expandedTechnology=['wind','solar'].includes(key)?key:null;energyShareBar.classList.toggle('is-technology-expanded',Boolean(expandedTechnology));if(expandedTechnology){energyShareBar.classList.add('is-electric-expanded');energyShareBar.dataset.expandedTechnology=expandedTechnology}else delete energyShareBar.dataset.expandedTechnology;updateExpansionControls()};
    const setElectricityExpanded=expanded=>{if(!expanded){expandedTechnology=null;energyShareBar.classList.remove('is-technology-expanded');delete energyShareBar.dataset.expandedTechnology}energyShareBar.classList.toggle('is-electric-expanded',expanded);updateExpansionControls()};
    electricFocusButton.addEventListener('click',()=>{if(expandedTechnology)setTechnologyExpanded(null);else setElectricityExpanded(!energyShareBar.classList.contains('is-electric-expanded'))});
    technologyDrillButtons.forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();const key=button.dataset.drilldownTechnology;setTechnologyExpanded(expandedTechnology===key?null:key)}));
    const viewport=document.createElement('div');viewport.className='energy-map-viewport';
    const detail=document.createElement('aside');detail.className='map-detail';detail.setAttribute('aria-live','polite');
    layout.append(energyShare,viewport,detail);shell.append(layout);
    const scope=document.createElement('p');scope.className='map-scope';scope.innerHTML='<strong>Cómo leer las conexiones.</strong> Las líneas terminan en subestaciones; los círculos lisos son instalaciones en servicio y los círculos con rayas negras pertenecen a la capa independiente de generación autorizada o en construcción. Su color indica la tecnología. La red de transporte se representa a 220 y 400 kV y la capa secundaria añade las conexiones locales de 132 kV. El color sigue indicando la tensión y el trazo discontinuo identifica obras de red en construcción o autorizadas. La nueva interconexión con Francia llega soterrada desde Gatika y continúa por el Golfo de Bizkaia. <strong>Poblaciones.</strong> Los cuadrados negros sitúan los municipios según su población a 1 de enero de 2025.';shell.append(scope);

    const W=900,H=590,svg=d3.select(viewport).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('preserveAspectRatio','xMidYMin meet').attr('role','img').attr('aria-label','Mapa de Euskadi y su entorno terrestre y marítimo con instalaciones de generación, subestaciones y redes eléctricas');
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
    });
    const mapLayer=svg.append('g').attr('class','energy-map-layer');
    const projection=d3.geoMercator().fitExtent([[28,85],[W-28,H-28]],mapTerritories),path=d3.geoPath(projection);
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
    const markers=mapLayer.append('g').attr('class','energy-markers').selectAll('circle').data(ordered).join('circle')
      .attr('class','energy-marker').attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1])
      .attr('r',d=>d.mw<0.1?2.3:radius(d.mw)).attr('fill',d=>TECHNOLOGIES[d.key].color).attr('fill-opacity',.82)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.properties.descripcion||'Instalación'}; ${TECHNOLOGIES[d.key].label}; ${formatNumber(d.mw,Math.max(0,d.mw<1?3:1))} MW; ${cleanMunicipality(d.properties.municipio)}`);

    const generationProjectRecords=generationProjectDefinitions.filter(project=>Array.isArray(project.coordinate)&&project.coordinate.length===2).map(project=>({...project,key:project.technology in TECHNOLOGIES?project.technology:'other',mw:Number(project.mw)||0}));
    const generationProjectRadius=d3.scaleSqrt().domain([.5,d3.max(generationProjectRecords,d=>d.mw)||1]).range([5,17]).clamp(true);
    const generationProjectLayer=mapLayer.append('g').attr('class','generation-project-layer');
    const generationProjectMarkers=generationProjectLayer.selectAll('circle').data([...generationProjectRecords].sort((a,b)=>b.mw-a.mw)).join('circle')
      .attr('class',d=>`generation-project-marker project-${d.status}`).attr('cx',d=>projection(d.coordinate)[0]).attr('cy',d=>projection(d.coordinate)[1])
      .attr('r',d=>generationProjectRadius(d.mw)).attr('fill',d=>`url(#generation-project-${d.key}-hatch)`)
      .attr('tabindex',0).attr('role','button').attr('aria-label',d=>`${d.name}; ${TECHNOLOGIES[d.key].label}; ${formatNumber(d.mw,d.mw<10?1:0)} MW; ${d.statusLabel}; ${d.municipalities.join(', ')}`);
    generationProjectMarkers.append('title').text(d=>`${d.name} · ${TECHNOLOGIES[d.key].label} · ${formatNumber(d.mw,d.mw<10?1:0)} MW · ${d.statusLabel}`);

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

    let currentZoomScale=1;
    const zoom=d3.zoom().scaleExtent([1,9]).on('zoom',event=>{
      currentZoomScale=event.transform.k;
      mapLayer.attr('transform',event.transform);
      markers.attr('r',d=>(d.mw<0.1?2.3:radius(d.mw))/Math.pow(event.transform.k,.62));
      generationProjectMarkers.attr('r',d=>generationProjectRadius(d.mw)/Math.pow(event.transform.k,.62));
      mapLayer.selectAll('.territory-label').style('font-size',`${13/Math.pow(event.transform.k,.72)}px`);
      populationDots.attr('x',record=>-populationRadius(record.population)/Math.pow(event.transform.k,.62)).attr('y',record=>-populationRadius(record.population)/Math.pow(event.transform.k,.62))
        .attr('width',record=>populationRadius(record.population)*2/Math.pow(event.transform.k,.62)).attr('height',record=>populationRadius(record.population)*2/Math.pow(event.transform.k,.62));
      populationLabels.attr('x',record=>(populationRadius(record.population)+3)/Math.pow(event.transform.k,.62)).attr('y',3.5/Math.pow(event.transform.k,.72)).style('font-size',`${10.5/Math.pow(event.transform.k,.78)}px`);
      verifiedSubstations.select('.verified-substation-node').attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      verifiedSubstations.select('.verified-substation-label').style('font-size',`${10.5/Math.pow(event.transform.k,.72)}px`);
      projectMarkers.select('.electric-project-node').attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      networkNodes.select('.interconnection-node').attr('transform',`scale(${1/Math.pow(event.transform.k,.72)})`);
      networkNodes.select('.interconnection-label').style('font-size',`${11/Math.pow(event.transform.k,.72)}px`);
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
    const networkLegend=document.createElement('div');networkLegend.className='map-network-legend';networkLegend.innerHTML='<span data-layer="transport"><i class="line-400" aria-hidden="true"></i>400 kV</span><span data-layer="transport"><i class="line-220" aria-hidden="true"></i>220 kV</span><span data-layer="projects"><i class="project-construction" aria-hidden="true"></i>Red en construcción o aprobada</span><span data-layer="generation-projects"><i class="generation-project-construction" aria-hidden="true"></i>Generación en construcción o aprobada</span><span data-layer="local"><i class="line-132" aria-hidden="true"></i>132 kV</span><span data-layer="substation"><i class="substation" aria-hidden="true"></i>Subestación</span><span data-layer="transport"><i class="node" aria-hidden="true"></i>Interconexión exterior</span>';viewport.append(networkLegend);

    const constructionProjectCount=projectDefinitions.filter(project=>project.status==='construction').length+1,authorizedProjectCount=projectDefinitions.filter(project=>project.status==='authorized').length,activeProjectCount=constructionProjectCount+authorizedProjectCount;
    const clearProjectSelection=()=>{projectPaths.classed('is-selected',false);projectMarkers.classed('is-selected',false)};
    const clearGenerationProjectSelection=()=>generationProjectMarkers.classed('is-selected',false);
    const defaultDetail=()=>{detail.innerHTML=`<h4>Infraestructura eléctrica cartografiada</h4><p class="map-detail-lead">Selecciona una instalación, un proyecto, una población, un nodo o un trazado discontinuo para consultar sus datos.</p><dl><dt>Emplazamientos en servicio</dt><dd>${formatNumber(totals.points,0)}</dd><dt>Instalaciones en servicio</dt><dd>${formatNumber(totals.units,0)}</dd><dt>Potencia en servicio</dt><dd>${formatNumber(totals.mw,1)} MW</dd><dt>Proyectos de generación</dt><dd>${formatNumber(generationProjectDefinitions.length,0)} autorizados o en obra</dd><dt>Población ${populationYear}</dt><dd>${formatNumber(populationTotal,0)} habitantes</dd><dt>Red de transporte</dt><dd>220 y 400 kV</dd><dt>Conexiones locales</dt><dd>132 kV</dd><dt>Subestaciones</dt><dd>${formatNumber(mapSubstations?.features?.length||0,0)}</dd><dt>Nodos exteriores</dt><dd>${formatNumber(INTERCONNECTION_NODES.length,0)}</dd><dt>Obras de red</dt><dd>${formatNumber(activeProjectCount,0)} actuaciones</dd><dt>Inventario</dt><dd>${escapeHtml(generationProjects?.updated||electricProjects?.updated||'2026')}</dd></dl><p class="map-data-note">Los círculos rayados son proyectos de generación con autorización formal o construcción iniciada; no equivalen a instalaciones ya operativas. Los trazos discontinuos pertenecen a la capa independiente de obras de red.</p><span class="map-source-badge">Red Eléctrica / ESIOS · GeoEuskadi · INELFE · Gobierno Vasco · BOE · Eustat</span>`};
    const showDetail=d=>{
      markers.classed('is-selected',candidate=>candidate===d);
      populationGroups.classed('is-selected',false);networkNodes.classed('is-selected',false);biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();
      const digits=d.mw<.1?3:d.mw<10?2:1,groupNote=d.units>1?`Este punto agrupa ${formatNumber(d.units,0)} instalaciones.`:'Este punto corresponde a una instalación.';
      const isPetronor=/^PETRONOR 1$/i.test(d.properties.descripcion||''),connectionNote=isPetronor?'Petronor no conecta directamente con las líneas de 400 kV. La documentación oficial sitúa su enlace en 132 kV hacia ST Petronor y ST Abanto/Mantrés; las líneas de 400 kV terminan correctamente en esta última.':'La coordenada procede del inventario de generación y no representa necesariamente la posición exacta de la subestación o del punto de conexión.';
      const media=mediaForRecord(d),orthophotoWarning='Imagen centrada en la coordenada registral; puede representar una ubicación aproximada o varias unidades agrupadas.';
      detail.innerHTML=`<h4>${escapeHtml(d.properties.descripcion||'Instalación de producción')}</h4><p class="map-detail-lead">${groupNote}</p><dl><dt>Tecnología</dt><dd>${TECHNOLOGIES[d.key].label}</dd><dt>Municipio</dt><dd>${escapeHtml(cleanMunicipality(d.properties.municipio))}</dd><dt>Potencia</dt><dd>${formatNumber(d.mw,digits)} MW</dd><dt>Instalaciones</dt><dd>${formatNumber(d.units,0)}</dd><dt>Área / huella</dt><dd class="map-area">${areaMarkup(d)}</dd><dt>Registro</dt><dd>${escapeHtml(d.properties.minetur||'No indicado')}</dd><dt>Actualización</dt><dd>${dateLabel(d.properties.fecha_mod)}</dd></dl><p class="map-data-note">${connectionNote}</p><span class="map-source-badge">Red Eléctrica / ESIOS</span><figure class="installation-photo"><img src="${escapeHtml(media.src)}" data-orthophoto="${escapeHtml(media.orthophoto)}" data-using-orthophoto="${media.isOrthophoto}" alt="${escapeHtml(media.alt)}" loading="lazy" decoding="async"><figcaption>${media.caption}</figcaption>${media.isOrthophoto?`<span class="installation-photo-warning">${orthophotoWarning}</span>`:''}</figure>`;
      const mediaImage=detail.querySelector('.installation-photo img');
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
      markers.classed('is-selected',false);populationGroups.classed('is-selected',candidate=>candidate===record);networkNodes.classed('is-selected',false);biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();
      detail.innerHTML=`<h4>${escapeHtml(record.name)}</h4><p class="map-detail-lead">Población residente del municipio a 1 de enero de ${populationYear}.</p><dl><dt>Habitantes</dt><dd>${formatNumber(record.population,0)}</dd><dt>Territorio histórico</dt><dd>${escapeHtml(record.territory)}</dd><dt>Fecha de referencia</dt><dd>1 de enero de ${populationYear}</dd><dt>Representación</dt><dd>Centroide del término municipal</dd></dl><p class="map-data-note">El punto sirve para contextualizar territorialmente la infraestructura. No representa la extensión urbana ni localiza cada núcleo de población dentro del municipio.</p><span class="map-source-badge"><a href="${escapeHtml(populations?.sourceUrl||'https://es.eustat.eus/elementos/tbl0011429_c.html')}" target="_blank" rel="noopener">Eustat · población municipal ${populationYear}</a></span>`;
    };
    const showNetworkDetail=d=>{
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);networkNodes.classed('is-selected',candidate=>candidate===d);biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();
      const circuitCapacity=d.capacityCircuits.map(([name,mva])=>`${escapeHtml(name)}: <strong>${formatNumber(mva,0)} MVA</strong>`).join('<br>'),capacityNote=d.capacityNote?` ${escapeHtml(d.capacityNote)}`:'';
      detail.innerHTML=`<h4>${escapeHtml(d.name)}</h4><p class="map-detail-lead">Nodo de interconexión exterior: puede canalizar electricidad tanto de entrada como de salida.</p><dl><dt>Tensión</dt><dd>${escapeHtml(d.voltage)}</dd><dt>Conecta con</dt><dd>${escapeHtml(d.territory)}</dd><dt>Conexiones cartografiadas</dt><dd>${d.links.map(escapeHtml).join('<br>')}</dd><dt>Suma nominal de circuitos</dt><dd>${formatNumber(d.capacityTotalMVA,0)} MVA</dd><dt>Capacidad térmica por circuito</dt><dd>${circuitCapacity}</dd><dt>Referencia</dt><dd>Invierno de 2024</dd><dt>Sentido del flujo</dt><dd>Bidireccional y variable</dd><dt>Energía importada por el nodo</dt><dd>No publicada de forma desagregada</dd></dl><p class="map-data-note">Los MVA expresan la capacidad aparente de las líneas, no la energía anual que entra en GWh ni un flujo real fijo en MW. Su suma es una referencia física, no una capacidad simultánea garantizada: las restricciones y el criterio de seguridad N-1 pueden reducir el intercambio efectivo.${capacityNote}</p><span class="map-source-badge"><a href="${REE_TRANSPORT_CAPACITY_2024}" target="_blank" rel="noopener">Red Eléctrica · calidad de servicio de la red de transporte 2024</a></span>`;
    };
    const showProjectDetail=project=>{
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);networkNodes.classed('is-selected',false);biscayPaths.classed('is-selected',false);clearGenerationProjectSelection();
      projectPaths.classed('is-selected',record=>record.project===project);projectMarkers.classed('is-selected',record=>record.project===project);
      const statusNote=project.status==='authorized'?'Dispone de autorización administrativa de construcción, pero esa resolución no acredita que las obras hayan comenzado.':'El inicio de las obras ha sido confirmado por una fuente oficial.';
      detail.innerHTML=`<h4>${escapeHtml(project.name)}</h4><p class="map-detail-lead">${escapeHtml(project.kind||'Actuación sobre la red eléctrica')}</p><dl><dt>Estado</dt><dd>${escapeHtml(project.statusLabel)}</dd><dt>Tensión</dt><dd>${escapeHtml(project.voltage||'No indicada')}</dd><dt>Actuación</dt><dd>${escapeHtml(project.scope||'No indicada')}</dd><dt>Representación</dt><dd>${escapeHtml(project.geometryNote||'Localización cartográfica orientativa')}</dd></dl><p class="map-data-note">${statusNote}</p><span class="map-source-badge"><a href="${escapeHtml(project.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(project.sourceLabel||'Fuente oficial')}</a></span>`;
    };
    const showGenerationProjectDetail=project=>{
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);networkNodes.classed('is-selected',false);biscayPaths.classed('is-selected',false);clearProjectSelection();
      generationProjectMarkers.classed('is-selected',candidate=>candidate===project);
      const statusNote=project.status==='construction'?'El comienzo de las obras consta en una fuente oficial. El proyecto todavía no se contabiliza como potencia en servicio.':project.status==='construction-authorized'?'La autorización administrativa de construcción permite ejecutar el proyecto, pero no demuestra que las obras hayan comenzado.':'La autorización administrativa previa aprueba las características esenciales. Antes de construir necesita también autorización administrativa de construcción.';
      const sourceLinks=(project.sources||[{label:project.sourceLabel,url:project.sourceUrl}]).filter(source=>source?.url).map(source=>`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label||'Fuente oficial')}</a>`).join(' · ');
      const powerLabel=project.mwp&&Math.abs(project.mwp-project.mw)>.05?`${formatNumber(project.mw,project.mw<10?1:0)} MW nominales · ${formatNumber(project.mwp,project.mwp<10?2:1)} MWp`:`${formatNumber(project.mw,project.mw<10?1:0)} MW`;
      const projectOrthophoto=orthophotoUrl(project.coordinate);
      detail.innerHTML=`<h4>${escapeHtml(project.name)}</h4><p class="map-detail-lead">Proyecto de ${escapeHtml(TECHNOLOGIES[project.key].label.toLowerCase())}; círculo rayado del mismo color tecnológico.</p><dl><dt>Estado</dt><dd>${escapeHtml(project.statusLabel)}</dd><dt>Fecha de la resolución</dt><dd>${escapeHtml(project.approvalDate||'No indicada')}</dd><dt>Potencia</dt><dd>${powerLabel}</dd><dt>Municipios</dt><dd>${project.municipalities.map(escapeHtml).join(', ')}</dd>${project.area?`<dt>Superficie</dt><dd>${escapeHtml(project.area)}</dd>`:''}<dt>Representación</dt><dd>${escapeHtml(project.locationNote||'Punto representativo del ámbito documentado')}</dd></dl><p class="map-data-note">${statusNote}${project.note?` ${escapeHtml(project.note)}`:''}</p><span class="map-source-badge">${sourceLinks}</span><figure class="installation-photo"><img src="${escapeHtml(projectOrthophoto)}" alt="Vista aérea del ámbito de ${escapeHtml(project.name)}" loading="lazy" decoding="async"><figcaption>${orthophotoCaption()}</figcaption><span class="installation-photo-warning">La imagen muestra el ámbito de referencia, no una planta necesariamente construida.</span></figure>`;
      const projectImage=detail.querySelector('.installation-photo img');
      projectImage?.addEventListener('error',()=>{const unavailable=document.createElement('p');unavailable.className='installation-photo-unavailable';unavailable.textContent='Vista aérea no disponible en este momento.';projectImage.replaceWith(unavailable)});
    };
    const showBiscayInterconnectorDetail=()=>{
      markers.classed('is-selected',false);populationGroups.classed('is-selected',false);networkNodes.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();biscayPaths.classed('is-selected',true);
      detail.innerHTML=`<h4>${escapeHtml(biscayMetadata.name||'Interconexión eléctrica por el Golfo de Bizkaia')}</h4><p class="map-detail-lead">Nuevo enlace independiente entre los sistemas eléctricos de España y Francia.</p><dl><dt>Estado</dt><dd>${escapeHtml(biscayMetadata.status||'En construcción')}</dd><dt>Puesta en servicio</dt><dd>Prevista a comienzos de 2028</dd><dt>Extremos</dt><dd>Gatika – Cubnezais (Francia)</dd><dt>Tecnología</dt><dd>${escapeHtml(biscayMetadata.voltage||'HVDC ±400 kV')}</dd><dt>Capacidad</dt><dd>${escapeHtml(biscayMetadata.capacity||'2 enlaces de 1.000 MW')}</dd><dt>Cables</dt><dd>${escapeHtml(biscayMetadata.cables||'4 cables')}</dd><dt>Tramo en Bizkaia</dt><dd>${escapeHtml(biscayMetadata.landLength||'13 km soterrados')}</dd><dt>Tramo submarino</dt><dd>${escapeHtml(biscayMetadata.marineLength||'Aproximadamente 300 km')}</dd></dl><p class="map-data-note">El enlace nuevo llega soterrado hasta Lemoiz y sale al mar mediante perforación dirigida. El eje azul marino procede del proyecto técnico georreferenciado; el tramo terrestre se representa de forma esquemática a esta escala.</p><span class="map-source-badge">INELFE / Red Eléctrica · proyecto en construcción</span>`;
    };
    markers.on('mouseenter focus click',(event,d)=>{if(event.type==='click')event.stopPropagation();showDetail(d)}).on('keydown',(event,d)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showDetail(d)}});
    populationGroups.on('mouseenter focus click',(event,record)=>{if(event.type==='click')event.stopPropagation();showPopulationDetail(record)}).on('keydown',(event,record)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showPopulationDetail(record)}});
    networkNodes.on('mouseenter focus click',(event,d)=>{if(event.type==='click')event.stopPropagation();showNetworkDetail(d)}).on('keydown',(event,d)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showNetworkDetail(d)}});
    projectPaths.on('mouseenter focus click',(event,record)=>{if(event.type==='click')event.stopPropagation();showProjectDetail(record.project)}).on('keydown',(event,record)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showProjectDetail(record.project)}});
    projectMarkers.on('mouseenter focus click',(event,record)=>{if(event.type==='click')event.stopPropagation();showProjectDetail(record.project)}).on('keydown',(event,record)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showProjectDetail(record.project)}});
    generationProjectMarkers.on('mouseenter focus click',(event,project)=>{if(event.type==='click')event.stopPropagation();showGenerationProjectDetail(project)}).on('keydown',(event,project)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showGenerationProjectDetail(project)}});
    biscayPaths.on('mouseenter focus click',event=>{if(event.type==='click')event.stopPropagation();showBiscayInterconnectorDetail()}).on('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showBiscayInterconnectorDetail()}});
    svg.on('click',event=>{if(event.target===svg.node()){markers.classed('is-selected',false);populationGroups.classed('is-selected',false);networkNodes.classed('is-selected',false);biscayPaths.classed('is-selected',false);clearProjectSelection();clearGenerationProjectSelection();defaultDetail()}});
    defaultDetail();

    const active=new Set(TECHNOLOGY_ORDER),threshold=.1;let includeSmall=true,networkVisible=false,local132Visible=false,projectsVisible=false,generationProjectsVisible=false,populationsVisible=false;
    const filterButtons=new Map();
    const networkButton=document.createElement('button');networkButton.type='button';networkButton.className='map-network-toggle';networkButton.setAttribute('aria-pressed','false');networkButton.innerHTML='<i aria-hidden="true"></i>Red de transporte · 220/400 kV';networkButton.title='Mostrar u ocultar la red de transporte y sus nodos de interconexión exterior';networkButton.addEventListener('click',()=>{networkVisible=!networkVisible;updateNetworkVisibility()});filters.append(networkButton);
    const local132Button=document.createElement('button');local132Button.type='button';local132Button.className='map-local-toggle';local132Button.setAttribute('aria-pressed','false');local132Button.innerHTML='<i aria-hidden="true"></i>Conexiones locales · 132 kV';local132Button.title='Mostrar u ocultar las conexiones locales de 132 kV y sus subestaciones';local132Button.addEventListener('click',()=>{local132Visible=!local132Visible;updateNetworkVisibility()});filters.append(local132Button);
    const projectButton=document.createElement('button');projectButton.type='button';projectButton.className='map-project-toggle';projectButton.setAttribute('aria-pressed','false');projectButton.innerHTML='<i aria-hidden="true"></i>Red en construcción o aprobada';projectButton.title='Mostrar u ocultar las obras de red en construcción o con autorización administrativa de construcción';projectButton.addEventListener('click',()=>{projectsVisible=!projectsVisible;updateNetworkVisibility()});filters.append(projectButton);
    const generationProjectButton=document.createElement('button');generationProjectButton.type='button';generationProjectButton.className='map-generation-project-toggle';generationProjectButton.setAttribute('aria-pressed','false');generationProjectButton.innerHTML='<i aria-hidden="true"></i>Generación en construcción o aprobada';generationProjectButton.title='Mostrar u ocultar los proyectos de generación con autorización formal o construcción iniciada';generationProjectButton.addEventListener('click',()=>{generationProjectsVisible=!generationProjectsVisible;updateNetworkVisibility();updateVisibility()});filters.append(generationProjectButton);
    const populationButton=document.createElement('button');populationButton.type='button';populationButton.className='map-population-toggle';populationButton.setAttribute('aria-pressed','false');populationButton.innerHTML='<i aria-hidden="true"></i>Poblaciones';populationButton.title='Mostrar u ocultar las poblaciones; aparecen más nombres al acercar el mapa';populationButton.addEventListener('click',()=>{populationsVisible=!populationsVisible;updatePopulationVisibility()});filters.append(populationButton);
    metadata.forEach(item=>{
      const button=document.createElement('button');button.type='button';button.className='map-filter';button.style.setProperty('--map-color',item.color);button.setAttribute('aria-pressed','true');button.innerHTML=`<i aria-hidden="true"></i>${item.label} <strong>${formatNumber(item.points,0)}</strong>`;button.title=`${formatNumber(item.points,0)} emplazamientos · ${formatNumber(item.mw,1)} MW`;
      button.addEventListener('click',()=>{active.has(item.key)?active.delete(item.key):active.add(item.key);button.setAttribute('aria-pressed',String(active.has(item.key)));updateVisibility()});
      filterButtons.set(item.key,button);filters.append(button);
    });
    const smallButton=document.createElement('button');smallButton.type='button';smallButton.className='map-reset-filters';smallButton.setAttribute('aria-pressed','true');smallButton.textContent='Ocultar pequeñas < 0,1 MW';smallButton.addEventListener('click',()=>{includeSmall=!includeSmall;smallButton.setAttribute('aria-pressed',String(includeSmall));smallButton.textContent=includeSmall?'Ocultar pequeñas < 0,1 MW':'Incluir pequeñas < 0,1 MW';updateVisibility()});filters.append(smallButton);
    const resetButton=document.createElement('button');resetButton.type='button';resetButton.className='map-reset-filters';resetButton.textContent='Restablecer filtros';resetButton.addEventListener('click',()=>{TECHNOLOGY_ORDER.forEach(key=>active.add(key));filterButtons.forEach(button=>button.setAttribute('aria-pressed','true'));includeSmall=true;smallButton.setAttribute('aria-pressed','true');smallButton.textContent='Ocultar pequeñas < 0,1 MW';networkVisible=false;local132Visible=false;projectsVisible=false;generationProjectsVisible=false;populationsVisible=false;setElectricityExpanded(false);updateNetworkVisibility();updatePopulationVisibility();updateVisibility()});filters.append(resetButton);

    function updateNetworkVisibility(){
      gridLayer.style('display',networkVisible?null:'none');nodeLayer.style('display',networkVisible?null:'none');projectLayer.style('display',projectsVisible?null:'none');generationProjectLayer.style('display',generationProjectsVisible?null:'none');local132Layer.style('display',local132Visible?null:'none');substationLayer.style('display',local132Visible?null:'none');verifiedSubstationLayer.style('display',local132Visible?null:'none');networkLegend.hidden=!(networkVisible||local132Visible||projectsVisible||generationProjectsVisible);networkButton.setAttribute('aria-pressed',String(networkVisible));local132Button.setAttribute('aria-pressed',String(local132Visible));projectButton.setAttribute('aria-pressed',String(projectsVisible));generationProjectButton.setAttribute('aria-pressed',String(generationProjectsVisible));
      networkLegend.querySelectorAll('[data-layer="transport"]').forEach(item=>item.hidden=!networkVisible);networkLegend.querySelectorAll('[data-layer="local"]').forEach(item=>item.hidden=!local132Visible);networkLegend.querySelectorAll('[data-layer="substation"]').forEach(item=>item.hidden=!local132Visible);networkLegend.querySelectorAll('[data-layer="projects"]').forEach(item=>item.hidden=!projectsVisible);networkLegend.querySelectorAll('[data-layer="generation-projects"]').forEach(item=>item.hidden=!generationProjectsVisible);
      if(!networkVisible&&networkNodes.filter('.is-selected').node()){networkNodes.classed('is-selected',false);defaultDetail()}
      if(!projectsVisible&&(biscayPaths.filter('.is-selected').node()||projectPaths.filter('.is-selected').node()||projectMarkers.filter('.is-selected').node())){biscayPaths.classed('is-selected',false);clearProjectSelection();defaultDetail()}
      if(!generationProjectsVisible&&generationProjectMarkers.filter('.is-selected').node()){clearGenerationProjectSelection();defaultDetail()}
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
      const visible=records.filter(d=>active.has(d.key)&&(includeSmall||d.mw>=threshold)),visibleSet=new Set(visible);
      markers.style('display',d=>visibleSet.has(d)?null:'none');
      const visibleGenerationProjects=generationProjectRecords.filter(project=>active.has(project.key)),visibleGenerationProjectSet=new Set(visibleGenerationProjects);generationProjectMarkers.style('display',project=>visibleGenerationProjectSet.has(project)?null:'none');
      const units=visible.reduce((a,d)=>a+d.units,0),mw=visible.reduce((a,d)=>a+d.mw,0);
      count.textContent=`${formatNumber(visible.length,0)} emplazamientos · ${formatNumber(units,0)} instalaciones · ${formatNumber(mw,1)} MW en servicio visibles${generationProjectsVisible?` · ${formatNumber(visibleGenerationProjects.length,0)} proyectos (${formatNumber(visibleGenerationProjects.reduce((sum,project)=>sum+project.mw,0),1)} MW)`:''}`;
      const selectedNode=markers.filter('.is-selected').node(),selected=selectedNode?selectedNode.__data__:null;
      if(selected&&!visibleSet.has(selected)){markers.classed('is-selected',false);defaultDetail()}
      const selectedProjectNode=generationProjectMarkers.filter('.is-selected').node(),selectedProject=selectedProjectNode?selectedProjectNode.__data__:null;if(selectedProject&&!visibleGenerationProjectSet.has(selectedProject)){clearGenerationProjectSelection();defaultDetail()}
      updateEnergyShare();
    }

    function updateEnergyShare(){
      const rawFutureEnergy=Object.values(futureBarTechnologyEnergy).reduce((sum,value)=>sum+value,0),futureScale=rawFutureEnergy?Math.min(1,importedElectricEnergyBase/rawFutureEnergy):0,futureEnergy=generationProjectsVisible?['wind','solar'].filter(key=>active.has(key)).reduce((sum,key)=>sum+(futureBarTechnologyEnergy[key]||0)*futureScale,0):0;importedElectricEnergy=Math.max(0,importedElectricEnergyBase-futureEnergy);let selectedEnergy=0;
      barTechnologyKeys.forEach(key=>{
        const segment=energyShare.querySelector(`[data-technology="${key}"]`),isActive=active.has(key),energy=barTechnologyEnergy[key];
        if(!segment)return;
        segment.classList.toggle('is-inactive',!isActive);
        const smallNote=key==='solar'?` · pequeña solar: ${formatNumber(smallBarTechnologyEnergy.solar,1)} GWh estimados (${formatNumber(smallCapacityByTechnology.solar,2)} MW)`:'';
        segment.title=`${barTechnologyLabels[key]}${isActive?'':' (capa oculta)'}: ${formatNumber(energy,0)} GWh · ${formatNumber(electricEnergy?100*energy/electricEnergy:0,1)} % de la electricidad${smallNote}`;
        if(isActive)selectedEnergy+=key==='solar'&&!includeSmall?Math.max(0,energy-smallBarTechnologyEnergy.solar):energy;
      });
      ['wind','solar'].forEach(key=>{
        const segment=energyShare.querySelector(`[data-future-technology="${key}"]`),energy=(futureBarTechnologyEnergy[key]||0)*futureScale;
        if(!segment)return;
        const isVisible=generationProjectsVisible&&active.has(key);segment.hidden=!isVisible;
        segment.style.flex=String(energy);
        const summary=segment.querySelector(`[data-future-summary="${key}"]`);if(summary)summary.textContent=`${formatNumber(energy,0)} GWh potenciales · ${formatNumber(futureCapacityByTechnology[key],1)} MW`;
        segment.title=`${barTechnologyLabels[key]} en construcción o aprobada: ${formatNumber(futureCapacityByTechnology[key],1)} MW · ${formatNumber(energy,0)} GWh/año potenciales estimados con el rendimiento medio de 2024 · ${formatNumber(futureProjectCountByTechnology[key],0)} proyectos`;
        if(isVisible)selectedEnergy+=energy;
      });
      const importedSegment=energyShare.querySelector('.map-energy-share-imported'),bar=energyShare.querySelector('.map-energy-share-bar'),basisLabel=energyShare.querySelector('[data-energy-share-basis]');
      if(importedSegment){importedSegment.style.flex=String(importedElectricEnergy);importedSegment.classList.toggle('is-inactive',!networkVisible);importedSegment.title=`Electricidad importada${networkVisible?'':' (capa de red de transporte oculta)'}: ${formatNumber(importedElectricEnergy,0)} GWh · ${formatNumber(electricEnergy?100*importedElectricEnergy/electricEnergy:0,1)} % de la electricidad${generationProjectsVisible?' · reducida por el potencial anual estimado de los proyectos solares y eólicos autorizados o en construcción':''}`}
      if(basisLabel)basisLabel.textContent=generationProjectsVisible?'Base 2024 + proyectos':'2024';
      if(bar){bar.classList.toggle('is-small-hidden',!includeSmall);bar.setAttribute('aria-label',`Electricidad: ${formatNumber(electricShare,1)} % del consumo final. Energía no eléctrica, principalmente petróleo y gas natural: ${formatNumber(nonElectricShare,1)} %. Las capas de generación visibles representan ${formatNumber(selectedEnergy,0)} GWh; la capa de red de transporte ${networkVisible?'muestra':'oculta'} ${formatNumber(importedElectricEnergy,0)} GWh importados.${generationProjectsVisible?` Los proyectos solares y eólicos visibles añaden ${formatNumber(futureEnergy,0)} GWh potenciales y reducen en la misma cantidad la importación.`:''}`)}
    }
    updateNetworkVisibility();
    updatePopulationVisibility();
    updateVisibility();
  };
})();
