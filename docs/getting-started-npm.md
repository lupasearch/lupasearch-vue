# Getting started

This documentation will help you with integrating the Lupa search plugin to your website;

## Installation

Install package using `npm` or `yarn`:

```sh
npm install @getlupa/client

yarn add @getlupa/client
```

## Usage

Import lupaSearch package and pass configuration options:

```ts
import lupaSearch, {
  SearchBoxOptions,
  SearchResultsOptions,
  TrackingOptions,
} from "@getlupa/client";

function tracking(options: TrackingOptions) {
  lupaSearch.tracking(options);
}

function searchBox(options: SearchBoxOptions) {
  lupaSearch.searchBox(options);
}

function searchResults(options: SearchResultsOptions) {
  lupaSearch.searchResults(options);
}
```

### Styling

To use default lupa style in your project, import the following stylesheet to your main script file:

```js
import "@getlupa/client/dist/style.css";
```