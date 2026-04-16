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

    const L = Math.max(1, Number(preview3d && preview3d.length) || 100);
    const W = Math.max(1, Number(preview3d && preview3d.width) || 60);
    const H = Math.max(1, Number(preview3d && preview3d.height) || 80);

    const p1 = projectIso(0, 0, 0);
    const p2 = projectIso(L, 0, 0);
    const p3 = projectIso(L, W, 0);
    const p4 = projectIso(0, W, 0);

    const p5 = projectIso(0, 0, H);
    const p6 = projectIso(L, 0, H);
    const p7 = projectIso(L, W, H);
    const p8 = projectIso(0, W, H);

    const all = [p1, p2, p3, p4, p5, p6, p7, p8];
    const minX = Math.min.apply(null, all.map(function (p) { return p.x; }));
    const maxX = Math.max.apply(null, all.map(function (p) { return p.x; }));
    const minY = Math.min.apply(null, all.map(function (p) { return p.y; }));
    const maxY = Math.max.apply(null, all.map(function (p) { return p.y; }));

    const pad = 30;
    svg.setAttribute(
      'viewBox',
      [
        minX - pad,
        minY - pad,
        (maxX - minX) + pad * 2,
        (maxY - minY) + pad * 2
      ].join(' ')
    );

    svg.appendChild(createSvgEl('rect', {
      x: minX - pad,
      y: minY - pad,
      width: (maxX - minX) + pad * 2,
      height: (maxY - minY) + pad * 2,
      fill: '#ffffff',
      stroke: 'none'
    }));

    function poly(points, fill) {
      const str = points.map(function (p) { return p.x + ',' + p.y; }).join(' ');
      svg.appendChild(createSvgEl('polygon', {
        points: str,
        fill: fill,
        stroke: '#000000',
        'stroke-width': 0.85,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round'
      }));
    }

    poly([p5, p6, p7, p8], '#f8fafc');
    poly([p2, p3, p7, p6], '#ffffff');
    poly([p1, p2, p6, p5], '#e5e7eb');
  }

  global.PackagingRender = {
    renderFlatPreview: renderFlatPreview,
    renderIsoPreview: renderIsoPreview
  };
})(window);