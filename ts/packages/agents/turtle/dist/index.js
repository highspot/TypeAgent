/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/site/turtleAgent.ts":
/*!*********************************!*\
  !*** ./src/site/turtleAgent.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createTurtleAgent: () => (/* binding */ createTurtleAgent)
/* harmony export */ });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function createTurtleAgent(turtle) {
    return {
        async executeAction(action, context) {
            console.log(`Executing action: ${action.actionName}`);
            switch (action.actionName) {
                case "forward":
                    turtle.forward(action.parameters.pixel);
                    break;
                case "left":
                    turtle.left(action.parameters.degrees);
                    break;
                case "right":
                    turtle.right(action.parameters.degrees);
                    break;
                case "penUp":
                    turtle.penUp();
                    break;
                case "penDown":
                    turtle.penDown();
                    break;
                default:
                    throw new Error(`Unknown action: ${action.actionName}`);
            }
        },
    };
}


/***/ }),

/***/ "./src/site/turtleCanvas.ts":
/*!**********************************!*\
  !*** ./src/site/turtleCanvas.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createTurtleCanvas: () => (/* binding */ createTurtleCanvas)
/* harmony export */ });
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
function createTurtleCanvas() {
    const div = document.createElement("div");
    document.body.appendChild(div);
    div.className = "main";
    const turtleDiv = document.createElement("div");
    div.appendChild(turtleDiv);
    turtleDiv.className = "turtle";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    turtleDiv.appendChild(svg);
    svg.outerHTML = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,5 0,0 0,10" />
    </svg>`;
    const canvas = document.createElement("canvas");
    div.appendChild(canvas);
    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error("Cannot get 2d context");
    }
    let penDown = false;
    let x = height / 2;
    let y = height / 2;
    let angle = 0;
    const updatePosition = () => {
        turtleDiv.style.left = `${x - 5}px`;
        turtleDiv.style.top = `${y - 8}px`;
    };
    const updateAngle = () => {
        turtleDiv.style.rotate = `${angle}deg`;
    };
    updatePosition();
    return {
        forward(pixel) {
            const dx = Math.cos(angle * (Math.PI / 180)) * pixel;
            const dy = Math.sin(angle * (Math.PI / 180)) * pixel;
            if (penDown) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + dx, y + dy);
                ctx.stroke();
            }
            x += dx;
            y += dy;
            updatePosition();
        },
        left: (degrees) => {
            angle -= degrees;
            updateAngle();
        },
        right: (degrees) => {
            angle += degrees;
            updateAngle();
        },
        penUp: () => {
            penDown = false;
        },
        penDown: () => {
            penDown = true;
        },
    };
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!***************************!*\
  !*** ./src/site/index.ts ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _turtleAgent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./turtleAgent */ "./src/site/turtleAgent.ts");
/* harmony import */ var _turtleCanvas__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./turtleCanvas */ "./src/site/turtleCanvas.ts");
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.


const turtle = (0,_turtleCanvas__WEBPACK_IMPORTED_MODULE_1__.createTurtleCanvas)();
const agent = (0,_turtleAgent__WEBPACK_IMPORTED_MODULE_0__.createTurtleAgent)(turtle);
const schemaTs = `
export type TurtleAction =
    | TurtleForward
    | TurtleTurnLeft
    | TurtleTurnRight
    | TurtlePenUp
    | TurtlePenDown;

interface TurtleForward {
    actionName: "forward";
    parameters: {
        pixel: number;
    };
}

interface TurtleTurnLeft {
    actionName: "left";
    parameters: {
        degrees: number;
    };
}

interface TurtleTurnRight {
    actionName: "right";
    parameters: {
        degrees: number;
    };
}

interface TurtlePenUp {
    actionName: "penUp";
}

interface TurtlePenDown {
    actionName: "penDown";
}
`;
const manifest = {
    emojiChar: "🐢",
    description: "A turtle that can draw on a canvas",
    schema: {
        description: "Action to control the turtle to draw on a canvas",
        schemaType: "TurtleAction",
        schemaFile: { content: schemaTs, type: "ts" },
    },
};
let registered = false;
document.addEventListener("DOMContentLoaded", () => {
    if (!registered) {
        window
            .registerTypeAgent("turtle", manifest, agent)
            .then(() => {
            console.log("Turtle agent registered");
        })
            .catch((e) => {
            console.error("Failed to register turtle agent", e);
        });
        registered = true;
    }
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SyxDQUFDO0FBQ3ZCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7SUFDL0MsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2IsTUFBYzthQUNWLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDO2FBQzVDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUU7WUFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hELENBQUMsQ0FBQyxDQUFDO1FBQ1AsVUFBVSxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90dXJ0bGUvLi9zcmMvc2l0ZS90dXJ0bGVBZ2VudC50cyIsIndlYnBhY2s6Ly90dXJ0bGUvLi9zcmMvc2l0ZS90dXJ0bGVDYW52YXMudHMiLCJ3ZWJwYWNrOi8vdHVydGxlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3R1cnRsZS93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdHVydGxlL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHVydGxlL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vdHVydGxlLy4vc3JjL3NpdGUvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IEFwcEFnZW50LCBUeXBlQWdlbnRBY3Rpb24gfSBmcm9tIFwiQHR5cGVhZ2VudC9hZ2VudC1zZGtcIjtcbmltcG9ydCB7IFR1cnRsZSB9IGZyb20gXCIuL3R1cnRsZVR5cGVzXCI7XG5pbXBvcnQgeyBUdXJ0bGVBY3Rpb24gfSBmcm9tIFwiLi90dXJ0bGVBY3Rpb25TY2hlbWFcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVR1cnRsZUFnZW50KHR1cnRsZTogVHVydGxlKTogQXBwQWdlbnQge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFzeW5jIGV4ZWN1dGVBY3Rpb24oXG4gICAgICAgICAgICBhY3Rpb246IFR5cGVBZ2VudEFjdGlvbjxUdXJ0bGVBY3Rpb24+LFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgKTogUHJvbWlzZTx1bmRlZmluZWQ+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFeGVjdXRpbmcgYWN0aW9uOiAke2FjdGlvbi5hY3Rpb25OYW1lfWApO1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24uYWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJmb3J3YXJkXCI6XG4gICAgICAgICAgICAgICAgICAgIHR1cnRsZS5mb3J3YXJkKGFjdGlvbi5wYXJhbWV0ZXJzLnBpeGVsKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImxlZnRcIjpcbiAgICAgICAgICAgICAgICAgICAgdHVydGxlLmxlZnQoYWN0aW9uLnBhcmFtZXRlcnMuZGVncmVlcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyaWdodFwiOlxuICAgICAgICAgICAgICAgICAgICB0dXJ0bGUucmlnaHQoYWN0aW9uLnBhcmFtZXRlcnMuZGVncmVlcyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwZW5VcFwiOlxuICAgICAgICAgICAgICAgICAgICB0dXJ0bGUucGVuVXAoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInBlbkRvd25cIjpcbiAgICAgICAgICAgICAgICAgICAgdHVydGxlLnBlbkRvd24oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgYFVua25vd24gYWN0aW9uOiAkeyhhY3Rpb24gYXMgVHlwZUFnZW50QWN0aW9uKS5hY3Rpb25OYW1lfWAsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfTtcbn1cbiIsIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHVydGxlQ2FudmFzKCkge1xuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGRpdi5jbGFzc05hbWUgPSBcIm1haW5cIjtcblxuICAgIGNvbnN0IHR1cnRsZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LmFwcGVuZENoaWxkKHR1cnRsZURpdik7XG4gICAgdHVydGxlRGl2LmNsYXNzTmFtZSA9IFwidHVydGxlXCI7XG5cbiAgICBjb25zdCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInN2Z1wiKTtcbiAgICB0dXJ0bGVEaXYuYXBwZW5kQ2hpbGQoc3ZnKTtcblxuICAgIHN2Zy5vdXRlckhUTUwgPSBgPHN2ZyB3aWR0aD1cIjEwXCIgaGVpZ2h0PVwiMTBcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgICAgIDxwb2x5Z29uIHBvaW50cz1cIjEwLDUgMCwwIDAsMTBcIiAvPlxuICAgIDwvc3ZnPmA7XG5cbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG4gICAgY29uc3Qgd2lkdGggPSA4MDA7XG4gICAgY29uc3QgaGVpZ2h0ID0gODAwO1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoY3R4ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBnZXQgMmQgY29udGV4dFwiKTtcbiAgICB9XG4gICAgbGV0IHBlbkRvd24gPSBmYWxzZTtcbiAgICBsZXQgeCA9IGhlaWdodCAvIDI7XG4gICAgbGV0IHkgPSBoZWlnaHQgLyAyO1xuICAgIGxldCBhbmdsZSA9IDA7XG5cbiAgICBjb25zdCB1cGRhdGVQb3NpdGlvbiA9ICgpID0+IHtcbiAgICAgICAgdHVydGxlRGl2LnN0eWxlLmxlZnQgPSBgJHt4IC0gNX1weGA7XG4gICAgICAgIHR1cnRsZURpdi5zdHlsZS50b3AgPSBgJHt5IC0gOH1weGA7XG4gICAgfTtcblxuICAgIGNvbnN0IHVwZGF0ZUFuZ2xlID0gKCkgPT4ge1xuICAgICAgICB0dXJ0bGVEaXYuc3R5bGUucm90YXRlID0gYCR7YW5nbGV9ZGVnYDtcbiAgICB9O1xuICAgIHVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZm9yd2FyZChwaXhlbDogbnVtYmVyKSB7XG4gICAgICAgICAgICBjb25zdCBkeCA9IE1hdGguY29zKGFuZ2xlICogKE1hdGguUEkgLyAxODApKSAqIHBpeGVsO1xuICAgICAgICAgICAgY29uc3QgZHkgPSBNYXRoLnNpbihhbmdsZSAqIChNYXRoLlBJIC8gMTgwKSkgKiBwaXhlbDtcbiAgICAgICAgICAgIGlmIChwZW5Eb3duKSB7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5tb3ZlVG8oeCwgeSk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh4ICsgZHgsIHkgKyBkeSk7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgeCArPSBkeDtcbiAgICAgICAgICAgIHkgKz0gZHk7XG4gICAgICAgICAgICB1cGRhdGVQb3NpdGlvbigpO1xuICAgICAgICB9LFxuICAgICAgICBsZWZ0OiAoZGVncmVlczogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICBhbmdsZSAtPSBkZWdyZWVzO1xuICAgICAgICAgICAgdXBkYXRlQW5nbGUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmlnaHQ6IChkZWdyZWVzOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGFuZ2xlICs9IGRlZ3JlZXM7XG4gICAgICAgICAgICB1cGRhdGVBbmdsZSgpO1xuICAgICAgICB9LFxuICAgICAgICBwZW5VcDogKCkgPT4ge1xuICAgICAgICAgICAgcGVuRG93biA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBwZW5Eb3duOiAoKSA9PiB7XG4gICAgICAgICAgICBwZW5Eb3duID0gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICB9O1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgQXBwQWdlbnRNYW5pZmVzdCB9IGZyb20gXCJAdHlwZWFnZW50L2FnZW50LXNka1wiO1xuaW1wb3J0IHsgY3JlYXRlVHVydGxlQWdlbnQgfSBmcm9tIFwiLi90dXJ0bGVBZ2VudFwiO1xuaW1wb3J0IHsgY3JlYXRlVHVydGxlQ2FudmFzIH0gZnJvbSBcIi4vdHVydGxlQ2FudmFzXCI7XG5cbmNvbnN0IHR1cnRsZSA9IGNyZWF0ZVR1cnRsZUNhbnZhcygpO1xuY29uc3QgYWdlbnQgPSBjcmVhdGVUdXJ0bGVBZ2VudCh0dXJ0bGUpO1xuXG5jb25zdCBzY2hlbWFUcyA9IGBcbmV4cG9ydCB0eXBlIFR1cnRsZUFjdGlvbiA9XG4gICAgfCBUdXJ0bGVGb3J3YXJkXG4gICAgfCBUdXJ0bGVUdXJuTGVmdFxuICAgIHwgVHVydGxlVHVyblJpZ2h0XG4gICAgfCBUdXJ0bGVQZW5VcFxuICAgIHwgVHVydGxlUGVuRG93bjtcblxuaW50ZXJmYWNlIFR1cnRsZUZvcndhcmQge1xuICAgIGFjdGlvbk5hbWU6IFwiZm9yd2FyZFwiO1xuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgcGl4ZWw6IG51bWJlcjtcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgVHVydGxlVHVybkxlZnQge1xuICAgIGFjdGlvbk5hbWU6IFwibGVmdFwiO1xuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgZGVncmVlczogbnVtYmVyO1xuICAgIH07XG59XG5cbmludGVyZmFjZSBUdXJ0bGVUdXJuUmlnaHQge1xuICAgIGFjdGlvbk5hbWU6IFwicmlnaHRcIjtcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgIGRlZ3JlZXM6IG51bWJlcjtcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgVHVydGxlUGVuVXAge1xuICAgIGFjdGlvbk5hbWU6IFwicGVuVXBcIjtcbn1cblxuaW50ZXJmYWNlIFR1cnRsZVBlbkRvd24ge1xuICAgIGFjdGlvbk5hbWU6IFwicGVuRG93blwiO1xufVxuYDtcbmNvbnN0IG1hbmlmZXN0OiBBcHBBZ2VudE1hbmlmZXN0ID0ge1xuICAgIGVtb2ppQ2hhcjogXCLwn5CiXCIsXG4gICAgZGVzY3JpcHRpb246IFwiQSB0dXJ0bGUgdGhhdCBjYW4gZHJhdyBvbiBhIGNhbnZhc1wiLFxuICAgIHNjaGVtYToge1xuICAgICAgICBkZXNjcmlwdGlvbjogXCJBY3Rpb24gdG8gY29udHJvbCB0aGUgdHVydGxlIHRvIGRyYXcgb24gYSBjYW52YXNcIixcbiAgICAgICAgc2NoZW1hVHlwZTogXCJUdXJ0bGVBY3Rpb25cIixcbiAgICAgICAgc2NoZW1hRmlsZTogeyBjb250ZW50OiBzY2hlbWFUcywgdHlwZTogXCJ0c1wiIH0sXG4gICAgfSxcbn07XG5cbmxldCByZWdpc3RlcmVkID0gZmFsc2U7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgaWYgKCFyZWdpc3RlcmVkKSB7XG4gICAgICAgICh3aW5kb3cgYXMgYW55KVxuICAgICAgICAgICAgLnJlZ2lzdGVyVHlwZUFnZW50KFwidHVydGxlXCIsIG1hbmlmZXN0LCBhZ2VudClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlR1cnRsZSBhZ2VudCByZWdpc3RlcmVkXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byByZWdpc3RlciB0dXJ0bGUgYWdlbnRcIiwgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmVnaXN0ZXJlZCA9IHRydWU7XG4gICAgfVxufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=