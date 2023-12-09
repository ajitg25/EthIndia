$('#authorize_hospital_btn').click(() => {
  $(location).prop('href', '/authorize_hospital_requests');
});

$('#view_data_btn').click(() => {
  $(location).prop('href', '/past_data');
});

$('#view_activity_btn').click(() => {
  $(location).prop('href', '/activity');
});

$('#edit_profile_btn').click(() => {
  $(location).prop('href', '/edit_profile');
});