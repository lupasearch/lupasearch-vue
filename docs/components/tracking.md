# Tracking

LupaSearch plugin can track significant user behavior events, like clicking on documents, suggestions or adding to cart.

For a list of all event types see Statistics section for Search Box and Search Results documentation.

## Base configuration

To enable tracking, add this block of code, above all other `lupaSaerch` configuration:

```js
import lupaSearch from "@getlupa/client";

lupaSearch.tracking({
  trackBase: true,
});
```

## Configuring user-specific events

For each user or session, the plugin can generate a random unique string, that could be used to improve search experience or provide personalized results:

```js
lupaSearch.tracking({
  trackBase: true,
  trackSession: true,
  trackUser: true,
});
```

## Emit events directly to your Google Analytics

Plugin supports emitting various search-related events directly to your analytics account, if it is available in the front-end, i.e. if `window.ga` or `window.dataLayer` function exists.

To setup google analytics, add extra parameters to the tracking object:

```js
lupaSearch.tracking({
  trackBase: true,
  analytics: {
    type: "ua",
    enabled: true,
    parentEventName: "GetLupa",
    ignoreEvents: ["search_query"],
    itemMap: (item: Record<string, unknown>) => {
      return {
        id: item.id
        name: item.name,
        price: item.price,
      };
    },
  },
});
```

- `analytics.type` - type of external analytics provider. Possible values:

  - `ua` - Google Universal Analytics. Sends events to existing `window.ga` object;

  - `ga4` - Google Analytics 4. Sends events to existing `window.dataLayer` object;

  - `debug` - Perform no action, just log event details to the console using `console.debug`.

- `analytics.enabled` - whether analytics tracking is enabled;

- `analytics.parentEventName` - name of the event category, that will appear in your analytics dashboard.

- `analytics.ignoreEvents` - array of ignored events (that will not be sent to google analytics) by name.

- `itemMap` - define a function that transforms your document item before sending it to external analytics service, as ecommerce object.
