(function (global) {
    const M = global.PackagingGeometryMath;
  
    function derive(input) {
      const L = Number(input.length) || 0;
      const W = Number(input.width) || 0;
      const D = Number(input.height) || 0;
  
      // 当前先保留一个可运行版本：
      // 厚度先从 thicknessValue 取；如果没有，就给默认 0.5
      const CCAL = Number(input.thicknessValue) || 0.5;
      const IIL = Number(input.innerLoss) || 0.3;
      const OOG = Number(input.outerGain) || 0.2;
  
      const W1 = M.round(W - (CCAL <= 0.5 ? 0.6 : CCAL <= 1 ? 4.2 : CCAL <= 2 ? 8.5 : 3), 2);
      const OF = M.round(Math.min(Math.round((2 * CCAL / 3) * 10) / 10, Math.round(CCAL * 2) / 2), 2);
      const R = M.round(Math.min(Math.round(CCAL * 2) / 2, 3), 2);
  
      const totalWidth = L + L + W + W1;
      let G = 13;
      if (totalWidth > 250) G = 16;
      if (totalWidth > 500) G = 19;
      if (totalWidth > 600) G = 25;
      if (totalWidth > 700) G = 35;
      if (totalWidth > 800) G = 45;
      G = M.clamp(G, 10, Math.max(10, W1 - 1));
  
      const GT = M.round(Math.min(45, Math.atan((D / 2 - OF) / Math.max(G, 0.001)) * 180 / Math.PI), 2);
  
      let F = W / 2;
      if (CCAL <= 0.8) F = W / 2 + 0.5;
      else if (CCAL <= 2) F = W / 2 + 1;
      else if (CCAL <= 3) F = Math.ceil((W / 2 + 0.5) * 10) / 10;
      else if (CCAL <= 5) F = Math.ceil((W / 2 + 1) * 10) / 10;
      else if (CCAL <= 7) F = W / 2 + Math.min(Math.round((CCAL / 4) * 10) / 10, 3);
      F = M.clamp(F, CCAL >= 1.5 ? 15 : 10, W - CCAL);
  
      const F1 = M.clamp(W <= L ? F + OF : L / 2, 10, Math.min(F + OF, L - CCAL));
  
      return {
        L: L,
        W: W,
        D: D,
        CCAL: CCAL,
        IIL: IIL,
        OOG: OOG,
        W1: M.round(W1, 2),
        OF: M.round(OF, 2),
        R: M.round(R, 2),
        G: M.round(G, 2),
        GT: M.round(GT, 2),
        F: M.round(F, 2),
        F1: M.round(F1, 2)
      };
    }
  
    global.PackagingBoxTypeRegularCartonFormulas = {
      derive: derive
    };
  })(window);