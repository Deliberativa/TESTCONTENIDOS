(function correctReeGenerationInstallations(){
  const inventory=window.energyMapReeInstallations;
  if(!inventory||!Array.isArray(inventory.features))return;

  const eveSource='Datos proporcionados por EVE';
  const duplicatedInEve=new Set([
    2539, // Ekiola Mendialdea: 1 MW nominal en ESIOS; 1,50 MWp en EVE.
    8726, // Leintz Bailarako Ekiola: 1 MW nominal en ESIOS; 1,256 MWp en EVE.
    8770  // Ekindar Azpeitia: 1 MW nominal en ESIOS; 1,256 MWp en EVE.
  ]);

  inventory.features=inventory.features.filter(feature=>{
    const properties=feature&&feature.properties?feature.properties:{};
    const id=Number(feature&&feature.id);
    const isMisclassifiedElgeaStorage=
      properties.minetur==='RE-003932'&&
      properties.tecnologia==='Fotovoltaica'&&
      Math.abs(Number(properties.mw)-5.53)<0.001;
    return !isMisclassifiedElgeaStorage&&!duplicatedInEve.has(id);
  });

  // Arasur 1 y 2 ya figuraba en ESIOS como un único registro agregado de
  // 24 MW. Se conserva una sola vez y se asigna al listado declarado por EVE.
  const arasur=inventory.features.find(feature=>Number(feature&&feature.id)===2582);
  if(arasur&&arasur.properties){
    Object.assign(arasur.properties,{
      descripcion:'ARASUR 1 y 2 · plantas solares fotovoltaicas',
      fuente:eveSource,
      eveTipo:'Fotovoltaica a red',
      eveComarca:'Arabako Ibarrak / Valles Alaveses',
      annualGWhEstimate:33.596,
      annualGWhMethod:'Factor medio del inventario solar 2024 (81,7 GWh / 58,36 MW)'
    });
  }

  // Relación agregada facilitada por EVE. Como no incorpora coordenadas ni
  // identificadores registrales, estos 36 puntos se sitúan aproximadamente
  // dentro del municipio y no se usan para inferir nuevos solapes.
  const eveRows=[
    [900000,-2.695155,42.850695,4.4506,'ARABA/ÁLAVA Vitoria-Gasteiz','ARABA/ÁLAVA','Arabako Lautada / Llanada Alavesa',1735689600000],
    [900001,-2.620775,43.12344,2.4948,'BIZKAIA Abadiño','BIZKAIA','Durangaldea / Duranguesado',1704067200000],
    [900002,-3.033355,42.747885,2.1312,'ARABA/ÁLAVA Lantarón','ARABA/ÁLAVA','Arabako Ibarrak / Valles Alaveses',1767225600000],
    [900003,-2.672975,43.25573,2.06388,'BIZKAIA Muxika','BIZKAIA','Gernika-Bermeo',1704067200000],
    [900004,-2.982585,43.32855,1.8205,'BIZKAIA Leioa','BIZKAIA','Bilbo Handia / Gran Bilbao',1704067200000],
    [900005,-2.91336,43.316385,1.71628,'BIZKAIA Loiu','BIZKAIA','Bilbo Handia / Gran Bilbao',1672531200000],
    [900006,-2.988666,43.330914,1.51288,'BIZKAIA Leioa','BIZKAIA','Bilbo Handia / Gran Bilbao',1735689600000],
    [900007,-2.43863,42.740565,1.5,'ARABA/ÁLAVA Arraia-Maeztu','ARABA/ÁLAVA','Arabako Mendialdea / Montaña Alavesa',1672531200000],
    [900008,-2.376475,42.84919,1.256,'ARABA/ÁLAVA Agurain / Salvatierra','ARABA/ÁLAVA','Arabako Lautada / Llanada Alavesa',1735689600000],
    [900009,-2.729335,42.968195,1.256,'ARABA/ÁLAVA Zigoitia','ARABA/ÁLAVA','Gorbeia Inguruak / Estribaciones del Gorbea',1735689600000],
    [900010,-2.46566,43.249395,1.256,'BIZKAIA Etxebarria','BIZKAIA','Markina-Ondarroa',1735689600000],
    [900011,-2.493805,43.067275,1.256,'GIPUZKOA Arrasate / Mondragón','GIPUZKOA','Debagoiena / Alto Deba',1704067200000],
    [900012,-2.251975,43.16502,1.256,'GIPUZKOA Azpeitia','GIPUZKOA','Urola-Kostaldea / Urola Costa',1704067200000],
    [900013,-2.701236,42.853059,1.24986,'ARABA/ÁLAVA Vitoria-Gasteiz','ARABA/ÁLAVA','Arabako Lautada / Llanada Alavesa',1735689600000],
    [900014,-2.919441,43.318749,1.19412,'BIZKAIA Loiu','BIZKAIA','Bilbo Handia / Gran Bilbao',1609459200000],
    [900015,-2.865335,43.289465,1.17755,'BIZKAIA Zamudio','BIZKAIA','Bilbo Handia / Gran Bilbao',1704067200000],
    [900016,-2.698349,42.847208,1.01631,'ARABA/ÁLAVA Vitoria-Gasteiz','ARABA/ÁLAVA','Arabako Lautada / Llanada Alavesa',1735689600000],
    [900017,-2.720865,43.21562,1.01403,'BIZKAIA Amorebieta-Etxano','BIZKAIA','Durangaldea / Duranguesado',1704067200000],
    [900018,-2.90153,42.724815,0.99955,'ARABA/ÁLAVA Ribera Baja / Erribera Beitia','ARABA/ÁLAVA','Arabako Ibarrak / Valles Alaveses',1735689600000],
    [900019,-2.05348,43.26884,0.99912,'GIPUZKOA Usurbil','GIPUZKOA','Donostialdea / Donostia-San Sebastián',1672531200000],
    [900020,-2.6383,42.98337,0.99735,'ARABA/ÁLAVA Legutio','ARABA/ÁLAVA','Gorbeia Inguruak / Estribaciones del Gorbea',1735689600000],
    [900021,-2.644381,42.985734,0.99735,'ARABA/ÁLAVA Legutio','ARABA/ÁLAVA','Gorbeia Inguruak / Estribaciones del Gorbea',1735689600000],
    [900022,-2.21441,43.07471,0.9963,'GIPUZKOA Beasain','GIPUZKOA','Goierri',1672531200000],
    [900023,-3.0063,43.271725,0.99,'BIZKAIA Barakaldo','BIZKAIA','Bilbo Handia / Gran Bilbao',1672531200000],
    [900024,-2.56922,42.544005,0.9891,'ARABA/ÁLAVA Laguardia','ARABA/ÁLAVA','Errioxa Arabarra / Rioja Alavesa',1704067200000],
    [900025,-2.371415,43.09642,0.98792,'GIPUZKOA Antzuola','GIPUZKOA','Debagoiena / Alto Deba',1704067200000],
    [900026,-2.696525,42.853473,0.92907,'ARABA/ÁLAVA Vitoria-Gasteiz','ARABA/ÁLAVA','Arabako Lautada / Llanada Alavesa',1704067200000],
    [900027,-2.626856,43.125804,0.913,'BIZKAIA Abadiño','BIZKAIA','Durangaldea / Duranguesado',1735689600000],
    [900028,-3.012381,43.274089,0.91233,'BIZKAIA Barakaldo','BIZKAIA','Bilbo Handia / Gran Bilbao',1672531200000],
    [900029,-2.382556,42.851554,0.8748,'ARABA/ÁLAVA Agurain / Salvatierra','ARABA/ÁLAVA','Arabako Lautada / Llanada Alavesa',1672531200000],
    [900030,-2.202315,43.022,0.81324,'GIPUZKOA Olaberria','GIPUZKOA','Goierri',1609459200000],
    [900031,-2.35641,42.686675,0.80098,'ARABA/ÁLAVA Campezo / Kanpezu','ARABA/ÁLAVA','Arabako Mendialdea / Montaña Alavesa',1704067200000],
    [900032,-2.61861,42.506915,0.8004,'ARABA/ÁLAVA Elciego','ARABA/ÁLAVA','Errioxa Arabarra / Rioja Alavesa',1704067200000],
    [900033,-2.623969,43.119953,0.75536,'BIZKAIA Abadiño','BIZKAIA','Durangaldea / Duranguesado',1735689600000],
    [900034,-2.622145,43.126218,0.7521,'BIZKAIA Abadiño','BIZKAIA','Durangaldea / Duranguesado',1672531200000],
    [900035,-2.411965,43.01433,0.702,'GIPUZKOA Oñati','GIPUZKOA','Debagoiena / Alto Deba',1672531200000]
  ];
  const existingIds=new Set(inventory.features.map(feature=>Number(feature&&feature.id)));
  const factor=81.7/58.36;
  eveRows.forEach(([id,longitude,latitude,mw,municipio,provincia,comarca,alta])=>{
    if(existingIds.has(id))return;
    inventory.features.push({
      type:'Feature',
      id,
      geometry:{type:'Point',coordinates:[longitude,latitude]},
      properties:{
        descripcion:id===900012?'Ekindar Azpeitia':'Instalación fotovoltaica a red',
        numero:1,
        municipio,
        cuenca:'No indicada',
        mw,
        provincia,
        municipio_ine:'No indicado',
        minetur:'No facilitado por EVE',
        tecnologia:'Fotovoltaica',
        alta,
        baja:64060588800000,
        objectid:id,
        fecha_mod:1784246400000,
        fuente:eveSource,
        ubicacion_aproximada:true,
        eveTipo:'Fotovoltaica a red',
        eveComarca:comarca,
        annualGWhEstimate:Math.round(mw*factor*1000)/1000,
        annualGWhMethod:'Factor medio del inventario solar 2024 (81,7 GWh / 58,36 MW)'
      }
    });
  });
})();
