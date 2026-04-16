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
      const bottomR = clampRadius((d.CR || 6) * 0.7, Math.min(d.C * 0.18, d.L * 0.08));
      const wingR = clampRadius(d.R || 4, Math.min(d.A * 0.18, d.W * 0.18));
  
      //const glueTopOffset = Math.max(6, d.G * 0.22);
      //const glueBottomOffset = Math.max(6, d.G * 0.18);
  
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
        m(ht1Left, yHT2Top),
        l(ht1Left, yHT1Top + r1),
        q(ht1Left, yHT1Top, ht1Left + r1, yHT1Top),
        l(ht1Right - r1, yHT1Top),
        q(ht1Right, yHT1Top, ht1Right, yHT1Top + r1),
        l(ht1Right, yHT2Top),
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
  
      const frtBaseLeft = x2;
      const frtBaseRight = x3;
      const frtTopY = yTop - d.A;
      const frtNotchX = x2 + d.AX;
      const frtShoulderX = x2 + d.AXX;
      const frtRightInset = Math.max(4, d.AR * 0.7);
      const frtRightTopX = x3 - frtRightInset;
      const frtRightShoulderY = yTop - Math.max(6, d.A * 0.18);
  
      const frtPath = [
        m(frtBaseLeft, yTop),
        l(frtNotchX, yTop),
        l(frtShoulderX, frtTopY + wingR),
        q(frtShoulderX, frtTopY, frtShoulderX + wingR, frtTopY),
        l(frtRightTopX - wingR, frtTopY),
        q(frtRightTopX, frtTopY, frtRightTopX, frtTopY + wingR),
        l(x3, frtRightShoulderY),
        l(x3, yTop),
        close()
      ].join(' ');
  
      const fltTopY = yTop - d.A * 0.72;
      const fltInsetLeft = Math.max(6, d.AX1 + d.AR * 0.4);
      const fltTopLeftX = x4 + fltInsetLeft;
      const fltShoulderY = yTop - Math.max(8, d.A * 0.25);
  
      const fltPath = [
        m(x4, yTop),
        l(fltTopLeftX, fltShoulderY),
        l(fltTopLeftX + wingR, fltTopY),
        l(x5, fltTopY),
        l(x5, yTop),
        close()
      ].join(' ');
  
      const frbPath = [
        m(x2, yBottom),
        l(x3 - Math.max(6, d.AX1), yBottom),
        l(x3 - Math.max(8, d.AX1 + 4), yBottom + d.A * 0.72),
        q(x3 - Math.max(8, d.AX1 + 4), yBottom + d.A, x3 - Math.max(16, d.AX1 + 10), yBottom + d.A),
        l(x2 + Math.max(10, d.AX * 0.9), yBottom + d.A),
        l(x2, yBottom + Math.max(8, d.A * 0.32)),
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
        m(fb1Left, yFB2Bottom),
        l(fb1Left, yFB1Bottom - r2),
        q(fb1Left, yFB1Bottom, fb1Left + r2, yFB1Bottom),
        l(fb1Right - r2, yFB1Bottom),
        q(fb1Right, yFB1Bottom, fb1Right, yFB1Bottom - r2),
        l(fb1Right, yFB2Bottom),
        close()
      ].join(' ');
  
      const flbPath = [
        m(x4, yBottom),
        l(x5, yBottom),
        l(x5 - Math.max(6, d.AX1), yBottom + Math.max(8, d.A * 0.28)),
        l(x5 - Math.max(10, d.AX1 + 4), yBottom + d.A),
        l(x4 + Math.max(14, d.AX1 + 8), yBottom + d.A),
        q(x4 + Math.max(8, d.AX1 + 4), yBottom + d.A, x4 + Math.max(8, d.AX1 + 4), yBottom + d.A * 0.72),
        l(x4, yBottom),
        close()
      ].join(' ');
  
      const foldLines = [
        { x1: x1, y1: yTop, x2: x5, y2: yTop },
        { x1: x1, y1: yBottom, x2: x5, y2: yBottom },
  
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
  
      return resultBuilder.buildResult(
        meta,
        input,
        {
          gap: '待定义',
          glueFlap: d.G.toFixed(2) + ' mm',
          flipcover: d.C.toFixed(2) + ' mm',
          glueFlapHeight: d.OF.toFixed(2) + ' mm',
          tolerance: '待配置'
        },
        {
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