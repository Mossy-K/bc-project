/*
  这个文件只负责“导出”。
  现在支持：
  1. SVG 导出
  2. 矢量 PDF 导出

  PDF 导出不是截图，而是：
  geometry -> 生成 SVG DOM -> svg2pdf -> jsPDF
*/

(function (global) {
  function xmlEscape(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function svgNodeToString(tagName, attrs) {
    const attrText = Object.keys(attrs)
      .map(function (key) {
        return key + '="' + xmlEscape(attrs[key]) + '"';
      })
      .join(' ');

    return '<' + tagName + ' ' + attrText + ' />';
  }

  function geometryToSvgText(geometry, renderApi) {
    const pad = 10;
    const width = geometry.bounds.maxX - geometry.bounds.minX + pad * 2;
    const height = geometry.bounds.maxY - geometry.bounds.minY + pad * 2;
    const offsetX = pad - geometry.bounds.minX;
    const offsetY = pad - geometry.bounds.minY;

    const parts = [];
    parts.push('<?xml version="1.0" encoding="UTF-8"?>');
    parts.push(
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
        width +
        'mm" height="' +
        height +
        'mm" viewBox="0 0 ' +
        width +
        ' ' +
        height +
        '">'
    );
    parts.push('  <g fill="none">');

    geometry.panels.forEach(function (p) {
      parts.push(
        '    ' +
          svgNodeToString('path', {
            d: renderApi.rectPath(p.x, p.y, p.w, p.h, offsetX, offsetY),
            stroke: '#111827',
            'stroke-width': 1.2,
            fill: 'none'
          })
      );
    });

    geometry.topFlaps.forEach(function (f) {
      parts.push(
        '    ' +
          svgNodeToString('path', {
            d: renderApi.rectPath(f.x, f.y, f.w, f.h, offsetX, offsetY),
            stroke: '#111827',
            'stroke-width': 1.2,
            fill: 'none'
          })
      );
    });

    geometry.bottomFlaps.forEach(function (f) {
      parts.push(
        '    ' +
          svgNodeToString('path', {
            d: renderApi.rectPath(f.x, f.y, f.w, f.h, offsetX, offsetY),
            stroke: '#111827',
            'stroke-width': 1.2,
            fill: 'none'
          })
      );
    });

    parts.push(
      '    ' +
        svgNodeToString('path', {
          d: renderApi.gluePath(geometry.glueFlapShape, offsetX, offsetY),
          stroke: '#111827',
          'stroke-width': 1.2,
          fill: 'none'
        })
    );

    geometry.foldLines.forEach(function (line) {
      parts.push(
        '    ' +
          svgNodeToString('line', {
            x1: line.x1 + offsetX,
            y1: line.y1 + offsetY,
            x2: line.x2 + offsetX,
            y2: line.y2 + offsetY,
            stroke: '#ef4444',
            'stroke-width': 1
          })
      );
    });

    parts.push('  </g>');
    parts.push('</svg>');
    return parts.join('\n');
  }

  function downloadSvg(filename, svgText) {
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function createSvgDomFromGeometry(geometry, renderApi) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const pad = 10;
    const width = geometry.bounds.maxX - geometry.bounds.minX + pad * 2;
    const height = geometry.bounds.maxY - geometry.bounds.minY + pad * 2;
    const offsetX = pad - geometry.bounds.minX;
    const offsetY = pad - geometry.bounds.minY;

    function createSvgEl(tagName, attrs) {
      const el = document.createElementNS(SVG_NS, tagName);
      Object.keys(attrs).forEach(function (key) {
        if (attrs[key] !== '' && attrs[key] !== null && attrs[key] !== undefined) {
          el.setAttribute(key, String(attrs[key]));
        }
      });
      return el;
    }

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('xmlns', SVG_NS);
    svg.setAttribute('width', width + 'mm');
    svg.setAttribute('height', height + 'mm');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

    const group = createSvgEl('g', { fill: 'none' });
    svg.appendChild(group);

    geometry.panels.forEach(function (p) {
      group.appendChild(
        createSvgEl('path', {
          d: renderApi.rectPath(p.x, p.y, p.w, p.h, offsetX, offsetY),
          fill: 'none',
          stroke: '#111827',
          'stroke-width': 1.2
        })
      );
    });

    geometry.topFlaps.forEach(function (f) {
      group.appendChild(
        createSvgEl('path', {
          d: renderApi.rectPath(f.x, f.y, f.w, f.h, offsetX, offsetY),
          fill: 'none',
          stroke: '#111827',
          'stroke-width': 1.2
        })
      );
    });

    geometry.bottomFlaps.forEach(function (f) {
      group.appendChild(
        createSvgEl('path', {
          d: renderApi.rectPath(f.x, f.y, f.w, f.h, offsetX, offsetY),
          fill: 'none',
          stroke: '#111827',
          'stroke-width': 1.2
        })
      );
    });

    group.appendChild(
      createSvgEl('path', {
        d: renderApi.gluePath(geometry.glueFlapShape, offsetX, offsetY),
        fill: 'none',
        stroke: '#111827',
        'stroke-width': 1.2
      })
    );

    geometry.foldLines.forEach(function (line) {
      group.appendChild(
        createSvgEl('line', {
          x1: line.x1 + offsetX,
          y1: line.y1 + offsetY,
          x2: line.x2 + offsetX,
          y2: line.y2 + offsetY,
          stroke: '#ef4444',
          'stroke-width': 1
        })
      );
    });

    return {
      svg: svg,
      width: width,
      height: height
    };
  }

  async function downloadPdf(filename, geometry, renderApi) {
    if (!global.jspdf || !global.jspdf.jsPDF) {
      throw new Error('jsPDF 未加载成功');
    }
    
    const svg2pdfFn =
      typeof global.svg2pdf === 'function'
        ? global.svg2pdf
        : global.svg2pdf && typeof global.svg2pdf.svg2pdf === 'function'
        ? global.svg2pdf.svg2pdf
        : null;
    
    if (!svg2pdfFn) {
      console.log('window.jspdf =', global.jspdf);
      console.log('window.svg2pdf =', global.svg2pdf);
      throw new Error('svg2pdf 未加载成功');
    }

    const built = createSvgDomFromGeometry(geometry, renderApi);
    const svg = built.svg;
    const width = built.width;
    const height = built.height;

    const jsPDF = global.jspdf.jsPDF;

    const pdf = new jsPDF({
      orientation: width >= height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [width, height]
    });

    // svg2pdf 需要节点在 DOM 中更稳
    const holder = document.createElement('div');
    holder.style.position = 'fixed';
    holder.style.left = '-10000px';
    holder.style.top = '-10000px';
    holder.style.opacity = '0';
    holder.appendChild(svg);
    document.body.appendChild(holder);

    try {
      await svg2pdfFn(svg, pdf, {
        xOffset: 0,
        yOffset: 0,
        scale: 1
      });
      pdf.save(filename);
    } finally {
      document.body.removeChild(holder);
    }
  }

  global.PackagingExport = {
    geometryToSvgText: geometryToSvgText,
    downloadSvg: downloadSvg,
    downloadPdf: downloadPdf
  };
})(window);