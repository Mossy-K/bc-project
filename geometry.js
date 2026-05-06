/*
  geometry.js
  当前阶段：只保留输入数据接口外壳
  不保留旧盒型
  不保留旧命名
  不保留旧公式
  后续新规则从这里重建
*/

(function (global) {
  function buildShellData(input) {
    return {
      input: {
        length: Number(input.length) || 0,
        width: Number(input.width) || 0,
        height: Number(input.height) || 0,
        material: input.material || '',
        thickness: input.thickness || ''
      },

      // 当前先只保留展示字段，占位用
      display: {
        gap: '待定义',
        glueFlap: '待定义',
        flipcover: '待定义',
        glueFlapHeight: '待定义',
        tolerance: input.tolerance || '待选择材料'
      },

      // 当前先不生成任何盒型几何
      geometry: null
    };
  }

  global.PackagingGeometry = {
    buildShellData: buildShellData
  };
})(window);