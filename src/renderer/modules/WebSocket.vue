<template>
  <div></div>
</template>

<script>
import WebSocket from 'ws'
import pako from 'pako'
import { mapActions, mapState } from 'vuex'
import { setTimeout } from 'timers'
export default {
  data() {
    return {
      timing: '',
      WS_URL: 'wss://api.huobi.br.com/ws',
      ws: null
    }
  },
  props: {
    mess: {
      type: Function,
      default: function() {}
    }
  },
  watch: {
    send: function(n, old) {
      console.log('发送', n)
      if (this.ws) this.ws.send(n)
    }
  },
  computed: {
    ...mapState({
      send: state => state.ws.send
    })
  },
  methods: {
    ...mapActions(['CONNECT', 'MESSAGE', 'SEND']),
    timingFun() {
      // 定时刷新
      if (this.timing) window.clearTimeout(this.timing)
      this.timing = window.setTimeout(function() {
        window.location.reload()
      }, 1000 * 30)
    },
    init() {
      this.ws = new WebSocket(this.WS_URL)
      console.log('开始连接HuoBi服务器WS')
      this.ws.on('open', () => {
        console.log('连接成功')
        // this.subscribe(ws)
        this.CONNECT(true)
      })
      this.ws.on('message', data => {
        this.timingFun()
        let text = pako.inflate(data, {
          to: 'string'
        })
        let msg = JSON.parse(text)
        if (msg.ping) {
          // console.log(msg);
          this.ws.send(
            JSON.stringify({
              pong: msg.ping
            })
          )
        } else if (msg.tick || msg.data) {
          // console.log(msg);
          //   this.handle(msg)
          // this.message(mgs)
          this.mess(msg)
          setTimeout(() => {
            this.MESSAGE(msg)
          }, 5)
        } else if (msg.status === 'error') {
          console.log(msg['err-msg'])
        }
      })
      this.ws.on('close', () => {
        console.log('close')
        this.init()
      })
      this.ws.on('error', err => {
        console.log('error', err)
        this.init()
      })
    }
  },
  mounted() {
    this.init()
  }
}
</script>

<style lang="less">
</style>
