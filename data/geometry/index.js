(function (global) {
    function buildByType(type, input) {
      if (type === 'regular-carton') {
        return global.PackagingBoxTypeRegularCartonBuilder.build(input);
      }
  
      if (type === 'reverse-insert-lock') {
        return global.PackagingBoxTypeReverseInsertLockBuilder.build(input);
      }
  
      return {
        meta: { type: 'empty', name: '空壳' },
        input: input,
        display: {
          gap: '待定义',
          glueFlap: '待定义',
          flipcover: '待定义',
          glueFlapHeight: '待定义',
          tolerance: input.tolerance || '待选择材料'
        },
        geometry: null,
        preview3d: {
          length: Number(input.length) || 0,
          width: Number(input.width) || 0,
          height: Number(input.height) || 0
        }
      };
    }
  
    global.PackagingGeometry = {
      buildByType: buildByType
    };
  })(window);