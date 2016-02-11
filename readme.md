# RadMail
### This process is aimed to help you build html emails a little quicker with hopefully a little less hassle.

So this thing is kinda hard to use at first. It's use is to be able to build emails the same way you would build a static web page.

It also has an option to use this strange but Rad template system so you can reuse components. 

Just remember, your working html file is ` <path-to-project>/src/index.html ` . If you use the template system it will build your html and place it in ` <path-to-project>/src/index.html ` .

_This is in beta, but it works for me_

### Requirements

1. node js _installed and available globally_
2. gulp js _installed and available globally_
3. Basic knowledge of the command line
4. AMMPS, or sometype of local webserver _Only for browser sync to work_


### Getting Started

1. Setup the repo locally
    - ``` $ mkdir radmail ```
    - ``` $ cd radmail ```
    - ``` $ git clone https://github.com/mrnatelantz/radmail.git . ```
2. Setup gulp/npm packages
    - ``` $ npm install ```
    - _You may need to use sudo with npm if you get permission errors_
    - ``` $ sudo npm install ```
3. Add your files
    - The src folder is where all source files go
    - Inside src you will find index.html, css folder, and img folder
    - Add your code to the index.html file just like normal
    - Add your css to the css/styles.css file like normal
    - Add your images to the img folder, yup just like normal
    - The above steps are not too hard but it is very important that you do not change the index.html file name or the other folder names.
    - CSS, you can either put your styles in the head of the document or link to your css in the head. It does not matter.



### Using gulp

gulp is kinda like an extension to node that lets you do hard things a little easier. All of the gulp tasks available are located in gulpfile.js


1. Build _was inline_
    - ``` $ gulp build ```
    - This will inline all of your css by creating a new html file and saving it in build/index.html
    - All previous css refences in the head will be removed. ``` <link> ``` , ``` <style> ```
    - If you have media queries in your css they will be added the head of the html file
    - If you have a vendor.css it will be added to the head of the html file
    - After html file has been built it will prettify the code for you
2. Package
    - ``` $ gulp package -n <rad-name-for-an-email> ```
    - This will take the index.html file in the build folder and all of the images in src/img and create a zip with the name you enter
    - The packaged files will be saved in the folder package/
    - If you don't choose a file name, it will be named package.zip
    - This will run the Build task before packaging anything
3. Browser Sync
    - ``` $ gulp browser-sync ```
    - You may need some additional setup to get this working. By default it will proxy a local domain through http://localhost:3000
    - This will host your files in the src folder
4. Stream
    - ``` $ gulp stream ```
    - This needs uses the browser-sync task and another one to host your files and watch for changes. When a css file is changed locally, it will also update the browser without reloading it.
    - This will also watch for changes made to css files in the src folder
    - Coolest feature is you can give someone else your external link that it gives you when it starts and they can view your changes live without needing to reload the browser!
5. Litmus
    - ``` $ gulp litmus ```
    - Make sure you have ran ``` $ gulp inline ``` at least once before you do this!
    - Litmus will take the title of the html and use it as the name of the test ``` <title>RadMail01456</title> ```
    - This will create a new litmus test with the index.html file located in the build/ folder
    - To change the email clients to test you will need to edit the task found in gulpfile.js
    - Here is a list of email clients to test <https://your.litmus.com/emails/clients.xml>
    - _You may need to be logged in to view this link_
    - The above link returns an xml file with the available email clients. The easiest way to find what your looking for is by searching the page ``` cmd + f ```
    - The xml tag that holds the email client code looks like this ``` <application_code>chromegmailnew</application_code> ```
    - Dont send too many test back to back. Just because it's an api it does not mean litmus is any faster.
    - After you create a new test with gulp, you can login to litmus to download the test results/screenshot
    - This will run the Build task first to make sure there is a html file to be sent
6. CSS Lint
    - ``` $ gulp csslint ```
    - Runs a css linter on your style sheets and displays any errors found in the terminal
    - Errors will be in red
    - CSS rule can be configured in the gulpfile.js  https://www.npmjs.com/package/gulp-csslint
7. Load Template
    - ``` $ gulp load-template -c <client> -b <branch> ```
    - If you run this without any arguments it will show a list of available templates to load
    - All repo url's are preloaded in the gulpfile.js, no need to specify the full url _plus it won't work_
    - Don't push changes made to the template files back to the repo.
    - These templates are meant to be a base structure and not a complete package
8. Template
    - ``` $ gulp template ```
    - If you choose to use templates you can use the template engine for partials
    - More on the template engine below
    - ** Warning ** This will delete everything in the src/template directory
9. Update Template
    - ``` $ gulp update-template -c <client> -b <branch> ```
    - If you run this without arguments it won't pull anything. It will run ``` $ git remote show origin ``` which will show information about your template's origin and tracked branches
    - Run the ``` $ gulp load-template ``` to see the list of templates


## Template Engine

#### Reference Sheet

| Subject                   |  Description                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Template                  | A set of HTML and CSS that sets the base styles and structure of the email              |
| Template Engine           | The mechanism that processes partial stubs into html                                    |
| Partial Stub              | ``` <!-- -partial:my_header -title:Rad Title -subtitle:A rad way to pass content --> ```   |
| Partial Stub Sytnax, Why?  | Partial stubs use the html comment syntax as the holder for the arguments. This way if something gets missed, and the partial stub doesn't get process the output will never get seen and hopefully not dispalyed as code like other templating engines. Ex: {{ -partial:my_header  }} would result in ugly code being displayed if it were not processed by mistake |
| Partial Stub Syntax, The Parser  | Each attribute is started with a "-" . This tells the parser where the start of a new attribute begins. Each attribute will also have a ":" between the key and the value (Just like JSON object). The string to the left of the ":" is the key and the string to the right of the ":" is the value. Do not include a ":" in your value it will cause issues with the parser, and more than likely your data will either be cut off or out of order. |
| Partial Stub Syntax, Attributes  | The only required attribute is ``` -partial:my_header ```  This tells the the template engine what file to use. You do not need to add the file extension in the attribute Ex: ``` -partial:my_header.html ``` is not needed, and it will not work because my_header.html.html will more than likely not be found. Attributes can be broken in to multiple lines, but the partial attribute needs to be on the same line as the opening html comment tag. |
| Partials, Location        | Partials are html files located in a template in the partials folder. |
| Partials, Why?            | Partials are meant to be a way to reuse html snippets in a clean and organized way. They also provide structure so all of our emails can be made in the same way |
| Partials Syntax, Overview | Partials use modified html comments to process content from the partial stub. Example of a title in a h1 tag:  ``` <h1><!-- value:title --></h1> ``` Since partials only output content and do not provide any logic the syntax can be simplified. "-" dashes are not needed |
| Partials Syntax, Output   | Inside the comment tag there will be one attribute with a key and a value that relates to the partial stub that is passing the data to it. ``` <!-- value:title --> ``` tells the parser that the partial stub calling this partial can output the value for the attribute with the key of title in the partial stub. This may sound a lot more difficult than it really is. EXample: Partial stub ``` <!-- -partial:my_header -title:Rad Email --> ``` , Now in the html partial my_header.html ``` <h1><!-- value:title --></h1> ``` This will put "Rad Email" inside a h1 tag. Anything you put in a value will get used in the partial. Raw html is ok!|
| Partials, When to use?    | There is a time and a place for everything. Partials are good for replacing repetitive html sections. For example, if you have multiple ads or touts that have the same html just different content, then partials would be great for them. If you have a large section of code that you don't feel like looking at you could stick it in a partial to have a cleaner base template to work with. |
| Partials, Dont's          | As of right now partials can not be nested. Meaning you can not place a partial stub inside of a html partial. (Not tested or tried, idk might work) Even if this worked it might be bad practice since it could make it very hard to maintain. This template engine was made to be very simple and not complex, nesting could lead you down a road you would not wantto go down. |
| Partials, Reserved Chars  | "-" and ":" cannot be used due to the way the template engine parses the template. Use html entities instead, you should be using them anyways! ``` :  is &#58; ``` and ``` - is &#8211; ``` |
| Partials, Urls            | Urls normally need to have : in them and not a html entity. It's cool, you can you the html entity in the partial stub and the parser will replace it with a ":" . Example:  ``` http&#58;//someplace.com/images.png ``` . This should work |


### Bugs

If you run across problems that you think are or could be a bug, create a new issue for it.