import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import chokidar from 'chokidar';

import KHashTable from './lib/utils/KHashTable';
import KDataTools from './lib/utils/KDataTools';
import KTableTools from '/lib./utils/KTableTools';
import KDataSourceDummy from '/lib./KDataSourceDummy';
import KMessage from '/lib./KMessage'
import KServerConstants from './lib/KServerConstants';
import KServerFileTools from './lib/KServerFileTools';

let server=null;

/**
 * 
 */
class KDataPortal {

  /**
   * 
   */
  constructor () {
    server=this;

    this.fileQueue=[];
 
    this.app = express();
    this.app.use(express.json());
    this.port = 8055;
    this.sessions = new KHashTable ();

    this.dataTools=new KDataTools ();
    this.tableTools=new KTableTools ();

    this.processRoot=this.processRoot.bind(this);
    this.processTablesGet=this.processTablesGet.bind(this);
    this.processDataGet=this.processDataGet.bind(this);
    this.processDataGetPage=this.processDataGetPage.bind(this);
    this.processUploadQueueGet=this.processUploadQueueGet.bind(this);
    this.processUploadQueueGet=this.processUploadQueueGet.bind(this);

    this.app.use(fileUpload());
    this.app.use(cors({ origin: '*' }));
    this.app.get('/',this.processRoot);
    this.app.get('/api/v1/ding',this.processDing);
    this.app.get('/api/v1/gettables',this.processTablesGet);
    this.app.get('/api/v1/getdata',this.processDataGet);
    this.app.get('/api/v1/getdatapage',this.processDataGetPage);
    this.app.post('/api/v1/upload', this.processFileUpload);       
    this.app.get('/api/v1/getuploadqueue',this.processUploadQueueGet);

    //this.watcher = chokidar.watch('/mnt/hgfs/incoming/data/kportal/', {
    this.watcher = chokidar.watch('~/kportal/', {
       ignored: /^\./, 
       persistent: true,
       awaitWriteFinish: true
     });
    this.watcher.on('add', function(path) {console.log('File', path, 'has been added');})
           .on('change', function(path) {console.log('File', path, 'has been changed');})
           .on('unlink', function(path) {console.log('File', path, 'has been removed');})
           .on('error', function(error) {console.error('Error happened', error);})
  }

  /**
   * 
   */
  processRoot (req,res) {
    console.log("processRoot ()");
    res.send(this.tableTools.getEmptyTable());    
  }

  /**
   * 
   */
  processTablesGet (req,res) {
    console.log("processTablesGet ()");

    res.setHeader('Access-Control-Allow-Origin', '*');

    let data=[];

    let maxTables=this.dataTools.getRandomInt (25);

    for (let i=0;i<maxTables;i++) {
      data.push (this.dataTools.makeid (15));
    }

    let reply=new KMessage (KMessage.STATUS_OK,data,null);

    reply.meta.command="gettables";

    res.send(reply.getMessageObject ());      
  }

  /**
   * 
   */
  processDataGet (req,res) {
    console.log("processDataGet ()");

    res.setHeader('Access-Control-Allow-Origin', '*');

    let session=req.query.session;
    let token=req.query.token;

    if (session==null) {
      let reply=new KMessage (KMessage.STATUS_ERROR,"Error: no session data provided in call",null);
      res.send(reply.getMessageObject ());
      return;
    }

    if (token==null) {
      let reply=new KMessage (KMessage.STATUS_ERROR,"Error: no token provided in call",null);
      res.send(reply.getMessageObject ());
      return;      
    }    

    let source=this.sessions.getItem (session);

    if (source==null) {
      source=new KDataSourceDummy ();

      this.sessions.setItem (session,source);    
    }

    let aMaxRows=req.query.maxRows;
    let aMaxCols=req.query.maxCols;

    if ((aMaxCols!=null) && (aMaxRows!=null)) {
      source.maxCols=parseInt (aMaxCols);
      source.maxRows=parseInt (aMaxRows);

      console.log ("Bound data generation to " + source.maxRows + " rows and " + source.maxCols + " columns");
    }

    source.getData ().then ((data) => {
      let reply=new KMessage (KMessage.STATUS_OK,data,null);

      reply.meta=source.getMeta ();
      reply.meta.command="getdata";

      res.send(reply.getMessageObject ());   
    });
  }

  /**
   * 
   */
  processDataGetPage (req,res) {
    console.log("processDataGetPage ()");

    res.setHeader('Access-Control-Allow-Origin', '*');    

    let session=req.query.session;
    let token=req.query.token;
    let page=req.query.page;

    if (session==null) {
      let reply=new KMessage (KMessage.STATUS_ERROR,"Error: no session data provided in call",null);
      res.send(reply.getMessageObject ());
      return;
    }

    if (token==null) {
      let reply=new KMessage (KMessage.STATUS_ERROR,"Error: no token provided in call",null);
      res.send(reply.getMessageObject ());
      return;      
    }

    if (page==null) {
      let reply=new KMessage (KMessage.STATUS_ERROR,"Error: no page number provided in call",null);
      res.send(reply.getMessageObject ());
      return;      
    }      

    let source=this.sessions.getItem (session);

    if (source==null) {      
      let reply=new KMessage (KMessage.STATUS_ERROR,"Error: no page argument provided",null);      
      res.send(reply.getMessageObject ());   
    } else {
      let aPage=parseInt(page);

      console.log ("Retrieving page: " + aPage);

      source.getPage (aPage).then ((data) => {
        let reply=new KMessage (KMessage.STATUS_OK,data,null);

        reply.meta=source.getMeta ();
        reply.meta.command="getdatapage";

        res.send(reply.getMessageObject ());   
      });
    }
  }

  /**
   * 
   */
  processUploadQueueGet (req,res) {
    //console.log("processUploadQueueGet ()");
    //console.log (this.fileQueue);

    let reply=new KMessage (KMessage.STATUS_OK,this.fileQueue,null);

    res.send(reply.getMessageObject ());     
  }

  /**
   * 
   */
  processDing (req,res) {
    //console.log("processDing ()");
    let reply=new KMessage (KMessage.STATUS_OK,"dong",null);
    res.send(reply.getMessageObject ());     
  }

  /**
   * https://www.npmjs.com/package/express-fileupload 
   * 
   * The req.files.foo object will contain the following:
   * 
   * req.files.foo.name: "car.jpg"
   * req.files.foo.mv: A function to move the file elsewhere on your server. Can take a callback or return a promise.
   * req.files.foo.mimetype: The mimetype of your file
   * req.files.foo.data: A buffer representation of your file, returns empty buffer in case useTempFiles option was set to true.
   * req.files.foo.tempFilePath: A path to the temporary file in case useTempFiles option was set to true.
   * req.files.foo.truncated: A boolean that represents if the file is over the size limit
   * req.files.foo.size: Uploaded size in bytes
   * req.files.foo.md5: MD5 checksum of the uploaded file
   * 
   */
  processFileUpload (req,res) {
    console.log("processFileUpload ("+req.files.kfiledata.name+")");

    let serverFileTools=new KServerFileTools ();

    console.log (req.files.kfiledata);
          
    let fileObject=serverFileTools.transferData(req.files.kfiledata);

    server.fileQueue.push (fileObject);

    let reply=new KMessage (KMessage.STATUS_OK,{},null);

    res.send(reply.getMessageObject ());
  }

  /**
   * 
   */
  run () {
    console.log ("Booting ...");
    this.app.listen(this.port, () => {
      console.log("Knossys data portal listening at http://localhost: " + this.port);
    });
  }
}

export default KDataPortal;
