# Passwordmanager

This passwordmanager is a progressive-web-app (PWA). It is able to store your passwords (safely) on a database or only on your local device.

**Warning:** This repository is not maintained any more!

## Used sources
- Angular 7 (https://angular.io/)
- Dexiejs (https://dexie.org/)
- Fontawesome (https://fontawesome.com/)
- angular/material-design (https://material.angular.io/)

## How are my passwords stored?
Each password has a encryption-key, whitch is used to decrypt the data. The key itself is encrypted with your master-password through the blowfish algorithm.
After decrypting the encryption-key, it is used, again through the blowfish algorithm, to decrypt the password-data.

## Database / API
A sample database/api implementation is provided here: https://github.com/m-thalmann/PasswordmanagerAPI<br>
You can either use it directly or implement one on your own.

## Using this repository

First of all you have to clone this repository. You will need to have nodejs and npm installed for the next command.
```
npm install -g @angular/cli   # install the angular-cli globally
npm install                   # this will install all of the dependencies
```
Then you can run the development server:

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
