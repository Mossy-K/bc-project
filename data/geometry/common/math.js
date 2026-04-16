(function (global) {
    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
  
    function round(value, digits) {
      const p = Math.pow(10, digits || 0);
      return Math.round(value * p) / p;
    }
  
    function degToRad(deg) {
      return (deg * Math.PI) / 180;
    }
  
    global.PackagingGeometryMath = {
      clamp: clamp,
      round: round,
      degToRad: degToRad
    };
  })(window);