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

      <md-table-empty-state md-label="No users found" :md-description="`No user found for this '${search}' query. Try a different search term or create a new user.`">
        <md-button class="md-primary md-raised" @click="newUser">正在加载行情</md-button>
      </md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="Symbol" md-sort-by="symbol">{{ item.symbol.replace('usdt','/usdt').toLocaleUpperCase() }}</md-table-cell>
        <md-table-cell md-label="当前价" md-sort-by="close">{{ item.close }}</md-table-cell>
        <md-table-cell md-label="开盘价" md-sort-by="open">{{ item.open }}</md-table-cell>
        <md-table-cell md-label="今天最高价" md-sort-by="high">{{ item.high }}</md-table-cell>

      </md-table-row>
    </md-table>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
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
  name: 'TableSearch',
  data: () => ({
    search: null,
    searched: [],
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
    }
  },
  mounted() {
    this.searched = this.users
    var hast = this
    ipcRenderer.on('market', (event, arg) => {
      hast.cover(arg)
      setTimeout(() => {
        ipcRenderer.send('market')
      }, 3000)
    })
    setTimeout(() => {
      ipcRenderer.send('market')
    }, 2000)
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