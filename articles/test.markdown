One of the secrets to being a super effective JavaScript developer is to truly understand the semantics of the language. This article will explain the basic elemental parts of JavaScript using easy to follow diagrams.

## References Everywhere

A variable in JavaScript is simply a label that references a value in memory somewhere. These values can be primitives like strings, numbers, and booleans. They can also be objects or functions.

### Local Variables

In the following example, we will create four local variables in the top-level scope and point them to some primitive values:

CODE SNIPPET HERE

![variables](http://howtonode.org/object-graphs/variables.dot)

Notice that the two boolean variables point to the same value in memory. This is because primitives are immutable and so the VM can optimize and share a single instance for all references to that particular value.

In the code snippet we checked to see if the two references pointed to the same value using === and the result was true.

The outer box represents the outermost closure scope. These variables are top-level local variables, not to be confused with properties of the global/window object.

