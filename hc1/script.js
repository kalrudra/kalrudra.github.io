/* ---------------  Hanuman Chalisa Karaoke Sync  ----------------
   Works at 0.5×‑3× speeds, auto‑scales JSON timing to track length
-----------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", async () => {
  const audio      = document.getElementById("audio");
  const container  = document.getElementById("chalisa-container");
  const toggleBtn  = document.getElementById("toggle-transliteration");

  /* 1️⃣  Transliteration toggle */
  toggleBtn.addEventListener("click", () => {
    const hidden = document.body.classList.toggle("hide-transliteration");
    toggleBtn.textContent = hidden ? "🔁 Show Transliteration"
                                   : "🔁 Hide Transliteration";
  });

  /* 2️⃣  Load Chalisa lines */
  let lines;
  try {
    const resp = await fetch("chalisa.json");
    if (!resp.ok) throw new Error(resp.status);
    lines = await resp.json();
  } catch (err) {
    container.innerHTML = "<p>⚠️ chalisa.json लोड नहीं हो पाया।</p>";
    console.error(err);
    return;
  }

  /* 3️⃣  Render DOM blocks */
  lines.forEach(l => {
    const div = document.createElement("div");
    div.className     = "line-block";
    div.dataset.start = l.start;           // original JSON seconds
    div.innerHTML = `
      <div class="devanagari">${l.devanagari}</div>
      <div class="transliteration">${l.transliteration}</div>`;
    container.appendChild(div);
  });
  const blocks = [...container.querySelectorAll(".line-block")];

  /* 4️⃣  Wait for audio metadata to compute scale */
  audio.addEventListener("loadedmetadata", () => {
    const jsonEnd   = +blocks.at(-1).dataset.start; // 316 s
    const audioEnd  = audio.duration;               // 649 s for your file
    const scale     = audioEnd / jsonEnd;           // ≈ 2.055
    const introSkip = 0;                            // tweak if chant starts late

    console.log(`🪄 Sync ready  scale=${scale.toFixed(3)}  introSkip=${introSkip}`);

    /* 5️⃣  Smooth sync loop (handles any playbackRate) */
    let lastIdx = -1;
    const run = () => {
      const vt = (audio.currentTime - introSkip) / scale; // virtual time
      if (vt >= 0) {
        const idx = blocks.findIndex((b, i) =>
          vt >= +b.dataset.start &&
          vt < (+blocks[i + 1]?.dataset.start ?? Infinity)
        );
        if (idx !== lastIdx && idx !== -1) {
          if (lastIdx !== -1) blocks[lastIdx].classList.remove("active");
          blocks[idx].classList.add("active");
          blocks[idx].scrollIntoView({ behavior: "smooth", block: "center" });
          lastIdx = idx;
        }
      }
      requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  });
});
