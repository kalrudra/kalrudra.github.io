<script>
document.addEventListener("DOMContentLoaded", async () => {
  const audio     = document.getElementById("audio");
  const container = document.getElementById("chalisa-container");
  const toggleBtn = document.getElementById("toggle-transliteration");

  /* ---------- 1. Transliteration toggle ---------- */
  toggleBtn.addEventListener("click", () => {
    const hidden = document.body.classList.toggle("hide-transliteration");
    toggleBtn.textContent = hidden ? "🔁 Show Transliteration" : "🔁 Hide Transliteration";
  });

  /* ---------- 2. Load JSON ---------- */
  let lines = [];
  try {
    const resp = await fetch("chalisa.json");
    if (!resp.ok) throw new Error(resp.status);
    lines = await resp.json();
  } catch (err) {
    container.innerHTML = "<p>⚠️ chalisa.json लोड नहीं हो पाया।</p>";
    console.error(err);
    return;
  }

  /* ---------- 3. Render lines ---------- */
  lines.forEach(l => {
    const div = document.createElement("div");
    div.className     = "line-block";
    div.dataset.start = l.start;
    div.innerHTML = `
      <div class="devanagari">${l.devanagari}</div>
      <div class="transliteration">${l.transliteration}</div>`;
    container.appendChild(div);
  });
  const blocks = [...document.querySelectorAll(".line-block")];

  /* ---------- 4. When audio metadata ready, compute scale ---------- */
  audio.addEventListener("loadedmetadata", () => {
    const jsonEnd   = +blocks[blocks.length - 1].dataset.start; // last timestamp in JSON
    const audioDur  = audio.duration;                           // real track length
    const scale     = audioDur / jsonEnd;                       // stretch factor
    const introSkip = 0;                                        // seconds to ignore at start

    console.log(`⏱️  Auto‑sync ready  scale=${scale.toFixed(3)}`);

    /* ---------- 5. Super‑smooth sync loop ---------- */
    let lastIdx = -1;

    function syncLoop () {
      const virtualTime = (audio.currentTime - introSkip) / scale;
      if (virtualTime >= 0) {
        const idx = blocks.findIndex((b, i) =>
          virtualTime >= +b.dataset.start &&
          virtualTime <  (+blocks[i + 1]?.dataset.start ?? Infinity)
        );
        if (idx !== lastIdx && idx !== -1) {
          if (lastIdx !== -1) blocks[lastIdx].classList.remove("active");
          blocks[idx].classList.add("active");
          blocks[idx].scrollIntoView({ behavior: "smooth", block: "center" });
          lastIdx = idx;
        }
      }
      requestAnimationFrame(syncLoop);      // keep running even at 0.5×–3×
    }
    requestAnimationFrame(syncLoop);
  });
});
</script>
