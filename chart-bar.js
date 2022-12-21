import "https://cdn.plot.ly/plotly-2.15.1.min.js";
import { CSV } from "https://js.sabae.cc/CSV.js";

class ChartBar extends HTMLElement {
  constructor(data) {
    super();
    
    if (data !== undefined) {
      const legends = [];
      const dataList = [];
      if (!Array.isArray(data)) {
        dataList.push(Object.keys(data).map((name) => {
          return { name, count: data[name] }
        }));
        legends.push(null);
      } else {
        data.forEach((d) => {
          const firstKey = Object.keys(d)[0];
          const baseData = (typeof(d[firstKey]) == "object") ? d[firstKey] : d;
          const newData = Object.keys(baseData).map((name) => {
            return { name, count: baseData[name] }
          });
          dataList.push(newData);

          const legend = (typeof(d[firstKey]) == "object") ? firstKey : null;
          legends.push(legend);
        });
      }
      this.setData(dataList, legends);
    } else {
      const src = this.getAttribute("src");
      if (src) {
        this.fetchCsv(src);
        return;
      }
      const txt = this.textContent.trim();
      const json = CSV.toJSON(CSV.decode(txt));
      this.textContent = "";
      this.setData([json], [null]);
    }
  }
  
  async fetchCsv(src) {
    const json = CSV.toJSON(await CSV.fetch(src));
    this.setData([json], [null]);
  }
  
  setData(data, legends) {
    const barDatas = [];
    data.forEach((d, index) => {
      const labels = d.map((d2) => {
        return d2["name"];
      });
      const values = d.map((d2) => {
        return d2["count"];
      });
      
      const barData = {
        type: "bar",
        x: labels,
        y: values,
        name: legends[index]
      };
      
      barDatas.push(barData);
    });
    
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
