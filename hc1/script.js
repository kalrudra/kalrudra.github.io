document.addEventListener("DOMContentLoaded", async () => {
  const audio = document.getElementById("audio");
  const container = document.getElementById("chalisa-container");
  const toggle = document.getElementById("toggle-transliteration");
  let lines = [];

  // Load the chalisa JSON file
  try {
    const response = await fetch("chalisa.json");
    lines = await response.json();
  } catch (e) {
    container.innerHTML = "<p>⚠️ chalisa.json लोड नहीं हो पाया।</p>";
    return;
  }

  // Render all lines using the keys "devanagari" and "transliteration"
  for (const line of lines) {
    const div = document.createElement("div");
    div.className = "line-block";
    div.dataset.start = line.start;
    div.innerHTML = `
      <div class="devnagari">${line.devanagari}</div>
      <div class="transliteration">${line.transliteration}</div>
    `;
    container.appendChild(div);
  }

  // Toggle transliteration visibility
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("hide-transliteration");
  });

  // Sync highlighting: find the last line whose start time is <= current audio time
  audio.addEventListener("timeupdate", () => {
    const currentTime = audio.currentTime;
    const blocks = document.querySelectorAll(".line-block");
    let activeBlock = null;
    blocks.forEach(el => {
      const start = parseFloat(el.dataset.start);
      if (start <= currentTime) {
        activeBlock = el;
      }
    });
    // Remove previous highlight
    document.querySelectorAll(".highlight").forEach(e => e.classList.remove("highlight"));
    if (activeBlock) {
      activeBlock.classList.add("highlight");
    }
  });
});
