import Config from './Config';

const config = Config.getConfig();

const BASE_URL = config.app.domain;
const FILESHARE_PAGE_PATH = config.app.appPath;
const VERSION = 'v1';
const API = 'api';
const PATH_APP_BASE = `${BASE_URL}${FILESHARE_PAGE_PATH}`;
const PATH_APP = `${PATH_APP_BASE}/${VERSION}`;
const PATH_API = `${PATH_APP}/${API}`;
const PATH_CONFIG = '/config';
const PATH_API_UPLOAD = '/upload';
const PATH_API_UPLOADED_FILES = '/uploadedfiles';
const PATH_API_UPLOADED_FILE = '/uploadedfiles';
const PATH_API_FILE = '/files';
const PATH_API_FILELIST = '/files';
const PATH_API_USER = '/users';
const PATH_API_LINKSHARE = '/linkshare';
const PATH_API_SHARE = '/share';
const PARAM_API_FILELIST_FOLDER = 'folder';
const PATH_API_AUTH = '/auth';
const PATH_LOGIN = '/login';
const PATH_LOGOUT = '/logout';
const PATH_LINKSHARE = '/s';
const PATH_DOWNLOAD = '/download';


export {
  PATH_APP_BASE,
  PATH_APP,
  PATH_API,
  PATH_CONFIG,
  PATH_API_UPLOAD,
  PATH_API_UPLOADED_FILES,
  PATH_API_UPLOADED_FILE,
  PATH_API_FILE,
  PATH_API_FILELIST,
  PATH_API_USER,
  PATH_API_LINKSHARE,
  PATH_API_SHARE,
  PARAM_API_FILELIST_FOLDER,
  PATH_API_AUTH,
  PATH_LOGIN,
  PATH_LOGOUT,
  PATH_LINKSHARE,
  PATH_DOWNLOAD,
};
