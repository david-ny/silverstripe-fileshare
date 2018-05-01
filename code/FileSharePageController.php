<?php
use SilverStripe\Core\Config\Config;
use SilverStripe\CMS\Controllers\ContentController;
use SilverStripe\Control\HTTPRequest;
use ResumableUpload\ResumableUpload;
use SilverStripe\Assets\Storage\AssetStore;
use SilverStripe\Assets\Folder;
use SilverStripe\Assets\File;
use SilverStripe\Security\Security;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Member;
use SilverStripe\Security\Group;
use SilverStripe\Security\Permission;
use SilverStripe\Control\HTTP;
use SilverStripe\Core\Environment;
use SilverStripe\Control\Director;
use FileShare\FileShareUploaded;
use FileShare\FileShareLinkShare;
use FileShare\FileMember;
use SilverStripe\Versioned\Versioned;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\Exception\UnsatisfiedDependencyException;
use SilverStripe\View\Requirements;
// use SilverStripe\Assets\Storage\DBFile;

class FileSharePageController extends ContentController
{

  /**
   * Name of the root folder to store files (whthin Assets)
   *
   * @var string
   * @config
   */
  private static $fileshare_folder_name = 'fileshare';

  public $RESTfulAPI;
  public $logger;

  private static $dependencies = array(
    'RESTfulAPI' => '%$RESTfulAPI',
    'logger' => '%$Psr\Log\LoggerInterface',
  );


    private static $allowed_actions = [
      'index',
      // 'clientConfig',
      'auth',
      'upload' => '->authenticatedByToken()',
      'uploadedfiles' => '->authenticatedByToken()',
      'files' => '->authenticatedByToken()',
      'download' => '->authenticatedByToken()',
      'linkshare' => '->authenticatedByToken()',
      'share' => '->authenticatedByToken()',
      'users' => '->authenticatedByToken()',
      'downloadLinkSharedFile',
      'redirectBackToApp'
    ];

    // TODO: https://github.com/colymba/silverstripe-restfulapi
    private static $url_handlers = [
      '' => 'index',
      'login' => 'redirectBackToApp',
      'logout' => 'redirectBackToApp',
      'lostPassword' => 'redirectBackToApp',
      'files' => 'redirectBackToApp',
      'allfiles' => 'redirectBackToApp',
      // 'v1/api/config' => 'clientConfig',
      'v1/api/auth/$Action' => 'auth',
      'v1/api/files/$FileID' => 'files',
      'v1/api/files' => 'files',
      'v1/api/upload' => 'upload',
      'v1/api/uploadedfiles/$FolderID/$ResumableIdentifier' => 'uploadedfiles',
      'v1/api/uploadedfiles' => 'uploadedfiles',
      'v1/api/linkshare/$FileID/$LinkID' => 'linkshare',
      'v1/api/linkshare/$FileID' => 'linkshare',
      'v1/api/share/$FileID' => 'share',
      'v1/api/users' => 'users',
      'v1/download/$Filename/$FileID' => 'download',
      'v1/s/$LinkID/$Filename' => 'downloadLinkSharedFile',
    ];

    protected function init() {
        parent::init();
        Requirements::css("devcreative/fileshare:client/dist/styles/style.css");
        Requirements::javascript('devcreative/fileshare:client/dist/bundle.js');
    }

    protected function badRequest() {
      return $response = $this->RESTfulAPI->error(
        new RESTfulAPI_Error(400, 'Bad request.')
      );
    }

    protected function getRealMember() {
      $request = $this->getRequest();
      return $this->RESTfulAPI->authenticator->getOwner($request);
    }

    protected function getMember() {
      $request = $this->getRequest();;
      $realMember = $this->RESTfulAPI->authenticator->getOwner($request);
      $isAdmin = $realMember->inGroup('fileshare-admins');
      $shouldActAsUser = false;
      if ($isAdmin) {
        $headers = $request->getHeaders();
        $shouldActAsUser = !empty($headers['x-fileshare-actasuser']);
        $impersonatedMemberID = $shouldActAsUser
          ? intval($headers['x-fileshare-actasuser'])
          : -1;
      }
      return $shouldActAsUser
        ?  Member::get_by_id(Member::class, $impersonatedMemberID)
        : $realMember;
    }

    public function authenticatedByToken() {
      $request = $this->getRequest();
      $member = false;
      $member = $this->RESTfulAPI->authenticator->getOwner($request);
      return ($member && $member->inGroup('fileshare-users')) ? true : false;
    }

    protected function memberIsOwner($nodeID, $member) {
      $file = File::get()->byId($nodeID);
      // var_dump($file->OwnerID, $member->ID);
      return (
        $file !== null
        && (string) $file->OwnerID === (string) $member->ID)
        ? true : false;
    }

    protected function nodeExists($nodeID){
      // check if nodeID can be parsed as int
      if (!ctype_digit($nodeID)) {
        return false;
      }
      $file = File::get()->byId($nodeID);
      // var_dump($file);
      return $file !== null ? true : false;
    }

    protected function nodeIsFileShareRoot($nodeID){
      $rootID = (string) $this->getBaseDir()->ID;
      // var_dump($file);
      return $rootID === $nodeID  ? true : false;
    }

    protected function nodeIsOutsideFileShareRoot($nodeID){
      $rootID = (string) $this->getBaseDir()->ID;
      // $file = File::get()->byId($nodeID);
      if ($nodeID === '0') {
        return true;
      }
      $testFile = File::get()->byId($nodeID);
      if (!$testFile) {
        return true;
      }
      $parentIDs = [];
      $parentIDs[] = $testFile->ID;
      $parentIDs[] = $testFile->ParentID;
      $depthLimit = 2000;
      $counter = 1;
      do {
        $parentID = $testFile->ParentID;
        $testFile = File::get()->byId($parentID);
        if ($testFile) {
          $parentIDs[] = $testFile->ParentID;
        }
        $lastElement = array_values(array_slice($parentIDs, -1))[0];
        $counter++;
        // var_dump($parentIDs);
      } while (($lastElement !== '0') && ($counter < $depthLimit));
      // var_dump($parentIDs);
      return !in_array($rootID, $parentIDs) ? true : false;
    }

    /*
    * redirects back to the app on a reload,
    * or direct navigation to a link what
    * the clients router should handle
    */
    public function redirectBackToApp(HTTPRequest $request) {
      return $this->redirect($this->URLSegment);
    }

    // public function clientConfig(HTTPRequest $request) {
    //   if ($request->isGET()) {
    //     return $this->handleClientConfigGET();
    //   }
    // }

    public function auth(HTTPRequest $request) {
      return $this->RESTfulAPI->auth($request);
    }

    public function upload(HTTPRequest $request) {
      $this->handleupload();
    }

    public function uploadedfiles(HTTPRequest $request) {
      switch ($request->httpMethod()) {
        case 'GET': return $this->handleUploadedfilesGET(); break;
        case 'DELETE':return $this->handleUploadedfilesDELETE(); break;
        default: return $this->badRequest(); break;
      }
    }

    public function files(HTTPRequest $request) {
      switch ($request->httpMethod()) {
        case 'GET': return $this->handleFilesGET(); break;
        case 'POST': return $this->handleFilesPOST(); break;
        case 'DELETE':return $this->handleFilesDELETE(); break;
        default: return $this->badRequest(); break;
      }
    }

    public function linkshare(HTTPRequest $request) {
      switch ($request->httpMethod()) {
        case 'POST': return $this->handleLinkSharePOST(); break;
        case 'PATCH':return $this->handleLinkSharePATCH(); break;
        case 'DELETE':return $this->handleLinkShareDELETE(); break;
        default: return $this->badRequest(); break;
      }
    }

    public function share(HTTPRequest $request) {
      switch ($request->httpMethod()) {
        case 'GET': return $this->handleShareGET(); break;
        // TODO: currently PUT suits better
        case 'POST': return $this->handleSharePOST(); break;
        default: return $this->badRequest(); break;
      }
    }

    public function users(HTTPRequest $request) {
      switch ($request->httpMethod()) {
        case 'GET': return $this->handleUsersGET(); break;
        default: return $this->badRequest(); break;
      }
    }

    protected function handleUsersGET() {
      $request = $this->getRequest();
      $member = $this->RESTfulAPI->authenticator->getOwner($request);

      if (!$member->inGroup('fileshare-admins')) {
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden.'
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $groups = Group::get()
        ->filter([
           'Code' => ['fileshare-users', 'fileshare-admins']
        ]);
      $groupIDs = [];
      foreach ($groups as $group) {
        $groupIDs[] = $group->ID;
      }

      $users = Member::get()
        ->leftJoin("Group_Members",
          "\"Group_Members\".\"MemberID\" = \"Member\".\"ID\""
        )
        ->filter([
           'GroupID' => $groupIDs
        ])
        ->sort([
           'FirstName' => 'ASC',
           'Surname' => 'ASC',
        ]);

      $list = [];
      foreach ($users as $user) {
        $list[] = [
          'userID' => $user->ID,
          'firstName' => $user->FirstName,
          'lastName' => $user->Surname,
          'email' => $user->Email,
        ];
      }

      $response['result'] = true;
      $response['users'] = $list;
      $response = $this->RESTfulAPI->serializer->serialize($response);
      return $response = $this->RESTfulAPI->answer($response);
    }


    // protected function handleClientConfigGET() {
    //   // return $this->getClientConfig();
    //   // $response = $this->RESTfulAPI->serializer->serialize($response);
    //
    //   $response = $this->RESTfulAPI->answer($this->getClientConfig());
    //   return $response;
    // }

    protected function getSharedFileForUser($fileID, $memberID) {
      $fileMember = FileMember::get()
        ->filter([
            'FileID' => $fileID,
            'MemberID' => $memberID
        ])
        ->first();
        if ($fileMember) {
          return File::get()
            ->filter([
                'ID' => $fileID,
            ])
            ->first();
        }
    }

    protected function getFileForUser($fileID, $memberID) {
      return File::get()
        ->filter([
            'ID' => $fileID,
            'OwnerID' => $memberID
        ])
        ->first();
    }

    protected function getFileForAdmin($fileID) {
      return File::get()
        ->filter([
            'ID' => $fileID,
        ])
        ->first();
    }

    protected function getFileForNonAdmin($fileID, $memberID, $isSharedFile) {
      return $isSharedFile
      ? $this->getSharedFileForUser($fileID, $memberID)
      : $this->getFileForUser($fileID, $memberID);
    }

    public function download(HTTPRequest $request) {
      // $request = $this->getRequest();
      $fileID = $this->getRequest()->param('FileID');
      $var_shared = $this->getRequest()->getVar('shared');
      $isSharedFile = ($var_shared === 'yes');
      $member = $this->RESTfulAPI->authenticator->getOwner($request);
      $isAdmin = $member->inGroup('fileshare-admins');
      $file = $isAdmin
        ? $this->getFileForAdmin($fileID)
        : $this->getFileForNonAdmin($fileID, $member->ID, $isSharedFile);
      if ($file) {
        $this->sendFile($file);
      } else {
        $this->httpError(404);
      }
    }

    public function downloadLinkSharedFile(HTTPRequest $request) {
      // $request = $this->getRequest();
      $UUID = $request->param('LinkID');

      $file = File::get()
        ->leftJoin("FileShare_FileShareLinkShare", "\"FileShare_FileShareLinkShare\".\"FileID\" = \"File\".\"ID\"")
        ->filter([
            'UUID' => $UUID
        ])
        ->first();

      if ($file) {
        $this->sendFile($file);
      } else {
        // TODO: 'Create File not found page.'
        $this->httpError(404);
      }
    }

    protected function handleupload() {
      $request = $this->getRequest();
      $member = $this->getMember();
      $temp_stream = fopen('php://temp', 'r+');
      $fileshare_temp_dir = 'assets/.' . $this->config()->get('fileshare_folder_name') . '_temp';
      $userEmail = $member->Email;
      $chunks_dir_path = $fileshare_temp_dir . '/' . $userEmail;
      $logdir = $fileshare_temp_dir .'/' . 'ResumableUpload_log';

      $resumableUpload = new ResumableUpload(
        $request->isGET(),    // request type
        true,   // write_to_stream,
        $temp_stream, //stream
        $chunks_dir_path, // $upload_dir_path
        $chunks_dir_path, // $temp_dir_path
        $logdir, // log_dir_path
        $request->getVar('resumableIdentifier'),
        $request->getVar('resumableFilename'),
        $request->getVar('resumableChunkNumber'),
        $request->getVar('resumableChunkSize'),
        $request->getVar('resumableTotalSize'),
        $request->getVar('resumableTotalChunks'),
        $request->getVar('resumableRelativePath'),
        $request->getVar('resumableIdentifier')
      );

      $resumableUpload->process();
      // TODO: validate (file extensions, etc)
      // -> add them as params to cilent response
      if ($resumableUpload->file_is_ready()) {
        $fileshare_dir = $this->getBaseDir();
        $rootID = $fileshare_dir->ID;
        $requestedParentFolderID =
          $request->getVar('parentFolderID') === $this->getRootFolderID()
          ? $rootID
          : $request->getVar('parentFolderID');

        $testFolderQuery = Folder::get()->filter([
            'ID' => $requestedParentFolderID,
            'ID:not' => $rootID,
            'OwnerID' => $member->ID
        ]);
        $parentFolderID = (
          $testFolderQuery->Count() === 1
          && !$this->nodeIsOutsideFileShareRoot($requestedParentFolderID)
        )
          ? $requestedParentFolderID
          : $rootID;

        $file = File::create();
        $file->ParentID = $parentFolderID;
        $file->OwnerID = $member->ID;
        $file->write();
        $file->OriginalFilename = $resumableUpload->getFileName();
        $fileName = $fileshare_dir->Name . '/' . $file->ID;
        $file->setFromStream(
          $temp_stream,
          $fileName,
          null,
          null,
          [
            'visibility' => AssetStore::VISIBILITY_PROTECTED
          ]
        );
        fclose($temp_stream);
        $file->ParentID = $parentFolderID;
        $file->Title = $file->OriginalFilename;
        $file->write();
        $file->protectFile();
        $file->publishSingle();

        $uploaded = FileShareUploaded::create();
        $uploaded->OwnerID = $member->ID;
        $uploaded->FileID = $file->ID;
        $uploaded->ParentID = $file->ParentID;
        $uploaded->ResumableIdentifier =
        $resumableUpload->getResumableIdentifier();
        $uploaded->write();
      }




    }

    protected function handleUploadedfilesGET() {
      $request = $this->getRequest();
      $member = $this->getMember();
      $uploaded = FileShareUploaded::get()
        ->filter([
          'OwnerID' => $member->ID
        ]);
      $list = [];
      foreach ($uploaded as $key => $item) {
        $list[] = [
          'FileID' => $item->FileID,
          'ParentID' => $item->ParentID,
          'ResumableIdentifier' => $item->ResumableIdentifier
        ];
      }
      $response = [];
      $response['result'] = true;
      $response['uploaded'] = $list;
      $response = $this->RESTfulAPI->serializer->serialize($response);
      return $response = $this->RESTfulAPI->answer($response);
    }

    protected function handleUploadedfilesDELETE() {
      $request = $this->getRequest();
      $member = $this->getMember();

      $folderID = $this->getRequest()->param('FolderID');
      $resumableIdentifier = $this->getRequest()->param('ResumableIdentifier');
      $fileToDelete = FileShareUploaded::get()
        ->filter([
          'OwnerID' => $member->ID,
          'ParentID' => $folderID,
          'ResumableIdentifier' => $resumableIdentifier
        ])->first();
      $fileToDelete->delete();

      $response = [];
      $response['result'] = true;
      $response['message'] = 'Record deleted';
      $response = $this->RESTfulAPI->serializer->serialize($response);
      return $response = $this->RESTfulAPI->answer($response);
    }

    /*
    * only creates directories, files are created trough upload
    */
    protected function handleFilesPOST() {

      $request = $this->getRequest();
      $member = $this->getMember();
      $fileshare_dir = $this->getBaseDir();
      $rootID = $fileshare_dir->ID;
      $requestedParentFolderID = $request->getVar('parentFolderID');
      $testFolderQuery = Folder::get()->filter([
          'ID' => $requestedParentFolderID,
          'ID:not' => $rootID,
          'OwnerID' => $member->ID
      ]);
      $parentFolderID = (
        $testFolderQuery->Count() === 1
        && !$this->nodeIsOutsideFileShareRoot($requestedParentFolderID)
      )
        ? $requestedParentFolderID
        : $rootID;
      $folder = Folder::create();
      $folderName = $request->getVar('name');
      $folder->setFilename($folderName) ;
      $folder->OriginalFilename = $request->getVar('name');
      $folder->OwnerID = $member->ID;
      $folder->ParentID = $parentFolderID;
      $folder->write();
      $folder-> protectFile();

      $response['result']   = true;
      $response['message']  = 'Folder created';
      $response['ID'] = $folder->ID;
      $response['name'] = $folder->OriginalFilename;
      $response = $this->RESTfulAPI->serializer->serialize($response);
      return $response = $this->RESTfulAPI->answer($response);
    }

    protected function handleFilesGET() {

      $request = $this->getRequest();
      $member = $this->getMember();
      $fileshare_dir = $this->getBaseDir();
      $rootID = $fileshare_dir->ID;
      $request = $this->getRequest();
      $requestedFolderID = $request->getVar('folder');
      $rootID = (string) $this->getBaseDir()->ID;
      $folderID = $requestedFolderID
        ? $requestedFolderID
        : $rootID;

      //  var_dump($member);

      if ($requestedFolderID && !$this->nodeExists($folderID)) {
        $errors[] = [
          'status' => 'not_found',
          'fileID' => $folderID,
          'message' => 'Folder not found',
        ];
        $error =  new RESTfulAPI_Error(
          404,
          'Not found',
          ['message' => "The requested folder does not exist.",
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      if (
        $requestedFolderID
        && $this->nodeIsOutsideFileShareRoot($folderID)
      ) {
        $errors[] = [
          'status' => 'forbidden',
          'fileID' => $folderID,
          'message' => 'The user does not have permisson to access the requested folder.',
        ];
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden',
          ['message' => 'The user does not have permisson to access the requested folder.',
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      if ($folderID === $rootID) {
        $folder = Folder::get()->byID($folderID);
        $parentFolderName = '';
      } else {
        $folder = Folder::get()->filter([
          'ID' => $folderID,
          'OwnerID' => $member->ID
          ])->first();
          $parentFolderName = $folder->OriginalFilename;
      }
      $parentFolderID = $folder->ID;

      $filesDataList = File::get()->filter([
          'ParentID' => $folder->ID,
          'OwnerID' => $member->ID
      ]);
      // print_r($filesDataList);

      $sharedFilesDataList = File::get()
        ->leftJoin("FileShare_FileMember",
          "\"FileShare_FileMember\".\"FileID\" = \"File\".\"ID\""
        )
        ->filter([
          'MemberID' => $member->ID,
          'ParentID' => $rootID,
        ]);

      $sharedFiles=[];
      if (isset($sharedFilesDataList) && $folderID === $rootID) {
        foreach ($sharedFilesDataList as $file) {
          $type = ($file->ClassName === 'SilverStripe\Assets\Folder')
            ? 'Folder'
            : 'File';
            $modified = DateTime::createFromFormat('Y-m-d H:i:s', $file->LastEdited);
          $sharedFiles[] = [
            'key' =>  $file->ID,
            // 'parentID' => $parentID,
            'type' => $type,
            'systemName' => $file->Name,
            'fileName' => $file->OriginalFilename,
            'size' => $file->getSize(),
            'byteSize' => $file->getAbsoluteSize(),
            'modified' => [
              'timezone' => date_default_timezone_get(),
              'timestamp' => $modified->getTimestamp(),
              'date' => $modified->format('Y-m-d'),
              'time' => $modified->format('H:i:s'),
            ],
            'linkSharedByMe' => false,
            'sharedByMe' => false,
            'sharedWithMe' => true,
            'ownerID' => $file->OwnerID
          ];
        }
      }
      // TODO: read from shared folders

      $parentFolder = [
        'folderID' => $parentFolderID,
        'folderName' => $parentFolderName
      ];
      $files=[];
      foreach ($filesDataList as $file) {
        // TODO: optimize this, do not run query for every single file
        $linkSharedByMe = FileShareLinkShare::get()
          ->filter([
            'MemberID' => $member->ID,
            'FileID' => $file->ID,
          ])->count() === 1?true:false;
        $type = ($file->ClassName === 'SilverStripe\Assets\Folder')
          ? 'Folder'
          : 'File';
        $sharedByMe = ($file->FileMembers()->count() > 0 )
          ? true
          : false;
        $modified = DateTime::createFromFormat('Y-m-d H:i:s', $file->LastEdited);
        $files[] = [
          'key' =>  $file->ID,
          'type' => $type,
          'systemName' => $file->Name,
          'fileName' => $file->OriginalFilename,
          'size' => $file->getSize(),
          'byteSize' => $file->getAbsoluteSize(),
          'modified' => [
            'timezone' => ini_get('date.timezone'),
            'timestamp' => $modified->getTimestamp(),
            'date' => $modified->format('Y-m-d'),
            'time' => $modified->format('H:i:s'),
          ],
          'linkSharedByMe' => $linkSharedByMe,
          'sharedByMe' => $sharedByMe,
          'sharedWithMe' => false,
          'ownerID' => $file->OwnerID
        ];
      }
      $response['result']   = true;
      $response['parentFolder'] = $parentFolder;
      $response['files'] = array_merge($files, $sharedFiles);
      $response = $this->RESTfulAPI->serializer->serialize($response);
      return $response = $this->RESTfulAPI->answer($response);

    }

    // delete normal and linkshares
    protected function deleteShareings($member, $file) {
      $realMember = $this->getRealMember();
      if (!$realMember->inGroup('fileshare-admins')) {
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden.'
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $share = FileMember::get()
        ->filter([
          'FileID' => $file->ID,
        ])->first();
      if ($share) {
        $share->delete();
      }

      $linkShare = FileShareLinkShare::get()
        ->filter([
          'MemberID' => $member->ID,
          'FileID' => $file->ID,
        ])->first();
      if ($linkShare) {
        $linkShare->delete();
      }
    }

    protected function deleteWithChildren($member, $file) {
        $childrenCount = 0;
        if ($file->ClassName === 'SilverStripe\Assets\Folder') {
          $children = File::get()->filter([
              'ParentID' => $file->ID,
              'ID:not' => $this->getBaseDir()->ID,
              'OwnerID' => $member->ID
          ]);
          $childrenCount = $children->Count();
        }
        if ($childrenCount > 0) {
          foreach ($children as $child) {
            $this->deleteWithChildren($member, $child);
          }
        }
        $file->deleteFile();
        $file->deleteFromStage(Versioned::LIVE);
        $file->deleteFromStage(Versioned::DRAFT);
        $this->deleteShareings($member, $file);
    }

    protected function handleFilesDELETE() {
      $request = $this->getRequest();
      $member = $this->getMember();
      $errors = []; //fileID, status, message

      if ($request->param('FileID') === null) {
        $payload = json_decode($request->getBody(), TRUE);
      }

      $filesToDelete = $request->param('FileID') !== null
        ? [$request->param('FileID')]
        : $payload['fileIDs'];

        $fileshare_dir = $this->getBaseDir();

      foreach ($filesToDelete as $fileID) {

        $exists = $this->nodeExists($fileID);
        if (!$exists) {
          $errors[] = [
            'status' => 'not_found',
            'fileID' => $fileID,
            'message' => 'File or folder not found',
          ];
          continue;
        }

        if (
          $this->nodeIsFileShareRoot($fileID)
          || $this->nodeIsOutsideFileShareRoot($fileID)
        ) {
          $errors[] = [
            'status' => 'forbidden',
            'fileID' => $fileID,
            'message' => 'The user does not have permisson to delete this file or folder',
          ];
          continue;
        }


        $testFileQuery = File::get()->filter([
            'ID' => $fileID,
            'ID:not' => $this->getBaseDir()->ID,
            'OwnerID' => $member->ID
        ]);
        $testSharedFileQuery = FileMember::get()
          ->filter([
            'MemberID' => $member->ID,
            'FileID' => $fileID,
          ]);

        if (
          $testFileQuery->Count() !== 1
          && $testSharedFileQuery->Count() !== 1
        ) {
          $file = File::get_by_id(File::class, $fileID);
          $filenameOrID = ($file && $file->OriginalFilename !== null)
            ? $file->OriginalFilename
            : $fileID;
            $errors[] = [
              'status' => 'failed_to_delete',
              'fileID' => $fileID,
              'message' => 'Failed to delete file or folder: ' . $filenameOrID,
            ];
            continue;
        } else {

          if ($testFileQuery->Count() === 1) {
            $file = $testFileQuery->first();
            $this->deleteWithChildren($member, $file);
          }

          if ($testSharedFileQuery->Count() === 1) {
            $share = $testSharedFileQuery->first();
            $share->delete();
          }
        }
      }

      if (count($errors) > 0) {
        $error =  new RESTfulAPI_Error(
          409,
          "Conflict.",
          ['message' => "One or more files could't be deleted.",
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      } else {
        $response['result']   = true;
        $response['message'] = 'File(s) deleted.';
        $response = $this->RESTfulAPI->serializer->serialize($response);
        return $response = $this->RESTfulAPI->answer($response);
      }

    }

    protected function handleLinkSharePOST() {

      $realMember = $this->getRealMember();
      if (!$realMember->inGroup('fileshare-admins')) {
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden.'
        );
        return $response = $this->RESTfulAPI->error($error);
      }
      $request = $this->getRequest();
      $member = $this->getMember();
      $fileID = $request->param('FileID');

      if (!$this->nodeExists($fileID)) {
        $errors[] = [
          'status' => 'not_found',
          'fileID' => $fileID,
          'message' => 'File not found',
        ];
        $error =  new RESTfulAPI_Error(
          404,
          'Not found',
          ['message' => "The file does not exist. Link not created.",
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      if (!$this->memberIsOwner($fileID, $member)) {
        $errors[] = [
          'status' => 'forbidden',
          'fileID' => $fileID,
          'message' => 'The user does not have permisson to access the requested file.',
        ];
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden',
          ['message' => 'The user does not have permisson to access the requested file. Link not created.',
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      if ($this->nodeIsOutsideFileShareRoot($fileID)) {
        $errors[] = [
          'status' => 'forbidden',
          'fileID' => $fileID,
          'message' => 'The user does not have permisson to access the requested file.',
        ];
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden',
          ['message' => 'The user does not have permisson to access the requested file. Link not created.',
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }


      $linkShareExists = FileShareLinkShare::get()->filter([
          'FileID' => $fileID,
          'MemberID' => $member->ID
      ])->first();

      if ($linkShareExists) {
        $linkID = $linkShareExists->UUID;
        $response = [];
        $response['message'] = 'The file already has a shareable link.';
        $response['result']   = true;
        $response['linkShare'] = [
          'LinkID' => $linkID,
          'Lifetime' => $linkShareExists->Lifetime,
          'MaxDownloads' => $linkShareExists->MaxDownloads,
          'Downloads' => $linkShareExists->Downloads,
          'Active' => ($linkShareExists->Active > 0 ? true : false),
          'FileID' => $linkShareExists->FileID,
        ];

        $response = $this->RESTfulAPI->serializer->serialize($response);
        return $response = $this->RESTfulAPI->answer($response);
      }

      try {
          // Generate a version 1 (time-based) UUID object
          $uuid1String = Uuid::uuid1()->toString();
      } catch (UnsatisfiedDependencyException $e) {
          // Some dependency was not met. Either the method cannot be called on a
          // 32-bit system, or it can, but it relies on Moontoast\Math to be present.
          // echo 'Caught exception: ' . $e->getMessage() . "\n";
          $errors[] = [
            'status' => 'server_error',
            'fileID' => $fileID,
            'message' => 'Couldn\'t create uuid for file.',
          ];
          $error =  new RESTfulAPI_Error(
            500,
            'Server error',
            ['message' => 'Link not created.',
            'errors' => $errors]
          );
          return $response = $this->RESTfulAPI->error($error);
      }

      $linkShare = FileShareLinkShare::create();
      $linkShare->UUID = $uuid1String;
      $linkShare->Lifetime = 0;
      $linkShare->MaxDownloads = 0;
      $linkShare->Downloads = 0;
      $linkShare->Active = false;
      $linkShare->FileID = $fileID;
      $linkShare->MemberID = $member->ID;
      $savedLinkShare = $linkShare->write();

      if ($savedLinkShare) {
        $linkID = $linkShare->UUID;
        $response = [];
        $response['result']   = true;
        $response['linkShare'] = [
          'LinkID' => $linkID,
          'Lifetime' => $linkShare->Lifetime,
          'MaxDownloads' => $linkShare->MaxDownloads,
          'Downloads' => $linkShare->Downloads,
          'Active' => ($linkShare->Active > 0 ? true : false),
          'FileID' => $linkShare->FileID,
        ];
        $response = $this->RESTfulAPI->serializer->serialize($response);
        return $response = $this->RESTfulAPI->answer($response);
      } else {
        $errors[] = [
          'status' => 'server_error',
          'fileID' => $fileID,
          'message' => 'Couldn\'t create save shareable link for file.',
        ];
        $error =  new RESTfulAPI_Error(
          500,
          'Server error',
          ['message' => 'Link not created.',
        'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }
    }

    protected function handleLinkSharePATCH() {
      // JSON PATCH would be overkill

      $realMember = $this->getRealMember();
      if (!$realMember->inGroup('fileshare-admins')) {
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden.'
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $request = $this->getRequest();
      $member = $this->getMember();
      $fileID = $request->param('FileID');

      $patch = json_decode($request->getBody(), TRUE);

      if ($patch === null) {
        $error =  new RESTfulAPI_Error(
          400,
          'Bad Request',
          ['message' => "The request body is malformed or missing."]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $UUID = $patch['LinkID'];
      $active = $patch['Active'];
      $memberID = $member->ID;

      $linkShare = FileShareLinkShare::get()->filter([
          'FileID' => $fileID,
          'UUID' => $UUID,
          'MemberID' => $member->ID
      ])->first();

      if (!$linkShare) {
        $errors[] = [
          'status' => 'not_found',
          'fileID' => $fileID,
          'UUID' => $UUID,
          'message' => 'Link not found',
        ];
        $error =  new RESTfulAPI_Error(
          404,
          'Not found',
          ['message' => "The requested shareable link does not exist.",
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      if ($linkShare) {
        $linkShare->Active = $active;
        $written = $linkShare->write();

        if (!$written) {
          $errors[] = [
            'status' => 'server_error',
            'fileID' => $fileID,
            'UUID' => $UUID,
            'message' => 'Couldn\'t activate the shareable link.',
          ];
          $error =  new RESTfulAPI_Error(
            500,
            'Server error',
            ['message' => 'Link not activated.',
            'errors' => $errors]
          );
          return $response = $this->RESTfulAPI->error($error);
        }

        if ($written) {
          $response = [];
          $response['result']   = true;
          $response['linkShare'] = [
            'LinkID' => $UUID,
            'Lifetime' => $linkShare->Lifetime,
            'MaxDownloads' => $linkShare->MaxDownloads,
            'Downloads' => $linkShare->Downloads,
            'Active' => $linkShare->Active,
            'FileID' => $linkShare->FileID,
          ];
          $response = $this->RESTfulAPI->serializer->serialize($response);
          return $response = $this->RESTfulAPI->answer($response);
        }
      }
    }

    protected function handleLinkShareDELETE() {

      $realMember = $this->getRealMember();
      if (!$realMember->inGroup('fileshare-admins')) {
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden.'
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $request = $this->getRequest();
      $member = $this->getMember();
      $fileID = $request->param('FileID');
      $UUID = $request->param('LinkID');
      $memberID = $member->ID;

      // TODO: check if the record exists
      $linkShare = FileShareLinkShare::get()->filter([
          'FileID' => $fileID,
          'UUID' => $UUID,
          'MemberID' => $member->ID
      ])->first();

      if (!$linkShare) {
        $errors[] = [
          'status' => 'not_found',
          'fileID' => $fileID,
          'UUID' => $UUID,
          'message' => 'Link not found',
        ];
        $error =  new RESTfulAPI_Error(
          404,
          'Not found',
          ['message' => "The requested shareable link does not exist.",
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      if ($linkShare) {
        $deleted = $linkShare->delete();
        $response['result'] = true;
        $response['message'] = ['Shareable link deleted.'];
        $response = $this->RESTfulAPI->serializer->serialize($response);
        return $response = $this->RESTfulAPI->answer($response);
      }
    }

    protected function handleShareGET() {

      $realMember = $this->getRealMember();
      if (!$realMember->inGroup('fileshare-admins')) {
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden.'
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $request = $this->getRequest();
      $member = $this->getMember();
      $memberID = $member->ID;
      $fileID = $request->param('FileID');

      if (!$this->nodeExists($fileID)) {
        $errors[] = [
          'status' => 'not_found',
          'fileID' => $fileID,
          'message' => 'File not found',
        ];
        $error =  new RESTfulAPI_Error(
          404,
          'Not found',
          ['message' => "Failed to list shareings. The file does not exist.",
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      if ($this->nodeIsFileShareRoot($fileID)) {
        $errors[] = [
          'status' => 'forbidden',
          'fileID' => $fileID,
          'message' => 'The user does not have permisson to access the requested file.',
        ];
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden',
          ['message' => 'The user does not have permisson to access the requested file.',
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      if ($this->nodeIsOutsideFileShareRoot($fileID)) {
        $errors[] = [
          'status' => 'forbidden',
          'fileID' => $fileID,
          'message' => 'The user does not have permisson to access the requested file.',
        ];
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden',
          ['message' => 'The user does not have permisson to access the requested file.',
          'errors' => $errors]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      // TODO: filter members by group, or 'friendship' later when not only admin will be able to share
      $fileMembers = File::get()->byId($fileID)->FileMembers();

      $sharedWIthUsers = [];
      foreach ($fileMembers as $fileMember) {
        $sharedWIthUsers[] = [
          'userID' => $fileMember->ID,
          'firstName' => $fileMember->FirstName,
          'lastName' => $fileMember->Surname,
          'email' => $fileMember->Email,
        ];
      }
      $response['result'] = true;
      $response['users'] = $sharedWIthUsers;
      $response['currentUserID'] = $memberID;
      $response = $this->RESTfulAPI->serializer->serialize($response);
      return $response = $this->RESTfulAPI->answer($response);
    }

    protected function handleSharePOST() {

      $realMember = $this->getRealMember();
      if (!$realMember->inGroup('fileshare-admins')) {
        $error =  new RESTfulAPI_Error(
          403,
          'Forbidden.'
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $request = $this->getRequest();
      $member = $this->getMember();
      $memberID = $member->ID;
      $fileID = $request->param('FileID');
      $body = json_decode($request->getBody(), TRUE);

      if ($body === null) {
        $error =  new RESTfulAPI_Error(
          400,
          'Bad Request',
          ['message' => "The request body is malformed or missing."]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $userIDs = isset($body['userIDs']) ? $body['userIDs'] : false;


      $fileMembers = FileMember::get()
        ->filter(['FileID' => $fileID,]);
      foreach ($fileMembers as $fileMember) {;
        $fileMember->delete();
      }

      if (!$userIDs) {
        $error =  new RESTfulAPI_Error(
          409,
          'Conflict',
          ['message' => "No userIDs were provided. File not shared."]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      //TODO check userIDs are in the fileshare-member group
      $nonexistentUsers = [];
      foreach ($userIDs as $userID) {
        $userToShareWith = Member::get()->byID($userID);
        if (
          $userToShareWith === null
          || !$userToShareWith->inGroup('fileshare-users')
        ) {
          $nonexistentUsers[] = $userID;
        }
      }

      if (!empty($nonexistentUsers)) {
        $error =  new RESTfulAPI_Error(
          409,
          'Conflict',
          ['message' => "Some of the specified users are nonexistent.",
          'nonexistent users' => $nonexistentUsers]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      // $userIDs = array_diff($userIDs, $nonexistentUsers);

      $failedToShareWith = [];
      $sharedWith = [];
      foreach ($userIDs as $userID) {
        $share = FileMember::create();
        $share->FileID = $fileID;
        $share->MemberID = $userID;
        $share->Active = true;
        $written = $share->write();
        if (!$written) {
          $failedToShareWith[] = $userID;
        } else {
          $sharedWith[] = $userID;
        }
      }

      if (!empty($failedToShareWith)) {
        $error =  new RESTfulAPI_Error(
          500,
          'Server error',
          ['message' => "Failed to share file with one or more users.",
          'not shared with' => $failedToShareWith,
          'shared with' => $sharedWith]
        );
        return $response = $this->RESTfulAPI->error($error);
      }

      $response['result'] = true;
      $response['message'] = 'file shared with the specified users';
      $response['userIDs'] = $sharedWith;
      $response = $this->RESTfulAPI->serializer->serialize($response);
      return $response = $this->RESTfulAPI->answer($response);
    }


    /**
     * from silverstripe-secureassets
     * Output file to the browser.
     * For performance reasons, we avoid SS_HTTPResponse and just output the contents instead.
     */
    protected function sendFile($file) {

      $path =
        'assets/.protected'
        . '/' . $this->getBaseDir()->Name
        . '/' . substr ( $file->getHash(), 0, 10)
        . '/' . $file->ID;

      if (!file_exists($path)) {
        return $this->httpError(404);
      }
      if (
        class_exists('SapphireTest', false)
        && SapphireTest::is_running_test()
      ) {
        return file_get_contents($path);
      }
      $disposition = $this->owner->config()->content_disposition;
      if (!$disposition) {
        $disposition = 'attachment';
      }
      header('Content-Description: File Transfer');
      // Quotes needed to retain spaces (http://kb.mozillazine.org/Filenames_with_spaces_are_truncated_upon_download)
      header(sprintf('Content-Disposition: %s; filename="%s"', $disposition, $file->OriginalFilename));
      header('Content-Length: ' . $file->getAbsoluteSize());
      header('Content-Type: ' . HTTP::get_mime_type($path));
      header('Content-Transfer-Encoding: binary');
      // Ensure we enforce no-cache headers consistently, so that files accesses aren't cached by CDN/edge networks
      header('Pragma: no-cache');
      header('Cache-Control: private, no-cache, no-store');
      $config = $this->owner->config();
      if ($config->min_download_bandwidth) {
        // Allow the download to last long enough to allow full download with min_download_bandwidth connection.
        Environment::increaseTimeLimitTo((int)(filesize($path)/($config->min_download_bandwidth*1024)));
      } else {
        // Remove the timelimit.
        Environment::increaseTimeLimitTo(0);
      }
      // Clear PHP buffer, otherwise the script will try to allocate memory for entire file.
      while (ob_get_level() > 0) {
              ob_end_flush();
      }
      // Prevent blocking of the session file by PHP. Without this the user can't visit another page of the same
      // website during download (see http://konrness.com/php5/how-to-prevent-blocking-php-requests/)
      session_write_close();
      readfile($path);
      die();
    }



    // Template methods

    protected function fileUploadMaxSize() {
      static $max_size = -1;
      if ($max_size < 0) {
        // Start with post_max_size.
        $post_max_size = $this->parse_size(ini_get('post_max_size'));
        if ($post_max_size > 0) {
          $max_size = $post_max_size;
        }
        // If upload_max_size is less, then reduce. Except if
        // upload_max_size is zero, which indicates no limit.
        $upload_max = $this->parse_size(ini_get('upload_max_filesize'));
        if ($upload_max > 0 && $upload_max < $max_size) {
          $max_size = $upload_max;
        }
      }
      return $max_size;
    }

    protected function parse_size($size) {
      // Remove the non-unit characters from the size.
      $unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
      // Remove the non-numeric characters from the size.
      $size = preg_replace('/[^0-9\.]/', '', $size);
      if ($unit) {
        // Find the position of the unit in the ordered string
        // which is the power of magnitude to multiply a kilobyte by.
        return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
      }
      else {
        return round($size);
      }
    }

    public function getBaseDir() {
      return File::get()
        ->filter([
            'ParentID' => 0,
            'Name' => $this->config()->get('fileshare_folder_name'),
        ])
        ->first();
    }

    protected function getRootFolderID() {
      return File::get()
        ->filter([
            'ParentID' => 0,
            'Name' => $this->config()->get('fileshare_folder_name'),
        ])
        ->first()->ID;
    }

    public function getClientConfig() {
      $imagePath = Director::absoluteBaseURL() . 'public/resources/vendor/devcreative/fileshare/client/dist/images';
      $defaultLogo = [
        "src" => $imagePath . '/fileshare_logo.png',
        "alt" => 'FileShare',
      ];
      $logo = $this->dataRecord->Logo()->URL
        ? [
            "src" => $this->dataRecord->Logo()->URL,
            "alt" => $this->dataRecord->LogoAltText,
          ]
        : $defaultLogo;
      $config = [
        "app" => [
          "domain" => Director::absoluteBaseURL(),
          "appPath" => $this->URLSegment,
          "resourcePath" => Director::absoluteBaseURL() . 'public/resources/vendor/devcreative/fileshare/client/dist',
          "imagePath" => $imagePath,
          "logo" => $logo
        ],
        "files" => [
          "rootFolderID" => $this->getRootFolderID(),
          "fileUploadMaxSize" =>  $this->fileUploadMaxSize(),
        ],
      ];
      $response = $this->RESTfulAPI->serializer->serialize($config);
      return $response ;
    }

}
