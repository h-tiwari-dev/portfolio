/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/home/page",{

/***/ "(app-client)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%2FUsers%2Fharshtiwari%2FDocuments%2Fportfolio%2Fcomponents%2Fcommon%2FdownloadFile.tsx&modules=%2FUsers%2Fharshtiwari%2FDocuments%2Fportfolio%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fimage.js&server=false!":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%2FUsers%2Fharshtiwari%2FDocuments%2Fportfolio%2Fcomponents%2Fcommon%2FdownloadFile.tsx&modules=%2FUsers%2Fharshtiwari%2FDocuments%2Fportfolio%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fimage.js&server=false! ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

eval(__webpack_require__.ts("Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./components/common/downloadFile.tsx */ \"(app-client)/./components/common/downloadFile.tsx\"));\nPromise.resolve(/*! import() eager */).then(__webpack_require__.t.bind(__webpack_require__, /*! ./node_modules/next/dist/client/image.js */ \"(app-client)/./node_modules/next/dist/client/image.js\", 23))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1jbGllbnQpLy4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1mbGlnaHQtY2xpZW50LWVudHJ5LWxvYWRlci5qcz9tb2R1bGVzPSUyRlVzZXJzJTJGaGFyc2h0aXdhcmklMkZEb2N1bWVudHMlMkZwb3J0Zm9saW8lMkZjb21wb25lbnRzJTJGY29tbW9uJTJGZG93bmxvYWRGaWxlLnRzeCZtb2R1bGVzPSUyRlVzZXJzJTJGaGFyc2h0aXdhcmklMkZEb2N1bWVudHMlMkZwb3J0Zm9saW8lMkZub2RlX21vZHVsZXMlMkZuZXh0JTJGZGlzdCUyRmNsaWVudCUyRmltYWdlLmpzJnNlcnZlcj1mYWxzZSEuanMiLCJtYXBwaW5ncyI6IkFBQUEsMkxBQThHO0FBQzlHIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8/ZmFmNCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9oYXJzaHRpd2FyaS9Eb2N1bWVudHMvcG9ydGZvbGlvL2NvbXBvbmVudHMvY29tbW9uL2Rvd25sb2FkRmlsZS50c3hcIik7XG5pbXBvcnQoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9oYXJzaHRpd2FyaS9Eb2N1bWVudHMvcG9ydGZvbGlvL25vZGVfbW9kdWxlcy9uZXh0L2Rpc3QvY2xpZW50L2ltYWdlLmpzXCIpIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-client)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%2FUsers%2Fharshtiwari%2FDocuments%2Fportfolio%2Fcomponents%2Fcommon%2FdownloadFile.tsx&modules=%2FUsers%2Fharshtiwari%2FDocuments%2Fportfolio%2Fnode_modules%2Fnext%2Fdist%2Fclient%2Fimage.js&server=false!\n"));

/***/ }),

/***/ "(app-client)/./components/common/downloadFile.tsx":
/*!********************************************!*\
  !*** ./components/common/downloadFile.tsx ***!
  \********************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ DownloadFile; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-client)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ \"(app-client)/./node_modules/next/dist/compiled/buffer/index.js\")[\"Buffer\"];\n\nfunction handleDownload($event, file, fileName) {\n    $event.preventDefault();\n    const buffer = Buffer.from(file);\n    const blob = new Blob([\n        buffer\n    ], {\n        type: \"application/*\"\n    });\n    console.log(\"Blob\", blob, file);\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement(\"a\");\n    a.href = url;\n    a.download = fileName; // Replace with your desired file name\n    a.click();\n    URL.revokeObjectURL(url);\n}\nfunction DownloadFile(param) {\n    let { file , fileName  } = param;\n    console.log(\"file:\", file);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"a\", {\n        className: \"ml-10 text-blue-500 underline truncate\",\n        href: \"#\",\n        onClick: (e)=>handleDownload(e, file, fileName),\n        children: fileName\n    }, void 0, false, {\n        fileName: \"/Users/harshtiwari/Documents/portfolio/components/common/downloadFile.tsx\",\n        lineNumber: 22,\n        columnNumber: 9\n    }, this);\n}\n_c = DownloadFile;\nvar _c;\n$RefreshReg$(_c, \"DownloadFile\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports on update so we can compare the boundary\n                // signatures.\n                module.hot.dispose(function (data) {\n                    data.prevExports = currentExports;\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevExports !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevExports !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1jbGllbnQpLy4vY29tcG9uZW50cy9jb21tb24vZG93bmxvYWRGaWxlLnRzeC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBR0EsU0FBU0EsZUFBZUMsTUFBa0IsRUFBRUMsSUFBWSxFQUFFQyxRQUFnQixFQUFFO0lBQ3hFRixPQUFPRyxjQUFjO0lBQ3JCLE1BQU1DLFNBQVNDLE1BQU1BLENBQUNDLElBQUksQ0FBQ0w7SUFFM0IsTUFBTU0sT0FBTyxJQUFJQyxLQUFLO1FBQUNKO0tBQU8sRUFBRTtRQUFFSyxNQUFNO0lBQWdCO0lBQ3hEQyxRQUFRQyxHQUFHLENBQUMsUUFBUUosTUFBTU47SUFFMUIsTUFBTVcsTUFBTUMsSUFBSUMsZUFBZSxDQUFDUDtJQUNoQyxNQUFNUSxJQUFJQyxTQUFTQyxhQUFhLENBQUM7SUFDakNGLEVBQUVHLElBQUksR0FBR047SUFDVEcsRUFBRUksUUFBUSxHQUFHakIsVUFBVSxzQ0FBc0M7SUFDN0RhLEVBQUVLLEtBQUs7SUFDUFAsSUFBSVEsZUFBZSxDQUFDVDtBQUN4QjtBQUVlLFNBQVNVLGFBQWEsS0FBc0QsRUFBRTtRQUF4RCxFQUFFckIsS0FBSSxFQUFFQyxTQUFRLEVBQXNDLEdBQXREO0lBQ2pDUSxRQUFRQyxHQUFHLENBQUMsU0FBU1Y7SUFDckIscUJBQ0ksOERBQUNjO1FBQUVRLFdBQVU7UUFBeUNMLE1BQUs7UUFBSU0sU0FBUyxDQUFDQyxJQUFNMUIsZUFBZTBCLEdBQUd4QixNQUFnQkM7a0JBQWFBOzs7Ozs7QUFFdEksQ0FBQztLQUx1Qm9CIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL2NvbXBvbmVudHMvY29tbW9uL2Rvd25sb2FkRmlsZS50c3g/ZWMxZCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBjbGllbnRcIjtcbmltcG9ydCB7IE1vdXNlRXZlbnQgfSBmcm9tIFwicmVhY3RcIjtcblxuZnVuY3Rpb24gaGFuZGxlRG93bmxvYWQoJGV2ZW50OiBNb3VzZUV2ZW50LCBmaWxlOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuZnJvbShmaWxlKTtcblxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbYnVmZmVyXSwgeyB0eXBlOiBcImFwcGxpY2F0aW9uLypcIiB9KTtcbiAgICBjb25zb2xlLmxvZyhcIkJsb2JcIiwgYmxvYiwgZmlsZSk7XG5cbiAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5ocmVmID0gdXJsO1xuICAgIGEuZG93bmxvYWQgPSBmaWxlTmFtZTsgLy8gUmVwbGFjZSB3aXRoIHlvdXIgZGVzaXJlZCBmaWxlIG5hbWVcbiAgICBhLmNsaWNrKCk7XG4gICAgVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRG93bmxvYWRGaWxlKHsgZmlsZSwgZmlsZU5hbWUgfTogeyBmaWxlOiBCdWZmZXIsIGZpbGVOYW1lOiBzdHJpbmcgfSkge1xuICAgIGNvbnNvbGUubG9nKFwiZmlsZTpcIiwgZmlsZSlcbiAgICByZXR1cm4gKFxuICAgICAgICA8YSBjbGFzc05hbWU9XCJtbC0xMCB0ZXh0LWJsdWUtNTAwIHVuZGVybGluZSB0cnVuY2F0ZVwiIGhyZWY9XCIjXCIgb25DbGljaz17KGUpID0+IGhhbmRsZURvd25sb2FkKGUsIGZpbGUgYXMgQnVmZmVyLCBmaWxlTmFtZSl9ID57ZmlsZU5hbWV9PC9hPlxuICAgIClcbn0iXSwibmFtZXMiOlsiaGFuZGxlRG93bmxvYWQiLCIkZXZlbnQiLCJmaWxlIiwiZmlsZU5hbWUiLCJwcmV2ZW50RGVmYXVsdCIsImJ1ZmZlciIsIkJ1ZmZlciIsImZyb20iLCJibG9iIiwiQmxvYiIsInR5cGUiLCJjb25zb2xlIiwibG9nIiwidXJsIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwiYSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImhyZWYiLCJkb3dubG9hZCIsImNsaWNrIiwicmV2b2tlT2JqZWN0VVJMIiwiRG93bmxvYWRGaWxlIiwiY2xhc3NOYW1lIiwib25DbGljayIsImUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-client)/./components/common/downloadFile.tsx\n"));

/***/ })

});