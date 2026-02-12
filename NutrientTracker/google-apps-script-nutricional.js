function criarResumoNutricional() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dados = ss.getSheetByName("Tabela");

  const lastRow = dados.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("Nenhum dado encontrado!");
    return;
  }

  // Columns: Data(1) | Refeição(2) | Alimento(3) | Calorias(4) | Proteína(5) | Carboidratos(6) | Gordura(7)
  const range = dados.getRange(2, 1, lastRow - 1, 7);
  const values = range.getValues();

  // --- Aggregate by Refeição ---
  const porRefeicao = {};
  // --- Aggregate by Day ---
  const porDia = {};

  for (let i = 0; i < values.length; i++) {
    const data = values[i][0];
    const refeicao = values[i][1];
    const calorias = Number(values[i][3]) || 0;
    const proteina = Number(values[i][4]) || 0;
    const carboidratos = Number(values[i][5]) || 0;
    const gordura = Number(values[i][6]) || 0;

    if (refeicao) {
      if (!porRefeicao[refeicao]) {
        porRefeicao[refeicao] = { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0, count: 0 };
      }
      porRefeicao[refeicao].calorias += calorias;
      porRefeicao[refeicao].proteina += proteina;
      porRefeicao[refeicao].carboidratos += carboidratos;
      porRefeicao[refeicao].gordura += gordura;
      porRefeicao[refeicao].count += 1;
    }

    const dataStr = data instanceof Date ? Utilities.formatDate(data, "America/Sao_Paulo", "yyyy-MM-dd") : String(data);
    if (dataStr) {
      if (!porDia[dataStr]) {
        porDia[dataStr] = { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 };
      }
      porDia[dataStr].calorias += calorias;
      porDia[dataStr].proteina += proteina;
      porDia[dataStr].carboidratos += carboidratos;
      porDia[dataStr].gordura += gordura;
    }
  }

  // --- Create/clear Resumo sheet ---
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

  // === Section 1: Totals by Refeição ===
  resumo.getRange("A1:F1").setBackground(darkGreen).setFontColor("white");
  resumo.getRange("A1").setValue("Calorias por Refeição").setFontWeight("bold").setFontSize(12);
  resumo.getRange("A2").setValue("Refeição");
  resumo.getRange("B2").setValue("Calorias (kcal)");
  resumo.getRange("C2").setValue("Proteína (g)");
  resumo.getRange("D2").setValue("Carboidratos (g)");
  resumo.getRange("E2").setValue("Gordura (g)");
  resumo.getRange("F2").setValue("Registros");
  resumo.getRange("A2:F2").setFontWeight("bold").setBackground(lightGreen);

  const refeicoes = Object.keys(porRefeicao).sort();
  for (let j = 0; j < refeicoes.length; j++) {
    const r = porRefeicao[refeicoes[j]];
    const row = j + 3;
    resumo.getRange(row, 1, 1, 6).setBackground(j % 2 === 0 ? zebraLight : zebraDark);
    resumo.getRange(row, 1).setValue(refeicoes[j]);
    resumo.getRange(row, 2).setValue(Math.round(r.calorias)).setNumberFormat("#,##0");
    resumo.getRange(row, 3).setValue(Math.round(r.proteina)).setNumberFormat("#,##0");
    resumo.getRange(row, 4).setValue(Math.round(r.carboidratos)).setNumberFormat("#,##0");
    resumo.getRange(row, 5).setValue(Math.round(r.gordura)).setNumberFormat("#,##0");
    resumo.getRange(row, 6).setValue(r.count).setNumberFormat("#,##0");
  }

  const totalRefeicaoRow = refeicoes.length + 3;
  resumo.getRange(totalRefeicaoRow, 1, 1, 6).setBackground(totalGray);
  resumo.getRange(totalRefeicaoRow, 1).setValue("TOTAL").setFontWeight("bold");
  for (let col = 2; col <= 5; col++) {
    resumo.getRange(totalRefeicaoRow, col)
      .setFormula("=SUM(" + String.fromCharCode(64 + col) + "3:" + String.fromCharCode(64 + col) + (refeicoes.length + 2) + ")")
      .setNumberFormat("#,##0")
      .setFontWeight("bold");
  }
  resumo.getRange(totalRefeicaoRow, 6)
    .setFormula("=SUM(F3:F" + (refeicoes.length + 2) + ")")
    .setFontWeight("bold");

  // === Section 2: Daily totals ===
  const dailyStartRow = totalRefeicaoRow + 3;
  resumo.getRange(dailyStartRow, 1, 1, 5).setBackground(darkGreen).setFontColor("white");
  resumo.getRange(dailyStartRow, 1).setValue("Totais Diários").setFontWeight("bold").setFontSize(12);
  resumo.getRange(dailyStartRow + 1, 1).setValue("Data");
  resumo.getRange(dailyStartRow + 1, 2).setValue("Calorias (kcal)");
  resumo.getRange(dailyStartRow + 1, 3).setValue("Proteína (g)");
  resumo.getRange(dailyStartRow + 1, 4).setValue("Carboidratos (g)");
  resumo.getRange(dailyStartRow + 1, 5).setValue("Gordura (g)");
  resumo.getRange(dailyStartRow + 1, 1, 1, 5).setFontWeight("bold").setBackground(lightGreen);

  const dias = Object.keys(porDia).sort();
  for (let k = 0; k < dias.length; k++) {
    const d = porDia[dias[k]];
    const row = dailyStartRow + 2 + k;
    resumo.getRange(row, 1, 1, 5).setBackground(k % 2 === 0 ? zebraLight : zebraDark);
    resumo.getRange(row, 1).setValue(dias[k]);
    resumo.getRange(row, 2).setValue(Math.round(d.calorias)).setNumberFormat("#,##0");
    resumo.getRange(row, 3).setValue(Math.round(d.proteina)).setNumberFormat("#,##0");
    resumo.getRange(row, 4).setValue(Math.round(d.carboidratos)).setNumberFormat("#,##0");
    resumo.getRange(row, 5).setValue(Math.round(d.gordura)).setNumberFormat("#,##0");
  }

  // === Section 3: Macro distribution (total) ===
  const macroStartRow = dailyStartRow + dias.length + 4;
  resumo.getRange(macroStartRow, 1, 1, 2).setBackground(darkGreen).setFontColor("white");
  resumo.getRange(macroStartRow, 1).setValue("Distribuição de Macros (Total)").setFontWeight("bold").setFontSize(12);
  resumo.getRange(macroStartRow + 1, 1).setValue("Macro");
  resumo.getRange(macroStartRow + 1, 2).setValue("Gramas");
  resumo.getRange(macroStartRow + 1, 1, 1, 2).setFontWeight("bold").setBackground(lightGreen);

  let totalProteina = 0, totalCarbs = 0, totalGordura = 0;
  for (let i = 0; i < values.length; i++) {
    totalProteina += Number(values[i][4]) || 0;
    totalCarbs += Number(values[i][5]) || 0;
    totalGordura += Number(values[i][6]) || 0;
  }

  resumo.getRange(macroStartRow + 2, 1, 1, 2).setBackground(zebraLight);
  resumo.getRange(macroStartRow + 2, 1).setValue("Proteína");
  resumo.getRange(macroStartRow + 2, 2).setValue(Math.round(totalProteina)).setNumberFormat("#,##0");
  resumo.getRange(macroStartRow + 3, 1, 1, 2).setBackground(zebraDark);
  resumo.getRange(macroStartRow + 3, 1).setValue("Carboidratos");
  resumo.getRange(macroStartRow + 3, 2).setValue(Math.round(totalCarbs)).setNumberFormat("#,##0");
  resumo.getRange(macroStartRow + 4, 1, 1, 2).setBackground(zebraLight);
  resumo.getRange(macroStartRow + 4, 1).setValue("Gordura");
  resumo.getRange(macroStartRow + 4, 2).setValue(Math.round(totalGordura)).setNumberFormat("#,##0");

  // === Charts ===

  // Chart 1: Pie — Calories by Refeição
  const pieRange = resumo.getRange(2, 1, refeicoes.length + 1, 2);
  const pieChart = resumo.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(pieRange)
    .setPosition(2, 8, 0, 0)
    .setOption("title", "Calorias por Refeição")
    .setOption("width", 480)
    .setOption("height", 360)
    .setOption("pieSliceText", "percentage")
    .setOption("legend", { position: "right" })
    .build();
  resumo.insertChart(pieChart);

  // Chart 2: Pie — Macro distribution (P/C/G)
  const macroRange = resumo.getRange(macroStartRow + 1, 1, 4, 2);
  const macroPieChart = resumo.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(macroRange)
    .setPosition(2, 15, 0, 0)
    .setOption("title", "Distribuição de Macronutrientes")
    .setOption("width", 480)
    .setOption("height", 360)
    .setOption("pieSliceText", "percentage")
    .setOption("legend", { position: "right" })
    .setOption("colors", ["#4285F4", "#FBBC04", "#EA4335"])
    .build();
  resumo.insertChart(macroPieChart);

  // Chart 3: Bar — Daily calories
  if (dias.length > 0) {
    const dailyRange = resumo.getRange(dailyStartRow + 1, 1, dias.length + 1, 2);
    const barChart = resumo.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(dailyRange)
      .setPosition(22, 8, 0, 0)
      .setOption("title", "Calorias por Dia")
      .setOption("width", 600)
      .setOption("height", 360)
      .setOption("legend", { position: "none" })
      .setOption("hAxis", { title: "Data" })
      .setOption("vAxis", { title: "kcal" })
      .build();
    resumo.insertChart(barChart);
  }

  // Auto-resize columns
  for (let col = 1; col <= 6; col++) {
    resumo.autoResizeColumn(col);
  }

  SpreadsheetApp.getUi().alert("Resumo nutricional e gráficos criados na aba 'Resumo'!");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Controle Nutricional")
    .addItem("Atualizar Resumo e Gráficos", "criarResumoNutricional")
    .addToUi();
}
