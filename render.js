(function (global) {
  const NS = 'http://www.w3.org/2000/svg';

  function createSvgEl(name, attrs) {
    const el = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (key) {
      el.setAttribute(key, String(attrs[key]));
    });
    return el;
  }

  function clearSvg(svg) {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  }

  function getBounds(geometry) {
    if (geometry && geometry.bounds) return geometry.bounds;
    return {
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100
    };
  }

  function setupViewBox(svg, bounds, padding) {
    const pad = padding || 20;
    const width = Math.max(1, bounds.maxX - bounds.minX);
    const height = Math.max(1, bounds.maxY - bounds.minY);

    svg.setAttribute(
      'viewBox',
      [
        bounds.minX - pad,
        bounds.minY - pad,
        width + pad * 2,
        height + pad * 2
      ].join(' ')
    );
  }

  function drawLine(svg, line, options) {
    svg.appendChild(
      createSvgEl('line', {
        x1: line.x1,
        y1: line.y1,
        x2: line.x2,
        y2: line.y2,
        fill: 'none',
        stroke: options.stroke || '#e60012',
        'stroke-width': options.strokeWidth || 1.28,
        'stroke-linejoin': options.lineJoin || 'round',
        'stroke-linecap': options.lineCap || 'round'
      })
    );
  }

  function drawPath(svg, d, options) {
    svg.appendChild(
      createSvgEl('path', {
        d: d,
        fill: options.fill || 'none',
        stroke: options.stroke || '#000000',
        'stroke-width': options.strokeWidth || 0.85,
        'stroke-linejoin': options.lineJoin || 'round',
        'stroke-linecap': options.lineCap || 'round'
      })
    );
  }

  function drawRect(svg, item, options) {
    svg.appendChild(
      createSvgEl('rect', {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
        fill: options.fill || 'none',
        stroke: options.stroke || '#000000',
        'stroke-width': options.strokeWidth || 0.85,
        'stroke-linejoin': options.lineJoin || 'round',
        'stroke-linecap': options.lineCap || 'round'
      })
    );
  }

  function drawPolygon(svg, points, options) {
    const pointStr = points.map(function (p) {
      return p.x + ',' + p.y;
    }).join(' ');

    svg.appendChild(
      createSvgEl('polygon', {
        points: pointStr,
        fill: options.fill || 'none',
        stroke: options.stroke || '#000000',
        'stroke-width': options.strokeWidth || 0.85,
        'stroke-linejoin': options.lineJoin || 'round',
        'stroke-linecap': options.lineCap || 'round'
      })
    );
  }

  function renderFlatPreview(svg, geometry) {
    clearSvg(svg);

    if (!geometry) {
      svg.setAttribute('viewBox', '0 0 100 100');
      return;
    }

    const bounds = getBounds(geometry);
    setupViewBox(svg, bounds, 20);

    svg.appendChild(createSvgEl('rect', {
      x: bounds.minX - 20,
      y: bounds.minY - 20,
      width: bounds.maxX - bounds.minX + 40,
      height: bounds.maxY - bounds.minY + 40,
      fill: '#ffffff',
      stroke: 'none'
    }));

    // 黑色外轮廓
    if (geometry.outlinePaths && geometry.outlinePaths.length) {
      geometry.outlinePaths.forEach(function (d) {
        drawPath(svg, d, {
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 0.85,
          lineJoin: 'round',
          lineCap: 'round'
        });
      });
    } else {
      (geometry.panels || []).forEach(function (item) {
        drawRect(svg, item, {
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 0.85,
          lineJoin: 'round',
          lineCap: 'round'
        });
      });

      (geometry.topFlaps || []).forEach(function (item) {
        drawRect(svg, item, {
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 0.85,
          lineJoin: 'round',
          lineCap: 'round'
        });
      });

      (geometry.bottomFlaps || []).forEach(function (item) {
        drawRect(svg, item, {
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 0.85,
          lineJoin: 'round',
          lineCap: 'round'
        });
      });

      if (geometry.glueFlap && geometry.glueFlap.points) {
        drawPolygon(svg, geometry.glueFlap.points, {
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 0.85,
          lineJoin: 'round',
          lineCap: 'round'
        });
      }
    }

    // 红色折线：改成实线，不要虚线
    (geometry.foldLines || []).forEach(function (line) {
      drawLine(svg, line, {
        stroke: '#e60012',
        strokeWidth: 1.28,
        lineJoin: 'round',
        lineCap: 'round'
      });
    });

    // 预留蓝色尺寸线接口，先不启用
    (geometry.dimensionLines || []).forEach(function (line) {
      drawLine(svg, line, {
        stroke: '#2958a7',
        strokeWidth: 0.85,
        lineJoin: 'round',
        lineCap: 'round'
      });
    });
  }

  function projectIso(x, y, z) {
    return {
      x: x - y * 0.6,
      y: z - y * 0.35
    };
  }

  function renderIsoPreview(svg, preview3d) {
    clearSvg(svg);
  
    const L = Math.max(1, Number(preview3d && preview3d.length) || 160);
    const W = Math.max(1, Number(preview3d && preview3d.width) || 60);
    const H = Math.max(1, Number(preview3d && preview3d.height) || 120);
  
    // 透视参数：这两个值决定“往右上缩进去”的感觉
    const dx = Math.max(28, W * 0.55);
    const dy = Math.max(18, W * 0.30);
  
    // 前面
    const A = { x: 0, y: H };      // 左下前
    const B = { x: L, y: H };      // 右下前
    const C = { x: L, y: 0 };      // 右上前
    const D = { x: 0, y: 0 };      // 左上前
  
    // 后面（往右上退）
    const E = { x: dx,     y: H - dy }; // 左下后
    const F = { x: L + dx, y: H - dy }; // 右下后
    const G = { x: L + dx, y: -dy };    // 右上后
    const Hh = { x: dx,    y: -dy };    // 左上后
  
    const all = [A, B, C, D, E, F, G, Hh];
    const minX = Math.min.apply(null, all.map(function (p) { return p.x; }));
    const maxX = Math.max.apply(null, all.map(function (p) { return p.x; }));
    const minY = Math.min.apply(null, all.map(function (p) { return p.y; }));
    const maxY = Math.max.apply(null, all.map(function (p) { return p.y; }));
  
    const pad = 48;
    svg.setAttribute(
      'viewBox',
      [
        minX - pad - 40,
        minY - pad - 40,
        (maxX - minX) + (pad + 40) * 2,
        (maxY - minY) + (pad + 40) * 2
      ].join(' ')
    );
  
    svg.appendChild(createSvgEl('rect', {
      x: minX - pad - 40,
      y: minY - pad - 40,
      width: (maxX - minX) + (pad + 40) * 2,
      height: (maxY - minY) + (pad + 40) * 2,
      fill: '#ffffff',
      stroke: 'none'
    }));
  
    function line(a, b, options) {
      svg.appendChild(createSvgEl('line', {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        fill: 'none',
        stroke: (options && options.stroke) || '#111111',
        'stroke-width': (options && options.strokeWidth) || 1.15,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
        'stroke-opacity': (options && options.opacity) || 1
      }));
    }
  
    function textLabel(x, y, value, options) {
      const el = createSvgEl('text', {
        x: x,
        y: y,
        fill: (options && options.fill) || '#e60012',
        'font-size': (options && options.fontSize) || 11,
        'font-family': 'Arial, PingFang SC, Microsoft YaHei, sans-serif',
        'text-anchor': (options && options.anchor) || 'middle',
        'dominant-baseline': 'middle'
      });
      el.textContent = value;
      svg.appendChild(el);
    }
  
    function arrowHead(from, to, color) {
      const ang = Math.atan2(to.y - from.y, to.x - from.x);
      const len = 5;
      const a1 = ang + Math.PI * 0.82;
      const a2 = ang - Math.PI * 0.82;
  
      const p1 = {
        x: to.x + Math.cos(a1) * len,
        y: to.y + Math.sin(a1) * len
      };
      const p2 = {
        x: to.x + Math.cos(a2) * len,
        y: to.y + Math.sin(a2) * len
      };
  
      line(to, p1, { stroke: color, strokeWidth: 1.0 });
      line(to, p2, { stroke: color, strokeWidth: 1.0 });
    }
  
    function dimLine(a, b, label, labelOffsetX, labelOffsetY) {
      const color = '#e60012';
  
      line(a, b, { stroke: color, strokeWidth: 1.0 });
      arrowHead(b, a, color);
      arrowHead(a, b, color);
  
      textLabel(
        (a.x + b.x) / 2 + (labelOffsetX || 0),
        (a.y + b.y) / 2 + (labelOffsetY || 0),
        label,
        { fill: color, fontSize: 11 }
      );
    }
  
    function extLine(a, b) {
      line(a, b, { stroke: '#e60012', strokeWidth: 0.9, opacity: 0.95 });
    }
  
    // ----------------------------
    // 黑色立体透视线稿
    // ----------------------------
  
    // 前框
    line(D, C);
    line(C, B);
    line(B, A);
    line(A, D);
  
    // 后框（适当少画一点，更干净）
    line(Hh, G, { opacity: 0.75 });
    line(G, F, { opacity: 0.75 });
    line(E, F, { opacity: 0.55 });
  
    // 深度连接线
    line(D, Hh);
    line(C, G);
    line(B, F);
    line(A, E, { opacity: 0.8 });
  
    // 可选的内侧提示线，稍淡一点，像草图结构线
    line(Hh, E, { opacity: 0.25 });
    line(E, A, { opacity: 0.18 });
  
    // ----------------------------
    // 红色尺寸标注
    // ----------------------------
  
    // 1) 长度 L：顶边上方
    const lY = D.y - 26;
    const l1 = { x: D.x, y: lY };
    const l2 = { x: C.x, y: lY };
    extLine(D, { x: D.x, y: lY + 4 });
    extLine(C, { x: C.x, y: lY + 4 });
    dimLine(l1, l2, 'L ' + L + ' mm', 0, -9);
  
    // 2) 高度 H：左边外侧
    const hX = D.x - 26;
    const h1 = { x: hX, y: D.y };
    const h2 = { x: hX, y: A.y };
    extLine(D, { x: hX + 4, y: D.y });
    extLine(A, { x: hX + 4, y: A.y });
    dimLine(h1, h2, 'H ' + H + ' mm', -18, 0);
  
    // 3) 宽度 W：右上斜向深度边
    const w1 = { x: C.x + 10, y: C.y - 6 };
    const w2 = { x: G.x + 10, y: G.y - 6 };
    extLine(C, w1);
    extLine(G, w2);
    dimLine(w1, w2, 'W ' + W + ' mm', 10, -8);
  }

  global.PackagingRender = {
    renderFlatPreview: renderFlatPreview,
    renderIsoPreview: renderIsoPreview
  };
})(window);