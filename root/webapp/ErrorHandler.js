sap.ui.define([
		"sap/ui/base/Object",
		"sap/m/MessageBox",
        "sap/ui/model/json/JSONModel"
], function (UI5Object, MessageBox, JSONModel) {
    "use strict";

    return UI5Object.extend("sapui5.tools.odatavalidator.ErrorHandler", {

        /**
         * Manipule les erreurs de l'application par un attachement
         * des évéments sur le modéle et affiche les erreurs si besoin.
         * @class
         * @param {sap.ui.core.UIComponent} oComponent référence le Component.js de l'application.
         * @public
         * @alias sapui5.tools.odatavalidator.ErrorHandler
         */
        constructor: function (oComponent) {
            this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
            this._oComponent = oComponent;
            this._oModel = oComponent.getModel();
            this._bMessageOpen = false;
            this._sErrorText = this._oResourceBundle.getText("errorText");

            // Attach event-handler fnFunction to the 'metadataFailed' event of this sap.ui.model.odata.ODataModel. 
            this._oModel.attachMetadataFailed(function (oEvent) {
                var oParams = oEvent.getParameters();

                this._showMetadataError(oParams.response);
            }, this);

            // Affiche une erreur lorsqu'une requête échoue
            //Attach event-handler fnFunction to the 'requestFailed' event of this sap.ui.model.Model.
            this._oModel.attachRequestFailed(function (oEvent) {
                var oParams = oEvent.getParameters();

                // An entity that was not found in the service is also throwing a 404 error in oData.
                // We already cover this case with a notFound target so we skip it here.
                // A request that cannot be sent to the server is a technical error that we have to handle though
                if (oParams.response.statusCode !== "404" ||
                    (oParams.response.statusCode === 404 &&
                     oParams.response.responseText.indexOf("Cannot POST") === 0)
                   ) {
                    this._showServiceError(oParams.response);
                }
            }, this);
        },

        /**
         * Shows a {@link sap.m.MessageBox} when the metadata call has failed.
         * The user can try to refresh the metadata.
         * @private
         * @param {string} sDetails a technical error to be displayed on request
         */
        _showMetadataError: function (sDetails) {
            MessageBox.error(
                "TODO: ErrorMetadata to manage !",
                {
                    id: "metadataErrorMessageBox",
                    details: sDetails,
                    styleClass: this._oComponent.getContentDensityClass(),
                    actions: [MessageBox.Action.RETRY, MessageBox.Action.CLOSE],
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.RETRY) {
                            this._oModel.refreshMetadata();
                        }
                    }.bind(this)
                }
            );
        },

        /**
         * Affiche un {@link sap.m.MessageBox} quand l'appel d'un service échoue.
         * l'exception peut être technique (error) ou métier (warning).
         * @private
         * @param {string} sDetails Détail de l'erreur.
         */
        _showServiceError: function (sDetails) {
            if (this._bMessageOpen) {
                return;
            }

            var oResponseText;

            try {
                oResponseText = jQuery.parseJSON(sDetails.responseText)
            } catch (oEvent) {
                this._showMessageBoxError("", sDetails);
                return;
            }

            // TODO : add case
            if (oResponseText.error.code === "/IWBEP/CM_MGW_RT/022" ||
                oResponseText.error.code.substring(0, 9) === "ZMOBIMAT/") {
                var sBusinessException = this._extractErrorDetails(oResponseText);
                this._showMessageBoxWarning(sBusinessException);
            } else {
                this._showMessageBoxError("", sDetails);
            }
        },

        /* =========================================================== */
        /* Méthodes internes                                           */
        /* =========================================================== */

        /**
         * Affiche un {@link sap.m.MessageBox.error}.
         * @private
         * @param {string} sMessage erreur technique à afficher à l'utilisateur.
         * @param {string} sDetails le détail de l'erreur technique.
         */
        _showMessageBoxError: function (sMessage, sDetails) {
            this._bMessageOpen = true;
            MessageBox.error(
                this._sErrorText + "\r\n" + sMessage,
                {
                    id: "serviceErrorMessageBox",
                    details: sDetails,
                    styleClass: this._oComponent.getContentDensityClass(),
                    actions: [MessageBox.Action.CLOSE],
                    onClose: function () {
                        this._bMessageOpen = false;
                    }.bind(this)
                }
            );
        },

        /**
         * Affiche un {@link sap.m.MessageBox.warning}.
         * @private
         * @param {string} sBusinessException erreur métier à afficher à l'utilisateur.
         */
        _showMessageBoxWarning: function (sBusinessException) {
            this._bMessageOpen = true;
            MessageBox.warning(
                sBusinessException,
                {
                    id: "serviceWarningMessageBox",
                    styleClass: this._oComponent.getContentDensityClass(),
                    onClose: function () {
                        this._bMessageOpen = false;
                    }.bind(this)
                }
            );
        },

        /**
         * Extrait du détail de l'erreur les erreurs métier.
         * @private
         * @param {object} oResponseText objet JSON contenant les erreurs métier à afficher à l'utilisateur.
         * @return {string} liste des erreurs métiers sous forme d'une chaine de caractères.
         */
        _extractErrorDetails: function (oResponseText) {
            var sBusinessException = "";
            var aErrordetails = oResponseText.error.innererror.errordetails;

            if (aErrordetails.length) {
                var i = 0;
                while (aErrordetails[i]) {
                    if (aErrordetails[i].code !== "/IWBEP/CX_MGW_BUSI_EXCEPTION") {
                        sBusinessException += aErrordetails[i].message + "\r\n";
                    }
                    i++;
                }
            }

            return sBusinessException;
        }
    });
});
