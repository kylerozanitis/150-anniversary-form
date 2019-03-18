const Dropbox = require('dropbox');

const uploadFile = () => {
  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  const dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
  const fileInput = document.getElementById('file-upload');
  const file = fileInput.files[0];

  if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
    // File is smaller than 150 Mb - use filesUpload API
    dbx
      .filesUpload({ path: '/' + file.name, contents: file })
      .then(function(response) {
        let results = document.getElementById('results');
        results.appendChild(document.createTextNode('File uploaded!'));
        console.log(response);
      })
      .catch(function(error) {
        console.error(error);
      });
  } else {
    // File is bigger than 150 Mb - use filesUploadSession * API
    const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size

    let workItems = [];

    let offset = 0;

    while (offset < file.size) {
      let chunkSize = Math.min(maxBlob, file.size - offset);
      workItems.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }

    const task = workItems.reduce((acc, blob, idx, items) => {
      if (idx == 0) {
        // Starting multipart upload of file
        return acc.then(function() {
          return dbx
            .filesUploadSessionStart({ close: false, contents: blob })
            .then(response => response.session_id);
        });
      } else if (idx < items.length - 1) {
        // Append part to the upload session
        return acc.then(function(sessionId) {
          let cursor = { session_id: sessionId, offset: idx * maxBlob };
          return dbx
            .filesUploadSessionAppendV2({
              cursor: cursor,
              close: false,
              contents: blob
            })
            .then(() => sessionId);
        });
      } else {
        // Last chunk of data, close session
        return acc.then(function(sessionId) {
          let cursor = { session_id: sessionId, offset: file.size - blob.size };
          let commit = {
            path: '/' + file.name,
            mode: 'add',
            autorename: true,
            mute: false
          };
          return dbx.filesUploadSessionFinish({
            cursor: cursor,
            commit: commit,
            contents: blob
          });
        });
      }
    }, Promise.resolve());

    task
      .then(function(result) {
        let results = document.getElementById('results');
        results.appendChild(document.createTextNode('File uploaded!'));
      })
      .catch(function(error) {
        console.error(error);
      });
  }
};
