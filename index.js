const express = require('express');
require('./services/passport');
mongoose.connect(keys.mongoURI);

const app = express();

require('./routes/authRoutes')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);

// mongodb+srv://viveKsLoc:<password>@cluster0-a42ij.mongodb.net/test?retryWrites=true&w=majority