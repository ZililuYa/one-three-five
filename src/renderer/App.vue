<template>
  <div id="app">
    <Header>
      <router-view></router-view>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </Header>
    <!-- <router-view></router-view> -->
  </div>
</template>

<script>
import Header from './modules/Header.vue'
export default {
  name: 'home',
  components: { Header }
}
</script>

<style lang="less">
/* CSS */
@import url('assets/css/app.less');
</style>
