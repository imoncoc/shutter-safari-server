const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  // bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xzzyats.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("shutter-safari").collection("users");
    const classesCollection = client.db("shutter-safari").collection("classes");
    const cartCollection = client.db("shutter-safari").collection("carts");
    const paymentCollection = client
      .db("shutter-safari")
      .collection("payments");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // Warning: use verifyJWT before using verifyAdmin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res
          .status(403)
          .send({ error: true, message: "forbidden message" });
      }
      next();
    };

    const verifyInstructors = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "instructors") {
        return res
          .status(403)
          .send({ error: true, message: "forbidden message" });
      }
      next();
    };

    // Users Related API
    app.get("/users", verifyJWT, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const { name, email, photoUrl, role } = req.body;
      // console.log(name, email, photoUrl);
      const query = { email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const user = { name, email, photoUrl, role };
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Security layer: verifyJWT
    // email same
    // check admin
    app.get("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (req.decoded.email !== email) {
        res.send({ admin: false });
      }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // Security layer: verifyJWT
    // email same
    // check instructor
    app.get("/users/instructor/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      console.log(req.decoded.email);

      if (req.decoded.email !== email) {
        res.send({ instructor: false });
      }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { instructor: user?.role === "instructor" };
      res.send(result);
    });

    // Security layer: verifyJWT
    // email same
    // check instructor
    app.get("/users/user/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      console.log(req.decoded.email);

      if (req.decoded.email !== email) {
        res.send({ user: false });
      }

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { user: user?.role === "user" };
      res.send(result);
    });

    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedUser = req.body; 
      const user = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
          photoUrl: updatedUser.photoUrl,
          role: updatedUser.role,
        },
      };

      const result = await usersCollection.updateOne(filter, user, options)
      res.send(result);
    })

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Classes API
   app.get("/classes", async (req, res) => {
     const classes = await classesCollection
       .find({ status: "approved" })
       .toArray();
     const emailCounts = {};

     for (const classItem of classes) {
       const { insEmail } = classItem;

       if (emailCounts[insEmail]) {
         emailCounts[insEmail]++;
       } else {
         emailCounts[insEmail] = 1;
       }
     }
     for (const classItem of classes) {
       const { insEmail } = classItem;
       // Add the email count property to the class item
       classItem.sameEmailCount = emailCounts[insEmail];
     }
     res.send(classes);
   });

   app.post("/classes", async (req, res) => {
     const newClasses = req.body;
     console.log(newClasses);
     const result = await classesCollection.insertOne(newClasses);
     res.send(result);
   });


    app.get("/popular", async (req, res) => {
      const classes = await classesCollection
        .find({}, { ratings: 1, insEmail: 1 })
        .sort({ ratings: -1 })
        .limit(6)
        .toArray();

      const emailCounts = {};

      // Retrieve all classes to count email occurrences
      const allClasses = await classesCollection.find().toArray();

      for (const classItem of allClasses) {
        const { insEmail } = classItem;

        if (emailCounts[insEmail]) {
          emailCounts[insEmail]++;
        } else {
          emailCounts[insEmail] = 1;
        }
      }

      for (const classItem of classes) {
        const { insEmail } = classItem;

        // Add the email count property to the class item
        classItem.sameEmailCount = emailCounts[insEmail];
      }

      res.send(classes);
    });

    // Data by Instructor
    app.get("/my-classes/:email", async (req, res) => {
      const email = req.params.email;
      const data = await classesCollection.find({ insEmail: email }).toArray();
      res.send(data);
    });

    // Carts Api
    app.get("/carts", verifyJWT, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }

      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res
          .status(403)
          .send({ error: true, message: "forbidden access" });
      }

      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // app.post("/carts", async (req, res) => {
    //   const item = req.body;
    //   console.log(item);
    //   const result = await cartCollection.insertOne(item);
    //   res.send(result);
    // });

    app.post("/carts", async (req, res) => {
      const item = req.body;
      const classId = item.classId;

      // Check if classId already exists
      const existingItem = await cartCollection.findOne({ classId: classId });

      if (existingItem) {
        // classId already exists, do not post
        res.status(400).send("classId already exists");
        return;
      }

      // classId does not exist, proceed with posting
      const result = await cartCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });



    // ManageUsers Api
    app.get("/all-users", verifyJWT, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.put("/update-user-role/:id", verifyJWT, async (req, res) => {
      const userId = req.params.id;
      const newRoleId = req.body.roleId; // Assuming you provide the new role ID in the request body

      usersCollection
        .findOneAndUpdate(
          { _id: userId },
          { $set: { role: newRoleId } },
          { returnOriginal: false }
        )
        .then((updatedUser) => {
          if (updatedUser) {
            res.send(updatedUser);
          } else {
            res.status(404).send("User not found");
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("An error occurred while updating user role");
        });
    });















    // Create Payment intent
    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // payment related api
    app.post("/payments", verifyJWT, async (req, res) => {
      const payment = req.body;
      const insertResult = await paymentCollection.insertOne(payment);

      const paymentId = payment.cartItems; // Replace with the actual paymentId
      const query = { _id: new ObjectId(paymentId) };
      const deleteResult = await cartCollection.deleteOne(query);
      res.send({ insertResult, deleteResult });
      // res.send(insertResult);
    });

    // app.get("/payments", verifyJWT, async (req, res) => {
    //   const result = await paymentCollection.find().toArray();
    //   res.send(result);
    // });
    app.get("/payments", verifyJWT, async (req, res) => {
      const result = await paymentCollection
        .aggregate([
          { $sort: { date: -1 } }, // Sort by date in ascending order
        ])
        .toArray();

      res.send(result);
    });








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Shutter Safari is sitting");
});

app.listen(port, () => {
  console.log(`Shutter Safari is sitting on port ${port}`);
});
