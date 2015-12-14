```javascript
var plaintemplate = require('plaintemplate')
var assert = require('assert')

assert.deepEqual(
  plaintemplate(
    // Template input
    '(( five { ))Howdy, (( = name ))! (( } ))',
    // Context
    { name: 'John' },
    // Template directive handler
    function handler(token, context, stringify) {
      var directive = token.tag.trim()
      // Repeate a tag's contents five times.
      if (directive.startsWith('five')) {
        var output = ''
        for (var counter = 0; counter < 5; counter++) {
          output += stringify(token.content, context, handler) }
        return output }
      // Insert a string from context.
      else if (directive.startsWith('=')) {
        var key = directive.split(' ')[1]
        return context[key] }
      else {
        throw new Error('Invalid directive') } },
    // Use custom double-parentheses template tags.
    { open: '((', close: '))', start: '{', end: '}' }),
  'Howdy, John! Howdy, John! Howdy, John! Howdy, John! Howdy, John! ')
```

The package exports a single function returning strings, of four arguments:

1. _Input_, a string, containing template text and tags
2. _Context_, optional, an object, containing values that affect the template
3. _Tag Hangler_, optional, a function returning strings, of three arguments:
    1. _Token_, the [plaintemplate-parse][parse] tag token object to stringify
    2. _Context_, the context in which the token is to be stringified
    3. _Stringify_ a function used to recursively stringify other [plaintemplate-parse][parse] tokens, of three arguments:
        1. _Content_, an array of [plaintemplate-parse][parse] text and tag token objects, probably a tag token's content property
        2. _Context_
        3. _Tag Handler_
4. _Parser Options_, optional, an object, passed directly to [plaintemplate-parse][parse]

The default tag handler defines a number of template tag directives:

1. `insert X`. Replaces a tag with the value of `X` in context. Throws an error if `X` does not exist in context.
2. `if X`. Renders the tag's contents only if `X` exists in context and has a "truthy" value. Throws an error if `X` does not exist in context.
3. `unless X`. Renders the tag's contents only if `X` exists in context and has a "falsey" value. Throws an error if `X` does not exist in context.
4. `each X`. Renders the tag's contents once for every array element of `X` in context. Throws an error if `X` does not exist in context, or if `X` exists in context, but is not an array. Sets a number of additional variables in context when rendering the tag's contents:
    1. `element`, the array element being rendered
    2. `odd`, if the index of the element in the array (counting from 1) is odd
    3. `even`, if the index of the element in the array (counting from 1) is even
    4. `first`, true if the element is the first element of the array
    4. `last`, true if the element is the last element of the array

[parse]: https://www.npmjs.com/packages/plaintemplate-parse
