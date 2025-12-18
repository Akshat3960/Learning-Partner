// Simple file storage configuration
// GridFS is no longer used - we use local filesystem instead

const initGridFS = () => {
  console.log('✅ File storage initialized (using local filesystem)');
};

const getGFS = () => {
  return null;
};

module.exports = { initGridFS, getGFS };