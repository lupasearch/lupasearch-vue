export type TermFacetAction = {
  type: 'terms'
  value: string
  key: string
}

export type HierarchyFacetAction = {
  type: 'hierarchy'
  value: string
  key: string
}

export type RangeFacetAction = {
  type: 'range'
  value: string[]
  key: string
}

export type FacetAction = TermFacetAction | RangeFacetAction | HierarchyFacetAction
