import type { RecommendedItem } from '../../types/index'

Component({
  properties: {
    item: {
      type: Object,
      value: {} as RecommendedItem,
    },
    layout: {
      type: String,
      value: 'list',
    },
    compact: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    card: {} as RecommendedItem,
  },
  lifetimes: {
    attached() {
      this.setData({
        card: (this.properties.item || {}) as RecommendedItem,
      })
    },
  },
  observers: {
    item(item: RecommendedItem) {
      this.setData({
        card: item || ({} as RecommendedItem),
      })
    },
  },
})
