'use strict';

var _ = require('lodash');
var vowels = ['a', 'e', 'i', 'o', 'u'];

exports.an = function (word) {
  if (vowels.indexOf(word[0].toLowerCase()) >= 0) return 'an';
  return 'a';
};

exports.quantify = function (quantity, word, options) {
  var articles = !options || options.articles;
  if (quantity > 1) return '' + quantity + ' ' + exports.pluralize(word);
  if (articles) return exports.an(word) + ' ' + word;
  return word;
};

exports.enumerate = function (words) {
  if (words.length == 0) return '';
  if (words.length == 1) return words[0];
  if (words.length == 2) return words[0] + ' and ' + words[1];
  return _.take(words, words.length - 1).join(', ') + ', and ' + words[words.length - 1];
};

exports.enumerateOr = function (words) {
  if (words.length == 0) return '';
  if (words.length == 1) return words[0];
  if (words.length == 2) return words[0] + ' or ' + words[1];
  return _.take(words, words.length - 1).join(', ') + ', or ' + words[words.length - 1];
};

exports.pluralize = function (word) {
  return word + 's';
};
