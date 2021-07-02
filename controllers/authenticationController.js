const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Authentication = require("../models/Authentication");
const { mail } = require("../helpers/mail");

const createAndSendConfirmationTokenMail = async (email, type) => {
    const token = jwt.sign({ email }, process.env.SECRET_KEY);
    await Authentication.create({
        email,
        token,
        type,
    });

    await mail({
        from: `IFIX < Team >`,
        to: email,
        html:
            type === "register-confirmation"
                ? confirmationEmailTemplate(email, token)
                : resetPasswordTemplate(email, token),
        subject:
            type === "register-confirmation"
                ? "IFix account confirmation"
                : "IFix password reset",
    });
};

const confirmAccount = async (req, res) => {
    const { email, token } = req.query;
    const account = await Authentication.findOne({
        email,
        token,
        type: "register-confirmation",
    }).sort({ createdAt: -1 });

    if (account) {
        // check if is more than 1 hour
        const created_at_time = new Date(account.createdAt).getTime();

        const now_time = new Date().getTime();
        console.log((now_time - created_at_time) / (1000 * 60 * 60));
        if ((now_time - created_at_time) / (1000 * 60 * 60) > 1) {
            return res.status(400).json({ msg: "token expired" });
        }

        // activate user account
        const user = await User.findOne({ email });
        user.status = "active";
        user.save();

        // delete token after activation
        await Authentication.deleteMany({email});

        return res.status(200).json({ msg: "account activated successfully" });
    }

    return res.status(404).json({ msg: "not found" });
};

const forgotPassword = async (email, type) => {
    if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
        await createAndSendConfirmationTokenMail(email, "password-reset");
    }
};

const checkResetToken = async (req, res) => {
    const { email, token } = req.query;
    const account = await Authentication.findOne({
        email,
        token,
        type: "password-reset",
    }).sort({ createdAt: -1 });

    if (account) {
        // check if is more than 1 hour
        const created_at_time = new Date(account.createdAt).getTime();

        const now_time = new Date().getTime();
        if ((now_time - created_at_time) / (1000 * 60 * 60) > 1) {
            return res.status(400).json({ msg: "token expired" });
        }

        return res.status(200).json({ msg: "valid-token" });
    }

    return res.status(404).json({ msg: "not found" });
};

const resetPassword = async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        user.passwordHash = passwordHash;

        user.save();

        // remove tokens 
        await Authentication.deleteMany({email});

        return res.status(200).json({ msg: "password reset" });
    }

    return res.status(400).send("error");
};

const confirmationEmailTemplate = (email, token) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <style type="text/css">
            @media screen {
                @font-face {
                    font-family: 'Lato';
                    font-style: normal;
                    font-weight: 400;
                    src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
                }
    
                @font-face {
                    font-family: 'Lato';
                    font-style: normal;
                    font-weight: 700;
                    src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
                }
    
                @font-face {
                    font-family: 'Lato';
                    font-style: italic;
                    font-weight: 400;
                    src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
                }
    
                @font-face {
                    font-family: 'Lato';
                    font-style: italic;
                    font-weight: 700;
                    src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
                }
            }
    
            /* CLIENT-SPECIFIC STYLES */
            body,
            table,
            td,
            a {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
    
            table,
            td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }
    
            img {
                -ms-interpolation-mode: bicubic;
            }
    
            img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
            }
    
            table {
                border-collapse: collapse !important;
            }
    
            body {
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
            }
    
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }
    
            @media screen and (max-width:600px) {
                h1 {
                    font-size: 32px !important;
                    line-height: 32px !important;
                }
            }
    
            div[style*="margin: 16px 0;"] {
                margin: 0 !important;
            }
        </style>
    </head>
    
    <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
        <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account. </div>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td bgcolor="#FFA73B" align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                        <tr>
                            <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td bgcolor="#FFA73B" align="center" style="padding: 0px 10px 0px 10px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                        <tr>
                            <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                                <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Welcome!</h1> <img src=" https://img.icons8.com/clouds/100/000000/handshake.png" width="125" height="120" style="display: block; border: 0px;" />
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                        <tr>
                            <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" align="left">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td align="center" style="border-radius: 3px;" bgcolor="#FFA73B"><a href="${process.env.CLIENT_ORIGIN}/account-activation?email=${email}&token=${token}" target="_blank" style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #FFA73B; display: inline-block;">Confirm Account</a></td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr> 
                        <tr>
                            <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                            </td>
                        </tr> 
                        <tr>
                            <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0;"><a href="#" target="_blank" style="color: #FFA73B;">${process.env.CLIENT_ORIGIN}/account-activation?email=${email}&token=${token}</a></p>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0;">If you have any questions, just reply to this email—we're always happy to help out.</p>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                <p style="margin: 0;">Cheers,<br>IFix Team</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    
    </html>`;
};

const resetPasswordTemplate = (email, token) => {
    return `<!doctype html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
      <!-- NAME: 1 COLUMN -->
      <!--[if gte mso 15]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        <![endif]-->
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Reset Your Lingo Password</title>
      <!--[if !mso]>
          <!-- -->
      <link href='https://fonts.googleapis.com/css?family=Asap:400,400italic,700,700italic' rel='stylesheet' type='text/css'>
      <!--<![endif]-->
      <style type="text/css">
        @media only screen and (min-width:768px){
              .templateContainer{
                  width:600px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              body,table,td,p,a,li,blockquote{
                  -webkit-text-size-adjust:none !important;
              }
      
      }   @media only screen and (max-width: 480px){
              body{
                  width:100% !important;
                  min-width:100% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              #bodyCell{
                  padding-top:10px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnImage{
                  width:100% !important;
              }
      
      }   @media only screen and (max-width: 480px){
             
       .mcnCaptionTopContent,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer{
                  max-width:100% !important;
                  width:100% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnBoxedTextContentContainer{
                  min-width:100% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnImageGroupContent{
                  padding:9px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnCaptionLeftContentOuter
       .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
                  padding-top:9px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnImageCardTopImageContent,.mcnCaptionBlockInner
       .mcnCaptionTopContent:last-child .mcnTextContent{
                  padding-top:18px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnImageCardBottomImageContent{
                  padding-bottom:9px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnImageGroupBlockInner{
                  padding-top:0 !important;
                  padding-bottom:0 !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnImageGroupBlockOuter{
                  padding-top:9px !important;
                  padding-bottom:9px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnTextContent,.mcnBoxedTextContentColumn{
                  padding-right:18px !important;
                  padding-left:18px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
                  padding-right:18px !important;
                  padding-bottom:0 !important;
                  padding-left:18px !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcpreview-image-uploader{
                  display:none !important;
                  width:100% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              h1{
                  font-size:20px !important;
                  line-height:150% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              h2{
                  font-size:20px !important;
                  line-height:150% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              h3{
                  font-size:18px !important;
                  line-height:150% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              h4{
                  font-size:16px !important;
                  line-height:150% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              .mcnBoxedTextContentContainer
       .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
                  font-size:16px !important;
                  line-height:150% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              #templatePreheader{
                  display:block !important;
              }
      
      }   @media only screen and (max-width: 480px){
              #templatePreheader .mcnTextContent,#templatePreheader
       .mcnTextContent p{
                  font-size:12px !important;
                  line-height:150% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              #templateHeader .mcnTextContent,#templateHeader .mcnTextContent p{
                  font-size:16px !important;
                  line-height:150% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              #templateBody .mcnTextContent,#templateBody .mcnTextContent p{
                  font-size:16px !important;
                  line-height:150% !important;
              }
      
      }   @media only screen and (max-width: 480px){
              #templateFooter .mcnTextContent,#templateFooter .mcnTextContent p{
                  font-size:12px !important;
                  line-height:150% !important;
              }
      
      }
      </style>
    </head>
    
    <body style="-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     background-color: #fed149; height: 100%; margin: 0; padding: 0; width: 100%">
      <center>
        <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" id="bodyTable" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust:
     100%; background-color: #fed149; height: 100%; margin: 0; padding: 0; width:
     100%" width="100%">
          <tr>
            <td align="center" id="bodyCell" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; border-top: 0;
     height: 100%; margin: 0; padding: 0; width: 100%" valign="top">
              <table border="0" cellpadding="0" cellspacing="0" class="templateContainer" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; max-width:
     600px; border: 0" width="100%">
                <tr>
                  <td id="templatePreheader" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #fed149;
     border-top: 0; border-bottom: 0; padding-top: 16px; padding-bottom: 8px" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" class="mcnTextBlock" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     min-width:100%;" width="100%">
                      <tbody class="mcnTextBlockOuter">
                        <tr>
                          <td class="mcnTextBlockInner" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%" valign="top">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnTextContentContainer" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust:
     100%; min-width:100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td class="mcnTextContent" style='mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; word-break: break-word;
     color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 12px;
     line-height: 150%; text-align: left; padding-top:9px; padding-right: 18px;
     padding-bottom: 9px; padding-left: 18px;' valign="top">
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td id="templateHeader" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f7f7ff;
     border-top: 0; border-bottom: 0; padding-top: 16px; padding-bottom: 0" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" class="mcnImageBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     min-width:100%;" width="100%">
                      <tbody class="mcnImageBlockOuter">
                        <tr>
                          <td class="mcnImageBlockInner" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding:0px" valign="top">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust:
     100%; min-width:100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td class="mcnImageContent" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-right: 0px;
     padding-left: 0px; padding-top: 0; padding-bottom: 0; text-align:center;" valign="top">
                                    <a class="" href="#" style="mso-line-height-rule:
     exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color:
     #f57153; font-weight: normal; text-decoration: none" title="">
                                      <a class="" href="#" style="mso-line-height-rule:
     exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; color:
     #f57153; font-weight: normal; text-decoration: none" title="">
                                        <img align="center" alt="Forgot your password?" class="mcnImage" src="https://static.lingoapp.com/assets/images/email/il-password-reset@2x.png" style="-ms-interpolation-mode: bicubic; border: 0; height: auto; outline: none;
     text-decoration: none; vertical-align: bottom; max-width:1200px; padding-bottom:
     0; display: inline !important; vertical-align: bottom;" width="600"></img>
                                      </a>
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td id="templateBody" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #f7f7ff;
     border-top: 0; border-bottom: 0; padding-top: 0; padding-bottom: 0" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" class="mcnTextBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                      <tbody class="mcnTextBlockOuter">
                        <tr>
                          <td class="mcnTextBlockInner" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%" valign="top">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnTextContentContainer" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust:
     100%; min-width:100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td class="mcnTextContent" style='mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; word-break: break-word;
     color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 16px;
     line-height: 150%; text-align: center; padding-top:9px; padding-right: 18px;
     padding-bottom: 9px; padding-left: 18px;' valign="top">
    
                                    <h1 class="null" style='color: #2a2a2a; font-family: "Asap", Helvetica,
     sans-serif; font-size: 32px; font-style: normal; font-weight: bold; line-height:
     125%; letter-spacing: 2px; text-align: center; display: block; margin: 0;
     padding: 0'><span style="text-transform:uppercase">Forgot</span></h1>
    
    
                                    <h2 class="null" style='color: #2a2a2a; font-family: "Asap", Helvetica,
     sans-serif; font-size: 24px; font-style: normal; font-weight: bold; line-height:
     125%; letter-spacing: 1px; text-align: center; display: block; margin: 0;
     padding: 0'><span style="text-transform:uppercase">your password?</span></h2>
    
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" class="mcnTextBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace:
     0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     min-width:100%;" width="100%">
                      <tbody class="mcnTextBlockOuter">
                        <tr>
                          <td class="mcnTextBlockInner" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%" valign="top">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnTextContentContainer" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust:
     100%; min-width:100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td class="mcnTextContent" style='mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; word-break: break-word;
     color: #2a2a2a; font-family: "Asap", Helvetica, sans-serif; font-size: 16px;
     line-height: 150%; text-align: center; padding-top:9px; padding-right: 18px;
     padding-bottom: 9px; padding-left: 18px;' valign="top">Not to worry, we got you! Let’s get you a new password.
                                    <br></br>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonBlock" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     min-width:100%;" width="100%">
                      <tbody class="mcnButtonBlockOuter">
                        <tr>
                          <td align="center" class="mcnButtonBlockInner" style="mso-line-height-rule:
     exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     padding-top:18px; padding-right:18px; padding-bottom:18px; padding-left:18px;" valign="top">
                            <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                              <tbody class="mcnButtonBlockOuter">
                                <tr>
                                  <td align="center" class="mcnButtonBlockInner" style="mso-line-height-rule:
     exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     padding-top:0; padding-right:18px; padding-bottom:18px; padding-left:18px;" valign="top">
                                    <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     border-collapse: separate !important;border-radius: 48px;background-color:
     #F57153;">
                                      <tbody>
                                        <tr>
                                          <td align="center" class="mcnButtonContent" style="mso-line-height-rule:
     exactly; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;
     font-family: 'Asap', Helvetica, sans-serif; font-size: 16px; padding-top:24px;
     padding-right:48px; padding-bottom:24px; padding-left:48px;" valign="middle">
                                            <a class="mcnButton" href="${process.env.CLIENT_ORIGIN}/password-reset?email=${email}&token=${token}" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; display: block; color: #f57153;
     font-weight: normal; text-decoration: none; font-weight: normal;letter-spacing:
     1px;line-height: 100%;text-align: center;text-decoration: none;color:
     #FFFFFF; text-transform:uppercase;" target="_blank" title="Review Lingo kit
     invitation">Reset password</a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" class="mcnImageBlock" style="border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; min-width:100%;" width="100%">
                      <tbody class="mcnImageBlockOuter">
                        <tr>
                          <td class="mcnImageBlockInner" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding:0px" valign="top">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="border-collapse: collapse; mso-table-lspace: 0;
     mso-table-rspace: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust:
     100%; min-width:100%;" width="100%">
                              <tbody>
                                <tr>
                                  <td class="mcnImageContent" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-right: 0px;
     padding-left: 0px; padding-top: 0; padding-bottom: 0; text-align:center;" valign="top"></td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td id="templateFooter" style="mso-line-height-rule: exactly;
     -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; background-color: #fed149;
     border-top: 0; border-bottom: 0; padding-top: 8px; padding-bottom: 80px" valign="top">
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </body>
    
    </html>`;
};

module.exports = {
    createAndSendConfirmationTokenMail,
    confirmAccount,
    forgotPassword,
    checkResetToken,
    resetPassword,
};
