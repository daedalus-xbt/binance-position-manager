const dotenv = require('dotenv');
const fs = require('fs');
const Handlebars = require('handlebars');
const { forEach } = require('p-iteration');

dotenv.config();

const Binance = require('node-binance-api');

const client = new Binance().options({
  'APIKEY': process.env.KEY,
  'APISECRET': process.env.SECRET
})

Handlebars.registerHelper('$inArray', function (s, a) {
  return a.indexOf(s) > -1;
});

function render(filename, data) {
  var source = fs.readFileSync(filename, 'utf8').toString();
  var template = Handlebars.compile(source);
  var output = template(data);
  return output;
}

format = function date2str(x, y) {
  var z = {
    M: x.getMonth() + 1,
    d: x.getDate(),
    h: x.getHours(),
    m: x.getMinutes(),
    s: x.getSeconds()
  };
  y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
    return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
  });

  return y.replace(/(y+)/g, function (v) {
    return x.getFullYear().toString().slice(-v.length)
  });
}

async function main() {

  var futuresAccount = await client.futuresAccount();

  var showKeys = ['totalInitialMargin', 'totalMaintMargin', 'totalWalletBalance', 'totalUnrealizedProfit', 'totalMarginBalance', 'totalPositionInitialMargin', 'totalOpenOrderInitialMargin', 'totalCrossWalletBalance', 'totalCrossUnPnl', 'availableBalance', 'maxWithdrawAmount']

  await forEach(Object.keys(futuresAccount), async k => {
    if (showKeys.includes(k)) {
      console.log(k);
      futuresAccount[k] = parseFloat(futuresAccount[k]).toFixed(2)
    }
  })

  futuresAccount['showKeys'] = showKeys;

  var today = format(new Date(), 'yyyy-MM-dd');
  var result = render('./templates/position.hbs', { 'data': futuresAccount });
  fs.writeFileSync(`./output/${today}.html`, result);
  fs.writeFileSync(`./output/${today}.json`, JSON.stringify(futuresAccount));

}

main();

