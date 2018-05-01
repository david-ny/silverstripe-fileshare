import Config from '../Config/Config';

const config = Config.getConfig();

const routeInfo = {
  login: {
    id: 1,
    path: `/${config.app.appPath}/login`,
    segment: 'login',
    mainTitle: 'Login',
    mainMenuItem: false,
    adminMenuItem: false,
  },
  files: {
    id: 2,
    path: `/${config.app.appPath}/files`,
    segment: 'files',
    mainTitle: 'My Files',
    mainMenuItem: true,
    adminMenuItem: false,
  },
  allfiles: {
    id: 3,
    path: `/${config.app.appPath}/allfiles`,
    segment: 'allfiles',
    mainTitle: 'All Files',
    mainMenuItem: true,
    adminMenuItem: true,
  },
  // sharing: {
  //   id: 4,
  //   path: `/${config.app.appPath}/sharing`,
  //   segment: 'sharing',
  //   mainTitle: 'Sharing',
  //   mainMenuItem: true,
  //   adminMenuItem: true,
  // },
};

export default routeInfo;

// const configFromFetch = () => {
//   const url = `${PATH_API}${PATH_CONFIG}`;
//   const headers = new Headers();
//   headers.set('Content-Type', 'application/json');
//   const request = new Request(url, {
//     method: 'GET',
//     headers,
//   });
//   fetch(request)
//     .then(response => response.json())
//     .then((result) => {
//       console.log('config');
//       console.log(result);
//       return result;
//     })
//     .catch(e => console.log({ error: e }));
// }
// const config = configFromAttr || configFromFetch();
// console.log('config');
// console.log(config);
