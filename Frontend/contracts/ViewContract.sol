contract ViewContract {

  event RequestView(
    address indexed patient,
    address indexed hospital,
    uint req_id
  );
  event RequestGranted(
    address indexed patient,
    address indexed hospital
  );

  struct RequestData {
    address hospital;
    address patient;
    uint req_id;
  }

  RequestData[] private pending_requests;

  function Request(address _patient) public {

    address hospital = msg.sender;
    address patient = _patient;
    uint req_id = pending_requests.length;

    pending_requests.push(
      RequestData({
        hospital: hospital,
        patient: patient,
        req_id: req_id
      })
    );

    emit RequestView(patient, hospital, req_id);
  }

  function grantRequest(uint req_id) public {
    RequestData memory request = pending_requests[req_id];

    address patient = request.patient;
    address hospital = request.hospital;

    require(msg.sender == patient);

    // TODO: invalidate pending_requests[req_id]

    emit RequestGranted(patient, hospital);
  }
}

// TODO: decline request