import "https://cdn.plot.ly/plotly-2.15.1.min.js";
import { CSV } from "https://js.sabae.cc/CSV.js";

class ChartBar extends HTMLElement {
  constructor(data) {
    super();
    
    if (data !== undefined) {
      if (!Array.isArray(data)) {
        data = Object.keys(data).map(name => {
          return { name, count: data[name] }
        });
      }
      this.setData(data);
    } else {
      const src = this.getAttribute("src");
      if (src) {
        this.fetchCsv(src);
        return;
      }
      const txt = this.textContent.trim();
      const json = CSV.toJSON(CSV.decode(txt));
      this.textContent = "";
      this.setData(json);
    }
  }
  
  async fetchCsv(src) {
    const json = CSV.toJSON(await CSV.fetch(src));
    this.setData(json);
  }
  
  setData(data) {
    const labels = data.map((d) => {
      return d["name"];
    });
    const values = data.map((d) => {
      return d["count"];
    });
    
    const barDatas = [{
      type: "bar",
      x: labels,
      y: values
    }];
    
    const layout = {
      xaxis: {
        // 日付型の場合のみこのフォーマットが適用される
        tickformat: "%Y/%m/%d"
      },
      yaxis: {
        exponentformat: "none"
      }
    };
    Plotly.newPlot(this, barDatas, layout);
  }
}

customElements.define("chart-bar", ChartBar);

export { ChartBar };
