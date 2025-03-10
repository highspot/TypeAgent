// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export function createTurtleAgent(turtle) {
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
//# sourceMappingURL=turtleAgent.js.map