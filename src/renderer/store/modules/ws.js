let state = {
  message: {},
  connect: false,
  send: {}
}

const mutations = {
  SEND(state, json) {
    state.send = json
  },
  MESSAGE(state, json) {
    state.message = json
  },
  CONNECT(state, bo) {
    state.connect = bo
  }
}

const actions = {
  SEND({ commit }, json) {
    // do something async
    commit('SEND', json)
  },
  MESSAGE({ commit }, json) {
    // do something async
    commit('MESSAGE', json)
  },
  CONNECT({ commit }, bo) {
    // do something async
    commit('CONNECT', bo)
  },
}

export default {
  state,
  mutations,
  actions
}
