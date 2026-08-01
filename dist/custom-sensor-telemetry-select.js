class CustomSensorTelemetrySelect extends HTMLElement {
  static getConfigForm() {
    const schema = [
      { name: 'title', selector: { text: {} } },
      { name: 'base_entity_prefix', selector: { text: {} } },
      { name: 'device_name', selector: { text: {} } },
      { name: 'sensor_picker', selector: { boolean: {} } },
      { name: 'sensor_entities_text', selector: { text: { multiline: true } } },
      { name: 'accent_color', selector: { text: {} } },
      {
        type: 'grid',
        name: '',
        schema: [
          { name: 'show_sparklines', selector: { boolean: {} } },
          { name: 'compact', selector: { boolean: {} } },
          { name: 'group_by_type', selector: { boolean: {} } }
        ]
      }
    ];
    const computeLabel = (item) => ({
      title: 'Title',
      base_entity_prefix: 'Base entity prefix',
      device_name: 'Device name',
      sensor_picker: 'Sensor picker',
      sensor_entities_text: 'Sensor entities',
      accent_color: 'Accent color',
      show_sparklines: 'Sparklines',
      compact: 'Compact mode',
      group_by_type: 'Group by type'
    }[item.name] || item.name || '');
    const assertConfig = (config) => {
      const hasPrefix = !!config.base_entity_prefix && typeof config.base_entity_prefix === 'string';
      const hasText = !!config.sensor_entities_text && typeof config.sensor_entities_text === 'string';
      if (!hasPrefix && !hasText) {
        throw new Error('Configuration error: set base_entity_prefix or sensor_entities_text.');
      }
    };
    return { schema, computeLabel, assertConfig };
  }

  static getStubConfig() {
    return {
      type: 'custom:custom-sensor-telemetry-select',
      title: 'GPU Telemetry',
      base_entity_prefix: 'sensor.nvidia_geforce_gtx_1650_tower_gpu0_',
      device_name: 'Nvidia GPU',
      sensor_picker: true,
      sensor_entities_text: '',
      accent_color: '#ff8c42',
      show_sparklines: true,
      compact: false,
      group_by_type: true
    };
  }

  setConfig(config) {
    if (!config?.base_entity_prefix && !config?.sensor_entities_text) throw new Error('You must define base_entity_prefix or sensor_entities_text');
    this._config = {
      title: 'GPU Telemetry',
      device_name: '',
      sensor_picker: true,
      sensor_entities_text: '',
      accent_color: '#ff8c42',
      show_sparklines: true,
      compact: false,
      group_by_type: true,
      ...config
    };
    this._selected = this._selected || new Set();
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._render();
  }

  _entityId(suffix) {
    return `${this._config.base_entity_prefix}${suffix}`;
  }

  _parseSensorEntities() {
    const text = this._config.sensor_entities_text || '';
    const explicit = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (explicit.length) return explicit;
    const prefix = this._config.base_entity_prefix || '';
    if (!prefix || !this._hass?.states) return [];
    return Object.keys(this._hass.states).filter((eid) => eid.startsWith(prefix));
  }

  _stateById(entityId) {
    return this._hass?.states?.[entityId] || null;
  }

  _sensorMeta(entityId) {
    const s = this._stateById(entityId);
    if (!s) return null;
    const attrs = s.attributes || {};
    const unit = attrs.unit_of_measurement || '';
    const lowerId = entityId.toLowerCase();
    const lowerName = String(attrs.friendly_name || entityId).toLowerCase();
    const hay = `${lowerId} ${lowerName} ${unit}`;
    const num = Number(s.state);
    const isNum = Number.isFinite(num);

    let kind = 'status';
    let barMax = null;
    let percentish = false;

    if (unit === '%' || /utili|usage|load|fan/.test(hay)) {
      kind = 'usage'; barMax = 100; percentish = true;
    } else if (/temp|°f|°c/.test(hay) || ['°F', '°C'].includes(unit)) {
      kind = 'temperature';
    } else if (/watt|power draw|power limit|\b w\b/.test(hay) || unit === 'W') {
      kind = 'power';
    } else if (/vram|memory|\bmb\b|\bgb\b/.test(hay) || ['MB', 'GB', 'MiB', 'GiB'].includes(unit)) {
      kind = 'memory';
    } else if (/clock|mhz|ghz|speed|rpm/.test(hay) || ['MHz', 'GHz', 'RPM'].includes(unit)) {
      kind = 'speed';
    } else if (/download|upload|throughput|bandwidth|mb\/s|kb\/s|gb\/s|b\/s/.test(hay) || /\/s$/.test(unit)) {
      kind = 'bandwidth';
    } else if (/codec|mode|throttle|state|profile|session/.test(hay)) {
      kind = isNum ? 'count' : 'status';
    } else if (isNum) {
      kind = 'numeric';
    }

    const display = unit ? `${s.state} ${unit}` : `${s.state}`;
    return {
      entityId,
      stateObj: s,
      name: attrs.friendly_name || entityId,
      state: s.state,
      unit,
      num,
      isNum,
      display,
      kind,
      barMax,
      percentish,
    };
  }

  _groupOrder() {
    return ['temperature', 'usage', 'power', 'memory', 'speed', 'bandwidth', 'count', 'numeric', 'status'];
  }

  _groupTitle(kind) {
    return ({
      temperature: 'Temperatures',
      usage: 'Usage',
      power: 'Power',
      memory: 'Memory',
      speed: 'Speed',
      bandwidth: 'Bandwidth',
      count: 'Counters',
      numeric: 'Metrics',
      status: 'Status'
    }[kind] || kind);
  }

  _sparkValues(value, pct = false) {
    const base = Number.isFinite(value) ? value : 0;
    return Array.from({ length: 18 }, (_, i) => {
      const wave = Math.sin((i / 17) * Math.PI * 1.8) * (pct ? 8 : Math.max(base * 0.08, 1));
      const drift = (i % 4) - 1.5;
      return Math.max(0, base + wave + drift);
    });
  }

  _sparkSvg(value, pct = false) {
    const vals = this._sparkValues(value, pct);
    const w = 160;
    const h = 42;
    const max = Math.max(...vals, 1);
    const min = Math.min(...vals, 0);
    const range = Math.max(max - min, 1);
    const pts = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}"/></svg>`;
  }

  _bar(value, max = 100) {
    const pct = Math.max(0, Math.min(100, (Number(value || 0) / max) * 100));
    return `<div class="bar"><span style="width:${pct}%"></span></div>`;
  }

  _metricTile(meta) {
    const bar = meta.isNum && meta.barMax ? this._bar(meta.num, meta.barMax) : '';
    const spark = this._config.show_sparklines && meta.isNum
      ? `<div class="spark ${meta.kind === 'temperature' ? 'temp' : ''}">${this._sparkSvg(meta.num, !!meta.percentish)}</div>`
      : '';
    return `
      <div class="tile ${meta.kind === 'status' ? 'status-tile' : ''}">
        <div class="tile-top">
          <span class="label">${meta.name}</span>
          <span class="value">${meta.display}</span>
        </div>
        ${bar}
        ${spark}
      </div>
    `;
  }

  _renderSection(title, content) {
    if (!content) return '';
    return `
      <section class="section">
        <div class="section-title">${title}</div>
        <div class="grid">${content}</div>
      </section>
    `;
  }

  _toggleEntity(entityId, checked) {
    if (!this._selected) this._selected = new Set();
    if (checked) this._selected.add(entityId);
    else this._selected.delete(entityId);
    this._render();
  }

  _bindPickerEvents() {
    this.shadowRoot.querySelectorAll('[data-pick-entity]').forEach((el) => {
      el.addEventListener('change', (ev) => {
        this._toggleEntity(ev.currentTarget.dataset.pickEntity, ev.currentTarget.checked);
      });
    });
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;

    const accent = this._config.accent_color || '#ff8c42';
    const compact = !!this._config.compact;
    const allIds = this._parseSensorEntities();
    const metas = allIds.map((id) => this._sensorMeta(id)).filter(Boolean);
    if (!this._selected || this._selected.size === 0) this._selected = new Set(metas.map((m) => m.entityId));
    const chosen = metas.filter((m) => this._selected.has(m.entityId));
    const grouped = {};
    for (const kind of this._groupOrder()) grouped[kind] = [];
    for (const meta of chosen) grouped[meta.kind] = [...(grouped[meta.kind] || []), meta];
    const sections = this._config.group_by_type
      ? this._groupOrder().map((kind) => this._renderSection(this._groupTitle(kind), (grouped[kind] || []).map((m) => this._metricTile(m)).join(''))).join('')
      : this._renderSection('Telemetry', chosen.map((m) => this._metricTile(m)).join(''));

    const picker = this._config.sensor_picker ? `
      <section class="section">
        <div class="section-title">Sensor Picker</div>
        <div class="picker-grid">
          ${metas.map((m) => `
            <label class="pick-chip">
              <input type="checkbox" data-pick-entity="${m.entityId}" ${this._selected.has(m.entityId) ? 'checked' : ''}>
              <span>${m.name}</span>
            </label>
          `).join('')}
        </div>
      </section>
    ` : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }
        ha-card { display:block; overflow:hidden; border-radius:${compact ? '20px' : '24px'}; padding:${compact ? '14px' : '18px'}; color:var(--primary-text-color, #f2f5f7); background: radial-gradient(circle at top left, rgba(255,255,255,.08), transparent 35%), linear-gradient(180deg, rgba(18,18,20,.96), rgba(9,9,11,.98)); border:1px solid rgba(255,255,255,.08); box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 16px 40px rgba(0,0,0,.28); font-family: var(--primary-font-family, Inter, system-ui, sans-serif); }
        .wrap { display:grid; gap:${compact ? '12px' : '14px'}; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
        .eyebrow { font-size:11px; text-transform:uppercase; letter-spacing:.12em; color:var(--secondary-text-color, #9ca3af); margin-bottom:4px; }
        .title { font-size:${compact ? '16px' : '18px'}; font-weight:700; line-height:1.15; }
        .sub { font-size:12px; color:var(--secondary-text-color, #9ca3af); margin-top:4px; word-break:break-all; }
        .badge { padding:7px 11px; border-radius:999px; font-size:11px; font-weight:700; border:1px solid color-mix(in srgb, ${accent} 55%, transparent); background:color-mix(in srgb, ${accent} 18%, transparent); color:${accent}; white-space:nowrap; }
        .section { display:grid; gap:10px; border-radius:18px; padding:${compact ? '12px' : '14px'}; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.06); }
        .section-title { font-size:12px; font-weight:700; color:var(--secondary-text-color, #9ca3af); text-transform:uppercase; letter-spacing:.08em; }
        .grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px; }
        .tile { display:grid; gap:8px; border-radius:16px; padding:${compact ? '10px' : '12px'}; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.06); }
        .status-tile { min-height:unset; }
        .tile-top { display:flex; justify-content:space-between; gap:12px; align-items:baseline; }
        .label { font-size:12px; color:var(--secondary-text-color, #9ca3af); max-width:60%; }
        .value { font-size:${compact ? '14px' : '15px'}; font-weight:700; text-align:right; }
        .bar { height:7px; border-radius:999px; background:rgba(255,255,255,.08); overflow:hidden; }
        .bar span { display:block; height:100%; border-radius:999px; background:${accent}; box-shadow:0 0 12px color-mix(in srgb, ${accent} 45%, transparent); }
        .spark { height:42px; opacity:.92; }
        .spark svg { width:100%; height:100%; }
        .spark polyline { fill:none; stroke:${accent}; stroke-width:2.4; stroke-linecap:round; stroke-linejoin:round; }
        .spark.temp polyline { stroke:#ff8c42; }
        .picker-grid { display:flex; flex-wrap:wrap; gap:10px; }
        .pick-chip { display:inline-flex; align-items:center; gap:8px; padding:10px 12px; border-radius:999px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); font-size:12px; cursor:pointer; }
        .pick-chip input { accent-color:${accent}; }
        @media (max-width: 520px) { .grid { grid-template-columns:1fr; } }
      </style>
      <ha-card>
        <div class="wrap">
          <div class="header">
            <div>
              <div class="eyebrow">Telemetry Helper</div>
              <div class="title">${this._config.title}</div>
              <div class="sub">${this._config.device_name || this._config.base_entity_prefix || 'Custom sensor set'}</div>
            </div>
            <div class="badge">${chosen.length} Sensors</div>
          </div>
          ${picker}
          ${sections || `<section class="section"><div class="section-title">Telemetry</div><div class="sub">No matching sensors found.</div></section>`}
        </div>
      </ha-card>
    `;
    this._bindPickerEvents();
  }

  getCardSize() {
    return this._config?.compact ? 6 : 8;
  }
}

customElements.define('custom-sensor-telemetry-select', CustomSensorTelemetrySelect);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'custom-sensor-telemetry-select',
  name: 'Custom Sensor Telemetry Select',
  description: 'Media-helper styled telemetry card with grouped metrics and sparkline-style visuals.',
  preview: true,
  configurable: true
});
