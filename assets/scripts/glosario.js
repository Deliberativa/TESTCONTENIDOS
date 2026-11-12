(async function () {
  const root = document.getElementById("glossary-root");
  const search = document.getElementById("glossary-search");
  const count = document.getElementById("glossary-count");
  const empty = document.getElementById("glossary-empty");
  if (!root || !search || !count || !empty) return;

  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

  const response = await fetch("assets/data/glosario.json", { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudo cargar el glosario.");
  const data = await response.json();
  const seen = new Set();
  const items = [];

  for (const section of data.sections) {
    const sectionElement = document.createElement("section");
    sectionElement.className = "glossary-section";
    sectionElement.id = `glosario-${section.id}`;
    sectionElement.innerHTML = `
      <header class="glossary-section-heading">
        <p class="section-introduction-kicker">${section.id === "relato" ? "Primera lectura" : "Consulta adicional"}</p>
        <h2>${section.title}</h2>
        <p>${section.description}</p>
      </header>
      <dl class="glossary-list"></dl>`;
    const list = sectionElement.querySelector(".glossary-list");

    for (const entry of section.terms) {
      if (seen.has(entry.id)) throw new Error(`Término duplicado: ${entry.id}`);
      seen.add(entry.id);
      const item = document.createElement("div");
      item.className = "glossary-entry";
      item.dataset.search = normalize(`${entry.term} ${entry.definition} ${entry.example}`);
      item.innerHTML = `
        <dt>${entry.term}</dt>
        <dd>
          <p>${entry.definition}</p>
          <p class="glossary-example"><strong>Ejemplo:</strong> ${entry.example}</p>
        </dd>`;
      list.appendChild(item);
      items.push(item);
    }
    root.appendChild(sectionElement);
  }

  const update = () => {
    const query = normalize(search.value.trim());
    let visible = 0;
    for (const item of items) {
      const show = !query || item.dataset.search.includes(query);
      item.hidden = !show;
      if (show) visible += 1;
    }
    for (const section of root.querySelectorAll(".glossary-section")) {
      section.hidden = !section.querySelector(".glossary-entry:not([hidden])");
    }
    count.textContent = `${visible} ${visible === 1 ? "concepto" : "conceptos"}`;
    empty.hidden = visible !== 0;
  };

  search.addEventListener("input", update);
  update();
})().catch((error) => {
  const root = document.getElementById("glossary-root");
  if (root) root.innerHTML = `<p class="glossary-error">${error.message}</p>`;
});
