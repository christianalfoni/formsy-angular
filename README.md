formsy-angular
============

A form input builder and validator for Angular JS (NOT YET RELEASED)

- [Background](#background)
- [What you can do](#whatyoucando)
- [Install](#install)
- [How to use](#howtouse)
- [API](#API)
  - [formsyProvider.defaults()](#formsydefaults)
  - [formsy-form](#formsyform)
    - [url](#url)
    - [method](#method)
    - [content-type](#contenttype)
    - [hide-submit](#hideSubmit)
    - [submit-button-class](#submitButtonClass)
    - [cancel-button-class](#cancelButtonClass)
    - [button-wrapper-class](#buttonWrapperClass)
    - [success()](#onsuccess)
    - [submit()](#onsubmit)
    - [submitted()](#onsubmitted)
    - [cancel()](#oncancel)
    - [error()](#onerror)
  - [formsy-input](#formsymixin)
    - [name](#name)
    - [validations](#validations)
    - [validation-error](#validationerror)
    - [value](#getvalue)
    - [required](#required)
    - [$value](#setvalue)
    - [$message](#geterrormessage)
    - [$valid](#isvalid)
    - [$required](#isrequired)
    - [$showRequired](#showrequired)
    - [$showError](#showerror)
  - [formsyProvider.addValidationRule()](#formsyaddvalidationrule)
- [Validators](#validators)

## <a name="background">Background</a>
I wrote an article on forms and validation with React JS, [Nailing that validation with React JS](http://christianalfoni.github.io/javascript/2014/10/22/nailing-that-validation-with-reactjs.html), the result of that was an extension to React JS that I reimplemented in Angular JS.

The main concept is that forms, inputs and validation is done very differently across developers and projects. This extension to Angular JS aims to be that "sweet spot" between flexibility and reusability. Though Angular already has pretty good validation handling for forms it does not handle server requests and responses. It is also scoped to normal input elements. A formsy-input is just a value with validation linked to a form. How you choose to change that value does not matter, you can build anything you want.

## <a name="whatyoucando">What you can do</a>

  1. Build any kind of form input directive. Not just traditional inputs, but anything you want and get that validation for free

  2. Add validation rules and use them with simple syntax

  3. Use handlers for different states of your form. Ex. "submit", "error", "submitted" etc. 

  4. Server validation errors automatically binds to the correct form input

## <a name="install">Install</a>

  1. Download from this REPO and use globally or with requirejs
  2. Install with `npm install formsy-angular` and use with browserify etc.
  3. Install with `bower install formsy-angular`

It registers as the module 'formsy':

```javascript
  angular.module('MyApp', ['formsy']);
```

## <a name="howtouse">How to use</a>

#### Formsy gives you a form straight out of the box

```html
<formsy-form url="/users">
  <my-own-input name="email" validations="isEmail" validation-error="This is not an email" required/>
</formsy-form>
```

This code results in a form with a submit button that will POST to /users when clicked. The submit button is disabled as long as the input is empty (required) or the value is not an email (isEmail). On validation error it will show the message: "This is not a valid email".

#### This is an example of what you can enjoy building
```javascript
angular.module('MyApp', ['formsy'])
  .directive('MyOwnInput', function () {

    return {
      restrict: 'E', // You need this one
      replace: true, // And this one
      scope: {}, // Aaand this one
      templateUrl: 'MyOwnInput.html'
    }

  });
```
The template:
```html
<div formsy-input ng-class="{error: $showError, required: $showRequired}">
  <input type="text" ng-model="$value"/>
  <span>{{$message}}</span>
</div>
```

#### Be as creative as you want and still get validation for free
```javascript
angular.module('MyApp', ['formsy'])
  .directive('MyIncreaser', function () {

    return {
      restrict: 'E',
      replace: true,
      scope: {},
      templateUrl: 'MyIncreaser.html',
      controller: function ($scope) {
        $scope.increase = function () {
          $scope.$value++;
        };
      }
    }

  });
```
The template:
```html
<button formsy-input ng-class="{error: $showError, required: $showRequired}" ng-click="increase()">Increase ({{$value}})</button>
```
Use it in a form:
```html
<formsy-form>
  <my-increaser name="increaser" validations="equals:3" validation-error="The value has to be 3" required/>
</formsy-form>
```

So this is basically how you build your form elements. As you can see it is very flexible, you just have a few scope properties to help you reflect the states. As long as you update the value on the scope everything will validate automatically.

## <a name="API">API</a>

### <a name="formsydefaults">formsyProvider.defaults(options)</a>
```javascript
angular.module('MyApp', ['formsy'])
  .config(function (formsyProvider) {
    formsyProvider.defaults({
      contentType: 'urlencoded', // default: 'json'
      hideSubmit: true, // default: false
      submitButtonClass: 'btn btn-success', // default: null
      cancelButtonClass: 'btn btn-default', // default: null
      buttonWrapperClass: 'my-wrapper' // default: null
    })
  });
```
Use **defaults** to set general settings for all your forms.

### <a name="formsyform">formsy-form</a>

#### <a name="url">url</a>
```html
<formsy-form url="/users"></formsy-form>
```
Will either **POST** or **PUT** to the url specified when submitted.

#### <a name="method">method</a>
```html
<formsy-form url="/users" method="PUT"></formsy-form>
```
Supports **POST** (default) and **PUT**.

#### <a name="contenttype">content-type</a>
```html
<formsy-form url="/users" method="PUT" content-type="urlencoded"></formsy-form>
```
Supports **json** (default) and **urlencoded** (x-www-form-urlencoded). 

**Note!** Response has to be **json**.

#### <a name="hidesubmit">hide-submit</a>
```html
<formsy-form url="/users" method="PUT" hide-submit></formsy-form>
```
Hides the submit button. Submit is done by ENTER on an input.

#### <a name="submitbuttonclass">submit-button-class</a>
```html
<formsy-form url="/users" method="PUT" submit-button-class="btn btn-success"></formsy-form>
```
Sets a class name on the submit button.

#### <a name="cancelbuttonclass">cancel-button-class</a>
```html
<formsy-form url="/users" method="PUT" cancel-button-class="btn btn-default"></formsy-form>
```
Sets a class name on the cancel button.

#### <a name="buttonwrapperclass">button-wrapper-class</a>
```html
<formsy-form url="/users" method="PUT" button-wrapper-class="my-wrapper"></formsy-form>
```
Sets a class name on the container that wraps the **submit** and **cancel** buttons.

#### <a name="onsuccess">success(serverResponse)</a>
```html
<formsy-form url="/users" success="changeUrl()"></formsy-form>
```
Takes a function to run when the server has responded with a success http status code.

#### <a name="onsubmit">submit()</a>
```html
<formsy-form url="/users" submit="showFormLoader()"></formsy-form>
```
Takes a function to run when the submit button has been clicked. 

#### <a name="onsubmitted">submitted()</a>
```html
<formsy-form url="/users" submitted="hideFormLoader()"></formsy-form>
```
Takes a function to run when either a success or error response is received from the server.

#### <a name="onerror">error(serverResponse)</a>
```html
<formsy-form url="/users" error="changeToFormErrorClass()"></formsy-form>
```
Takes a function to run when the server responds with an error http status code.

### <a name="formsymixin">formsy-input</a>
So "formsy-input" is an attribute you use when creating your formsy directive to attach it to the form. It has to be set on the "top node" of the template. The first part of this section shows what attributes you can pass to your directive and the second part shows how you build the directive.

#### <a name="name">name</a>
```html
<my-input name="email"/>
```
The name is required to register the form input directive in the form.

#### <a name="validations">validations</a>
```html
<my-input name="email" validations="isEmail"/>
<my-input name="number" validations="isNumeric,isLength:5:12"/>
```
An comma seperated list with validation rules. Take a look at **Validators** to see default rules. Use ":" to separate arguments passed to the validator. The arguments will go through a **JSON.parse** converting them into correct JavaScript types. Meaning:

```html
<my-input name="fruit" validations="isIn:['apple', 'orange']"/>
<my-input name="car" validations="mapsTo:{'bmw': true, 'vw': true}"/>
```
Works just fine.

#### <a name="validationerror">validation-error</a>
```html
<my-input name="email" validations="isEmail" validation-error="This is not an email"/>
```
The message that will show when the form input directive is invalid.

#### <a name="required">required</a>
```html
<my-input name="email" validations="isEmail" validationError="This is not an email" required/>
```
A property that tells the form that the form input directive value is required.

#### <a name="getvalue">value</a>
```html
<my-input name="email" validations="isEmail" validationError="This is not an email" value="test@test.com" required/>
```

#### <a name="setvalue">$value</a>
To set a value inside your directive you can use two way data binding:
```html
<input type="text" ng-model="$value"/>
```
Or set the value manually:
```javascript
angular.module('MyApp', ['formsy'])
  .directive('MyInput', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      controller: function ($scope) {
        $scope.setValue = function () {
          $scope.$value = $scope.$value === 'red' ? 'blue' : 'red';
        }
      }
    };
  });
```
```html
<button type="text" ng-click="setValue()">Flip color</button>
```
#### <a name="geterrormessage">$message</a>
In your directive template:
```html
<div>
  <input type="text" ng-model="$value"/>
  <div>{{$message}}</div>
</div>
```
Will display the server error mapped to the form input directive or return the validation message set if the form input directive is invalid. If no server error and the form input directive is valid it does not display anything.

#### <a name="isvalid">$valid</a>
In your directive template:
```html
<div>
  <input type="text" ng-model="$value"/>
  <span>{{$valid ? ':-)' : ':-('}}</span>
</div>
```
Returns the valid state of the form input component.

#### <a name="isrequired">$required</a>
```javascript
angular.module('MyApp', ['formsy'])
  .directive('MyInput', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'label' '@' // Grab the label from the attributes
      }
    };
  });
```
```html
<div>
  <label>{{label}} {{$required ? '*' : ''}}</label>
  <input type="text" ng-model="$value"/><span>
</div>
```
Returns true if the required attribute has been passed. 

#### <a name="showrequired">$showRequired</a>
In your directive template:
```html
<div ng-class="{required: $showRequired">
  <input type="text" ng-model="$value"/><span>
</div>
```
Lets you check if the form input directive should indicate if it is a required field. This happens when the form input directive value is empty and the required attribute has been passed, but its false if there is a validation error.

#### <a name="showerror">$showError</a>
In your directive template:
```html
<div ng-class="{required: $showRequired, error: $showError">
  <input type="text" ng-model="$value"/><span>
</div>
```
Lets you check if the form input directive should indicate if there is an error. This happens if there is a form input directive value and it is invalid or if a server error is received.

### <a name="formsyaddvalidationrule">formsyProvider.addValidationRule(name, ruleFunc)</a>
An example:
```javascript
angular.module('MyApp', ['formsy'])
  .config(function (formsyProvider) {
    formsyProvider.addValidationRule('isFruit', function (value) {
      return ['apple', 'orange', 'pear'].indexOf(value) >= 0;
    });
  });
```
```html
<my-input name="fruit" validations="'isFruit"/>
```
Another example:
```javascript
angular.module('MyApp', ['formsy'])
  .config(function (formsyProvider) {
    formsyProvider.addValidationRule('isIn', function (value, array) {
      return array.indexOf(value) >= 0;
    });
  });
```
```html
<my-input name="fruit" validations="isIn:['apple', 'orange', 'pear']"/>
```
## Validators
**isValue**
```html
<my-input name="foo" validations="isValue"/>
```
Returns true if the value is thruthful

**isEmail**
```html
<my-input name="foo" validations="isEmail"/>
```
Return true if it is an email

**isTrue**
```html
<my-input name="foo" validations="isTrue"/>
```
Returns true if the value is the boolean true

**isNumeric**
```html
<my-input name="foo" validations="isNumeric"/>
```
Returns true if string only contains numbers

**isAlpha**
```html
<my-input name="foo" validations="isAlpha"/>
```
Returns true if string is only letters

**isLength:min**, **isLength:min:max**
```html
<my-input name="foo" validations="isLength:8"/>
<my-input name="foo" validations="isLength:5:12"/>
```
Returns true if the value length is the equal or more than minimum and equal or less than maximum, if maximum is passed

**equals:value**
```html
<my-input name="foo" validations="equals:4"/>
```
Return true if the value from input component matches value passed (==).