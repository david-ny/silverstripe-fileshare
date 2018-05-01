<?php

namespace FileShare;

use SilverStripe\ORM\DataObject;

class FileShareLinkShare extends DataObject {

    private static $db = array(
        "UUID" => 'Text',
        "Lifetime" => 'Int',
        "MaxDownloads" => 'Int',
        "Downloads" => 'Int',
        "Active" => 'Boolean(false)',
    );

    // TODO: uniqe index?
    // private static $indexes = [
    //   'UUIDIndex' => ['UUID'],
    // ];

    private static $has_one = array(
        'Member' => Member::class,
        'File' => File::class,
        // "Parent" => File::class
    );

}
