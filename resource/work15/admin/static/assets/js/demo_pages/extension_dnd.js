/* ------------------------------------------------------------------------------
 *
 *  # Dragula - drag and drop library
 *
 *  Demo JS code for extension_dnd.html page
 *
 * ---------------------------------------------------------------------------- */


// Setup module
// ------------------------------

var DragAndDrop = function() {


    //
    // Setup module components
    //

    // Dragula examples
    var _componentDragula = function() {
        if (typeof dragula == 'undefined') {
            console.warn('Warning - dragula.min.js is not loaded.');
            return;
        }

        // Draggable element
        dragula([document.getElementById('drag-element-1'), document.getElementById('drag-element-2'), document.getElementById('drag-element-3'), document.getElementById('drag-element-4')], {
            mirrorContainer: document.querySelector('.drag-container'),
            moves: function (el, container, handle) {
                return handle.classList.contains('dragula-handle');
            }
        });

    };


    //
    // Return objects assigned to module
    //

    return {
        init: function() {
            _componentDragula();
        }
    }
}();


// Initialize module
// ------------------------------

document.addEventListener('DOMContentLoaded', function() {
    DragAndDrop.init();
});
