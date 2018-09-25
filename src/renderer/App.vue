<template>
  <div id="app">
    <Header>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </Header>
  </div>
</template>

<script>
import Header from './modules/Header.vue'
export default {
  name: 'home',
  components: { Header },
  mounted() {}
}
</script>

<style lang="less">
/* CSS */
@import url('assets/css/app.less');
</style>
