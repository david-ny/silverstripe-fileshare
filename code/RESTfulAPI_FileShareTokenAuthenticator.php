<?php

// use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Config\Config;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Security\Member;
use SilverStripe\Security\MemberAuthenticator\MemberAuthenticator;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Security\RandomGenerator;
use SilverStripe\Security\PasswordEncryptor;
use SilverStripe\Core\Convert;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Security;
/**
 * RESTfulAPI Token authenticator
 * handles login, logout and request authentication via token
 *
 * @author  Thierry Francois @colymba thierry@colymba.com
 * @copyright Copyright (c) 2013, Thierry Francois
 *
 * @license http://opensource.org/licenses/BSD-3-Clause BSD Simplified
 *
 * @package RESTfulAPI
 * @subpackage Authentication
 */
class RESTfulAPI_FileShareTokenAuthenticator extends RESTfulAPI_TokenAuthenticator
{

    /**
   * Authentication token life in seconds
   *
   * @var integer
   * @config
   */
  private static $tokenLife = 10800; //3 * 60 * 60;


  /**
   * HTTP Header name storing authentication token
   *
   * @var string
   * @config
   */
  private static $tokenHeader = 'X-Silverstripe-Apitoken';


  /**
   * Fallback GET/POST HTTP query var storing authentication token
   *
   * @var string
   * @config
   */
  private static $tokenQueryVar = 'token';


  /**
   * Class name to query for token validation
   *
   * @var string
   * @config
   */
  // private static $tokenOwnerClass = 'Member::class';
  private static $tokenOwnerClass = 'SilverStripe\Security\Member';


  /**
   * Whether or not the token should auto-update on activity.
   * When set to true, the token will automatically update its lifetime, similar
   * to a session-ping.
   *
   * @var boolean
   * @config
   */
  private static $autoRefreshLifetime = false;


  /**
   * Stores current token authentication configurations
   * header, var, class, db columns....
   *
   * @var array
   */
  protected $tokenConfig;


    const AUTH_CODE_LOGGED_IN     = 0;
    const AUTH_CODE_LOGIN_FAIL    = 1;
    const AUTH_CODE_TOKEN_INVALID = 2;
    const AUTH_CODE_TOKEN_EXPIRED = 3;


  /**
   * List of URL accessible actions
   *
   * @var array
   */
  private static $allowed_actions = array(
    'login',
    'logout',
    'lostPassword'
  );


  /**
   * Instanciation + config aquisition
   */
  public function __construct()
  {
      $config = array();
      // $configInstance = Configurable::config();
      $configInstance = Config::inst();

      $config['life']         = $configInstance->get('RESTfulAPI_TokenAuthenticator', 'tokenLife');
      $config['header']       = $configInstance->get('RESTfulAPI_TokenAuthenticator', 'tokenHeader');
      $config['queryVar']     = $configInstance->get('RESTfulAPI_TokenAuthenticator', 'tokenQueryVar');
      $config['owner']        = $configInstance->get('RESTfulAPI_TokenAuthenticator', 'tokenOwnerClass');
      $config['autoRefresh']  = $configInstance->get('RESTfulAPI_TokenAuthenticator', 'autoRefreshLifetime');

      $tokenDBColumns = $configInstance->get('RESTfulAPI_TokenAuthExtension', 'db');
      $tokenDBColumn  = array_search('Varchar(160)', $tokenDBColumns);
      $expireDBColumn = array_search('Int', $tokenDBColumns);

      if ($tokenDBColumn !== false) {
          $config['DBColumn'] = $tokenDBColumn;
      } else {
          $config['DBColumn'] = 'ApiToken';
      }

      if ($expireDBColumn !== false) {
          $config['expireDBColumn'] = $expireDBColumn;
      } else {
          $config['expireDBColumn'] = 'ApiTokenExpire';
      }

      $this->tokenConfig = $config;
  }


  /**
   * Login a user into the Framework and generates API token
   * Only works if the token owner is a Member
   *
   * @param  HTTPRequest   $request  HTTP request containing 'email' & 'pwd' vars
   * @return array                      login result with token
   */
  public function login(HTTPRequest $request)
  {
      $response = array();

      if ($this->tokenConfig['owner'] === 'SilverStripe\Security\Member') {
          $email    = $request->requestVar('email');
          $pwd      = $request->requestVar('pwd');
          $member   = false;


          if ($email && $pwd) {
              // user_error(print_r($this, true), E_USER_NOTICE);
              $memberAuthenticator = Injector::inst()->get('SilverStripe\Security\MemberAuthenticator\MemberAuthenticator');
              // $member = $this->MemberAuthenticator->authenticate([
              $member = $memberAuthenticator->authenticate([
              // $member = MemberAuthenticator::create()->authenticate([
              // $member = MemberAuthenticator::authenticate([
                  'Email'    => $email,
                  'Password' => $pwd
                ]
                ,
                $request
              );
              if ($member) {
                  $tokenData = $this->generateToken();

                  $tokenDBColumn  = $this->tokenConfig['DBColumn'];
                  $expireDBColumn = $this->tokenConfig['expireDBColumn'];

                  $member->{$tokenDBColumn}  = $tokenData['token'];
                  $member->{$expireDBColumn} = $tokenData['expire'];
                  $member->write();
                  // $member->login();
                  Security::setCurrentUser($member);
                  // print_r(Security::getCurrentUser());
              }
          }

          if (!$member) {
              $response['result']  = false;
              $response['message'] = 'Authentication fail.';
              $response['code']    = self::AUTH_CODE_LOGIN_FAIL;
          } else {
              // $isUser = $member->inGroup('fileshare-users');
              // $isAdmin = $member->inGroup('fileshare-admins');
              $group = $member->inGroup('fileshare-users')
                ?  $member->inGroup('fileshare-admins')
                  ? 'admin'
                  : 'user'
                : 'none';
              $response['result']   = true;
              $response['message']  = 'Logged in.';
              $response['code']     = self::AUTH_CODE_LOGGED_IN;
              $response['token']    = $tokenData['token'];
              $response['expire']   = $tokenData['expire'];
              $response['userID']   = $member->ID;
              $response['group']    = $group;
          }
      }

      return $response;
  }


  /**
   * Logout a user from framework
   * and update token with an expired one
   * if token owner class is a Member
   *
   * @param  HTTPRequest   $request    HTTP request containing 'email' var
   */
  public function logout(HTTPRequest $request)
  {
      $email = $request->requestVar('email');
      $member = Member::get()->filter(array('Email' => $email))->first();

      if ($member) {
          //logout
      $member->logout();

          if ($this->tokenConfig['owner'] === 'SilverStripe\Security\Member') {
              //generate expired token
        $tokenData = $this->generateToken(true);

        //write
        $tokenDBColumn  = $this->tokenConfig['DBColumn'];
              $expireDBColumn = $this->tokenConfig['expireDBColumn'];

              $member->{$tokenDBColumn}  = $tokenData['token'];
              $member->{$expireDBColumn} = $tokenData['expire'];
              $member->write();
          }
      }
  }


  /**
   * Sends password recovery email
   *
   * @param  HTTPRequest   $request    HTTP request containing 'email' vars
   * @return array                        'email' => false if email fails (Member doesn't exist will not be reported)
   */
  public function lostPassword(HTTPRequest $request)
  {
      $email = Convert::raw2sql($request->requestVar('email'));
      $member = DataObject::get_one('SilverStripe\Security\Member', "\"Email\" = '{$email}'");

      if ($member) {
          $token = $member->generateAutologinTokenAndStoreHash();

          $e = Member_ForgotPasswordEmail::create();
          $e->populateTemplate($member);
          $e->populateTemplate(array(
        'PasswordResetLink' => Security::getPasswordResetLink($member, $token)
      ));
          $e->setTo($member->Email);
          $e->send();
      }

      return array( 'done' => true );
  }


  /**
   * Return the stored API token for a specific owner
   *
   * @param  integer $id ID of the token owner
   * @return string      API token for the owner
   */
  public function getToken($id)
  {
      if ($id) {
          $ownerClass = $this->tokenConfig['owner'];
          $owner      = DataObject::get_by_id($ownerClass, $id);

          if ($owner) {
              $tokenDBColumn = $this->tokenConfig['DBColumn'];
              return $owner->{$tokenDBColumn};
          } else {
              user_error("API Token owner '$ownerClass' not found with ID = $id", E_USER_WARNING);
          }
      } else {
          user_error("RESTfulAPI_TokenAuthenticator::getToken() requires an ID as argument.", E_USER_WARNING);
      }
  }


  /**
   * Reset an owner's token
   * if $expired is set to true the owner's will have a new invalidated/expired token
   *
   * @param  integer $id      ID of the token owner
   * @param  boolean $expired if true the token will be invalidated
   */
  public function resetToken($id, $expired = false)
  {
      if ($id) {
          $ownerClass = $this->tokenConfig['owner'];
          $owner      = DataObject::get_by_id($ownerClass, $id);

          if ($owner) {
              //generate token
        $tokenData = $this->generateToken($expired);

        //write
        $tokenDBColumn  = $this->tokenConfig['DBColumn'];
              $expireDBColumn = $this->tokenConfig['expireDBColumn'];

              $owner->{$tokenDBColumn}  = $tokenData['token'];
              $owner->{$expireDBColumn} = $tokenData['expire'];
              $owner->write();
          } else {
              user_error("API Token owner '$ownerClass' not found with ID = $id", E_USER_WARNING);
          }
      } else {
          user_error("RESTfulAPI_TokenAuthenticator::resetToken() requires an ID as argument.", E_USER_WARNING);
      }
  }


  /**
   * Generates an encrypted random token
   * and an expiry date
   *
   * @param  boolean $expired Set to true to generate an outdated token
   * @return array            token data array('token' => HASH, 'expire' => EXPIRY_DATE)
   */
  private function generateToken($expired = false)
  {
      $life  = $this->tokenConfig['life'];

      if (!$expired) {
          $expire = time() + $life;
      } else {
          $expire = time() - ($life * 2);
      }

      $generator = new RandomGenerator();
      $tokenString = $generator->randomToken();

      $e = PasswordEncryptor::create_for_algorithm('blowfish'); //blowfish isn't URL safe and maybe too long?
    $salt = $e->salt($tokenString);
      $token = $e->encrypt($tokenString, $salt);

      return array(
      'token' => substr($token, 7),
      'expire' => $expire
    );
  }


  /**
   * Returns the DataObject related to the token
   * that sent the authenticated request
   *
   * @param  HTTPRequest          $request    HTTP API request
   * @return null|DataObject                     null if failed or the DataObject token owner related to the request
   */
  public function getOwner(HTTPRequest $request)
  {
      $owner = null;

    //get the token
    $token = $request->getHeader($this->tokenConfig['header']);
      if (!$token) {
          $token = $request->requestVar($this->tokenConfig['queryVar']);
      }

      if ($token) {
          $SQL_token = Convert::raw2sql($token);
          $owner = DataObject::get_one(
        // 'SilverStripe\Security\Member',
        $this->tokenConfig['owner'],
        "\"".$this->tokenConfig['DBColumn']."\"='" . $SQL_token . "'",
        false
      );
      // //
      // print_r('$this->tokenConfig[\'owner\']: ');
      // print_r($this->tokenConfig['owner']);
      // print_r('$this->tokenConfig[\'DBColumn\']: ');
      // print_r($this->tokenConfig['DBColumn']);
      // print_r('$owner: ');
      // print_r($owner);

          if (!$owner) {
              $owner = null;
          }
      }
      // print_r('$owner: ');
      // print_r($owner);
      return $owner;
  }


  /**
   * Checks if a request to the API is authenticated
   * Gets API Token from HTTP Request and return Auth result
   *
   * @param  HTTPRequest           $request    HTTP API request
   * @return true|RESTfulAPI_Error                True if token is valid OR RESTfulAPI_Error with details
   */
  public function authenticate(HTTPRequest $request)
  {
      //get the token
    $token = $request->getHeader($this->tokenConfig['header']);
      if (!$token) {
          $token = $request->requestVar($this->tokenConfig['queryVar']);
      }

      if ($token) {
          //check token validity
      return $this->validateAPIToken($token);
      } else {
          //no token, bad news
      return new RESTfulAPI_Error(403,
        'Token invalid.',
        array(
          'message' => 'Token invalid.',
          'code'    => self::AUTH_CODE_TOKEN_INVALID
        )
      );
      }
  }


  /**
   * Validate the API token
   *
   * @param  string                 $token    Authentication token
   * @return true|RESTfulAPI_Error            True if token is valid OR RESTfulAPI_Error with details
   */
  private function validateAPIToken($token)
  {
      //get owner with that token
    $SQL_token = Convert::raw2sql($token);
      $tokenColumn = $this->tokenConfig['DBColumn'];

      $tokenOwner = DataObject::get_one(
      $this->tokenConfig['owner'],
      "\"".$this->tokenConfig['DBColumn']."\"='" . $SQL_token . "'",
      false
    );

      if ($tokenOwner) {
          //check token expiry
      $tokenExpire  = $tokenOwner->{$this->tokenConfig['expireDBColumn']};
          $now          = time();
          $life         = $this->tokenConfig['life'];

          if ($tokenExpire > ($now - $life)) {
              // check if token should automatically be updated
        if ($this->tokenConfig['autoRefresh']) {
            $tokenOwner->setField($this->tokenConfig['expireDBColumn'], $now + $life);
            $tokenOwner->write();
        }
        //all good, log Member in
        if (is_a($tokenOwner, 'SilverStripe\Security\Member')) {
            # $tokenOwner->logIn();
            # this is a login without the logging
            $tokenOwner::session_regenerate_id();
            Session::set("loggedInAs", $tokenOwner->ID);
        }

              return true;
          } else {
              //too old
        return new RESTfulAPI_Error(403,
          'Token expired.',
          array(
            'message' => 'Token expired.',
            'code'    => self::AUTH_CODE_TOKEN_EXPIRED
          )
        );
          }
      } else {
          //token not found
      //not sure it's wise to say it doesn't exist. Let's be shady here
      return new RESTfulAPI_Error(403,
        'Token invalid.',
        array(
          'message' => 'Token invalid.',
          'code'    => self::AUTH_CODE_TOKEN_INVALID
        )
      );
      }
  }
}
