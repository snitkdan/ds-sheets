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

  .controller('LeftCtrl', function ($scope, preview) {
    $scope.data = preview.data;
  });