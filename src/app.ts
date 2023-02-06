import Chart, {
  AreaChartOptions,
} from '@toast-ui/chart';

interface Locations {
  country: string;
  province: string;
}

type taxType = 'federal' | 'provincial' | 'all';

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  maxTax: number;
}

interface TaxBrackets {
  federal: {
    brackets: TaxBracket[];
  };
  provincial: {
    [province: string]: {
      brackets: TaxBracket[];
    };
  };
}

interface TaxBracketsByCountry {
  [country: string]: TaxBrackets;
}

interface netIncome {
  federalTax: number;
  provincialTax: number;
  totalTax: number;
  netIncome: number;
  marginalTaxRate: number;
  federalTaxRate: number;
  provincialTaxRate: number;
  dollarTaxRate: number;
  dollarValue: number;
}

interface netIncomeGraph {
  graphPoints: netIncome[];
}

class IncomeTaxCalculator {
  graph: netIncomeGraph = {
    graphPoints: [],
  };
  locations: Locations = { country: 'canada', province: 'quebec' };
  income: number = 0;
  scale: number = 0;
  taxType: taxType = 'all';
  taxBrackets: TaxBracketsByCountry = {
    canada: {
      federal: {
        brackets: [
          { min: 0, max: 50197, rate: 0.15, maxTax: 7144.5 },
          { min: 50197, max: 100392, rate: 0.205, maxTax: 16908.3 },
          { min: 100392, max: 155625, rate: 0.26, maxTax: 30535.3 },
          { min: 155625, max: 221708, rate: 0.29, maxTax: 48719.3 },
          { min: 221708, max: Infinity, rate: 0.33, maxTax: Infinity },
        ],
      },
      provincial: {
        quebec: {
          brackets: [
            { min: 0, max: 49275, rate: 0.15, maxTax: 7381.25 },
            { min: 49275, max: 98540, rate: 0.2, maxTax: 14762.5 },
            { min: 98540, max: 119910, rate: 0.24, maxTax: 21981.5 },
            { min: 119910, max: Infinity, rate: 0.2575, maxTax: Infinity },
          ],
        },
      },
    },
  };

  // 2022 brackets: [
  //   { min: 0, max: 46295, rate: 0.15, maxTax: 7381.25 },
  //   { min: 46295, max: 92580, rate: 0.2, maxTax: 14762.5 },
  //   { min: 92580, max: 112655, rate: 0.24, maxTax: 21981.5 },
  //   { min: 112655, max: Infinity, rate: 0.2575, maxTax: Infinity },
  // ],

  constructor(
    income: number,
    locations: Locations = { country: 'canada', province: 'quebec' },
    taxType: taxType = 'all'
  ) {
    this.income = income;
    this.locations = locations;
    this.taxType = taxType;
    this.calculateScale();
  }

  calculateScale() {
    let scale = this.income / 100;
    if (scale < 1000) {
      scale = 100;
    } else if (scale < 10000) {
      scale = 1000;
    } else if (scale < 100000) {
      scale = 10000;
    } else if (scale < 1000000) {
      scale = 100000;
    }
    this.scale = scale;
  }

  calculateTax() {
    this._getTax(this.income, this.locations, this.taxType);
    return this.graph;
  }

  getIncomeRangeScale() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(i);
    }
    return array;
  }

  getGrossIncome() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(i);
    }
    return { name: 'Gross Income', data: array };
  }

  getNetIncome() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(+this.graph.graphPoints[i].netIncome.toFixed(2));
    }
    return { name: 'Net Income', data: array };
  }

  getFederalTax() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(this.graph.graphPoints[i].federalTax);
    }
    return { name: 'Federal Taxes', data: array };
  }

  getProvincialTax() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(this.graph.graphPoints[i].provincialTax);
    }
    return { name: 'Provincial Taxes', data: array };
  }

  getMarginalTaxRate() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(+this.graph.graphPoints[i].marginalTaxRate.toFixed(2));
    }
    console.log(typeof array[0]);
    
    return { name: 'Marginal Tax Rate (%)', data: array };
  }

  getMarginalDollarTaxRate() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(
        +(100-((this.graph.graphPoints[i].marginalTaxRate) * 1)).toFixed(2)
      );
    }
    return { name: 'Marginal Dollar Value Rate ($)', data: array };
  }

  getDollarTaxRate() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(+this.graph.graphPoints[i].dollarTaxRate.toFixed(2));
    }
    return { name: 'Dollar Tax Rate (%)', data: array };
  }

  getDollarValue() {
    let array = [];
    for (let i = 0; i < this.income; i += this.scale) {
      array.push(+this.graph.graphPoints[i].dollarValue.toFixed(2));
    }
    return { name: 'Dollar Value ($)', data: array };
  }

  private _getTax(
    income: number,
    location: Locations,
    taxType: taxType = 'all'
  ) {
    const federalTaxBrackets =
      this.taxBrackets[location.country].federal.brackets;
    const provincialTaxBrackets =
      this.taxBrackets[location.country].provincial[location.province].brackets;
    for (let i = 0; i < income; i += 1) {
      let federalTax = 0;
      let provincialTax = 0;
      let fedBracket = 0;
      let provBracket = 0;
      if (taxType === 'provincial' || taxType === 'all') {
        for (let j = 0; j < federalTaxBrackets.length; j++) {
          if (
            i >= federalTaxBrackets[j].min &&
            i <= federalTaxBrackets[j].max
          ) {
            federalTax +=
              (i - federalTaxBrackets[j].min) * federalTaxBrackets[j].rate;
            fedBracket = j;
            break;
          } else if (
            i > federalTaxBrackets[j].min &&
            i > federalTaxBrackets[j].max
          ) {
            federalTax +=
              (federalTaxBrackets[j].max - federalTaxBrackets[j].min) *
              federalTaxBrackets[j].rate;
          }
          fedBracket = j;
        }
      }

      if (taxType === 'federal' || taxType === 'all') {
        for (let k = 0; k < provincialTaxBrackets.length; k++) {
          if (
            i >= provincialTaxBrackets[k].min &&
            i <= provincialTaxBrackets[k].max
          ) {
            provincialTax +=
              (i - provincialTaxBrackets[k].min) *
              provincialTaxBrackets[k].rate;
            provBracket = k;
            break;
          } else if (
            i > provincialTaxBrackets[k].min &&
            i > provincialTaxBrackets[k].max
          ) {
            provincialTax +=
              (provincialTaxBrackets[k].max - provincialTaxBrackets[k].min) *
              provincialTaxBrackets[k].rate;
          }
          provBracket = k;
        }
      }

      let graphPoint: netIncome = {
        federalTax: federalTax,
        provincialTax: provincialTax,
        totalTax: federalTax + provincialTax,
        netIncome: i - (federalTax + provincialTax),
        marginalTaxRate:
          ((federalTax + provincialTax) / i) * 100 ||
          federalTaxBrackets[0].rate +
            provincialTaxBrackets[0].rate,
        federalTaxRate: federalTaxBrackets[fedBracket].rate,
        provincialTaxRate: provincialTaxBrackets[provBracket].rate,
        dollarTaxRate:
          (federalTaxBrackets[fedBracket].rate +
            provincialTaxBrackets[provBracket].rate) *
          1 *
          100,
        dollarValue:
          ((1 -
            (federalTaxBrackets[fedBracket].rate +
              provincialTaxBrackets[provBracket].rate) *
              1) *
          100),
      };
      this.graph.graphPoints.push(graphPoint);
    }
  }
}

const tax = new IncomeTaxCalculator(500000);
tax.calculateTax();

const el = document.getElementById('chart') as any;
const data: any = {
  categories: [...tax.getIncomeRangeScale()],
  series: [
    {
      ...tax.getGrossIncome(),
    },
    {
      ...tax.getNetIncome(),
    },
    {
      ...tax.getFederalTax(),
    },
    {
      ...tax.getProvincialTax(),
    },
  ],
};
const options: AreaChartOptions = {
  chart: { title: 'Tax Graph by income', width: 'auto', height: 400 },
  xAxis: { pointOnColumn: false, title: { text: 'Income ($)' } },
  yAxis: { title: 'Money ($)' },
  series: { spline: true },
  legend: { align: 'bottom' },
};

const marginalTaxEl = document.getElementById('marginalTaxChart') as any;

const marginalTaxData: any = {
  categories: [...tax.getIncomeRangeScale()],
  series: [
    {
      ...tax.getMarginalTaxRate(),
    },
    {
      ...tax.getDollarTaxRate(),
    },
    {
      ...tax.getDollarValue(),
    },
    {
      ...tax.getMarginalDollarTaxRate(),
    },
  ],
};
const marginalTaxOptions: AreaChartOptions = {
  chart: { title: 'Marginal Tax Rate by income', width: 'auto', height: 400 },
  xAxis: { pointOnColumn: false, title: { text: 'Income ($)' } },
  yAxis: [
    {
      title: '%',
      scale: {
        min: 0,
        max: 100,
      },
    },
    {
      title: '1.00$',
      scale: {
        min: 0,
        max: 100,
      },
    },
  ],
  series: { },
  legend: { align: 'bottom' },
};

const effectiveBuyingPowerEl = document.getElementById(
  'effectiveBuyingPower'
) as any;

const effectiveBuyingPowerData: any = {
  categories: [...tax.getIncomeRangeScale()],
  series: [
    {
      name: "1$ earned after taxes",
      data: tax.getDollarValue().data,
    },
    {
      name: "1$ with 15% sales tax",
      data: tax
      .getDollarValue()
      .data.map((d: any) => +(d * (1 / (1 + 0.15))).toFixed(2)),
    },
    {
      ...tax.getMarginalDollarTaxRate(),
    },
    {
      name: "Marginal 1$ with 15% sales tax",
      data: tax
      .getMarginalDollarTaxRate()
      .data.map((d: any) => +(d * (1 / (1 + 0.15))).toFixed(2)),
    },
  ],
};
const effectiveBuyingPowerOptions: AreaChartOptions = {
  chart: { title: 'Effective Dollar Buying Power by Income (What 1$ earned can buy after all taxes (including sales taxes))', width: 'auto', height: 400 },
  xAxis: { pointOnColumn: false, title: { text: 'Income ($)' } },
  yAxis: { title: '1.00$' },
  series: { },
  legend: { align: 'bottom' },
};

const chart = Chart.areaChart({ el, data, options });
const marginalTaxChart = Chart.lineChart({
  el: marginalTaxEl,
  data: marginalTaxData,
  options: marginalTaxOptions,
});
const effectiveBuyingPowerChart = Chart.areaChart({
  el: effectiveBuyingPowerEl,
  data: effectiveBuyingPowerData,
  options: effectiveBuyingPowerOptions,
});
