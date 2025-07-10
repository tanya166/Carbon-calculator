const FormSubmission = require('../models/FormSubmission');
const db = require('../db/connection'); // use this for raw queries if needed

exports.saveFormSubmission = async (req, res) => {
  try {
    const { formType, submissionData, carbonFootprint } = req.body;
    const newSubmission = new FormSubmission({
      userId: req.user.id, 
      formType,
      submissionData,
      carbonFootprint
    });

    await newSubmission.save();
    res.status(201).json({
      success: true,
      data: newSubmission
    });
  } catch (error) {
    console.error('Error saving form submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving form submission',
      error: error.message
    });
  }
};

exports.getUserSubmissions = async (req, res) => {
  try {
    const submissions = await FormSubmission.findByUserId(req.user.id);

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    await new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM FormSubmissions WHERE id = ? AND userId = ?',
        [id, req.user.id],
        (err, result) => {
          if (err) return reject(err);
          if (result.affectedRows === 0) {
            return reject(new Error('Submission not found or not authorized'));
          }
          resolve();
        }
      );
    });

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting submission',
      error: error.message
    });
  }
};
