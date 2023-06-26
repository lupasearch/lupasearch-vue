# Product list

Product list page allows listing a specific subset of a products (for example, a specific category page) without search functionality.

Product list page allows using a separate query to retrieve a list of possible page links (for example, links of the categories).

In addition to the options below, product list page supports **all of the options** of the search results page ([Search result configuration](/docs/components//search-results.md)).

See available configuration options:

```js
import lupaSearch from "@getlupa/client";

const options = {
  initialFilters: {
    categoryId: ["123"],
  },
  categories: {
    queryKey: "",
    keys: {
      titleKey: "name",
      urlKey: "url",
    },
    filters: {
      parentCategoryId: ["123"],
    },
    back: {
      title: "Title page",
      url: "/title-page",
    },
    parent: {
      title: "Parent page",
      url: "/title-page/parent-page",
    },
    current: {
      title: "Current category",
      description: "Lorem ipsum",
    },
    routingBehavior: "direct-link",
  },
};

lupaSearch.productList(options);
```

- `initialFilters` - a LupaSearch filter object, used to set initial filters for the documents (products), displayed in the product list. For example, it can be used to filter out products of a specific category, products with a discount. Initial filters are not shown in the active filter section.

## Category settings

- `categories` - settings for category section.

- `queryKey` - a key of the query that is used to retrieve available categories for the page.

- `keys.titleKey` - key that is used to select a title of the category from returned category list;

- `keys.urlKey` - key that is used to select a url of the category from returned category list;

- `filters` - additional filters for the category query. Useful if you want to filter out only specific subset of the categories in this product list.

- `back` - category selection "back" section. Displayed as a link to go back to the previous parent category;

  - `title` - Title of the "back" section;

  - `url` - Url of the "back" section;

- `parent` - category selection "parent" section. Displayed as a main category in the list.

  - `title` - Title of the "parent" section;

  - `url` - Url of the "parent" section;

- `current` - information about current category. Is used to display textual summary about category at the bottom of the page;

  - `title` - Title of the current section;

  - `description` - Description of the current section. Description is rendered as html by default, so make sure to escape it or sanitize it before passing the parameter.

  - `descriptionTop` - Description of the current section, displayed at the top of page, below page title. Description is rendered as html by default.

## Routing behavior

Category filter, configured above, supports two ways of routing fot the categories with `routingBehavior` settings:

- `direct-link` - categories are simple `<a>` tags with direct links to the urls, defined in the category object;

- `event` - when user clicks on the category, a special event `lupaRedirect` is emitted on the window object. The event can then be handled by the plugin user:

```js
window.addEventListener("lupaRedirect", (data) => {
  // data.detail - redirect url
});
```
