export const PRODUCT_LIST_CONFIGURATION = {
  initialFilters: {
    category: ['123']
  },
  categories: {
    queryKey: '0zcly1frbyyi',
    routingBehavior: 'direct-link',
    keys: {
      titleKey: 'name',
      urlKey: 'url'
    },
    filters: {
      category: ['123']
    },
    back: {
      title: 'Title page',
      url: '/title-page'
    },
    parent: {
      title: 'Parent page',
      url: '/title-page/parent-page'
    },
    current: {
      title: 'Current category',
      description: 'Lorem ipsum'
    }
  }
}
