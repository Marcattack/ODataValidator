sap.ui.define([
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * TODO : comment
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        }
    };

});
