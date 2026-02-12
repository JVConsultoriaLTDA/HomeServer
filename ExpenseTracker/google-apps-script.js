function criarResumoEGrafico() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dados = ss.getSheetByName("Azul Infinite");

  const lastRow = dados.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("Nenhum dado encontrado!");
    return;
  }

  const range = dados.getRange(2, 1, lastRow - 1, 5);
  const values = range.getValues();

  const categorias = {};
  for (let i = 0; i < values.length; i++) {
    const categoria = values[i][3];
    const valor = Number(values[i][2]);
    if (categoria && valor) {
      categorias[categoria] = (categorias[categoria] || 0) + valor;
    }
  }

  let resumo = ss.getSheetByName("Resumo");
  if (resumo) {
    resumo.clear();
    const charts = resumo.getCharts();
    for (let c = 0; c < charts.length; c++) {
      resumo.removeChart(charts[c]);
    }
  } else {
    resumo = ss.insertSheet("Resumo");
  }

  // --- Color palette ---
  const darkGreen = "#274e13";
  const lightGreen = "#b6d7a8";
  const zebraLight = "#eef5eb";
  const zebraDark = "#d9ead3";
  const totalGray = "#e8e8e8";

  // Title row
  resumo.getRange("A1:B1").setBackground(darkGreen).setFontColor("white").setFontWeight("bold").setFontSize(12);
  resumo.getRange("A1").setValue("Gastos por Categoria");

  // Header row
  resumo.getRange("A2").setValue("Categoria");
  resumo.getRange("B2").setValue("Total (R$)");
  resumo.getRange("A2:B2").setFontWeight("bold").setBackground(lightGreen);

  const cats = Object.keys(categorias).sort();
  for (let j = 0; j < cats.length; j++) {
    const row = j + 3;
    resumo.getRange(row, 1, 1, 2).setBackground(j % 2 === 0 ? zebraLight : zebraDark);
    resumo.getRange(row, 1).setValue(cats[j]);
    resumo.getRange(row, 2).setValue(categorias[cats[j]]);
    resumo.getRange(row, 2).setNumberFormat("R$ #,##0.00");
  }

  const totalRow = cats.length + 3;
  resumo.getRange(totalRow, 1, 1, 2).setBackground(totalGray);
  resumo.getRange(totalRow, 1).setValue("TOTAL").setFontWeight("bold");
  resumo.getRange(totalRow, 2)
    .setFormula("=SUM(B3:B" + (cats.length + 2) + ")")
    .setNumberFormat("R$ #,##0.00")
    .setFontWeight("bold");

  const chartRange = resumo.getRange(2, 1, cats.length + 1, 2);
  const chart = resumo.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(chartRange)
    .setPosition(2, 4, 0, 0)
    .setOption("title", "Gastos por Categoria")
    .setOption("width", 500)
    .setOption("height", 400)
    .setOption("pieSliceText", "percentage")
    .setOption("legend", {position: "right"})
    .build();

  resumo.insertChart(chart);

  const barChart = resumo.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(chartRange)
    .setPosition(22, 4, 0, 0)
    .setOption("title", "Gastos por Categoria (R$)")
    .setOption("width", 500)
    .setOption("height", 400)
    .setOption("legend", {position: "none"})
    .build();

  resumo.insertChart(barChart);

  resumo.autoResizeColumn(1);
  resumo.autoResizeColumn(2);

  SpreadsheetApp.getUi().alert("Resumo e gráficos criados na aba 'Resumo'!");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Controle Financeiro")
    .addItem("Atualizar Resumo e Gráficos", "criarResumoEGrafico")
    .addToUi();
}
