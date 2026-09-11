Component({
  properties: {
    nodes: {
      type: Array,
      value: [],
    },
    publisher: {
      type: String,
      value: '',
    },
    document: {
      type: String,
      value: '',
    },
    publishedAt: {
      type: String,
      value: '',
    },
    verified: {
      type: Boolean,
      value: false,
    },
    unverified: {
      type: Boolean,
      value: false,
    },
    showOfficialAction: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    onOpenOfficial() {
      this.triggerEvent('official')
    },
  },
})
