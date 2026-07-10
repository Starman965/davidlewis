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
const learningPath = [
  ["Shot Size", "Controls emotional distance. Are we watching the whole adventure, a body in action, or one tiny feeling on a face?", "Director note: go wide for the world, go close for the heart."],
  ["Camera Angle", "Changes the audience's relationship to the subject. A small tilt in viewpoint can make someone feel brave, vulnerable, strange, or funny.", "Director note: low can empower, high can soften, Dutch can unsettle."],
  ["Camera Position", "Decides whose side the audience is on. We can stand across from someone, behind them, beside them, or inside their point of view.", "Director note: position is empathy."],
  ["Camera Movement", "Gives the shot a pulse. Movement should reveal, follow, intensify, or let the audience lean into a moment.", "Director note: if the emotion is still, the camera can be still too."],
];

const recipes = [
  ["The Little Discovery", "A character notices something small that suddenly feels important.", ["Medium Close-Up", "Eye-Level Shot", "POV Shot", "Slow Push-In"], "The camera leans in with the character. The audience feels the discovery instead of just seeing it."],
  ["The Big World Reveal", "The story opens up and we understand the size of the place or adventure.", ["Extreme Wide Shot", "High Angle Shot", "Rear Tracking Shot", "Crane Up"], "Distance, height, and rising motion tell the audience: this world is bigger than the character."],
  ["The Joke Lands Here", "A simple comedy beat where timing and reaction matter more than camera flash.", ["Medium Shot", "Eye-Level Shot", "Over-the-Shoulder", "Static Shot"], "The frame stays readable so the performance can do the funny work."],
  ["The Magic Object", "A detail, clue, or glowing object becomes the center of attention.", ["Extreme Close-Up", "Low Angle Shot", "POV Shot", "Orbit Shot"], "The camera treats the object like a character. Detail plus motion makes it feel alive."],
  ["The Brave Step Forward", "A character moves into a new space, choice, or adventure.", ["Wide Shot", "Eye-Level Shot", "Rear Tracking Shot", "Tracking Shot"], "We follow from behind so the audience joins the journey instead of watching from far away."],
  ["The Quiet Connection", "Two characters share trust, friendship, or a soft emotional beat.", ["Medium Shot", "Eye-Level Shot", "Three-Quarter View", "Slow Push-In"], "Gentle framing and a slow move keep attention on faces, body language, and connection."],
];

let selectedShot = getShotByName("Medium Close-Up");

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

function renderLearningPath() {
  document.getElementById("pathGrid").innerHTML = learningPath.map(([title, description, example], index) => `
    <article class="path-card" data-step="${index + 1}">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      <p class="path-example">${escapeHtml(example)}</p>
    </article>
  `).join("");
}

function renderRecipes() {
  document.getElementById("recipeGrid").innerHTML = recipes.map(([name, description, shotNames, lesson], index) => `
    <article class="recipe-card">
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(description)}</p>
      <div class="lesson-tags">
        ${shotNames.map((shotName) => `<span>${escapeHtml(shotName)}</span>`).join("")}
      </div>
      <div class="meaning-box">
        <strong>What to notice</strong>
        <p>${escapeHtml(lesson)}</p>
      </div>
      <button class="button primary study-recipe" data-index="${index}" type="button">Watch the Camera Choice</button>
    </article>
  `).join("");
}

function openRecipeModal(index) {
  const [name, description, shotNames, lesson] = recipes[index];
  const modal = document.getElementById("recipeModal");
  const modalContent = document.getElementById("modalContent");
  const firstShot = getShotByName(shotNames[0]);

  selectedShot = firstShot;
  updateAll();

  modalContent.innerHTML = `
    <div class="modal-lesson">
      <p class="section-kicker">Story recipe</p>
      <h2 id="modalTitle">${escapeHtml(name)}</h2>
      <p>${escapeHtml(description)}</p>
      <div class="modal-shot-grid">
        ${shotNames.map((shotName) => {
          const shot = getShotByName(shotName);
          return `
            <article class="modal-shot-card">
              <div class="thumbnail">
                <img src="${shot.thumbnail}" alt="${escapeHtml(shot.name)} cinematic thumbnail" loading="lazy" />
              </div>
              <span>${escapeHtml(shot.category)}</span>
              <h3>${escapeHtml(shot.name)}</h3>
              <p>${escapeHtml(shot.definition)}</p>
            </article>
          `;
        }).join("")}
      </div>
      <div class="modal-director-note">
        <strong>What changes in the scene</strong>
        <p>${escapeHtml(lesson)}</p>
      </div>
    </div>
  `;

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close").focus();
}

function closeRecipeModal() {
  const modal = document.getElementById("recipeModal");
  modal.hidden = true;
  document.body.style.overflow = "";
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
              <button class="select-shot" data-shot-id="${shot.id}" type="button">Learn</button>
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
  renderLibrary();
}

function selectShot(shot) {
  selectedShot = shot;
  updateAll();
}

document.addEventListener("DOMContentLoaded", () => {
  renderLearningPath();
  renderRecipes();
  updateAll();

  document.addEventListener("click", (event) => {
    const recipeButton = event.target.closest(".study-recipe");
    if (recipeButton) {
      openRecipeModal(Number(recipeButton.dataset.index));
      return;
    }

    if (event.target.closest("[data-close-modal]")) {
      closeRecipeModal();
      return;
    }

    const shotButton = event.target.closest(".select-shot");
    if (shotButton) {
      const shot = shots.find((item) => item.id === shotButton.dataset.shotId);
      if (shot) selectShot(shot);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.getElementById("recipeModal").hidden) {
      closeRecipeModal();
    }
  });
});
