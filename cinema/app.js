const shots = [
  ["extreme-wide-shot", "Extreme Wide Shot", "Shot Size", "Shows the full environment with the subject very small.", "Establishing location, scale, adventure.", "Epic, open, cinematic.", "Use an extreme wide shot to make the subject feel small inside a vast environment."],
  ["wide-shot", "Wide Shot", "Shot Size", "Shows the full character from head to toe.", "Walking, dancing, action, physical comedy.", "Clear, readable, energetic.", "Use a wide shot so the full body action stays readable."],
  ["medium-shot", "Medium Shot", "Shot Size", "Shows the character from the waist up.", "Dialogue, gestures, character interaction.", "Natural, conversational.", "Use a medium shot for readable gestures and natural dialogue."],
  ["medium-close-up", "Medium Close-Up", "Shot Size", "Shows the character from chest to head.", "Emotional dialogue, reaction shots, quiet moments.", "Personal, expressive.", "Use a medium close-up at eye level with a slow push-in."],
  ["close-up", "Close-Up", "Shot Size", "Frames the face closely.", "Emotion, realization, dramatic response.", "Intimate, emotional.", "Use a close-up to hold attention on the character's emotional response."],
  ["extreme-close-up", "Extreme Close-Up", "Shot Size", "Focuses on a specific detail like eyes, hands, an object, or a magical shell.", "Reveals, clues, tension, wonder.", "Dramatic, focused.", "Use an extreme close-up to make one detail feel important."],
  ["eye-level-shot", "Eye-Level Shot", "Camera Angle", "Camera is at the character's normal eye height.", "Natural dialogue, grounded scenes.", "Honest, relatable.", "Use an eye-level angle to keep the scene grounded and direct."],
  ["low-angle-shot", "Low Angle Shot", "Camera Angle", "Camera looks upward at the subject.", "Hero moments, power, comedy exaggeration.", "Strong, iconic.", "Use a low angle shot to make the subject feel heroic or larger than life."],
  ["high-angle-shot", "High Angle Shot", "Camera Angle", "Camera looks downward at the subject.", "Vulnerability, smallness, discovery.", "Gentle, exposed.", "Use a high angle shot to make the subject feel small, gentle, or discovered."],
  ["overhead-shot", "Overhead Shot", "Camera Angle", "Camera looks straight down from above.", "Maps, movement patterns, tabletop scenes, crowd scenes.", "Organized, stylized.", "Use an overhead shot to clearly show patterns, placement, or choreography."],
  ["dutch-angle", "Dutch Angle", "Camera Angle", "Camera is tilted to create an off-balance frame.", "Chaos, confusion, comedy panic.", "Uneasy, funny, unstable.", "Use a Dutch angle to make the frame feel off-balance and chaotic."],
  ["over-the-shoulder", "Over-the-Shoulder", "Camera Position", "Camera looks past one character toward another.", "Conversations, reactions, emotional exchanges.", "Connected, conversational.", "Use an over-the-shoulder view to connect two characters in conversation."],
  ["pov-shot", "POV Shot", "Camera Position", "Camera shows what the character sees.", "Discovery, exploration, looking at objects.", "Immersive, personal.", "Use a POV shot so the viewer sees the discovery through the character's eyes."],
  ["rear-tracking-shot", "Rear Tracking Shot", "Camera Position", "Camera follows behind the character.", "Adventure, entering a new place, journey moments.", "Curious, forward-moving.", "Use a rear tracking shot to follow the character into a new space."],
  ["profile-shot", "Profile Shot", "Camera Position", "Camera views the character from the side.", "Walking, running, side-scrolling game-style scenes.", "Clean, graphic, readable.", "Use a profile shot for clean side-to-side movement."],
  ["three-quarter-view", "Three-Quarter View", "Camera Position", "Camera views the subject from a flattering 45-degree angle.", "Dialogue, character moments, visual polish.", "Cinematic, dimensional.", "Use a three-quarter view to give the subject dimensional shape."],
  ["static-shot", "Static Shot", "Camera Movement", "Camera stays locked in place.", "Simple dialogue, clean composition.", "Stable, calm.", "Use a static shot so the character action carries the moment."],
  ["slow-push-in", "Slow Push-In", "Camera Movement", "Camera slowly moves closer to the subject.", "Emotion, realization, wonder.", "Intimate, important.", "Use a slow push-in as the emotional importance rises."],
  ["dolly-out", "Dolly Out", "Camera Movement", "Camera moves backward to reveal more of the scene.", "Reveals, endings, scale.", "Expansive, cinematic.", "Use a dolly out to reveal more of the world around the subject."],
  ["tracking-shot", "Tracking Shot", "Camera Movement", "Camera follows a moving character.", "Walking, running, dancing, travel.", "Active, fluid.", "Use a tracking shot to follow the subject's motion smoothly."],
  ["pan", "Pan", "Camera Movement", "Camera rotates left or right.", "Revealing a location or following action.", "Observational, smooth.", "Use a pan to reveal the scene horizontally."],
  ["tilt", "Tilt", "Camera Movement", "Camera rotates up or down.", "Revealing height, scale, or an object.", "Revealing, cinematic.", "Use a tilt to reveal height, scale, or a hidden detail."],
  ["orbit-shot", "Orbit Shot", "Camera Movement", "Camera circles around the subject.", "Magical moments, transformations, heroic reveals.", "Dynamic, dramatic.", "Use an orbit shot to make the moment feel magical and dimensional."],
  ["crane-up", "Crane Up", "Camera Movement", "Camera rises upward.", "Endings, reveals, large environments.", "Grand, polished.", "Use a crane up to end with scale and polish."],
].map(([id, name, category, definition, bestFor, feeling, promptPhrase]) => ({
  id,
  name,
  category,
  definition,
  bestFor,
  feeling,
  promptPhrase,
  thumbnail: `./thumbnails/${id}.jpg`,
}));

const categories = ["Shot Size", "Camera Angle", "Camera Position", "Camera Movement"];
const defaults = {
  characterName: "Naomi",
  sceneDescription: "Naomi discovers a glowing friendship shell near a tide pool on a sunny beach.",
  duration: "15 seconds",
  aspectRatio: "16:9",
  visualStyle: "Bright animated cinematic",
  shotSize: "Medium Close-Up",
  cameraAngle: "Eye-Level Shot",
  cameraPosition: "POV Shot",
  cameraMovement: "Slow Push-In",
  mood: "Wonder",
  sceneType: "Discovery",
  audioStyle: "Natural ambience only",
};

const selectOptions = {
  duration: ["5 seconds", "10 seconds", "15 seconds", "30 seconds"],
  aspectRatio: ["16:9", "9:16", "1:1"],
  visualStyle: ["Bright animated cinematic", "Pixar-inspired CGI", "Stylized 3D animation", "Realistic cinematic", "Cozy children's storybook"],
  shotSize: namesFor("Shot Size"),
  cameraAngle: namesFor("Camera Angle"),
  cameraPosition: namesFor("Camera Position"),
  cameraMovement: namesFor("Camera Movement"),
  mood: ["Wonder", "Excitement", "Comedy", "Mystery", "Adventure", "Warm friendship", "Emotional discovery"],
  sceneType: ["Dialogue", "Discovery", "Action", "Reveal", "Character introduction", "Ending shot", "Comedy beat"],
  audioStyle: ["Natural ambience only", "Environmental Foley", "Dialogue plus ambience", "Music plus ambience", "Subject-driven sound effects"],
};

const recipes = [
  ["Emotional Discovery", "A personal reveal where the camera moves closer as the character understands what they have found.", { shotSize: "Medium Close-Up", cameraAngle: "Eye-Level Shot", cameraPosition: "POV Shot", cameraMovement: "Slow Push-In", mood: "Wonder", sceneType: "Discovery" }],
  ["Epic Establishing Moment", "A scale-building opener for a journey, new location, or first look at a world.", { shotSize: "Extreme Wide Shot", cameraAngle: "High Angle Shot", cameraPosition: "Rear Tracking Shot", cameraMovement: "Crane Up", mood: "Adventure", sceneType: "Character introduction" }],
  ["Funny Dialogue Beat", "A clean comedy setup where framing stays readable and the reaction does the work.", { shotSize: "Medium Shot", cameraAngle: "Eye-Level Shot", cameraPosition: "Over-the-Shoulder", cameraMovement: "Static Shot", mood: "Comedy", sceneType: "Dialogue" }],
  ["Magical Reveal", "A detail-first setup for glowing objects, clues, transformations, and surprise reveals.", { shotSize: "Extreme Close-Up", cameraAngle: "Low Angle Shot", cameraPosition: "POV Shot", cameraMovement: "Orbit Shot", mood: "Mystery", sceneType: "Reveal" }],
  ["Adventure Walk", "A forward-moving travel beat for characters entering a fresh space.", { shotSize: "Wide Shot", cameraAngle: "Eye-Level Shot", cameraPosition: "Rear Tracking Shot", cameraMovement: "Tracking Shot", mood: "Adventure", sceneType: "Action" }],
  ["Warm Friendship Moment", "A gentle two-character setup for connection, trust, and quiet dialogue.", { shotSize: "Medium Shot", cameraAngle: "Eye-Level Shot", cameraPosition: "Three-Quarter View", cameraMovement: "Slow Push-In", mood: "Warm friendship", sceneType: "Dialogue" }],
];

let state = { ...defaults };
let selectedShot = getShotByName(state.shotSize);

function namesFor(category) {
  return shots.filter((shot) => shot.category === category).map((shot) => shot.name);
}

function getShotByName(name) {
  return shots.find((shot) => shot.name === name) || shots[0];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  if (field) field.value = value;
}

function readFormState() {
  Object.keys(defaults).forEach((key) => {
    const field = document.getElementById(key);
    if (field) state[key] = field.value;
  });
}

function writeFormState() {
  Object.entries(state).forEach(([key, value]) => setFieldValue(key, value));
}

function syncSelectedShotFromState() {
  const possibleNames = [state.cameraMovement, state.cameraPosition, state.cameraAngle, state.shotSize];
  selectedShot = shots.find((shot) => possibleNames.includes(shot.name)) || selectedShot;
}

function renderSelects() {
  Object.entries(selectOptions).forEach(([id, options]) => {
    const select = document.getElementById(id);
    select.innerHTML = options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("");
  });
  writeFormState();
}

function renderPreview() {
  const preview = document.getElementById("shotPreview");
  preview.innerHTML = `
    <p class="section-kicker">Selected shot preview</p>
    <div class="thumbnail active"><img src="${selectedShot.thumbnail}" alt="${escapeHtml(selectedShot.name)} cinematic thumbnail" /></div>
    <div class="preview-meta">
      <p class="category-label">${escapeHtml(selectedShot.category)}</p>
      <h3>${escapeHtml(selectedShot.name)}</h3>
      <p>${escapeHtml(selectedShot.definition)}</p>
    </div>
    <div class="meaning-box">
      <strong>What this shot communicates</strong>
      <p>${escapeHtml(selectedShot.feeling)}</p>
    </div>
    <div class="prompt-phrase">
      <strong>Prompt phrase to use</strong>
      <p>${escapeHtml(selectedShot.promptPhrase)}</p>
    </div>
  `;
}

function buildPrompt() {
  const name = state.characterName.trim() || "the character";
  const dialogueTypes = new Set(["Dialogue", "Discovery", "Reveal", "Comedy beat", "Character introduction"]);
  const dialogue = dialogueTypes.has(state.sceneType)
    ? `\n\nDialogue:\nInclude one short sample line from ${name}, such as "I think this is meant for us."`
    : "";

  return `${state.duration} animated cinematic scene, ${state.aspectRatio}.

Visual style:
${state.visualStyle}.

Scene:
${state.sceneDescription}

Camera:
Use a ${state.shotSize}, ${state.cameraAngle}, ${state.cameraPosition}, with ${state.cameraMovement}.

Mood:
The scene should feel ${state.mood.toLowerCase()}.

Action:
${name} moves with simple, readable timing that matches a ${state.sceneType.toLowerCase()} scene. Keep the body language emotionally clear: one main action, a clean reaction, and a final held moment so the shot has time to breathe.${dialogue}

Audio:
Use ${state.audioStyle}. Include appropriate ambience, environmental Foley, and subject-driven sound.

Prompt guidance:
Keep character movement simple, readable, and emotionally expressive. Use natural timing. Avoid overloading the scene with too many actions.`;
}

function renderPrompt() {
  document.getElementById("promptOutput").textContent = buildPrompt();
}

function labelForKey(key) {
  return {
    shotSize: "Shot",
    cameraAngle: "Angle",
    cameraPosition: "Position",
    cameraMovement: "Move",
    mood: "Mood",
    sceneType: "Type",
  }[key] || key;
}

function renderRecipes() {
  document.getElementById("recipeGrid").innerHTML = recipes.map(([name, description, settings], index) => `
    <article class="recipe-card">
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(description)}</p>
      <dl class="settings-grid">
        ${Object.entries(settings).map(([key, value]) => `
          <div><dt>${escapeHtml(labelForKey(key))}</dt><dd>${escapeHtml(value)}</dd></div>
        `).join("")}
      </dl>
      <button class="button primary apply-recipe" data-index="${index}" type="button">Apply Recipe</button>
    </article>
  `).join("");
}

function renderLibrary() {
  document.getElementById("shotLibrary").innerHTML = categories.map((category) => `
    <section class="category-section">
      <h3>${escapeHtml(category)}</h3>
      <div class="shot-grid">
        ${shots.filter((shot) => shot.category === category).map((shot) => `
          <article class="shot-card ${selectedShot.id === shot.id ? "selected" : ""}" data-shot-id="${shot.id}">
            <div class="thumbnail ${selectedShot.id === shot.id ? "active" : ""}">
              <img src="${shot.thumbnail}" alt="${escapeHtml(shot.name)} cinematic thumbnail" loading="lazy" />
            </div>
            <div class="shot-card-head">
              <div>
                <p class="section-kicker">${escapeHtml(shot.category)}</p>
                <h3>${escapeHtml(shot.name)}</h3>
              </div>
              <button class="select-shot" data-shot-id="${shot.id}" type="button">Select</button>
            </div>
            <p class="shot-card-body">${escapeHtml(shot.definition)}</p>
            <div class="shot-facts">
              <p><strong>Best for:</strong> ${escapeHtml(shot.bestFor)}</p>
              <p><strong>Feeling:</strong> ${escapeHtml(shot.feeling)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function updateAll() {
  syncSelectedShotFromState();
  renderPreview();
  renderPrompt();
  renderLibrary();
}

function selectShot(shot) {
  selectedShot = shot;
  if (shot.category === "Shot Size") state.shotSize = shot.name;
  if (shot.category === "Camera Angle") state.cameraAngle = shot.name;
  if (shot.category === "Camera Position") state.cameraPosition = shot.name;
  if (shot.category === "Camera Movement") state.cameraMovement = shot.name;
  writeFormState();
  updateAll();
}

document.addEventListener("DOMContentLoaded", () => {
  renderSelects();
  renderRecipes();
  updateAll();

  document.getElementById("promptForm").addEventListener("input", () => {
    readFormState();
    updateAll();
  });

  document.getElementById("resetBuilder").addEventListener("click", () => {
    state = { ...defaults };
    selectedShot = getShotByName(defaults.shotSize);
    writeFormState();
    updateAll();
  });

  document.getElementById("copyPrompt").addEventListener("click", async () => {
    await navigator.clipboard.writeText(buildPrompt());
    const status = document.getElementById("copyStatus");
    status.textContent = "Copied to clipboard.";
    window.setTimeout(() => {
      status.textContent = "";
    }, 1800);
  });

  document.addEventListener("click", (event) => {
    const recipeButton = event.target.closest(".apply-recipe");
    if (recipeButton) {
      const [, , settings] = recipes[Number(recipeButton.dataset.index)];
      state = { ...state, ...settings };
      writeFormState();
      updateAll();
      document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
      return;
    }

    const shotButton = event.target.closest(".select-shot");
    if (shotButton) {
      const shot = shots.find((item) => item.id === shotButton.dataset.shotId);
      if (shot) selectShot(shot);
    }
  });
});
