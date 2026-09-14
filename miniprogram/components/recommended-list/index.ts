import type { RecommendedItem } from '../../types/index'

Component({
  properties: {
    items: {
      type: Array,
      value: [] as RecommendedItem[],
    },
    compact: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    onItemTap(event: { currentTarget: { dataset: { id?: string } } }) {
      const id = event.currentTarget.dataset.id
      if (!id) {
        return
      }
      this.triggerEvent('itemtap', { id })
    },
  },
})
