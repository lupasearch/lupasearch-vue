# Overview

Search Box configuration usage, including default value for each property:

```js
import lupaSearch from "@getlupa/client";

const options = {
  inputSelector: "#searchBox",
  minInputLength: 2,
  searchTriggers: ["#searchButton"],
  debounce: 100,
  inputAttributes: {
    name: "q",
  },
  showTotalCount: true,
  labels: {
    placeholder: "Search for products...",
    noResults: "There are no results found.",
    moreResults: "Show more results",
    currency: "€",
    priceSeparator: ",",
    defaultFacetLabel: "Category:",
  },
  links: {
    searchResults: "/search",
  },
};

lupaSearch.searchBox(options);
```

- `inputSelector` - css selector to find your search input element;

- `searchTriggers` - an optional list of html selectors that plugin will bind to to trigger the search event with a current search input value;

- `minInputLength` - minimum user input length to perform suggestion/document search;

- `debounce` - search input debounce time in ms. Disabled - if set to 0 or `undefined`.

- `inputAttributes` - key value pairs of custom html attributes to apply to the main search box input element.

- `showTotalCount` - defines whether to show total result count near the `moreResults` label.

- `labels.placeholder` - input placeholder text to display when search input is empty;

- `labels.noResults` - text to show when there are no matching results;

- `labels.moreResults` - text to display on button that leads user to search results page;

- `labels.currency` - label of the currency, where price is displayed;

- `labels.priceSeparator` - decimal separator for price value (19,85 €)

- `labels.defaultFacetLabel` - label to show for the first suggestion that has multiple facets returned. For example: (`books 'in category': entertainment`).

- `links.searchResults` - url of the full search result page that user should be redirected to, when clicks ENTER or "More results" button. These query parameters will be appended to the search results url: `?q=` - user search string; `&f.{facetKey}=` - if user clicks on a suggestion that is grouped by facet, it's key and value is added to the query string.

Search Box configuration can also include additional parameters. If you need to hide suggestion or product panel, just omit it from the configuration.

# Configuration parameters

## Search box panels

Search box can be built from different panels that represent different set of results.

Each panel is positioned from top to bottom, one after another.

Individual elements will have different classes applied, so you could use CSS (`flex` or `grid`) for more advanced control of their positions.

```js
const options = {
  panels: [
    {
      type: "suggestion",
    },
    {
      type: "document",
    },
  ],
};
```

There are two available `panel` types: `suggestion` and `document`. `suggestion` panel is for displaying a list of suggestions to autocomplete user search query, and `document` panel displays a list of documents that match user query.

## Autocomplete suggestions panel

```js
const options = {
  panels: [
    {
      type: "suggestion",
      queryKey: "",
      highlight: true,
      limit: 5,
    },
  ],
};
```

The configuration above adds a suggestion panel which autocompletes user searches with suggestion phrases from GetLupa suggestion query, referenced by `queryKey`.

- `queryKey` - a reference to the `SUGGESTION` search query in GetLupa. Required;

- `highlight` - defines whether to highlight matching parts of the suggestion phrase;

- `limit` - max number of suggestions to display.

## Documents panel

```js
const options = {
  panels: [
    {
      type: "document",
      queryKey: "",
      limit: 5,
      links: {
        details: "/{id}",
      },
      titleKey: "name",
      idKey: "id",
      searchBySuggestion: true,
      elements: [
        {
          type: "image",
          key: "image",
          placeholder: "placeholder.png",
          baseUrl: "https://lupasearch.com/images/",
          customUrl: (document) => {
            return `${baseUrl}/${document.image}?quality=150`;
          },
        },
        {
          type: "title",
          key: "name",
          isHtml: false,
        },
        {
          type: "custom",
          key: "author",
          className: "customClassName",
          isHtml: false,
          action: (document) => {
            console.log("author was clicked", document);
          },
        },
        {
          type: "description",
          key: "description",
          isHtml: true,
        },
        {
          type: "price",
          key: "regular_price",
          display: (document) => {
            return true;
          },
        },
        {
          type: "customHtml",
          className: "lupa-card-discount",
          html: (doc) => `<div>${doc.id} ${doc.name}</div>`,
          action: (document) => {
            console.log("custom element was clicked", document);
          },
        },
      ],
    },
  ],
};
```

Document panel can be used to display products or other items that match given search query best. You can have multiple document panels in your search box, each with different search query key.

- `queryKey` - a reference to the DOC search query in GetLupa. Required;

- `limit` - maximum number of products displayed;

- `links.details` - a constructable link that user is redirected to after clicking on a specific item in the panel. Use document fields like `id` in curly brackets (`{id}`) to build desired link url.

- `titleKey` - a key that references a main title of a document. Used in search history, if user clicks on a document in search box.

- `idKey` - a key that references a unique document identifier. Used in analytics to track document clicks.

- `searchBySuggestion` - if `true`, will display products that match first suggestion instead of search query.

- `elements` - a list of elements to display in each product panel. For a full list of elements and configurations, see "Document panel fields" section.

## Document panel fields

Common panel fields:

- `key` - key of your document property to display in that field. Required.

- `display` - optional function to determine wether field should be displayed. Receives a document entry and should return `true` or `false`. If function is not defined, field is always displayed, unless document does not have that property.

This is the list of available search box document fields. By convention, image element, if defined, will appear on the left of each document element.

- `image` - displays an image.

  - `placeholder` - placeholder image to show if item does not have an image;

  - `baseUrl` - if defined, it will be prepended to image path for each each product.

  - `customUrl` - Provide a function that returns image url from document. Overrides all other image options.

- `title` - title of the product.

  - `isHtml` - if `true`, object property is rendered as html.

- `description` - description of the product.

  - `isHtml` - if `true`, object property is rendered as html.

- `price` - final price of the product, after any discounts;

- `regularPrice` - regular price of the product, before discount;

- `custom` - a custom field that is rendered as a simple text;

  - `className` - custom class name that will be applied to the element;

  - `isHtml` - if `true`, object property is rendered as html;

  - `action` - action to execute when user clicks on the custom html element. Receives `document` as a parameter.

- `customHtml` a custom field, rendered as html.

  - `className` custom class name that will be applied to the element;

  - `html` a function that receives document object and should return an html string. Make sure to sanitize any document fields if any of the used document fields could be unsafe, or user-generated;

  - `action` - action to execute when user clicks on the custom html element. Receives `document` as a parameter.

## Search History

```js
const options = {
  history: {
    labels: {
      clear: "Clear History",
    },
  },
};
```

Search history tracks recent user searches in browser local storage.

Search history, if enabled, is shown when user clicks on empty search input. History can be cleared item by item or all at once.

- `history.labels.clear` - the text to display on "Clear all History" action.

## Statistics

By using tracking API, the plugin should be able to track these events in the search box:

- User enters his search query (with configurable debounce time, default 500ms);
- User clicks on suggestion;
- User clicks on product;
- User clicks ENTER or "View all results" button.
