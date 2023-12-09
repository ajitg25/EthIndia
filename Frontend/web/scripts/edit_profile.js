$('#change_btn').click(async () => {
  $('#change_btn').prop('disabled', true);

  const user_details = {  };

  for (const match of $('.user_data:visible')) {
    const ele = $(match);
    if (!ele.val()) {
      alert(`${ele.attr('id')} cannot be empty`);
      return;
    }
    user_details[ele.attr('id')] = ele.val();
  }
  
  const response = await fetch('/edit_profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user_details),
  })

  if (response.ok) {
    alert('details modified');
    $(location).prop('href', '/');
  }
  else {
    const { failure_reason } = await response.json();
    alert(`error: ${ failure_reason }`);
    $('#change_btn').prop('disabled', false);
  }
});