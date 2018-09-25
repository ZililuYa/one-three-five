<template>
  <div class="money">
    <form novalidate class="md-layout" @submit.prevent="validateUser">
      <md-card class="md-layout-item  md-small-size-100">
        <md-card-header>
          <div class="md-title">Currency List</div>
        </md-card-header>

        <md-card-content>
          <div class="md-layout md-gutter">
            <div class="md-layout-item md-small-size-100">
              <md-field :class="getValidationClass('firstName')">
                <label for="first-name">Transaction Pair</label>
                <md-input @input="form.firstName = form.firstName.toLowerCase()" name="first-name" id="first-name" autocomplete="given-name" v-model="form.firstName" :disabled="sending" />
                <span class="md-error" v-if="!$v.form.firstName.required">error</span>
                <span class="md-error" v-else-if="!$v.form.firstName.minlength">error</span>
              </md-field>
            </div>

            <div class="md-layout-item md-small-size-100">
              <md-button type="submit" class="md-raised md-primary">ADD Currency</md-button>
              <md-button class="md-primary" @click="save">Save Info</md-button>
            </div>
          </div>

          <md-table v-model="usdt" md-sort="name" md-card md-fixed-header>
            <md-table-row slot="md-table-row" slot-scope="{ item }" v-if="item">
              <md-table-cell md-label="Name" md-sort-by="name">{{ item.name.toUpperCase() }}</md-table-cell>
              <md-table-cell md-label="Display" width="150">
                <md-switch v-model="item.switch" class="md-primary">{{item.switch?'OPEN':'CLOSE'}}</md-switch>
              </md-table-cell>
              <md-table-cell md-label="Del" width="150">
                <md-button class="md-accent" @click="del(item)">
                  <md-icon>delete</md-icon>
                </md-button>
              </md-table-cell>
            </md-table-row>
          </md-table>

        </md-card-content>

        <md-progress-bar md-mode="indeterminate" v-if="sending" />
      </md-card>

      <md-snackbar :md-active.sync="userSaved">The user {{ lastUser }} was saved with success!</md-snackbar>

    </form>

    <md-snackbar :md-duration="3000" :md-position="'left'" :md-active.sync="showSnackbar" md-persistent>
      <span>{{info}}</span>
      <md-button class="md-primary" @click="showSnackbar = false">close</md-button>
    </md-snackbar>

  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'

export default {
  name: 'FormValidation',
  mixins: [validationMixin],
  data: () => ({
    usdt: [],
    showSnackbar: false,
    defUsdt: [
      {
        name: 'btcusdt',
        switch: true
      },
      {
        name: 'ethusdt',
        switch: true
      }
    ],
    form: {
      firstName: null
    },
    userSaved: false,
    sending: false,
    lastUser: null,
    info: ''
  }),
  validations: {
    form: {
      firstName: {
        required,
        minLength: minLength(3)
      }
    }
  },
  mounted() {
    let USDT = localStorage.getItem('USDT')
    if (USDT) {
      this.usdt = JSON.parse(USDT)
    } else {
      this.usdt = this.defUsdt
      this.save()
    }
  },
  methods: {
    infoModel(info) {
      this.info = info
      this.showSnackbar = true
    },
    save() {
      localStorage.setItem('USDT', JSON.stringify(this.usdt))
      this.infoModel('operate successfully，Refresh after 3 seconds')
      setTimeout(function() {
        window.location.reload()
      }, 3000)
    },
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    del(item) {
      let arr = []
      for (let i of this.usdt) {
        if (i.name !== item.name) {
          arr.push(i)
        }
      }
      this.usdt = arr
    },
    clearForm() {
      this.$v.$reset()
      this.form.firstName = ''
    },
    validateUser() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.usdt.push({
          name: this.form.firstName,
          switch: true
        })
        this.clearForm()
      }
    }
  }
}
</script>

<style lang="less">
.money {
  position: absolute;
  width: 100%;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  form.md-layout {
    position: relative;
    height: 100%;
  }
  .md-card-content {
    position: relative;
    height: calc(100% - 150px);
  }
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
