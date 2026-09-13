Component({
  properties: {
    total: {
      type: Number,
      value: 0,
    },
    analyzing: {
      type: Number,
      value: 0,
    },
    waiting: {
      type: Number,
      value: 0,
    },
    done: {
      type: Number,
      value: 0,
    },
    items: {
      type: Array,
      value: [],
    },
    analyzingItems: {
      type: Array,
      value: [],
    },
  },
  methods: {
    onOpenAll() {
      this.triggerEvent('more')
    },
    onItemTap(event: { currentTarget: { dataset: { id?: string } } }) {
      const id = event.currentTarget.dataset.id
      if (!id) {
        return
      }
      this.triggerEvent('itemtap', { id })
    },
  },
})
