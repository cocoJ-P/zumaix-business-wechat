Component({
  properties: {
    text: {
      type: String,
      value: '',
    },
    disabled: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    onTap() {
      if (this.properties.disabled) {
        return
      }
      this.triggerEvent('tap')
    },
  },
})
