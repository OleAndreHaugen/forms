const listItem = oEvent.getParameter("listItem")
const context  = listItem.getBindingContext()
const data = context.getObject();

controller.selectObjectFromId(data.id);