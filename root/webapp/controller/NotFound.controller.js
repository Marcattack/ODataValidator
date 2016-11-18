sap.ui.define([
    "sapui5/tools/odatavalidator/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("sapui5.tools.odatavalidator.controller.NotFound", {

        /* =========================================================== */
        /* Méthodes de cycle de vie                                    */
        /* =========================================================== */

        /**
         * Initialise l'écran.
         * @function
         * @public
         * @override
         */
        onInit: function () {
            var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("notFound");
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data"); // store the data
            }, this)
        },

        /* =========================================================== */
        /* Gestionnaire d'événements                                   */
        /* =========================================================== */

        /**
         * Retourne à la page précédente.
         * override the parent's onNavBack (inherited from BaseController)
         * @function
         * @override
         */
        onNavBack: function (oEvent) {
            var oHistory, sPreviousHash, oRouter;
            // in some cases we could display a certain target when the back button is presses
            if (this._oData && this._oData.fromTarget) {
                this.getRouter().getTargets().display(this._oData.fromTarget);
                delete this._oData.fromTarget;
                return;
            }
            // call the parent's onNavBack
            BaseController.prototype.onNavBack.apply(this, arguments);
        }

        /* =========================================================== */
        /* Méthodes internes                                           */
        /* =========================================================== */
    });
});
