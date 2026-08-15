(function () {
  'use strict';
  var D = window.AOE4_DATA || {};
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return document.querySelectorAll(s); };
  var TABS = ['home', 'news', 'patches', 'civs', 'events', 'ranked', 'esports'];

  var IMPACT = {
    buff: { label: '加强', cls: 'b-buff' },
    nerf: { label: '削弱', cls: 'b-nerf' },
    rework: { label: '重做', cls: 'b-rework' },
    mixed: { label: '混合', cls: 'b-mixed' },
    fix: { label: '修复', cls: 'b-fix' }
  };
  var TYPE = {
    announcement: { label: '公告 / DLC', cls: 't-anno' },
    patch: { label: '补丁', cls: 't-patch' },
    event: { label: '活动', cls: 't-event' },
    esports: { label: '电竞', cls: 't-esports' },
    system: { label: '系统', cls: 't-system' }
  };
  var CIV_TYPE = { base: '本体', variant: '变体', dlc: 'DLC文明' };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\x22/g, '&quot;')
      .replace(/\x27/g, '&#39;');
  }
  function fmtDate(d) {
    var p = String(d).split('-');
    if (p.length === 3) return p[0] + '年' + (+p[1]) + '月' + (+p[2]) + '日';
    if (p.length === 2) return p[0] + '年' + (+p[1]) + '月';
    return d;
  }
  function daysUntil(dateStr) {
    var t = new Date(dateStr + 'T00:00:00').getTime();
    var now = new Date().getTime();
    return Math.max(0, Math.ceil((t - now) / 86400000));
  }
  function badge(impact) {
    var m = IMPACT[impact] || IMPACT.fix;
    return '<span class="badge ' + m.cls + '">' + m.label + '</span>';
  }
  function tag(type) {
    var m = TYPE[type] || TYPE.system;
    return '<span class="tag ' + m.cls + '">' + m.label + '</span>';
  }
  function sortByDate(arr, key, desc) {
    return arr.slice().sort(function (a, b) {
      var va = String(a[key] || '').replace(/-/g, '');
      var vb = String(b[key] || '').replace(/-/g, '');
      return desc ? vb.localeCompare(va) : va.localeCompare(vb);
    });
  }

  function renderHome() {
    var hero = null;
    for (var i = 0; i < D.news.length; i++) {
      if (D.news[i].type === 'announcement') { hero = D.news[i]; break; }
    }
    if (!hero) hero = D.news[0] || { date: '', title: '', summary: '', link: '#', highlights: [] };
    var hls = (hero.highlights || []).map(function (h) {
      return '<span class="chip hl">' + esc(h) + '</span>';
    }).join('');

    var cds = [
      { date: '2026-08-22', label: '距 EGC Masters Fall 开赛', when: '8月22日 – 9月20日', hot: true },
      { date: '2026-09-01', label: '距秋季天梯赛季', when: '9月1日开始', hot: false },
      { date: '2026-09-01', label: '距下个活动「Sounds of Reverie」', when: '9月1日开始', hot: false }
    ];
    var countdowns = cds.map(function (c) {
      return '<div class="cd' + (c.hot ? ' hot' : '') + '">' +
        '<div class="num">' + daysUntil(c.date) + ' 天</div>' +
        '<div class="lbl">' + esc(c.label) + '</div>' +
        '<div class="when">' + esc(c.when) + '</div></div>';
    }).join('');

    var latest = sortByDate(D.news, 'date', true).slice(0, 5).map(function (n) {
      return '<div class="card news-item">' +
        '<div class="news-meta">' + tag(n.type) + '<span>' + fmtDate(n.date) + '</span><span>' + esc(n.source || '') + '</span></div>' +
        '<div class="news-title"><a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + esc(n.title) + '</a></div>' +
        '<div class="news-sum">' + esc(n.summary) + '</div></div>';
    }).join('');

    var quick = [
      { go: 'patches', icon: '🛠️', name: '补丁平衡', desc: '哪些文明被加强/削弱' },
      { go: 'civs', icon: '🏰', name: '文明图鉴', desc: '23个文明与变体近况' },
      { go: 'events', icon: '📅', name: '活动日历', desc: '官方事件轮换时间表' },
      { go: 'ranked', icon: '🏅', name: '天梯赛季', desc: '赛季时间与段位表' }
    ];
    var quickHtml = quick.map(function (q) {
      return '<div class="card" data-go="' + q.go + '" style="cursor:pointer">' +
        '<div style="font-size:22px">' + q.icon + '</div>' +
        '<div class="civ-name-zh">' + q.name + '</div>' +
        '<div class="civ-sum">' + q.desc + '</div></div>';
    }).join('');

    $('#view-home').innerHTML =
      '<div class="hero">' +
        '<div class="kicker">官方年度展望 · ' + fmtDate(hero.date) + '</div>' +
        '<h1>' + esc(hero.title) + '</h1>' +
        '<p class="sub">' + esc(hero.summary) + '</p>' +
        '<div class="chips">' + hls + '</div>' +
        '<a class="btn" href="' + esc(hero.link) + '" target="_blank" rel="noopener">查看官方公告</a>' +
      '</div>' +
      '<div class="cards">' + countdowns + '</div>' +
      '<h3 class="sect-title">最新资讯</h3>' +
      '<div class="grid g2">' + latest + '</div>' +
      '<h3 class="sect-title">快速入口</h3>' +
      '<div class="grid g4">' + quickHtml + '</div>';
  }

  function renderNews() {
    var opts = Object.keys(TYPE).map(function (k) {
      return '<option value="' + k + '">' + TYPE[k].label + '</option>';
    }).join('');
    $('#view-news').innerHTML =
      '<h2 class="title">官方资讯</h2>' +
      '<p class="sub">聚焦官网新闻与官方公告，覆盖 2026 年 5 月至今（点击标题查看官方原文）</p>' +
      '<div class="filters"><label>类型：</label><select id="news-filter">' +
        '<option value="all">全部</option>' + opts + '</select></div>' +
      '<div class="grid g2" id="news-list"></div>';
    var list = $('#news-list');
    function paint() {
      var f = $('#news-filter').value;
      var items = sortByDate(D.news, 'date', true).filter(function (n) { return f === 'all' || n.type === f; });
      list.innerHTML = items.length ? items.map(function (n) {
        var hls = (n.highlights || []).map(function (h) { return '<span class="chip">' + esc(h) + '</span>'; }).join('');
        return '<div class="card news-item">' +
          '<div class="news-meta">' + tag(n.type) + '<span>' + fmtDate(n.date) + '</span><span>' + esc(n.source || '') + '</span></div>' +
          '<div class="news-title"><a href="' + esc(n.link) + '" target="_blank" rel="noopener">' + esc(n.title) + '</a></div>' +
          '<div class="news-sum">' + esc(n.summary) + '</div>' +
          (hls ? '<div class="news-hl">' + hls + '</div>' : '') +
        '</div>';
      }).join('') : '<div class="empty">该类型暂无条目</div>';
    }
    $('#news-filter').addEventListener('change', paint);
    paint();
  }

  function civOptions() {
    var seen = {};
    var out = [];
    D.patches.forEach(function (p) {
      p.changes.forEach(function (c) {
        if (c.civ !== '通用' && !seen[c.civ]) {
          seen[c.civ] = 1;
          out.push('<option value="' + esc(c.civ) + '">' + esc(c.civZh) + '</option>');
        }
      });
    });
    return out.sort().join('');
  }

  function renderPatches() {
    var impactOpts = Object.keys(IMPACT).map(function (k) {
      return '<option value="' + k + '">' + IMPACT[k].label + '</option>';
    }).join('');
    $('#view-patches').innerHTML =
      '<h2 class="title">补丁与平衡变更</h2>' +
      '<p class="sub">近三个月官方补丁（2026-05 至今）：按版本查看各文明加强 / 削弱 / 重做情况</p>' +
      '<div class="filters">' +
        '<label>文明：</label><select id="patch-civ"><option value="all">全部</option>' + civOptions() + '</select>' +
        '<label>类型：</label><select id="patch-impact"><option value="all">全部</option>' + impactOpts + '</select>' +
      '</div>' +
      '<div id="patch-list"></div>';
    var list = $('#patch-list');
    function paint() {
      var fc = $('#patch-civ').value;
      var fi = $('#patch-impact').value;
      var hasFilter = (fc !== 'all' || fi !== 'all');
      var rows = sortByDate(D.patches, 'date', true).map(function (p) {
        var changes = p.changes.filter(function (c) {
          return (fc === 'all' || c.civ === fc) && (fi === 'all' || c.impact === fi);
        });
        if (hasFilter && !changes.length) return '';
        var rowsHtml = changes.map(function (c) {
          return '<div class="change-row">' +
            '<span class="civ-name">' + esc(c.civZh) + '</span>' +
            '<span>' + badge(c.impact) + '</span>' +
            '<span class="change-text">' + esc(c.summary) + '</span></div>';
        }).join('');
        var typeTag = p.type === 'major' ? '<span class="tag t-patch">大型平衡补丁</span>'
          : p.type === 'minor' ? '<span class="tag t-patch">小型补丁</span>'
          : '<span class="tag t-patch">补丁</span>';
        return '<div class="card patch-card">' +
          '<div class="patch-head">' +
            '<span class="patch-ver">' + esc(p.name) + '</span>' +
            '<span class="patch-date">' + fmtDate(p.date) + '</span>' + typeTag +
            '<a href="' + esc(p.link) + '" target="_blank" rel="noopener">官方公告 ↗</a>' +
          '</div>' +
          '<p class="patch-sum">' + esc(p.summary) + '</p>' +
          (rowsHtml || '<div class="empty">该筛选下无变更条目</div>') +
        '</div>';
      }).join('');
      list.innerHTML = rows || '<div class="empty">没有符合条件的补丁条目</div>';
    }
    $('#patch-civ').addEventListener('change', paint);
    $('#patch-impact').addEventListener('change', paint);
    paint();
  }

  function renderCivs() {
    var items = D.civs.map(function (c) {
      return '<div class="card civ-card">' +
        '<div class="civ-top">' +
          '<span class="civ-name-zh">' + esc(c.name) + '</span>' +
          '<span class="civ-type">' + CIV_TYPE[c.type] + '</span>' + badge(c.impact) +
        '</div>' +
        '<div class="civ-en">' + esc(c.en) + '</div>' +
        '<div class="civ-sum">' + esc(c.summary) + '</div>' +
      '</div>';
    }).join('');
    $('#view-civs').innerHTML =
      '<h2 class="title">文明图鉴</h2>' +
      '<p class="sub">本体文明、DLC 文明与变体一览（含近三个月平衡影响）</p>' +
      '<div class="grid g3">' + items + '</div>';
  }

  function renderEvents() {
    var now = new Date().getTime();
    var rows = sortByDate(D.events, 'date', false).map(function (e) {
      var past = new Date(e.date + 'T00:00:00').getTime() < now;
      return '<div class="ev-row' + (past ? ' ev-done' : '') + '">' +
        '<span class="ev-date">' + fmtDate(e.date) + '</span>' +
        '<span class="ev-name">' + esc(e.name) + '</span>' +
        (past ? '<span class="tag t-system">已结束</span>' : '<span class="tag t-event">即将 / 进行中</span>') +
      '</div>';
    }).join('');
    $('#view-events').innerHTML =
      '<h2 class="title">活动日历</h2>' +
      '<p class="sub">官方游戏内事件轮换时间表（来自官方支持站）</p>' +
      '<div class="card">' + rows + '</div>' +
      '<div class="note">📌 ' + esc(D.eventsNote) + '</div>';
  }

  function renderRanked() {
    var R = D.ranked || {};
    var seasons = (R.seasons || []).map(function (s) {
      return '<div class="season' + (s.active ? ' active' : '') + '">' +
        '<div class="s-name">' + esc(s.name) + '赛季</div>' +
        '<div class="s-range">' + esc(s.range) + '</div>' +
        (s.active ? '<div class="s-flag">● 进行中</div>' : '') +
      '</div>';
    }).join('');
    var rankRows = (R.ranks || []).map(function (r) {
      return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + ' 分</td></tr>';
    }).join('');
    $('#view-ranked').innerHTML =
      '<h2 class="title">天梯赛季</h2>' +
      '<p class="sub">' + esc(R.format || '') + '</p>' +
      '<div class="season-grid">' + seasons + '</div>' +
      '<div class="card" style="margin-top:18px">' +
        '<div class="civ-name-zh">地图池轮换</div>' +
        '<div class="civ-sum" style="margin-top:4px">' + esc(R.mapPool || '') + '</div>' +
      '</div>' +
      '<h3 class="sect-title">段位与赛季积分（第二赛季）</h3>' +
      '<div class="card"><table class="ranks"><tr><th>段位</th><th>赛季积分区间</th></tr>' + rankRows + '</table></div>' +
      '<div class="note">📌 ' + esc(R.rankNote || '') + '</div>';
  }

  function renderEsports() {
    var cards = (D.esports || []).map(function (e) {
      return '<div class="card esp-card">' +
        '<div class="civ-name-zh">' + esc(e.name) + '</div>' +
        '<div class="esp-field"><span class="k">项目</span><span class="v">' + esc(e.game) + '</span></div>' +
        '<div class="esp-field"><span class="k">时间</span><span class="v">' + esc(e.date) + '</span></div>' +
        '<div class="esp-field"><span class="k">奖金池</span><span class="v">' + esc(e.prize) + '</span></div>' +
        '<div class="esp-field"><span class="k">赛制</span><span class="v">' + esc(e.format) + '</span></div>' +
        '<div class="esp-field"><span class="k">形式</span><span class="v">' + esc(e.location) + '</span></div>' +
        '<div class="esp-field"><span class="k">主办</span><span class="v">' + esc(e.host) + '</span></div>' +
        '<div class="esp-field"><span class="k">备注</span><span class="v">' + esc(e.sponsor) + '</span></div>' +
        '<a class="btn" href="' + esc(e.link) + '" target="_blank" rel="noopener">查看官方赛事页</a>' +
      '</div>';
    }).join('');
    $('#view-esports').innerHTML =
      '<h2 class="title">电竞赛事</h2>' +
      '<p class="sub">World\u0027s Edge 官方赞助赛事</p>' +
      '<div class="grid g2">' + cards + '</div>';
  }

  function show(tab) {
    if (TABS.indexOf(tab) === -1) tab = 'home';
    TABS.forEach(function (t) {
      $('#view-' + t).classList.toggle('hidden', t !== tab);
    });
    $$('.nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });
    if (window.location.hash !== '#' + tab) window.location.hash = tab;
    window.scrollTo(0, 0);
  }

  function init() {
    var up = document.getElementById('updated-at');
    if (up) up.textContent = D.updatedAt || '';
    renderHome();
    renderNews();
    renderPatches();
    renderCivs();
    renderEvents();
    renderRanked();
    renderEsports();

    $$('.nav-btn').forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-tab')); });
    });
    var brand = document.querySelector('.brand');
    if (brand) brand.addEventListener('click', function () { show('home'); });
    document.addEventListener('click', function (ev) {
      var go = ev.target.closest ? ev.target.closest('[data-go]') : null;
      if (go) show(go.getAttribute('data-go'));
    });
    window.addEventListener('hashchange', function () {
      show((window.location.hash || '#home').replace('#', ''));
    });

    show((window.location.hash || '#home').replace('#', ''));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
