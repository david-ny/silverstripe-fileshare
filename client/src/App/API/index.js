
// TODO: refactor with apicase
// https://github.com/apicase/core
// than redux + thunk or saga


import {
  PATH_API,
  PATH_API_FILELIST,
  PARAM_API_FILELIST_FOLDER,
  PATH_API_LINKSHARE,
  PATH_API_USER,
  PATH_API_SHARE,
  PATH_API_FILE,
  PATH_API_UPLOADED_FILE,
  PATH_API_UPLOADED_FILES,
  PATH_API_AUTH,
  PATH_LOGIN,
  PATH_LOGOUT,
} from '../Config/constants';


class FileShareAPI {
  static createRequest(
    url,
    method,
    token,
    actAsUserData = null,
    requestHeaders = null,
    body = null,
  ) {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.append(
      'X-Silverstripe-Apitoken',
      token,
    );
    if (actAsUserData) {
      headers.append(
        'X-FileShare-ActAsUser',
        actAsUserData.userId,
      );
    }
    // TODO append extra headers
    const request = new Request(url, {
      method,
      headers,
      body,
    });
    return request;
  }


  static login(email, password) {
    const url =
      `${PATH_API}${PATH_API_AUTH}${PATH_LOGIN}?email=${email}&pwd=${password}`;
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const request = new Request(url, {
      method: 'GET',
      headers,
    });
    return fetch(request);
  }

  static logout(token, email) {
    const url =
      `${PATH_API}${PATH_API_AUTH}${PATH_LOGOUT}?email=${email}`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.append(
      'X-Silverstripe-Apitoken',
      token,
    );
    const request = new Request(url, {
      method: 'GET',
      headers,
    });
    return fetch(request);
  }


  static fetchFileList(token, actAsUserData = null, folderID) {
    const url =
      `${PATH_API}${PATH_API_FILELIST}?${PARAM_API_FILELIST_FOLDER}=${folderID}`;

    const request = FileShareAPI.createRequest(
      url,
      'GET',
      token,
      actAsUserData,
    );
    return fetch(request);
    // .then(response => response.json())
    // .then(result => this.setFileList(result))
    // .catch(e => this.setState({ error: e }));
  }


  static createFolder(token, actAsUserData = null, name, parentfolderID) {
    const url = (parentfolderID)
      ? `${PATH_API}${PATH_API_FILELIST}`
        + `?name=${name}&parentFolderID=${parentfolderID}`
      : `${PATH_API}${PATH_API_FILELIST}`
        + `?name=${name}`;
    const request = FileShareAPI.createRequest(
      url,
      'POST',
      token,
      actAsUserData,
    );
    return fetch(request);
  }


  static createLinkShare(token, actAsUserData = null, fileID) {
    const url = `${PATH_API}${PATH_API_LINKSHARE}/${fileID}`;
    const request = FileShareAPI.createRequest(
      url,
      'POST',
      token,
      actAsUserData,
    );
    return fetch(request);
  }

  static enableLinkShare(token, actAsUserData = null, fileID, linkID) {
    const url = `${PATH_API}${PATH_API_LINKSHARE}/${fileID}`;
    const payload = {
      LinkID: linkID,
      FileID: fileID,
      Active: true,
    };
    const body = JSON.stringify(payload);
    const request = FileShareAPI.createRequest(
      url,
      'PATCH',
      token,
      actAsUserData,
      null,
      body,
    );
    return fetch(request);
  }

  static deleteLinkShare(token, actAsUserData = null, fileID, linkID) {
    const url = `${PATH_API}${PATH_API_LINKSHARE}/${fileID}/${linkID}`;
    const request = FileShareAPI.createRequest(
      url,
      'DELETE',
      token,
      actAsUserData,
    );
    return fetch(request);
  }


  static fetchUserList(token, actAsUserData = null) {
    const url = `${PATH_API}${PATH_API_USER}`;
    const request = FileShareAPI.createRequest(
      url,
      'GET',
      token,
      actAsUserData,
    );
    return fetch(request);
  }


  static fetchUsersOfSharedFile(token, actAsUserData = null, fileID) {
    const url = `${PATH_API}${PATH_API_SHARE}/${fileID}`;
    const request = FileShareAPI.createRequest(
      url,
      'GET',
      token,
      actAsUserData,
    );
    return fetch(request);
  }

  static shareFileWithUsers(token, actAsUserData = null, fileID, users) {
    const url = `${PATH_API}${PATH_API_SHARE}/${fileID}`;
    const payload = {
      userIDs: users,
    };
    const body = JSON.stringify(payload);
    const request = FileShareAPI.createRequest(
      url,
      'POST',
      token,
      actAsUserData,
      null,
      body,
    );
    return fetch(request);
  }

  static fetchKnownUsers(token) {
    // for testing purposes
    // TODO: use different API endpoint for live Version
    // allow only for admin, or use predefined user groups,
    // and/or by users relations
    const url = `${PATH_API}${PATH_API_USER}`;
    const request = FileShareAPI.createRequest(
      url,
      'GET',
      token,
      null,
    );
    return fetch(request);
  }


  static deleteFile(token, actAsUserData = null, fileID) {
    const url = `${PATH_API}${PATH_API_FILE}/${fileID}`;
    const request = FileShareAPI.createRequest(
      url,
      'DELETE',
      token,
      actAsUserData,
    );
    return fetch(request);
  }

  static deleteFiles(token, actAsUserData = null, fileIDs) {
    const url = `${PATH_API}${PATH_API_FILE}`;
    const payload = { fileIDs };
    const body = JSON.stringify(payload);
    const request = FileShareAPI.createRequest(
      url,
      'DELETE',
      token,
      actAsUserData,
      null,
      body,
    );
    return fetch(request);
  }

//rename
  static setUploadFinished(
    token,
    actAsUserData = null,
    parentFolderID,
    resumableIdentifier,
   ) {
    const url = `${PATH_API}${PATH_API_UPLOADED_FILE}`
      + `/${parentFolderID}/${resumableIdentifier}`;
    const request = FileShareAPI.createRequest(
      url,
      'DELETE',
      token,
      actAsUserData,
    );
    return fetch(request);
  }

  static getUnfinishedUploads(token, actAsUserData = null) {
    const url = `${PATH_API}${PATH_API_UPLOADED_FILES}`;
    const request = FileShareAPI.createRequest(
      url,
      'GET',
      token,
      actAsUserData,
    );
    return fetch(request);
  }
}


export default FileShareAPI;
