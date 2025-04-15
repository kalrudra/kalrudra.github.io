// script.js  – drop‑in replacement
document.addEventListener("DOMContentLoaded", async () => {
  const audio     = document.getElementById("audio");
  const container = document.getElementById("chalisa-container");
  const toggleBtn = document.getElementById("toggle-transliteration");

  /* ----------  A. Transliteration toggle (always wired‑up) ---------- */
  toggleBtn.addEventListener("click", () => {
    const hidden = document.body.classList.toggle("hide-transliteration");
    toggleBtn.textContent = hidden ? "🔁 Show Transliteration" : "🔁 Hide Transliteration";
  });

  /* ----------  B. Load couplet timing table ---------- */
  let lines = [];
  try {
    const resp = await fetch("chalisa.json");
    if (!resp.ok) throw new Error(resp.status);
    lines = await resp.json();
  } catch (err) {
    container.innerHTML = "<p>⚠️ chalisa.json लोड नहीं हो पाया।</p>";
    console.error(err);
  }

  /* ----------  C. Render couplets ---------- */
  lines.forEach(l => {
    const div = document.createElement("div");
    div.className     = "line-block";
    div.dataset.start = l.start;                     // seconds
    div.innerHTML = `
      <div class="devanagari">${l.devanagari}</div>
      <div class="transliteration">${l.transliteration}</div>`;
    container.appendChild(div);
  });
  const blocks = [...container.querySelectorAll(".line-block")];

  /* ----------  D. Karaoke‑style highlight + auto‑scroll ---------- */
  audio.addEventListener("timeupdate", () => {
    const t = audio.currentTime;
    // locate the current couplet (start ≤ t < nextStart)
    const idx = blocks.findIndex((b, i) =>
      t >= +b.dataset.start &&
      t < (+blocks[i + 1]?.dataset.start ?? Infinity)
    );
    if (idx === -1) return;

    document.querySelectorAll(".active").forEach(el => el.classList.remove("active"));
    blocks[idx].classList.add("active");
    blocks[idx].scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
