import PropTypes from 'prop-types';

export const configPropType = PropTypes.shape({
  app: PropTypes.shape({
    appPath: PropTypes.string.isRequired,
    imagePath: PropTypes.string.isRequired,
    resourcePath: PropTypes.string.isRequired,
  }).isRequired,
  files: PropTypes.shape({
    fileUploadMaxSize: PropTypes.number.isRequired,
    rootFolderID: PropTypes.number.isRequired,
  }).isRequired,
});

export const configDefaultPropType = {
  app: {
    resourcePath: '/client/dist',
  },
  files: {
    fileUploadMaxSize: 209715200,
  },
};

export const viewPortType = PropTypes.shape({
  class: PropTypes.string.isRequired,
  isSmall: PropTypes.bool.isRequired,
});

export const userType = PropTypes.shape({
  email: PropTypes.string.isRequired,
  group: PropTypes.string.isRequired,
});

export const userVerboseType = PropTypes.shape({
  email: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  userID: PropTypes.number,
});

export const modifiedType = PropTypes.shape({
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
});

export const fileListType = PropTypes.arrayOf(PropTypes.shape({
  key: PropTypes.number.isRequired,
  modified: modifiedType.isRequired,
  fileName: PropTypes.string.isRequired,
  ownerID: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  sharedByMe: PropTypes.bool.isRequired,
  sharedWithMe: PropTypes.bool.isRequired,
  systemName: PropTypes.string.isRequired,
}).isRequired);

export const currentPathType = PropTypes.arrayOf(PropTypes.shape({
  ID: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
}));

export const actAsUserType = PropTypes.shape({
  displayName: PropTypes.string.isRequired,
  email: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  userId: PropTypes.number.isRequired,
});

export const userListType = PropTypes.arrayOf(userVerboseType);


export const actAsUserDefault = null;
