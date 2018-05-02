<?php

use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Group;
use SilverStripe\Assets\Folder;
use SilverStripe\Security\Member;
use SilverStripe\AssetAdmin\Forms\UploadField;
use SilverStripe\Assets\Image;
use SilverStripe\Forms\TextField;

class FileSharePage extends Page
{
    private static $db = [
      'LogoAltText' => 'Varchar(255)'
    ];

    private static $has_one = [
        'Logo' => Image::class,
    ];

    protected function createFileshareUsersGroup() {
      $group = Group::create();
      $group->Code = 'fileshare-users';
      $group->Title = 'Fileshare Users';
      return $group->write();
    }

    public  function requireDefaultRecords() {
      parent::requireDefaultRecords();

      $usersGroup = Group::get()
        ->filter(['Code' => 'fileshare-users'])
        ->first();

      $usersGroupID = $usersGroup
        ? $usersGroup->ID
        : $this->createFileshareUsersGroup();

      $adminsGroup = Group::get()
        ->filter(['Code' => 'fileshare-admins'])
        ->first();
      if(!$adminsGroup) {
        $group = Group::create();
        $group->Code = 'fileshare-admins';
        $group->Title = 'Fileshare Administrators';
        $group->ParentID = $usersGroupID;
        $group->write();
      }

      // create root folder for fileshare if it not exists
      $controller = FileSharePageController::create();
      $fileshare_folder_name = $controller->config()->get('fileshare_folder_name');
      if ($controller->getBaseDir() === null) {
        $folder = Folder::create();
        $folder->ParentID = 0;
        $folder->Name = $fileshare_folder_name;
        $folder->Title = $fileshare_folder_name;
        $folder->CanViewType = 'OnlyTheseUsers';
        $folder->CanEditType = 'OnlyTheseUsers';
        $folder->ViewerGroups()->add(Group::get()->filter(['Code' => 'administrators'])->first());
        $folder->EditorGroups()->add(Group::get()->filter(['Code' => 'administrators'])->first());
        // if (Member::currentUser()->inGroup('administrators')) {
        //   $folder->OwnerID = Member::currentUser()->ID;
        // }
        $folder->write();
      }
    }

    public function getCMSFields() {
      $fields = parent::getCMSFields();
      $imageUploadField = new UploadField('Logo', 'Logo');
      $imageUploadField->setFolderName('Uploads/FileShareLogo');
      $imageUploadField->setAllowedExtensions(array('png', 'jpg', 'jpeg', 'gif', 'svg'));
      $fields->removeFieldFromTab("Root.Content.Main","Content");
      $fields->addFieldToTab('Root.Main', $imageUploadField);
      $fields->addFieldToTab('Root.Main', TextField::create('LogoAltText', 'alt attribute text for the logo'));
      return $fields;
    }
}
