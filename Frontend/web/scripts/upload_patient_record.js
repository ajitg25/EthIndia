$('#whole_file_upload_btn').click(async () => {

  $('#whole_file_upload_btn').prop('disabled', true);

  const form_data = new FormData();
  if ($('#file_input')[0].files.length == 0) {
    alert('no file selected');
    $('#whole_file_upload_btn').prop('disabled', false);
    return;
  }
  const file = $('#file_input')[0].files[0]
  form_data.append('file', file);
  form_data.append('file_name', file.name);

  const response = await fetch('/upload_patient_record', {
    method: 'POST',
    body: form_data,
  });

  if (!response.ok) {
    alert('error uploading file');
    $('#whole_file_upload_btn').prop('disabled', false);
    return;
  }

  const { blob_uuid } = await response.json();
  $(location).prop('href', '/new_patient_record_details?' + new URLSearchParams({ blob_uuid }));
});

$('#extract_file_btn').click(async () => {

  const form_data = new FormData();
  if ($('#file_input')[0].files.length == 0) {
    alert('no file selected');
    $('#whole_file_upload_btn').prop('disabled', false);
    return;
  }
  const file = $('#file_input')[0].files[0]
  form_data.append('file', file);

  $('#container').html('<h2> Uploading... </h2>');

  const response = await fetch('http://3.134.185.156:8889/upload', {
    method: 'POST',
    body: form_data
  });

  if (!response.ok) {
    alert('error uploading file');
    // $(location).prop('href', '/upload_patient_record');
    return;
  }

  const json_data = await response.text();

  $('#container').html(
    `
    <div class="d-flex flex-column text-center">
      <h2 class="m-2">Edit Json Data</h2>
      <textarea style="min-width:400px; min-height:400px; class="form-control" id="json_data"></textarea>
      <div class="form-group row">
        <label class="m-2 col col-form-label" for="file_name">File Name</label>
        <div class="col m-2 align-items-center">
        <input id="file_name" class="form-control" col" type="text" placeholder="extracted_data.json">
        </div>
      </div>
      <button id="confirm_btn" type"button" class="btn btn-success m-2" =>Confirm</button>
    </div>
    `
  );
  $('#json_data').text(json_data);
  $('#confirm_btn').click(async () => {

    const file_name = $('#file_name').val() || 'extracted_data.json';
    const file = new File([json_data], file_name);

    const form_data = new FormData();
    form_data.append('file', file);
    form_data.append('file_name', file.name);

    const response = await fetch('/upload_patient_record', {
      method: 'POST',
      body: form_data,
    });

    if (!response.ok) {
      alert('error uploading file');
      $('#whole_file_upload_btn').prop('disabled', false);
      return;
    }

    const { blob_uuid } = await response.json();
    $(location).prop('href', '/new_patient_record_details?' + new URLSearchParams({ blob_uuid }));
  });
});