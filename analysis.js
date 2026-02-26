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
const deepModal = document.getElementById("deepModal");
const deepModalClose = document.getElementById("deepModalClose");
const deepModalKicker = document.getElementById("deepModalKicker");
const deepModalTitle = document.getElementById("deepModalTitle");
const deepModalContent = document.getElementById("deepModalContent");

const activityLogs = [];
let deepModalBound = false;
let deepModalLastFocus = null;

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

function getProfileSeed() {
  const y = yearInput.value || "1995";
  const m = monthInput.value || "08";
  const d = dayInput.value || "15";
  return hashText(`${nameInput.value}|${y}-${m}-${d}|${timeInput.value}|${cityInput.value}`);
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

function setupDeepModalEvents() {
  if (deepModalBound || !deepModal) return;
  deepModalBound = true;

  deepModalClose?.addEventListener("click", closeDeepModal);
  deepModal.querySelectorAll("[data-deep-close]").forEach((el) => {
    el.addEventListener("click", closeDeepModal);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && deepModal.classList.contains("open")) closeDeepModal();
  });
}

function openDeepModal(kicker, title) {
  if (!deepModal || !deepModalContent || !deepModalKicker || !deepModalTitle) return;
  deepModalLastFocus = document.activeElement;
  deepModalKicker.textContent = kicker;
  deepModalTitle.textContent = title;
  deepModalContent.innerHTML = "";
  deepModal.classList.add("open");
  deepModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeDeepModal() {
  if (!deepModal) return;
  deepModal.classList.remove("open");
  deepModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (deepModalLastFocus && typeof deepModalLastFocus.focus === "function") {
    deepModalLastFocus.focus();
  }
}

function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

function renderDateAnalyzer(container) {
  const tomorrow = addDays(new Date(), 1);
  container.innerHTML = `
    <p class="sub">选择事项类型与起始日期，系统会生成未来 7 天可执行窗口，并给出最佳行动日。</p>
    <div class="deep-feature-form">
      <label>事项类型
        <select class="deep-input" id="dateGoalInput">
          <option value="签约合作">签约合作</option>
          <option value="面试沟通">面试沟通</option>
          <option value="关系推进">关系推进</option>
          <option value="出行安排">出行安排</option>
          <option value="发布上线">发布上线</option>
        </select>
      </label>
      <label>起始日期
        <input class="deep-input" id="dateStartInput" type="date" value="${toDateInputValue(tomorrow)}" />
      </label>
      <div class="deep-actions">
        <button type="button" class="deep-btn primary" id="dateGenerateBtn">生成 7 日窗口</button>
        <button type="button" class="deep-btn" id="dateApplyBtn" disabled>应用最佳建议</button>
      </div>
    </div>
    <div id="dateBestBox" class="date-best">尚未生成择日结果。</div>
    <ul id="dateList" class="date-list"></ul>
  `;

  const goalInput = container.querySelector("#dateGoalInput");
  const startInput = container.querySelector("#dateStartInput");
  const generateBtn = container.querySelector("#dateGenerateBtn");
  const applyBtn = container.querySelector("#dateApplyBtn");
  const bestBox = container.querySelector("#dateBestBox");
  const dateList = container.querySelector("#dateList");

  const goalTips = {
    签约合作: "优先上午 09:00-11:00，先确认边界再落条款。",
    面试沟通: "先讲结果再讲过程，末尾补充可落地计划。",
    关系推进: "以轻量沟通为主，避免一次性抛出全部诉求。",
    出行安排: "预留 20% 缓冲时间，减少跨城临时变更。",
    发布上线: "先小范围灰度，再逐步放量观察反馈。"
  };
  const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  let bestItem = null;

  function generate() {
    const goal = goalInput.value;
    const startDate = new Date(`${startInput.value}T00:00:00`);
    if (Number.isNaN(startDate.getTime())) {
      bestBox.textContent = "请选择有效起始日期。";
      return;
    }

    const baseSeed = getProfileSeed() ^ hashText(goal);
    const goalBias = { 签约合作: 8, 面试沟通: 6, 关系推进: 5, 出行安排: 4, 发布上线: 7 };
    const rows = [];

    for (let i = 0; i < 7; i += 1) {
      const date = addDays(startDate, i);
      const key = `${baseSeed}|${goal}|${toDateInputValue(date)}`;
      let score = 56 + (hashText(key) % 36) + (goalBias[goal] || 0);
      if (date.getDay() === 2 || date.getDay() === 4) score += 3;
      if (date.getDay() === 0) score -= 4;
      score = Math.max(52, Math.min(96, score));

      rows.push({
        date,
        score,
        iso: toDateInputValue(date),
        label: `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${weekday[date.getDay()]}`,
        tag: score >= 82 ? "强推" : score >= 70 ? "可行" : "观望"
      });
    }

    bestItem = [...rows].sort((a, b) => b.score - a.score)[0];
    bestBox.innerHTML = `<b>最佳窗口：${bestItem.label}（${bestItem.score} 分）</b><div class="sub">${goalTips[goal]}</div>`;
    dateList.innerHTML = rows
      .map(
        (row) => `
          <li>
            <div class="date-meta">
              <b>${row.label}</b>
              <span>${goal} · 建议：${row.tag}</span>
            </div>
            <span class="date-score">${row.score}</span>
          </li>
        `
      )
      .join("");
    applyBtn.disabled = false;
    logActivity(`已生成择日窗口：${goal}`);
  }

  generateBtn.addEventListener("click", generate);
  applyBtn.addEventListener("click", () => {
    if (!bestItem) return;
    adviceBox.textContent = `择日建议：${bestItem.label}（${bestItem.score} 分）优先推进关键事项。`;
    logActivity(`已应用择日建议：${bestItem.label}`);
    closeDeepModal();
  });

  generate();
}

function renderTarotAnalyzer(container) {
  const deck = [
    {
      name: "节制",
      keywords: "平衡 / 协调 / 节奏",
      upright: "先统一节奏，再提高输出，今天最怕“用力过猛”。",
      reversed: "别同时开太多战线，先收口两个核心任务。"
    },
    {
      name: "战车",
      keywords: "推进 / 控制 / 执行",
      upright: "你适合主导推进，但要把决策理由写清楚再执行。",
      reversed: "情绪会拖慢效率，先稳定情绪再开关键会。"
    },
    {
      name: "星星",
      keywords: "希望 / 复原 / 远景",
      upright: "适合重启被搁置的计划，小步重启比一次到位更稳。",
      reversed: "避免理想化，先做最小可行版本验证方向。"
    },
    {
      name: "女祭司",
      keywords: "直觉 / 信息 / 观察",
      upright: "先听后说，你会在细节里拿到关键线索。",
      reversed: "信息还不完整，别急着承诺，先补证据。"
    },
    {
      name: "太阳",
      keywords: "显化 / 清晰 / 成果",
      upright: "适合公开表达与展示成果，今天利正面沟通。",
      reversed: "别过度乐观，关键节点需要二次确认。"
    },
    {
      name: "力量",
      keywords: "韧性 / 稳定 / 驯化",
      upright: "用稳定节奏赢，不靠爆发。先做最难的一步。",
      reversed: "阻力来自内耗，先停掉一个低收益任务。"
    }
  ];
  const topicLabels = {
    career: "事业决策",
    relation: "关系沟通",
    wealth: "财务规划",
    growth: "自我成长"
  };

  container.innerHTML = `
    <p class="sub">选择你当前最关注的议题，抽一张牌。系统将根据牌面给出可执行建议。</p>
    <div class="tarot-layout">
      <label>提问场景
        <select class="deep-input" id="tarotTopicInput">
          <option value="career">事业决策</option>
          <option value="relation">关系沟通</option>
          <option value="wealth">财务规划</option>
          <option value="growth">自我成长</option>
        </select>
      </label>
      <div class="deep-actions">
        <button type="button" class="deep-btn primary" id="tarotDrawBtn">抽一张牌</button>
        <button type="button" class="deep-btn" id="tarotApplyBtn" disabled>应用牌面建议</button>
      </div>
      <div class="tarot-stage">
        <div class="tarot-card" id="tarotCard">
          <div class="tarot-face tarot-back">TAROT READING</div>
          <div class="tarot-face tarot-front">
            <p id="tarotState" class="tarot-tag">等待抽牌</p>
            <h4 id="tarotName" class="tarot-name">尚未揭示</h4>
            <p id="tarotKeywords" class="tarot-tag">关键词：—</p>
            <p id="tarotAdvice" class="tarot-tip">点击“抽一张牌”开始。</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const topicInput = container.querySelector("#tarotTopicInput");
  const drawBtn = container.querySelector("#tarotDrawBtn");
  const applyBtn = container.querySelector("#tarotApplyBtn");
  const tarotCard = container.querySelector("#tarotCard");
  const tarotState = container.querySelector("#tarotState");
  const tarotName = container.querySelector("#tarotName");
  const tarotKeywords = container.querySelector("#tarotKeywords");
  const tarotAdvice = container.querySelector("#tarotAdvice");

  let latestAdvice = "";
  let drawTimes = 0;

  drawBtn.addEventListener("click", () => {
    drawTimes += 1;
    const topic = topicInput.value;
    const drawSeed = hashText(`${getProfileSeed()}|${topic}|${Date.now()}|${drawTimes}`);
    const card = deck[drawSeed % deck.length];
    const isReversed = ((drawSeed >> 3) % 3) === 0;
    const baseAdvice = isReversed ? card.reversed : card.upright;
    latestAdvice = `${topicLabels[topic]}：${baseAdvice}`;

    drawBtn.disabled = true;
    tarotCard.classList.remove("revealed");
    tarotCard.classList.add("drawing");

    setTimeout(() => {
      tarotCard.classList.remove("drawing");
      tarotCard.classList.add("revealed");
      tarotState.textContent = isReversed ? "逆位" : "正位";
      tarotName.textContent = card.name;
      tarotKeywords.textContent = `关键词：${card.keywords}`;
      tarotAdvice.textContent = latestAdvice;
      applyBtn.disabled = false;
      drawBtn.disabled = false;
      logActivity(`已完成塔罗抽牌：${card.name}${isReversed ? "（逆位）" : "（正位）"}`);
    }, 420);
  });

  applyBtn.addEventListener("click", () => {
    if (!latestAdvice) return;
    adviceBox.textContent = `塔罗建议：${latestAdvice}`;
    logActivity("已应用塔罗建议到今日结论");
    closeDeepModal();
  });
}

function bindDeepActions() {
  setupDeepModalEvents();
  deepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.deep;
      if (key === "date") {
        openDeepModal("DEEP ANALYSIS", "择日行动窗口");
        renderDateAnalyzer(deepModalContent);
        logActivity("已打开深度分析：择日");
      }
      if (key === "tarot") {
        openDeepModal("DEEP ANALYSIS", "塔罗行动建议");
        renderTarotAnalyzer(deepModalContent);
        logActivity("已打开深度分析：塔罗");
      }
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
