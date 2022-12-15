
import KDataTools from './utils/KDataTools';

/**
 *
 */
class KMessage {

  static STATUS_OK=0;
  static STATUS_ERROR=1;
  static STATUS_UNKNOWN=2;
  static STATUS_PENDING=3;

  /**
   *
   */
  constructor (aStatus,aData,aMessage) {
    this.dataTools=new KDataTools ();

    this.status=KMessage.STATUS_PENDING;
    this.data=null;
    this.message="";
    this.meta={};
    this.timestamp=this.dataTools.getDateString ();

    if (aStatus) {
      this.status=aStatus;
    }

    if (aData) {
      this.data=aData;
    }

    if (aMessage) {
      this.message=aMessage;
    }
  }

  /**
   *
   */
  getStatus () {
    return (this.status);
  }

  /**
   *
   */
  setStatus (aValue) {
    this.status=aValue;
  }

  /**
   *
   */
  getMessage () {
    return (this.message);
  }

  /**
   *
   */
  setMessage (aValue) {
    this.message=aValue;
  }  

  /**
   *
   */
  getData () {    
    return (this.data);
  }

  /**
   *
   */
  setData (aValue) {
    this.data=aValue;
  }

  /**
   *
   */
  getMeta () {    
    return (this.meta);
  }

  /**
   *
   */
  setMeta (aValue) {
    this.meta=aValue;
  }

  /**
   *
   */
  getMessageObject () {
    return ({
      status: this.status,
      message: this.message,
      data: this.data,
      meta: this.meta,
      timestamp: this.timestamp
    });    
  }

  /**
   * 
   */
  fromMessageObject (aData,aMeta) {
    this.data=aData;
    this.meta=aMeta;
  }
}

export default KMessage;
