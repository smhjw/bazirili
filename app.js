const CITY_LONGITUDE = {
  北京: 116.4,
  上海: 121.47,
  广州: 113.26,
  深圳: 114.06,
  杭州: 120.15,
  成都: 104.06,
  武汉: 114.31,
  西安: 108.95
};

const DIMENSIONS = ["事业", "财运", "桃花", "健康", "学业", "出行"];
const TOPICS = [
  { title: "稳扎稳打", tip: "利于规划，避免冲动决策" },
  { title: "主动争取", tip: "适合推进关键沟通" },
  { title: "修复节奏", tip: "先处理积压事项再扩张" },
  { title: "借势而为", tip: "关注协同与资源整合" }
];

const todayDate = document.getElementById("todayDate");
const totalScoreEl = document.getElementById("totalScore");
const metricsEl = document.getElementById("metrics");
const topicTextEl = document.getElementById("topicText");
const radarSvg = document.getElementById("radarSvg");
const analysisForm = document.getElementById("analysisForm");
const analysisResult = document.getElementById("analysisResult");

function hashText(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 131 + text.charCodeAt(i)) >>> 0;
  return h;
}

function dateLabel() {
  const now = new Date();
  return `${now.getMonth() + 1}月${now.getDate()}日`;
}

function scoreSet(seed) {
  return DIMENSIONS.map((_, i) => 60 + ((seed >> (i * 3)) % 36));
}

function renderMetrics(target, scores) {
  target.innerHTML = DIMENSIONS.map((name, i) => {
    const tone = scores[i] >= 80 ? "高势" : scores[i] >= 68 ? "平稳" : "谨慎";
    return `<div class="metric"><b>${scores[i]}</b><span>${name} · ${tone}</span></div>`;
  }).join("");
}

function radarPoints(values) {
  const cx = 120;
  const cy = 110;
  const maxR = 72;
  return values.map((v, i) => {
    const a = (-90 + i * 60) * Math.PI / 180;
    const r = (v / 100) * maxR;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
}

function drawRadar(values) {
  const rings = [28, 44, 58, 72].map((r) => {
    const pts = DIMENSIONS.map((_, i) => {
      const a = (-90 + i * 60) * Math.PI / 180;
      return `${(120 + Math.cos(a) * r).toFixed(1)},${(110 + Math.sin(a) * r).toFixed(1)}`;
    }).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="rgba(176, 197, 235, 0.22)" />`;
  }).join("");

  const rays = DIMENSIONS.map((_, i) => {
    const a = (-90 + i * 60) * Math.PI / 180;
    return `<line x1="120" y1="110" x2="${(120 + Math.cos(a) * 72).toFixed(1)}" y2="${(110 + Math.sin(a) * 72).toFixed(1)}" stroke="rgba(176, 197, 235, 0.2)"/>`;
  }).join("");

  const data = `<polygon points="${radarPoints(values)}" fill="rgba(241, 180, 87, 0.24)" stroke="#f1b457" stroke-width="2"/>`;
  radarSvg.innerHTML = `${rings}${rays}${data}`;
}

function solarOffset(city) {
  const lng = CITY_LONGITUDE[city] ?? 120;
  const offset = Math.round((lng - 120) * 4);
  return offset >= 0 ? `+${offset}` : `${offset}`;
}

function mockTrend(seed) {
  return Array.from({ length: 10 }, (_, i) => 48 + ((seed >> (i % 8)) % 48));
}

function aiSummary(name, scores, city) {
  const total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const strongest = DIMENSIONS[scores.indexOf(Math.max(...scores))];
  const weakest = DIMENSIONS[scores.indexOf(Math.min(...scores))];
  return `AI 解读：${name || "你"}今日整体偏${total >= 75 ? "强" : "稳"}。${strongest}维度表现更好，适合主动推进；${weakest}维度偏弱，建议保守处理。城市 ${city} 的真太阳时修正约 ${solarOffset(city)} 分钟。`;
}

function renderDaily() {
  if (!todayDate || !totalScoreEl || !metricsEl || !topicTextEl || !radarSvg) return;
  const seed = hashText(new Date().toISOString().slice(0, 10));
  const scores = scoreSet(seed);
  const total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  todayDate.textContent = dateLabel();
  totalScoreEl.textContent = String(total);
  renderMetrics(metricsEl, scores);
  drawRadar(scores);
  const topic = TOPICS[seed % TOPICS.length];
  topicTextEl.innerHTML = `<p>今日主题</p><h3>${topic.title}</h3><span>${topic.tip}</span>`;
}

if (analysisForm && analysisResult) {
  analysisForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("nameInput").value.trim();
    const birthDate = document.getElementById("birthDateInput").value;
    const birthTime = document.getElementById("birthTimeInput").value;
    const city = document.getElementById("cityInput").value;
    if (!birthDate || !birthTime) return;

    const seed = hashText(`${name}|${birthDate}|${birthTime}|${city}`);
    const scores = scoreSet(seed);
    const total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const trend = mockTrend(seed);

    const metrics = DIMENSIONS.map((n, i) => `<div class="metric"><b>${scores[i]}</b><span>${n}</span></div>`).join("");
    const bars = trend.map((v, i) => `<span class="inline-bar" style="height:${v}px" title="第${i + 1}年"></span>`).join("");

    analysisResult.innerHTML = `
      <h3>分析结果</h3>
      <p>综合评分：<strong>${total}</strong></p>
      <div class="metrics">${metrics}</div>
      <p class="sub">真太阳时修正：${solarOffset(city)} 分钟（城市：${city}）</p>
      <p style="line-height:1.8;color:#c9d9f4">${aiSummary(name, scores, city)}</p>
      <p class="sub">依据链路：输入参数 → 六维映射 → 建议生成（演示规则引擎）</p>
      <h4>10 年流年趋势</h4>
      <div class="inline-trend">${bars}</div>
    `;
  });
}

renderDaily();
