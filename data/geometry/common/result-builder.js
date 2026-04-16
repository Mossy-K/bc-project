(function (global) {
    function buildResult(meta, input, display, geometry, preview3d) {
      return {
        meta: meta,
        input: input,
        display: display,
        geometry: geometry,
        preview3d: preview3d
      };
    }
  
    global.PackagingGeometryResultBuilder = {
      buildResult: buildResult
    };
  })(window);