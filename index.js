module.exports = plaintemplate

var parse = require('plaintemplate-parse')
var merge = require('merge')

function plaintemplate(input, context, tagHandler, parserOptions) {
  if (context === undefined) {
    context = { } }
  if (tagHandler === undefined) {
    tagHandler = defaultTagHandler }
  return stringify(parse(input, parserOptions), context, tagHandler) }

function stringify(tokens, context, tagHandler) {
  return tokens.reduce(
    function(output, token) {
      return (
        output +
        ( ( 'text' in token ) ?
          token.text :
          tagHandler(token, context, stringify) ) ) },
    '') }

function defaultTagHandler(token, context, stringify) {
  var key, elements, length
  var tag = token.tag

  function addPosition(error, message) {
    error.message = (
      message + ' at ' +
      'line ' + token.position.line + ', ' +
      'column ' + token.position.column)
    error.position = token.position
    return error }

  if (startsWith('insert ', tag)) {
    key = tag.substring(7)
    if (context.hasOwnProperty(key)) {
      return context[key] }
    else {
      throw addPosition(new Error(), ( 'No variable "' + key + '"' )) }
    return ( context.hasOwnProperty(key) ? context[key] : '' ) }
  else if (startsWith('if ', tag)) {
    key = tag.substring(3)
    if (context.hasOwnProperty(key)) {
      return (
        !context[key] ?
          '' : stringify(token.content, context, defaultTagHandler) ) }
    else {
      throw addPosition(new Error(), ( 'No variable "' + key + '"' )) } }
  else if (startsWith('unless ', tag)) {
    key = tag.substring(7)
    if (context.hasOwnProperty(key)) {
      return (
        !context[key] ?
          stringify(token.content, context, defaultTagHandler) : '' ) }
    else {
      throw addPosition(new Error(), ( 'No variable "' + key + '"' )) } }
  else if (startsWith('each ', tag)) {
    key = tag.substring(5)
    if (context.hasOwnProperty(key)) {
      elements = context[key]
      if (Array.isArray(elements)) {
        length = elements.length
        return elements.reduce(
          function(output, element, index) {
            var odd = isOdd(index + 1)
            var inSubcontext = {
              element: element,
              odd: odd,
              even: !odd,
              first: ( index === 0 ),
              last: ( index === ( length - 1 ) ) }
            var subcontext = merge(true, context, inSubcontext)
            return (
              output +
              stringify(token.content, subcontext, defaultTagHandler) ) },
          '') }
      else {
        throw addPosition(
          new Error(),
          ( 'Variable "' + key + '" is not an Array')) } }
    else {
      throw addPosition(new Error(), ( 'No variable "' + key + '"' )) } }
  else {
    throw addPosition(new Error(), ( 'Unknown directive "' + tag + '"')) } }

function isOdd(number) {
  return ( ( number % 2) === 1 ) }

function startsWith(prefix, string) {
  return ( string.indexOf(prefix) === 0 ) }
