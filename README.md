# [![vanTalk Logo](http://115.29.206.70/assets/vanTalk_logo_s.png)](http://115.29.206.70:3000/)

#vanTalk

One Realtime Chatting WebApp

##What is vanTalk?
vanTalk is one realtime online chatting webapp. The original idea is coming out after reading the book
"Single Page Web Applications: JavaScript end-to-end". Based on the prototype presented in the book.
Several enhancements are implemented in this first publish version, as following:

* user signin and signup
* user password reset or update
* friend search and invitation
* friendly online status notification

##Installation and Run
1. using [npm](http://npmjs.org) to install all dependent modules in package.json

        npm install -g nodemon

2. run the vanTalk

        node app.js

3. open the browser, direct to http://localhost:3000, the webapp is running.

4. signup one user and enjoy yourself.

After you sign up and invite few friends, you most likely get a similar view as following, the circular flag in the top-left corner of each avatar indicates each person's status, the orange one is the current user, the grey one indicates the friend is offline, green one indicates the friend is online, and the red semi-circular means the friend is the current chatee. 

# ![vanTalk ScreenShot](http://115.29.206.70/assets/vantalk_chat_s.png)

##Configuration

The configuration file is config.js under ./lib directory, mainly including following options:

*  port : the server listening port, default is '3000'.
*  database : MongoDB database path and name, default is 'mongodb://localhost:27017/spa'.
*  cookieMaxage : cookie max-age, default is 3600000, one hour.
*  sessionSecret : session secret string, default is 'vanTalk@v0.0.1'.
*  sessionName : session name, default is 'vanTalk'.

Above five options are all have default options, and you can run vanTalk even without caring them, and sure it will be OK.
While for following three, you must config them to your own ones if you want to reset your password. These three options
are all for [nodemailer](http://nodemailer.com/) transporter, you can send info by email only when you config them.

*  transportService  : this is your email service provider, such as 'Gmail', 'Yahoo', 'QQ', '126' etc. All well-known
   services are [here](https://github.com/andris9/nodemailer-wellknown/blob/master/services.json).
*  transportAuthUser : this is your admin email address, which will be used to send reminder infos to the user, such as
   password reset link and other infos.
*  transportAuthPass : this is your admin email password. Note, this is not the login password, it is the password
   for email app.

##Author Contact

Any question or issue, welcome your emails to llwanghong at gmail.com
