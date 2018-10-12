<template>
  <div>
    In abeyance
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  data() {
    return {}
  },
  computed: {},
  methods: {
    ...mapActions(['SEND']),
    message(i) {
      console.log(i)
    }
  },
  mounted() {
    // this.SEND(
    //   JSON.stringify({
    //     op: 'req',
    //     topic: 'accounts.list',
    //     AccessKeyId: 'b83e7bc2-15b7531d-7657561b-b62c2',
    //     SignatureVersion: '2',
    //     Timestamp: new Date().toISOString(),
    //     Signature: '4F65x5A2bLyMWVQj3Aqp+B4w+ivaA7n5Oi2SuYtCJ9o='
    //   })
    // )
  }
}
</script>

<style lang="less">
</style>
