(function (global) {
  const meta = global.PackagingBoxTypeReverseInsertLockMeta;
  const formulas = global.PackagingBoxTypeReverseInsertLockFormulas;
  const resultBuilder = global.PackagingGeometryResultBuilder;

  function q(cx, cy, x, y) {
    return `Q ${cx},${cy} ${x},${y}`;
  }

  function l(x, y) {
    return `L ${x},${y}`;
  }

  function m(x, y) {
    return `M ${x},${y}`;
  }

  function a(rx, ry, rot, largeArcFlag, sweepFlag, x, y) {
    return `A ${rx},${ry} ${rot} ${largeArcFlag},${sweepFlag} ${x},${y}`;
  }

  function close() {
    return 'Z';
  }

  function clampRadius(r, maxValue) {
    return Math.max(0, Math.min(r, maxValue));
  }

  function build(input) {
    const d = formulas.derive(input);

    const x0 = 0;
    const x1 = x0 + d.G;
    const x2 = x1 + d.L;
    const x3 = x2 + d.W;
    const x4 = x3 + d.L;
    const x5 = x4 + d.W1;

    const yTop = 0;
    const yBottom = d.D;

    const yHT2Top = yTop - d.W2;
    const yHT1Top = yHT2Top - d.C;

    const yFB2Bottom = yBottom + d.W2;
    const yFB1Bottom = yFB2Bottom + d.C;

    const tongueR = clampRadius(d.CR || 6, Math.min(d.C * 0.28, d.L * 0.08));
    const bottomR = clampRadius((d.CR || 6) * 0.7, Math.min(d.C * 0.28, d.L * 0.12));
    const wingR = clampRadius(d.R || 4, Math.min(d.A * 0.18, d.W * 0.18));

    const ht2InsetL = Math.max(d.CX, d.E * 0.18);
    const ht2InsetR = Math.max(d.CX, d.E * 0.18);

    const ht1Left = x1 + ht2InsetL;
    const ht1Right = x2 - ht2InsetR;
    const r1 = clampRadius(tongueR, Math.min((ht1Right - ht1Left) / 2, d.C / 2));

    const fb1Left = x3 + Math.max(d.CX, d.E * 0.18);
    const fb1Right = x4 - Math.max(d.CX, d.E * 0.18);
    const r2 = clampRadius(bottomR, Math.min((fb1Right - fb1Left) / 2, d.C / 2));

    const upperJoinY = yTop + d.OF;
    const lowerJoinY = yBottom - d.OF;
    const glueOffset = d.G * Math.tan((d.GT * Math.PI) / 180);

    const glueFlapPath = [
      m(x1, lowerJoinY),
      l(x0, lowerJoinY - glueOffset),
      l(x0, upperJoinY + glueOffset),
      l(x1, upperJoinY),
      close()
    ].join(' ');

    const hBodyPath = [
      m(x1, yTop),
      l(x2, yTop),
      l(x2, yBottom),
      l(x1, yBottom),
      close()
    ].join(' ');

    const ht2Path = [
      m(x1, yTop),
      l(x2, yTop),
      l(x2, yHT2Top),
      l(x1, yHT2Top),
      close()
    ].join(' ');

    const ht1Path = [
      m(x1, yHT2Top),
      l(x1, yHT1Top + r1),
      q(x1, yHT1Top, x1 + r1, yHT1Top),
      l(x2 - r1, yHT1Top),
      q(x2, yHT1Top, x2, yHT1Top + r1),
      l(x2, yHT2Top),
      close()
    ].join(' ');

    const frBodyPath = [
      m(x2, yTop),
      l(x3, yTop),
      l(x3, yBottom),
      l(x2, yBottom),
      close()
    ].join(' ');

    const fBodyPath = [
      m(x3, yTop),
      l(x4, yTop),
      l(x4, yBottom),
      l(x3, yBottom),
      close()
    ].join(' ');

    const flBodyPath = [
      m(x4, yTop),
      l(x5, yTop),
      l(x5, yBottom),
      l(x4, yBottom),
      close()
    ].join(' ');

    // 左上翼：直边 + 平边 + 小圆角 + 斜边 + 短竖边
    const frtTopY = yTop - d.A;
    const frtStemH = Math.max(4, d.A * 0.14);
    const frtArcR = clampRadius(
      Math.min(d.A * 0.26, d.W * 0.16),
      Math.min(d.A * 0.34, d.W * 0.20)
    );
    const frtArcStartX = x3 - Math.max(d.W * 0.18, frtArcR + 4);
    const frtArcEndX = x3 - Math.max(d.W * 0.07, 4);
    const frtArcEndY = frtTopY + frtArcR;
    const frtShoulderY = yTop - frtStemH;

    const frtPath = [
      m(x2, yTop),
      l(x2, frtTopY),
      l(frtArcStartX, frtTopY),
      a(frtArcR, frtArcR, 0, 0, 1, frtArcEndX, frtArcEndY),
      l(x3, frtShoulderY),
      l(x3, yTop),
      close()
    ].join(' ');

    // 右上翼：与左上翼镜像
    const fltTopY = yTop - d.A;
    const fltStemH = Math.max(4, d.A * 0.14);
    const fltArcR = clampRadius(
      Math.min(d.A * 0.26, d.W1 * 0.16),
      Math.min(d.A * 0.34, d.W1 * 0.20)
    );

    // 右上翼的圆角应当是：从左下 -> 右上
    const fltArcStartX = x4 + Math.max(d.W1 * 0.07, 4);
    const fltArcStartY = fltTopY + fltArcR;
    const fltArcEndX   = x4 + Math.max(d.W1 * 0.18, fltArcR + 4);
    const fltArcEndY   = fltTopY;

    const fltShoulderY = yTop - fltStemH;

    const fltPath = [
      m(x4, yTop),
      l(x4, fltShoulderY),
      l(fltArcStartX, fltArcStartY),
      a(fltArcR, fltArcR, 0, 0, 1, fltArcEndX, fltArcEndY),
      l(x5, fltTopY),
      l(x5, yTop),
      close(),
    ].join(' ');

        // 左下翼：左上翼翻转（180°）
        const frbBotY = yBottom + d.A;
        const frbStemH = Math.max(4, d.A * 0.14);
        const frbArcR = clampRadius(
          Math.min(d.A * 0.26, d.W * 0.16),
          Math.min(d.A * 0.34, d.W * 0.20)
        );
    
        const frbArcStartX = x2 + Math.max(d.W * 0.18, frbArcR + 4);
        const frbArcEndX = x2 + Math.max(d.W * 0.07, 4);
        const frbArcEndY = frbBotY - frbArcR;
        const frbShoulderY = yBottom + frbStemH;
    
        const frbPath = [
          m(x3, yBottom),
          l(x3, frbBotY),
          l(frbArcStartX, frbBotY),
          a(frbArcR, frbArcR, 0, 0, 1, frbArcEndX, frbArcEndY),
          l(x2, frbShoulderY),
          l(x2, yBottom),
          close()
        ].join(' ');
    
        const fb2TopInset = Math.max(d.CX, d.E * 0.18);
        const fb2Path = [
          m(x3, yBottom),
          l(x4, yBottom),
          l(x4, yFB2Bottom),
          l(x3, yFB2Bottom),
          close()
        ].join(' ');
    
        const fb1Path = [
          m(x3, yBottom),
          l(x3, yFB1Bottom - r2),
          q(x3, yFB1Bottom, x3 + r2, yFB1Bottom),
          l(x4 - r2, yFB1Bottom),
          q(x4, yFB1Bottom, x4, yFB1Bottom - r2),
          l(x4, yBottom),
          close()
        ].join(' ');
    
        // 右下翼：右上翼翻转（180°）
        const flbBotY = yBottom + d.A;
        const flbStemH = Math.max(4, d.A * 0.14);
        const flbArcR = clampRadius(
          Math.min(d.A * 0.26, d.W1 * 0.16),
          Math.min(d.A * 0.34, d.W1 * 0.20)
        );

        const flbArcStartX = x5 - Math.max(d.W1 * 0.07, 4);
        const flbArcStartY = flbBotY - flbArcR;
        const flbArcEndX = x5 - Math.max(d.W1 * 0.18, flbArcR + 4);
        const flbArcEndY = flbBotY;
        const flbShoulderY = yBottom + flbStemH;

        const flbPath = [
          m(x5, yBottom),
          l(x5, flbShoulderY),
          l(flbArcStartX, flbArcStartY),
          a(flbArcR, flbArcR, 0, 0, 1, flbArcEndX, flbArcEndY),
          l(x4, flbBotY),
          l(x4, yBottom),
          close()
        ].join(' ');


        const foldLines = [
          { x1: x1, y1: yTop, x2: x5, y2: yTop },
        
          { x1: x1, y1: yBottom, x2: x3, y2: yBottom },
          { x1: x4, y1: yBottom, x2: x5, y2: yBottom },
        
          { x1: x2, y1: yTop, x2: x2, y2: yBottom },
          { x1: x3, y1: yTop, x2: x3, y2: yBottom },
          { x1: x4, y1: yTop, x2: x4, y2: yBottom },
        
          { x1: x1, y1: yHT2Top, x2: x2, y2: yHT2Top },
          { x1: x3, y1: yFB2Bottom, x2: x4, y2: yFB2Bottom }
        ];

    const minY = Math.min(yHT1Top, frtTopY, fltTopY) - 4;
    const maxY = Math.max(yFB1Bottom, yBottom + d.A) + 4;

    const bounds = {
      minX: x0 - 4,
      minY: minY,
      maxX: x5 + 4,
      maxY: maxY
    };

    const exportDimensions = {
      padding: { left: 48, top: 34, right: 46, bottom: 34 },
      horizontal: [
        { x1: x0, y1: yHT1Top, x2: x5, y2: yHT1Top, fromY: yHT1Top, lineY: yHT1Top - 20, label: (x5 - x0).toFixed(2).replace(/\.00$/, '') },
        { x1: x0, x2: x1, fromY: yFB1Bottom, lineY: yFB1Bottom + 20, label: d.G.toFixed(2).replace(/\.00$/, ''), textDy: 7 },
        { x1: x1, x2: x2, fromY: yFB1Bottom, lineY: yFB1Bottom + 20, label: d.L.toFixed(2).replace(/\.00$/, ''), textDy: 7 },
        { x1: x2, x2: x3, fromY: yFB1Bottom, lineY: yFB1Bottom + 20, label: d.W.toFixed(2).replace(/\.00$/, ''), textDy: 7 },
        { x1: x3, x2: x4, fromY: yFB1Bottom, lineY: yFB1Bottom + 20, label: d.L.toFixed(2).replace(/\.00$/, ''), textDy: 7 },
        { x1: x4, x2: x5, fromY: yFB1Bottom, lineY: yFB1Bottom + 20, label: d.W1.toFixed(2).replace(/\.00$/, ''), textDy: 7 }
      ],
      vertical: [
        { y1: yHT1Top, y2: yFB1Bottom, fromX: x5, lineX: x5 + 22, label: (yFB1Bottom - yHT1Top).toFixed(2).replace(/\.00$/, ''), textDx: 9, rotateText: false },
        { y1: yHT1Top, y2: yHT2Top, fromX: x0, lineX: x0 - 24, label: d.C.toFixed(2).replace(/\.00$/, '') },
        { y1: yHT2Top, y2: yTop, fromX: x0, lineX: x0 - 24, label: d.W2.toFixed(2).replace(/\.00$/, '') },
        { y1: yTop, y2: yBottom, fromX: x0, lineX: x0 - 24, label: d.D.toFixed(2).replace(/\.00$/, '') },
        { y1: yBottom, y2: yFB2Bottom, fromX: x0, lineX: x0 - 24, label: d.W2.toFixed(2).replace(/\.00$/, '') },
        { y1: yFB2Bottom, y2: yFB1Bottom, fromX: x0, lineX: x0 - 24, label: d.C.toFixed(2).replace(/\.00$/, '') }
      ]
    };

    return resultBuilder.buildResult(
      meta,
      input,
      {
        gap: '待定义',
        glueFlap: d.G.toFixed(2) + ' mm',
        flipcover: d.C.toFixed(2) + ' mm',
        glueFlapHeight: d.OF.toFixed(2) + ' mm',
        tolerance: input.tolerance || '待选择材料'
      },
      {
        exportDimensions: exportDimensions,
        outlinePaths: [
          glueFlapPath,
          hBodyPath,
          ht2Path,
          ht1Path,
          frBodyPath,
          fBodyPath,
          flBodyPath,
          frtPath,
          fltPath,
          frbPath,
          fb2Path,
          fb1Path,
          flbPath
        ],
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

  global.PackagingBoxTypeReverseInsertLockBuilder = {
    build: build
  };
})(window);