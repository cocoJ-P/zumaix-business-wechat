import type { Opportunity } from '../../types/index'

Component({
  properties: {
    opportunity: {
      type: Object,
      value: {} as Opportunity,
    },
  },
  methods: {
    onTap() {
      const opportunity = this.properties.opportunity as Opportunity
      this.triggerEvent('tap', { id: opportunity && opportunity.id })
    },
  },
})
