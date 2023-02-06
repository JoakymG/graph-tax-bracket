"use strict";
// make a that returns the tax for a given income
function getTax(income, location, taxType = 'all') {
    const federalTaxBrackets = taxBrackets[location.country].federal.brackets;
    const provincialTaxBrackets = taxBrackets[location.country].provincial[location.province].brackets;
    for (let i = 0; i < income; i += 1) {
        let federalTax = 0;
        let provincialTax = 0;
        let fedBracket = 0;
        let provBracket = 0;
        if (taxType === 'provincial' || taxType === 'all') {
            for (let j = 0; j < federalTaxBrackets.length; j++) {
                if (i >= federalTaxBrackets[j].min && i <= federalTaxBrackets[j].max) {
                    federalTax +=
                        (i - federalTaxBrackets[j].min) * federalTaxBrackets[j].rate;
                    fedBracket = j;
                    break;
                }
                else if (i > federalTaxBrackets[j].min &&
                    i > federalTaxBrackets[j].max) {
                    federalTax +=
                        (federalTaxBrackets[j].max - federalTaxBrackets[j].min) *
                            federalTaxBrackets[j].rate;
                }
                fedBracket = j;
            }
        }
        if (taxType === 'federal' || taxType === 'all') {
            for (let k = 0; k < provincialTaxBrackets.length; k++) {
                if (i >= provincialTaxBrackets[k].min &&
                    i <= provincialTaxBrackets[k].max) {
                    provincialTax +=
                        (i - provincialTaxBrackets[k].min) * provincialTaxBrackets[k].rate;
                    provBracket = k;
                    break;
                }
                else if (i > provincialTaxBrackets[k].min &&
                    i > provincialTaxBrackets[k].max) {
                    provincialTax +=
                        (provincialTaxBrackets[k].max - provincialTaxBrackets[k].min) *
                            provincialTaxBrackets[k].rate;
                }
                provBracket = k;
            }
        }
        let graphPoint = {
            federalTax: federalTax,
            provincialTax: provincialTax,
            totalTax: federalTax + provincialTax,
            netIncome: i - (federalTax + provincialTax),
            marginalTaxRate: (federalTaxBrackets[fedBracket].rate +
                provincialTaxBrackets[provBracket].rate) /
                2,
            federalTaxRate: federalTaxBrackets[fedBracket].rate,
            provincialTaxRate: provincialTaxBrackets[provBracket].rate,
            dollarTaxRate: 1 -
                (federalTaxBrackets[fedBracket].rate +
                    provincialTaxBrackets[provBracket].rate) *
                    1,
        };
        graph.graphPoints.push(graphPoint);
        if (i % 1000 === 0)
            console.log(i);
    }
}
const graph = {
    income: 52000,
    graphPoints: [],
};
let location = { country: 'canada', province: 'quebec' };
let income = 0;
let taxBrackets = {
    canada: {
        federal: {
            brackets: [
                { min: 0, max: 50197, rate: 0.15, maxTax: 7144.5 },
                { min: 50197, max: 100392, rate: 0.205, maxTax: 16908.3 },
                { min: 100392, max: 155625, rate: 0.26, maxTax: 30535.3 },
                { min: 155625, max: 221708, rate: 0.29, maxTax: 48719.3 },
                { min: 221708, max: Infinity, rate: 0.33, maxTax: 150473.3 },
            ],
        },
        provincial: {
            quebec: {
                brackets: [
                    { min: 0, max: 46295, rate: 0.15, maxTax: 7381.25 },
                    { min: 46295, max: 92580, rate: 0.2, maxTax: 14762.5 },
                    { min: 92580, max: 112655, rate: 0.24, maxTax: 21981.5 },
                    { min: 112655, max: Infinity, rate: 0.2575, maxTax: Infinity },
                ],
            },
        },
    },
};
getTax(221708, location, 'all');
console.log(graph.graphPoints[graph.graphPoints.length - 1], 0, 15 * 49275);
