<?php
/**
 * This is the implementation of the server side part of
 * Resumable.js client script, which sends/uploads files
 * to a server in several chunks.
 *
 * The script receives the files in a standard way as if
 * the files were uploaded using standard HTML form (multipart).
 *
 * This PHP script stores all the chunks of a file in a temporary
 * directory (`temp`) with the extension `_part<#ChunkN>`. Once all
 * the parts have been uploaded, a final destination file is
 * being created from all the stored parts (appending one by one).
 *
 * @author Gregory Chris (http://online-php.com)
 * @email www.online.php@gmail.com
 *
 * @editor Bivek Joshi (http://www.bivekjoshi.com.np)
 * @email meetbivek@gmail.com
 */

/*
* TODO: be sure to clean file names for dot and dashes to make
* sure you don't allow files to escape the tempory upload directory
* TODO: use resumableRelativePath to recreate folder structure on server
*/

namespace ResumableUpload;
/*
* TODO define constructor vars
*/
class ResumableUpload
{

  private $write_to_stream = false;
  private $tmp_stream = null;
  private $file_is_ready = false;
  private $upload_dir_path = '';
  private $temp_dir_path = '';
  private $log_dir_path = '';
  private $ID = '';
  private $fileName = '';
  private $chunkNum = '';
  private $chunkSize = '';
  private $totalSize = '';
  private $totalChunks = '';
  private $relativePath = '';
  private $absolutePath = '';

  function __construct(
    $isGet,
    $write_to_stream,
    $tmp_stream,
    $upload_dir_path,
    $temp_dir_path,
    $log_dir_path,
    $resumableIdentifier,
    $resumableFilename,
    $resumableChunkNumber,
    $resumableChunkSize,
    $resumableTotalSize,
    $resumableTotalChunks,
    $resumableRelativePath,
    $resumableIdentifier
  ) {
    $this->isGet = $isGet;
    $this->write_to_stream = $write_to_stream;
    $this->tmp_stream = $tmp_stream;
    $this->upload_dir_path = $upload_dir_path;
    $this->temp_dir_path = $temp_dir_path;
    $this->log_dir_path = $log_dir_path;
    $this->ID = $this->setEmptyOrString($resumableIdentifier);
    $this->fileName = $this->setEmptyOrString($resumableFilename);
    $this->chunkNum = $this->setEmptyOrString($resumableChunkNumber);
    $this->chunkSize = $resumableChunkSize;
    $this->totalSize = $resumableTotalSize;
    $this->totalChunks = $resumableTotalChunks;
    $this->relativePath = $resumableRelativePath;
    $this->resumableIdentifier = $resumableIdentifier;
  }

  public function file_is_ready() {
    return $this->file_is_ready;
  }

  public function getAbsolutePath() {
    // return realpath($this->$upload_dir_path . '/' . $this->relativePath);
    return realpath($this->upload_dir_path . '/' . $this->fileName);
  }

  public function getFileName() {
    return $this->fileName;
  }

  public function getStream() {
    return $this->tmp_stream;
  }

  public function getResumableIdentifier() {
    return $this->resumableIdentifier;
  }

  public function process() {
    //check if request is GET and the requested chunk exists or not.
    //this makes testChunks work
    if ($this->isGet) {
      $this->sendHeader();
    }

    // loop through files and move the chunks to a temporarily created directory
    if (!empty($_FILES)) foreach ($_FILES as $file) {

      // check the error status
      if ($file['error'] != 0) {
          $this->_log('error '.$file['error'].' in file '. $this->fileName);
          continue;
      }

      // init the destination file (format <filename.ext>.part<#chunk>
      // the file is stored in a temporary directory
      if ($this->ID != '') {
          $temp_dir = $this->temp_dir_path . '/' .   $this->ID;
      }
      $dest_file = $temp_dir.'/'.$this->fileName.'.part'.$this->chunkNum;

      // create the temporary directory
      if (!is_dir($temp_dir)) {
        mkdir($temp_dir, 0755, true);
      }

      // move the temporary file
      if (!move_uploaded_file($file['tmp_name'], $dest_file)) {
        $this->_log('Error saving (move_uploaded_file) chunk '
          . $this->chunkNum.' for file '. $this->fileName);
      } else {
          // check if all the parts present, and create the final destination file
        $fileCreated = $this->createFileFromChunks(
          $temp_dir,
          $this->fileName,
          $this->chunkSize,
          $this->totalSize,
          $this->totalChunks,
          $this->write_to_stream,
          $this->tmp_stream,
          $this->upload_dir_path
        );

        $this->file_is_ready = $fileCreated ? true : false;
      }
    }

  }

  protected function testChunk() {
    $temp_dir = $this->temp_dir_path . '/' . $this->ID;
    $chunk_file = $temp_dir . '/' . $this->fileName . '.part' . $this->chunkNum;
    return file_exists($chunk_file)?true:false;
  }

  protected function sendHeader() {
    if ($this->testChunk()) {
         header("HTTP/1.0 200 Ok");
    } else {
         header("HTTP/1.0 404 Not Found");
    }
    $temp_dir = $this->temp_dir_path . '/' . $this->ID;
    $chunk_file = $temp_dir . '/' . $this->fileName . '.part' . $this->chunkNum;
    $this->_log('Checking chunk_file: ' . $chunk_file, false);
  }

  protected function setEmptyOrString($string) {
    return  (
      ( ($string === null) && (trim($string) != '') )
      ? ''
      : $string
    );
  }


  /**
   *
   * Logging operation - to a file (upload_log.txt) and to the stdout
   * @param string $str - the logging string
   */
  protected function _log($str, $writeToFile = true) {

    if (!is_dir($this->log_dir_path)) {
      mkdir($this->log_dir_path, 0755, true);
    }

    // log to the output
    $log_str = date('d.m.Y').": {".print_r($str, true)."}\r\n";
    echo $log_str;

    // log to file
    if (($fp = fopen($this->log_dir_path.'/UPLOAD_log.txt', 'a+')) !== false) {
      fputs($fp, $log_str);
      fclose($fp);
    }
  }

  /**
   *
   * Delete a directory RECURSIVELY
   * @param string $dir - directory path
   * @link http://php.net/manual/en/function.rmdir.php
   */
  protected function rrmdir($dir) {
    if (is_dir($dir)) {
      $objects = scandir($dir);
      foreach ($objects as $object) {
        if ($object != "." && $object != "..") {
          if (filetype($dir . "/" . $object) == "dir") {
              $this->rrmdir($dir . "/" . $object);
          } else {
              unlink($dir . "/" . $object);
          }
        }
      }
      reset($objects);
      rmdir($dir);
    }
  }


  /**
   *
   * Check if all the parts exist, and
   * gather all the parts of the file together
   * @param string $temp_dir - the temporary directory holding all the parts of the file
   * @param string $fileName - the original file name
   * @param string $chunkSize - each chunk size (in bytes)
   * @param string $totalSize - original file size (in bytes)
   */
  protected function createFileFromChunks(
    $temp_dir,
    $fileName,
    $chunkSize,
    $totalSize,
    $total_files,
    $write_to_stream,
    $temp_stream,
    $destination_dir = ''
  ) {
      $success = false;

      // count all the parts of this file
      $total_files_on_server_size = 0;
      $temp_total = 0;
      foreach(scandir($temp_dir) as $file) {
          $temp_total = $total_files_on_server_size;
          $tempfilesize = filesize($temp_dir.'/'.$file);
          $total_files_on_server_size = $temp_total + $tempfilesize;
      }
      // check that all the parts are present
      // If the Size of all the chunks on the server is equal to the size of the file uploaded.
      if ($total_files_on_server_size >= $totalSize) {

        if ($write_to_stream) {
          // write chunks to stream
          // $temp_stream = fopen('php://temp', 'r+');
          for ($i=1; $i<=$total_files; $i++) {
            fwrite(
              $temp_stream,
              file_get_contents($temp_dir.'/'.$fileName.'.part'.$i)
            );
            $this->_log('writing chunk '.$i);
          }
          // rewind($temp_stream);
          // fpassthru($temp_stream);
          // fclose($temp_stream);
          $success = true;

        } else {
          // create the final destination file
          if (($fp = fopen($destination_dir.'/'.$fileName, 'w')) !== false) {
              for ($i=1; $i<=$total_files; $i++) {
                  fwrite(
                    $fp,
                    file_get_contents($temp_dir.'/'.$fileName.'.part'.$i)
                  );
                  $this->_log('writing chunk '.$i);
              }
              fclose($fp);
              $success = true;
          } else {
              $this->_log('cannot create the destination file');
              $success = false;
          }
      }

          // rename the temporary directory (to avoid access from other
          // concurrent chunks uploads) and than delete it
          if (rename($temp_dir, $temp_dir.'_UNUSED')) {
              $this->rrmdir($temp_dir.'_UNUSED');
          } else {
              $this->rrmdir($temp_dir);
          }

          return $success;
      }
  }

  public function getCleanFileName() {
    return $this->cleanFilename($this->getFileName());
  }

  protected function cleanFilename($str) {
    $unwanted_array = array(
      //accented characters
      'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A', 'Å'=>'A', 'Æ'=>'A',
      'Ç'=>'C',
      'Ð'=>'D',
      'È'=>'E', 'É'=>'E', 'Ê'=>'E', 'Ë'=>'E',
      'Ì'=>'I', 'Í'=>'I', 'Î'=>'I', 'Ï'=>'I',
      'Ñ'=>'N',
      'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ő'=>'O', 'Ö'=>'O', 'Ø'=>'O',
      'Ù'=>'U', 'Ú'=>'U', 'Û'=>'U', 'Ű'=>'U', 'Ü'=>'U',
      'ß'=>'S',
      'Ý'=>'Y',
      'à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a', 'å'=>'a', 'æ'=>'a',
      'Þ'=>'b',
      'ç'=>'c',
      'ð'=>'d',
      'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e',
      'ì'=>'i', 'í'=>'i', 'î'=>'i', 'ï'=>'i',
      'ñ'=>'n',
      'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ő'=>'o', 'ö'=>'o', 'ø'=>'o',
      'Ŕ'=>'R', 'ŕ'=>'r',
      'ù'=>'u', 'ú'=>'u', 'û'=>'u', 'ű'=>'u', 'ü'=>'u',
      'ý'=>'y', 'ý'=>'y', 'þ'=>'y', 'ÿ'=>'y',
      // quotation marks
      '`'=>"",
      '´'=>"",
      '„'=>'',
      '`'=>"",
      '´'=>"",
      '“'=>'',
      '”'=>'',
      '´'=>"",
      '"'=>'',
      '\''=>'',
      //other special characters
      '('=>'-',
      ')'=>'-',
      '!'=>'-',
      '$'=>'-',
      '?'=>'-',
      ':'=>'-',
      ' '=>'_',
      ','=>'',
      '&'=>'-',
      '+'=>'-',
      '/'=>'-',
      '\\'=>'-'
    );
    return strtr($str, $unwanted_array);
  }

}
