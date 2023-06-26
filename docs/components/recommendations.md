# Recommendations

## Product recommendations

This is a component that allows to display similar product recommendations for given product id (`itemId`).

Basic usage:

```js
import lupaSearch from '@getlupa/client'

const options = {
  // ... Pass all other options from search results component configuration
  ...SEARCH_RESULTS_OPTIONS,
  containerSelector: '#container-to-render-recommender',
  queryKey: 'main-query-key',
  itemId: '1',
  carousel: {
    scrollPerPage: 1,
    itemsToShow: 2,
    snapAlign: 'center'
  }
}

lupaSearch.recommendations(options)
```

- `containerSelector` - container selector to render recommendation carousel in;

- `queryKey` - query key to use recommendations from. For most cases, you should use your main search query key;

- `itemId` - item (product) id to retrieve recommendations for;

- `carousel` - additional options for product carousel.

Product recommendation requires all options from the search result conmponent (to display correct product card elements in recommendations).

**Carousel options**

```js
import lupaSearch from '@getlupa/client'

const options = {
  // ... Other options
  carousel: {
    scrollPerPage: 1,
    itemsToShow: 2,
    snapAlign: 'center',
    breakpoints: {
      768: {
        itemsToShow: 3,
        scrollPerPage: 1
      },
      1024: {
        itemsToShow: 5,
        scrollPerPage: 1
      }
    }
  }
}

lupaSearch.recommendations(options)
```

It is possible to pass carousel component options to `carousel` option property. Check (here)[https://ismail9k.github.io/vue3-carousel/] for all available options.

## Clear recommendations

Use `clearRecommendations` to cleanup the component after your page is destroyed (important on single-page applications):

```js
import lupaSearch from '@getlupa/client'

lupaSearch.clearRecommendations('#my-recommendations-container')
```

## Analytics and AB testing

AB testing allows to compare your old recommender and LupaSaerch recommender converion rate by sending recommender click events to analytics aggregator, configured using [Tracking](/docs/components/recommendations.md).

```js
import lupaSearch from '@getlupa/client'

{
  const options = {
    // ... Other recommendation options
    abTesting: {
      enabled: true,
      originalIds: ['2', '4', '8'],
      oldRecommenderDisplayRatio: 0.5
    }
  }
}
```

- `enabled` - if set to true, AB testing is enabled;

- `oldRecommenderDisplayRatio` - a chance from 0-1 that the recommender with provided original old recommender ids will be shown. `0.5` should work for most cases;

- `originalIds` - list of product ids that would have been recommended by your old recommendation engine.

Using the configuration above, there is a 50% chance that recommender will display products with ids `2`, `4`, `8` instead of LupaSearch recommender to compare which recommender produces better results.

Make sure to enable [tracking](/docs/components/recommendations.md) for analytics AB testing to work.
