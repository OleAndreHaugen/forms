const controller = {
    currentIndex: null,
    currentObject: null,
    currentFilter: null,
    previewData: null,

    elementTypes: [
        { icon: "sap-icon://form", text: "Form", type: "Form", parent: true },
        { icon: "sap-icon://table-view", text: "Table", type: "Table", parent: true },
        { icon: "sap-icon://header", text: "Form Title", type: "FormTitle", parent: false },
        { icon: "sap-icon://calendar", text: "Date Picker", type: "DatePicker", parent: false },
        { icon: "sap-icon://date-time", text: "Date Time Picker", type: "DateTimePicker", parent: false },
        { icon: "sap-icon://fa-regular/check-square", text: "Check Box", type: "CheckBox", parent: false },
        { icon: "sap-icon://checklist", text: "Check List", type: "CheckList", parent: false },
        { icon: "sap-icon://request", text: "Input", type: "Input", parent: false },
        { icon: "sap-icon://fa-solid/image", text: "Image", type: "Image", parent: false },
        { icon: "sap-icon://message-information", text: "Message Strip", type: "MessageStrip", parent: false },
        { icon: "sap-icon://number-sign", text: "Step Input", type: "StepInput", parent: false },
        { icon: "sap-icon://switch-views", text: "Switch", type: "Switch", parent: false },
        { icon: "sap-icon://fa-regular/circle", text: "Single Select", type: "SingleSelect", parent: false },
        { icon: "sap-icon://fa-regular/circle", text: "Single Choice", type: "SingleChoice", parent: false },
        { icon: "sap-icon://multi-select", text: "Multiple Select", type: "MultipleSelect", parent: false },
        { icon: "sap-icon://multi-select", text: "Multiple Choice", type: "MultipleChoice", parent: false },
        { icon: "sap-icon://text", text: "Text", type: "Text", parent: false },
        { icon: "sap-icon://document-text", text: "Text Area", type: "TextArea", parent: false },
    ],

    init: function () {
        jQuery.sap.require("sap.m.MessageBox");

        modellistElementTypes.setData(this.elementTypes);

        treeOutline.getBinding("items").filter([new sap.ui.model.Filter("option", "NE", "I")]);

        const outlineMenu = new sap.m.Menu();

        outlineMenu.addItem(
            new sap.m.MenuItem({
                text: "Copy",
                icon: "sap-icon://copy",
                press: function (oEvent) {
                    controller.handleContextMenu(oEvent, "copy");
                },
            })
        );

        outlineMenu.addItem(
            new sap.m.MenuItem({
                text: "Enable",
                icon: "sap-icon://fa-solid/toggle-on",
                press: function (oEvent) {
                    controller.handleContextMenu(oEvent, "enable");
                },
            })
        );

        outlineMenu.addItem(
            new sap.m.MenuItem({
                text: "Disable",
                icon: "sap-icon://fa-solid/toggle-off",
                press: function (oEvent) {
                    controller.handleContextMenu(oEvent, "disable");
                },
            })
        );

        outlineMenu.addItem(
            new sap.m.MenuItem({
                text: "Delete",
                icon: "sap-icon://delete",
                press: function (oEvent) {
                    controller.handleContextMenu(oEvent, "delete");
                },
            })
        );

        const outlineMenuSub = new sap.m.MenuItem({
            text: "Add Element",
        });

        controller.elementTypes.forEach(function (item) {
            if (!item.parent) {
                outlineMenuSub.addItem(
                    new sap.m.MenuItem({
                        text: item.text,
                        icon: item.icon,
                        press: function (oEvent) {
                            controller.handleContextMenu(oEvent, "add", item);
                        },
                    })
                );
            }
        });

        outlineMenu.addItem(outlineMenuSub);

        treeOutline.setContextMenu(outlineMenu);

        // ClickToPreview
        panPreview.attachBrowserEvent("click", function (e) {
            let target;

            if (e.target.id.indexOf("field") > -1) {
                target = e.target.id.split("--")[0];
            } else if (e.target.parentElement.id.indexOf("field") > -1) {
                target = e.target.parentElement.id.split("--")[0];
            } else if (e.target.parentElement.parentElement.id.indexOf("field") > -1) {
                target = e.target.parentElement.parentElement.id.split("--")[0];
            }

            if (target) {
                target = target.split("field")[1];
                if (target && target.substring) {
                    controller.selectObjectFromId(target.substring(0, 36));
                }
            }
        });

        controller.elementTypes.forEach(function (item) {
            elementToolbarType.addItem(new sap.ui.core.Item({ key: item.type, text: item.text }));
        });

        var binding = new sap.ui.model.Binding(modelpanTopProperties, "/", modelpanTopProperties.getContext("/"));

        binding.attachChange(function () {
            if (controller.previewData !== modeloPageDetail.getJSON()) {
                modeloPageDetail.refresh();
                controller.preview();
            }
        });

        this.list();
    },

    handleContextMenu: function (oEvent, key, item) {
        const context = oEvent.oSource.getBindingContext();
        const data = context.getObject();

        switch (key) {
            case "disable":
                data.disabled = true;
                controller.preview();
                break;

            case "enable":
                data.disabled = false;
                controller.preview();
                break;

            case "copy":
                controller.objectCopy();
                break;

            case "delete":
                controller.objectDelete();
                break;

            case "add":
                controller.currentObject = data;

                if (context.sPath.indexOf("elements") > -1) {
                    controller.currentIndex = parseInt(context.sPath.split("/")[4]) + 1;
                } else {
                    controller.currentIndex = null;
                }
                controller.addElement(item);
                break;

            default:
                break;
        }

        modeloPageDetail.refresh(true);
    },

    objectCopy: function () {
        const parent = controller.getParentFromId(modelpanTopProperties.oData.id);
        const newElement = JSON.parse(JSON.stringify(modelpanTopProperties.oData));
        let elementIndex = 0;

        if (modelpanTopProperties.oData.option === "P") {
            modeloPageDetail.oData.setup.forEach(function (section, i) {
                if (section.id === modelpanTopProperties.oData.id) elementIndex = i + 1;
            });

            newElement.id = ModelData.genID();
            newElement.title = newElement.title + " (COPY)";

            newElement.elements.forEach(function (element, i) {
                element.id = ModelData.genID();
                element.title = element.title + " (COPY)";

                if (element.items) {
                    element.items.forEach(function (items) {
                        items.id = ModelData.genID();
                    });
                }
            });

            modeloPageDetail.oData.setup.splice(elementIndex, 0, newElement);
        } else {
            parent.elements.forEach(function (element, i) {
                if (element.id === modelpanTopProperties.oData.id) elementIndex = i + 1;
            });

            newElement.id = ModelData.genID();
            newElement.title = newElement.title + " (COPY)";

            if (newElement.items) {
                newElement.items.forEach(function (items) {
                    items.id = ModelData.genID();
                });
            }

            parent.elements.splice(elementIndex, 0, newElement);
        }

        modeloPageDetail.refresh();
        controller.selectObjectFromId(newElement.id);
    },

    objectDelete: function () {
        ModelData.Delete(modeloPageDetail.oData.setup, "id", modelpanTopProperties.oData.id);

        modeloPageDetail.oData.setup.forEach(function (section, i) {
            ModelData.Delete(section.elements, "id", modelpanTopProperties.oData.id);
        });

        modelpanTopProperties.setData({});
        modelpanTopProperties.refresh();

        modeloPageDetail.refresh();
    },

    list: function () {
        apiList();
    },

    get: function (id, editable) {
        apiGet({
            parameters: {
                id: id,
            },
        }).then(function (req) {
            modeloPageDetail.setData(req);
            controller.preview();

            if (oApp.getCurrentPage === oPageStart) {
                tabDetail.setSelectedItem(tabDetailInfo);
            } else {
                treeOutline.fireItemPress();
            }

            oApp.to(oPageDetail);

            cockpitUtils.toggleEdit(editable);
            cockpitUtils.dataSaved = modeloPageDetail.getJSON();
        });
    },

    save: function () {
        // Check Required Fields
        if (cockpitUtils.isCockpit && !sap.n.Planet9.requiredFieldsCheck(cockpitUtils.requiredFields)) {
            return;
        }

        apiSave({
            data: modeloPageDetail.oData,
        }).then(function (req) {
            sap.m.MessageToast.show("Form Saved");
            modeloPageDetail.oData.id = req.id;
            modeloPageDetail.oData.updatedAt = req.updatedAt;
            modeloPageDetail.oData.updatedBy = req.updatedBy;
            modeloPageDetail.oData.createdAt = req.createdAt || req.updatedAt;
            modeloPageDetail.oData.createdBy = req.createdBy;
            modeloPageDetail.refresh();
            controller.list();

            cockpitUtils.dataSaved = modeloPageDetail.getJSON();
            cockpitUtils.toggleEdit(true);
        });
    },

    delete: function () {
        if (cockpitUtils.isCockpit) {
            sap.n.Planet9.objectDelete(function () {
                oApp.setBusy(true);
                sap.n.Planet9.setToolbarButton(false);

                apiDelete({
                    parameters: { id: modeloPageDetail.oData.id },
                }).then(function (req) {
                    sap.m.MessageToast.show("Form Deleted");
                    controller.list();
                    oApp.setBusy(false);
                    oApp.back();
                });
            }, "FORM");
        } else {
            sap.m.MessageBox.confirm("Delete this FORM ? This cannot be undone !", {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Danger Zone",
                actions: [sap.m.MessageBox.Action.DELETE, sap.m.MessageBox.Action.NO],
                initialFocus: "No",
                onClose: function (sAction) {
                    if (sAction === "DELETE") {
                        oApp.setBusy(true);
                        apiDelete({
                            parameters: { id: modeloPageDetail.oData.id },
                        }).then(function (req) {
                            sap.m.MessageToast.show("Form Deleted");
                            controller.list();
                            oApp.setBusy(false);
                            oApp.back();
                        });
                    }
                },
            });
        }
    },

    copy: function () {
        // Copy Object
        delete modeloPageDetail.oData.id;
        delete modeloPageDetail.oData.updatedAt;
        delete modeloPageDetail.oData.updatedBy;
        delete modeloPageDetail.oData.createdBy;
        delete modeloPageDetail.oData.createdAt;

        modeloPageDetail.oData.name = modeloPageDetail.oData.name + " - Copy";
        modeloPageDetail.refresh(true);

        cockpitUtils.toggleCreate();
    },

    setElementsFilter: function (type) {
        if (type === "Parent") {
            listElementTypes.getBinding("items").filter([new sap.ui.model.Filter("parent", "EQ", true)]);
        } else {
            listElementTypes.getBinding("items").filter([new sap.ui.model.Filter("parent", "EQ", false)]);
        }

        controller.currentFilter = type;
    },

    getParentFromId: function (id) {
        let parentData = null;
        modeloPageDetail.oData.setup.forEach(function (section, i) {
            section.elements.forEach(function (element, i) {
                if (element.id === id) parentData = section;
            });
        });

        return parentData;
    },

    getObjectFromId: function (id) {
        let elementData = null;
        modeloPageDetail.oData.setup.forEach(function (section, i) {
            if (section.id === id) elementData = section;

            section.elements.forEach(function (element, i) {
                if (element.id === id) elementData = element;
            });
        });

        return elementData;
    },

    expandParent: function (id) {
        modeloPageDetail.oData.setup.forEach(function (section, i) {
            if (section.id === id) {
                treeOutline.onItemExpanderPressed(treeOutline.getItems()[i], true);
            }
        });
    },

    selectObjectFromId: function (id) {
        const parent = controller.getParentFromId(id);
        if (parent) controller.expandParent(parent.id);

        const items = treeOutline.getItems();

        items.forEach(function (item, i) {
            const context = item.getBindingContext();
            const data = context.getObject();

            if (data.id === id) {
                treeOutline.setSelectedItemById(item.sId);
                treeOutline.fireItemPress();
            }
        });
    },

    newForm: function () {
        modeloPageDetail.setData({
            name: "",
            description: "",
            released: false,
            setup: [],
        });
        tabDetail.setSelectedItem(tabDetailInfo);
        controller.preview();
        cockpitUtils.toggleCreate();
        cockpitUtils.dataSaved = modeloPageDetail.getJSON();
        oApp.to(oPageDetail);
    },

    preview: function () {
        controller.previewData = modeloPageDetail.getJSON();

        FORMS.build(panPreview, {
            id: modeloPageDetail.oData.id,
            data: null,
            config: modeloPageDetail.oData,
        });
    },

    addElement: function (elementData) {
        let newElement = {
            id: ModelData.genID(),
            type: elementData.type,
            enableDescription: false,
            enablePlaceholder: false,
            enableDuplicate: false,
            enableLabel: true,
            disabled: false,
            duplicateButtonText: "Add",
            duplicateButtonType: "Transparent",
            placeholder: "",
            option: "E",
            title: elementData.type,
            description: "",
            required: false,
            items: [],
        };

        switch (elementData.type) {
            // Parents
            case "Table":
                newElement.option = "P";
                newElement.elements = [];
                newElement.rows = 5;
                break;

            case "Form":
                newElement.expanded = false;
                newElement.expandable = false;
                newElement.option = "P";
                newElement.elements = [];
                newElement.layout = "ResponsiveGridLayout";
                break;

            // Elements
            case "Text":
                newElement.titleStyle = "Auto";
                break;

            case "MessageStrip":
                newElement.messageText = "";
                newElement.messageType = "Information";
                newElement.messageIcon = false;
                break;

            case "Image":
                newElement.text = "Upload";
                newElement.buttonType = "Emphasized";
                break;

            case "CheckList":
                newElement.questionTitle = "Question";
                newElement.answerTitle = "Answer";

                newElement.items = [
                    {
                        id: ModelData.genID(),
                        question: "Question 1",
                        type: "Switch",
                        option: "I",
                    },
                    {
                        id: ModelData.genID(),
                        question: "Question 2",
                        type: "Switch",
                        option: "I",
                    },
                    {
                        id: ModelData.genID(),
                        question: "Question 3",
                        type: "Switch",
                        option: "I",
                    },
                ];
                break;

            case "SingleChoice":
                newElement.items = [
                    { id: ModelData.genID(), title: "", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "", key: "key3", option: "I" },
                ];
                newElement.horizontal = false;
                break;

            case "SingleSelect":
                newElement.items = [
                    { id: ModelData.genID(), title: "", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "", key: "key3", option: "I" },
                ];
                break;

            case "MultipleChoice":
                newElement.items = [
                    { id: ModelData.genID(), title: "", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "", key: "key3", option: "I" },
                ];
                newElement.validationParam = 1;
                newElement.validationType = "noLimit";
                newElement.horizontal = false;
                break;

            case "MultipleSelect":
                newElement.items = [
                    { id: ModelData.genID(), title: "", key: "key1", option: "I" },
                    { id: ModelData.genID(), title: "", key: "key2", option: "I" },
                    { id: ModelData.genID(), title: "", key: "key3", option: "I" },
                ];
                newElement.validationParam = 1;
                newElement.validationType = "noLimit";
                break;
        }

        if (controller.currentFilter === "Parent") {
            modeloPageDetail.oData.setup.push(newElement);
        } else {
            let currentObject = controller.currentObject.option === "P" ? controller.currentObject : controller.getParentFromId(controller.currentObject.id);
            if (controller.currentIndex) {
                currentObject.elements.splice(controller.currentIndex, 0, newElement);
            } else {
                currentObject.elements.splice(0, 0, newElement);
            }
        }

        modeloPageDetail.refresh(true);
        controller.selectObjectFromId(newElement.id);
    },

    pressOutlineItem: function () {
        if (modelpanTopProperties.oData.elements) {
            elementToolbarType.setVisible(false);
            elementToolbarTypeText.setVisible(true);
        } else {
            elementToolbarType.setVisible(true);
            elementToolbarTypeText.setVisible(false);
        }

        // Conditional Access
        inElementFormVisibleField.destroyItems();
        inElementFormVisibleField.addItem(new sap.ui.core.Item());

        modeloPageDetail.oData.setup.forEach(function (section, i) {
            section.elements.forEach(function (element, i) {
                switch (element.type) {
                    case "Image":
                    case "MultipleChoice":
                    case "MultipleSelect":
                    case "MessageStrip":
                    case "TextArea":
                    case "Input":
                    case "Text":
                    case "FormTitle":
                    case "Date":
                        break;

                    default:
                        inElementFormVisibleField.addItem(
                            new sap.ui.core.Item({
                                key: element.id,
                                text: element.title,
                            })
                        );
                        break;
                }
            });
        });

        controller.visibleCondValue();
    },

    visibleCondValue: function () {
        if (!inElementFormVisibleField.getSelectedKey()) return;

        inElementFormVisibleValue.destroyItems();
        inElementFormVisibleValue.addItem(new sap.ui.core.Item());

        // Get visibleField
        const visibleField = controller.getObjectFromId(inElementFormVisibleField.getSelectedKey());

        if (!visibleField) return;

        switch (visibleField.type) {
            case "Switch":
                inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: false, text: "false" }));
                inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: true, text: "true" }));
                break;

            default:
                visibleField.items.forEach(function (item, i) {
                    inElementFormVisibleValue.addItem(new sap.ui.core.Item({ key: item.key, text: item.title }));
                });
                break;
        }
    },
};

controller.init();
