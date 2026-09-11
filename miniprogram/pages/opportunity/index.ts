import { HOME_VIEW_STATE } from '../../mock/homeState'
import {
  filterOpportunities,
  mockOpportunities,
  OPPORTUNITY_FILTERS,
  type OpportunityFilter,
} from '../../mock/opportunities'
import type { HomeViewState, Opportunity } from '../../types/index'
import { openOpportunityDetail } from '../../utils/checkSession'

type OpportunityPageData = {
  viewState: HomeViewState
  filters: OpportunityFilter[]
  activeFilter: OpportunityFilter
  opportunities: Opportunity[]
}

function listForFilter(filter: OpportunityFilter): Opportunity[] {
  if (HOME_VIEW_STATE !== 'success') {
    return []
  }
  return filterOpportunities(mockOpportunities, filter)
}

Page({
  data: {
    viewState: HOME_VIEW_STATE,
    filters: [...OPPORTUNITY_FILTERS],
    activeFilter: '全部',
    opportunities: [],
  } as OpportunityPageData,

  onLoad() {
    this.hydrate()
  },

  hydrate() {
    const viewState = HOME_VIEW_STATE
    const activeFilter = this.data.activeFilter || '全部'
    this.setData({
      viewState,
      activeFilter,
      opportunities: viewState === 'success' ? listForFilter(activeFilter) : [],
    })
  },

  onRetry() {
    this.hydrate()
  },

  onFilterTap(event: { currentTarget: { dataset: { filter?: string } } }) {
    const next = event.currentTarget.dataset.filter
    if (!next || next === this.data.activeFilter) {
      return
    }
    const activeFilter = next as OpportunityFilter
    this.setData({
      activeFilter,
      opportunities: listForFilter(activeFilter),
    })
  },

  onOpportunityTap(event: { detail: { id?: string } }) {
    const id = event.detail.id
    if (!id) {
      return
    }
    openOpportunityDetail(id)
  },
})
