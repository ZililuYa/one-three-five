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
        <md-table-cell md-label="Symbol" md-sort-by="symbol">{{ item.symbol.replace('usdt','/usdt').toLocaleUpperCase() }}</md-table-cell>
        <md-table-cell md-label="当前价" md-sort-by="close">${{ item.close }}</md-table-cell>
        <md-table-cell md-label="开盘价" md-sort-by="open">${{ item.open }}</md-table-cell>
        <md-table-cell md-label="今天最高价" md-sort-by="high">${{ item.high }}</md-table-cell>

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
    return items.filter(item => toLower(item.symbol).includes(toLower(term)))
  }

  return items
}

export default {
  data: () => ({
    search: null,
    searched: [],
    orderbook: {},
    WS_URL: 'wss://api.huobi.br.com/ws',
    usdt: ['ethusdt', 'btcusdt'],
    users: []
  }),
  methods: {
    newUser() {
      // window.alert('Noop')
    },
    searchOnTable() {
      this.searched = searchByName(this.users, this.search)
    },
    cover(data) {
      let user = []
      let t = 1
      for (let i in data) {
        for (let o of this.usdt) {
          if (i === o) {
            if (data[i]) {
              data[i].id = t
              t++
              user.push(data[i])
            }
          }
        }
      }
      this.users = user
      this.searchOnTable()
      // for (var i of data) {
      //   console.log(i)
      // }
    },
    handle(data) {
      // console.log('received', data.ch, 'data.ts', data.ts, 'crawler.ts', moment().format('x'));
      let symbol = data.ch.split('.')[1]
      let channel = data.ch.split('.')[2]
      switch (channel) {
        case 'depth':
          orderbook[symbol] = data.tick
          console.log('depth', data.tick)
          break
        case 'kline':
          data.tick.symbol = symbol
          this.orderbook[symbol] = data.tick
          this.cover(this.orderbook)
          // console.log('kline', data.tick);
          break
      }
    },

    subscribe(ws) {
      var symbols = ['ethusdt', 'btcusdt']
      // 订阅深度
      // 谨慎选择合并的深度，ws每次推送全量的深度数据，若未能及时处理容易引起消息堆积并且引发行情延时
      // for (let symbol of symbols) {
      //     ws.send(JSON.stringify({
      //         "sub": `market.${symbol}.depth.step0`,
      //         "id": `${symbol}`
      //     }));
      // }
      // 订阅K线
      for (let symbol of symbols) {
        ws.send(
          JSON.stringify({
            sub: `market.${symbol}.kline.1day`,
            id: `${symbol}`
          })
        )
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
        } else if (msg.tick) {
          // console.log(msg);
          this.handle(msg)
        } else {
          console.log(text)
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
    this.searched = this.users
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
}
</style>