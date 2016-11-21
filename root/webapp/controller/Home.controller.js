sap.ui.define([
    "sapui5/tools/odatavalidator/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";
    var aMethodType = ["Read", "Create", "Update", "Remove"];

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
                query: "",
                requestType: 0,
                jsonText: ""
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
         * @public
         */
        onSelectedItem: function(oEvent) {
            var iIndex = oEvent.getParameters().selectedIndex;
            this.getModel("homeViewModel").setProperty("/requestType", iIndex);
        },

        /**
         * TODO : comment
         * @function
         * @param {sap.ui.base.Event} oEvent
         * @public
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
        onButtonExecutePressed: function(oEvent) {
            var iRequestType = this.getModel("homeViewModel").getProperty("/requestType"); 
            
            switch (iRequestType) {
                case 0: // Read
                    this._executeReadMethod();
                    break;

                case 1: // Create
                    this._executeCreateMethod();
                    break;

                case 2: // Update
                    this._executeUpdateMethod();
                    break;

                case 3: // Remove
                    this._executeRemoveMethod();
                    break;

                default:
                    // TODO : not supported exception
                    break;
            }
        },

        /* =========================================================== */
        /* Méthodes internes                                           */
        /* =========================================================== */

        /**
         * TODO : comment
         * @function
         * @param {sap.ui.base.Event} oEvent
         * @private
         */
        _showMessageStrip: function(bIsSuccess) {
            var oMsgStrip = sap.ui.getCore().byId("msgStripId");
            var oHomePage = this.getView().byId("homePageId");
            var i18n = this.getModel("i18n").getResourceBundle();
            var oSettings = {};
            var oPreviousControl = this.getView().byId("textAreaResponseQuery");
            var iIndexPreviousControl = oHomePage.indexOfContent(oPreviousControl);

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
            oHomePage.insertContent(oMsgStrip, iIndexPreviousControl);
        },
        
        /**
         * Trigger a GET request to the odata service that was specified
         * in the model constructor. The data will be stored in the model.
         * The requested data is returned with the response.
         * @function
         * @private
         */
        _executeReadMethod: function() {
            var oHomeView = this.getView();
            var oHomeViewModel = this.getModel("homeViewModel");
            var sQuery = oHomeViewModel.getProperty("/query");
            var that = this;

            oHomeView.setBusy(true);
            this.getModel().read(sQuery, {
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

        /**
         * Trigger a POST request to the odata service that was specified
         * in the model constructor. Please note that deep creates are not
         * supported and may not work.
         * @function
         * @private
         */
        _executeCreateMethod: function() {
            var oHomeView = this.getView();
            var oHomeViewModel = this.getModel("homeViewModel");
            var sQuery = oHomeViewModel.getProperty("/query");
            var that = this;
            var sJsonText = oHomeViewModel.getProperty("/jsonText");
            // TDOO : add a try catch method to catch and validate JSON
            var oData = JSON.parse(sJsonText);

            oHomeView.setBusy(true);
            this.getModel().create(sQuery, oData, {
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

        /**
         * Trigger a PUT/MERGE request to the odata service that was specified
         * in the model constructor. The update method used is defined by the global
         * defaultUpdateMethod parameter which is sap.ui.model.odata.UpdateMethod.Merge by default.
         * Please note that deep updates are not supported and may not work.
         * These should be done seperate on the entry directly. 
         * @function
         * @private
         */
        _executeUpdateMethod: function() {
            var oHomeView = this.getView();
            var oHomeViewModel = this.getModel("homeViewModel");
            var sQuery = oHomeViewModel.getProperty("/query");
            var that = this;
            var sJsonText = oHomeViewModel.getProperty("/jsonText");
            // TDOO : add a try catch method to catch and validate JSON
            var oData = JSON.parse(sJsonText);

            oHomeView.setBusy(true);
            this.getModel().update(sQuery, oData, {
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

        /**
         * Trigger a DELETE request to the odata service that was specified
         * in the model constructor. 
         * @function
         * @private
         */
        _executeRemoveMethod: function() {
            var oHomeView = this.getView();
            var oHomeViewModel = this.getModel("homeViewModel");
            var sQuery = oHomeViewModel.getProperty("/query");
            var that = this;

            oHomeView.setBusy(true);
            this.getModel().remove(sQuery, {
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
        }

    });
});