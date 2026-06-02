/* ------------------------------------------------------------------------------
 *
 *  # Summernote editor
 *
 *  Demo JS code for editor_summernote.html page
 *
 * ---------------------------------------------------------------------------- */

// Setup module
var Summernote = function() {

    // Summernote
    var _componentSummernote = function() {
        if (!$().summernote) {
            console.warn('Warning - summernote.min.js is not loaded.');
            return;
        }
        // Default initialization
        $('.summernote').summernote({
			lang : 'ko-KR',
            height: 400,
        });

        // Click to edit

        // Edit
        $('#edit').on('click', function() {
            $('.click2edit').summernote({focus: true});
        })

        // Save
        $('#save').on('click', function() {
            var aHTML = $('.click2edit').summernote('code');
            $('.click2edit').summernote('destroy');
        });
    };

    // Return objects assigned to module
    return {
        init: function() {
            _componentSummernote();
        }
    }
}();

// Initialize module

document.addEventListener('DOMContentLoaded', function() {
    Summernote.init();
});