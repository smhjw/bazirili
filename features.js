const DIMENSIONS = ["事业", "财运", "桃花", "健康", "学业", "出行"];

function hashText(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 131 + text.charCodeAt(i)) >>> 0;
  return h;
}

function renderDimensions() {
  const seed = hashText(new Date().toISOString().slice(0, 10));
  const box = document.getElementById("dimensionGrid");
  if (!box) return;

  const scores = DIMENSIONS.map((_, i) => 60 + ((seed >> (i * 3)) % 36));
  box.innerHTML = DIMENSIONS.map((n, i) => {
    const level = scores[i] >= 80 ? "高势" : scores[i] >= 68 ? "平稳" : "谨慎";
    return `<div class="metric"><b>${scores[i]}</b><span>${n} · ${level}</span></div>`;
  }).join("");
}

function renderTrend() {
  const box = document.getElementById("trendBars");
  if (!box) return;

  const year = new Date().getFullYear();
  const seed = hashText(String(year));
  const values = Array.from({ length: 10 }, (_, i) => 36 + ((seed >> (i % 8)) % 62));
  box.innerHTML = values
    .map((v, i) => `<div class="trend-bar" style="height:${v}%"><small>${year + i}</small></div>`)
    .join("");
}

renderDimensions();
renderTrend();
