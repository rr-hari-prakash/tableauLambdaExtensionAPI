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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Wrap everything in an anonymous function to avoid polluting the global namespace
(async () => {
    class DataSources {
        // Avoid globals.
        constructor(_$) {
            this._$ = _$;
        }
        /**
         * Refreshes the given dataSource
         * @param dataSource
         */
        static async refreshDataSource(dataSource) {
            await dataSource.refreshAsync();
            console.log(dataSource.name + ': Refreshed Successfully');
        }
        /**
         * Initializes the extension
         */
        async initialize() {
            console.log('Waiting for DOM ready');
            await this._$.ready;
            console.log('Initializing extension API');
            await tableau.extensions.initializeAsync();
            // Since dataSource info is attached to the worksheet, we will perform
            // one async call per worksheet to get every dataSource used in this
            // dashboard.  This demonstrates the use of Promise.all to combine
            // promises together and wait for each of them to resolve.
            const dataSourceFetchPromises = [];
            // To get dataSource info, first get the dashboard.
            const dashboard = tableau.extensions.dashboardContent.dashboard;
            // Then loop through each worksheet and get its dataSources, save promise for later.
            dashboard.worksheets.forEach(worksheet => dataSourceFetchPromises.push(worksheet.getDataSourcesAsync()));
            const fetchResults = await Promise.all(dataSourceFetchPromises);
            // Maps dataSource id to dataSource so we can keep track of unique dataSources.
            const dataSourcesCheck = {};
            const dashboardDataSources = [];
            fetchResults.forEach(dss => {
                dss.forEach(ds => {
                    if (!dataSourcesCheck[ds.id]) {
                        // We've already seen it, skip it.
                        dataSourcesCheck[ds.id] = true;
                        dashboardDataSources.push(ds);
                    }
                });
            });
            this.buildDataSourcesTable(dashboardDataSources);
            // This just modifies the UI by removing the loading banner and showing the dataSources table.
            this._$('#loading').addClass('hidden');
            this._$('#dataSourcesTable')
                .removeClass('hidden')
                .addClass('show');
        }
        /**
         * Displays a modal dialog with more details about the given dataSource.
         * @param dataSource
         */
        async showModal(dataSource) {
            const modal = this._$('#infoModal');
            this._$('#nameDetail').text(dataSource.name);
            this._$('#idDetail').text(dataSource.id);
            this._$('#typeDetail').text((dataSource.isExtract) ? 'Extract' : 'Live');
            // Loop through every field in the dataSource and concat it to a string.
            let fieldNamesStr = '';
            dataSource.fields.forEach(function (field) {
                fieldNamesStr += field.name + ', ';
            });
            // Slice off the last ", " for formatting.
            this._$('#fieldsDetail').text(fieldNamesStr.slice(0, -2));
            // Loop through each connection summary and list the connection's
            // name and type in the info field
            const connectionSummaries = await dataSource.getConnectionSummariesAsync();
            let connectionsStr = '';
            connectionSummaries.forEach(function (summary) {
                connectionsStr += summary.name + ': ' + summary.type + ', ';
            });
            // Slice of the last ", " for formatting.
            this._$('#connectionsDetail').text(connectionsStr.slice(0, -2));
            // Loop through each table that was used in creating this datasource
            const activeTables = await dataSource.getActiveTablesAsync();
            let tableStr = '';
            activeTables.forEach(function (table) {
                tableStr += table.name + ', ';
            });
            // Slice of the last ", " for formatting.
            this._$('#activeTablesDetail').text(tableStr.slice(0, -2));
            // @ts-ignore
            modal.modal('show');
        }
        /**
         * Constructs UI that displays all the dataSources in this dashboard
         * given a mapping from dataSourceId to dataSource objects.
         * @param dataSources
         */
        buildDataSourcesTable(dataSources) {
            // Clear the table first.
            this._$('#dataSourcesTable > tbody tr').remove();
            const dataSourcesTable = this._$('#dataSourcesTable > tbody')[0];
            // Add an entry to the dataSources table for each dataSource.
            for (const dataSource of dataSources) {
                // @ts-ignore
                const newRow = dataSourcesTable.insertRow(dataSourcesTable.rows.length);
                const nameCell = newRow.insertCell(0);
                const refreshCell = newRow.insertCell(1);
                const infoCell = newRow.insertCell(2);
                const refreshButton = document.createElement('button');
                refreshButton.innerHTML = 'Refresh Now';
                refreshButton.type = 'button';
                refreshButton.className = 'btn btn-primary';
                refreshButton.addEventListener('click', () => DataSources.refreshDataSource(dataSource));
                const infoSpan = document.createElement('span');
                infoSpan.className = 'glyphicon glyphicon-info-sign';
                infoSpan.addEventListener('click', () => this.showModal(dataSource));
                nameCell.innerHTML = dataSource.name;
                refreshCell.appendChild(refreshButton);
                infoCell.appendChild(infoSpan);
            }
        }
    }
    console.log('Initializing DataSources extension.');
    await new DataSources($).initialize();
})();


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vU2FtcGxlcy1UeXBlc2NyaXB0L0RhdGFTb3VyY2VzL2RhdGFzb3VyY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7QUNoRkEsbUZBQW1GO0FBQ25GLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDVixNQUFNLFdBQVc7UUFDZixpQkFBaUI7UUFDakIsWUFBb0IsRUFBZ0I7WUFBaEIsT0FBRSxHQUFGLEVBQUUsQ0FBYztRQUFJLENBQUM7UUFFekM7OztXQUdHO1FBQ0ssTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxVQUFzQjtZQUMzRCxNQUFNLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsMEJBQTBCLENBQUMsQ0FB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Q0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDdkMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNoQztRQUNILENBQUM7S0FDRjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQUNuRCxNQUFNLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxFQUFFLENBQUMiLCJmaWxlIjoiZGF0YXNvdXJjZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG4iLCJpbXBvcnQgeyBEYXRhU291cmNlIH0gZnJvbSAnQHRhYmxlYXUvZXh0ZW5zaW9ucy1hcGktdHlwZXMnO1xuXG4vLyBXcmFwIGV2ZXJ5dGhpbmcgaW4gYW4gYW5vbnltb3VzIGZ1bmN0aW9uIHRvIGF2b2lkIHBvbGx1dGluZyB0aGUgZ2xvYmFsIG5hbWVzcGFjZVxuKGFzeW5jICgpID0+IHtcbiAgY2xhc3MgRGF0YVNvdXJjZXMge1xuICAgIC8vIEF2b2lkIGdsb2JhbHMuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfJDogSlF1ZXJ5U3RhdGljKSB7IH1cblxuICAgIC8qKlxuICAgICAqIFJlZnJlc2hlcyB0aGUgZ2l2ZW4gZGF0YVNvdXJjZVxuICAgICAqIEBwYXJhbSBkYXRhU291cmNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgcmVmcmVzaERhdGFTb3VyY2UoZGF0YVNvdXJjZTogRGF0YVNvdXJjZSkge1xuICAgICAgYXdhaXQgZGF0YVNvdXJjZS5yZWZyZXNoQXN5bmMoKTtcbiAgICAgIGNvbnNvbGUubG9nKGRhdGFTb3VyY2UubmFtZSArICc6IFJlZnJlc2hlZCBTdWNjZXNzZnVsbHknKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgZXh0ZW5zaW9uXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGluaXRpYWxpemUoKSB7XG4gICAgICBjb25zb2xlLmxvZygnV2FpdGluZyBmb3IgRE9NIHJlYWR5Jyk7XG4gICAgICBhd2FpdCB0aGlzLl8kLnJlYWR5O1xuICAgICAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBleHRlbnNpb24gQVBJJyk7XG4gICAgICBhd2FpdCB0YWJsZWF1LmV4dGVuc2lvbnMuaW5pdGlhbGl6ZUFzeW5jKCk7XG5cbiAgICAgIC8vIFNpbmNlIGRhdGFTb3VyY2UgaW5mbyBpcyBhdHRhY2hlZCB0byB0aGUgd29ya3NoZWV0LCB3ZSB3aWxsIHBlcmZvcm1cbiAgICAgIC8vIG9uZSBhc3luYyBjYWxsIHBlciB3b3Jrc2hlZXQgdG8gZ2V0IGV2ZXJ5IGRhdGFTb3VyY2UgdXNlZCBpbiB0aGlzXG4gICAgICAvLyBkYXNoYm9hcmQuICBUaGlzIGRlbW9uc3RyYXRlcyB0aGUgdXNlIG9mIFByb21pc2UuYWxsIHRvIGNvbWJpbmVcbiAgICAgIC8vIHByb21pc2VzIHRvZ2V0aGVyIGFuZCB3YWl0IGZvciBlYWNoIG9mIHRoZW0gdG8gcmVzb2x2ZS5cbiAgICAgIGNvbnN0IGRhdGFTb3VyY2VGZXRjaFByb21pc2VzOiBBcnJheTxQcm9taXNlPERhdGFTb3VyY2VbXT4+ID0gW107XG5cbiAgICAgIC8vIFRvIGdldCBkYXRhU291cmNlIGluZm8sIGZpcnN0IGdldCB0aGUgZGFzaGJvYXJkLlxuICAgICAgY29uc3QgZGFzaGJvYXJkID0gdGFibGVhdS5leHRlbnNpb25zLmRhc2hib2FyZENvbnRlbnQuZGFzaGJvYXJkO1xuICAgICAgLy8gVGhlbiBsb29wIHRocm91Z2ggZWFjaCB3b3Jrc2hlZXQgYW5kIGdldCBpdHMgZGF0YVNvdXJjZXMsIHNhdmUgcHJvbWlzZSBmb3IgbGF0ZXIuXG4gICAgICBkYXNoYm9hcmQud29ya3NoZWV0cy5mb3JFYWNoKHdvcmtzaGVldCA9PiBkYXRhU291cmNlRmV0Y2hQcm9taXNlcy5wdXNoKHdvcmtzaGVldC5nZXREYXRhU291cmNlc0FzeW5jKCkpKTtcbiAgICAgIGNvbnN0IGZldGNoUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKGRhdGFTb3VyY2VGZXRjaFByb21pc2VzKTtcblxuICAgICAgLy8gTWFwcyBkYXRhU291cmNlIGlkIHRvIGRhdGFTb3VyY2Ugc28gd2UgY2FuIGtlZXAgdHJhY2sgb2YgdW5pcXVlIGRhdGFTb3VyY2VzLlxuICAgICAgY29uc3QgZGF0YVNvdXJjZXNDaGVjayA9IHt9O1xuICAgICAgY29uc3QgZGFzaGJvYXJkRGF0YVNvdXJjZXM6IERhdGFTb3VyY2VbXSA9IFtdO1xuXG4gICAgICBmZXRjaFJlc3VsdHMuZm9yRWFjaChkc3MgPT4ge1xuICAgICAgICBkc3MuZm9yRWFjaChkcyA9PiB7XG4gICAgICAgICAgaWYgKCFkYXRhU291cmNlc0NoZWNrW2RzLmlkXSkge1xuICAgICAgICAgICAgLy8gV2UndmUgYWxyZWFkeSBzZWVuIGl0LCBza2lwIGl0LlxuICAgICAgICAgICAgZGF0YVNvdXJjZXNDaGVja1tkcy5pZF0gPSB0cnVlO1xuICAgICAgICAgICAgZGFzaGJvYXJkRGF0YVNvdXJjZXMucHVzaChkcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmJ1aWxkRGF0YVNvdXJjZXNUYWJsZShkYXNoYm9hcmREYXRhU291cmNlcyk7XG5cbiAgICAgIC8vIFRoaXMganVzdCBtb2RpZmllcyB0aGUgVUkgYnkgcmVtb3ZpbmcgdGhlIGxvYWRpbmcgYmFubmVyIGFuZCBzaG93aW5nIHRoZSBkYXRhU291cmNlcyB0YWJsZS5cbiAgICAgIHRoaXMuXyQoJyNsb2FkaW5nJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgdGhpcy5fJCgnI2RhdGFTb3VyY2VzVGFibGUnKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpXG4gICAgICAgIC5hZGRDbGFzcygnc2hvdycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3BsYXlzIGEgbW9kYWwgZGlhbG9nIHdpdGggbW9yZSBkZXRhaWxzIGFib3V0IHRoZSBnaXZlbiBkYXRhU291cmNlLlxuICAgICAqIEBwYXJhbSBkYXRhU291cmNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBzaG93TW9kYWwoZGF0YVNvdXJjZTogRGF0YVNvdXJjZSkge1xuICAgICAgY29uc3QgbW9kYWwgPSB0aGlzLl8kKCcjaW5mb01vZGFsJyk7XG5cbiAgICAgIHRoaXMuXyQoJyNuYW1lRGV0YWlsJykudGV4dChkYXRhU291cmNlLm5hbWUpO1xuICAgICAgdGhpcy5fJCgnI2lkRGV0YWlsJykudGV4dChkYXRhU291cmNlLmlkKTtcbiAgICAgIHRoaXMuXyQoJyN0eXBlRGV0YWlsJykudGV4dCgoZGF0YVNvdXJjZS5pc0V4dHJhY3QpID8gJ0V4dHJhY3QnIDogJ0xpdmUnKTtcblxuICAgICAgLy8gTG9vcCB0aHJvdWdoIGV2ZXJ5IGZpZWxkIGluIHRoZSBkYXRhU291cmNlIGFuZCBjb25jYXQgaXQgdG8gYSBzdHJpbmcuXG4gICAgICBsZXQgZmllbGROYW1lc1N0ciA9ICcnO1xuICAgICAgZGF0YVNvdXJjZS5maWVsZHMuZm9yRWFjaChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICBmaWVsZE5hbWVzU3RyICs9IGZpZWxkLm5hbWUgKyAnLCAnO1xuICAgICAgfSk7XG4gICAgICAvLyBTbGljZSBvZmYgdGhlIGxhc3QgXCIsIFwiIGZvciBmb3JtYXR0aW5nLlxuICAgICAgdGhpcy5fJCgnI2ZpZWxkc0RldGFpbCcpLnRleHQoZmllbGROYW1lc1N0ci5zbGljZSgwLCAtMikpO1xuXG4gICAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBjb25uZWN0aW9uIHN1bW1hcnkgYW5kIGxpc3QgdGhlIGNvbm5lY3Rpb24nc1xuICAgICAgLy8gbmFtZSBhbmQgdHlwZSBpbiB0aGUgaW5mbyBmaWVsZFxuICAgICAgY29uc3QgY29ubmVjdGlvblN1bW1hcmllcyA9IGF3YWl0IGRhdGFTb3VyY2UuZ2V0Q29ubmVjdGlvblN1bW1hcmllc0FzeW5jKCk7XG4gICAgICBsZXQgY29ubmVjdGlvbnNTdHIgPSAnJztcbiAgICAgIGNvbm5lY3Rpb25TdW1tYXJpZXMuZm9yRWFjaChmdW5jdGlvbihzdW1tYXJ5KSB7XG4gICAgICAgIGNvbm5lY3Rpb25zU3RyICs9IHN1bW1hcnkubmFtZSArICc6ICcgKyBzdW1tYXJ5LnR5cGUgKyAnLCAnO1xuICAgICAgfSk7XG4gICAgICAvLyBTbGljZSBvZiB0aGUgbGFzdCBcIiwgXCIgZm9yIGZvcm1hdHRpbmcuXG4gICAgICB0aGlzLl8kKCcjY29ubmVjdGlvbnNEZXRhaWwnKS50ZXh0KGNvbm5lY3Rpb25zU3RyLnNsaWNlKDAsIC0yKSk7XG5cbiAgICAgIC8vIExvb3AgdGhyb3VnaCBlYWNoIHRhYmxlIHRoYXQgd2FzIHVzZWQgaW4gY3JlYXRpbmcgdGhpcyBkYXRhc291cmNlXG4gICAgICBjb25zdCBhY3RpdmVUYWJsZXMgPSBhd2FpdCBkYXRhU291cmNlLmdldEFjdGl2ZVRhYmxlc0FzeW5jKCk7XG4gICAgICBsZXQgdGFibGVTdHIgPSAnJztcbiAgICAgIGFjdGl2ZVRhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRhYmxlKSB7XG4gICAgICAgIHRhYmxlU3RyICs9IHRhYmxlLm5hbWUgKyAnLCAnO1xuICAgICAgfSk7XG4gICAgICAvLyBTbGljZSBvZiB0aGUgbGFzdCBcIiwgXCIgZm9yIGZvcm1hdHRpbmcuXG4gICAgICB0aGlzLl8kKCcjYWN0aXZlVGFibGVzRGV0YWlsJykudGV4dCh0YWJsZVN0ci5zbGljZSgwLCAtMikpO1xuXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBtb2RhbC5tb2RhbCgnc2hvdycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgVUkgdGhhdCBkaXNwbGF5cyBhbGwgdGhlIGRhdGFTb3VyY2VzIGluIHRoaXMgZGFzaGJvYXJkXG4gICAgICogZ2l2ZW4gYSBtYXBwaW5nIGZyb20gZGF0YVNvdXJjZUlkIHRvIGRhdGFTb3VyY2Ugb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0gZGF0YVNvdXJjZXNcbiAgICAgKi9cbiAgICBwcml2YXRlIGJ1aWxkRGF0YVNvdXJjZXNUYWJsZShkYXRhU291cmNlczogRGF0YVNvdXJjZVtdKSB7XG4gICAgICAvLyBDbGVhciB0aGUgdGFibGUgZmlyc3QuXG4gICAgICB0aGlzLl8kKCcjZGF0YVNvdXJjZXNUYWJsZSA+IHRib2R5IHRyJykucmVtb3ZlKCk7XG4gICAgICBjb25zdCBkYXRhU291cmNlc1RhYmxlID0gdGhpcy5fJCgnI2RhdGFTb3VyY2VzVGFibGUgPiB0Ym9keScpWzBdO1xuXG4gICAgICAvLyBBZGQgYW4gZW50cnkgdG8gdGhlIGRhdGFTb3VyY2VzIHRhYmxlIGZvciBlYWNoIGRhdGFTb3VyY2UuXG4gICAgICBmb3IgKGNvbnN0IGRhdGFTb3VyY2Ugb2YgZGF0YVNvdXJjZXMpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBjb25zdCBuZXdSb3cgPSBkYXRhU291cmNlc1RhYmxlLmluc2VydFJvdyhkYXRhU291cmNlc1RhYmxlLnJvd3MubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgbmFtZUNlbGwgPSBuZXdSb3cuaW5zZXJ0Q2VsbCgwKTtcbiAgICAgICAgY29uc3QgcmVmcmVzaENlbGwgPSBuZXdSb3cuaW5zZXJ0Q2VsbCgxKTtcbiAgICAgICAgY29uc3QgaW5mb0NlbGwgPSBuZXdSb3cuaW5zZXJ0Q2VsbCgyKTtcblxuICAgICAgICBjb25zdCByZWZyZXNoQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIHJlZnJlc2hCdXR0b24uaW5uZXJIVE1MID0gJ1JlZnJlc2ggTm93JztcbiAgICAgICAgcmVmcmVzaEJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIHJlZnJlc2hCdXR0b24uY2xhc3NOYW1lID0gJ2J0biBidG4tcHJpbWFyeSc7XG4gICAgICAgIHJlZnJlc2hCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBEYXRhU291cmNlcy5yZWZyZXNoRGF0YVNvdXJjZShkYXRhU291cmNlKSk7XG5cbiAgICAgICAgY29uc3QgaW5mb1NwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGluZm9TcGFuLmNsYXNzTmFtZSA9ICdnbHlwaGljb24gZ2x5cGhpY29uLWluZm8tc2lnbic7XG4gICAgICAgIGluZm9TcGFuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5zaG93TW9kYWwoZGF0YVNvdXJjZSkpO1xuXG4gICAgICAgIG5hbWVDZWxsLmlubmVySFRNTCA9IGRhdGFTb3VyY2UubmFtZTtcbiAgICAgICAgcmVmcmVzaENlbGwuYXBwZW5kQ2hpbGQocmVmcmVzaEJ1dHRvbik7XG4gICAgICAgIGluZm9DZWxsLmFwcGVuZENoaWxkKGluZm9TcGFuKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIERhdGFTb3VyY2VzIGV4dGVuc2lvbi4nKTtcbiAgYXdhaXQgbmV3IERhdGFTb3VyY2VzKCQpLmluaXRpYWxpemUoKTtcbn0pKCk7XG4iXSwic291cmNlUm9vdCI6IiJ9