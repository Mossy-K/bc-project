/*
  导出功能：
  1. SVG：直接导出当前刀版线框图。
  2. PDF：生成带标题文字、刀版线稿与尺寸标注的单页 PDF。

  PDF 不依赖第三方库：先把排版后的 SVG 绘制到 canvas，再把 JPEG 写入一个
  单页 PDF 文件，保证中文标题在常见浏览器里可以正常输出。
*/
(function (global) {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function xmlEscape(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function formatNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value || '');
    return String(Math.round(n * 100) / 100).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
  }

  function svgTag(name, attrs, content) {
    const attrText = Object.keys(attrs || {})
      .filter(function (key) { return attrs[key] !== undefined && attrs[key] !== null && attrs[key] !== ''; })
      .map(function (key) { return key + '="' + xmlEscape(attrs[key]) + '"'; })
      .join(' ');
    if (content === undefined || content === null) {
      return '<' + name + (attrText ? ' ' + attrText : '') + ' />';
    }
    return '<' + name + (attrText ? ' ' + attrText : '') + '>' + content + '</' + name + '>';
  }

  function triggerDownload(filename, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function serializeCurrentSvg(svg) {
    if (!svg) throw new Error('没有找到可导出的 SVG 线框图');
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', SVG_NS);

    const viewBox = clone.getAttribute('viewBox') || '0 0 800 600';
    const parts = viewBox.split(/\s+/).map(Number);
    const w = Math.max(1, parts[2] || 800);
    const h = Math.max(1, parts[3] || 600);

    if (!clone.getAttribute('width')) clone.setAttribute('width', w + 'mm');
    if (!clone.getAttribute('height')) clone.setAttribute('height', h + 'mm');

    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  }

  function downloadSvg(filename, svgText) {
    triggerDownload(filename, new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
  }

  function rectPath(x, y, w, h) {
    return ['M', x, y, 'L', x + w, y, 'L', x + w, y + h, 'L', x, y + h, 'Z'].join(' ');
  }

  function polygonPath(points) {
    if (!points || !points.length) return '';
    return points.map(function (p, i) {
      return (i === 0 ? 'M ' : 'L ') + p.x + ' ' + p.y;
    }).join(' ') + ' Z';
  }

  function collectGeometryPaths(geometry) {
    const paths = [];
    (geometry.outlinePaths || []).forEach(function (d) { paths.push(d); });
    if (!paths.length) {
      (geometry.panels || []).forEach(function (r) { paths.push(rectPath(r.x, r.y, r.w, r.h)); });
      (geometry.topFlaps || []).forEach(function (r) { paths.push(rectPath(r.x, r.y, r.w, r.h)); });
      (geometry.bottomFlaps || []).forEach(function (r) { paths.push(rectPath(r.x, r.y, r.w, r.h)); });
      if (geometry.glueFlap && geometry.glueFlap.points) paths.push(polygonPath(geometry.glueFlap.points));
    }
    return paths;
  }

  function dimLine(x1, y1, x2, y2, label, labelX, labelY, rotate) {
    const color = '#2f62b3';
    const textAttrs = {
      x: labelX,
      y: labelY,
      fill: color,
      'font-size': 9,
      'font-family': 'Arial, Microsoft YaHei, sans-serif',
      'text-anchor': 'middle',
      'dominant-baseline': 'central'
    };
    if (rotate) textAttrs.transform = 'rotate(' + rotate + ' ' + labelX + ' ' + labelY + ')';
    return [
      svgTag('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: color, 'stroke-width': 0.7, 'marker-start': 'url(#arrow)', 'marker-end': 'url(#arrow)' }),
      svgTag('text', textAttrs, xmlEscape(label))
    ].join('\n');
  }

  function extLine(x1, y1, x2, y2) {
    return svgTag('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: '#2f62b3', 'stroke-width': 0.55 });
  }

  function buildDimensionSvgParts(dimensions) {
    if (!dimensions) return '';
    const parts = [];

    (dimensions.horizontal || []).forEach(function (d) {
      const y = d.lineY;
      const label = d.label || formatNumber(Math.abs(d.x2 - d.x1));
      parts.push(extLine(d.x1, d.fromY, d.x1, y));
      parts.push(extLine(d.x2, d.fromY, d.x2, y));
      parts.push(dimLine(d.x1, y, d.x2, y, label, (d.x1 + d.x2) / 2, y + (d.textDy || -7), 0));
    });

    (dimensions.vertical || []).forEach(function (d) {
      const x = d.lineX;
      const label = d.label || formatNumber(Math.abs(d.y2 - d.y1));
      parts.push(extLine(d.fromX, d.y1, x, d.y1));
      parts.push(extLine(d.fromX, d.y2, x, d.y2));
      parts.push(dimLine(x, d.y1, x, d.y2, label, x + (d.textDx || -9), (d.y1 + d.y2) / 2, d.rotateText === false ? 0 : -90));
    });

    return parts.join('\n');
  }

  function geometryToAnnotatedSvgText(geometry) {
    if (!geometry || !geometry.bounds) throw new Error('没有可导出的刀版几何数据');

    const dim = geometry.exportDimensions || {};
    const pad = dim.padding || { left: 36, top: 32, right: 44, bottom: 34 };
    const minX = geometry.bounds.minX - pad.left;
    const minY = geometry.bounds.minY - pad.top;
    const width = Math.max(1, geometry.bounds.maxX - geometry.bounds.minX + pad.left + pad.right);
    const height = Math.max(1, geometry.bounds.maxY - geometry.bounds.minY + pad.top + pad.bottom);

    const parts = [];
    parts.push('<?xml version="1.0" encoding="UTF-8"?>');
    parts.push('<svg xmlns="' + SVG_NS + '" width="' + width + 'mm" height="' + height + 'mm" viewBox="' + minX + ' ' + minY + ' ' + width + ' ' + height + '">');
    parts.push(svgTag('defs', {}, svgTag('marker', {
      id: 'arrow', markerWidth: 6, markerHeight: 6, refX: 3, refY: 3, orient: 'auto', markerUnits: 'strokeWidth'
    }, svgTag('path', { d: 'M 0 0 L 6 3 L 0 6 z', fill: '#2f62b3' }))));
    parts.push(svgTag('rect', { x: minX, y: minY, width: width, height: height, fill: '#ffffff' }));
    collectGeometryPaths(geometry).forEach(function (d) {
      parts.push(svgTag('path', { d: d, fill: 'none', stroke: '#000000', 'stroke-width': 0.85, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    });
    (geometry.foldLines || []).forEach(function (line) {
      parts.push(svgTag('line', { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, fill: 'none', stroke: '#e60012', 'stroke-width': 1.05, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    });
    parts.push(buildDimensionSvgParts(dim));
    parts.push('</svg>');
    return parts.join('\n');
  }

  function getExportInfo(result) {
    const input = result && result.input ? result.input : {};
    const meta = result && result.meta ? result.meta : {};
    const materialText = (input.gram ? input.gram + 'g' : '') + (input.material || '未选择材质');
    const dieSize = [input.length, input.width, input.height].map(formatNumber).join('*') + 'mm';
    return {
      title: '彩盒，结构为' + (meta.name || input.boxType || '未选择盒型') + '，材质为' + materialText + '，彩印覆哑膜，刀模尺寸为' + dieSize,
      structure: meta.name || input.boxType || '',
      material: materialText,
      dieSize: dieSize
    };
  }

  function svgTextToImage(svgText) {
    return new Promise(function (resolve, reject) {
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('SVG 转图片失败'));
      };
      img.src = url;
    });
  }

  function binaryStringFromBase64(base64) {
    return atob(base64);
  }

  function makePdfFromJpegDataUrl(dataUrl, pageW, pageH, imageW, imageH) {
    const base64 = dataUrl.split(',')[1];
    const imageBinary = binaryStringFromBase64(base64);
    const objects = [];
    function addObject(str) { objects.push(str); }

    const content = 'q\n' + pageW + ' 0 0 ' + pageH + ' 0 0 cm\n/Im1 Do\nQ\n';
    addObject('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    addObject('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
    addObject('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageW + ' ' + pageH + '] /Resources << /XObject << /Im1 5 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 4 0 R >>\nendobj\n');
    addObject('4 0 obj\n<< /Length ' + content.length + ' >>\nstream\n' + content + 'endstream\nendobj\n');
    addObject('5 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + Math.round(pageW * 4) + ' /Height ' + Math.round(pageH * 4) + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + imageBinary.length + ' >>\nstream\n' + imageBinary + '\nendstream\nendobj\n');

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach(function (obj) {
      offsets.push(pdf.length);
      pdf += obj;
    });
    const xrefOffset = pdf.length;
    pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i < offsets.length; i += 1) {
      pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';

    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: 'application/pdf' });
  }

  async function downloadPdf(filename, result) {
    if (!result || !result.geometry) throw new Error('没有可导出的刀版数据');

    const pageWmm = 297;
    const pageHmm = 210;
    const pxPerMm = 4;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(pageWmm * pxPerMm);
    canvas.height = Math.round(pageHmm * pxPerMm);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const info = getExportInfo(result);
    ctx.fillStyle = '#2f62b3';
    ctx.font = 'bold 18px Arial, Microsoft YaHei, sans-serif';
    ctx.textBaseline = 'top';
    wrapCanvasText(ctx, info.title, 18 * pxPerMm, 12 * pxPerMm, canvas.width - 36 * pxPerMm, 30);

    const diagramSvg = geometryToAnnotatedSvgText(result.geometry);
    const img = await svgTextToImage(diagramSvg);

    const boxX = 14 * pxPerMm;
    const boxY = 42 * pxPerMm;
    const boxW = canvas.width - 28 * pxPerMm;
    const boxH = canvas.height - 54 * pxPerMm;
    const ratio = Math.min(boxW / img.width, boxH / img.height);
    const drawW = img.width * ratio;
    const drawH = img.height * ratio;
    const drawX = boxX + (boxW - drawW) / 2;
    const drawY = boxY + (boxH - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    const jpeg = canvas.toDataURL('image/jpeg', 0.92);
    const pageWpt = pageWmm * 72 / 25.4;
    const pageHpt = pageHmm * 72 / 25.4;
    const pdfBlob = makePdfFromJpegDataUrl(jpeg, pageWpt.toFixed(2), pageHpt.toFixed(2), canvas.width, canvas.height);
    triggerDownload(filename, pdfBlob);
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    let line = '';
    let currentY = y;
    for (let i = 0; i < text.length; i += 1) {
      const test = line + text[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = text[i];
        currentY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, currentY);
  }

  global.PackagingExport = {
    serializeCurrentSvg: serializeCurrentSvg,
    geometryToAnnotatedSvgText: geometryToAnnotatedSvgText,
    downloadSvg: downloadSvg,
    downloadPdf: downloadPdf
  };
})(window);
