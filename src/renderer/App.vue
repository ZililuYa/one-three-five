<template>
  <div id="app">
    <Header v-if="connect">
      <keep-alive>
        <router-view ref="tar" v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view ref="view" v-if="!$route.meta.keepAlive"></router-view>
    </Header>
    <div v-if="!connect" class="loading-app">
      <div>
        <md-progress-spinner :md-diameter="30" :md-stroke="3" md-mode="indeterminate"></md-progress-spinner>
      </div>
      <h5>
        连接HuoBi服务器中...
      </h5>
    </div>
    <WebSocket :mess='message'></WebSocket>
  </div>
</template>

<script>
import Header from './modules/Header.vue'
import WebSocket from './modules/WebSocket.vue'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'home',
  data() {
    return { ws: false }
  },
  computed: {
    ...mapState({
      connect: state => state.ws.connect
    })
  },
  components: { Header, WebSocket },
  mounted() {},
  methods: {
    succeed() {
      this.ws = true
    },
    message(message) {
      if (this.$refs.tar) this.$refs.tar.handle(message)
      if (this.$refs.view) this.$refs.view.message(message)
      // console.log(i, this.$refs.tar)
    }
  }
}
</script>

<style lang="less">
/* CSS */
@import url('assets/css/app.less');
.loading-app {
  text-align: center;
  padding-top: 20%;
}
</style>
