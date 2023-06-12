# Shutter Safari Backend

The backend of Shutter Safari photography website is responsible for handling data management, authentication, and communication with the frontend. It provides a secure and efficient backend infrastructure to support the functionality of the website.

## Features:

1. **User Authentication:** The backend includes endpoints for user registration, login, and authentication. It handles user credentials securely, manages JWT tokens, and verifies user access to protected routes.

2. **Database Management:** The backend utilizes MongoDB to store user information, photographer profiles, gallery data, and other relevant data. It ensures efficient retrieval and storage of data for seamless integration with the frontend.

3. **API Endpoints:** The backend provides a range of API endpoints to facilitate data retrieval and modification. These endpoints include:

   - User management: Register, login, update user profile, and retrieve user information.
   - Photographer management: Create, update, and retrieve photographer profiles.
   - Gallery management: Create, update, and retrieve photo galleries.
   - Class management: Add, update, and retrieve photography classes.
   - Payment handling: Process and verify payments for enrolled classes.

4. **Data Validation and Error Handling:** The backend implements robust validation and error handling mechanisms to ensure data integrity and enhance user experience. It validates incoming data, handles errors gracefully, and provides informative error messages when necessary.

5. **Authorization and Role-based Access:** The backend implements role-based access control, allowing different levels of access for users, photographers, and administrators. It ensures that only authorized users can perform certain actions, such as adding classes or managing galleries.

6. **Security Measures:** The backend incorporates security measures to protect user data and prevent unauthorized access. It utilizes encryption techniques, secure HTTP protocols, and implements best practices for data handling and storage.

7. **Integration with Frontend:** The backend seamlessly integrates with the frontend of Shutter Safari, providing a RESTful API for data exchange. It communicates with the frontend through HTTP requests and ensures efficient and reliable data transmission.

## Technology Used:

- Node.js for backend development
- Express.js as the web application framework
- MongoDB for data storage
- Mongoose as the object modeling library for MongoDB
- JSON Web Tokens (JWT) for authentication and authorization
- bcrypt.js for password hashing and encryption
- Express Validator for data validation
- Helmet for enhancing security headers
- Multer for handling file uploads
- Nodemailer for sending emails (if required for email verification or notifications)

## Deployment:

The backend of Shutter Safari can be deployed on various platforms:

- Vercel

Please refer to the documentation of your chosen deployment platform for detailed instructions on how to deploy a Node.js application.

## Environment Variables:

The following environment variables need to be configured:

- `MONGO_URI`: The connection string for the MongoDB database.
- `JWT_SECRET`: Secret key for JWT token generation and verification.
- (Optional) `EMAIL_USERNAME` and `EMAIL_PASSWORD`: SMTP email credentials for sending emails.

Ensure that these environment variables are set before running the backend server.

## Getting Started:

To set up and run the backend locally, follow these steps:

1. Clone the repository: `git clone <repository-url>`.
2. Install dependencies: `npm install`.
3. Set up the required environment variables as mentioned above.
4. Start the backend server: `npm start`.

The backend server should now be running locally at the specified port, ready to handle requests from the frontend.

## API Documentation:

For detailed information on the available API endpoints and their usage, refer to the API documentation provided
