/**
 * Particleground demo
 * @author Jonathan Nicol - @mrjnicol
 */

$(document).ready(function() {
  $('#particles').particleground({
    dotColor: '#67B6E4',
    lineColor: '#67B6E4'
  });
  $('.intro').css({
    'margin-top': -($('.intro').height() / 2)
  });
});