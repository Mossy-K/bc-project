/*
  这个文件只负责“画图”。
  包括：
  1. 中间刀版平面图 SVG
  2. 右侧 3D 斜侧示意图 SVG
  3. 一些 SVG 小工具函数

  以后你想改：
  - 线条颜色
  - 尺寸标注风格
  - 平面图/立体图长什么样
  主要改这里。
*/

(function (global) {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function createSvgEl(tagName, attrs) {
    const el = document.createElementNS(SVG_NS, tagName);
    Object.keys(attrs).forEach(function (key) {
      // 避免给空字符串属性，特别是 stroke-dasharray 这类可选属性
      if (attrs[key] !== '' && attrs[key] !== null && attrs[key] !== undefined) {
        el.setAttribute(key, String(attrs[key]));
      }
    });
    return el;
  }

  function clearSvg(svg) {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  }

  function rectPath(x, y, w, h, offsetX, offsetY) {
    return [
      'M ' + (x + offsetX) + ' ' + (y + offsetY),
      'L ' + (x + w + offsetX) + ' ' + (y + offsetY),
      'L ' + (x + w + offsetX) + ' ' + (y + h + offsetY),
      'L ' + (x + offsetX) + ' ' + (y + h + offsetY),
      'Z'
    ].join(' ');
  }

  function gluePath(glue, offsetX, offsetY) {
    return [
      'M ' + (glue.attachX + offsetX) + ' ' + (glue.attachTopY + offsetY),
      'L ' + (glue.x + offsetX) + ' ' + (glue.y1 + offsetY),
      'L ' + (glue.x + offsetX) + ' ' + (glue.y2 + offsetY),
      'L ' + (glue.attachX + offsetX) + ' ' + (glue.attachBottomY + offsetY),
      'Z'
    ].join(' ');
  }

  function renderFlatPreview(svg, geometry) {
    const pad = 20;
    const width = geometry.bounds.maxX - geometry.bounds.minX + pad * 2;
    const height = geometry.bounds.maxY - geometry.bounds.minY + pad * 2;
    const offsetX = pad - geometry.bounds.minX;
    const offsetY = pad - geometry.bounds.minY;

    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    clearSvg(svg);

    svg.appendChild(createSvgEl('rect', {
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: 'white'
    }));

    geometry.panels.forEach(function (p) {
      svg.appendChild(createSvgEl('path', {
        d: rectPath(p.x, p.y, p.w, p.h, offsetX, offsetY),
        fill: 'none',
        stroke: '#111827',
        'stroke-width': 1.2
      }));
    });

    geometry.topFlaps.forEach(function (f) {
      svg.appendChild(createSvgEl('path', {
        d: rectPath(f.x, f.y, f.w, f.h, offsetX, offsetY),
        fill: 'none',
        stroke: '#111827',
        'stroke-width': 1.2
      }));
    });

    geometry.bottomFlaps.forEach(function (f) {
      svg.appendChild(createSvgEl('path', {
        d: rectPath(f.x, f.y, f.w, f.h, offsetX, offsetY),
        fill: 'none',
        stroke: '#111827',
        'stroke-width': 1.2
      }));
    });

    svg.appendChild(createSvgEl('path', {
      d: gluePath(geometry.glueFlapShape, offsetX, offsetY),
      fill: 'none',
      stroke: '#111827',
      'stroke-width': 1.2
    }));

    geometry.foldLines.forEach(function (line) {
      svg.appendChild(createSvgEl('line', {
        x1: line.x1 + offsetX,
        y1: line.y1 + offsetY,
        x2: line.x2 + offsetX,
        y2: line.y2 + offsetY,
        stroke: '#ef4444',
        'stroke-width': 1
      }));
    });
  }

  function isoProject(x, y, z, scale, originX, originY) {
    return {
      x: originX + (x - y) * 0.866 * scale,
      y: originY + (x + y) * 0.5 * scale - z * scale
    };
  }

  function drawSvgLine(svg, a, b, opts) {
    svg.appendChild(createSvgEl('line', {
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      stroke: opts.stroke || '#111827',
      'stroke-width': opts.strokeWidth || 1.4,
      'stroke-dasharray': opts.dash || null
    }));
  }

  function drawSvgText(svg, text, x, y, rotate) {
    const el = createSvgEl('text', {
      x: x,
      y: y,
      fill: '#0f172a',
      'font-size': 14,
      'font-family': 'Arial, PingFang SC, Microsoft YaHei, sans-serif'
    });

    if (rotate) {
      el.setAttribute('transform', 'rotate(' + rotate + ' ' + x + ' ' + y + ')');
    }

    el.textContent = text;
    svg.appendChild(el);
  }

  function drawArrow(svg, from, to, label, labelX, labelY, rotate) {
    drawSvgLine(svg, from, to, { stroke: '#ef4444', strokeWidth: 1.2 });

    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 8;

    [from, to].forEach(function (p, idx) {
      const dir = idx === 0 ? angle : angle + Math.PI;
      const a1 = {
        x: p.x + Math.cos(dir - Math.PI / 6) * headLen,
        y: p.y + Math.sin(dir - Math.PI / 6) * headLen
      };
      const a2 = {
        x: p.x + Math.cos(dir + Math.PI / 6) * headLen,
        y: p.y + Math.sin(dir + Math.PI / 6) * headLen
      };
      drawSvgLine(svg, p, a1, { stroke: '#ef4444', strokeWidth: 1.2 });
      drawSvgLine(svg, p, a2, { stroke: '#ef4444', strokeWidth: 1.2 });
    });

    drawSvgText(svg, label, labelX, labelY, rotate || 0);
  }

  function renderIsoPreview(svg, input) {
    clearSvg(svg);
    svg.setAttribute('viewBox', '0 0 720 420');

    svg.appendChild(createSvgEl('rect', {
      x: 0,
      y: 0,
      width: 720,
      height: 420,
      fill: 'white'
    }));

    const L = input.length;
    const W = input.width;
    const H = input.height;
    const maxDim = Math.max(L, W, H, 1);
    const scale = 180 / maxDim;
    const originX = 270;
    const originY = 280;

    const A = isoProject(0, 0, 0, scale, originX, originY);
    const B = isoProject(L, 0, 0, scale, originX, originY);
    const C = isoProject(L, W, 0, scale, originX, originY);
    const D = isoProject(0, W, 0, scale, originX, originY);
    const E = isoProject(0, 0, H, scale, originX, originY);
    const F = isoProject(L, 0, H, scale, originX, originY);
    const G = isoProject(L, W, H, scale, originX, originY);
    const Ht = isoProject(0, W, H, scale, originX, originY);

    [
      [A, B], [B, C], [C, D], [D, A],
      [E, F], [F, G], [G, Ht], [Ht, E],
      [A, E], [B, F], [C, G], [D, Ht]
    ].forEach(function (pair) {
      drawSvgLine(svg, pair[0], pair[1], { stroke: '#111827', strokeWidth: 1.6 });
    });

    // 辅助虚线
    drawSvgLine(svg, A, C, { stroke: '#cbd5e1', strokeWidth: 1, dash: '4 4' });
    drawSvgLine(svg, E, G, { stroke: '#cbd5e1', strokeWidth: 1, dash: '4 4' });

    // 长度标注
    const lenFrom = { x: A.x, y: A.y + 26 };
    const lenTo = { x: B.x, y: B.y + 26 };
    drawSvgLine(svg, A, lenFrom, { stroke: '#94a3b8', strokeWidth: 1, dash: '3 3' });
    drawSvgLine(svg, B, lenTo, { stroke: '#94a3b8', strokeWidth: 1, dash: '3 3' });
    drawArrow(svg, lenFrom, lenTo, 'L ' + L + ' mm', (lenFrom.x + lenTo.x) / 2 - 10, (lenFrom.y + lenTo.y) / 2 - 8, 26);

    // 宽度标注
    const widFrom = { x: B.x + 26, y: B.y + 6 };
    const widTo = { x: C.x + 26, y: C.y + 6 };
    drawSvgLine(svg, B, widFrom, { stroke: '#94a3b8', strokeWidth: 1, dash: '3 3' });
    drawSvgLine(svg, C, widTo, { stroke: '#94a3b8', strokeWidth: 1, dash: '3 3' });
    drawArrow(svg, widFrom, widTo, 'W ' + W + ' mm', (widFrom.x + widTo.x) / 2 + 10, (widFrom.y + widTo.y) / 2 - 2, -26);

    // 高度标注
    const heiFrom = { x: C.x + 34, y: C.y };
    const heiTo = { x: G.x + 34, y: G.y };
    drawSvgLine(svg, C, heiFrom, { stroke: '#94a3b8', strokeWidth: 1, dash: '3 3' });
    drawSvgLine(svg, G, heiTo, { stroke: '#94a3b8', strokeWidth: 1, dash: '3 3' });
    drawArrow(svg, heiFrom, heiTo, 'H ' + H + ' mm', heiTo.x + 8, (heiFrom.y + heiTo.y) / 2, -90);
  }

  global.PackagingRender = {
    rectPath: rectPath,
    gluePath: gluePath,
    renderFlatPreview: renderFlatPreview,
    renderIsoPreview: renderIsoPreview
  };
})(window);