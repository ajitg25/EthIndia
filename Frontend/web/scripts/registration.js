$('#register_btn').click(async () => {
  $('#register_btn').prop('disabled', true);

  const user_type = $('.active').attr('id');
  const user_details = { user_type };

  $('.user_data:visible').each(function() {
    const ele = $(this);
    user_details[ele.attr('id')] = ele.val();
  })
  
  const response = await fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user_details),
  });

  if (response.ok) {
    $(location).prop('href', '/');
  }
  else {
    $('#register_btn').prop('disabled', false);
    alert('Could Not Connect');
  }
});