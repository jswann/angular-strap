/**
 * angular-strap
 * @version v2.2.3 - 2015-07-05
 * @link http://mgcrea.github.io/angular-strap
 * @author Olivier Louvignes <olivier@mg-crea.com> (https://github.com/mgcrea)
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';

angular.module('mgcrea.ngStrap.alert', [ 'mgcrea.ngStrap.modal' ]).provider('$alert', function() {
  var defaults = this.defaults = {
    animation: 'am-fade',
    prefixClass: 'alert',
    prefixEvent: 'alert',
    placement: null,
    template: 'alert/alert.tpl.html',
    container: false,
    element: null,
    backdrop: false,
    keyboard: true,
    show: true,
    duration: false,
    type: false,
    dismissable: true
  };
  this.$get = [ '$modal', '$timeout', function($modal, $timeout) {
    function AlertFactory(config) {
      var $alert = {};
      var options = angular.extend({}, defaults, config);
      $alert = $modal(options);
      $alert.$scope.dismissable = !!options.dismissable;
      if (options.type) {
        $alert.$scope.type = options.type;
      }
      var show = $alert.show;
      if (options.duration) {
        $alert.show = function() {
          show();
          $timeout(function() {
            $alert.hide();
          }, options.duration * 1e3);
        };
      }
      return $alert;
    }
    return AlertFactory;
  } ];
}).directive('bsAlert', [ '$window', '$sce', '$alert', function($window, $sce, $alert) {
  var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
  return {
    restrict: 'EAC',
    scope: true,
    link: function postLink(scope, element, attr, transclusion) {
      var options = {
        scope: scope,
        element: element,
        show: false
      };
      angular.forEach([ 'template', 'placement', 'keyboard', 'html', 'container', 'animation', 'duration', 'dismissable' ], function(key) {
        if (angular.isDefined(attr[key])) options[key] = attr[key];
      });
      var falseValueRegExp = /^(false|0|)$/i;
      angular.forEach([ 'keyboard', 'html', 'container', 'dismissable' ], function(key) {
        if (angular.isDefined(attr[key]) && falseValueRegExp.test(attr[key])) options[key] = false;
      });
      if (!scope.hasOwnProperty('title')) {
        scope.title = '';
      }
      angular.forEach([ 'title', 'content', 'type' ], function(key) {
        attr[key] && attr.$observe(key, function(newValue, oldValue) {
          scope[key] = $sce.trustAsHtml(newValue);
        });
      });
      attr.bsAlert && scope.$watch(attr.bsAlert, function(newValue, oldValue) {
        if (angular.isObject(newValue)) {
          angular.extend(scope, newValue);
        } else {
          scope.content = newValue;
        }
      }, true);
      var alert = $alert(options);
      element.on(attr.trigger || 'click', alert.toggle);
      scope.$on('$destroy', function() {
        if (alert) alert.destroy();
        options = null;
        alert = null;
      });
    }
  };
} ]);