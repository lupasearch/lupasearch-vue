# Dynamic data - overview

You can use dynamic data to extend product data with fields from your API or any other external sources.

This is useful when:

- You have a very large amount of additional data, and it is inefficient to store it in LupaSearch indices;

- You have dynamic data that changes based on conditions, outside of LupaSearch control, like dynamic individual prices, or rapidly changing product stock.

Dynamic data works only with search results/search container components.

## Dynamic data handler

To enable dynamic data, add the following configuration to search result options:

```ts
const options = {
  // ... Other search results options
  dynamicData: {
    enabled: true,
    handler: async (ids: string[]) => {},
  },
};
```

LupaSearch plugin will call the `handler` function each time a new batch of documents is retrieved. You can use handler function to retrieve any additional data from your API based on provided document ids.

An example of handler function can look like this:

```ts
const options = {
  // ... Other search results options
  dynamicData: {
    enabled: true,
    handler: async (ids: string[]) => {
      // Retrieve document data from your API for all of the provided ids
      const result = await fetch(
        `https://your-api.com/v1/extend?ids=${ids.join(",")}`
      );
      return result;
    },
  },
};
```

Expected result format should include a list of documents with extended data. For example:

```ts
const options = {
  // ... Other search results options
  dynamicData: {
    enabled: true,
    handler: async (ids: string[]) => {
      // Simulating returned data
      return [
        {
          id: "89465",
          dynamicPrice: 18.99,
          stock: 4,
        },
        {
          id: "21597",
          dynamicPrice: 12.2,
          stock: 8,
        },
        // ... Other documents
      ];
    },
  },
};
```

IMPORTANT: Each of the returned products (documents) must contain a product id, so that LupaSearch plugin can recognize which data belongs to which document.

## Using dynamic data in product card element

You can use extended product data in any element of the search results configuration:

For example:

```ts
const options = {
  elements: [
    // ... Other elements

    // Displays a new `dynamicPrice` field as a regular price field
    {
      type: "regularPrice",
      key: "dynamicPrice",
    },
    // You can use dynamically loaded fields in custom elements as well:
    {
      type: "customHtml",
      key: "index",
      className: "dynamic-stock",
      display: (doc: Document) => Boolean(doc.stock),
      html: (doc: Document) => {
        `<div>Product stock is: ${doc.stock}</div>`;
      },
    },
  ],
};
```

NOTE: It is your responsibility to escape any potentially unsafe or user generated data when using a custom html element.

Additionally, you can add a `dynamic` property into the element configuration:

```ts
const options = {
  elements: [
    {
      type: "regularPrice",
      key: "dynamicPrice",
      dynamic: true,
    },
  ],
};
```

This will instruct LupaSearch to add class `.lupa-loading-dynamic-data` to the element when data is being fetched. You can use your own css to apply any additional styles to the element to indicate for the user that document data is loading. `dynamic` property is not required to use dynamic fields in the element.

## Using promises

You can also use promises to retrieve and pass data, if your development pipeline does not support `async/await` syntax. For example:

```ts
const options = {
  // ... Other search results options
  dynamicData: {
    enabled: true,
    hanlder: (ids: string[]) => {
      return new Promise((resolve) => {
        // Simulating data fetch with settimeout
        const yourExtendedData = [{ id: "1", dynamic: "5" }];
        setTimeout(() => resolve(yourExtendedData), 500);
      });
    },
  },
};
```

## Dynamic data cache

If cache option is enabled, LupaSearch will not request to load data for documents that were already fetched. Cache persists until the page is reloaded.

```ts
const options = {
  // ... Other search results options
  dynamicData: {
    cache: true,
    enabled: true,
    handler: async (ids: string[]) => {
      // Retrieve additional document data for provided ids
    },
  },
};
```

## Usage with Search box

It is possible to use dynamic data in search box too.

If you already have dynamic data handler defined in search results component, you don't have to redefine it again in the search box, you just need to pass the following object, and the search results dynamic data handler will be reused.

```ts
const options = {
  // ... Other search box options
  dynamicData: {
    enabled: true,
  },
};
```

Dynamic search result data handler will always have preference over search box dynamic data handler.

Dynamic data in search box will use additional debounce (as configured in search box) after results are retrieved before calling the dynamic data handler function.
