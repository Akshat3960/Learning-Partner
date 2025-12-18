const sanitizeInput = (req, res, next) => {
  if (req.body.question) {
    req.body.question = req.body.question
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
      .substring(0, 1000);
  }
  
  if (req.body.concept) {
    req.body.concept = req.body.concept
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
      .substring(0, 500);
  }

  if (req.body.name) {
    req.body.name = req.body.name
      .replace(/<[^>]+>/g, '')
      .trim()
      .substring(0, 100);
  }

  if (req.body.email) {
    req.body.email = req.body.email
      .trim()
      .toLowerCase()
      .substring(0, 100);
  }
  
  next();
};

module.exports = sanitizeInput;