{
  const inventory=window.energyMapGenerationProjects;
  if(inventory){
    inventory.updated="30 de julio de 2026";
    if(!inventory.projects.some(project=>project.id==="piparra-solar")){
      inventory.projects.push({
        id:"piparra-solar",
        name:"Piparra Solar",
        technology:"solar",
        mw:4.945,
        mwp:5.427,
        status:"prior-authorized",
        statusLabel:"Autorización administrativa previa",
        approvalDate:"22 de mayo de 2026",
        municipalities:["Vitoria-Gasteiz","Arratzua-Ubarrundia"],
        coordinate:[-2.62,42.94],
        area:"7,055 ha",
        locationNote:"Punto aproximado del ámbito al norte de Vitoria-Gasteiz y junto a Arratzua-Ubarrundia; las parcelas constan en el expediente.",
        note:"La autorización previa aprueba las características esenciales, pero todavía requiere autorización administrativa de construcción.",
        annualEstimateAudit:{
          annualGWh:6.734517,
          technology:"solar fotovoltaica fija",
          location:[-2.62,42.94],
          calculationPowerMWp:5.427,
          source:"PVGIS 5.3 · SARAH3",
          method:"Ángulos fijos óptimos, horizonte calculado y pérdidas del sistema del 14 %",
          uncertainty:"Desviación interanual PVGIS: 0,270307 GWh/año; la coordenada es representativa del ámbito y no el centroide parcelario.",
          partialModelEntry:"50 % en 2029",
          fullModelEntry:"100 % desde 2030",
          calculatedAt:"30 de julio de 2026"
        },
        sources:[
          {label:"Gobierno Vasco · Piparra Solar, AAP",url:"https://www.euskadi.eus/bopv2/datos/2026/06/s26_0107.shtml"},
          {label:"Gobierno Vasco · información pública y proyecto",url:"https://www.euskadi.eus/bopv2/datos/2026/01/2600304a.pdf"},
          {label:"Gobierno Vasco · informe de impacto ambiental",url:"https://www.euskadi.eus/bopv2/datos/2025/06/2502505a.shtml"}
        ]
      });
    }
    inventory.exclusions=(inventory.exclusions||[]).map(text=>text.replace("Piparra, ",""));
  }
}
