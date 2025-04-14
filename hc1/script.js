document.addEventListener("DOMContentLoaded", async () => {
  const audio = document.getElementById("audio");
  const container = document.getElementById("chalisa-container");
  const toggle = document.getElementById("toggle-transliteration");
  let lines = [];

  try {
    const response = await fetch("chalisa.json");
    lines = await response.json();
  } catch (e) {
    container.innerHTML = "<p>⚠️ chalisa.json लोड नहीं हो पाया।</p>";
    return;
  }

  // Render all lines
  for (const line of lines) {
    const div = document.createElement("div");
    div.className = "line-block";
    div.dataset.start = line.start;
    div.innerHTML = `
      <div class="devnagari">${line.hi}</div>
      <div class="transliteration">${line.trans}</div>
    `;
    container.appendChild(div);
  }

  // Toggle transliteration
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("hide-transliteration");
  });

  // Sync highlighting
  audio.addEventListener("timeupdate", () => {
    const currentTime = audio.currentTime;
    for (const el of document.querySelectorAll(".line-block")) {
      const start = parseFloat(el.dataset.start);
      if (currentTime >= start) {
        document.querySelectorAll(".highlight").forEach(e => e.classList.remove("highlight"));
        el.classList.add("highlight");
      }
    }
  });
});
