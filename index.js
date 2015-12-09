module.exports = plaintemplate

var parse = require('plaintemplate-parse')

function plaintemplate(input, values, tagHandler, parserOptions) {
  if (values === undefined) {
    values = { } }
  if (tagHandler === undefined) {
    tagHandler = defaultTagHandler }
  return stringify(parse(input, parserOptions), values, tagHandler) }

function stringify(tokens, values, stringForTag) {
  return tokens.reduce(
    function(output, token) {
      if ('text' in token) {
        return output + token.text }
      else /* tag */ {
        return output + stringForTag(token, values) } },
    '') }

function defaultTagHandler(token, values) {
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
      return '' } } }

function startsWith(prefix, string) {
  return ( string.indexOf(prefix) === 0 ) }
