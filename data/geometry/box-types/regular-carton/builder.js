(function (global) {
    const meta = global.PackagingBoxTypeRegularCartonMeta;
    const formulas = global.PackagingBoxTypeRegularCartonFormulas;
    const resultBuilder = global.PackagingGeometryResultBuilder;
  
    function build(input) {
      const d = formulas.derive(input);
  
      const x0 = 0;
      const x1 = x0 + d.G;
      const x2 = x1 + d.L;
      const x3 = x2 + d.W;
      const x4 = x3 + d.L;
      const x5 = x4 + d.W1;
  
      const topH = Math.max(d.F, d.F1 - d.OF);
      const y0 = 0;
      const y1 = y0 + topH;
      const y2 = y1 + d.D;
      const y3 = y2 + d.F;
  
      const panels = [
        { name: 'H', x: x1, y: y1, w: d.L, h: d.D },
        { name: 'FR', x: x2, y: y1, w: d.W, h: d.D },
        { name: 'F', x: x3, y: y1, w: d.L, h: d.D },
        { name: 'FL', x: x4, y: y1, w: d.W1, h: d.D }
      ];
  
      const topFlaps = [
        { name: 'HT', x: x1, y: y1 - d.F, w: d.L, h: d.F },
        { name: 'FRT', x: x2, y: y1 - d.F1 + d.OF, w: d.W, h: d.F1 },
        { name: 'FT', x: x3, y: y1 - d.F, w: d.L, h: d.F },
        { name: 'FLT', x: x4, y: y1 - d.F1 + d.OF, w: d.W1, h: d.F1 }
      ];
  
      const bottomFlaps = [
        { name: 'HB', x: x1, y: y2, w: d.L, h: d.F },
        { name: 'FRB', x: x2, y: y2 - d.OF, w: d.W, h: d.F1 },
        { name: 'FB', x: x3, y: y2, w: d.L, h: d.F },
        { name: 'FLB', x: x4, y: y2 - d.OF, w: d.W1, h: d.F1 }
      ];
  
      const glueFlap = {
        name: 'HL',
        points: [
          { x: x1, y: y1 },
          { x: x0, y: y1 - d.G * Math.tan((d.GT * Math.PI) / 180) },
          { x: x0, y: y2 + d.G * Math.tan((d.GT * Math.PI) / 180) },
          { x: x1, y: y2 }
        ]
      };
  
      const foldLines = [
        { x1: x1, y1: y1, x2: x5, y2: y1 },
        { x1: x1, y1: y2, x2: x5, y2: y2 },
        { x1: x2, y1: y1, x2: x2, y2: y2 },
        { x1: x3, y1: y1, x2: x3, y2: y2 },
        { x1: x4, y1: y1, x2: x4, y2: y2 }
      ];
  
      const bounds = {
        minX: x0,
        minY: Math.min(y1 - d.F, y1 - d.F1 + d.OF),
        maxX: x5,
        maxY: Math.max(y2 + d.F, y2 - d.OF + d.F1)
      };

      const topY = bounds.minY;
      const bottomY = bounds.maxY;
      const exportDimensions = {
        padding: { left: 48, top: 34, right: 46, bottom: 34 },
        horizontal: [
          { x1: x0, y1: topY, x2: x5, y2: topY, fromY: topY, lineY: topY - 20, label: (x5 - x0).toFixed(2).replace(/\.00$/, '') },
          { x1: x0, x2: x1, fromY: bottomY, lineY: bottomY + 20, label: d.G.toFixed(2).replace(/\.00$/, ''), textDy: 7 },
          { x1: x1, x2: x2, fromY: bottomY, lineY: bottomY + 20, label: d.L.toFixed(2).replace(/\.00$/, ''), textDy: 7 },
          { x1: x2, x2: x3, fromY: bottomY, lineY: bottomY + 20, label: d.W.toFixed(2).replace(/\.00$/, ''), textDy: 7 },
          { x1: x3, x2: x4, fromY: bottomY, lineY: bottomY + 20, label: d.L.toFixed(2).replace(/\.00$/, ''), textDy: 7 },
          { x1: x4, x2: x5, fromY: bottomY, lineY: bottomY + 20, label: d.W1.toFixed(2).replace(/\.00$/, ''), textDy: 7 }
        ],
        vertical: [
          { y1: topY, y2: bottomY, fromX: x5, lineX: x5 + 22, label: (bottomY - topY).toFixed(2).replace(/\.00$/, ''), textDx: 9, rotateText: false },
          { y1: y1 - d.F, y2: y1, fromX: x0, lineX: x0 - 24, label: d.F.toFixed(2).replace(/\.00$/, '') },
          { y1: y1, y2: y2, fromX: x0, lineX: x0 - 24, label: d.D.toFixed(2).replace(/\.00$/, '') },
          { y1: y2, y2: y2 + d.F, fromX: x0, lineX: x0 - 24, label: d.F.toFixed(2).replace(/\.00$/, '') }
        ]
      };
  
      return resultBuilder.buildResult(
        meta,
        input,
        {
          gap: '待定义',
          glueFlap: d.G.toFixed(2) + ' mm',
          flipcover: d.F.toFixed(2) + ' mm',
          glueFlapHeight: d.F1.toFixed(2) + ' mm',
          tolerance: input.tolerance || '待选择材料'
        },
        {
          exportDimensions: exportDimensions,
          panels: panels,
          topFlaps: topFlaps,
          bottomFlaps: bottomFlaps,
          glueFlap: glueFlap,
          foldLines: foldLines,
          bounds: bounds
        },
        {
          length: d.L,
          width: d.W,
          height: d.D
        }
      );
    }
  
    global.PackagingBoxTypeRegularCartonBuilder = {
      build: build
    };
  })(window);