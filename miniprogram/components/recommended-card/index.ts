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
})
