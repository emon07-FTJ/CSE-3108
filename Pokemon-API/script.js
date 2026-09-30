// DOM References
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const quickSearchButtons = document.querySelectorAll(".quick-search button");

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const emptyEl = document.getElementById("empty");

const cardEl = document.getElementById("card");
const nameEl = document.getElementById("pokemon-name");
const idEl = document.getElementById("pokemon-id");
const spriteEl = document.getElementById("pokemon-sprite");
const typesEl = document.getElementById("pokemon-types");
const heightEl = document.getElementById("pokemon-height");
const weightEl = document.getElementById("pokemon-weight");
const statsEl = document.getElementById("pokemon-stats");
const abilitiesEl = document.getElementById("pokemon-abilities");

// 18 Pokémon types for clearing dynamic theme classes
const POKEMON_TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "steel", "fairy", "dark"
];

// Toggle UI States
function showState(state, errorMessage = "") {
  loadingEl.hidden = state !== "loading";
  errorEl.hidden = state !== "error";
  emptyEl.hidden = state !== "empty";
  cardEl.hidden = state !== "card";

  if (state === "error") {
    errorEl.textContent = errorMessage;
  }
}

// Format API Stat Names
function formatStatName(statName) {
  const statMap = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SpA",
    "special-defense": "SpD",
    speed: "Spe",
  };
  return statMap[statName] || statName.toUpperCase();
}

// Fetch Pokémon Data
async function fetchPokemon(query) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return;

  showState("loading");

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanQuery}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No Pokémon found for "${query}". Check spelling or ID.`);
      }
      throw new Error("Failed to fetch data. Please try again.");
    }

    const data = await response.json();
    renderPokemonCard(data);
    showState("card");
  } catch (error) {
    console.error(error);
    showState("error", error.message);
  }
}

// Render Card
function renderPokemonCard(data) {
  // Clear dynamic lists
  typesEl.innerHTML = "";
  statsEl.innerHTML = "";
  abilitiesEl.innerHTML = "";

  // Apply Theme Class
  POKEMON_TYPES.forEach((type) => cardEl.classList.remove(`type-${type}`));
  const primaryType = data.types[0]?.type.name;
  if (primaryType) {
    cardEl.classList.add(`type-${primaryType}`);
  }

  // Header & Measurements
  nameEl.textContent = data.name;
  idEl.textContent = `#${String(data.id).padStart(3, "0")}`;
  heightEl.textContent = `${(data.height / 10).toFixed(1)} m`;
  weightEl.textContent = `${(data.weight / 10).toFixed(1)} kg`;

  // Sprite
  const artworkUrl = data.sprites.other?.["official-artwork"]?.front_default 
    || data.sprites.front_default;
  spriteEl.src = artworkUrl;
  spriteEl.alt = `Official artwork of ${data.name}`;

  // Types
  data.types.forEach(({ type }) => {
    const li = document.createElement("li");
    li.className = `type-badge type-${type.name}`;
    li.textContent = type.name;
    typesEl.appendChild(li);
  });

  // Base Stats
  data.stats.forEach(({ base_stat, stat }) => {
    const li = document.createElement("li");
    li.className = "stat";

    const percentage = Math.min((base_stat / 150) * 100, 100);
    li.style.setProperty("--stat-percent", `${percentage}%`);

    li.innerHTML = `
      <span class="stat__label">${formatStatName(stat.name)}</span>
      <span class="stat__value">${base_stat}</span>
      <span class="stat__track"><span class="stat__fill"></span></span>
    `;
    statsEl.appendChild(li);
  });

  // Abilities
  data.abilities.slice(0, 3).forEach(({ ability, is_hidden }) => {
    const li = document.createElement("li");
    li.textContent = ability.name.replace("-", " ");
    if (is_hidden) {
      const hiddenSpan = document.createElement("span");
      hiddenSpan.className = "ability__hidden";
      hiddenSpan.textContent = "(Hidden)";
      li.appendChild(hiddenSpan);
    }
    abilitiesEl.appendChild(li);
  });
}

// Event Listeners
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  fetchPokemon(searchInput.value);
});

quickSearchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const pokemonName = button.dataset.pokemon;
    searchInput.value = pokemonName;
    fetchPokemon(pokemonName);
  });
});