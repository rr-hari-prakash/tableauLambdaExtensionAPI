/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ({

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Wrap everything in an anonymous function to avoid polluting the global namespace
(async () => {
    class Parameters {
        // Avoid globals
        constructor(_$) {
            this._$ = _$;
        }
        // This is the entry point into the extension.  It initializes the Tableau Extensions Api, and then
        // grabs all of the parameters in the workbook, processing each one individually.
        async initialize() {
            console.log('Waiting for DOM ready');
            await this._$.ready;
            console.log('Initializing extension API');
            await tableau.extensions.initializeAsync();
            const table = this._$('#parameterTable');
            const tableBody = table.children('tbody');
            const parameters = await tableau.extensions.dashboardContent.dashboard.getParametersAsync();
            parameters.forEach(function (p) {
                p.addEventListener(tableau.TableauEventType.ParameterChanged, (event) => this.onParameterChange(event));
                this.parameterRow(p).appendTo(tableBody);
            }, this);
            // This is used to manipulate what part of the UI is visible.  If there are no parameters
            // found, we want to give you a message to tell you that you need to add one, otherwise, we
            // show the table we created.
            this._$('#loading').addClass('hidden');
            if (parameters.length === 0) {
                this._$('#addParameterWarning').removeClass('hidden').addClass('show');
            }
            else {
                this._$('#parameterTable').removeClass('hidden').addClass('show');
            }
        }
        // When the parameter is changed, we recreate the row with the updated values.  This keeps the code
        // clean, and emulates the approach that something like React does where it "rerenders" the UI with
        // the updated data.
        //
        // To avoid multiple layout processing in the browser, we build the new row unattached to the DOM,
        // and then attach it at the very end.  This helps avoid jank.
        onParameterChange(parameterChangeEvent) {
            parameterChangeEvent.getParameterAsync().then(function (param) {
                const newRow = this.parameterRow(param);
                // tslint:disable-next-line:quotemark
                const oldRow = this._$("tr[data-fieldname='" + param.id + "'");
                oldRow.replaceWith(newRow);
            });
        }
        //
        // DOM creation methods
        //
        // A cell in the table
        cell(value) {
            const row = this._$('<td>');
            row.append(value);
            return row;
        }
        // A simple cell that contains a text value
        textCell(value) {
            const cellElement = this._$('<td>');
            cellElement.text(value);
            return cellElement;
        }
        // The allowable values column has a complex structure, so to make things easier/cleaner,
        // this function creates the subtree for the value of the allowable values column.
        allowableValues(value) {
            function termKey(key) {
                return $('<dt>').attr('id', key).text(key);
            }
            function termValue(termVal, termDefault) {
                return $('<dd>').text(termVal || termDefault);
            }
            const allowable = this._$('<dl class="dl-horizontal">');
            switch (value.type) {
                case tableau.ParameterValueType.All:
                    allowable.append(termKey('Restrictions'));
                    allowable.append(termValue('None', ''));
                    break;
                case tableau.ParameterValueType.List:
                    value.allowableValues.forEach(function (allowableValue) {
                        allowable.append(termKey('List Value'));
                        allowable.append(termValue(allowableValue.formattedValue, ''));
                    });
                    break;
                case tableau.ParameterValueType.Range:
                    allowable.append(termKey('Min Value'));
                    allowable.append(termValue(value.minValue.formattedValue, 'No Min'));
                    allowable.append(termKey('Max Value'));
                    allowable.append(termValue(value.maxValue.formattedValue, 'No Max'));
                    allowable.append(termKey('Step Size'));
                    allowable.append(termValue(value.stepSize, 'default'));
                    break;
                default:
                    console.error('Unknown Parameter value type: ' + value.type);
            }
            return allowable;
        }
        // This function creates a subtree of a row for a specific parameter.
        parameterRow(p) {
            const row = this._$('<tr>').attr('data-fieldname', p.id);
            row.append(this.textCell(p.name));
            row.append(this.textCell(p.dataType));
            row.append(this.textCell(p.currentValue.formattedValue));
            row.append(this.cell(this.allowableValues(p.allowableValues)));
            return row;
        }
    }
    console.log('Initializing Parameters extension.');
    await new Parameters($).initialize();
})();


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vU2FtcGxlcy1UeXBlc2NyaXB0L1BhcmFtZXRlcnMvcGFyYW1ldGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7OztBQzFFQSxtRkFBbUY7QUFDbkYsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUVSLE1BQU0sVUFBVTtRQUNaLGdCQUFnQjtRQUNoQixZQUFvQixFQUFnQjtZQUFoQixPQUFFLEdBQUYsRUFBRSxDQUFjO1FBQUksQ0FBQztRQUV6QyxtR0FBbUc7UUFDbkcsaUZBQWlGO1FBQzFFLEtBQUssQ0FBQyxVQUFVO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNyQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBRXBCLE9BQU8sQ0FBQyxHQUFHLENB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LENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDekMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyIsImZpbGUiOiJwYXJhbWV0ZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDIpO1xuIiwiaW1wb3J0IHtcbiAgICBQYXJhbWV0ZXIsXG4gICAgUGFyYW1ldGVyQ2hhbmdlZEV2ZW50LFxuICAgIFBhcmFtZXRlckRvbWFpblJlc3RyaWN0aW9uXG59IGZyb20gJ0B0YWJsZWF1L2V4dGVuc2lvbnMtYXBpLXR5cGVzJztcblxuaW1wb3J0IHsgRGF0YVR5cGUgfSBmcm9tICdAdGFibGVhdS9leHRlbnNpb25zLWFwaS10eXBlcy9FeHRlcm5hbENvbnRyYWN0L05hbWVzcGFjZXMvVGFibGVhdSc7XG5cbi8vIFdyYXAgZXZlcnl0aGluZyBpbiBhbiBhbm9ueW1vdXMgZnVuY3Rpb24gdG8gYXZvaWQgcG9sbHV0aW5nIHRoZSBnbG9iYWwgbmFtZXNwYWNlXG4oYXN5bmMgKCkgPT4ge1xuXG4gICAgY2xhc3MgUGFyYW1ldGVycyB7XG4gICAgICAgIC8vIEF2b2lkIGdsb2JhbHNcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSBfJDogSlF1ZXJ5U3RhdGljKSB7IH1cblxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCBpbnRvIHRoZSBleHRlbnNpb24uICBJdCBpbml0aWFsaXplcyB0aGUgVGFibGVhdSBFeHRlbnNpb25zIEFwaSwgYW5kIHRoZW5cbiAgICAgICAgLy8gZ3JhYnMgYWxsIG9mIHRoZSBwYXJhbWV0ZXJzIGluIHRoZSB3b3JrYm9vaywgcHJvY2Vzc2luZyBlYWNoIG9uZSBpbmRpdmlkdWFsbHkuXG4gICAgICAgIHB1YmxpYyBhc3luYyBpbml0aWFsaXplKCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dhaXRpbmcgZm9yIERPTSByZWFkeScpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fJC5yZWFkeTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBleHRlbnNpb24gQVBJJyk7XG4gICAgICAgICAgICBhd2FpdCB0YWJsZWF1LmV4dGVuc2lvbnMuaW5pdGlhbGl6ZUFzeW5jKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHRhYmxlID0gdGhpcy5fJCgnI3BhcmFtZXRlclRhYmxlJyk7XG4gICAgICAgICAgICBjb25zdCB0YWJsZUJvZHkgPSB0YWJsZS5jaGlsZHJlbigndGJvZHknKTtcblxuICAgICAgICAgICAgY29uc3QgcGFyYW1ldGVycyA9IGF3YWl0IHRhYmxlYXUuZXh0ZW5zaW9ucy5kYXNoYm9hcmRDb250ZW50LmRhc2hib2FyZC5nZXRQYXJhbWV0ZXJzQXN5bmMoKTtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICAgICAgcC5hZGRFdmVudExpc3RlbmVyKHRhYmxlYXUuVGFibGVhdUV2ZW50VHlwZS5QYXJhbWV0ZXJDaGFuZ2VkLCAoZXZlbnQpID0+IHRoaXMub25QYXJhbWV0ZXJDaGFuZ2UoZXZlbnQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlclJvdyhwKS5hcHBlbmRUbyh0YWJsZUJvZHkpO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgdXNlZCB0byBtYW5pcHVsYXRlIHdoYXQgcGFydCBvZiB0aGUgVUkgaXMgdmlzaWJsZS4gIElmIHRoZXJlIGFyZSBubyBwYXJhbWV0ZXJzXG4gICAgICAgICAgICAvLyBmb3VuZCwgd2Ugd2FudCB0byBnaXZlIHlvdSBhIG1lc3NhZ2UgdG8gdGVsbCB5b3UgdGhhdCB5b3UgbmVlZCB0byBhZGQgb25lLCBvdGhlcndpc2UsIHdlXG4gICAgICAgICAgICAvLyBzaG93IHRoZSB0YWJsZSB3ZSBjcmVhdGVkLlxuICAgICAgICAgICAgdGhpcy5fJCgnI2xvYWRpbmcnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICBpZiAocGFyYW1ldGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl8kKCcjYWRkUGFyYW1ldGVyV2FybmluZycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKS5hZGRDbGFzcygnc2hvdycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl8kKCcjcGFyYW1ldGVyVGFibGUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJykuYWRkQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2hlbiB0aGUgcGFyYW1ldGVyIGlzIGNoYW5nZWQsIHdlIHJlY3JlYXRlIHRoZSByb3cgd2l0aCB0aGUgdXBkYXRlZCB2YWx1ZXMuICBUaGlzIGtlZXBzIHRoZSBjb2RlXG4gICAgICAgIC8vIGNsZWFuLCBhbmQgZW11bGF0ZXMgdGhlIGFwcHJvYWNoIHRoYXQgc29tZXRoaW5nIGxpa2UgUmVhY3QgZG9lcyB3aGVyZSBpdCBcInJlcmVuZGVyc1wiIHRoZSBVSSB3aXRoXG4gICAgICAgIC8vIHRoZSB1cGRhdGVkIGRhdGEuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRvIGF2b2lkIG11bHRpcGxlIGxheW91dCBwcm9jZXNzaW5nIGluIHRoZSBicm93c2VyLCB3ZSBidWlsZCB0aGUgbmV3IHJvdyB1bmF0dGFjaGVkIHRvIHRoZSBET00sXG4gICAgICAgIC8vIGFuZCB0aGVuIGF0dGFjaCBpdCBhdCB0aGUgdmVyeSBlbmQuICBUaGlzIGhlbHBzIGF2b2lkIGphbmsuXG4gICAgICAgIHByaXZhdGUgb25QYXJhbWV0ZXJDaGFuZ2UocGFyYW1ldGVyQ2hhbmdlRXZlbnQ6IFBhcmFtZXRlckNoYW5nZWRFdmVudCkge1xuICAgICAgICAgICAgcGFyYW1ldGVyQ2hhbmdlRXZlbnQuZ2V0UGFyYW1ldGVyQXN5bmMoKS50aGVuKGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Um93ID0gdGhpcy5wYXJhbWV0ZXJSb3cocGFyYW0pO1xuICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpxdW90ZW1hcmtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRSb3cgPSB0aGlzLl8kKFwidHJbZGF0YS1maWVsZG5hbWU9J1wiICsgcGFyYW0uaWQgKyBcIidcIik7XG4gICAgICAgICAgICAgICAgb2xkUm93LnJlcGxhY2VXaXRoKG5ld1Jvdyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIERPTSBjcmVhdGlvbiBtZXRob2RzXG4gICAgICAgIC8vXG5cbiAgICAgICAgLy8gQSBjZWxsIGluIHRoZSB0YWJsZVxuICAgICAgICBwcml2YXRlIGNlbGwodmFsdWU6IEpRdWVyeTxIVE1MRWxlbWVudD4pIHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuXyQoJzx0ZD4nKTtcbiAgICAgICAgICAgIHJvdy5hcHBlbmQodmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEEgc2ltcGxlIGNlbGwgdGhhdCBjb250YWlucyBhIHRleHQgdmFsdWVcbiAgICAgICAgcHJpdmF0ZSB0ZXh0Q2VsbCh2YWx1ZTogc3RyaW5nIHwgRGF0YVR5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGxFbGVtZW50ID0gdGhpcy5fJCgnPHRkPicpO1xuICAgICAgICAgICAgY2VsbEVsZW1lbnQudGV4dCh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gY2VsbEVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgYWxsb3dhYmxlIHZhbHVlcyBjb2x1bW4gaGFzIGEgY29tcGxleCBzdHJ1Y3R1cmUsIHNvIHRvIG1ha2UgdGhpbmdzIGVhc2llci9jbGVhbmVyLFxuICAgICAgICAvLyB0aGlzIGZ1bmN0aW9uIGNyZWF0ZXMgdGhlIHN1YnRyZWUgZm9yIHRoZSB2YWx1ZSBvZiB0aGUgYWxsb3dhYmxlIHZhbHVlcyBjb2x1bW4uXG4gICAgICAgIHByaXZhdGUgYWxsb3dhYmxlVmFsdWVzKHZhbHVlOiBQYXJhbWV0ZXJEb21haW5SZXN0cmljdGlvbikge1xuICAgICAgICAgICAgZnVuY3Rpb24gdGVybUtleShrZXk6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkKCc8ZHQ+JykuYXR0cignaWQnLCBrZXkpLnRleHQoa2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gdGVybVZhbHVlKHRlcm1WYWw6IHN0cmluZyB8IG51bWJlciwgdGVybURlZmF1bHQ6IHN0cmluZykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkKCc8ZGQ+JykudGV4dCh0ZXJtVmFsIHx8IHRlcm1EZWZhdWx0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYWxsb3dhYmxlID0gdGhpcy5fJCgnPGRsIGNsYXNzPVwiZGwtaG9yaXpvbnRhbFwiPicpO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKHZhbHVlLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIHRhYmxlYXUuUGFyYW1ldGVyVmFsdWVUeXBlLkFsbDpcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dhYmxlLmFwcGVuZCh0ZXJtS2V5KCdSZXN0cmljdGlvbnMnKSk7XG4gICAgICAgICAgICAgICAgICAgIGFsbG93YWJsZS5hcHBlbmQodGVybVZhbHVlKCdOb25lJywgJycpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0YWJsZWF1LlBhcmFtZXRlclZhbHVlVHlwZS5MaXN0OlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5hbGxvd2FibGVWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbihhbGxvd2FibGVWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dhYmxlLmFwcGVuZCh0ZXJtS2V5KCdMaXN0IFZhbHVlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dhYmxlLmFwcGVuZCh0ZXJtVmFsdWUoYWxsb3dhYmxlVmFsdWUuZm9ybWF0dGVkVmFsdWUsICcnKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRhYmxlYXUuUGFyYW1ldGVyVmFsdWVUeXBlLlJhbmdlOlxuICAgICAgICAgICAgICAgICAgICBhbGxvd2FibGUuYXBwZW5kKHRlcm1LZXkoJ01pbiBWYWx1ZScpKTtcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dhYmxlLmFwcGVuZCh0ZXJtVmFsdWUodmFsdWUubWluVmFsdWUuZm9ybWF0dGVkVmFsdWUsICdObyBNaW4nKSk7XG4gICAgICAgICAgICAgICAgICAgIGFsbG93YWJsZS5hcHBlbmQodGVybUtleSgnTWF4IFZhbHVlJykpO1xuICAgICAgICAgICAgICAgICAgICBhbGxvd2FibGUuYXBwZW5kKHRlcm1WYWx1ZSh2YWx1ZS5tYXhWYWx1ZS5mb3JtYXR0ZWRWYWx1ZSwgJ05vIE1heCcpKTtcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dhYmxlLmFwcGVuZCh0ZXJtS2V5KCdTdGVwIFNpemUnKSk7XG4gICAgICAgICAgICAgICAgICAgIGFsbG93YWJsZS5hcHBlbmQodGVybVZhbHVlKHZhbHVlLnN0ZXBTaXplLCAnZGVmYXVsdCcpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5rbm93biBQYXJhbWV0ZXIgdmFsdWUgdHlwZTogJyArIHZhbHVlLnR5cGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYWxsb3dhYmxlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgc3VidHJlZSBvZiBhIHJvdyBmb3IgYSBzcGVjaWZpYyBwYXJhbWV0ZXIuXG4gICAgICAgIHByaXZhdGUgcGFyYW1ldGVyUm93KHA6IFBhcmFtZXRlcikge1xuICAgICAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5fJCgnPHRyPicpLmF0dHIoJ2RhdGEtZmllbGRuYW1lJywgcC5pZCk7XG4gICAgICAgICAgICByb3cuYXBwZW5kKHRoaXMudGV4dENlbGwocC5uYW1lKSk7XG4gICAgICAgICAgICByb3cuYXBwZW5kKHRoaXMudGV4dENlbGwocC5kYXRhVHlwZSkpO1xuICAgICAgICAgICAgcm93LmFwcGVuZCh0aGlzLnRleHRDZWxsKHAuY3VycmVudFZhbHVlLmZvcm1hdHRlZFZhbHVlKSk7XG4gICAgICAgICAgICByb3cuYXBwZW5kKHRoaXMuY2VsbCh0aGlzLmFsbG93YWJsZVZhbHVlcyhwLmFsbG93YWJsZVZhbHVlcykpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgUGFyYW1ldGVycyBleHRlbnNpb24uJyk7XG4gICAgYXdhaXQgbmV3IFBhcmFtZXRlcnMoJCkuaW5pdGlhbGl6ZSgpO1xufSkoKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=