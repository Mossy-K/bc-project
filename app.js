/*
  这个文件是“总控台”。
  它负责：
  1. 读取页面输入
  2. 调用 geometry.js 计算数据
  3. 调用 render.js 更新预览
  4. 调用 export.js 导出 SVG / PDF
  5. 做一些简单自检
*/

(function () {
  const els = {
    length: document.getElementById('length'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    thickness: document.getElementById('thickness'),
    gapVal: document.getElementById('gapVal'),
    glueVal: document.getElementById('glueVal'),
    flipVal: document.getElementById('flipVal'),
    glueHeightVal: document.getElementById('glueHeightVal'),
    previewSvg: document.getElementById('previewSvg'),
    isoSvg: document.getElementById('isoSvg'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  function num(value) {
    return Number(value) || 0;
  }

  function getInputParams() {
    return {
      length: num(els.length.value),
      width: num(els.width.value),
      height: num(els.height.value),
      thickness: num(els.thickness.value)
    };
  }

  function updateStats(box) {
    els.gapVal.textContent = box.gap.toFixed(2) + ' mm';
    els.glueVal.textContent = box.glueFlap.toFixed(2) + ' mm';
    els.flipVal.textContent = box.flipcover.toFixed(2) + ' mm';
    els.glueHeightVal.textContent = box.glueFlapHeight.toFixed(2) + ' mm';
  }

  function update() {
    const input = getInputParams();
    const box = window.PackagingGeometry.deriveBoxParams(input);
    const geometry = window.PackagingGeometry.buildGeometry(box);

    updateStats(box);
    window.PackagingRender.renderFlatPreview(els.previewSvg, geometry);
    window.PackagingRender.renderIsoPreview(els.isoSvg, input);

    return {
      input: input,
      box: box,
      geometry: geometry
    };
  }

  function resetInputs() {
    els.length.value = '180';
    els.width.value = '80';
    els.height.value = '45';
    els.thickness.value = '2';
    update();
  }

  function bindEvents() {
    [els.length, els.width, els.height, els.thickness].forEach(function (inputEl) {
      inputEl.addEventListener('input', update);
    });

    els.downloadBtn.addEventListener('click', function () {
      const result = update();
      const svgText = window.PackagingExport.geometryToSvgText(
        result.geometry,
        window.PackagingRender
      );
      window.PackagingExport.downloadSvg('dieline-direct-draw.svg', svgText);
    });

    els.downloadPdfBtn.addEventListener('click', async function () {
      try {
        const result = update();
        await window.PackagingExport.downloadPdf(
          'dieline-direct-draw.pdf',
          result.geometry,
          window.PackagingRender
        );
      } catch (error) {
        console.error(error);
        alert('PDF 导出失败：' + error.message);
      }
    });

    els.resetBtn.addEventListener('click', resetInputs);
  }

  function runSelfTests() {
    const sample = window.PackagingGeometry.deriveBoxParams({
      length: 180,
      width: 80,
      height: 45,
      thickness: 2
    });

    console.assert(sample.flipcover === 23.5, 'flipcover 计算错误');
    console.assert(sample.gap === 3, 'gap 计算错误');
    console.assert(sample.glueFlap === 20, 'glueFlap 计算错误');

    const geo = window.PackagingGeometry.buildGeometry(sample);
    console.assert(geo.panels.length === 4, 'panels 数量错误');
    console.assert(geo.topFlaps.length === 4, 'topFlaps 数量错误');
    console.assert(geo.bottomFlaps.length === 4, 'bottomFlaps 数量错误');
    console.assert(geo.foldLines.length === 5, 'foldLines 数量错误');

    const svgText = window.PackagingExport.geometryToSvgText(
      geo,
      window.PackagingRender
    );
    console.assert(svgText.indexOf('<svg') !== -1, 'SVG 文本缺少 svg 标签');
    console.assert(svgText.indexOf('<path') !== -1, 'SVG 文本缺少 path 标签');
    console.assert(svgText.indexOf('<line') !== -1, 'SVG 文本缺少 line 标签');
  }

  bindEvents();
  runSelfTests();
  update();
})();