contract AdditionContract {

  event RequestAddition(
    address indexed patient,
    address indexed hospital,
    bytes16 blob_id,
    bytes16 blob_checksum,
    uint req_id
  );
  event RequestGranted(
    bytes16 indexed blob_id
  );

  struct RequestData {
    address patient;
    bytes16 blob_id;
    uint req_id;
  }

  RequestData[] private pending_requests;

  function Request(address _patient, bytes16 _blob_id, bytes16 _blob_checksum) public {

    address hospital = msg.sender;
    address patient = _patient;
    uint req_id = pending_requests.length;
    bytes16 blob_id = _blob_id;
    bytes16 blob_checksum = _blob_checksum;

    pending_requests.push(
      RequestData({
        patient: patient,
        blob_id: _blob_id,
        req_id: req_id
      })
    );

    emit RequestAddition(patient, hospital, blob_id, blob_checksum, req_id);
  }

  function grantRequest(uint req_id) public {
    RequestData memory request = pending_requests[req_id];

    address patient = request.patient;
    bytes16 blob_id = request.blob_id;

    require(msg.sender == patient);

    // TODO: invalidate pending_requests[req_id]

    emit RequestGranted(blob_id);
  }
}

// TODO: decline request