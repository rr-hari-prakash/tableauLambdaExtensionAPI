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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Wrap everything in an anonymous function to avoid polluting the global namespace
(async () => {
    class Filtering {
        // Avoid globals
        constructor(_$) {
            this._$ = _$;
            this.unregisterHandlerFunctions = [];
        }
        async initialize() {
            console.log('Waiting for DOM ready');
            await this._$.ready;
            console.log('Initializing extension API');
            await tableau.extensions.initializeAsync();
            // Fetch Filters
            this.fetchFilters();
            // Add button handlers for clearing filters.
            this._$('#clear').click(() => this.clearAllFilters());
        }
        async fetchFilters() {
            // While performing async task, show loading message to user.
            this._$('#loading').addClass('show');
            // Since filter info is attached to the worksheet, we will perform
            // one async call per worksheet to get every filter used in this
            // dashboard.  This demonstrates the use of Promise.all to combine
            // promises together and wait for each of them to resolve.
            const filterFetchPromises = [];
            // List of all filters in a dashboard.
            const dashboardfilters = [];
            // To get filter info, first get the dashboard.
            const dashboard = tableau.extensions.dashboardContent.dashboard;
            // Whenever we restore the filters table, remove all save handling functions,
            // since we add them back later in fetchFilters()
            this.unregisterHandlerFunctions.forEach(function (unregisterHandlerFunction) {
                unregisterHandlerFunction();
            });
            this.unregisterHandlerFunctions = [];
            // Then loop through each worksheet and get its filters, save promise for later.
            dashboard.worksheets.forEach(function (worksheet) {
                filterFetchPromises.push(worksheet.getFiltersAsync());
                // Add filter event to each worksheet.  AddEventListener returns a function that will
                // remove the event listener when called.
                const unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, (event) => this.filterChangedHandler(event));
                this.unregisterHandlerFunctions.push(unregisterHandlerFunction);
            }, this);
            // Now, we call every filter fetch promise, and wait for all the results
            // to finish before displaying the results to the user.
            const fetchResults = await Promise.all(filterFetchPromises);
            fetchResults.forEach(function (filtersForWorksheet) {
                filtersForWorksheet.forEach(function (filter) {
                    dashboardfilters.push(filter);
                });
            });
            this.buildFiltersTable(dashboardfilters);
        }
        // This is a handling function that is called anytime a filter is changed in Tableau.
        filterChangedHandler(filterEvent) {
            // Just reconstruct the filters table whenever a filter changes.
            // This could be optimized to add/remove only the different filters.
            this.fetchFilters();
        }
        // Constructs UI that displays all the dataSources in this dashboard
        // given a mapping from dataSourceId to dataSource objects.
        buildFiltersTable(filters) {
            // Clear the table first.
            this._$('#filtersTable > tbody tr').remove();
            const filtersTable = this._$('#filtersTable > tbody')[0];
            filters.forEach(function (filter) {
                // @ts-ignore
                const newRow = filtersTable.insertRow(filtersTable.rows.length);
                const nameCell = newRow.insertCell(0);
                const worksheetCell = newRow.insertCell(1);
                const typeCell = newRow.insertCell(2);
                const valuesCell = newRow.insertCell(3);
                const valueStr = this.getFilterValues(filter);
                nameCell.innerHTML = filter.fieldName;
                worksheetCell.innerHTML = filter.worksheetName;
                typeCell.innerHTML = filter.filterType;
                valuesCell.innerHTML = valueStr;
            }, this);
            this.updateUIState(Object.keys(filters).length > 0);
        }
        // This returns a string representation of the values a filter is set to.
        // Depending on the type of filter, this string will take a different form.
        getFilterValues(filter) {
            let filterValues = '';
            switch (filter.filterType) {
                case tableau.FilterType.Categorical:
                    const categoricalFilter = filter;
                    categoricalFilter.appliedValues.forEach(function (value) {
                        filterValues += value.formattedValue + ', ';
                    });
                    break;
                case tableau.FilterType.Range:
                    // A range filter can have a min and/or a max.
                    const rangeFilter = filter;
                    if (rangeFilter.minValue) {
                        filterValues += 'min: ' + rangeFilter.minValue.formattedValue + ', ';
                    }
                    if (rangeFilter.maxValue) {
                        filterValues += 'min: ' + rangeFilter.maxValue.formattedValue + ', ';
                    }
                    break;
                case tableau.FilterType.RelativeDate:
                    const relDateFilter = filter;
                    filterValues += 'Period: ' + relDateFilter.periodType + ', ';
                    filterValues += 'RangeN: ' + relDateFilter.rangeN + ', ';
                    filterValues += 'Range Type: ' + relDateFilter.rangeType + ', ';
                    break;
                default:
            }
            // Cut off the trailing ", "
            return filterValues.slice(0, -2);
        }
        // This function removes all filters from a dashboard.
        clearAllFilters() {
            // While performing async task, show loading message to user.
            this._$('#loading').removeClass('hidden').addClass('show');
            this._$('#filtersTable').removeClass('show').addClass('hidden');
            const dashboard = tableau.extensions.dashboardContent.dashboard;
            dashboard.worksheets.forEach(function (worksheet) {
                worksheet.getFiltersAsync().then(async (filtersForWorksheet) => {
                    const filterClearPromises = [];
                    filtersForWorksheet.forEach(function (filter) {
                        filterClearPromises.push(worksheet.clearFilterAsync(filter.fieldName));
                    });
                    // Same pattern as in fetchFilters, wait until all promises have finished
                    // before updating the UI state.
                    await Promise.all(filterClearPromises);
                    this.updateUIState(false);
                });
            }, this);
        }
        // This helper updates the UI depending on whether or not there are filters
        // that exist in the dashboard.  Accepts a boolean.
        updateUIState(filtersExist) {
            this._$('#loading').addClass('hidden');
            if (filtersExist) {
                this._$('#filtersTable').removeClass('hidden').addClass('show');
                this._$('#noFiltersWarning').removeClass('show').addClass('hidden');
            }
            else {
                this._$('#noFiltersWarning').removeClass('hidden').addClass('show');
                this._$('#filtersTable').removeClass('show').addClass('hidden');
            }
        }
    }
    console.log('Initializing Filtering extension.');
    await new Filtering($).initialize();
})();


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vU2FtcGxlcy1UeXBlc2NyaXB0L0ZpbHRlcmluZy9maWx0ZXJpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7QUMxRUEsbUZBQW1GO0FBQ25GLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDUixNQUFNLFNBQVM7UUFJWCxnQkFBZ0I7UUFDaEIsWUFBb0IsRUFBZ0I7WUFBaEIsT0FBRSxHQUFGLEVBQUUsQ0FBYztZQUg1QiwrQkFBMEIsR0FBRyxFQUFFLENBQUM7UUFHQSxDQUFDO1FBRWxDLEtBQUssQ0FBQyxVQUFVO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNyQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBRXBCLE9BQU8sQ0FBQyxHQUFHLENB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QUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkU7UUFDTCxDQUFDO0tBRUo7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFDakQsTUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN4QyxDQUFDLENBQUMsRUFBRSxDQUFDIiwiZmlsZSI6ImZpbHRlcmluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxKTtcbiIsImltcG9ydCB7XG4gICAgQ2F0ZWdvcmljYWxGaWx0ZXIsXG4gICAgRmlsdGVyLFxuICAgIFJhbmdlRmlsdGVyLFxuICAgIFJlbGF0aXZlRGF0ZUZpbHRlcixcbiAgICBUYWJsZWF1RXZlbnRcbn0gZnJvbSAnQHRhYmxlYXUvZXh0ZW5zaW9ucy1hcGktdHlwZXMnO1xuXG4vLyBXcmFwIGV2ZXJ5dGhpbmcgaW4gYW4gYW5vbnltb3VzIGZ1bmN0aW9uIHRvIGF2b2lkIHBvbGx1dGluZyB0aGUgZ2xvYmFsIG5hbWVzcGFjZVxuKGFzeW5jICgpID0+IHtcbiAgICBjbGFzcyBGaWx0ZXJpbmcge1xuXG4gICAgICAgIHByaXZhdGUgdW5yZWdpc3RlckhhbmRsZXJGdW5jdGlvbnMgPSBbXTtcblxuICAgICAgICAvLyBBdm9pZCBnbG9iYWxzXG4gICAgICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgXyQ6IEpRdWVyeVN0YXRpYykgeyB9XG5cbiAgICAgICAgcHVibGljIGFzeW5jIGluaXRpYWxpemUoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnV2FpdGluZyBmb3IgRE9NIHJlYWR5Jyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl8kLnJlYWR5O1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIGV4dGVuc2lvbiBBUEknKTtcbiAgICAgICAgICAgIGF3YWl0IHRhYmxlYXUuZXh0ZW5zaW9ucy5pbml0aWFsaXplQXN5bmMoKTtcblxuICAgICAgICAgICAgLy8gRmV0Y2ggRmlsdGVyc1xuICAgICAgICAgICAgdGhpcy5mZXRjaEZpbHRlcnMoKTtcblxuICAgICAgICAgICAgLy8gQWRkIGJ1dHRvbiBoYW5kbGVycyBmb3IgY2xlYXJpbmcgZmlsdGVycy5cbiAgICAgICAgICAgIHRoaXMuXyQoJyNjbGVhcicpLmNsaWNrKCgpID0+IHRoaXMuY2xlYXJBbGxGaWx0ZXJzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBhc3luYyBmZXRjaEZpbHRlcnMoKSB7XG4gICAgICAgICAgICAvLyBXaGlsZSBwZXJmb3JtaW5nIGFzeW5jIHRhc2ssIHNob3cgbG9hZGluZyBtZXNzYWdlIHRvIHVzZXIuXG4gICAgICAgICAgICB0aGlzLl8kKCcjbG9hZGluZycpLmFkZENsYXNzKCdzaG93Jyk7XG5cbiAgICAgICAgICAgIC8vIFNpbmNlIGZpbHRlciBpbmZvIGlzIGF0dGFjaGVkIHRvIHRoZSB3b3Jrc2hlZXQsIHdlIHdpbGwgcGVyZm9ybVxuICAgICAgICAgICAgLy8gb25lIGFzeW5jIGNhbGwgcGVyIHdvcmtzaGVldCB0byBnZXQgZXZlcnkgZmlsdGVyIHVzZWQgaW4gdGhpc1xuICAgICAgICAgICAgLy8gZGFzaGJvYXJkLiAgVGhpcyBkZW1vbnN0cmF0ZXMgdGhlIHVzZSBvZiBQcm9taXNlLmFsbCB0byBjb21iaW5lXG4gICAgICAgICAgICAvLyBwcm9taXNlcyB0b2dldGhlciBhbmQgd2FpdCBmb3IgZWFjaCBvZiB0aGVtIHRvIHJlc29sdmUuXG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJGZXRjaFByb21pc2VzOiBBcnJheTxQcm9taXNlPEZpbHRlcltdPj4gPSBbXTtcblxuICAgICAgICAgICAgLy8gTGlzdCBvZiBhbGwgZmlsdGVycyBpbiBhIGRhc2hib2FyZC5cbiAgICAgICAgICAgIGNvbnN0IGRhc2hib2FyZGZpbHRlcnM6IEZpbHRlcltdID0gW107XG5cbiAgICAgICAgICAgIC8vIFRvIGdldCBmaWx0ZXIgaW5mbywgZmlyc3QgZ2V0IHRoZSBkYXNoYm9hcmQuXG4gICAgICAgICAgICBjb25zdCBkYXNoYm9hcmQgPSB0YWJsZWF1LmV4dGVuc2lvbnMuZGFzaGJvYXJkQ29udGVudC5kYXNoYm9hcmQ7XG5cbiAgICAgICAgICAgIC8vIFdoZW5ldmVyIHdlIHJlc3RvcmUgdGhlIGZpbHRlcnMgdGFibGUsIHJlbW92ZSBhbGwgc2F2ZSBoYW5kbGluZyBmdW5jdGlvbnMsXG4gICAgICAgICAgICAvLyBzaW5jZSB3ZSBhZGQgdGhlbSBiYWNrIGxhdGVyIGluIGZldGNoRmlsdGVycygpXG4gICAgICAgICAgICB0aGlzLnVucmVnaXN0ZXJIYW5kbGVyRnVuY3Rpb25zLmZvckVhY2goZnVuY3Rpb24odW5yZWdpc3RlckhhbmRsZXJGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgIHVucmVnaXN0ZXJIYW5kbGVyRnVuY3Rpb24oKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnVucmVnaXN0ZXJIYW5kbGVyRnVuY3Rpb25zID0gW107XG4gICAgICAgICAgICAvLyBUaGVuIGxvb3AgdGhyb3VnaCBlYWNoIHdvcmtzaGVldCBhbmQgZ2V0IGl0cyBmaWx0ZXJzLCBzYXZlIHByb21pc2UgZm9yIGxhdGVyLlxuICAgICAgICAgICAgZGFzaGJvYXJkLndvcmtzaGVldHMuZm9yRWFjaChmdW5jdGlvbih3b3Jrc2hlZXQpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJGZXRjaFByb21pc2VzLnB1c2god29ya3NoZWV0LmdldEZpbHRlcnNBc3luYygpKTtcblxuICAgICAgICAgICAgICAgIC8vIEFkZCBmaWx0ZXIgZXZlbnQgdG8gZWFjaCB3b3Jrc2hlZXQuICBBZGRFdmVudExpc3RlbmVyIHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGxcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyIHdoZW4gY2FsbGVkLlxuICAgICAgICAgICAgICAgIGNvbnN0IHVucmVnaXN0ZXJIYW5kbGVyRnVuY3Rpb24gPVxuICAgICAgICAgICAgICAgICAgICB3b3Jrc2hlZXQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlYXUuVGFibGVhdUV2ZW50VHlwZS5GaWx0ZXJDaGFuZ2VkLCAoZXZlbnQpID0+IHRoaXMuZmlsdGVyQ2hhbmdlZEhhbmRsZXIoZXZlbnQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVucmVnaXN0ZXJIYW5kbGVyRnVuY3Rpb25zLnB1c2godW5yZWdpc3RlckhhbmRsZXJGdW5jdGlvbik7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgLy8gTm93LCB3ZSBjYWxsIGV2ZXJ5IGZpbHRlciBmZXRjaCBwcm9taXNlLCBhbmQgd2FpdCBmb3IgYWxsIHRoZSByZXN1bHRzXG4gICAgICAgICAgICAvLyB0byBmaW5pc2ggYmVmb3JlIGRpc3BsYXlpbmcgdGhlIHJlc3VsdHMgdG8gdGhlIHVzZXIuXG4gICAgICAgICAgICBjb25zdCBmZXRjaFJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChmaWx0ZXJGZXRjaFByb21pc2VzKTtcbiAgICAgICAgICAgIGZldGNoUmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uKGZpbHRlcnNGb3JXb3Jrc2hlZXQpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJzRm9yV29ya3NoZWV0LmZvckVhY2goZnVuY3Rpb24oZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhc2hib2FyZGZpbHRlcnMucHVzaChmaWx0ZXIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYnVpbGRGaWx0ZXJzVGFibGUoZGFzaGJvYXJkZmlsdGVycyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGlzIGEgaGFuZGxpbmcgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgYW55dGltZSBhIGZpbHRlciBpcyBjaGFuZ2VkIGluIFRhYmxlYXUuXG4gICAgICAgIHByaXZhdGUgZmlsdGVyQ2hhbmdlZEhhbmRsZXIoZmlsdGVyRXZlbnQ6IFRhYmxlYXVFdmVudCkge1xuICAgICAgICAgICAgLy8gSnVzdCByZWNvbnN0cnVjdCB0aGUgZmlsdGVycyB0YWJsZSB3aGVuZXZlciBhIGZpbHRlciBjaGFuZ2VzLlxuICAgICAgICAgICAgLy8gVGhpcyBjb3VsZCBiZSBvcHRpbWl6ZWQgdG8gYWRkL3JlbW92ZSBvbmx5IHRoZSBkaWZmZXJlbnQgZmlsdGVycy5cbiAgICAgICAgICAgIHRoaXMuZmV0Y2hGaWx0ZXJzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb25zdHJ1Y3RzIFVJIHRoYXQgZGlzcGxheXMgYWxsIHRoZSBkYXRhU291cmNlcyBpbiB0aGlzIGRhc2hib2FyZFxuICAgICAgICAvLyBnaXZlbiBhIG1hcHBpbmcgZnJvbSBkYXRhU291cmNlSWQgdG8gZGF0YVNvdXJjZSBvYmplY3RzLlxuICAgICAgICBwcml2YXRlIGJ1aWxkRmlsdGVyc1RhYmxlKGZpbHRlcnM6IEZpbHRlcltdKSB7XG4gICAgICAgICAgICAvLyBDbGVhciB0aGUgdGFibGUgZmlyc3QuXG4gICAgICAgICAgICB0aGlzLl8kKCcjZmlsdGVyc1RhYmxlID4gdGJvZHkgdHInKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcnNUYWJsZSA9IHRoaXMuXyQoJyNmaWx0ZXJzVGFibGUgPiB0Ym9keScpWzBdO1xuXG4gICAgICAgICAgICBmaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24oZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1JvdyA9IGZpbHRlcnNUYWJsZS5pbnNlcnRSb3coZmlsdGVyc1RhYmxlLnJvd3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lQ2VsbCA9IG5ld1Jvdy5pbnNlcnRDZWxsKDApO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdvcmtzaGVldENlbGwgPSBuZXdSb3cuaW5zZXJ0Q2VsbCgxKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlQ2VsbCA9IG5ld1Jvdy5pbnNlcnRDZWxsKDIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlc0NlbGwgPSBuZXdSb3cuaW5zZXJ0Q2VsbCgzKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlU3RyID0gdGhpcy5nZXRGaWx0ZXJWYWx1ZXMoZmlsdGVyKTtcblxuICAgICAgICAgICAgICAgIG5hbWVDZWxsLmlubmVySFRNTCA9IGZpbHRlci5maWVsZE5hbWU7XG4gICAgICAgICAgICAgICAgd29ya3NoZWV0Q2VsbC5pbm5lckhUTUwgPSBmaWx0ZXIud29ya3NoZWV0TmFtZTtcbiAgICAgICAgICAgICAgICB0eXBlQ2VsbC5pbm5lckhUTUwgPSBmaWx0ZXIuZmlsdGVyVHlwZTtcbiAgICAgICAgICAgICAgICB2YWx1ZXNDZWxsLmlubmVySFRNTCA9IHZhbHVlU3RyO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlVUlTdGF0ZShPYmplY3Qua2V5cyhmaWx0ZXJzKS5sZW5ndGggPiAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgcmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmFsdWVzIGEgZmlsdGVyIGlzIHNldCB0by5cbiAgICAgICAgLy8gRGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIGZpbHRlciwgdGhpcyBzdHJpbmcgd2lsbCB0YWtlIGEgZGlmZmVyZW50IGZvcm0uXG4gICAgICAgIHByaXZhdGUgZ2V0RmlsdGVyVmFsdWVzKGZpbHRlcjogRmlsdGVyKSB7XG4gICAgICAgICAgICBsZXQgZmlsdGVyVmFsdWVzID0gJyc7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZmlsdGVyLmZpbHRlclR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIHRhYmxlYXUuRmlsdGVyVHlwZS5DYXRlZ29yaWNhbDpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2F0ZWdvcmljYWxGaWx0ZXIgPSBmaWx0ZXIgYXMgQ2F0ZWdvcmljYWxGaWx0ZXI7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3JpY2FsRmlsdGVyLmFwcGxpZWRWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyVmFsdWVzICs9IHZhbHVlLmZvcm1hdHRlZFZhbHVlICsgJywgJztcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdGFibGVhdS5GaWx0ZXJUeXBlLlJhbmdlOlxuICAgICAgICAgICAgICAgICAgICAvLyBBIHJhbmdlIGZpbHRlciBjYW4gaGF2ZSBhIG1pbiBhbmQvb3IgYSBtYXguXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlRmlsdGVyID0gZmlsdGVyIGFzIFJhbmdlRmlsdGVyO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmFuZ2VGaWx0ZXIubWluVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclZhbHVlcyArPSAnbWluOiAnICsgcmFuZ2VGaWx0ZXIubWluVmFsdWUuZm9ybWF0dGVkVmFsdWUgKyAnLCAnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhbmdlRmlsdGVyLm1heFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJWYWx1ZXMgKz0gJ21pbjogJyArIHJhbmdlRmlsdGVyLm1heFZhbHVlLmZvcm1hdHRlZFZhbHVlICsgJywgJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHRhYmxlYXUuRmlsdGVyVHlwZS5SZWxhdGl2ZURhdGU6XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbERhdGVGaWx0ZXIgPSBmaWx0ZXIgYXMgUmVsYXRpdmVEYXRlRmlsdGVyO1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJWYWx1ZXMgKz0gJ1BlcmlvZDogJyArIHJlbERhdGVGaWx0ZXIucGVyaW9kVHlwZSArICcsICc7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlclZhbHVlcyArPSAnUmFuZ2VOOiAnICsgcmVsRGF0ZUZpbHRlci5yYW5nZU4gKyAnLCAnO1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJWYWx1ZXMgKz0gJ1JhbmdlIFR5cGU6ICcgKyByZWxEYXRlRmlsdGVyLnJhbmdlVHlwZSArICcsICc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEN1dCBvZmYgdGhlIHRyYWlsaW5nIFwiLCBcIlxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlclZhbHVlcy5zbGljZSgwLCAtMik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGZ1bmN0aW9uIHJlbW92ZXMgYWxsIGZpbHRlcnMgZnJvbSBhIGRhc2hib2FyZC5cbiAgICAgICAgcHJpdmF0ZSBjbGVhckFsbEZpbHRlcnMoKSB7XG4gICAgICAgICAgICAvLyBXaGlsZSBwZXJmb3JtaW5nIGFzeW5jIHRhc2ssIHNob3cgbG9hZGluZyBtZXNzYWdlIHRvIHVzZXIuXG4gICAgICAgICAgICB0aGlzLl8kKCcjbG9hZGluZycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKS5hZGRDbGFzcygnc2hvdycpO1xuICAgICAgICAgICAgdGhpcy5fJCgnI2ZpbHRlcnNUYWJsZScpLnJlbW92ZUNsYXNzKCdzaG93JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuXG4gICAgICAgICAgICBjb25zdCBkYXNoYm9hcmQgPSB0YWJsZWF1LmV4dGVuc2lvbnMuZGFzaGJvYXJkQ29udGVudC5kYXNoYm9hcmQ7XG5cbiAgICAgICAgICAgIGRhc2hib2FyZC53b3Jrc2hlZXRzLmZvckVhY2goZnVuY3Rpb24od29ya3NoZWV0KSB7XG4gICAgICAgICAgICAgICAgd29ya3NoZWV0LmdldEZpbHRlcnNBc3luYygpLnRoZW4oYXN5bmMgKGZpbHRlcnNGb3JXb3Jrc2hlZXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyQ2xlYXJQcm9taXNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcnNGb3JXb3Jrc2hlZXQuZm9yRWFjaChmdW5jdGlvbihmaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckNsZWFyUHJvbWlzZXMucHVzaCh3b3Jrc2hlZXQuY2xlYXJGaWx0ZXJBc3luYyhmaWx0ZXIuZmllbGROYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhbWUgcGF0dGVybiBhcyBpbiBmZXRjaEZpbHRlcnMsIHdhaXQgdW50aWwgYWxsIHByb21pc2VzIGhhdmUgZmluaXNoZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gYmVmb3JlIHVwZGF0aW5nIHRoZSBVSSBzdGF0ZS5cbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsdGVyQ2xlYXJQcm9taXNlcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVUlTdGF0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaGVscGVyIHVwZGF0ZXMgdGhlIFVJIGRlcGVuZGluZyBvbiB3aGV0aGVyIG9yIG5vdCB0aGVyZSBhcmUgZmlsdGVyc1xuICAgICAgICAvLyB0aGF0IGV4aXN0IGluIHRoZSBkYXNoYm9hcmQuICBBY2NlcHRzIGEgYm9vbGVhbi5cbiAgICAgICAgcHJpdmF0ZSB1cGRhdGVVSVN0YXRlKGZpbHRlcnNFeGlzdDogYm9vbGVhbikge1xuICAgICAgICAgICAgdGhpcy5fJCgnI2xvYWRpbmcnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICBpZiAoZmlsdGVyc0V4aXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fJCgnI2ZpbHRlcnNUYWJsZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKS5hZGRDbGFzcygnc2hvdycpO1xuICAgICAgICAgICAgICAgIHRoaXMuXyQoJyNub0ZpbHRlcnNXYXJuaW5nJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKS5hZGRDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuXyQoJyNub0ZpbHRlcnNXYXJuaW5nJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpLmFkZENsYXNzKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fJCgnI2ZpbHRlcnNUYWJsZScpLnJlbW92ZUNsYXNzKCdzaG93JykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIEZpbHRlcmluZyBleHRlbnNpb24uJyk7XG4gICAgYXdhaXQgbmV3IEZpbHRlcmluZygkKS5pbml0aWFsaXplKCk7XG59KSgpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==