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

const DIMENSIONS = ["事业", "财运", "情感", "健康", "学业", "出行"];
const VIBES = ["稳刚", "借势", "进取", "修整"];

const form = document.getElementById("profileForm");
const nameInput = document.getElementById("pName");
const yearInput = document.getElementById("pYear");
const monthInput = document.getElementById("pMonth");
const dayInput = document.getElementById("pDay");
const timeInput = document.getElementById("pTime");
const cityInput = document.getElementById("pCity");
const dateError = document.getElementById("dateError");

const helloText = document.getElementById("helloText");
const todayDot = document.getElementById("todayDot");
const vibeScore = document.getElementById("vibeScore");
const vibeTitle = document.getElementById("vibeTitle");
const vibeDesc = document.getElementById("vibeDesc");
const adviceBox = document.getElementById("adviceBox");
const metricList = document.getElementById("metricList");
const pillarRow = document.getElementById("pillarRow");
const progressText = document.getElementById("progressText");
const calMonthText = document.getElementById("calMonthText");
const calGrid = document.getElementById("calGrid");
const overviewStrip = document.getElementById("overviewStrip");
const activityFeed = document.getElementById("activityFeed");
const genReportBtn = document.getElementById("genReportBtn");
const toolChips = document.querySelectorAll(".tool-chip");
const deepButtons = document.querySelectorAll(".tool-btn");
const evidenceList = document.getElementById("evidenceList");
const reliabilityBadge = document.getElementById("reliabilityBadge");
const reliabilityMeter = document.getElementById("reliabilityMeter");

const activityLogs = [];

function hashText(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 131 + text.charCodeAt(i)) >>> 0;
  return h;
}

function digitsOnly(v) {
  return v.replace(/\D/g, "");
}

function clampNumber(v, min, max) {
  if (!v) return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  return String(Math.min(max, Math.max(min, n)));
}

function format2(v) {
  return v.padStart(2, "0");
}

function validateDateParts(y, m, d) {
  const yy = Number(y);
  const mm = Number(m);
  const dd = Number(d);
  if (!Number.isInteger(yy) || yy < 1900 || yy > 2100) return "年份需在 1900-2100";
  if (!Number.isInteger(mm) || mm < 1 || mm > 12) return "月份需在 1-12";
  if (!Number.isInteger(dd) || dd < 1 || dd > 31) return "日期需在 1-31";
  const date = new Date(`${yy}-${format2(String(mm))}-${format2(String(dd))}T00:00:00`);
  if (date.getFullYear() !== yy || date.getMonth() + 1 !== mm || date.getDate() !== dd) return "请输入有效日期";
  return "";
}

function wireInputLimits() {
  yearInput.addEventListener("input", () => {
    yearInput.value = digitsOnly(yearInput.value).slice(0, 4);
  });
  monthInput.addEventListener("input", () => {
    monthInput.value = digitsOnly(monthInput.value).slice(0, 2);
  });
  dayInput.addEventListener("input", () => {
    dayInput.value = digitsOnly(dayInput.value).slice(0, 2);
  });

  yearInput.addEventListener("blur", () => {
    yearInput.value = clampNumber(yearInput.value, 1900, 2100);
  });
  monthInput.addEventListener("blur", () => {
    monthInput.value = clampNumber(monthInput.value, 1, 12);
  });
  dayInput.addEventListener("blur", () => {
    dayInput.value = clampNumber(dayInput.value, 1, 31);
  });
}

function scoreSet(seed) {
  return DIMENSIONS.map((_, i) => 55 + ((seed >> (i * 3)) % 40));
}

function levelText(score) {
  if (score >= 80) return "主动推进";
  if (score >= 65) return "稳中求进";
  return "先防守后进攻";
}

function renderMetrics(scores) {
  metricList.innerHTML = scores
    .map((s, i) => `<div class="metric-row"><b>${DIMENSIONS[i]}</b><span>${s}</span><p>建议：${levelText(s)}</p></div>`)
    .join("");
}

function renderPillars(seed) {
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const p = Array.from({ length: 4 }, (_, i) => stems[(seed + i) % 10] + branches[(seed + i * 3) % 12]);
  pillarRow.innerHTML = p.map((x) => `<span class="pillar-pill">${x}</span>`).join("");
}

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  calMonthText.textContent = `${year}年 ${month + 1}月`;

  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  const cells = ["日", "一", "二", "三", "四", "五", "六"].map((w) => `<div class="wk">${w}</div>`);
  for (let i = 0; i < first; i += 1) cells.push('<div class="empty"></div>');
  for (let d = 1; d <= days; d += 1) {
    cells.push(`<div class="day ${d === today ? "today" : ""}">${d}</div>`);
  }
  calGrid.innerHTML = cells.join("");
}

function calcReliability(avg, city) {
  let score = 68;
  if (nameInput.value.trim().length >= 2) score += 4;
  if (yearInput.value && monthInput.value && dayInput.value) score += 8;
  if (timeInput.value) score += 6;
  if (CITY_LONGITUDE[city]) score += 6;
  if (avg >= 60 && avg <= 88) score += 4;
  return Math.max(62, Math.min(95, score));
}

function renderEvidence(seed, scores, avg, city) {
  if (!evidenceList || !reliabilityBadge || !reliabilityMeter) return;

  const strongest = DIMENSIONS[scores.indexOf(Math.max(...scores))];
  const weakest = DIMENSIONS[scores.indexOf(Math.min(...scores))];
  const offset = Math.round((CITY_LONGITUDE[city] - 120) * 4);
  const mode = avg >= 75 ? "积极推进" : avg >= 60 ? "稳健推进" : "保守收缩";
  const reliability = calcReliability(avg, city);

  const items = [
    { title: "输入完整度", text: `姓名 + 出生日期 + 时间 + 城市已纳入计算，可信度 ${reliability}%` },
    { title: "维度主导", text: `当前最强维度为 ${strongest}，最弱维度为 ${weakest}，建议主攻强项并规避短板。` },
    { title: "城市修正", text: `出生地 ${city} 对应真太阳时修正 ${offset >= 0 ? "+" : ""}${offset} 分钟。` },
    { title: "执行模式", text: `综合分 ${avg}，建议采用“${mode}”策略推进当天任务。` },
    { title: "规则版本", text: `演示规则引擎 v1.2（seed: ${String(seed).slice(-6)}），结果可复现。` }
  ];

  evidenceList.innerHTML = items
    .map((item) => `<li><b>${item.title}</b><span>${item.text}</span></li>`)
    .join("");

  reliabilityBadge.textContent = `可信度 ${reliability}%`;
  reliabilityMeter.style.width = `${reliability}%`;
}

function renderDashboard() {
  const y = yearInput.value || "1995";
  const m = monthInput.value || "08";
  const d = dayInput.value || "15";
  const seed = hashText(`${nameInput.value}|${y}-${m}-${d}|${timeInput.value}|${cityInput.value}`);

  const scores = scoreSet(seed);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const strongest = DIMENSIONS[scores.indexOf(Math.max(...scores))];

  vibeScore.textContent = String(avg);
  vibeTitle.textContent = VIBES[seed % VIBES.length];
  vibeDesc.textContent = `出生地 ${cityInput.value} 真太阳时修正约 ${Math.round((CITY_LONGITUDE[cityInput.value] - 120) * 4)} 分钟。`;
  adviceBox.textContent = `今日建议：优先处理 ${strongest}，暂缓高风险决策。`;
  helloText.textContent = `${nameInput.value || "你"}，今日如何？`;

  const now = new Date();
  todayDot.textContent = `${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  progressText.textContent = `${seed % 12}/12`;
  overviewStrip.innerHTML = `
    <div class="ov-item"><span>综合分</span><b>${avg}</b></div>
    <div class="ov-item"><span>最强维度</span><b>${strongest}</b></div>
    <div class="ov-item"><span>行动模式</span><b>${avg >= 75 ? "积极推进" : avg >= 60 ? "稳健推进" : "保守收缩"}</b></div>
    <div class="ov-item"><span>真太阳时</span><b>${Math.round((CITY_LONGITUDE[cityInput.value] - 120) * 4)} 分钟</b></div>
  `;

  renderPillars(seed);
  renderMetrics(scores);
  renderEvidence(seed, scores, avg, cityInput.value);
  logActivity(`已更新分析结果（${nameInput.value || "用户"}，${cityInput.value}）`);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const err = validateDateParts(yearInput.value, monthInput.value, dayInput.value);
  if (err) {
    dateError.textContent = err;
    return;
  }
  dateError.textContent = "";
  yearInput.value = clampNumber(yearInput.value, 1900, 2100);
  monthInput.value = format2(clampNumber(monthInput.value, 1, 12));
  dayInput.value = format2(clampNumber(dayInput.value, 1, 31));
  renderDashboard();
});

function initDefaults() {
  yearInput.value = "1995";
  monthInput.value = "08";
  dayInput.value = "15";
  wireInputLimits();
  renderCalendar();
  renderDashboard();
  bindTools();
  bindDeepActions();
  bindReportExport();
  logActivity("系统已就绪，等待你的操作");
}

initDefaults();

function logActivity(text) {
  activityLogs.unshift({ text, time: new Date() });
  if (activityLogs.length > 8) activityLogs.pop();
  activityFeed.innerHTML = activityLogs
    .map((item) => `<li><span>${item.time.toLocaleTimeString("zh-CN", { hour12: false })}</span><p>${item.text}</p></li>`)
    .join("");
}

function bindTools() {
  toolChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const type = chip.dataset.tool;
      if (type === "checkin") {
        const [done, total] = progressText.textContent.split("/").map((v) => Number(v));
        const next = Math.min(total || 12, (done || 0) + 1);
        progressText.textContent = `${next}/${total || 12}`;
        logActivity("已完成一次每日签到");
      }
      if (type === "trend") {
        metricList.scrollIntoView({ behavior: "smooth", block: "center" });
        logActivity("已定位到趋势评分模块");
      }
      if (type === "history") {
        logActivity("近 7 天记录：波动区间 61-79，整体稳中有升");
      }
      if (type === "classroom") {
        logActivity("八字学堂提示：先看强弱，再看十神，最后看用神落地");
      }
    });
  });
}

function bindDeepActions() {
  const mapping = {
    ai: "AI 建议：今天适合做结构化拆解与阶段汇报。",
    life: "人生主题：减少比较，优先建设自己的节奏系统。",
    date: "择日建议：明后两天更适合签约与沟通。",
    tarot: "塔罗提示：抽到“节制”，核心是平衡投入与恢复。"
  };
  deepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.deep;
      adviceBox.textContent = mapping[key] || adviceBox.textContent;
      logActivity(`已执行深度分析：${btn.textContent}`);
    });
  });
}

function bindReportExport() {
  genReportBtn.addEventListener("click", () => {
    const report = [
      `姓名：${nameInput.value || "未填写"}`,
      `出生：${yearInput.value}-${monthInput.value}-${dayInput.value} ${timeInput.value}`,
      `城市：${cityInput.value}`,
      `今日结论：${adviceBox.textContent}`,
      `进度：${progressText.textContent}`
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `命运日报-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    logActivity("已生成并下载日报");
  });
}
