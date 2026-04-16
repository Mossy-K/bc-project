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
  
      return resultBuilder.buildResult(
        meta,
        input,
        {
          gap: '待定义',
          glueFlap: d.G.toFixed(2) + ' mm',
          flipcover: d.F.toFixed(2) + ' mm',
          glueFlapHeight: d.F1.toFixed(2) + ' mm',
          tolerance: '待配置'
        },
        {
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