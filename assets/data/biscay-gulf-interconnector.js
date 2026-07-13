window.energyMapBiscayInterconnector={
  type:'FeatureCollection',
  metadata:{
    name:'Interconexión eléctrica por el Golfo de Bizkaia',
    status:'En construcción',
    commissioning:'Puesta en servicio prevista en 2028',
    voltage:'HVDC ±400 kV',
    capacity:'2 enlaces de 1.000 MW',
    cables:'4 cables, dos por enlace',
    exchange:'Elevará la capacidad de intercambio España-Francia de 2.800 a 5.000 MW',
    landLength:'13 km soterrados en Bizkaia',
    marineLength:'Aproximadamente 300 km submarinos',
    gatika:[-2.880553,43.349736],
    drillingStart:[-2.87135,43.42820],
    seaExit:[-2.862695,43.436352],
    destination:'Cubnezais, entorno de Burdeos (Francia)',
    source:'INELFE / Red Eléctrica',
    sourceUrl:'https://www.inelfe.eu/es/proyectos/golfo-de-bizkaia',
    constructionUrl:'https://www.ree.es/es/sala-de-prensa/actualidad/nota-de-prensa/2025/06/red-electrica-inicia-linea-subterranea-golfo-bizkaia',
    geometryNote:'El punto de salida al mar y el eje simplificado en aguas españolas proceden del proyecto técnico georreferenciado de INELFE. El tramo terrestre Gatika-Lemoiz es esquemático y ninguna de las geometrías debe utilizarse para mediciones de obra.'
  },
  features:[
    {
      type:'Feature',
      id:'biscay-underground',
      properties:{segment:'underground',label:'Tramo terrestre soterrado · 13 km',accuracy:'Esquema entre la subestación de Gatika y el inicio de la perforación horizontal dirigida de Lemoiz'},
      geometry:{type:'LineString',coordinates:[[-2.880553,43.349736],[-2.87135,43.42820]]}
    },
    {
      type:'Feature',
      id:'biscay-drilling',
      properties:{segment:'drilling',label:'Perforación dirigida tierra-mar · Lemoiz',accuracy:'Punto de salida central publicado en el proyecto técnico'},
      geometry:{type:'LineString',coordinates:[[-2.87135,43.42820],[-2.862695,43.436352]]}
    },
    {
      type:'Feature',
      id:'biscay-marine',
      properties:{segment:'marine',label:'Tramo submarino hacia Francia · en construcción',accuracy:'Eje central simplificado del trazado autorizado en aguas españolas, extraído del plano técnico georreferenciado'},
      geometry:{type:'LineString',coordinates:[[-2.862695,43.436352],[-2.861881,43.437132],[-2.852056,43.443704],[-2.822611,43.449471],[-2.793111,43.469862],[-2.760035,43.472424],[-2.657469,43.445417],[-2.618257,43.441130],[-2.579014,43.442297],[-2.559438,43.436419],[-2.466400,43.420835],[-2.431999,43.412690],[-2.402561,43.415189],[-2.382959,43.414472],[-2.353598,43.409470],[-2.324190,43.409076],[-2.137690,43.436793],[-2.098284,43.448375],[-2.033885,43.457768],[-1.900433,43.485476],[-1.786944,43.515861],[-1.773189,43.524834]]}
    }
  ]
};
