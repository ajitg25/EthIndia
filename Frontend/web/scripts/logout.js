fetch('/logout', { method: 'POST' })
  .then(() => {
    $(location).prop('href', '/');  
  });