// This is API key from the Google Developer Console, https://console.developers.google.com
var CLIENT_ID = null;

// This is the spreadsheet's ID from its URL
var SPREADSHEET_ID = null;

var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// This is the set of columns that Google looks for a table in, and to which we add entries
// A four column range
var RANGE = 'A1:D1';

// cuz idk what im doing this is from http://stackoverflow.com/questions/19706046/how-to-read-an-external-local-json-file-in-javascript
function setIDsFromConfig(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

// Read a configuration file in JSON format for the API key and spreadsheet ID
setIDsFromConfig("config.json", function(text){
    var data = JSON.parse(text);
    CLIENT_ID = data.client_id;
    SPREADSHEET_ID = data.sheet_id;
});

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadSheetsApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Sheets API client library.
 */
function loadSheetsApi() {
  var discoveryUrl =
      'https://sheets.googleapis.com/$discovery/rest?version=v4';
  gapi.client.load(discoveryUrl).then(listSnippets);
}

/**
 * Print rows of stats in our table
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 *
 *
 */

function listSnippets() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A2:D20'
  }).then(function(response) {
    var range = response.result;
    if (range.values.length > 0) {
      appendPre('PublicationYear, Source, URL, Snippet:');
      for (i = 0; i < range.values.length; i++) {
        var row = range.values[i];
        // Print columns A thru D , which correspond to indices 0 thru 3
        appendPre(row[0] + ', ' + row[1] + ', ' + row[2] + ', ' + row[3]);
      }
    } else {
      appendPre('No data found.');
    }
  }, function(response) {
    appendPre('Error: ' + response.result.error.message);
  });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

// Code for the sidebar UI and form 
// handles writing to the spreadsheet

angular
  .module('MyApp',['ngMaterial', 'ngMessages', 'material.svgAssetsCache'])

  .factory('preview', function() {
    return {
      data: {
        publicationYear: '',
        source: '',
        URL: '',
        snippet: ''
      }
    }
  })

  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log, preview) {
    $scope.data = preview.data;
  })

  .controller('LeftCtrl', function ($scope, $http, preview) {
    $scope.data = preview.data;
    $scope.data.appendRow = function() {
      $http({
        method: 'POST',
        url: 'https://sheets.googleapis.com/v4/spreadsheets/' + SPREADSHEET_ID + '/values/' + RANGE + ':append?insertDataOption=INSERT_ROWS&valueInputOption=USER_ENTERED&fields=updates%2FupdatedCells&key=' + CLIENT_ID,
        data: [
          {
            'values': [
              [
                $scope.data.publicationYear,
                $scope.data.source,
                $scope.data.URL,
                $scope.data.snippet
              ]
            ]
          }
        ]
        /*,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
        */
      });
    }
  });