const controller = {
    remoteSystem: null,

    init: function () {
        jQuery.sap.require("sap.m.MessageBox");

        if (!cockpitUtils.isCockpit) {
            sap.m.MessageBox.confirm("Neptune FORMS is only supported to run inside our Cockpit. Press OK and we will guide to to the right place.", {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "System Information",
                actions: [sap.m.MessageBox.Action.OK],
                initialFocus: "Ok",
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        location.href = location.origin + "/cockpit.html#forms-deployment";
                    }
                },
            });
        }

        controller.list();
    },

    list: function () {
        apiMasterdata().then(function (res) {
            modelappData.setData(res);
        });
    },

    get: async function (system) {
        modeltreeDeploy.setData({
            children: [],
        });

        if (system) {
            controller.remoteSystem = system;
            oPageDetailHeaderSubTitle.setText(system.name);
        }

        let actions = [];
        actions.push(controller.getRemoteData("forms_design"));
        actions.push(controller.getRemoteData("forms_group"));
        actions.push(controller.getRemoteData("forms_attribute_group"));

        Promise.all(actions).then(function (values) {
            controller.buildData("FORMS", modelappData.oData.forms, values[0]);
            controller.buildData("Classification", modelappData.oData.group, values[1]);
            controller.buildData("Attributes", modelappData.oData.attributegroup, values[2]);
            modeltreeDeploy.refresh();
        });

        oApp.to(oPageDetail);
    },

    buildData: function (parent, localData, remoteData) {
        let items = [];

        localData.forEach(function (data) {
            let item = {
                id: data.id,
                name: data.name,
                description: data.description,
                updatedAt: data.updatedAt,
                updatedBy: data.updatedBy,
                selectable: true,
            };

            let remoteItem = ModelData.FindFirst(remoteData, "id", data.id);
            if (!remoteItem) ModelData.FindFirst(remoteData, "id", data.id.toUpperCase());

            if (remoteItem) {
                item.dest_updatedAt = remoteItem.updatedAt;
                item.dest_updatedBy = remoteItem.updatedBy;
            }

            items.push(item);
        });

        modeltreeDeploy.oData.children.push({
            name: parent,
            selectable: false,
            children: items,
        });
    },

    deploy: async function () {

        // TODO

    },

    saveRemoteData: function (tableName, tableData, index) {
        return new Promise(function (resolve) {
            var reqData = {
                data: tableData,
                table: tableName,
            };

            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/proxy/remote/" + encodeURIComponent(controller.remoteSystem.url + "/api/serverscript/formsclient/deployment-save") + "/" + controller.remoteSystem.id,
                data: JSON.stringify(reqData),
                success: function (data) {
                    resolve("OK");
                },
                error: function (result, status) {
                    resolve("ERROR");
                },
            });
        });
    },

    getRemoteData: function (table) {
        return new Promise(function (resolve) {
            const endpoint = "/api/entity/" + table + "?select=id,name,updatedAt,updatedBy";
            const url = "/proxy/remote/" + encodeURIComponent(controller.remoteSystem.url + endpoint) + "/" + controller.remoteSystem.id;

            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: url,
                success: function (data) {
                    resolve(data);
                },
                error: function (result, status) {
                    resolve("ERROR");
                },
            });
        });
    },
};

controller.init();
