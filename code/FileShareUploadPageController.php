<?php

use SilverStripe\CMS\Controllers\ContentController;
use Dilab\Network\SimpleRequest;
use Dilab\Network\SimpleResponse;
use Dilab\Resumable;

class FileShareUploadPageController extends ContentController
{
    /**
     * An array of actions that can be accessed via a request. Each array element should be an action name, and the
     * permissions or conditions required to allow the user to access it.
     *
     * <code>
     * [
     *     'action', // anyone can access this action
     *     'action' => true, // same as above
     *     'action' => 'ADMIN', // you must have ADMIN permissions to access this action
     *     'action' => '->checkAction' // you can only access this action if $this->checkAction() returns true
     * ];
     * </code>
     *
     * @var array
     */
    private static $allowed_actions = [];

    protected function init()
    {
        parent::init();
        // You can include any CSS or JS required by your project here.
        // See: https://docs.silverstripe.org/en/developer_guides/templates/requirements/
        $request = new SimpleRequest();
        $response = new SimpleResponse();

        $resumable = new Resumable($request, $response);
        $resumable->tempFolder   = 'assets/tmpdir';
        $resumable->uploadFolder = 'assets/testdir';
        $resumable->process();        
    }

    public function index(SS_HTTPRequest $request)
    {




    }


}
