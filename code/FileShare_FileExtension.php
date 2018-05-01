<?php
use SilverStripe\ORM\DataExtension;


class FileShare_FileExtension extends DataExtension {

    private static $db = [
      'OriginalFilename' => 'Text'
    ];

    private static $many_many = [
        "FileMembers" => [
            'through' => 'FileShare\FileMember',
            'from' => 'File',
            'to' => 'Member',
        ]
    ];


    // public static $summary_fields = array(
    //     'Thumbnail' => 'Thumbnail',
    // );
    //
    // public function getThumbnail() {
    //     if ($this->Image()->ID) {
    //         return $this->Image()->SetWidth(80);
    //     } else {
    //         return '(No Image)';
    //     }
    // }
    //
    // public function getAboutSummary() {
    //     $HTMLText = new HTMLText($this->About);
    //     //Debug::dump($HTMLText);
    //     return $HTMLText->Summary();
    // }



    // private static $many_many = array(
    //     "Doctors" => "Doctor"
    // );


}
