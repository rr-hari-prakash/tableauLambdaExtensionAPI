'use strict';

(function () {
  let selDefaultRegion,selIdentityPoolId,selFunctionName,selInvocationType,selRequiredParameters;

  $(document).ready(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      console.log('openPayload ; ' + openPayload);

      $('#region').val(tableau.extensions.settings.get('selDefaultRegion'));
      $('#cognitoPoolId').val(tableau.extensions.settings.get('selIdentityPoolId'));
      $('#lambdaFunction').val(tableau.extensions.settings.get('selFunctionName'));
      $('#invocationType').val(tableau.extensions.settings.get('selInvocationType'));

      // let settings = tableau.extensions.settings.getAll();
      // if (settings.selDefaultRegion) {
      //   $('#region').val(tableau.extensions.settings.get('selDefaultRegion'));
      // }
      // if (settings.selIdentityPoolId) {
      //   $('#cognitoPoolId').val(tableau.extensions.settings.get('selIdentityPoolId'));
      // }
      // if (settings.selFunctionName) {
      //   $('#lambdaFunction').val(tableau.extensions.settings.get('selFunctionName'));
      // }
      // if (settings.selInvocationType) {
      //   $('#invocationType').val(tableau.extensions.settings.get('selInvocationType'));
      // }
      // if (settings.selRequiredParameters) {
      //   $('#parameters').val(tableau.extensions.settings.get('selRequiredParameters'));
      // }

      // let settings = tableau.extensions.settings.getAll();
      // if (settings.selDefaultRegion) {
      //   reg = settings.selDefaultRegion;
      // }
      $('#closeButton').click(closeDialog);
    });
  });


  function closeDialog () {
    tableau.extensions.settings.set('selDefaultRegion', document.getElementById('region').value);
    tableau.extensions.settings.set('selIdentityPoolId', document.getElementById('cognitoPoolId').value);
    tableau.extensions.settings.set('selFunctionName', document.getElementById('lambdaFunction').value);
    tableau.extensions.settings.set('selInvocationType', document.getElementById('invocationType').value);

    tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
      console.log(newSavedSettings);
      tableau.extensions.ui.closeDialog($('#region').val());
    });
  }
})();
