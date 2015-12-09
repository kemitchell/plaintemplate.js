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
      if ('text' in token) {
        return output + token.text }
      else /* tag */ {
        return output + tagHandler(token, context, stringify) } },
    '') }

function defaultTagHandler(token, context, stringify) {
  var tag, key
  tag = token.tag
  if (startsWith('insert ', tag)) {
    key = tag.substring(7)
    return ( context.hasOwnProperty(key) ? context[key] : '' ) }
  else if (startsWith('if ', tag)) {
    key = tag.substring(3)
    if (context.hasOwnProperty(key) && !!context[key]) {
      return stringify(token.content, context, defaultTagHandler) }
    else {
      return '' } }
  else if (startsWith('unless ', tag)) {
    key = tag.substring(7)
    if (!context.hasOwnProperty(key) || !context[key]) {
      return stringify(token.content, context, defaultTagHandler) }
    else {
      return '' } }
  else if (startsWith('each ', tag)) {
    key = tag.substring(5)
    if (context.hasOwnProperty(key) && Array.isArray(context[key])) {
      var elements = context[key]
      var length = elements.length
      return elements.reduce(
        function(output, element, index) {
          var odd = isOdd(index + 1)
          var inSubcontext = {
            element: element,
            odd: odd,
            event: !odd,
            first: ( index === 0 ),
            last: ( index === ( length - 1 ) ) }
          var subContext = merge(true, context, inSubcontext)
          return output + stringify(token.content, subContext, defaultTagHandler) },
        '') }
    else {
      return '' } } }

function isOdd(number) {
  return ( ( number % 2) === 1 ) }

function startsWith(prefix, string) {
  return ( string.indexOf(prefix) === 0 ) }
