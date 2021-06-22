const express = require("express");
const AWS = require("aws-sdk");
const awsConfig = require("./config-aws");
const uuid = require("uuid");
const app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Listening at port ${PORT}`));

AWS.config.update({ region: awsConfig.region });

const S3_BUCKET = awsConfig.bucketName;
const s3 = new AWS.S3({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
  signatureVersion: "v4",
  //   useAccelerateEndpoint: true
});

const getPresignedUrl1 = (req, res) => {
 const returnData1 = {
                      success: true,
                      message: "Url generated",
    };
    return res.status(200).json(returnData1);  
  };

const getPresignedUrl = (req, res) => {
  let fileType = req.body.fileType;
  let fileName = req.body.fileName;
  let isExtRequired = req.body.isextrequired;
  let path = req.body.path;
  let buck = S3_BUCKET;
 
  
  if (isExtRequired != "false"){
      fileName = path +"/"+ fileName + fileType;
  }else{
      fileName = path +"/"+ fileName;
      buck = "feetapart-img";
  }
    
  
  if (fileType != ".jpg" && fileType != ".png" && fileType != ".jpeg") {
    return res
      .status(403)
      .json({ success: false, message: "Image format invalid" });
  }

  fileType = fileType.substring(1, fileType.length);

  //const fileName = uuid.v4();
  const s3Params = {
    Bucket: buck,
    Key: fileName,
    Expires: 60 * 60,
    ContentType: "image/" + fileType,
    ACL: "public-read",
  };

  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.end();
    }
    
    const returnData = {
      success: true,
      message: "Url generated",
      uploadUrl: data,
      downloadUrl:
        `https://${S3_BUCKET}.s3.amazonaws.com/` + fileName,
    };
    return res.status(201).json(returnData);  
  });
};

app.post("/generatePresignedUrl", (req, res) => getPresignedUrl(req, res));
app.get("/", (req, res) => getPresignedUrl1(req, res));
