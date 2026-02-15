// --- Configuration ---
// Access Script Properties: File > Project properies > Script properties
// Set 'SHEET_NAME_MAIN' and 'SHEET_NAME_SECONDARY' there.
const CONFIG = {
  sheets: [
    PropertiesService.getScriptProperties().getProperty("SHEET_NAME_MAIN"),
    PropertiesService.getScriptProperties().getProperty("SHEET_NAME_SECONDARY")
  ].filter(Boolean), // Filter out null/undefined if not set
  summarySheet: "Resumo"
};

function criarResumoEGrafico() {
  if (CONFIG.sheets.length === 0) {
    SpreadsheetApp.getUi().alert(
      "Nenhuma aba configurada! Vá em Arquivo > Propriedades do Projeto > Propriedades do Script e adicione 'SHEET_NAME_MAIN' e 'SHEET_NAME_SECONDARY'."
    );
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allCategories = {};

  // Iterate over all source sheets to aggregate data
  CONFIG.sheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      console.warn(`Sheet "${sheetName}" not found. Skipping.`);
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return; // Skip empty sheets

    // Assumes standard structure: [Date, Description, Value, Category, Split]
    // Value is at index 2 (Column C), Category at index 3 (Column D)
    const range = sheet.getRange(2, 1, lastRow - 1, 5);
    const values = range.getValues();

    for (let i = 0; i < values.length; i++) {
      const categoria = values[i][3];
      const valor = Number(values[i][2]);

      if (categoria && !isNaN(valor)) {
        allCategories[categoria] = (allCategories[categoria] || 0) + valor;
      }
    }
  });

  const categories = allCategories; // Alias for existing logic compatibility

  // --- Summary Sheet Update ---
  let resumo = ss.getSheetByName(CONFIG.summarySheet);
  if (resumo) {
    resumo.clear();
    const charts = resumo.getCharts();
    for (let c = 0; c < charts.length; c++) {
      resumo.removeChart(charts[c]);
    }
  } else {
    resumo = ss.insertSheet(CONFIG.summarySheet);
  }

  // --- Color palette ---
  const darkGreen = "#274e13";
  const lightGreen = "#b6d7a8";
  const zebraLight = "#eef5eb";
  const zebraDark = "#d9ead3";
  const totalGray = "#e8e8e8";

  // Title row
  resumo.getRange("A1:B1").setBackground(darkGreen).setFontColor("white").setFontWeight("bold").setFontSize(12);
  resumo.getRange("A1").setValue("Gastos por Categoria (Consolidado)");

  // Header row
  resumo.getRange("A2").setValue("Categoria");
  resumo.getRange("B2").setValue("Total (R$)");
  resumo.getRange("A2:B2").setFontWeight("bold").setBackground(lightGreen);

  const cats = Object.keys(categories).sort();
  if (cats.length === 0) {
    SpreadsheetApp.getUi().alert("Nenhum dado encontrado nas abas configuradas!");
    return;
  }

  for (let j = 0; j < cats.length; j++) {
    const row = j + 3;
    resumo.getRange(row, 1, 1, 2).setBackground(j % 2 === 0 ? zebraLight : zebraDark);
    resumo.getRange(row, 1).setValue(cats[j]);
    resumo.getRange(row, 2).setValue(categories[cats[j]]);
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
    .setOption("legend", { position: "right" })
    .build();

  resumo.insertChart(chart);

  const barChart = resumo.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(chartRange)
    .setPosition(22, 4, 0, 0)
    .setOption("title", "Gastos por Categoria (R$)")
    .setOption("width", 500)
    .setOption("height", 400)
    .setOption("legend", { position: "none" })
    .build();

  resumo.insertChart(barChart);

  resumo.autoResizeColumn(1);
  resumo.autoResizeColumn(2);

  SpreadsheetApp.getUi().alert("Resumo consolidado e gráficos criados!");
}

/**
 * Aplica formatação condicional para alternar cores de fundo baseadas na data (Coluna A).
 * Todas as linhas com a mesma data terão a mesma cor.
 */
function formatarAbasPorData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const zebraLight = "#eef5eb";
  const zebraDark = "#d9ead3";

  // Obter apenas a aba principal configurada
  const mainSheetName = PropertiesService.getScriptProperties().getProperty("SHEET_NAME_MAIN");
  const sheet = ss.getSheetByName(mainSheetName);

  if (!sheet) {
    SpreadsheetApp.getUi().alert("Aba principal não encontrada. Verifique a configuração 'SHEET_NAME_MAIN'.");
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());

  // Limpar regras existentes no intervalo
  const rules = sheet.getConditionalFormatRules();
  const newRules = rules.filter(rule => {
    const ranges = rule.getRanges();
    return !ranges.some(r => r.getA1Notation() === range.getA1Notation());
  });

  // Criar novas regras
  const rule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=ISODD(COUNTUNIQUE($A$2:$A2))")
    .setBackground(zebraLight)
    .setRanges([range])
    .build();

  const rule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied("=ISEVEN(COUNTUNIQUE($A$2:$A2))")
    .setBackground(zebraDark)
    .setRanges([range])
    .build();

  newRules.push(rule1);
  newRules.push(rule2);
  sheet.setConditionalFormatRules(newRules);

  SpreadsheetApp.getUi().alert("Formatação de cores por data aplicada à aba '" + mainSheetName + "'!");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Controle Financeiro")
    .addItem("Atualizar Resumo e Gráficos", "criarResumoEGrafico")
    .addItem("Formatar Cores por Data", "formatarAbasPorData")
    .addToUi();
}
