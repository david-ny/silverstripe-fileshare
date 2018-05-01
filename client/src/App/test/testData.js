export const configTestData = {
  config: {
    app: {
      appPath: 'fileshare',
      domain: 'http://localhost:8081/',
      imagePath: 'fileshare/client/dist/images',
      resourcePath: '/client/dist',
    },
    files: {
      fileUploadMaxSize: 209715200,
      rootFolderID: 24,
    },
  },
  email: 'john@test.com',
  firstName: 'John',
  lastName: 'Doe',
  setActAsUser() {},
  userID: 3,
};

export const dummy = {
  email: 'john@test.com',
  firstName: 'John',
  lastName: 'Doe',
};
