# Tour e-commerce. Server & Site.

Lovely project to implement every Node js feature i've learned. App running locally. 

Clone the main branch repo and run:

  - `npm install` to download all dependencies.
  - `npm start` to run server with nodemon.
  - `npm run watch:js` to run parcel bundler for a dev bundle or `npm run build:js` for a production compressed bundle.

localhost is going  to be at: [Local-Host:](http://127.0.0.1:3000/) 'http://127.0.0.1:3000/'

Live version at: [https://fran-tours-54d8a602e684.herokuapp.com/](https://fran-tours-54d8a602e684.herokuapp.com/)
 
## Tours server. Implementing MVC architechture and server-side rendering

A Nodejs server. Modern style. 
  - MVC architechture
  - MongoDB as a NOSQL database
  - [Mongoose](https://mongoosejs.com/) library for mongoDB manipulation.
  - [Express js](https://expressjs.com/) framework for routing and midddleware stack
  - Local Authentication using best practices.
  - Server-side rendering with [Pug](https://pugjs.org/api/getting-started.html).
  - [Stripe](https://stripe.com/) ramp for purchases.
  - [Mapbox](https://www.mapbox.com/) as the primary tool for rendering maps
  - [Nodemailer](https://nodemailer.com/) module to handle application email messages.
  - [SendGrid](https://sendgrid.com/) for mail delivery.

Data model using references.

### Features: 

API and Website. 

API:
  - CRUD on tours.
  - aggregation pipelines on tours - get statistics - set monthly plan
  - CRUD on USER (as admin)
  - update logged user & delete logged user
  - CRUD on reviews (only logged users)
  - Authentication : Sign-up & login | Forgot Pass | Reset Pass | Update Pass
  - Nested routes: reviews on tour/ create review on tour.
  - CRUD on BOOKINGS (restricted to specific roles)
  - Bookings checkout session on stripe.
  - Environment driven error handling.
  - Update tours photos. (multi-file upload).
  
  
Browser/ client:
  - Log in / Sign up
  - Server-side rendering with pug.
  - Overview, single tour, account page, and reset password page.
  - Upload user photo.
  - Welcome email, reset password flow email.
