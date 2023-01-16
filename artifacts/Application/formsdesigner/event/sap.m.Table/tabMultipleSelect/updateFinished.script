const binding = this.getBinding("items");
const length = binding.getLength();

const paramSelect = this.getParent()
    .getParent()
    .getItems()[0]
    .getContent()
    .filter((item) => item.sId.split("-")[0] === "inElementFormMultipleSelectValidationParam")[0];

if (paramSelect) Utils.buildValParamSelect(paramSelect, length);
