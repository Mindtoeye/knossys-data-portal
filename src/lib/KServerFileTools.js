
import KServerConstants from './KServerConstants';

/**
 * 
 */
class KServerFileTools {
  
  /**
   * 
   */
  transferData (anUploadObject) {
    console.log("transferData ()");

    let fileObject={
      name: anUploadObject.name,
      type: anUploadObject.mimetype,
      size: anUploadObject.size,
      md5: anUploadObject.md5,
      state: KServerConstants.STATE_WAITING
    };

    return (fileObject);
  }  

  /**
   * 
   */
  stateToString (aState) {
    if (aState == KServerConstants.STATE_WAITING) {
      return ("Waiting");
    }

    if (aState == KServerConstants.STATE_PROCESSING) {
      return ("Processing");
    }

    if (aState == KServerConstants.STATE_PROCESSED) {
      return ("Processed");
    }

    if (aState == KServerConstants.STATE_ERROR) {
      return ("Error");
    }            

    return ("Unknown");
  }
}

export default KServerFileTools;