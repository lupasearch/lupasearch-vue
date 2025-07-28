import { shallowMount } from "@vue/test-utils";
import SearchBoxProductTitle from "../SearchBoxProductTitle.vue";
import { DocumentElementType } from "@/types/DocumentElement";

describe("SearchBoxProductTitle.vue", () => {
  it("should render item text as simple string", () => {
    const wrapper = shallowMount(SearchBoxProductTitle, {
      propsData: {
        options: { isHtml: false, key: "name", type: DocumentElementType.TITLE },
        item: { name: "<div>Product title</div>" },
      },
    });
    const element = wrapper.find(".lupa-search-box-product-title");
    expect(element.text()).toEqual("<div>Product title</div>");
  });

  it("should render item text as html string", () => {
    const wrapper = shallowMount(SearchBoxProductTitle, {
      propsData: {
        options: { isHtml: true, key: "name", type: DocumentElementType.TITLE },
        item: { name: "<div>Product title</div>" },
      },
    });
    const element = wrapper.find(".lupa-search-box-product-title");
    expect(element.text()).toEqual("Product title");
  });

  it("should render empty string if property is empty", () => {
    const wrapper = shallowMount(SearchBoxProductTitle, {
      propsData: {
        options: { isHtml: false, key: "other", type: DocumentElementType.TITLE },
        item: { name: "<div>Product title</div>" },
      },
    });
    const element = wrapper.find(".lupa-search-box-product-title");
    expect(element.text()).toEqual("");
  });
});
