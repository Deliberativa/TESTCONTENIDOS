(() => {
  const host = document.querySelector("[data-wind-green-map]");
  const data = window.windGreenMapData;
  const territory = window.energyMapTerritories;
  if (!host || !data || !territory || !window.d3) return;

  const reverseGeometry = (geometry) => {
    if (!geometry) return geometry;
    if (geometry.type === "Polygon") {
      return { ...geometry, coordinates: geometry.coordinates.map((ring) => [...ring].reverse()) };
    }
    if (geometry.type === "MultiPolygon") {
      return {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon) =>
          polygon.map((ring) => [...ring].reverse())
        ),
      };
    }
    return geometry;
  };
  const normalize = (collection) => ({
    ...collection,
    features: collection.features.map((feature) => ({
      ...feature,
      geometry: reverseGeometry(feature.geometry),
    })),
  });

  const mapTerritory = normalize(territory);
  const zls = normalize(data.zls);
  const protectedAreas = normalize(data.protected);
  const connectivity = normalize(data.connectivity);
  const width = 900;
  const height = 535;
  const projection = d3.geoMercator().fitExtent(
    [
      [18, 18],
      [width - 18, height - 18],
    ],
    mapTerritory
  );
  const path = d3.geoPath(projection);
  const svg = d3
    .select(host)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr(
      "aria-label",
      "Mapa de Euskadi que superpone las zonas de localización seleccionada eólicas con los espacios protegidos, corredores ecológicos y otros espacios de interés natural de la infraestructura verde"
    );

  const defs = svg.append("defs");
  const protectedClip = defs.append("clipPath").attr("id", "wind-green-protected-clip");
  protectedClip
    .selectAll("path")
    .data(protectedAreas.features)
    .join("path")
    .attr("d", path)
    .attr("fill-rule", "evenodd");
  const corridorClip = defs.append("clipPath").attr("id", "wind-green-corridor-clip");
  corridorClip
    .selectAll("path")
    .data(connectivity.features)
    .join("path")
    .attr("d", path)
    .attr("fill-rule", "evenodd");

  svg
    .append("path")
    .datum(mapTerritory)
    .attr("d", path)
    .attr("fill", "#f3f6f1")
    .attr("stroke", "#55786d")
    .attr("stroke-width", 1.1);

  const layer = (className, collection, fill, opacity, stroke = "none") =>
    svg
      .append("g")
      .attr("class", className)
      .selectAll("path")
      .data(collection.features)
      .join("path")
      .attr("d", path)
      .attr("fill-rule", "evenodd")
      .attr("fill", fill)
      .attr("fill-opacity", opacity)
      .attr("stroke", stroke)
      .attr("stroke-width", stroke === "none" ? 0 : 0.45);

  layer("wind-green-connectivity", connectivity, "#91b84f", 0.38, "#668c32");
  layer("wind-green-protected", protectedAreas, "#2b7555", 0.38, "#1f6245");
  const zlsPaths = layer("wind-green-zls", zls, "#2d7fae", 0.64, "#125376");

  svg
    .append("g")
    .attr("clip-path", "url(#wind-green-corridor-clip)")
    .selectAll("path")
    .data(zls.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "#d98a21")
    .attr("fill-opacity", 0.9)
    .attr("stroke", "#8b5012")
    .attr("stroke-width", 0.5);

  svg
    .append("g")
    .attr("clip-path", "url(#wind-green-protected-clip)")
    .selectAll("path")
    .data(zls.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "#b63d35")
    .attr("fill-opacity", 0.95)
    .attr("stroke", "#7d211d")
    .attr("stroke-width", 0.65);

  svg
    .append("path")
    .datum(mapTerritory)
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "#294f45")
    .attr("stroke-width", 1.15)
    .style("pointer-events", "none");

  const detail = document.querySelector("[data-wind-green-detail]");
  const showDetail = (_, feature) => {
    if (!detail) return;
    const code = feature.properties?.code || "sin código";
    const hectares = Number(feature.properties?.hectares);
    detail.innerHTML = `<strong>ZLS eólica ${code}</strong>${
      Number.isFinite(hectares)
        ? ` · ${hectares.toLocaleString("es-ES", { maximumFractionDigits: 1 })} ha`
        : ""
    }. Es potencial territorial: cualquier proyecto concreto requiere evaluación ambiental favorable.`;
  };
  zlsPaths
    .style("cursor", "pointer")
    .attr("tabindex", 0)
    .attr("role", "button")
    .attr("aria-label", (feature) => `Consultar ZLS eólica ${feature.properties?.code || ""}`)
    .on("mouseenter focus click", showDetail)
    .on("keydown", (event, feature) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showDetail(event, feature);
      }
    });

  [
    { name: "Bilbao", coordinates: [-2.935, 43.263] },
    { name: "Donostia", coordinates: [-1.981, 43.318] },
    { name: "Vitoria-Gasteiz", coordinates: [-2.673, 42.846] },
  ].forEach((city) => {
    const [x, y] = projection(city.coordinates);
    svg.append("circle").attr("cx", x).attr("cy", y).attr("r", 2.6).attr("fill", "#183f37");
    svg
      .append("text")
      .attr("x", x + 6)
      .attr("y", y - 5)
      .attr("fill", "#183f37")
      .attr("font-size", 11)
      .attr("font-weight", 700)
      .text(city.name);
  });
})();
