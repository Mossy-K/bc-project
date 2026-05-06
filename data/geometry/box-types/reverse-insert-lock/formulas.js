(function (global) {
    const M = global.PackagingGeometryMath;
  
    function roundTo(value, step) {
      if (!step) return value;
      return Math.round(value / step) * step;
    }
  
    function roundDownTo(value, step) {
      if (!step) return value;
      return Math.floor(value / step) * step;
    }
  
    function roundUpTo(value, step) {
      if (!step) return value;
      return Math.ceil(value / step) * step;
    }
  
    // 模拟原始 STEP(value, a,b,c,d,...) 的行为：
    // 小于等于阈值时返回对应值，否则继续往后
    function stepValue(value, defaultValue, threshold1, result1, threshold2, result2, threshold3, result3, threshold4, result4, threshold5, result5) {
      if (arguments.length >= 4 && value <= threshold1) return result1;
      if (arguments.length >= 6 && value <= threshold2) return result2;
      if (arguments.length >= 8 && value <= threshold3) return result3;
      if (arguments.length >= 10 && value <= threshold4) return result4;
      if (arguments.length >= 12 && value <= threshold5) return result5;
      return defaultValue;
    }
  
    function calcCCAL(L, W, D) {
      let result = 0.5;
  
      if (L > 160 && L <= 210) {
        if (D >= W / 3) {
          result = (W > 30 && W <= 80) ? 3 : (W > 8 && W <= 30 ? 0.5 : 3);
        } else {
          result = (W > 8 && W <= 30) ? 3 : 2;
        }
      } else if (L > 60 && L <= 160) {
        result = (L / W <= 2.5 && D >= W / 3) ? 1 : 0.5;
      } else if (L > 40 && L <= 60) {
        result = 0.5;
      } else if (L <= 40) {
        if (L / W <= 2.5) {
          result = (W > 30 && W <= 80) ? 3 : (W > 8 && W <= 30 ? 0.5 : 5);
        } else {
          result = 5;
        }
      } else {
        result = 0.5;
      }
  
      return M.clamp(result, 0.2, 0.5);
    }
  
    function calcW1(W, CCAL) {
      let sub = 3;
      if (CCAL <= 0.5) sub = 0.6;
      else if (CCAL <= 1) sub = 4.2;
      else if (CCAL <= 2) sub = 8.5;
      return M.round(W - sub, 2);
    }
  
    function calcG(L, W, W1) {
      const total = L + L + W + W1;
      let g = 45;
      if (total <= 250) g = 13;
      else if (total <= 500) g = 16;
      else if (total <= 600) g = 19;
      else if (total <= 700) g = 25;
      else if (total <= 800) g = 35;
      return M.clamp(g, 5, W1 - 1);
    }
  
    function calcGT(D, G, CCAL) {
      return M.clamp(Math.atan((D / 2 - CCAL) / Math.max(G, 0.0001)) * 180 / Math.PI, 0, 15);
    }
  
    function calcE(L, W) {
      let result = stepValue(
        L,
        roundTo(L / 8, 0.1),
        30, 6,
        65, 8,
        150, 11
      );
  
      if (W > 8 && W <= 30) {
        result = roundDownTo(Math.min(L / 4, 20), 0.5);
      }
  
      return Math.max(0, result);
    }
  
    function calcCX(CCAL, E) {
      return M.clamp(Math.min(CCAL, roundDownTo(E / 2, 0.5)), 0, CCAL);
    }
  
    function calcY1(CCAL, E) {
      const value = roundTo(CCAL <= 0.5 ? CCAL : 1.5 * CCAL, 0.05);
      return E === 0 ? 0 : Math.max(0, value);
    }
  
    function calcY2(CCAL, E) {
      const value = roundTo(CCAL, 0.05);
      return E === 0 ? 0 : Math.max(0, value);
    }
  
    function calcCR1(CCAL, E, CX, Y1) {
      return M.clamp(Math.max(Math.min(E - CX, Y1), 0), 0, CCAL);
    }
  
    function calcC(L, D, W2, W, Y1) {
      const base = stepValue(
        L,
        roundDownTo(Math.min(10, D / 4), 1),
        40, 11,
        60, 13,
        100, 15,
        130, 20,
        180, 25
      );
  
      const minValue = Math.max(5, 2 * Y1);
      const maxValue = Math.min(roundDownTo(Math.sqrt(W2 * W2 + W * W), 1), roundTo(D / 2, 0.1));
  
      return M.clamp(base, minValue, maxValue);
    }
  
    function calcCR(C, Y1, L) {
      return M.clamp(roundUpTo(C / 2, 1), 0, roundDownTo(Math.min(C - Y1, L / 4), 1));
    }
  
    function calcCT(L, CX, C) {
      return M.clamp(0.5 * Math.atan((L / 2 - CX) / Math.max(C, 0.0001)) * 180 / Math.PI, 0, 30);
    }
  
    function calcAX(W, CCAL) {
      const base = W >= 30 ? roundTo(2 + CCAL, 0.05) : roundTo(3 + CCAL, 0.05);
      const maxValue = roundTo(Math.min(W / 3, 5 + CCAL), 0.5);
      return M.clamp(base, 0, maxValue);
    }
  
    function calcAXX(AX, CCAL) {
      const base = AX === 0 ? 0 : (CCAL <= 1.5 ? AX + 1 : AX + 2);
      return M.clamp(base, AX, AX === 0 ? 0 : AX + 2);
    }
  
    function calcR(CCAL, AX) {
      const base = roundTo(CCAL > 0.5 ? 1.3 * CCAL : 1.2 * CCAL, 0.05);
      const minValue = Math.min(roundTo(1.2 * CCAL, 0.05), AX / 2);
      const maxValue = Math.min(roundTo(1.5 * CCAL, 1), AX / 2);
      return M.clamp(base, minValue, maxValue);
    }
  
    function calcOF(IIL, CCAL, R) {
      const base = CCAL > 1.5 ? CCAL : IIL;
      return M.clamp(base, 0, Math.min(CCAL, R));
    }
  
    function calcAS(AX, OF) {
      return M.clamp(AX, OF, AX);
    }
  
    function calcS(L) {
      if (L < 30) {
        const s0 = stepValue(L, roundTo(L / 10, 0.1), 65, 6, 150, 8);
        return M.clamp(s0 - 2, s0 - 2, s0 - 0.75);
      }
      return roundTo(L / 10, 0.1);
    }
  
    function calcNX(W) {
      const base = (W > 8 && W <= 30) ? 3 : 2;
      return M.clamp(base, 0, roundTo(W / 5, 0.1));
    }
  
    function calcNY(W) {
      const base = (W > 8 && W <= 30) ? 3 : 2;
      return M.clamp(base, 0, roundTo(W / 5, 0.1));
    }
  
    function calcAR(W, C, L) {
      const base = (W > 8 && W <= 30)
        ? roundDownTo(Math.min((W / 2 + C / 2) / 4, L / 2), 1)
        : 1;
  
      const maxValue = (W > 8 && W <= 30)
        ? Math.min(roundDownTo(Math.min((W / 2 + C / 2) / 2, L / 2), 1), roundTo(W / 3, 0.1))
        : 1;
  
      return M.clamp(base, 0, maxValue);
    }
  
    function calcA(W, C, L, S, NY, AR) {
      const base = Math.min(roundUpTo(W / 2 + C / 2, 1), roundDownTo(L / 2, 1));
      const minValue = Math.max(S + NY + AR, roundTo(C / 2, 0.1));
      const maxValue = roundTo(L - 1, 0.1);
      return M.clamp(base, minValue, maxValue);
    }
  
    function calcAX1(CCAL, IIL) {
      const base = CCAL > 0.5 ? IIL : CCAL;
      return M.clamp(base, IIL, CCAL);
    }
  
    function calcATT(W, AXX, AR, NX, A, S, NY) {
      const base = (W > 8 && W <= 20)
        ? 13
        : Math.min(45, 0.75 * Math.atan((W - AXX - AR - NX) / Math.max(A - S - NY, 0.0001)) * 180 / Math.PI);
  
      return M.clamp(base, 0, (W > 8 && W <= 20) ? 0 : Math.min(45, base));
    }
  
    function derive(input) {
      const L = Number(input.length) || 0;
      const W = Number(input.width) || 0;
      const D = Number(input.height) || 0;
  
      const IIL = Number(input.innerLoss) || 0.3;
      const OOG = Number(input.outerGain) || 0.2;
  
      const CCAL = Number(input.thicknessValue) || calcCCAL(L, W, D);
      const W1 = calcW1(W, CCAL);
      const G = calcG(L, W, W1);
      const GT = calcGT(D, G, CCAL);
  
      const E = calcE(L, W);
      const CX = calcCX(CCAL, E);
      const Y1 = calcY1(CCAL, E);
      const W2 = W ;
      const Y2 = calcY2(CCAL, E);
      const CR1 = calcCR1(CCAL, E, CX, Y1);
  
      const C = calcC(L, D, W2, W, Y1);
      const CR = calcCR(C, Y1, L);
      const CT = calcCT(L, CX, C);
  
      const AX = calcAX(W, CCAL);
      const AXX = calcAXX(AX, CCAL);
      const R = calcR(CCAL, AX);
      const OF = calcOF(IIL, CCAL, R);
      const AS = calcAS(AX, OF);
      const S = calcS(L);
      const NX = calcNX(W);
      const NY = calcNY(W);
      const AR = calcAR(W, C, L);
      const A = calcA(W, C, L, S, NY, AR);
      const AX1 = calcAX1(CCAL, IIL);
      const ATT = calcATT(W, AXX, AR, NX, A, S, NY);
  
      return {
        L: M.round(L, 2),
        W: M.round(W, 2),
        D: M.round(D, 2),
        CCAL: M.round(CCAL, 2),
        IIL: M.round(IIL, 2),
        OOG: M.round(OOG, 2),
        W1: M.round(W1, 2),
        G: M.round(G, 2),
        GT: M.round(GT, 2),
        E: M.round(E, 2),
        CX: M.round(CX, 2),
        Y1: M.round(Y1, 2),
        W2: M.round(W2, 2),
        Y2: M.round(Y2, 2),
        CR1: M.round(CR1, 2),
        C: M.round(C, 2),
        CR: M.round(CR, 2),
        CT: M.round(CT, 2),
        AX: M.round(AX, 2),
        AXX: M.round(AXX, 2),
        R: M.round(R, 2),
        OF: M.round(OF, 2),
        AS: M.round(AS, 2),
        S: M.round(S, 2),
        NX: M.round(NX, 2),
        NY: M.round(NY, 2),
        AR: M.round(AR, 2),
        A: M.round(A, 2),
        AX1: M.round(AX1, 2),
        ATT: M.round(ATT, 2)
      };
    }
  
    global.PackagingBoxTypeReverseInsertLockFormulas = {
      derive: derive
    };
  })(window);