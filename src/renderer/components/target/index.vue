<template>
  <div class="target">
    <md-table v-model="searched" md-card md-fixed-header>
      <md-table-toolbar>
        <div class="md-toolbar-section-start">
          <h1 class="md-title">指标</h1>
        </div>

        <md-field md-clearable class="md-toolbar-section-end">
          <md-input placeholder="Search ..." v-model="search" @input="searchOnTable" />
        </md-field>
      </md-table-toolbar>

      <md-table-empty-state md-label="No Associated Currency" :md-description="``">
        <md-button class="md-primary md-raised" @click="newUser">Add The Currency</md-button>
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <template v-show="item.switch">
          <md-table-cell md-label="Symbol" md-sort-by="symbol">{{ item.name.toUpperCase() }}</md-table-cell>
          <md-table-cell md-label="涨幅" md-sort-by="percent">{{ orderbook[item.name] ? orderbook[item.name].percent:'...' }}%</md-table-cell>
          <md-table-cell :class="orderbook[item.name] ? orderbook[item.name].float:''" md-label="当前价" md-sort-by="close">{{ orderbook[item.name] ? orderbook[item.name].close:'...' }}</md-table-cell>
          <md-table-cell md-label="开盘价">{{ orderbook[item.name] ? orderbook[item.name].open:'...' }}</md-table-cell>
          <md-table-cell md-label="今天最高价">{{ orderbook[item.name] ? orderbook[item.name].high:'...' }}</md-table-cell>
          <md-table-cell md-label="13均价">{{kLineResult[item.name]?kLineResult[item.name].a:'...'}}</md-table-cell>
          <md-table-cell md-label="34均价">{{kLineResult[item.name]?kLineResult[item.name].b:'...'}}</md-table-cell>
          <md-table-cell md-label="55均价">{{kLineResult[item.name]?kLineResult[item.name].c:'...'}}</md-table-cell>
        </template>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import WebSocket from 'ws'
import pako from 'pako'
const toLower = text => {
  return text.toString().toLowerCase()
}

const searchByName = (items, term) => {
  if (term) {
    return items.filter(item => toLower(item.name).includes(toLower(term)))
  }

  return items
}

export default {
  data: () => ({
    search: null,
    searched: [],
    orderbook: {},
    WS_URL: 'wss://api.huobi.br.com/ws',
    kLineData: {},
    kLineResult: {},
    usdt: [
      { name: 'ethusdt', switch: true },
      { name: 'btcusdt', switch: true }
    ],
    symbols: [],
    users: []
  }),
  methods: {
    newUser(name) {
      console.log(this.getKLine(name, 13))
    },
    searchOnTable() {
      this.searched = searchByName(this.usdt, this.search)
    },
    ch(data) {
      let symbol = data.ch.split('.')[1]
      let channel = data.ch.split('.')[2]
      switch (channel) {
        case 'depth':
          orderbook[symbol] = data.tick
          console.log('depth', data.tick)
          break
        case 'kline':
          data.tick.symbol = symbol
          // this.orderbook[symbol] = data.tick
          // float
          if (this.orderbook[symbol]) {
            if (this.orderbook[symbol].close > data.tick.close) {
              data.tick.float = 'small'
            } else if (this.orderbook[symbol].close < data.tick.close) {
              data.tick.float = 'big'
            } else {
              data.tick.float = ''
            }
          } else {
            data.tick.float = ''
          }
          data.tick.percent = this.calculateGains(
            data.tick.close,
            data.tick.open
          ).toFixed(2)
          this.$set(this.orderbook, symbol, data.tick)
          // this.cover(this.orderbook)
          // console.log('kline', data.tick);
          break
      }
    },
    rep(data) {
      // console.log(data)
      let symbol = data.rep.split('.')[1]
      let channel = data.rep.split('.')[2]
      switch (channel) {
        case 'kline':
          this.kLineData[symbol] = data.data
          this.kLineResult[symbol] = {
            a: this.getKLine(symbol, 13),
            b: this.getKLine(symbol, 34),
            c: this.getKLine(symbol, 55)
          }
          break
      }
    },
    getKLine(name, num) {
      let price = 0
      // console.log(this.kLineData[name])
      let len = this.kLineData[name].length
      for (let i = 0; i < len; i++) {
        if (i < num) {
          price = this.kLineData[name][len - i - 1].close + price
        } else {
          let pc = price / num
          let close = this.kLineData[name][len - i - 1].close.toString()
          console.log(close)
          if (close.split('.')[0] === '0') {
            return pc.toFixed(close.split('.')[1].length)
          }
          return pc.toFixed(3)
        }
      }
    },
    handle(data) {
      // console.log('received', data.ch, 'data.ts', data.ts, 'crawler.ts', moment().format('x'));
      // console.log(data)
      if (data.ch) this.ch(data)
      if (data.rep) this.rep(data)
    },
    subscribe(ws) {
      // 订阅深度
      // 谨慎选择合并的深度，ws每次推送全量的深度数据，若未能及时处理容易引起消息堆积并且引发行情延时
      // for (let symbol of symbols) {
      //     ws.send(JSON.stringify({
      //         "sub": `market.${symbol}.depth.step0`,
      //         "id": `${symbol}`
      //     }));
      // }
      // 订阅K线
      for (let symbol of this.symbols) {
        ws.send(
          JSON.stringify({
            sub: `market.${symbol}.kline.1day`,
            id: `${symbol}sub`
          })
        )
      }
      // 订阅 60日 K线
      for (let symbol of this.symbols) {
        let json = {
          req: `market.${symbol}.kline.1day`,
          id: `${symbol}`,
          from: parseInt(new Date().getTime() / 1000 - 60 * 60 * 24 * 60),
          to: parseInt(new Date().getTime() / 1000)
        }
        // console.log(json)
        ws.send(JSON.stringify(json))
      }
    },
    calculateGains(now, open) {
      if (now > open) {
        return (now - open) / open * 100
      } else if (now < open) {
        return (open - now) / open * 100
      } else {
        return 0
      }
    },
    init() {
      var ws = new WebSocket(this.WS_URL)
      ws.on('open', () => {
        console.log('open')
        this.subscribe(ws)
      })
      ws.on('message', data => {
        let text = pako.inflate(data, {
          to: 'string'
        })
        let msg = JSON.parse(text)
        if (msg.ping) {
          // console.log(msg);
          ws.send(
            JSON.stringify({
              pong: msg.ping
            })
          )
        } else if (msg.tick || msg.data) {
          // console.log(msg);
          this.handle(msg)
        } else {
          // console.log(text)
        }
      })
      ws.on('close', () => {
        console.log('close')
        this.init()
      })
      ws.on('error', err => {
        console.log('error', err)
        this.init()
      })
    }
  },
  mounted() {
    let usdt = localStorage.getItem('USDT')
    this.usdt = usdt ? JSON.parse(usdt) : this.usdt
    this.searched = this.usdt
    for (let i of this.usdt) {
      this.symbols.push(i.name)
    }
    this.init()
    // var hast = this
    // ipcRenderer.on('market', (event, arg) => {
    //   hast.cover(arg)
    //   setTimeout(() => {
    //     ipcRenderer.send('market')
    //   }, 3000)
    // })
    // setTimeout(() => {
    //   ipcRenderer.send('market')
    // }, 2000)
  }
}
</script>

<style lang="less">
.target {
  position: absolute;
  width: 100%;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  .md-card {
    position: relative;
    height: 100%;
    .md-content {
      height: auto !important;
      max-height: none !important;
    }
  }
  .md-table-cell {
    .md-table-cell-container {
      transition: all 0.3s;
    }
    &.small {
      .md-table-cell-container {
        background-color: #ffd2d2;
      }
    }
    &.big {
      .md-table-cell-container {
        background-color: #cffae9;
      }
    }
  }
}
</style>