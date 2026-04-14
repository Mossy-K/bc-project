/*
  这个文件只负责“包装规则”和“几何计算”。
  以后你想改盒型逻辑、gap 算法、糊口规则，主要改这里。

  核心思路：
  1. 输入长宽高厚
  2. 先算派生参数
  3. 再生成结构件：主体面、盖片、糊口、压线
*/

(function (global) {
  function deriveBoxParams(input) {
    const L = Number(input.length) || 0;
    const W = Number(input.width) || 0;
    const H = Number(input.height) || 0;
    const T = Number(input.thickness) || 0;

    // 这里保留你原来 Blender 逻辑里的经验规则
    const flipcover = H / 2 + T / 2;

    let gap = 6;
    if (T > 8) gap = T;
    else if (T > 3) gap = 6;
    else gap = 3;

    let glueFlap = 30;
    if (T <= 2) glueFlap = 20;
    else if (T <= 4) glueFlap = 30;
    else glueFlap = 45;

    const glueFlapHeight = glueFlap * Math.tan(15 * Math.PI / 180);

    return {
      L: L,
      W: W,
      H: H,
      T: T,
      flipcover: flipcover,
      gap: gap,
      glueFlap: glueFlap,
      glueFlapHeight: glueFlapHeight
    };
  }

  function buildGeometry(box) {
    const L = box.L;
    const W = box.W;
    const H = box.H;
    const T = box.T;
    const flipcover = box.flipcover;
    const gap = box.gap;
    const glueFlap = box.glueFlap;
    const glueFlapHeight = box.glueFlapHeight;

    // 防止出现负数宽度
    const side2Width = Math.max(H - T, 1);

    // 主体四个面
    const panels = [
      { name: 'front', x: 0, y: flipcover, w: L, h: W },
      { name: 'side1', x: L + gap, y: flipcover, w: H, h: W },
      { name: 'back', x: L + gap + H + gap, y: flipcover, w: L, h: W },
      { name: 'side2', x: L + gap + H + gap + L + gap, y: flipcover, w: side2Width, h: W }
    ];

    // 上盖片
    const topFlaps = panels.map(function (panel) {
      return {
        name: panel.name + '-top',
        x: panel.x,
        y: 0,
        w: panel.w,
        h: flipcover
      };
    });

    // 下盖片
    const bottomFlaps = panels.map(function (panel) {
      return {
        name: panel.name + '-bottom',
        x: panel.x,
        y: flipcover + W,
        w: panel.w,
        h: flipcover
      };
    });

    // 左侧糊口
    const glueFlapShape = {
      x: -glueFlap,
      y1: flipcover + glueFlapHeight,
      y2: flipcover + W - glueFlapHeight,
      attachX: 0,
      attachTopY: flipcover,
      attachBottomY: flipcover + W
    };

    // 压线
    const bodyRight = panels[3].x + panels[3].w;
    const foldLines = [
      { x1: 0, y1: flipcover, x2: bodyRight, y2: flipcover },
      { x1: 0, y1: flipcover + W, x2: bodyRight, y2: flipcover + W },
      { x1: panels[0].x + panels[0].w, y1: flipcover, x2: panels[0].x + panels[0].w, y2: flipcover + W },
      { x1: panels[1].x + panels[1].w, y1: flipcover, x2: panels[1].x + panels[1].w, y2: flipcover + W },
      { x1: panels[2].x + panels[2].w, y1: flipcover, x2: panels[2].x + panels[2].w, y2: flipcover + W }
    ];

    // 计算整体边界，方便自动缩放预览
    const allX = [];
    const allY = [];

    panels.forEach(function (p) {
      allX.push(p.x, p.x + p.w);
      allY.push(p.y, p.y + p.h);
    });

    topFlaps.forEach(function (f) {
      allX.push(f.x, f.x + f.w);
      allY.push(f.y, f.y + f.h);
    });

    bottomFlaps.forEach(function (f) {
      allX.push(f.x, f.x + f.w);
      allY.push(f.y, f.y + f.h);
    });

    allX.push(glueFlapShape.x, glueFlapShape.attachX);
    allY.push(glueFlapShape.y1, glueFlapShape.y2, glueFlapShape.attachTopY, glueFlapShape.attachBottomY);

    return {
      panels: panels,
      topFlaps: topFlaps,
      bottomFlaps: bottomFlaps,
      glueFlapShape: glueFlapShape,
      foldLines: foldLines,
      bounds: {
        minX: Math.min.apply(null, allX),
        minY: Math.min.apply(null, allY),
        maxX: Math.max.apply(null, allX),
        maxY: Math.max.apply(null, allY)
      },
      meta: {
        gap: gap,
        glueFlap: glueFlap,
        flipcover: flipcover,
        glueFlapHeight: glueFlapHeight
      }
    };
  }

  // 暴露到全局，给 app.js 使用
  global.PackagingGeometry = {
    deriveBoxParams: deriveBoxParams,
    buildGeometry: buildGeometry
  };
})(window);