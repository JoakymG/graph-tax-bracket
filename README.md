# Instructions

Typescript and parcel package are not in package.json bydefault
It is recommended to install those package globally because of their large size (~30MB typescript & ~80Mb parcel)

Install globally

`npm install --global typescript`

OR

Install in dev dependency

`npm install --save-dev typescript`

Same with parcel bundler

`npm install --global parcel-bundler`

OR

Install in dev dependency

`npm install --save-dev parcel-bundler`

After installing those packages, run the scripts in package.json

`npm run start:dev` for developpement

`npm run build` to build the app
