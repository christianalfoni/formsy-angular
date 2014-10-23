var angular = global.angular || require('angular');

var validationRules = {
  'isValue': function (value) {
    return !!value;
  },
  'isEmail': function (value) {
    return value.match(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
  },
  'isTrue': function (value) {
    return value === true;
  },
  'isNumeric': function (value) {
    return value.match(/^-?[0-9]+$/)
  },
  'isAlpha': function (value) {
    return value.match(/^[a-zA-Z]+$/);
  },
  isLength: function (value, min, max) {
    if (max !== undefined) {
      return value.length >= min && value.length <= max;
    }
    return value.length >= min;
  },
  equals: function (value, eql) {
    return value == eql;
  }
};

var toURLEncoded = function (element,key,list){
  var list = list || [];
  if(typeof(element)=='object'){
    for (var idx in element)
      toURLEncoded(element[idx],key?key+'['+idx+']':idx,list);
  } else {
    list.push(key+'='+encodeURIComponent(element));
  }
  return list.join('&');
};


var defaults = {
  submitLabel: 'Submit',
  cancelLabel: 'Cancel',
  method: 'post'
};

angular.module('formsy', [])
  .provider('formsy', function formsyProvider () {
    this.$get = function () {

    };
    this.defaults = function (options) {
      Object.keys(options).forEach(function (option) {
        defaults[option] = options[option];
      });
    };
    this.addValidationRule = function (name, ruleFunc) {
      validationRules[name] = ruleFunc;
    };
  })
  .directive('formsyForm', ['$compile', function ($compile) {

    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      scope: {
        cancel: '&',
        success: '&',
        error: '&',
        submit: '&',
        submitted: '&'
      },
      controller: ['$scope', '$http', function ($scope, $http) {

        var inputs = {};
        var getModel = function () {
          var model = {};
          Object.keys(inputs).forEach(function (input) {
            model[input] = inputs[input].scope.$value;
          });
          return model;
        };
        var controller = this;

        $scope.isSubmitting = false;
        
        $scope.$submit = function () {
          if (!$scope.$url) {
            throw new Error('Formsy needs an url to post a form');
          }
          var data = Object.keys(inputs).map(function (name) {
            return inputs[name].scope.$value;
          });
          data = $scope.$contentType === 'application/json' ? JSON.stringify(getModel()) : toURLEncoded(getModel());

          $scope.$submitting = true;
          $scope.submit();
          $http({
            url: $scope.$url,
            method: $scope.$method,
            headers: {
              'Accept': 'application/json',
              'Content-Type': $scope.$contentType
            },
            data: data
          })
          .success(function (data) {
            $scope.$submitting = false;
            $scope.submitted(data);
          })
          .error(function (errors) {
            $scope.$submitting = false;
            $scope.error(errors)
            controller.updateInputsWithErrors(errors);
          });
          $scope.submitted();
        };
        
        this.updateInputsWithErrors = function (errors) {
          Object.keys(errors).forEach(function (name) {
            inputs[name].scope.$message = errors[name];
            inputs[name].scope.$valid = false;
            inputs[name].scope.$showError = true;
          });
          this.validateForm();
        };

        this.attachToForm = function (scope, attr) {
          if (!attr.name) {
            throw new Error('Formsy requires your inputs to have a name attribute');
          }
          inputs[attr.name] = {
            attr: attr,
            scope: scope
          };
          scope.$watch('$value', this.validate.bind(this, scope, attr));
          this.validate(scope, attr);
        };

        this.validate = function (scope, attr) {

          // value can be set to undefined by Angular
          scope.$value = scope.$value || '';

          if (!attr.validations) {
            return scope.$valid = true;
          }

          var isValid = true;
          if (scope.$required || scope.$value) {

            attr.validations.split(',').forEach(function (validation) {

              var args = validation.split(':');
              var validateMethod = args.shift();
              args = args.map(function (arg) { return JSON.parse(arg); });
              args = [scope.$value].concat(args);

              if (!validationRules[validateMethod]) {
                throw new Error('Formsy does not have the validation rule: ' + validateMethod);
              }

              if (!validationRules[validateMethod].apply(null, args)) {
                isValid = false;
              }

            });

          }

          scope.$valid = isValid;
          scope.$showRequired = !scope.$value && scope.$required;
          scope.$showError = !scope.$showRequired && !scope.$valid;
          scope.$message = scope.$showError ? attr.validationError : '';

          this.validateForm();

        };

        this.validateForm = function () {
          var isValid = true;
          Object.keys(inputs).forEach(function (name) {
            if (!inputs[name].scope.$valid) {
              isValid = false;
            }
          });
          $scope.$valid = isValid;
        };

      }],
      template: '<form ng-transclude></form>',
      link: function (scope, el, attr) {

        scope.hideSubmit = defaults.hideSubmit || attr.hideSubmit !== undefined;
        scope.showCancel = attr.cancel !== undefined;
        scope.submitLabel = attr.submitLabel || defaults.submitLabel;
        scope.cancelLabel = attr.cancelLabel || defaults.cancelLabel;
        scope.$method = attr.method || defaults.method;
        scope.$url = attr.url;
        scope.$contentType = attr.contentType === 'urlencoded' ? 'application/' + attr.contentType.replace('urlencoded', 'x-www-form-urlencoded') : 'application/json';

        // Add submit button to end of form
        var submit = angular.element(
          '<div class="{{buttonWrapperClass}}">' +
            '<button ng-show="showCancel" class="{{buttonCancelClass}}" ng-disabled="$submitting" ng-click="cancel()">' +
              '{{cancelLabel}}' +
            '</button>' +
            '<button ng-hide="hideSubmit" class="{{buttonSubmitClass}}" ng-disabled="!$valid || $submitting" ng-click="$submit()" type="submit">' +
              '{{submitLabel}}' +
            '</button>' +
          '</div>');
        el.append(submit);
        $compile(submit)(scope);
      }
    };

  }])
  .directive('formsyInput', function () {

    return {
      require: '^formsyForm',
      restrict: 'A',
      link: function (scope, el, attr, formCtrl) {
        scope.$value = attr.$value || '';
        scope.$required = attr.required !== undefined;
        scope.$message = attr.validationError;

        scope.$on('$destroy', function () {
          formCtrl.detachFromForm(scope);
        });

        formCtrl.attachToForm(scope, attr);
        scope.validate = function () {
          formCtrl.validate(scope, attr);
        };
      }
    }

  });