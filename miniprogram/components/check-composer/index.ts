Component({
  properties: {
    value: {
      type: String,
      value: '',
    },
  },
  methods: {
    onInput(event: { detail: { value: string } }) {
      this.triggerEvent('change', { value: event.detail.value })
    },
    onPaste() {
      wx.getClipboardData({
        success: (res) => {
          const next = (res.data || '').trim()
          if (!next) {
            wx.showToast({ title: '剪贴板为空', icon: 'none' })
            return
          }
          this.triggerEvent('change', { value: next })
        },
        fail: () => {
          wx.showToast({ title: '无法读取剪贴板，请手动粘贴', icon: 'none' })
        },
      })
    },
    onSubmit() {
      this.triggerEvent('submit', { text: this.properties.value || '' })
    },
  },
})
