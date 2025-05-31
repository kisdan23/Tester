document.getElementById("csvFile").addEventListener("change", handleFile);

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const data = parseCSV(event.target.result);
    runStrategy(data);
  };
  reader.readAsText(file);
}

function parseCSV(text) {
  const lines = text.split("\n").slice(1); // skip header
  return lines.map(line => {
    const [time, open, high, low, close, volume] = line.split(",");
    return {
      time,
      open: +open,
      high: +high,
      low: +low,
      close: +close,
      volume: +volume
    };
  }).filter(row => !isNaN(row.close));
}

function runStrategy(data) {
  const buys = [], sells = [];
  let cash = 1000, position = 0;

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];

    // Simple strategy: buy if current close > previous close
    if (curr.close > prev.close) {
      buys.push({ x: curr.time, y: curr.close });
      position++;
      cash -= curr.close;
    } else {
      sells.push({ x: curr.time, y: curr.close });
      if (position > 0) {
        cash += curr.close;
        position--;
      }
    }
  }

  const pnl = cash + position * data[data.length - 1].close - 1000;
  document.getElementById("results").innerText = `Final PnL: $${pnl.toFixed(2)}`;

  drawChart(data, buys, sells);
}

function drawChart(data, buys, sells) {
  const ctx = document.getElementById("chart").getContext("2d");
  const labels = data.map(d => d.time);
  const prices = data.map(d => d.close);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Price",
          data: prices,
          borderColor: "blue",
          fill: false
        },
        {
          label: "Buys",
          data: buys,
          backgroundColor: "green",
          pointRadius: 4,
          type: "scatter",
          showLine: false
        },
        {
          label: "Sells",
          data: sells,
          backgroundColor: "red",
          pointRadius: 4,
          type: "scatter",
          showLine: false
        }
      ]
    }
  });
}
