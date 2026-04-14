(function () {

'use strict';

console.log('reading js');


fs. addEventListener (' click', function() {
    if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen ();
    } else {
    document. exitFullscreen();
    }
})


})();