<?php

namespace FileShare;

use SilverStripe\ORM\DataObject;

class FileShareUploaded extends DataObject {

    private static $db = array(
        "ResumableIdentifier" => 'Text'
    );

    private static $has_one = array(
        'Owner' => Member::class,
        'File' => File::class,
        "Parent" => File::class
    );

}
