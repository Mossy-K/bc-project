(function (global) {
  /*
    印刷常用纸张克重与厚度对照表
    数据来源：用户提供的「印刷常用纸张克重与厚度对照表」图片。
    注意：表格中未给出允许误差范围的材料，tolerance 留空，界面显示为“表格未标注”。
  */
  global.PackagingMaterialConfig = [
    {
      name: '铜版纸',
      tolerance: '±5%',
      items: [
        { gram: 80, thickness: '0.075', thicknessValue: 0.075 },
        { gram: 105, thickness: '0.09', thicknessValue: 0.09 },
        { gram: 128, thickness: '0.11', thicknessValue: 0.11 },
        { gram: 157, thickness: '0.14', thicknessValue: 0.14 }
      ]
    },
    {
      name: '铜板卡',
      tolerance: '±5%',
      items: [
        { gram: 200, thickness: '0.17', thicknessValue: 0.17 },
        { gram: 230, thickness: '0.2', thicknessValue: 0.2 },
        { gram: 250, thickness: '0.21', thicknessValue: 0.21 },
        { gram: 300, thickness: '0.29', thicknessValue: 0.29 },
        { gram: 350, thickness: '0.37', thicknessValue: 0.37 }
      ]
    },
    {
      name: '轻涂纸',
      tolerance: '',
      items: [
        { gram: 58, thickness: '0.045', thicknessValue: 0.045 },
        { gram: 64, thickness: '0.055', thicknessValue: 0.055 },
        { gram: 70, thickness: '0.06', thicknessValue: 0.06 },
        { gram: 80, thickness: '0.07', thicknessValue: 0.07 }
      ]
    },
    {
      name: '哑粉纸',
      tolerance: '',
      items: [
        { gram: 105, thickness: '0.1', thicknessValue: 0.1 },
        { gram: 128, thickness: '0.12', thicknessValue: 0.12 },
        { gram: 157, thickness: '0.16', thicknessValue: 0.16 },
        { gram: 180, thickness: '0.18', thicknessValue: 0.18 },
        { gram: 200, thickness: '0.22', thicknessValue: 0.22 },
        { gram: 250, thickness: '0.26', thicknessValue: 0.26 }
      ]
    },
    {
      name: '双胶纸',
      tolerance: '±10%',
      items: [
        { gram: 60, thickness: '0.075', thicknessValue: 0.075 },
        { gram: 70, thickness: '0.085', thicknessValue: 0.085 },
        { gram: 80, thickness: '0.95', thicknessValue: 0.95 },
        { gram: 100, thickness: '0.12', thicknessValue: 0.12 },
        { gram: 120, thickness: '0.14', thicknessValue: 0.14 }
      ]
    },
    {
      name: '白卡',
      tolerance: '±20%',
      items: [
        { gram: 190, thickness: '0.25', thicknessValue: 0.25 },
        { gram: 210, thickness: '0.275', thicknessValue: 0.275 },
        { gram: 230, thickness: '0.3', thicknessValue: 0.3 },
        { gram: 250, thickness: '0.325', thicknessValue: 0.325 },
        { gram: 300, thickness: '0.4', thicknessValue: 0.4 },
        { gram: 350, thickness: '0.475', thicknessValue: 0.475 },
        { gram: 400, thickness: '0.535', thicknessValue: 0.535 }
      ]
    },
    {
      name: '白底白板',
      tolerance: '',
      items: [
        { gram: 300, thickness: '0.33', thicknessValue: 0.33 },
        { gram: 350, thickness: '0.4', thicknessValue: 0.4 },
        { gram: 200, thickness: '0.31-0.32', thicknessValue: 0.315 },
        { gram: 210, thickness: '0.26', thicknessValue: 0.26 },
        { gram: 230, thickness: '0.3', thicknessValue: 0.3 },
        { gram: 350, thickness: '0.48-0.49', thicknessValue: 0.485 },
        { gram: 450, thickness: '0.53', thicknessValue: 0.53 }
      ]
    },
    {
      name: '灰底白板',
      tolerance: '',
      items: [
        { gram: 250, thickness: '0.3', thicknessValue: 0.3 },
        { gram: 300, thickness: '0.35', thicknessValue: 0.35 },
        { gram: 350, thickness: '0.43', thicknessValue: 0.43 },
        { gram: 400, thickness: '0.51-0.53', thicknessValue: 0.52 },
        { gram: 450, thickness: '0.656', thicknessValue: 0.656 }
      ]
    }
  ];
})(window);
