# Servicenow-Record-Lister

[![Code Climate](https://codeclimate.com/github/dushyant89/Servicenow-Record-Lister/badges/gpa.svg)](https://codeclimate.com/github/dushyant89/Servicenow-Record-Lister)
[![Issue Count](https://codeclimate.com/github/dushyant89/Servicenow-Record-Lister/badges/issue_count.svg)](https://codeclimate.com/github/dushyant89/Servicenow-Record-Lister)

This project is about listing important records in *servicenow* in a chrome extension. The type of records listed in the extension are as below
* Problem Tasks
* Knowledge Articles
* Stories
* Tasks
* Fix Targets

## How does it works
* After you have installed the extension go to any page on service-now.com, let's say hi.service-now.com or any of the nightly instances as well.
* Click on the extension and a pop-up will appear.
* In the log-in form inside the popup, enter the credentials which are used to login to *hi.service-now.com* or the specific instance being used.
* Once logged in the extension will list the different records which are there on the page with some metadata for each type of record.

## Installation
![Download zip](http://i.imgur.com/ojHU9Xj.png)
* Click on the **Download Zip** button as show in the image above. This will download the project as a .zip file.
* Now extract the contents from the .zip file using any tool which your OS has.
* Now open a new tab in your chrome browser and type this url *chrome://extensions*. The page will look something like below
![Load extension](http://i.imgur.com/4k0xmMe.png)
* Make sure that you have checked the *Developer mode* checkbox in the top right corner. Once loaded, the extension is ready to use.
* You can see the red *now* logo on the browser toolbar as below and to use the extension just click on the logo.
![Extension logo](http://i.imgur.com/5mUEByF.png)

## Note
The extension only works if the domain has a pattern *.servicenow-now.com (obviously). 
