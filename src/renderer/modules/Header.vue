<template>
  <div class="page-container md-layout-column">
    <md-toolbar class="md-primary header_wrap">
      <md-button class="md-icon-button" @click="showNavigation = true">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title">HuoBi助手</span>

      <div class="md-toolbar-section-end">
        <md-button class="md-icon-button" @click="send('min')">
          <md-icon>
            <md-icon>remove</md-icon>
          </md-icon>
        </md-button>
        <md-button class="md-icon-button" @click="send('max')">
          <md-icon>
            <md-icon>web_asset</md-icon>
          </md-icon>
        </md-button>
        <md-button class="md-icon-button" @click="send('close')">
          <md-icon>
            <md-icon>close</md-icon>
          </md-icon>
        </md-button>
      </div>
    </md-toolbar>

    <md-drawer :md-active.sync="showNavigation">
      <md-toolbar class="md-transparent" md-elevation="0">
        <span class="md-title">MENU</span>
      </md-toolbar>

      <md-list>
        <md-list-item v-for="i in menu" :key="i.id" @click='chang(i.id)'>
          <md-icon v-show="path==='/'+i.id">{{i.icon}}</md-icon>
          <span class="md-list-item-text">{{i.label}}</span>
        </md-list-item>
      </md-list>

      <md-button class="md-icon-button md-lower-right-corner" @click="showNavigation = false">
        <md-icon>
          <md-icon>close</md-icon>
        </md-icon>
      </md-button>

    </md-drawer>

    <md-drawer class="md-right" :md-active.sync="showSidepanel">
      <md-toolbar class="md-transparent" md-elevation="0">
        <span class="md-title">Favorites</span>
      </md-toolbar>

      <md-list>
        <md-list-item>
          <span class="md-list-item-text">Abbey Christansen</span>

          <md-button class="md-icon-button md-list-action">
            <md-icon class="md-primary">chat_bubble</md-icon>
          </md-button>
        </md-list-item>

        <md-list-item>
          <span class="md-list-item-text">Alex Nelson</span>

          <md-button class="md-icon-button md-list-action">
            <md-icon class="md-primary">chat_bubble</md-icon>
          </md-button>
        </md-list-item>

        <md-list-item>
          <span class="md-list-item-text">Mary Johnson</span>

          <md-button class="md-icon-button md-list-action">
            <md-icon>chat_bubble</md-icon>
          </md-button>
        </md-list-item>
      </md-list>
    </md-drawer>

    <md-content>
      <slot></slot>
    </md-content>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {
  name: 'Header',
  data() {
    return {
      path: '',
      showNavigation: false,
      showSidepanel: false,
      menu: [
        {
          label: 'target',
          id: 'target',
          icon: 'send'
        },
        {
          label: 'earnings',
          id: 'earnings',
          icon: 'send'
        },
        {
          label: 'Select Your Currency',
          id: 'money',
          icon: 'send'
        },
        {
          label: 'set',
          id: 'set',
          icon: 'send'
        },
        {
          label: 'operation',
          id: 'operation',
          icon: 'send'
        }
      ]
    }
  },
  methods: {
    send(info) {
      ipcRenderer.send(info)
    },
    chang(i) {
      this.$router.push('/' + i)
      this.showNavigation = false
      this.path = this.$route.path
    }
  },
  mounted() {
    this.path = this.$route.path
  }
}
</script>

<style lang="less">
.md-lower-right-corner {
  position: absolute !important;
  right: 5px;
  bottom: 5px;
}
.md-list-item {
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background-color: #eee;
  }
  .md-list-item-text {
    text-transform: uppercase;
  }
}
.header_wrap {
  -webkit-app-region: drag;
  button {
    -webkit-app-region: no-drag;
  }
}
</style>
