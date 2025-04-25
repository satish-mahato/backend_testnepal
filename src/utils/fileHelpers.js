const fs = require('fs').promises;
const path = require('path');

const deleteFiles = async (fileUrls) => {
  if (!fileUrls || fileUrls.length === 0) {
    console.log('No files to delete');
    return;
  }

  const deletePromises = fileUrls.map(async (fileUrl) => {
    try {
      const filename = fileUrl.split('/').pop();
     
      const fullPath = path.resolve(__dirname, '../files', filename);
      
      console.log(`Attempting to delete file at path: ${fullPath}`);
      
      try {
        await fs.access(fullPath);
        console.log('File exists, proceeding with deletion');
      } catch (accessErr) {
        console.log('File does not exist at path:', fullPath);
        if (accessErr.code !== 'ENOENT') throw accessErr;
        return;
      }

      await fs.unlink(fullPath);
      console.log(`Successfully deleted file: ${filename}`);

    } catch (error) {
      console.error(`Error processing file ${fileUrl}:`, {
        errorCode: error.code,
        errorPath: error.path,
        fullError: error
      });
      throw error;
    }
  });

  try {
    await Promise.all(deletePromises);
    console.log('All files deleted successfully');
  } catch (error) {
    console.error('Failed to delete some files:', error);
    throw error;
  }
};

module.exports = { deleteFiles };