<?php

namespace FileShare;

use SilverStripe\ORM\DataObject;

class FileMember extends DataObject {

    private static $db = array(
        "Active" => 'Boolean(false)',
    );

    private static $has_one = array(
      'File' => 'SilverStripe\Assets\File',
      'Member' => 'SilverStripe\Security\Member',
    );

}
