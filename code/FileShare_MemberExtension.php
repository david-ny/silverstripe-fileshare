<?php
use SilverStripe\ORM\DataExtension;
// use SilverStripe\Assets\File;


class FileShare_MemberExtension extends DataExtension {

  private static $belongs_many_many = [
      "Files" => "SilverStripe\Assets\File",
  ];

}
