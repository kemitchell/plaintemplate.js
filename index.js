module.exports = plaintemplate

var parse = require('plaintemplate-parse')
var merge = require('merge')

function plaintemplate(input, values, tagHandler, parserOptions) {
  if (values === undefined) {
    values = { } }
  if (tagHandler === undefined) {
    tagHandler = defaultTagHandler }
  return stringify(parse(input, parserOptions), values, tagHandler) }

function stringify(tokens, values, tagHandler) {
  return tokens.reduce(
    function(output, token) {
      if ('text' in token) {
        return output + token.text }
      else /* tag */ {
        return output + tagHandler(token, values, stringify) } },
    '') }

function defaultTagHandler(token, values, stringify) {
  var tag, key
  tag = token.tag
  if (startsWith('insert ', tag)) {
    key = tag.substring(7)
    return ( values.hasOwnProperty(key) ? values[key] : '' ) }
  else if (startsWith('if ', tag)) {
    key = tag.substring(3)
    if (values.hasOwnProperty(key) && !!values[key]) {
      return stringify(token.content, values, defaultTagHandler) }
    else {
      return '' } }
  else if (startsWith('unless ', tag)) {
    key = tag.substring(7)
    if (!values.hasOwnProperty(key) || !values[key]) {
      return stringify(token.content, values, defaultTagHandler) }
    else {
      return '' } }
  else if (startsWith('each ', tag)) {
    key = tag.substring(5)
    if (values.hasOwnProperty(key) && Array.isArray(values[key])) {
      var elements = values[key]
      var length = elements.length
      return elements.reduce(
        function(output, element, index) {
          var inContext = {
            element: element,
            last: ( index === ( length - 1 ) ) }
          var context = merge(true, values, inContext)
          return output + stringify(token.content, context, defaultTagHandler) },
        '') }
    else {
      return '' } } }

function startsWith(prefix, string) {
  return ( string.indexOf(prefix) === 0 ) }
