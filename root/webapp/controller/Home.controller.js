sap.ui.define([
    "sapui5/tools/odatavalidator/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("sapui5.tools.odatavalidator.controller.Home", {

        /* =========================================================== */
        /* Méthodes de cycle de vie                                    */
        /* =========================================================== */

        /**
         * Called when a view is instantiated and its controls (if available)
         * have already been created; used to modify the view before it is displayed
         * to bind event handlers and do other one-time initialization
         */
        onInit: function() {
            var oRouter = this.getRouter();

            this._oRouterArgs = null; // initialise à null les arguments de la route
            oRouter.getRoute("appHome").attachMatched(this._onRouteMatched, this);

            var oViewModel = new JSONModel({
                version: this.getResourceBundle().getText("home.sapui5Version", sap.ui.version),
                language: sap.ui.getCore().getConfiguration().getLanguage(),
                response: "",
                request: ""
            });
            this.setModel(oViewModel, "homeViewModel");
        },

        /**
         * Charge les données en fonction des paramètres passés à l'URL.
         * @function
         * @param {sap.ui.base.Event} oEvent
         * @private
         */
        _onRouteMatched: function(oEvent) {
        },

        /**
         * Affiche la page non trouvé, si il n'y a pas de donées
         * pour l'URL utilisée.
         * @function
         * @param {sap.ui.base.Event} oEvent
         * @private
         */
        _onBindingChange: function(oEvent) {
            if (!this.getView().getBindingContext()) {
                this.getRouter().getTargets().display("notFound");
            }
        },

        /**
         * Called when the view is destroyed; used to free
         * resources and finalize activities
         */
        //onExit: function () {
        //},

        /**
         * Called when the view has been rendered and, therefore,
         * its HTML is part of the document; used to do post-rendering manipulations
         * of the HTML. SAPUI5 controls get this hook after being rendered.
         */
        //onAfterRendering: function () {
        //},

        /**
         * Invoked before the controller view is re-rendered and not before
         * the first rendering; use onInit() for invoking the hook
         * before the first rendering
         */
        //onBeforeRendering: function () {
        //}

        /* =========================================================== */
        /* Gestionnaire d'événements                                   */
        /* =========================================================== */

        /**
         * TODO : comment
         * @function
         * @param {sap.ui.base.Event} oEvent
         * @private
         */
        onAboutPressed: function(oEvent) {
            // TODO : implémenter
            /* afficher la version de SAPUI5, la culture courante, et
               des informations sur le device utilisé avec sap.ui.Device. */
        },

        /**
         * TODO : comment
         * @function
         * @param {sap.ui.base.Event} oEvent
         * @public
         */
        onButtonReadPressed: function(oEvent) {
            var that = this;
            var oHomeView = this.getView();
            var oHomeViewModel = this.getModel("homeViewModel");
            var sRequest = oHomeViewModel.getProperty("/request");

            oHomeView.setBusy(true);
            this.getModel().read(sRequest, {
                async: true,
                success: function(oData, oResponse) {
                    that._showMessageStrip(true);
                    oHomeViewModel.setProperty("/response", JSON.stringify(oResponse));

                    oHomeView.setBusy(false);
                },
                error: function(oError) {
                    that._showMessageStrip(false);
                    oHomeViewModel.setProperty("/response", JSON.stringify(oError));

                    oHomeView.setBusy(false);
                }
            });
        },

        /* =========================================================== */
        /* Méthodes internes                                           */
        /* =========================================================== */

        /**
         * @function
         * @param {sap.ui.base.Event} oEvent
         * @public
         */
        _showMessageStrip: function(bIsSuccess) {
            var oMsgStrip = sap.ui.getCore().byId("msgStripId");
            var oHomePage = this.getView().byId("homePageId");
            var i18n = this.getModel("i18n").getResourceBundle();
            var oSettings = {};

            // si il existe on le détruit
            if (oMsgStrip) {
                oMsgStrip.destroy();
            }
            if (bIsSuccess) {
                oSettings = {
                    text: i18n.getText("home.messageStripSuccess"),
                    showCloseButton: true,
                    showIcon: true,
                    type: "Success"
                };
            } else {
                oSettings = {
                    text: i18n.getText("home.messageStripError"),
                    showCloseButton: true,
                    showIcon: true,
                    type: "Error"
                };
            }

            oMsgStrip = new sap.m.MessageStrip("msgStripId", oSettings);
            // L'insert dans la page
            // TODO : faire plutôt un getIndex
            oHomePage.insertContent(oMsgStrip, 4);
        }

    });
});