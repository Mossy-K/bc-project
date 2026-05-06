(function () {
  const els = {
    boxType: document.getElementById('boxType'),
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    material: document.getElementById('material'),
    thickness: document.getElementById('thickness'),

    gapVal: document.getElementById('gapVal'),
    glueVal: document.getElementById('glueVal'),
    flipVal: document.getElementById('flipVal'),
    glueHeightVal: document.getElementById('glueHeightVal'),
    toleranceVal: document.getElementById('toleranceVal'),

    previewSvg: document.getElementById('previewSvg'),
    isoSvg: document.getElementById('isoSvg'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  const materialConfig = Array.isArray(window.PackagingMaterialConfig)
    ? window.PackagingMaterialConfig
    : [];

  let currentResult = null;

  function num(value) {
    return Number(value) || 0;
  }

  function clearOptions(selectEl) {
    while (selectEl && selectEl.firstChild) {
      selectEl.removeChild(selectEl.firstChild);
    }
  }

  function addOption(selectEl, value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    selectEl.appendChild(option);
    return option;
  }

  function getMaterialByName(name) {
    return materialConfig.find(function (item) {
      return item.name === name;
    }) || null;
  }

  function getSelectedMaterial() {
    return els.material ? getMaterialByName(els.material.value) : null;
  }

  function getSelectedThicknessItem() {
    const material = getSelectedMaterial();
    if (!material || !els.thickness) return null;

    const index = Number(els.thickness.value);
    if (!Number.isInteger(index)) return null;

    return material.items[index] || null;
  }

  function fillMaterialOptions() {
    if (!els.material) return;

    clearOptions(els.material);
    addOption(els.material, '', '-- 请选择材料 --');

    materialConfig.forEach(function (material) {
      addOption(els.material, material.name, material.name);
    });
  }

  function fillThicknessOptions() {
    if (!els.thickness) return;

    clearOptions(els.thickness);

    const material = getSelectedMaterial();
    if (!material) {
      addOption(els.thickness, '', '-- 请先选择材料 --');
      return;
    }

    addOption(els.thickness, '', '-- 请选择厚度 --');

    material.items.forEach(function (item, index) {
      addOption(
        els.thickness,
        String(index),
        item.thickness + ' mm（' + item.gram + 'g）'
      );
    });
  }

  function getMaterialToleranceText() {
    const material = getSelectedMaterial();
    if (!material) return '待选择材料';
    return material.tolerance || '表格未标注';
  }

  function getInputParams() {
    const material = getSelectedMaterial();
    const thicknessItem = getSelectedThicknessItem();
    const thicknessValue = thicknessItem ? Number(thicknessItem.thicknessValue) : 0.5;

    return {
      boxType: els.boxType ? els.boxType.value : 'regular-carton',
      length: num(els.length.value),
      width: num(els.width.value),
      height: num(els.height.value),
      material: material ? material.name : '',
      gram: thicknessItem ? thicknessItem.gram : '',
      thickness: thicknessItem ? thicknessItem.thickness : '',
      thicknessValue: thicknessValue,
      tolerance: getMaterialToleranceText(),
      // 这里不是材料表数据，只是现有盒型公式保留的默认结构参数。
      innerLoss: 0.3,
      outerGain: 0.2
    };
  }

  function renderPlaceholder(svg, title, lines) {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    svg.setAttribute('viewBox', '0 0 800 600');

    const ns = 'http://www.w3.org/2000/svg';

    function el(name, attrs) {
      const node = document.createElementNS(ns, name);
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, String(attrs[key]));
      });
      return node;
    }

    svg.appendChild(el('rect', {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      fill: '#ffffff'
    }));

    svg.appendChild(el('rect', {
      x: 40,
      y: 40,
      width: 720,
      height: 520,
      rx: 16,
      fill: '#f8fafc',
      stroke: '#cbd5e1',
      'stroke-width': 1.5,
      'stroke-dasharray': '8 6'
    }));

    const titleText = el('text', {
      x: 70,
      y: 110,
      fill: '#0f172a',
      'font-size': 28,
      'font-family': 'Arial, PingFang SC, Microsoft YaHei, sans-serif',
      'font-weight': '700'
    });
    titleText.textContent = title;
    svg.appendChild(titleText);

    lines.forEach(function (line, index) {
      const t = el('text', {
        x: 70,
        y: 170 + index * 44,
        fill: '#475569',
        'font-size': 22,
        'font-family': 'Arial, PingFang SC, Microsoft YaHei, sans-serif'
      });
      t.textContent = line;
      svg.appendChild(t);
    });
  }

  function updateDisplay(result) {
    if (!result || !result.display) {
      els.gapVal.textContent = '待定义';
      els.glueVal.textContent = '待定义';
      els.flipVal.textContent = '待定义';
      els.glueHeightVal.textContent = '待定义';
      els.toleranceVal.textContent = getMaterialToleranceText();
      return;
    }

    els.gapVal.textContent = result.display.gap || '待定义';
    els.glueVal.textContent = result.display.glueFlap || '待定义';
    els.flipVal.textContent = result.display.flipcover || '待定义';
    els.glueHeightVal.textContent = result.display.glueFlapHeight || '待定义';
    els.toleranceVal.textContent = result.display.tolerance || getMaterialToleranceText();
  }

  function update() {
    try {
      const input = getInputParams();

      if (!window.PackagingGeometry || typeof window.PackagingGeometry.buildByType !== 'function') {
        throw new Error('PackagingGeometry.buildByType 未加载成功');
      }

      const result = window.PackagingGeometry.buildByType(input.boxType, input);
      currentResult = result;
      updateDisplay(result);

      if (
        result &&
        result.geometry &&
        window.PackagingRender &&
        typeof window.PackagingRender.renderFlatPreview === 'function'
      ) {
        window.PackagingRender.renderFlatPreview(els.previewSvg, result.geometry);
      } else {
        renderPlaceholder(els.previewSvg, '刀版平面图占位区', [
          'geometry 或 renderFlatPreview 未准备好'
        ]);
      }

      if (
        result &&
        result.preview3d &&
        window.PackagingRender &&
        typeof window.PackagingRender.renderIsoPreview === 'function'
      ) {
        window.PackagingRender.renderIsoPreview(els.isoSvg, result.preview3d);
      } else {
        renderPlaceholder(els.isoSvg, '3D 预览占位区', [
          'preview3d 或 renderIsoPreview 未准备好'
        ]);
      }

      return result;
    } catch (error) {
      console.error(error);
      currentResult = null;

      updateDisplay(null);

      renderPlaceholder(els.previewSvg, '刀版平面图报错', [
        '请打开控制台查看报错信息',
        String(error && error.message ? error.message : error)
      ]);

      renderPlaceholder(els.isoSvg, '3D 预览报错', [
        '请打开控制台查看报错信息',
        String(error && error.message ? error.message : error)
      ]);
    }
  }

  function resetInputs() {
    if (els.boxType) els.boxType.value = 'regular-carton';
    els.length.value = '180';
    els.width.value = '80';
    els.height.value = '45';
    if (els.material) els.material.value = '';
    fillThicknessOptions();
    update();
  }

  function bindEvents() {
    [els.boxType, els.length, els.width, els.height].forEach(function (inputEl) {
      if (!inputEl) return;
      inputEl.addEventListener('input', update);
      inputEl.addEventListener('change', update);
    });

    if (els.material) {
      els.material.addEventListener('change', function () {
        fillThicknessOptions();
        update();
      });
    }

    if (els.thickness) {
      els.thickness.addEventListener('change', update);
    }

    if (els.downloadBtn) {
      els.downloadBtn.addEventListener('click', function () {
        try {
          if (!window.PackagingExport || typeof window.PackagingExport.serializeCurrentSvg !== 'function') {
            throw new Error('导出模块未加载成功');
          }
          const svgText = window.PackagingExport.serializeCurrentSvg(els.previewSvg);
          window.PackagingExport.downloadSvg('packaging-dieline.svg', svgText);
        } catch (error) {
          console.error(error);
          alert(error && error.message ? error.message : 'SVG 导出失败');
        }
      });
    }

    if (els.downloadPdfBtn) {
      els.downloadPdfBtn.addEventListener('click', function () {
        Promise.resolve()
          .then(function () {
            if (!window.PackagingExport || typeof window.PackagingExport.downloadPdf !== 'function') {
              throw new Error('PDF 导出模块未加载成功');
            }
            const result = currentResult || update();
            if (!result || !result.geometry) {
              throw new Error('没有可导出的刀版数据');
            }
            return window.PackagingExport.downloadPdf('packaging-dieline.pdf', result);
          })
          .catch(function (error) {
            console.error(error);
            alert(error && error.message ? error.message : 'PDF 导出失败');
          });
      });
    }

    if (els.resetBtn) {
      els.resetBtn.addEventListener('click', resetInputs);
    }
  }

  fillMaterialOptions();
  fillThicknessOptions();
  bindEvents();
  update();
})();
