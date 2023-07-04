$(document).ready(function() {
    // Attach click event listener to the "Verify" button
    $('.verify-button').on('click', function() {
      var postId = $(this).data('post-id');
  
      // Send AJAX request to the server for verification
      $.ajax({
        method: 'POST',
        url: '/verify',
        data: { postId: postId },
        success: function(response) {
          if (response.success) {
            // Remove the post element from the page
            $('#post-' + response.postId).remove();
          } else {
            // Handle error response from the server
            console.error('Verification failed');
          }
        },
        error: function(xhr, status, error) {
          // Handle AJAX error
          console.error('AJAX request error:', error);
        }
      });
    });
  });
  