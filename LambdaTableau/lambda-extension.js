'use strict';

(function () {
  var AWS = require('aws-sdk');

  let defaultRegion,identityPoolId,functionName,invocationType,output;
  let requiredParameters = [];
  let allSettings;
  let dict = {}

  $(document).ready(function () {
    var lambda = new AWS.Lambda();
    const ptable = $('#payloadParams');
    const ptableBody = ptable.children('tbody');

    tableau.extensions.initializeAsync({'configure': configure}).then(function () {
      console.log(tableau.extensions.settings.get('selDefaultRegion'));
      tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        updateExtensionBasedOnSettings(settingsEvent.newSettings);
      });

      tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        const params = parameters;
        params.forEach((p) => {
          p.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange);
          myParameterRow(p).appendTo(ptableBody);
          dict[p.name] = p.currentValue.value;
        });

        $('#loading').addClass('hidden');
        if (parameters.length === 0) {
          $('#addParameterWarning').removeClass('hidden').addClass('show');
        } else {
          $('#payloadParams').removeClass('hidden').addClass('show');
        }
      });
      $("#lambdaBtn").click(function(){
          console.log(functionName);
          console.log(invocationType);
          console.log(dict);

          AWS.config.region = defaultRegion;

          // set the default config object
          var creds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: identityPoolId
          });
          AWS.config.credentials = creds;
          var lambda = new AWS.Lambda();
          var awsFnPayload = {
            FunctionName: functionName,
            InvocationType: invocationType,
            Payload: JSON.stringify(dict)
          };
          alert("Are you sure?");
          lambda.invoke(awsFnPayload, function(err, data) {
            if (err)
              console.log(err, err.stack); // an error occurred
            else
              console.log(data);           // successful response
              output = data;
              $('#outputBoxText').text(output.Payload);
              console.log(output.Payload);
          });
      });
    });
  });

  function onParameterChange (parameterChangeEvent) {
    parameterChangeEvent.getParameterAsync().then(function (param) {
      const newRow = myParameterRow(param);
      dict[param.name] = param.currentValue.value;
      console.log(param);
      const oldRow = $("tr[data-fieldname='" + param.id + "'");
      oldRow.replaceWith(newRow);
    });
  }

  // A cell in the table
  function cell (value) {
    const row = $('<td>');
    row.append(value);
    return row;
  }

  // A simple cell that contains a text value
  function textCell (value) {
    const cellElement = $('<td>');
    cellElement.text(value);
    return cellElement;
  }

  function myParameterRow (p) {
    let row = $('<tr>').attr('data-fieldname', p.id);
    row.append(textCell(p.name));
    row.append(textCell(p.dataType));
    row.append(textCell(p.currentValue.formattedValue));

    return row;
  }

  function configure () {
    const popupUrl = `${window.location.origin}/LambdaTableau/LambdaExtensionDialog.html`;
    let payload = "";
    tableau.extensions.ui.displayDialogAsync(popupUrl, payload, { height: 500, width: 600 }).then((closePayload) => {
      console.log('closePayload' + closePayload);
      defaultRegion = tableau.extensions.settings.get('selDefaultRegion');
      identityPoolId = tableau.extensions.settings.get('selIdentityPoolId');
      functionName = tableau.extensions.settings.get('selFunctionName');
      invocationType = tableau.extensions.settings.get('selInvocationType');

      $('#region').text(closePayload);
      // setupRefreshInterval(closePayload);
    }).catch((error) => {
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log('Dialog was closed by user');
          break;
        default:
          console.error(error.message);
      }
    });
  }

  function updateExtensionBasedOnSettings (settings) {
    if (settings.selectedDatasources) {
      activeDatasourceIdList = JSON.parse(settings.selectedDatasources);
      $('#datasourceCount').text(activeDatasourceIdList.length);
    }
  }
})();
