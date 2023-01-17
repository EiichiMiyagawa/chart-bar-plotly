import "https://cdn.plot.ly/plotly-2.15.1.min.js";
import { CSV } from "https://js.sabae.cc/CSV.js";

const defaultColors = [
  "#A3BBBC",
  "#98ADBF",
  "#EAB9AF",
  "#DD725A",
  "#EEB259",
  "#EEE358",
];
const colors = [...defaultColors];
for (let i = 0; i < 20; i++) {
  for (let j = 0; j < defaultColors.length; j++) {
    colors.push(defaultColors[j]);
  }
}

class ChartBar extends HTMLElement {
  constructor(data, options) {
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
      this.setData(dataList, legends, options);
    } else {
      const src = this.getAttribute("src");
      if (src) {
        this.fetchCsv(src, options);
        return;
      }
      const txt = this.textContent.trim();
      const json = CSV.toJSON(CSV.decode(txt));
      this.textContent = "";
      this.setData([json], [null], options);
    }
  }
  
  async fetchCsv(src, options) {
    const json = CSV.toJSON(await CSV.fetch(src));
    this.setData([json], [null]);
  }
  
  setData(data, legends, options = {}) {
    const barDatas = [];
    const orientation = options["orientation"] ? options["orientation"] : "v";

    data.forEach((d, index) => {
      const labels = d.map((d2) => {
        return d2["name"];
      });
      const values = d.map((d2) => {
        return d2["count"];
      });
      
      const barData = {
        type: "bar",
        x: orientation == "v" ? labels : values,
        y: orientation == "v" ? values : labels,
        name: legends[index],
        orientation: orientation,
        marker: {
          color: colors[index]
        }
      };
      
      barDatas.push(barData);
    });
    
    const layout = {};
    if (orientation == "v") {
      layout.xaxis = {
        // 日付型の場合のみこのフォーマットが適用される
        tickformat: "%Y/%m/%d"
      };
      layout.yaxis = {
        exponentformat: "none"
      };
    } else {
      layout.yaxis = {
        // 日付型の場合のみこのフォーマットが適用される
        tickformat: "%Y/%m/%d"
      };
      layout.xaxis = {
        exponentformat: "none"
      };
    }
    if (!this.style.width) {
      layout.width = !options["width"] ? 800 : options["width"];
    }
    if (!this.style.height) {
      layout.height = !options["height"] ? 600 : options["height"];
    }
    Plotly.newPlot(this, barDatas, layout);
  }
}

customElements.define("chart-bar", ChartBar);

export { ChartBar };
