export type UnfoldedFilter = { key: string; value: string; type: FilterType }

export type LabeledFilter = UnfoldedFilter & { label: string }

export type FilterType = 'terms' | 'range' | 'hierarchy'
