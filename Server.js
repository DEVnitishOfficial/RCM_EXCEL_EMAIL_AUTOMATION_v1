const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// const connectToDB = async () => {
//     try {
//       const {connection} = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/LMS");
    
//       if(connection){
//         console.log(`Connected to MongodDB at : ${connection.host}`)
//       }
//     } catch (error) {
//       console.log(error)
//       process.exit(1)
//     }
  
//   };
//   connectToDB()

app.listen(PORT, () => console.log(`Server is listening at http://localhost:${PORT}`));

const emailRoutes = require('./routes/emailRoutes');
app.use('/api/emails', emailRoutes);

const sheetRoutes = require('./routes/sheetRoutes');
app.use('/api/sheets', sheetRoutes);

const autoMateRoute = require('./routes/autoMateRoute')
app.use('/api/auto',autoMateRoute)


