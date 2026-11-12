window.energyMapPtsAptitudePotential={
  schemaVersion:1,
  calculatedOn:'2026-11-12',
  electricityReference:{
    year:2050,
    scenario:'cumplimiento con electrificación alta',
    gridDemandGWh:17318.118239854666,
    totalElectricServiceGWh:18745.5996,
    directSelfConsumptionGWh:1427.4813601453334,
    electrificationSharePhysicalPct:52,
    electrificationShareRegisteredPct:50.020948,
    base2024GWh:13210.096,
    note:'La barra usa como 100 % la demanda que debe abastecer la red. La electrificación es el 52 % del consumo final físico. En el balance registrado, después de descontar el autoconsumo directo tanto del numerador como del denominador, la electricidad representa aproximadamente el 50 %.'
  },
  methodology:'Estimación de potencial físico-técnico, independiente del régimen de autorización del PTS. El PDF y la cartografía del PTS son provisionales y pueden ampliarse o modificarse; sus geometrías se usan como fotografía territorial disponible, no como límites definitivos. Se calcula la superficie de aptitud situada fuera de las ZLS × una densidad territorial máxima. En eólica se aplica 1 aerogenerador G132 de 3,465 MW por cada 100 ha y las horas equivalentes medias obtenidas al cruzar cada aptitud con el mapa continuo oficial de velocidad a 100 m: 2.972 h en alta, 2.422 h en media, 2.104 h en baja y 1.995 h en muy baja. La velocidad se transforma en horas mediante una aproximación cúbica calibrada en 2.650 h a 6,22 m/s y limitada a 4.000 h. En fotovoltaica se aplica una ocupación máxima del 10 %, la densidad media de potencia de las ZLS y factores de capacidad del 15 % central, 13 % bajo y 17 % alto; la memoria del PTS considera explotable la irradiación en todo Euskadi. Es un máximo físico-técnico sujeto a incertidumbre, no potencia asignada, superficie autorizable, escenario probable ni evaluación ambiental.',
  uncertainty:'muy alta',
  references:{
    ptsMemory:'https://www.euskadi.eus/contenidos/informacion/pts_fase_ap_defi/es_def/adjuntos/DEFINITIVA-DOC-I-MEMORIA.pdf',
    ptsCartography:'https://www.euskadi.eus/contenidos/informacion/pts_fase_ap_defi/es_def/adjuntos/20260327_SHP.zip',
    protocol:'03_Analisis/PROTOCOLO_ESTIMACION_PRODUCCION_ANUAL.md'
  },
  reference:{
    wind:{turbinePowerMW:3.465,maximumTurbinesPer100Ha:1,annualHoursByAptitude:{high:2972.2,medium:2422.4,low:2104.2,veryLow:1994.9},uncertaintyRelative:0.20},
    solar:{zlsAreaHa:2930.9,zlsPotentialMW:2500,mwPerOccupiedHa:0.8529803132,maximumOccupiedShare:0.10,capacityFactorCentral:0.15,capacityFactorLow:0.13,capacityFactorHigh:0.17}
  },
  layers:{
    'aptitude-wind-high':{technology:'wind',aptitude:'high',totalAreaHa:7073.57,zlsOverlapHa:373.38,additionalAreaHa:6700.19,meanWindSpeedMs:6.479,annualEquivalentHours:2972.2,potentialMW:232.16,annualGWhEstimate:690.03,annualGWhLow:552.02,annualGWhHigh:828.04,annualGWhMethod:'6.700,19 ha fuera de ZLS × 1 aerogenerador/100 ha × 3,465 MW × 2.972,2 h/año medias derivadas del mapa continuo oficial de viento.',uncertainty:'alta'},
    'aptitude-wind-medium':{technology:'wind',aptitude:'medium',totalAreaHa:76550.80,zlsOverlapHa:4418.34,additionalAreaHa:72132.46,meanWindSpeedMs:5.974,annualEquivalentHours:2422.4,potentialMW:2499.39,annualGWhEstimate:6054.52,annualGWhLow:4843.62,annualGWhHigh:7265.43,annualGWhMethod:'72.132,46 ha fuera de ZLS × 1 aerogenerador/100 ha × 3,465 MW × 2.422,4 h/año medias derivadas del mapa continuo oficial de viento. No aplica el corte económico de 6,22 m/s.',uncertainty:'muy alta'},
    'aptitude-wind-low':{technology:'wind',aptitude:'low',totalAreaHa:141479.83,zlsOverlapHa:839.99,additionalAreaHa:140639.84,meanWindSpeedMs:5.670,annualEquivalentHours:2104.2,potentialMW:4873.17,annualGWhEstimate:10254.12,annualGWhLow:8203.30,annualGWhHigh:12304.95,annualGWhMethod:'140.639,84 ha fuera de ZLS × 1 aerogenerador/100 ha × 3,465 MW × 2.104,2 h/año medias derivadas del mapa continuo oficial de viento. Estimación física, no escenario de implantación.',uncertainty:'muy alta'},
    'aptitude-wind-very-low':{technology:'wind',aptitude:'very-low',totalAreaHa:45045.90,zlsOverlapHa:20.96,additionalAreaHa:45024.94,meanWindSpeedMs:5.576,annualEquivalentHours:1994.9,potentialMW:1560.11,annualGWhEstimate:3112.27,annualGWhLow:2489.82,annualGWhHigh:3734.73,annualGWhMethod:'45.024,94 ha fuera de ZLS × 1 aerogenerador/100 ha × 3,465 MW × 1.994,9 h/año medias derivadas del mapa continuo oficial de viento. Estimación física, no superficie autorizable.',uncertainty:'extrema'},
    'aptitude-solar-high':{technology:'solar',aptitude:'high',totalAreaHa:15898.13,zlsOverlapHa:1684.27,additionalAreaHa:14213.86,potentialMW:1212.41,annualGWhEstimate:1593.11,annualGWhLow:1380.70,annualGWhHigh:1805.53,annualGWhMethod:'14.213,86 ha fuera de ZLS × 10 % de ocupación máxima × 0,852980 MW/ha ocupada × 8.760 h/año × 15 % central; intervalo 13–17 %.',uncertainty:'alta'},
    'aptitude-solar-medium':{technology:'solar',aptitude:'medium',totalAreaHa:61285.99,zlsOverlapHa:1263.66,additionalAreaHa:60022.33,potentialMW:5119.79,annualGWhEstimate:6727.40,annualGWhLow:5830.41,annualGWhHigh:7624.39,annualGWhMethod:'60.022,33 ha fuera de ZLS × 10 % de ocupación máxima × 0,852980 MW/ha ocupada × 8.760 h/año × 15 % central; intervalo 13–17 %. Toda Euskadi tiene irradiación explotable según la memoria.',uncertainty:'alta'},
    'aptitude-solar-low':{technology:'solar',aptitude:'low',totalAreaHa:125181.58,zlsOverlapHa:0.01,additionalAreaHa:125181.57,potentialMW:10677.74,annualGWhEstimate:14030.55,annualGWhLow:12159.81,annualGWhHigh:15901.29,annualGWhMethod:'125.181,57 ha fuera de ZLS × 10 % de ocupación máxima × 0,852980 MW/ha ocupada × 8.760 h/año × 15 % central; intervalo 13–17 %. Estimación física, no escenario de implantación.',uncertainty:'muy alta'},
    'aptitude-solar-very-low':{technology:'solar',aptitude:'very-low',totalAreaHa:101770.88,zlsOverlapHa:0.00,additionalAreaHa:101770.88,potentialMW:8680.86,annualGWhEstimate:11406.64,annualGWhLow:9885.76,annualGWhHigh:12927.53,annualGWhMethod:'101.770,88 ha fuera de ZLS × 10 % de ocupación máxima × 0,852980 MW/ha ocupada × 8.760 h/año × 15 % central; intervalo 13–17 %. Máximo físico-técnico, no superficie autorizable ni implantación probable.',uncertainty:'extrema'}
  }
};
